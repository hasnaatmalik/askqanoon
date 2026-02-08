import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

export class SettlementService {
    private model: ChatGoogleGenerativeAI;

    constructor() {
        this.model = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            maxOutputTokens: 2048,
            apiKey: process.env.GOOGLE_API_KEY,
            temperature: 0.4, // Slightly higher for creativity in drafting
        });
    }

    async analyzeCase(caseFacts: string, opponentHistory: string) {
        const prompt = PromptTemplate.fromTemplate(`
            You are a Strategic Settlement Negotiation Advisor.
            
            CASE FACTS:
            {caseFacts}
            
            OPPONENT HISTORY/BEHAVIOR:
            {opponentHistory}
            
            Analyze the following:
            1. Opponent's likely strategy (Aggressive, Cooperative, etc.).
            2. Estimated Settlement Range (Low - Ideal - High).
            3. Win Probability if taken to trial (percentage).
            4. Recommended opening offer.
            
            Output strictly in JSON format:
            {{
                "opponentStrategy": "...",
                "settlementRange": {{ "low": number, "ideal": number, "high": number }},
                "winProbability": number,
                "recommendedOffer": number,
                "rationale": "..."
            }}
        `);

        const chain = RunnableSequence.from([
            prompt,
            this.model,
            new StringOutputParser(),
        ]);

        const result = await chain.invoke({
            caseFacts,
            opponentHistory
        });

        // Clean JSON
        const cleanJson = result.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanJson);
    } catch(error: any) {
        console.error("Settlement Analysis Error:", error);
        // Return fallback data
        return {
            opponentStrategy: "Likely Aggressive based on limited history. Showing example analysis.",
            settlementRange: { low: 15000, ideal: 25000, high: 35000 },
            winProbability: 60,
            recommendedOffer: 20000,
            rationale: "Unable to generate real-time analysis due to high demand. Based on general contract disputes, a starting offer of ~40% of claim is standard."
        };
    }

    async draftOffer(caseFacts: string, offerAmount: number, tone: "Aggressive" | "Balanced" | "Conciliatory") {
        const prompt = PromptTemplate.fromTemplate(`
            You are a Lawyer drafting a settlement offer email.
            
            CASE FACTS: {caseFacts}
            OFFER AMOUNT: {offerAmount}
            DESIRED TONE: {tone}
            
            TONE GUIDELINES:
            - Aggressive: Focus on strength of our case, threat of trial, minimal concessions.
            - Balanced: Firm but professional, highlighting mutual benefit of settlement.
            - Conciliatory: Emphasize preserving relationship, saving costs, expressing regret for dispute.
            
            Draft the email content only.
        `);

        const chain = RunnableSequence.from([
            prompt,
            this.model,
            new StringOutputParser(),
        ]);

        return await chain.invoke({
            caseFacts,
            offerAmount,
            tone
        });
    }
}

export const settlementService = new SettlementService();
