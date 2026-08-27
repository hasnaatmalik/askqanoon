import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

export class SettlementService {
    private model: ChatGoogleGenerativeAI;

    constructor() {
        this.model = new ChatGoogleGenerativeAI({
            model: "gemini-3.6-flash",
            maxOutputTokens: 4096,
            apiKey: process.env.GOOGLE_API_KEY,
            temperature: 0.2,
        });
    }

    async analyzeCase(caseFacts: string, opponentHistory: string) {
        try {
            const prompt = PromptTemplate.fromTemplate(`
=== SETTLEMENT INTELLIGENCE SYSTEM — CASE ANALYSIS ENGINE ===

You are an elite settlement negotiation advisor with 30 years of courtroom and mediation experience.
Your analytical framework combines game theory, behavioral psychology, and legal strategy.

CHAIN-OF-THOUGHT ANALYSIS PROTOCOL:
Before outputting JSON, reason through the following steps internally:

STEP 1 — CASE MERIT ASSESSMENT:
- What are the strongest 3 factual/legal arguments FOR the client?
- What are the weakest 3 points or vulnerabilities?
- What is the realistic damages exposure?

STEP 2 — OPPONENT BEHAVIORAL PROFILING:
Based on opponent history/behavior, classify their negotiation archetype:
- Aggressive Litigator: Prefers trial, uses delay tactics, makes lowball offers
- Pragmatic Settler: Responds to clear evidence, wants early resolution
- Risk-Averse Counsel: Prioritizes certainty, fee arrangements matter
- Posturing Opponent: Aggressive communication but settles consistently

STEP 3 — GAME THEORY MODELING:
- What is their BATNA (Best Alternative To Negotiated Agreement)?
- What is our BATNA?
- Where is the ZOPA (Zone Of Possible Agreement)?
- What is the first-mover advantage or disadvantage?

STEP 4 — WIN PROBABILITY CALIBRATION:
- Estimate trial win probability considering: evidence strength, jurisdiction, judge/arbitrator type, witness credibility
- Factor in costs, time, and business risk

STEP 5 — SETTLEMENT RANGE CALCULATION:
- LOW: Minimum we'd accept under duress / maximum risk scenario
- IDEAL: Expected value of trial minus litigation costs — the rational settlement point
- HIGH: What we'd open with to anchor the negotiation high

=== INPUT DATA ===

CASE FACTS:
{caseFacts}

OPPONENT HISTORY / BEHAVIORAL SIGNALS:
{opponentHistory}

=== OUTPUT INSTRUCTIONS ===
Output ONLY a valid JSON object. No markdown. No code blocks. No commentary outside the JSON.
Use this exact schema:
{{
    "opponentStrategy": "One of: Aggressive Litigator | Pragmatic Settler | Risk-Averse Counsel | Posturing Opponent — followed by 1-sentence rationale",
    "opponentBATNA": "Brief description of their best alternative to settlement",
    "ourBATNA": "Brief description of our best alternative to settlement",
    "zopa": "Describe the likely Zone of Possible Agreement",
    "settlementRange": {{
        "low": <integer — minimum acceptable in PKR or same currency as case>,
        "ideal": <integer — rational EV-based target>,
        "high": <integer — opening anchor offer>
    }},
    "winProbability": <integer 0-100 — realistic trial win probability>,
    "recommendedOffer": <integer — recommended first offer amount>,
    "keyLeverages": ["leverage point 1", "leverage point 2", "leverage point 3"],
    "watchOuts": ["risk 1", "risk 2"],
    "rationale": "2-3 sentence strategic rationale for the recommended approach"
}}
`);

            const chain = RunnableSequence.from([prompt, this.model, new StringOutputParser()]);

            const result = await chain.invoke({ caseFacts, opponentHistory });
            const cleanJson = result.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(cleanJson);
        } catch (error: any) {
            console.error("Settlement Analysis Error:", error);
            return {
                opponentStrategy: "Analysis unavailable — please retry.",
                opponentBATNA: "Unknown",
                ourBATNA: "Unknown",
                zopa: "Unable to determine",
                settlementRange: { low: 0, ideal: 0, high: 0 },
                winProbability: 50,
                recommendedOffer: 0,
                keyLeverages: [],
                watchOuts: [],
                rationale: "Service error. Please try again.",
            };
        }
    }

