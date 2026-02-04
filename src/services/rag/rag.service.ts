import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { Document } from "@langchain/core/documents";

export class RAGService {
    private model: ChatGoogleGenerativeAI;
    private embeddings: GoogleGenerativeAIEmbeddings;
    private pc: Pinecone;

    constructor() {
        this.model = new ChatGoogleGenerativeAI({
            model: "gemini-3-flash-preview",
            maxOutputTokens: 2048,
            apiKey: process.env.GOOGLE_API_KEY,
            temperature: 0,
        });

        this.embeddings = new GoogleGenerativeAIEmbeddings({
            modelName: "text-embedding-004",
            apiKey: process.env.GOOGLE_API_KEY,
        });

        this.pc = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
        });
    }

    private async getVectorStore() {
        const index = this.pc.Index(process.env.PINECONE_INDEX!);
        return await PineconeStore.fromExistingIndex(this.embeddings, {
            pineconeIndex: index,
        });
    }

    async query(question: string, history: any[] = [], useRomanUrdu: boolean = false) {
        try {
            const vectorStore = await this.getVectorStore();
            const retriever = vectorStore.asRetriever({ k: 5 });

            // Get documents first to avoid double invocation and handle errors
            let docs: Document[] = [];
            let retrievalError = false;
            try {
                // Set a manual timeout or handle it
                docs = await retriever.invoke(question);
            } catch (pineconeError) {
                console.error("Pinecone Retrieval Error:", pineconeError);
                retrievalError = true;
            }

            const context = docs.length > 0
                ? docs.map((d, i) => `[Source ${i + 1}]: ${d.metadata.law_name || "Pakistani Law"}, Section ${d.metadata.section_number || "N/A"}\n${d.pageContent}`).join("\n\n")
                : "No relevant legal context found.";

            const languageInstruction = useRomanUrdu
                ? "Respond in Roman Urdu (Urdu written in Latin script)."
                : "Respond in simple English.";

            const prompt = PromptTemplate.fromTemplate(`
        You are "AskQanoon", a professional legal information assistant for Pakistani law.
        Your goal is to explain laws in simple, non-legal language to common citizens.

        STRICT RULES:
        1. Use ONLY the provided context to answer. If the context is empty or insufficient, follow Rule 2.
        2. If you cannot find the answer in the context, say: "I don't have enough information in my legal database to answer this specific query. Please consult a qualified lawyer."
        3. Do NOT give legal advice, verdicts, or guarantees. 
        4. Always maintain a professional, helpful, and neutral tone.
        5. CITATIONS: ALWAYS cite the specific Law Name and Section Number in your answer text if available in the context (e.g. 'According to Section 302 of PPC...').
        6. PROCEDURES: If the user asks for a procedure (e.g. how to file FIR, how to divorce), YOU MUST provide the answer in a clear, STEP-BY-STEP format (1, 2, 3...).
        7. Output language: {language_instruction}

        FORMATTING GUIDELINES:
        - Use a clear introductory sentence.
        - Use **Numbered Lists** for steps or main points.
        - Use **Bold** for emphasis on key terms, organizations, or laws.
        - Use bullet points for sub-details.
        - Ensure the response is easy to read and follows a logical flow.

        SOURCE CITATION:
        - At the end of each major point or the entire response, mention the Law and Section you are referring to based on the provided sources.

        CONTEXT FROM PAKISTANI LAWS:
        {context}

        USER QUESTION: {question}
        
        ANSWER:
      `);

            const chain = RunnableSequence.from([
                prompt,
                this.model,
                new StringOutputParser(),
            ]);

            const answer = await chain.invoke({
                question,
                context,
                language_instruction: languageInstruction
            });

            const noInfoPhrases = [
                "I don't have enough information",
                "I apologize, but I don't have information",
                "meray paas is baray mein malomat nahi",
                "not found in the provided context"
            ];

            const hasNoInfo = noInfoPhrases.some(phrase =>
                answer.toLowerCase().includes(phrase.toLowerCase())
            );

            // Structure sources for the UI
            const sources = (hasNoInfo || retrievalError) ? [] : docs.map((doc: Document) => ({
                law: doc.metadata.law_name || "Pakistani Law",
                section: doc.metadata.section_number || "N/A",
                content: doc.pageContent.substring(0, 200) + "..."
            }));

            return { answer, sources };
        } catch (error) {
            console.error("RAG Query Error:", error);
            return {
                answer: "I'm sorry, I encountered a technical error while accessing my legal database. Please try again in a moment.",
                sources: []
            };
        }
    }
    async compareRegulations(topic: string, jurisdictions: string[]) {
        try {
            const vectorStore = await this.getVectorStore();

            // 1. Retrieve documents for each jurisdiction specifically
            // We do this to ensure we get relevant laws for EACH requested jurisdiction
            // rather than just the top K global matches which might be all from one jurisdiction.
            const allDocs: Record<string, Document[]> = {};

            for (const jurisdiction of jurisdictions) {
                const retriever = vectorStore.asRetriever({
                    k: 3,
                    filter: { jurisdiction: jurisdiction }
                });

                try {
                    const docs = await retriever.invoke(topic);
                    allDocs[jurisdiction] = docs;
                } catch (e) {
                    console.error(`Error fetching for ${jurisdiction}:`, e);
                    allDocs[jurisdiction] = [];
                }
            }

            // 2. Construct context
            let contextParts = [];
            for (const [jur, docs] of Object.entries(allDocs)) {
                const jurDocs = docs.map(d => `- [${d.metadata.law_name || "Law"}]: ${d.pageContent.substring(0, 300)}...`).join("\n");
                contextParts.push(`JURISDICTION: ${jur}\n${jurDocs || "No specific laws found."}`);
            }

            const context = contextParts.join("\n\n");

            // 3. Prompt for matrix generation
            const prompt = PromptTemplate.fromTemplate(`
                You are a Legal Compliance Expert.
                Task: Compare regulations across different jurisdictions for the topic: "{topic}".
                
                CONTEXT:
                {context}
                
                INSTRUCTIONS:
                1. Identify key compliance requirements for each jurisdiction.
                2. Detect CONFLICTS or DIVERGENCES (e.g., Jurisdiction A requires 5 years retention, B requires 2).
                3. Rate the "Conflict Level" (High/Medium/Low).
                4. Output valid JSON in the following format:
                {{
                    "analysis": "Brief summary of the comparison",
                    "conflictLevel": "High" | "Medium" | "Low",
                    "matrix": [
                        {{ "jurisdiction": "Name", "requirement": "Brief requirement summary", "status": "Compliant" | "Stricter" | "Lax" }}
                    ],
                    "conflicts": [ "Conflict 1 description", "Conflict 2 description" ]
                }}
            `);

            const chain = RunnableSequence.from([
                prompt,
                this.model,
                new StringOutputParser(),
            ]);

            const result = await chain.invoke({
                topic,
                context
            });

            // Clean markdown code blocks if present
            const cleanJson = result.replace(/```json/g, "").replace(/```/g, "").trim();

            return JSON.parse(cleanJson);

        } catch (error) {
            console.error("Comparison Error:", error);
            throw new Error("Failed to compare regulations");
        }
    }

    async ingestDocs(docs: { content: string; metadata: any }[]) {
        const vectorStore = await this.getVectorStore();
        console.log(`Ingesting ${docs.length} documents...`);
    }
}

export const ragService = new RAGService();
