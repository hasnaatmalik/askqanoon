import { NextRequest, NextResponse } from "next/server";
import { ragService } from "@/services/rag/rag.service";

export async function POST(req: NextRequest) {
    try {
        const { topic, jurisdictions } = await req.json();

        if (!topic || !jurisdictions || !Array.isArray(jurisdictions)) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const result = await ragService.compareRegulations(topic, jurisdictions);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Compliance API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
