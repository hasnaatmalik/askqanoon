import * as dotenv from "dotenv";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

async function run() {
    const dataDir = path.join(process.cwd(), "data");
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith(".txt"));

    if (files.length === 0) {
        console.error("Error: No .txt files found in data/ directory.");
        process.exit(1);
    }

    console.log("Initializing AI models and vector store...");
    const embeddings = new GoogleGenerativeAIEmbeddings({
        modelName: "gemini-embedding-001",
        apiKey: process.env.GOOGLE_API_KEY,
    });

    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
    });
    const index = pc.Index(process.env.PINECONE_INDEX!);

    console.log("Cleaning up previous data in the index...");
    try {
        await index.deleteAll();
    } catch (e) {
        console.log("Note: Could not clear index (it might already be empty).");
    }

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 800,
        chunkOverlap: 100,
    });

    const allDocs = [];

    for (const file of files) {
        console.log(`Reading file: ${file}`);
        const fullText = fs.readFileSync(path.join(dataDir, file), "utf8");
        const rawSections = fullText.split(/\n---\n/);

        for (const rawSection of rawSections) {
            const lines = rawSection.trim().split("\n");
            if (lines.length === 0 || !lines[0].trim()) continue;

            // Header parsing
            let lawName = lines[0].trim();
            let jurisdiction = "Pakistan"; // Default
            let contentStartIndex = 1;

            // Check if second line is Jurisdiction
            if (lines.length > 1 && lines[1].toLowerCase().startsWith("jurisdiction:")) {
                jurisdiction = lines[1].split(":")[1].trim();
                contentStartIndex = 2;
            }

            const content = lines.slice(contentStartIndex).join("\n").trim();

            console.log(`Processing law: ${lawName} (${jurisdiction})`);

            const docs = await splitter.createDocuments([content], [
                {
                    law_name: lawName,
                    section_number: "Multiple",
                    topic: "General",
                    jurisdiction: jurisdiction
                }
            ]);

            allDocs.push(...docs);
        }
    }

    console.log(`Uploading ${allDocs.length} chunks to Pinecone...`);

    // Clear and Re-ingest
    // Note: For a hackathon, we replace the index content by using 
    // PineconeStore.fromDocuments which creates a new instance.
    // To avoid duplicates if the index is persistent, we would ideally 
    // delete first, but for now we'll just push these docs.

    await PineconeStore.fromDocuments(allDocs, embeddings, {
        pineconeIndex: index,
        textKey: "text",
    });

    console.log("✅ Dynamic Ingestion successfully completed!");
}

run().catch((err) => {
    console.error("Ingestion failed:", err);
    process.exit(1);
});
