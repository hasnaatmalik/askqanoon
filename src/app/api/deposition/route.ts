import { NextRequest, NextResponse } from "next/server";
import { depositionService } from "@/services/legal/deposition.service";

export async function POST(req: NextRequest) {
    try {
        const { messages, difficulty, caseFacts } = await req.json();

        if (!caseFacts) {
            return NextResponse.json({ error: "Case facts are required to start simulation" }, { status: 400 });
        }

        const nextQuestion = await depositionService.generateNextQuestion({
            messages,
            difficulty: difficulty || "standard",
            caseFacts
        });

        return NextResponse.json({ question: nextQuestion });
    } catch (error: any) {
        console.error("Deposition API error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
