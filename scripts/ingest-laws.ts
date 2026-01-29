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
        console.error("Error: data/laws.txt not found.");
        process.exit(1);
    }

    const fullText = fs.readFileSync(filePath, "utf8");

    // Split by the --- separator
    const rawSections = fullText.split(/\n---\n/);

    console.log("Initializing AI models and vector store...");
    const embeddings = new GoogleGenerativeAIEmbeddings({
        modelName: "text-embedding-004",
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

    for (const rawSection of rawSections) {
        const lines = rawSection.trim().split("\n");
        if (lines.length === 0 || !lines[0].trim()) continue;

        // The first line is historically our Law Title
        const lawName = lines[0].trim();
        const content = lines.slice(1).join("\n").trim();

        console.log(`Processing law: ${lawName}`);

        const docs = await splitter.createDocuments([content], [
            {
                law_name: lawName,
                section_number: "Multiple",
                topic: "General"
            }
        ]);

        allDocs.push(...docs);
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
