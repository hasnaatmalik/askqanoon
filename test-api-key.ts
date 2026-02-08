import * as dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// Load .env file
const result = dotenv.config();

if (result.error) {
    console.error("❌ Error loading .env:", result.error);
    process.exit(1);
}

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

console.log("🔑 API Key Check:\n");
console.log("API Key found:", !!GOOGLE_API_KEY);
console.log("API Key length:", GOOGLE_API_KEY?.length);
console.log("First 10 chars:", GOOGLE_API_KEY?.substring(0, 10));
console.log("Last 5 chars:", GOOGLE_API_KEY?.substring(GOOGLE_API_KEY.length - 5));
console.log("Has quotes:", GOOGLE_API_KEY?.startsWith('"') || GOOGLE_API_KEY?.endsWith('"'));
console.log("\n" + "=".repeat(70) + "\n");

async function quickTest() {
    console.log("Testing with Gemini API...\n");

    if (!GOOGLE_API_KEY) {
        console.error("❌ No API key");
        return false;
    }

    const cleanKey = GOOGLE_API_KEY.replace(/^["']|["']$/g, ''); // Remove quotes if present
    console.log("Clean key length:", cleanKey.length);
    console.log("Clean key sample:", cleanKey.substring(0, 10) + "..." + cleanKey.substring(cleanKey.length - 5));
    console.log("");

    try {
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            maxOutputTokens: 50,
            apiKey: cleanKey,
            temperature: 0,
        });

        const startTime = Date.now();
        const result = await model.invoke("Say 'API works!'");
        const elapsed = Date.now() - startTime;

        console.log(`✅ SUCCESS in ${elapsed}ms`);
        console.log(`Response: ${result.content}\n`);
        return true;
    } catch (error: any) {
        console.log(`❌ FAILED`);
        console.log(`Error: ${error.message}\n`);
        return false;
    }
}

quickTest()
    .then(success => process.exit(success ? 0 : 1))
    .catch(err => {
        console.error("Fatal:", err);
        process.exit(1);
    });
