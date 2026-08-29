import Groq from "groq-sdk";
import { Document } from "@langchain/core/documents";
import type { ChatResult, ChatTurn, LegalSource } from "@/lib/chat";

const MAX_QUESTION_LENGTH = 2_000;
const MAX_HISTORY_TURNS = 6;
const MAX_HISTORY_CHARS = 3_000;

function asErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
}

function truncateHistory(history: ChatTurn[]): string {
    const turns = history.slice(-MAX_HISTORY_TURNS);
    let block = "";
    for (const turn of turns) {
        const line = `${turn.role === "user" ? "User" : "AskQanoon"}: ${turn.content}\n`;
        if ((block + line).length > MAX_HISTORY_CHARS) break;
        block += line;
    }
    return block.trim();
}

/** Check if we have enough keys to do RAG retrieval */
function hasValidKeys() {
    const googleKey = process.env.GOOGLE_API_KEY;
    const pineconeKey = process.env.PINECONE_API_KEY;
    const pineconeIndex = process.env.PINECONE_INDEX;
    if (!googleKey || googleKey === "your_google_api_key_here" || googleKey.length < 10) return false;
    if (!pineconeKey || pineconeKey === "your_pinecone_api_key_here" || pineconeKey.length < 10) return false;
    if (!pineconeIndex) return false;
    return true;
}

export class RAGService {
    private groq: Groq;

    constructor() {
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
    }

    private get chatModel() {
        // Available on this account: openai/gpt-oss-120b, openai/gpt-oss-20b,
        // qwen/qwen3.8-27b, qwen/qwen3.6-27b, groq/compound, groq/compound-mini
        return process.env.GROQ_MODEL || "openai/gpt-oss-120b";
    }

    private get hydeModel() {
        // Use a faster/cheaper model for HyDE document generation
        return process.env.GROQ_HYDE_MODEL || "openai/gpt-oss-20b";
    }

    /**
     * Lazily get the vector store only when RAG keys are valid.
     * This prevents crashes on startup when keys are missing.
     */
    private async getVectorStore() {
        // Dynamic imports so missing keys don't crash module loading
        const { GoogleGenerativeAIEmbeddings } = await import("@langchain/google-genai");
        const { PineconeStore } = await import("@langchain/pinecone");
        const { Pinecone } = await import("@pinecone-database/pinecone");

        const embeddings = new GoogleGenerativeAIEmbeddings({
            modelName: "gemini-embedding-001",
            apiKey: process.env.GOOGLE_API_KEY,
        });
        const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
        const index = pc.Index(process.env.PINECONE_INDEX!);

        return await PineconeStore.fromExistingIndex(embeddings, { pineconeIndex: index });
    }

