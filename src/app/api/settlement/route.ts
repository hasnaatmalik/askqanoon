import { NextRequest, NextResponse } from "next/server";
import { settlementService } from "@/services/negotiation/settlement.service";

export async function POST(req: NextRequest) {
    try {
        const { action, caseFacts, opponentHistory, offerAmount, tone } = await req.json();

        if (action === "analyze") {
            if (!caseFacts) return NextResponse.json({ error: "Case facts required" }, { status: 400 });
            const result = await settlementService.analyzeCase(caseFacts, opponentHistory || "No history provided.");
            return NextResponse.json(result);
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
