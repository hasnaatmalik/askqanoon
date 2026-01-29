import { NextRequest, NextResponse } from "next/server";
import { ragService } from "@/services/rag/rag.service";

export async function POST(req: NextRequest) {
    try {
        const { question, history, useRomanUrdu } = await req.json();

        if (!question) {
            return NextResponse.json({ error: "Question is required" }, { status: 400 });
        }

        // Call the real RAG service
        const result = await ragService.query(question, history, useRomanUrdu);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Chat API error:", error);

        // Check for missing API keys to provide better error messages
        if (error.message?.includes("API_KEY")) {
            return NextResponse.json(
                { error: "Configuration error: Missing API keys in .env" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
