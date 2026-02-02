import { GoogleGenerativeAI } from "@google/generative-ai";

export type Difficulty = "gentle" | "standard" | "aggressive";

export interface DepositionSession {
    messages: { role: "user" | "assistant"; content: string }[];
    difficulty: Difficulty;
    caseFacts: string;
}

export class DepositionService {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GOOGLE_API_KEY!;
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async generateNextQuestion(session: DepositionSession) {
        try {
            const model = this.genAI.getGenerativeModel({
                model: "gemini-3-pro-preview",
            });

            const difficultyPrompts = {
                gentle: "You are a supportive legal preparer. Your goal is to help the witness become comfortable. Ask clear, non-threatening questions and give 'Coach Notes' after their answer to help them improve.",
                standard: "You are a standard opposing counsel during a deposition. Be professional, firm, and thorough. Follow up on inconsistencies.",
                aggressive: "STRESS TEST MODE: You are a hostile opposing counsel. Use aggressive questioning tactics, look for any small contradiction, and put pressure on the witness's credibility. Be skeptical and relentless."
            };

            const prompt = `
            You are an AI Deposition Simulator for Pakistani legal cases. 
            
            CASE CONTEXT/GROUND TRUTH:
            ${session.caseFacts}

            CURRENT DIFFICULTY: ${difficultyPrompts[session.difficulty]}

            TASK:
            1. Analyze the witness's previous answers for CONSISTENCY against the provided Case Context.
            2. If you find a contradiction, point it out immediately in character as a hostile or firm examiner.
            3. If the difficulty is "gentle", provide a [COACH NOTE] block after your question with advice.
            4. If the difficulty is "aggressive", use "Deep Think" reasoning to trap the witness in their own contradictions.
            
            OUTPUT FORMAT:
            - Your answer should be in character as the examiner.
            - If there is a coach note, put it at the end starting with [COACH NOTE].
            - If there is a consistency warning, put it at the start with ⚖️ [CONSISTENCY ALERT].
            `;

            const contents = [
                { role: "user", parts: [{ text: prompt }] },
                ...session.messages.map(m => ({
                    role: m.role === "assistant" ? "model" as const : "user" as const,
                    parts: [{ text: m.content }]
                }))
            ];

            const result = await model.generateContent({
                contents
            });

            return result.response.text();
        } catch (error) {
            console.error("Deposition Service Error:", error);
            throw error;
        }
    }
}

export const depositionService = new DepositionService();