    /**
     * HyDE — Hypothetical Document Embeddings
     * Generate a short "ideal answer" and embed THAT for retrieval.
     * This dramatically improves recall for vague or jargon-light questions.
     */
    private async generateHypotheticalDocument(question: string): Promise<string> {
        try {
            const completion = await this.groq.chat.completions.create({
                model: this.hydeModel,
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a Pakistani law expert. Write a short, precise paragraph (3-5 sentences) that would appear in an official Pakistani law document and directly answers the question. Use formal legal language, cite plausible section numbers. This is for retrieval purposes only — accuracy is secondary to relevance.",
                    },
                    { role: "user", content: question },
                ],
                max_tokens: 600,
                temperature: 0.3,
            });
            return completion.choices[0]?.message?.content || question;
        } catch {
            // HyDE failure is non-fatal — fall back to raw question
            return question;
        }
    }

    async query(question: string, history: ChatTurn[] = [], useRomanUrdu = false): Promise<ChatResult> {
        try {
            const safeQuestion = question.trim().slice(0, MAX_QUESTION_LENGTH);

            // --- STEP 1: RAG retrieval (only if keys are configured) ---
            let docs: Document[] = [];
            let retrievalError = false;
            const ragEnabled = hasValidKeys();

            if (ragEnabled) {
                try {
                    const vectorStore = await this.getVectorStore();

                    const recentUserMessages = history
                        .filter((m) => m.role === "user")
                        .slice(-2)
                        .map((m) => m.content)
                        .join(" ");

                    const hydeDoc = await this.generateHypotheticalDocument(
                        recentUserMessages ? `${recentUserMessages} ${safeQuestion}` : safeQuestion
                    );

                    const retriever = vectorStore.asRetriever({ k: 8 });
                    const [hydeDocs, rawDocs] = await Promise.all([
                        retriever.invoke(hydeDoc),
                        retriever.invoke(safeQuestion),
                    ]);

                    // Merge and deduplicate by content prefix
                    const seen = new Set<string>();
                    for (const doc of [...hydeDocs, ...rawDocs]) {
                        const key = doc.pageContent.slice(0, 100);
                        if (!seen.has(key)) {
                            seen.add(key);
                            docs.push(doc);
                            if (docs.length >= 8) break;
                        }
                    }
                } catch (pineconeError) {
                    console.error("Pinecone/Embedding Retrieval Error:", pineconeError);
                    retrievalError = true;
                }
            }

            // --- STEP 2: Build structured context ---
            const sources: LegalSource[] = docs.map((doc, index) => ({
                id: index + 1,
                law: String(doc.metadata.law_name || "Pakistani Law"),
                section: String(doc.metadata.section_number || "N/A"),
                excerpt: doc.pageContent.replace(/\s+/g, " ").slice(0, 280),
            }));

            let context: string;
            if (!ragEnabled) {
                context = "RAG_NOT_CONFIGURED";
            } else if (docs.length === 0) {
                context = "NO_RETRIEVED_CONTEXT";
            } else {
                context = docs
                    .map(
                        (doc, i) =>
                            `[S${i + 1}] ${sources[i].law}${sources[i].section !== "N/A" ? `, Section ${sources[i].section}` : ""}:\n${doc.pageContent.trim()}`
                    )
                    .join("\n\n---\n\n");
            }

            // --- STEP 3: Build conversation history block ---
            const historyBlock = history.length > 0 ? truncateHistory(history) : "";

            const languageInstruction = useRomanUrdu
                ? "RESPOND ENTIRELY IN ROMAN URDU (Urdu written with Latin letters). NEVER use Urdu/Arabic script. Keep law names and section references in English exactly as cited. Example style: 'Aap FIR darj karwa sakte hain Section 154 CrPC ke tehat.'"
                : "Respond in clear, simple English suitable for a non-lawyer Pakistani citizen.";

            // --- STEP 4: Advanced RAG prompt with chain-of-thought ---
            const systemPrompt = `You are "AskQanoon", a trusted legal information assistant for Pakistani law. Your users are ordinary citizens — not lawyers — who need clear, honest, source-grounded explanations.

CRITICAL RULES (follow all; break none):
1. CONTEXT IS KING: Base EVERY legal claim on the retrieved context below. Do not use memorized knowledge, invent section numbers, or guess at law.
2. NO CONTEXT = SAY SO: If context is "NO_RETRIEVED_CONTEXT" or the retrieved passages do not answer the question, clearly state: "I cannot verify this from the current legal database. Please consult a qualified Pakistani lawyer."
3. RAG NOT CONFIGURED: If context is "RAG_NOT_CONFIGURED", explain that you can provide general guidance based on your training, but citations are not available in this setup. Still be helpful but clearly caveat every statement as uncited.
4. CITATION FORMAT: End every sentence or bullet that states a legal fact with its source tag — e.g., [S1] or [S1][S3]. Never cite a source that wasn't used.
5. NO LEGAL ADVICE: Provide information, never verdicts, guarantees, or instructions to circumvent law enforcement.
6. HISTORY IS CONTEXT ONLY: Use conversation history to resolve pronouns, but never treat prior assistant messages as new legal authority.
7. AMBIGUITY: If the question is unclear, ask one specific follow-up question before answering.

OUTPUT FORMAT:
- Start with a 1-2 sentence plain-language summary of the answer.
- Use **numbered lists** for procedures/steps.
- Use **bold** for key legal terms, law names, and organizations.
- Use bullet sub-points for details or exceptions.
- Add a "⚠️ Note:" section for anything you could not verify from the provided context.
- ${languageInstruction}`;

            const userMessage = `${historyBlock ? `CONVERSATION HISTORY:\n${historyBlock}\n\n` : ""}RETRIEVED LEGAL CONTEXT FROM PAKISTANI LAW DATABASE:
${context}

USER QUESTION: ${safeQuestion}

Think step-by-step: Which sources (if any) answer this question? What exactly do they say? Now write a clear, cited answer:`;

            // --- STEP 5: Groq LLM completion ---
            const completion = await this.groq.chat.completions.create({
                model: this.chatModel,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage },
                ],
                max_tokens: 4096,  // reasoning model needs extra tokens for thinking + response
                temperature: 0.1,
                top_p: 0.9,
            });

            const answer = completion.choices[0]?.message?.content || "Unable to generate a response. Please try again.";

            // --- STEP 6: Determine if sources should be shown ---
            const noInfoPhrases = [
                "cannot verify this from the current legal database",
                "I cannot verify",
                "not found in the provided context",
                "no information available",
                "consult a qualified",
                "meray paas is baray mein",
            ];

            const hasNoInfo = noInfoPhrases.some((phrase) =>
                answer.toLowerCase().includes(phrase.toLowerCase())
            );

            return { answer, sources: hasNoInfo || retrievalError || !ragEnabled ? [] : sources };
        } catch (error: unknown) {
            console.error("RAG Query Error:", error);

            const message = asErrorMessage(error);
            const isQuotaError = message.includes("quota") || message.includes("429") || message.includes("rate_limit");
            const isApiKeyError =
                message.includes("API_KEY_INVALID") ||
                message.includes("API key not valid") ||
                message.includes("invalid_api_key") ||
                message.includes("Authentication") ||
                message.includes("Unauthorized");

            let errorMessage = "⚠️ **System Error**: An unexpected error occurred. Please try again in a moment.";

            if (isApiKeyError) {
                errorMessage = "⚠️ **Configuration Error**: The AI service key is invalid. Please check your `GROQ_API_KEY` in the `.env` file.";
            } else if (isQuotaError) {
                errorMessage = "⚠️ **Service Limit Reached**: The AI service has reached its usage limit. Please try again in a few seconds — Groq resets quickly.";
            }

            return { answer: errorMessage, sources: [] };
        }
    }

    async compareRegulations(topic: string, jurisdictions: string[]) {
        try {
            let docs: Document[] = [];
            if (hasValidKeys()) {
                try {
                    const vectorStore = await this.getVectorStore();
                    const retriever = vectorStore.asRetriever({ k: 8 });
                    docs = await retriever.invoke(topic);
                } catch (e) {
                    console.error(`Error fetching documents:`, e);
                    docs = [];
                }
            }

            const context =
                docs.length > 0
                    ? docs
                          .map(
                              (d, i) =>
                                  `[Source ${i + 1}] ${d.metadata.law_name || "Law"} (Jurisdiction: ${d.metadata.jurisdiction || "Pakistan"}):\n${d.pageContent}`
                          )
                          .join("\n\n---\n\n")
                    : "No relevant legal documents found in the database.";

            const systemPrompt = `You are a senior regulatory compliance attorney specializing in cross-border legal analysis for Pakistan and international jurisdictions. Output ONLY valid JSON — no markdown, no code blocks, no text outside the JSON object.`;

            const userMessage = `MULTI-JURISDICTION COMPLIANCE ANALYSIS
Topic: "${topic}"
Jurisdictions to compare: ${jurisdictions.join(", ")}

RETRIEVED LEGAL CONTEXT:
${context}

Output a single valid JSON object with this exact schema:
{
    "analysis": "3-4 sentence executive summary",
    "conflictLevel": "High" | "Medium" | "Low",
    "strictestJurisdiction": "Name",
    "complianceRecommendation": "1-2 sentence strategic recommendation",
    "matrix": [{ "jurisdiction": "Name", "requirement": "summary", "standard": "threshold/timeline/format", "enforcementBody": "who", "status": "Compliant" | "Stricter" | "Lax" | "Unknown" }],
    "conflicts": ["description"],
    "gaps": ["description"]
}`;

            const completion = await this.groq.chat.completions.create({
                model: this.chatModel,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage },
                ],
                max_tokens: 2048,
                temperature: 0,
                response_format: { type: "json_object" },
            });

            const result = completion.choices[0]?.message?.content || "{}";
            return JSON.parse(result);
        } catch (error) {
            console.error("Comparison Error:", error);
            return {
                analysis: "Unable to generate real-time analysis due to a service error. Please try again.",
                conflictLevel: "Medium",
                matrix: jurisdictions.map((j) => ({
                    jurisdiction: j,
                    requirement: "Data not available — please retry.",
                    status: "Unknown",
                })),
                conflicts: [],
                gaps: [],
            };
        }
    }

    async ingestDocs(docs: { content: string; metadata: Record<string, unknown> }[]) {
        if (!hasValidKeys()) {
            throw new Error("Google API key or Pinecone keys are not configured. Cannot ingest documents.");
        }

        const { RecursiveCharacterTextSplitter: Splitter } = await import("@langchain/textsplitters");
        const splitter = new Splitter({ chunkSize: 800, chunkOverlap: 100 });
        const langchainDocs = await splitter.createDocuments(
            docs.map((d) => d.content),
            docs.map((d) => d.metadata)
        );

        const vectorStore = await this.getVectorStore();
        console.log(`Ingesting ${langchainDocs.length} chunks into Pinecone...`);
        await vectorStore.addDocuments(langchainDocs);
        console.log(`✅ Successfully ingested ${langchainDocs.length} document chunks.`);
    }
}

export const ragService = new RAGService();
