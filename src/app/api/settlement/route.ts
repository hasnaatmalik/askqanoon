import { NextRequest, NextResponse } from "next/server";
import { settlementService } from "@/services/negotiation/settlement.service";

export async function POST(req: NextRequest) {
    try {
        const { action, caseFacts, opponentHistory, offerAmount, tone } = await req.json();

        if (action === "analyze") {
            if (!caseFacts) return NextResponse.json({ error: "Case facts required" }, { status: 400 });
            if (typeof caseFacts !== "string" || caseFacts.length > 6_000) {
                return NextResponse.json({ error: "Please keep the case description under 6,000 characters." }, { status: 400 });
            }
            try {
                const result = await settlementService.analyzeCase(caseFacts, opponentHistory || "No history provided.");
                return NextResponse.json(result);
            } catch {
                return NextResponse.json({ error: "We couldn't analyze this case right now. Please try again." }, { status: 502 });
            }
        }

        if (action === "draft") {
            if (!caseFacts || !offerAmount || !tone) return NextResponse.json({ error: "Missing draft parameters" }, { status: 400 });
            const draft = await settlementService.draftOffer(caseFacts, offerAmount, tone);
            return NextResponse.json({ draft });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Settlement API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