    async draftOffer(caseFacts: string, offerAmount: number, tone: "Aggressive" | "Balanced" | "Conciliatory") {
        try {
            const toneGuidelines = {
                Aggressive: `
TONE: Aggressive — Positional Bargaining
PSYCHOLOGICAL APPROACH: Power positioning. Convey absolute confidence in trial outcome.
TECHNIQUES:
- Open with your strongest evidentiary fact (anchor on strength, not compromise)
- Make the offer appear generous given your strong position, not desperate
- Include a deadline (creates urgency and scarcity)
- Briefly reference the costs of continued litigation (to opponent)
- Close with a clear, non-negotiable framing: "This offer is valid for 7 days."
AVOID: Apologetic language, hedging, or any concession framing`,

                Balanced: `
TONE: Balanced — Interest-Based Negotiation
PSYCHOLOGICAL APPROACH: Mutual-gains framing. Appeal to rationality and shared interest in resolution.
TECHNIQUES:
- Acknowledge the legitimacy of the dispute without conceding liability
- Frame settlement as the commercially rational path for BOTH parties
- Emphasize cost certainty vs. trial uncertainty
- Present the offer amount as calculated and principled (not arbitrary)
- Leave room for counter-proposal with: "We remain open to further discussion."
AVOID: Either extreme — do not appear desperate OR threatening`,

                Conciliatory: `
TONE: Conciliatory — Relationship-Preserving
PSYCHOLOGICAL APPROACH: Empathy and goodwill. Signal desire to repair the relationship.
TECHNIQUES:
- Open by acknowledging the opposing party's perspective with genuine respect
- Express regret about the dispute reaching this stage (without admitting liability)
- Frame the offer as a gesture of good faith, not a legal calculation
- Emphasize shared history or future relationship potential
- Use collaborative language: "we believe," "together," "mutual resolution"
AVOID: Liability admissions. Do not appear weak — conciliatory ≠ capitulating`,
            };

            const prompt = PromptTemplate.fromTemplate(`
=== SETTLEMENT OFFER DRAFTING ENGINE ===

You are a senior litigation attorney drafting a formal settlement offer letter.

CASE FACTS:
{caseFacts}

OFFER AMOUNT: {offerAmount} (in the currency relevant to the case)

STRATEGIC TONE GUIDELINES:
{toneGuide}

=== DRAFTING RULES ===
1. Write ONLY the body of the letter (no "Subject:" header, no date, no address blocks — just the letter body starting from the salutation).
2. Length: 250-350 words. Concise but complete.
3. Structure: 
   - Salutation
   - Opening paragraph: Purpose of the letter
   - Middle paragraph(s): Key facts, strength of position (calibrated to tone), offer amount and rationale
   - Closing paragraph: Next steps, deadline if applicable, contact info placeholder
   - Sign-off
4. Embed the strategic techniques from the tone guidelines naturally — don't make them obvious.
5. Do NOT include placeholders in brackets except for: [Opposing Counsel Name], [Your Name], [Your Firm].
6. Write in formal but readable legal English.

Draft the letter now:
`);

            const chain = RunnableSequence.from([prompt, this.model, new StringOutputParser()]);

            return await chain.invoke({
                caseFacts,
                offerAmount: offerAmount.toLocaleString(),
                toneGuide: toneGuidelines[tone],
            });
        } catch (error: any) {
            console.error("Draft Offer Error:", error);
            return `Dear [Opposing Counsel Name],\n\nWe write without prejudice to propose a full and final settlement of this matter in the sum of ${offerAmount.toLocaleString()}.\n\nWe believe this offer reflects a fair resolution of the issues in dispute and we invite your client to give it serious consideration.\n\nThis offer remains open for acceptance for 14 days from the date of this letter.\n\nYours faithfully,\n[Your Name]\n[Your Firm]`;
        }
    }
}

export const settlementService = new SettlementService();
