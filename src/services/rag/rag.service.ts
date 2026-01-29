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
            modelName: "gemini-1.5-pro",
            maxOutputTokens: 2048,
            apiKey: process.env.GOOGLE_API_KEY,
            temperature: 0,
        });

        this.embeddings = new GoogleGenerativeAIEmbeddings({
            modelName: "embedding-001",
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
            const retriever = vectorStore.asRetriever({ k: 4 });

            const prompt = PromptTemplate.fromTemplate(`
        You are "AskQanoon", a professional legal information assistant for Pakistani law.
        Your goal is to explain laws in simple, non-legal language to common citizens.

        RULES:
        1. Use ONLY the provided context to answer.
        2. If the answer is not in the context, say "I don't have enough information in my legal database to answer this specific query. Please consult a qualified lawyer."
        3. Do NOT give legal advice, verdicts, or guarantees. 
        4. Always maintain a neutral, informative tone.
        5. Output language: {language_instruction}

        CONTEXT FROM PAKISTANI LAWS:
        {context}

        USER QUESTION: {question}
        
        ANSWER:
      `);

            const languageInstruction = useRomanUrdu
                ? "Respond in Roman Urdu (Urdu written in Latin script)."
                : "Respond in simple English.";

            const chain = RunnableSequence.from([
                {
                    context: async (input: { question: string }) => {
                        const docs = await retriever.invoke(input.question);
                        return docs.map(d => d.pageContent).join("\n\n");
                    },
                    question: (input: any) => input.question,
                    language_instruction: (input: any) => input.language_instruction,
                },
                prompt,
                this.model,
                new StringOutputParser(),
            ]);

            // Get documents for citations
            const docs = await retriever.invoke(question);
            const answer = await chain.invoke({
                question,
                language_instruction: languageInstruction
            });

            const sources = docs.map((doc: Document) => ({
                law: doc.metadata.law_name || "Unknown Law",
                section: doc.metadata.section_number || "N/A",
                content: doc.pageContent.substring(0, 150) + "..."
            }));

            return { answer, sources };
        } catch (error) {
            console.error("RAG Query Error:", error);
            throw error;
        }
    }

    async ingestDocs(docs: { content: string; metadata: any }[]) {
        const vectorStore = await this.getVectorStore();
        console.log(`Ingesting ${docs.length} documents...`);
    }
}

export const ragService = new RAGService();
