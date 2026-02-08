import { ragService } from "./src/services/rag/rag.service";
import * as dotenv from "dotenv";

dotenv.config();

async function testRAGSystem() {
    console.log("🧪 Testing RAG System\n");
    console.log("=" + "=".repeat(70) + "\n");

    let allPassed = true;

    // Test 1: Embeddings
    console.log("1️⃣  Testing Embeddings Generation...");
    try {
        const testQuery = "What is Section 302 of PPC?";
        console.log(`   Query: "${testQuery}"`);
        console.log("   Generating embeddings...");

        // This will test the embedding model internally
        const result = await ragService.query(testQuery, [], false);

        if (result.answer) {
            console.log("   ✅ Embeddings Working\n");
            console.log("   Answer Preview:", result.answer.substring(0, 150) + "...\n");
        } else {
            throw new Error("No answer received");
        }
    } catch (error: any) {
        console.log("   ❌ FAILED:", error.message, "\n");
        allPassed = false;
    }

    // Test 2: RAG Query
    console.log("2️⃣  Testing RAG Query with Legal Question...");
    try {
        const legalQuery = "What is the punishment for murder in Pakistan?";
        console.log(`   Query: "${legalQuery}"`);

        const result = await ragService.query(legalQuery, [], false);

        if (result.answer && result.answer.length > 0) {
            console.log("   ✅ RAG Query Working");
            console.log(`   Answer length: ${result.answer.length} characters`);
            console.log(`   Sources found: ${result.sources?.length || 0}`);

            if (result.sources && result.sources.length > 0) {
                console.log("\n   📚 Sample Source:");
                console.log(`      Law: ${result.sources[0].law}`);
                console.log(`      Section: ${result.sources[0].section}`);
            }
            console.log("");
        } else {
            throw new Error("Empty answer received");
        }
    } catch (error: any) {
        console.log("   ❌ FAILED:", error.message, "\n");
        allPassed = false;
    }

    // Test 3: Roman Urdu
    console.log("3️⃣  Testing Roman Urdu Response...");
    try {
        const query = "Qatl ki saza kya hai?";
        console.log(`   Query: "${query}"`);

        const result = await ragService.query(query, [], true);

        if (result.answer) {
            console.log("   ✅ Roman Urdu Working");
            console.log("   Answer Preview:", result.answer.substring(0, 100) + "...\n");
        } else {
            throw new Error("No answer in Roman Urdu");
        }
    } catch (error: any) {
        console.log("   ❌ FAILED:", error.message, "\n");
        allPassed = false;
    }

    // Test 4: No Results Query
    console.log("4️⃣  Testing Query with No Legal Context...");
    try {
        const randomQuery = "What is the weather like today?";
        console.log(`   Query: "${randomQuery}"`);

        const result = await ragService.query(randomQuery, [], false);

        if (result.answer) {
            console.log("   ✅ Graceful Handling");
            console.log(`   Answer: ${result.answer.substring(0, 150)}...`);
            console.log(`   Sources: ${result.sources?.length || 0} (expected: 0)\n`);
        }
    } catch (error: any) {
        console.log("   ❌ FAILED:", error.message, "\n");
        allPassed = false;
    }

    // Test 5: Conversation History
    console.log("5️⃣  Testing Conversation with History...");
    try {
        const history = [
            { role: "user", content: "What is Section 302 PPC?" },
            { role: "assistant", content: "Section 302 of PPC deals with punishment for murder." }
        ];
        const followUp = "What is the punishment?";
        console.log(`   Follow-up Query: "${followUp}"`);

        const result = await ragService.query(followUp, history as any, false);

        if (result.answer) {
            console.log("   ✅ History Context Working");
            console.log("   Answer Preview:", result.answer.substring(0, 100) + "...\n");
        }
    } catch (error: any) {
        console.log("   ❌ FAILED:", error.message, "\n");
        allPassed = false;
    }

    console.log("=" + "=".repeat(70) + "\n");

    if (allPassed) {
        console.log("🎉 All RAG System Tests Passed!\n");
    } else {
        console.log("⚠️  Some tests failed. See details above.\n");
    }

    return allPassed;
}

testRAGSystem()
    .then(passed => process.exit(passed ? 0 : 1))
    .catch(error => {
        console.error("Fatal error:", error);
        process.exit(1);
    });
