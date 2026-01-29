import * as dotenv from "dotenv";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

async function run() {
    const filePath = path.join(process.cwd(), "data", "laws.txt");

    if (!fs.existsSync(filePath)) {
        console.error("Error: data/laws.txt not found. Please create it and add legal text.");
        process.exit(1);
    }

    const text = fs.readFileSync(filePath, "utf8");

    console.log("Initializing AI models and vector store...");
    const embeddings = new GoogleGenerativeAIEmbeddings({
        modelName: "embedding-001",
        apiKey: process.env.GOOGLE_API_KEY,
    });

    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
    });
    const index = pc.Index(process.env.PINECONE_INDEX!);

    console.log("Splitting text into chunks...");
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
    });

    const docs = await splitter.createDocuments([text], [
        {
            law_name: "Pakistan Penal Code",
            section_number: "Multiple",
            topic: "General"
        }
    ]);

    console.log(`Uploading ${docs.length} chunks to Pinecone...`);

    await PineconeStore.fromDocuments(docs, embeddings, {
        pineconeIndex: index,
        textKey: "text",
    });

    console.log("✅ Ingestion successfully completed!");
}

run().catch((err) => {
    console.error("Ingestion failed:", err);
    process.exit(1);
});
