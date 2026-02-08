import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import * as dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY!;

interface ModelTestResult {
    modelName: string;
    usedIn: string;
    status: "✅ WORKS" | "❌ FAILED";
    error?: string;
    suggestion?: string;
}

async function testModel(modelName: string, usedIn: string): Promise<ModelTestResult> {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Simple test prompt
        const result = await model.generateContent("Say hello in one word.");
        const text = result.response.text();
        
        console.log(`✅ ${modelName}: ${text}`);
        return {
            modelName,
            usedIn,
            status: "✅ WORKS",
        };
    } catch (error: any) {
        console.error(`❌ ${modelName}: ${error.message}`);
        
        let suggestion = "";
        if (error.message?.includes("404") || error.message?.includes("not found")) {
            suggestion = "Model not available. Try: gemini-1.5-flash or gemini-1.5-pro";
        } else if (error.message?.includes("quota") || error.message?.includes("429")) {
            suggestion = "Quota exceeded. Free tier has rate limits.";
        } else if (error.message?.includes("billing") || error.message?.includes("payment")) {
            suggestion = "Requires paid plan. Try: gemini-1.5-flash (free tier)";
        }
        
        return {
            modelName,
            usedIn,
            status: "❌ FAILED",
            error: error.message,
            suggestion,
        };
    }
}

async function testLangChainModel(modelName: string, usedIn: string): Promise<ModelTestResult> {
    try {
        const model = new ChatGoogleGenerativeAI({
            model: modelName,
            apiKey: apiKey,
        });
        
        const result = await model.invoke("Say hello in one word.");
        console.log(`✅ ${modelName} (LangChain): ${result.content}`);
        
        return {
            modelName,
            usedIn,
            status: "✅ WORKS",
        };
    } catch (error: any) {
        console.error(`❌ ${modelName} (LangChain): ${error.message}`);
        
        let suggestion = "";
        if (error.message?.includes("404") || error.message?.includes("not found")) {
            suggestion = "Model not available. Try: gemini-1.5-flash or gemini-1.5-pro";
        } else if (error.message?.includes("quota") || error.message?.includes("429")) {
            suggestion = "Quota exceeded. Free tier has rate limits.";
        } else if (error.message?.includes("billing") || error.message?.includes("payment")) {
            suggestion = "Requires paid plan. Try: gemini-1.5-flash (free tier)";
        }
        
        return {
            modelName,
            usedIn,
            status: "❌ FAILED",
            error: error.message,
            suggestion,
        };
    }
}

async function testEmbeddings(modelName: string): Promise<ModelTestResult> {
    try {
        const embeddings = new GoogleGenerativeAIEmbeddings({
            modelName: modelName,
            apiKey: apiKey,
        });
        
        const result = await embeddings.embedQuery("test");
        console.log(`✅ ${modelName} (Embeddings): Vector length = ${result.length}`);
        
        return {
            modelName,
            usedIn: "RAG Service (Embeddings)",
            status: "✅ WORKS",
        };
    } catch (error: any) {
        console.error(`❌ ${modelName} (Embeddings): ${error.message}`);
        
        return {
            modelName,
            usedIn: "RAG Service (Embeddings)",
            status: "❌ FAILED",
            error: error.message,
            suggestion: "Try: text-embedding-004 or embedding-001",
        };
    }
}

async function main() {
    console.log("🔍 Testing Gemini API Models on Free Tier\n");
    console.log("=" + "=".repeat(70) + "\n");
    
    const results: ModelTestResult[] = [];
    
    // Test models used in the project
    console.log("📝 Testing Chat Models:\n");
    
    results.push(await testModel("gemini-3-pro-preview", "Video Analysis Service"));
    results.push(await testLangChainModel("gemini-3-flash-preview", "RAG Service & Settlement Service"));
    results.push(await testModel("gemini-2.0-flash", "Deposition Service"));
    
    console.log("\n📚 Testing Embeddings Models:\n");
    results.push(await testEmbeddings("text-embedding-004"));
    
    console.log("\n🔄 Testing Alternative Free Tier Models:\n");
    results.push(await testModel("gemini-1.5-flash", "Alternative (Free Tier)"));
    results.push(await testModel("gemini-1.5-pro", "Alternative (Free Tier)"));
    results.push(await testLangChainModel("gemini-1.5-flash-latest", "Alternative (Free Tier)"));
    
    // Print summary
    console.log("\n" + "=".repeat(70));
    console.log("\n📊 SUMMARY:\n");
    
    const working = results.filter(r => r.status === "✅ WORKS");
    const failed = results.filter(r => r.status === "❌ FAILED");
    
    console.log(`✅ Working Models: ${working.length}`);
    working.forEach(r => console.log(`   - ${r.modelName} (${r.usedIn})`));
    
    console.log(`\n❌ Failed Models: ${failed.length}`);
    failed.forEach(r => {
        console.log(`   - ${r.modelName} (${r.usedIn})`);
        console.log(`     Error: ${r.error?.substring(0, 100)}...`);
        if (r.suggestion) {
            console.log(`     💡 Suggestion: ${r.suggestion}`);
        }
    });
    
    console.log("\n" + "=".repeat(70));
    
    // Recommendations
    if (failed.length > 0) {
        console.log("\n💡 RECOMMENDATIONS:\n");
        
        const gemini3Models = failed.filter(r => r.modelName.includes("gemini-3"));
        if (gemini3Models.length > 0) {
            console.log("⚠️  Gemini 3 models are not available on the free tier.");
            console.log("   Replace with: gemini-1.5-flash or gemini-1.5-pro\n");
        }
        
        const gemini2Models = failed.filter(r => r.modelName.includes("gemini-2.0"));
        if (gemini2Models.length > 0) {
            console.log("⚠️  Gemini 2.0 models may have limited availability.");
            console.log("   Replace with: gemini-1.5-flash (more stable on free tier)\n");
        }
    }
}

main().catch(console.error);
