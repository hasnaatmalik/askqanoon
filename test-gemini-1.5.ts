import * as dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

dotenv.config();

async function testGemini15() {
    console.log("🧪 Testing gemini-1.5-flash...\n");

    const model = new ChatGoogleGenerativeAI({
        model: "gemini-1.5-flash",
        maxOutputTokens: 100,
        apiKey: process.env.GOOGLE_API_KEY,
        temperature: 0,
    });

    const startTime = Date.now();

    try {
        const result = await model.invoke("Say 'gemini-1.5-flash is working!'");
        const elapsed = Date.now() - startTime;

        console.log(`✅ SUCCESS in ${elapsed}ms`);
        console.log(`Response: ${result.content}\n`);
        return true;
    } catch (error: any) {
        const elapsed = Date.now() - startTime;
        console.log(`❌ FAILED in ${elapsed}ms`);
        console.log(`Error: ${error.message}\n`);
        return false;
    }
}

testGemini15()
    .then(success => process.exit(success ? 0 : 1))
    .catch(err => {
        console.error("Fatal:", err);
        process.exit(1);
    });
