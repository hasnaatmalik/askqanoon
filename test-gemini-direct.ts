import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

// Load environment variables
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
    console.error("❌ GOOGLE_API_KEY not found in environment");
    process.exit(1);
}

console.log("🧪 Testing Gemini API Directly\n");
console.log("API Key:", GOOGLE_API_KEY.substring(0, 10) + "..." + GOOGLE_API_KEY.substring(GOOGLE_API_KEY.length - 5));
console.log("=" + "=".repeat(70) + "\n");

async function testBasicGeneration() {
    console.log("1️⃣  Testing Basic Text Generation...");
    const startTime = Date.now();

    try {
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            maxOutputTokens: 100,
            apiKey: GOOGLE_API_KEY,
            temperature: 0,
        });

        const result = await model.invoke("Say 'Hello, the API is working!'");
        const elapsed = Date.now() - startTime;

        console.log(`   ✅ SUCCESS (${elapsed}ms)`);
        console.log(`   Response: ${result.content}\n`);
        return true;
    } catch (error: any) {
        const elapsed = Date.now() - startTime;
        console.log(`   ❌ FAILED (${elapsed}ms)`);
        console.log(`   Error: ${error.message}\n`);
        return false;
    }
}

async function testComplexPrompt() {
    console.log("2️⃣  Testing Complex Prompt (Like Compliance)...");
    const startTime = Date.now();

    try {
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            maxOutputTokens: 2048,
            apiKey: GOOGLE_API_KEY,
            temperature: 0,
        });

        const prompt = PromptTemplate.fromTemplate(`
            You are a Legal Compliance Expert.
            Task: Analyze data retention requirements.
            
            CONTEXT:
            Pakistan: Data Retention Act requires 3 years retention.
            EU GDPR: Article 5 requires data minimization and limited retention.
            
            Output valid JSON ONLY:
            {{
                "analysis": "Brief summary",
                "conflictLevel": "High",
                "matrix": [
                    {{ "jurisdiction": "Pakistan", "requirement": "3 years retention", "status": "Stricter" }}
                ],
                "conflicts": ["Pakistan requires longer retention than GDPR allows"]
            }}
        `);

        const chain = RunnableSequence.from([
            prompt,
            model,
            new StringOutputParser(),
        ]);

        const result = await chain.invoke({});
        const elapsed = Date.now() - startTime;

        console.log(`   ✅ SUCCESS (${elapsed}ms)`);
        console.log(`   Response length: ${result.length} chars`);
        console.log(`   First 200 chars: ${result.substring(0, 200)}...\n`);

        // Try parsing JSON
        try {
            const cleanJson = result.replace(/```json/g, "").replace(/```/g, "").trim();
            JSON.parse(cleanJson);
            console.log(`   ✅ JSON is valid\n`);
        } catch (e) {
            console.log(`   ⚠️  JSON parsing failed\n`);
        }

        return true;
    } catch (error: any) {
        const elapsed = Date.now() - startTime;
        console.log(`   ❌ FAILED (${elapsed}ms)`);
        console.log(`   Error: ${error.message}`);
        console.log(`   Stack: ${error.stack?.substring(0, 300)}\n`);
        return false;
    }
}

async function testWithTimeout() {
    console.log("3️⃣  Testing with 10-second Timeout...");
    const startTime = Date.now();

    try {
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            maxOutputTokens: 2048,
            apiKey: GOOGLE_API_KEY,
            temperature: 0,
        });

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout after 10 seconds")), 10000)
        );

        const apiPromise = model.invoke("Explain Pakistani data retention laws in 50 words.");

        const result = await Promise.race([apiPromise, timeoutPromise]);
        const elapsed = Date.now() - startTime;

        console.log(`   ✅ SUCCESS (${elapsed}ms)`);
        console.log(`   Response: ${(result as any).content}\n`);
        return true;
    } catch (error: any) {
        const elapsed = Date.now() - startTime;
        console.log(`   ❌ FAILED (${elapsed}ms)`);
        console.log(`   Error: ${error.message}\n`);
        return false;
    }
}

async function main() {
    const results = {
        basic: await testBasicGeneration(),
        complex: await testComplexPrompt(),
        timeout: await testWithTimeout()
    };

    console.log("=" + "=".repeat(70));
    console.log("\n📊 SUMMARY:");
    console.log(`   Basic Generation: ${results.basic ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`   Complex Prompt: ${results.complex ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`   With Timeout: ${results.timeout ? "✅ PASS" : "❌ FAIL"}`);

    const allPassed = results.basic && results.complex && results.timeout;
    console.log(`\n${allPassed ? "✅ All tests passed!" : "❌ Some tests failed"}\n`);

    process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
});
