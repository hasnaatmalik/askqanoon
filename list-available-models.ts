import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY!;

async function listAvailableModels() {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        console.log("📋 Listing all available models on your API key:\n");

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );

        const data = await response.json();

        if (data.models) {
            console.log(`Found ${data.models.length} models:\n`);

            // Filter for generation models
            const generationModels = data.models.filter((m: any) =>
                m.supportedGenerationMethods?.includes("generateContent")
            );

            const embeddingModels = data.models.filter((m: any) =>
                m.supportedGenerationMethods?.includes("embedContent")
            );

            console.log("🤖 GENERATION MODELS (for chat/text):");
            generationModels.forEach((model: any) => {
                console.log(`  ✓ ${model.name.replace('models/', '')}`);
            });

            console.log("\n📊 EMBEDDING MODELS:");
            embeddingModels.forEach((model: any) => {
                console.log(`  ✓ ${model.name.replace('models/', '')}`);
            });

            return {
                generation: generationModels.map((m: any) => m.name.replace('models/', '')),
                embedding: embeddingModels.map((m: any) => m.name.replace('models/', ''))
            };
        } else {
            console.error("No models found or error:", data);
            return null;
        }
    } catch (error: any) {
        console.error("Error listing models:", error.message);
        return null;
    }
}

listAvailableModels();
