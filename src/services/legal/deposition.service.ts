import { GoogleGenerativeAI } from "@google/generative-ai";

export type Difficulty = "gentle" | "standard" | "aggressive";

export interface DepositionSession {
    messages: { role: "user" | "assistant"; content: string }[];
    difficulty: Difficulty;
    caseFacts: string;
}

// Enable mock mode for testing (set to true to bypass API calls)
const USE_MOCK_MODE = process.env.DEPOSITION_MOCK_MODE === "true";

// Mock responses for testing UI without API
const mockResponses: Record<Difficulty, string[]> = {
    gentle: [
        "Good morning. Thank you for being here today. Let's start with some basic questions. Could you please state your full name and your relationship to this case?\n\n[COACH NOTE] Remember to speak clearly and take your time. It's okay to ask for clarification if you don't understand a question.",
        "Thank you for that. Now, can you tell me when you first became aware of the property boundary dispute?\n\n[COACH NOTE] Good job staying calm. When answering about dates, it's perfectly fine to say 'approximately' if you're not 100% certain.",
        "I appreciate your clarity. You mentioned the survey report - do you recall who conducted that survey and were you present at the time?\n\n[COACH NOTE] You're doing well. Remember, if you don't remember something, it's better to say 'I don't recall' than to guess.",
        "That's helpful context. Can you describe the disputed wall - its location, height, and materials?\n\n[COACH NOTE] Excellent composure. Keep your answers focused on what you personally observed, not what others told you."
    ],
    standard: [
        "Good morning. Please state your full name for the record and describe your involvement in this matter.",
        "Let's get to the specifics. When exactly did you first notice the alleged encroachment, and what prompted you to have a survey conducted?",
        "⚖️ [CONSISTENCY ALERT] You stated the survey was conducted in January 2024, but the wall was allegedly built in 2015. Why did it take nearly 9 years to conduct a formal survey?",
        "I'd like to understand the timeline better. You purchased the property in 2018 - did the seller disclose any boundary disputes? Do you have documentation of what was represented to you at the time of purchase?",
        "The survey report mentions concrete pillars as boundary markers. Were these pillars present when you purchased the property, or were they installed after the survey?"
    ],
    aggressive: [
        "State your name. Let's not waste time - you're claiming your neighbor's wall encroaches on YOUR property, correct? But isn't it true that you only raised this issue AFTER a personal dispute with Mr. Bashir Ali?",
        "⚖️ [CONSISTENCY ALERT] WAIT. You say you bought this property in 2018 for 50 lakhs. The wall was built in 2015 - THREE YEARS before you even owned the property. So you purchased land KNOWING there was a wall there, and NOW you claim it's an encroachment? Explain that!",
        "You're telling this court you waited SIX YEARS after purchase to conduct a survey? SIX YEARS? If this encroachment was so obvious, why didn't you survey BEFORE buying? Isn't the real truth that you're manufacturing this dispute?",
        "Let me be very clear. You have NO witnesses, NO photographs from 2015, and NO independent verification. Your entire case rests on a survey done in 2024 - nearly a DECADE after the wall was built. How convenient! Isn't this just a land grab attempt?",
        "⚖️ [CONSISTENCY ALERT] Earlier you said the boundary was 'clearly marked' - but if it was SO clear, why did your neighbor build a wall there? Either the markers weren't clear, or you're not telling us the whole truth. Which is it?"
    ]
};

export class DepositionService {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GOOGLE_API_KEY!;
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    private getMockResponse(session: DepositionSession): string {
        const responses = mockResponses[session.difficulty];
        const questionIndex = Math.floor(session.messages.length / 2); // Every 2 messages = 1 Q&A cycle
        return responses[questionIndex % responses.length];
    }

    async generateNextQuestion(session: DepositionSession) {
        // Use mock mode for testing
        if (USE_MOCK_MODE) {
            console.log("[MOCK MODE] Returning simulated deposition response");
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            return this.getMockResponse(session);
        }

        try {
            const model = this.genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
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
        } catch (error: any) {
            console.error("Deposition Service Error:", error);
            
            // Fallback to mock mode if API fails (e.g., quota exceeded)
            if (error?.status === 429 || error?.message?.includes("quota") || error?.message?.includes("429")) {
                console.log("[FALLBACK] API quota exceeded, using mock response");
                return this.getMockResponse(session);
            }
            
            throw error;
        }
    }
}

export const depositionService = new DepositionService();
