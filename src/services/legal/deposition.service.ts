import { GoogleGenerativeAI } from "@google/generative-ai";

export type Difficulty = "gentle" | "standard" | "aggressive";

export interface DepositionSession {
    messages: { role: "user" | "assistant"; content: string }[];
    difficulty: Difficulty;
    caseFacts: string;
}

const USE_MOCK_MODE = process.env.DEPOSITION_MOCK_MODE === "true";

const mockResponses: Record<Difficulty, string[]> = {
    gentle: [
        "Good morning. Thank you for being here today. Let's start with some basic questions. Could you please state your full name and your relationship to this case?\n\n[COACH NOTE] Remember to speak clearly and take your time. It's okay to ask for clarification if you don't understand a question.",
        "Thank you for that. Now, can you tell me when you first became aware of this situation?\n\n[COACH NOTE] When answering about dates, it's fine to say 'approximately' if you're not 100% certain.",
        "You mentioned that earlier — can you describe in your own words exactly what you observed?\n\n[COACH NOTE] Stick to what you personally witnessed. Don't speculate or include hearsay.",
    ],
    standard: [
        "Good morning. Please state your full name for the record and describe your involvement in this matter.",
        "Let's get to specifics. Walk me through the sequence of events as you remember them, starting from the beginning.",
        "⚖️ [CONSISTENCY ALERT] Your account raises a question about the timeline. Earlier you said X — can you clarify?",
        "I'd like to understand the timeline better. What exactly prompted you to take action at that point?",
    ],
    aggressive: [
        "State your name. Let's not waste time — you're claiming your neighbor's wall encroaches on YOUR property, correct? But isn't it true that you only raised this issue AFTER a personal dispute?",
        "⚖️ [CONSISTENCY ALERT] WAIT. You say you bought this property in 2018. The wall was built in 2015 — THREE YEARS before you even owned the property. So you purchased land KNOWING there was a wall there, and NOW you claim it's an encroachment? Explain that!",
        "You're telling this court you waited SIX YEARS to conduct a survey? If this encroachment was so obvious, why didn't you survey BEFORE buying? Isn't the real truth that you're manufacturing this dispute?",
        "⚖️ [CONSISTENCY ALERT] Earlier you said the boundary was 'clearly marked' — but if it was SO clear, why did your neighbor build a wall there? Either the markers weren't clear, or you're not telling us the whole truth. Which is it?",
    ],
};

export class DepositionService {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GOOGLE_API_KEY!;
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    private getMockResponse(session: DepositionSession): string {
        const responses = mockResponses[session.difficulty];
        const questionIndex = Math.floor(session.messages.length / 2);
        return responses[questionIndex % responses.length];
    }

    async generateNextQuestion(session: DepositionSession) {
        if (USE_MOCK_MODE) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return this.getMockResponse(session);
        }

        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

            const isFirstQuestion = session.messages.length === 0;

            const difficultySystem = {
                gentle: `You are a supportive legal coach preparing a witness for deposition.
ROLE: Your tone is calm, encouraging, and constructive.
RULES:
- Ask ONE clear, open-ended question at a time — never multiple questions in one turn.
- After the witness responds, provide a [COACH NOTE] block with actionable feedback (e.g., "Good — you stayed factual. Next time, avoid volunteering extra details.").
- Cover key areas methodically: identity, timeline, observations, documents, relationship to parties.
- If the witness's answer contradicts the Case Context, gently probe — but do NOT attack.
- Keep the simulation realistic but safe.`,

                standard: `You are a professional opposing counsel conducting a formal deposition under Pakistani civil procedure rules.
ROLE: Professional, methodical, and thorough.
RULES:
- Ask ONE focused question per turn. Be precise.
- Probe for inconsistencies between the witness's testimony and the Case Context — but do so calmly and professionally.
- If you detect a contradiction with the Case Context, prefix your question with: ⚖️ [CONSISTENCY ALERT]
- Explore: facts, timeline, intent, documents, credibility, prior knowledge.
- Do not telegraph your legal strategy — build pressure gradually.
- Stay strictly in character as a lawyer. No coaching.`,

                aggressive: `You are a hostile, high-pressure opposing counsel using aggressive cross-examination tactics.
ROLE: Relentless, skeptical, and confrontational — but legally precise.
RULES:
- Ask ONE devastating question per turn. Make it count.
- ALWAYS check the witness's answer against the Case Context for contradictions. If found, open with: ⚖️ [CONSISTENCY ALERT] — then expose the contradiction forcefully.
- Use rhetorical pressure, repetition of damaging facts, and pointed "isn't it true that..." constructions.
- Attack credibility, motive, timeline gaps, and missing evidence.
- Use "Deep Think" chain-of-reasoning: before asking, internally reason — "What is the weakest point in this witness's testimony right now? What's the single most damaging question I can ask?" — then ask THAT question.
- Stay 100% in character. You are here to win.`,
            };

            const systemPrompt = `
=== DEPOSITION AI SIMULATOR — SYSTEM CONTEXT ===

${difficultySystem[session.difficulty]}

=== CASE CONTEXT (GROUND TRUTH — DO NOT SHARE WITH WITNESS) ===
${session.caseFacts}

=== CRITICAL RULES ===
1. You are the EXAMINER. The user is the WITNESS. Never break character.
2. Ask exactly ONE question per response (unless it's a [CONSISTENCY ALERT] which may have a brief statement + question).
3. ${isFirstQuestion ? "This is the OPENING of the deposition. Begin with a formal opening statement (1 sentence) then ask the witness to state their name and describe their role in the matter." : "Continue the deposition based on the conversation history. Build on what the witness has said."}
4. Output FORMAT:
   - If aggressive/standard with inconsistency: Start with ⚖️ [CONSISTENCY ALERT] <brief statement of the contradiction>
   - If gentle: End with [COACH NOTE] <actionable coaching feedback>
   - Otherwise: Just ask your question naturally.
5. Keep your output concise and impactful. Do NOT pad with unnecessary pleasantries.
`;

            const contents = [
                { role: "user", parts: [{ text: systemPrompt }] },
                ...session.messages.map(m => ({
                    role: m.role === "assistant" ? "model" as const : "user" as const,
                    parts: [{ text: m.content }],
                })),
                // Add a model "ack" if first turn
                ...(isFirstQuestion ? [] : []),
            ];

            const result = await model.generateContent({ contents });
            return result.response.text();
        } catch (error: any) {
            console.error("Deposition Service Error:", error);
            if (error?.status === 429 || error?.message?.includes("quota") || error?.message?.includes("429")) {
                return this.getMockResponse(session);
            }
            throw error;
        }
    }
}

export const depositionService = new DepositionService();
