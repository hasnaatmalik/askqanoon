import * as dotenv from "dotenv";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

/**
 * Extracts the first section number found in a text block.
 * Matches patterns like: "Section 302", "Sec. 5", "Article 25", "Rule 17a-4"
 */
function extractSectionNumber(text: string): string {
    const patterns = [
        /Section\s+([\d\w\-]+(?:\([a-z]\))?)/i,
        /Sec\.\s+([\d\w\-]+)/i,
        /Article\s+([\d\w\-]+(?:-[A-Z])?)/i,
        /Rule\s+([\d\w\-]+)/i,
        /Clause\s+([\d\w\-]+)/i,
    ];
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) return match[1];
    }
    return "General";
}

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
        console.log("✓ Index cleared.");
    } catch (e) {
        console.log("Note: Could not clear index (it might already be empty).");
    }

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 800,
        chunkOverlap: 150,
    });

    const allDocs = [];

    for (const file of files) {
        console.log(`\n📄 Reading file: ${file}`);
        const fullText = fs.readFileSync(path.join(dataDir, file), "utf8");
        const rawSections = fullText.split(/\n---\n/);

        for (const rawSection of rawSections) {
            const lines = rawSection.trim().split("\n");
            if (lines.length === 0 || !lines[0].trim()) continue;

            // Parse header
            let lawName = lines[0].trim();
            let jurisdiction = "Pakistan"; // Default
            let contentStartIndex = 1;

            // Check if second line is a Jurisdiction
            if (lines.length > 1 && lines[1].toLowerCase().startsWith("jurisdiction:")) {
                jurisdiction = lines[1].split(":")[1].trim();
                contentStartIndex = 2;
            }

            const content = lines.slice(contentStartIndex).join("\n").trim();
            if (!content) continue;

            console.log(`  → Processing: ${lawName} (${jurisdiction})`);

            // FIX: Split into smaller sub-sections by known delimiters first
            // to get per-section chunks with accurate section numbers
            const subSections = content.split(/\n(?=Section\s+\d|Article\s+\d|Rule\s+\d)/i);

            for (const subSection of subSections) {
                if (!subSection.trim()) continue;

                // FIX: Extract the actual section number from the text
                const sectionNumber = extractSectionNumber(subSection);

                const docs = await splitter.createDocuments([subSection.trim()], [
                    {
                        law_name: lawName,
                        section_number: sectionNumber,
                        jurisdiction: jurisdiction,
                        source_file: file,
                    }
                ]);

                allDocs.push(...docs);
            }
        }
    }

    if (allDocs.length === 0) {
        console.error("No documents were generated. Check the data file format.");
        process.exit(1);
    }

    console.log(`\n🚀 Uploading ${allDocs.length} chunks to Pinecone...`);

    await PineconeStore.fromDocuments(allDocs, embeddings, {
        pineconeIndex: index,
        textKey: "text",
    });

    console.log("\n✅ Ingestion successfully completed!");
    console.log(`   Total chunks ingested: ${allDocs.length}`);
}

run().catch((err) => {
    console.error("Ingestion failed:", err);
    process.exit(1);
});
