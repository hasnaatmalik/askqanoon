import Groq from "groq-sdk";
import { Document } from "@langchain/core/documents";
import type { ChatResult, ChatTurn, LegalSource } from "@/lib/chat";
import { finalizeAnswer } from "@/lib/citations";
import { REWRITE_SYSTEM_PROMPT, buildSystemPrompt, buildUserMessage, formatSources } from "@/lib/prompts";

const MAX_QUESTION_LENGTH = 2_000;
const MAX_HISTORY_TURNS = 6;
const MAX_HISTORY_CHARS = 3_000;
const RETRIEVAL_K = 6;
const MAX_CONTEXT_DOCS = 6;
const RRF_K = 60;

interface RetrievalPlan {
    standaloneQuestion: string;
    hypotheticalPassage: string;
}

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
    private client?: Groq;

    /** Created on first use so builds and tests don't need GROQ_API_KEY. */
    private get groq(): Groq {
        return (this.client ??= new Groq({ apiKey: process.env.GROQ_API_KEY }));
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

    private get isReasoningModel() {
        return this.chatModel.startsWith("openai/gpt-oss");
    }

    /**
     * Query rewriting + HyDE in a single cheap call.
     * Produces a standalone English question (so follow-ups like "what about bail?" work)
     * and a hypothetical statute passage to embed. Any failure falls back to the raw question.
     */
    private async prepareRetrieval(question: string, history: ChatTurn[]): Promise<RetrievalPlan> {
        const fallback: RetrievalPlan = { standaloneQuestion: question, hypotheticalPassage: question };
        try {
            const recent = truncateHistory(history.slice(-4));
            const completion = await this.groq.chat.completions.create({
                model: this.hydeModel,
                messages: [
                    { role: "system", content: REWRITE_SYSTEM_PROMPT },
                    {
                        role: "user",
                        content: `${recent ? `<history>\n${recent}\n</history>\n\n` : ""}<question>${question}</question>`,
                    },
                ],
                max_tokens: 700,
                temperature: 0.2,
                response_format: { type: "json_object" },
                ...(this.hydeModel.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" as const } : {}),
            });
            const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
            return {
                standaloneQuestion:
                    typeof parsed.standalone_question === "string" && parsed.standalone_question.trim()
                        ? parsed.standalone_question.trim()
                        : question,
                hypotheticalPassage:
                    typeof parsed.hypothetical_passage === "string" && parsed.hypothetical_passage.trim()
                        ? parsed.hypothetical_passage.trim()
                        : question,
            };
        } catch {
            return fallback;
        }
    }

    async query(question: string, history: ChatTurn[] = [], useRomanUrdu = false): Promise<ChatResult> {
        try {
            const safeQuestion = question.trim().slice(0, MAX_QUESTION_LENGTH);

            // --- STEP 1: Rewrite + retrieve (only if keys are configured) ---
            let docs: Document[] = [];
            let retrievalError = false;
            let plan: RetrievalPlan = { standaloneQuestion: safeQuestion, hypotheticalPassage: safeQuestion };
            const ragEnabled = hasValidKeys();

            if (ragEnabled) {
                try {
                    const vectorStore = await this.getVectorStore();
                    plan = await this.prepareRetrieval(safeQuestion, history);

                    // Three probes: the HyDE passage, the standalone question, and the raw words.
                    const retriever = vectorStore.asRetriever({ k: RETRIEVAL_K });
                    const probes = Array.from(
                        new Set([plan.hypotheticalPassage, plan.standaloneQuestion, safeQuestion])
                    );
                    const results = await Promise.all(probes.map((p) => retriever.invoke(p)));

                    // Reciprocal-rank fusion: chunks found by several probes rise to the top.
                    const scores = new Map<string, { doc: Document; score: number }>();
                    for (const list of results) {
                        list.forEach((doc, rank) => {
                            const key = doc.pageContent.replace(/\s+/g, " ").slice(0, 120);
                            const entry = scores.get(key) ?? { doc, score: 0 };
                            entry.score += 1 / (RRF_K + rank + 1);
                            scores.set(key, entry);
                        });
                    }
                    docs = [...scores.values()]
                        .sort((a, b) => b.score - a.score)
                        .slice(0, MAX_CONTEXT_DOCS)
                        .map((e) => e.doc);
                } catch (pineconeError) {
                    console.error("Pinecone/Embedding Retrieval Error:", pineconeError);
                    retrievalError = true;
                }
            }

            // --- STEP 2: Build tagged context ---
            const retrieved: LegalSource[] = docs.map((doc, index) => ({
                id: index + 1,
                law: String(doc.metadata.law_name || "Pakistani Law"),
                section: String(doc.metadata.section_number || "N/A"),
                excerpt: doc.pageContent.replace(/\s+/g, " ").trim().slice(0, 280),
            }));
            const sourcesBlock = formatSources(retrieved, docs.map((d) => d.pageContent));
            const historyBlock = history.length > 0 ? truncateHistory(history) : "";

            // --- STEP 3: Generate ---
            const completion = await this.groq.chat.completions.create({
                model: this.chatModel,
                messages: [
                    { role: "system", content: buildSystemPrompt(useRomanUrdu) },
                    {
                        role: "user",
                        content: buildUserMessage({
                            question: safeQuestion,
                            standaloneQuestion: plan.standaloneQuestion,
                            history: historyBlock,
                            sourcesBlock,
                            ragConfigured: ragEnabled && !retrievalError,
                        }),
                    },
                ],
                max_tokens: 4096, // reasoning models spend part of this on thinking
                temperature: 0.1,
                top_p: 0.9,
                ...(this.isReasoningModel ? { reasoning_effort: "low" as const } : {}),
            });

            const raw = completion.choices[0]?.message?.content || "";
            if (!raw.trim()) {
                return {
                    answer: "I couldn't generate an answer just now. Please try again.",
                    sources: [],
                    followUps: [],
                    grounded: false,
                };
            }

            // --- STEP 4: Verify citations in code, show only the sources actually used ---
            const final = finalizeAnswer(raw, retrieved);
            if (final.invalidCitations > 0) {
                console.warn(`Model produced ${final.invalidCitations} citation tag(s) with no matching source.`);
            }

            return {
                answer: final.answer,
                sources: final.sources,
                followUps: final.followUps,
                grounded: final.sources.length > 0,
            };
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

            let errorMessage = "Something went wrong on our side. Please try again in a moment.";
            if (isApiKeyError) {
                errorMessage = "The AI service isn't configured correctly right now. Please try again later.";
            } else if (isQuotaError) {
                errorMessage = "We're getting a lot of questions right now. Please try again in a few seconds.";
            }

            return { answer: errorMessage, sources: [], followUps: [], grounded: false };
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
