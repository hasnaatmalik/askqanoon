import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function checkPineconeMetadata() {
    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
    });

    const index = pc.Index(process.env.PINECONE_INDEX!);

    console.log("🔍 Checking Pinecone Metadata\n");

    // Query to get some sample vectors
    const testVector = new Array(3072).fill(0.1);
    const result = await index.query({
        vector: testVector,
        topK: 5,
        includeMetadata: true
    });

    console.log("Sample Vectors and Metadata:\n");
    result.matches?.forEach((match, i) => {
        console.log(`${i + 1}. ID: ${match.id}`);
        console.log(`   Jurisdiction: ${match.metadata?.jurisdiction || "NOT SET"}`);
        console.log(`   Law: ${match.metadata?.law_name}`);
        console.log(`   All Metadata:`, match.metadata);
        console.log("");
    });
}

check PineconeMetadata().catch(console.error);
