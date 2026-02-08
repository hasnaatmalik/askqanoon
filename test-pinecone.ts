import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config({ path: ".env" });

async function testPineconeConnection() {
    console.log("🧪 Testing Pinecone Connection\n");
    console.log("=" + "=".repeat(70) + "\n");

    const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
    const PINECONE_INDEX = process.env.PINECONE_INDEX;

    console.log("Environment Variables:");
    console.log(`  PINECONE_API_KEY: ${PINECONE_API_KEY ? "✅ Set (length: " + PINECONE_API_KEY.length + ")" : "❌ Not Set"}`);
    console.log(`  PINECONE_INDEX: ${PINECONE_INDEX || "❌ Not Set"}`);
    console.log("");

    if (!PINECONE_API_KEY || !PINECONE_INDEX) {
        console.log("❌ Missing required environment variables!\n");
        return false;
    }

    try {
        console.log("1️⃣  Connecting to Pinecone...");
        const pc = new Pinecone({
            apiKey: PINECONE_API_KEY,
        });
        console.log("   ✅ Pinecone client initialized\n");

        console.log("2️⃣  Accessing index:", PINECONE_INDEX);
        const index = pc.Index(PINECONE_INDEX);
        console.log("   ✅ Index accessed\n");

        console.log("3️⃣  Checking index stats...");
        const stats = await index.describeIndexStats();
        console.log("   ✅ Index Stats Retrieved:");
        console.log(`      Total Vectors: ${stats.totalRecordCount || 0}`);
        console.log(`      Dimensions: ${stats.dimension || "Unknown"}`);
        console.log(`      Namespaces: ${Object.keys(stats.namespaces || {}).length || 0}`);

        if (stats.namespaces) {
            console.log("\n      Namespace Details:");
            for (const [ns, data] of Object.entries(stats.namespaces)) {
                console.log(`        - ${ns || "(default)"}: ${(data as any).recordCount || 0} vectors`);
            }
        }
        console.log("");

        if ((stats.totalRecordCount || 0) === 0) {
            console.log("⚠️  WARNING: Index is empty! No vectors found.");
            console.log("   The RAG system will not be able to retrieve any legal documents.");
            console.log("   You need to ingest legal documents into Pinecone first.\n");
            return false;
        }

        console.log("4️⃣  Testing vector query...");
        const testVector = new Array(stats.dimension).fill(0.1);
        const queryResult = await index.query({
            vector: testVector,
            topK: 3,
            includeMetadata: true
        });

        console.log(`   ✅ Query executed successfully`);
        console.log(`      Matches found: ${queryResult.matches?.length || 0}\n`);

        if (queryResult.matches && queryResult.matches.length > 0) {
            console.log("   📄 Sample Match:");
            const sample = queryResult.matches[0];
            console.log(`      ID: ${sample.id}`);
            console.log(`      Score: ${sample.score}`);
            console.log(`      Metadata:`, JSON.stringify(sample.metadata, null, 2));
        }

        console.log("\n" + "=".repeat(70));
        console.log("🎉 Pinecone Connection Test PASSED!\n");
        return true;

    } catch (error: any) {
        console.log("\n   ❌ ERROR:", error.message);
        if (error.status === 401 || error.message?.includes("Unauthorized")) {
            console.log("   💡 Check your PINECONE_API_KEY - it may be invalid or expired.\n");
        } else if (error.status === 404 || error.message?.includes("not found")) {
            console.log(`   💡 Index "${PINECONE_INDEX}" not found.`);
            console.log("   Available actions:");
            console.log("   1. Create the index in Pinecone console");
            console.log("   2. Update PINECONE_INDEX in .env to match an existing index\n");
        }
        return false;
    }
}

testPineconeConnection()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
        console.error("Fatal error:", error);
        process.exit(1);
    });
