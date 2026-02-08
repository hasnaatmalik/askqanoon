import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import * as dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY!;

async function verifyFixes() {
    console.log("🔍 Verifying Fixed Models\n");
    console.log("=" + "=".repeat(70) + "\n");

    let allPassed = true;

    // Test 1: RAG Service - gemini-2.5-flash
    console.log("1️⃣  Testing RAG Service (gemini-2.5-flash)...");
    try {
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            apiKey: apiKey,
        });
        const result = await model.invoke("Say hello");
        console.log("   ✅ WORKS: " + result.content + "\n");
    } catch (error: any) {
        console.log("   ❌ FAILED: " + error.message + "\n");
        allPassed = false;
    }

    // Test 2: Video Analysis - gemini-2.5-flash
    console.log("2️⃣  Testing Video Analysis (gemini-2.5-flash)...");
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Say hello");
        console.log("   ✅ WORKS: " + result.response.text() + "\n");
    } catch (error: any) {
        console.log("   ❌ FAILED: " + error.message + "\n");
        allPassed = false;
    }

    // Test 3: Deposition Service - gemini-2.5-flash
    console.log("3️⃣  Testing Deposition Service (gemini-2.5-flash)...");
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Say hello");
        console.log("   ✅ WORKS: " + result.response.text() + "\n");
    } catch (error: any) {
        console.log("   ❌ FAILED: " + error.message + "\n");
        allPassed = false;
    }

    // Test 4: Settlement Service - gemini-2.5-flash
    console.log("4️⃣  Testing Settlement Service (gemini-2.5-flash)...");
    try {
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            apiKey: apiKey,
        });
        const result = await model.invoke("Say hello");
        console.log("   ✅ WORKS: " + result.content + "\n");
    } catch (error: any) {
        console.log("   ❌ FAILED: " + error.message + "\n");
        allPassed = false;
    }

    // Test 5: Embeddings - gemini-embedding-001
    console.log("5️⃣  Testing Embeddings (gemini-embedding-001)...");
    try {
        const embeddings = new GoogleGenerativeAIEmbeddings({
            modelName: "gemini-embedding-001",
            apiKey: apiKey,
        });
        const result = await embeddings.embedQuery("test");
        console.log(`   ✅ WORKS: Vector length = ${result.length}\n`);
    } catch (error: any) {
        console.log("   ❌ FAILED: " + error.message + "\n");
        allPassed = false;
    }

    console.log("=" + "=".repeat(70) + "\n");

    if (allPassed) {
        console.log("🎉 SUCCESS! All models are working correctly on the free tier.\n");
    } else {
        console.log("⚠️  Some models still have issues. See details above.\n");
    }
}

verifyFixes().catch(console.error);
