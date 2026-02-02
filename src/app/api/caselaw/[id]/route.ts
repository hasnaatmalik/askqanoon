import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get single case law details
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const caseLaw = await prisma.caseLaw.findUnique({
            where: { id }
        });

        if (!caseLaw) {
            return NextResponse.json({ error: "Case not found" }, { status: 404 });
        }

        return NextResponse.json({
            id: caseLaw.id,
            title: caseLaw.title,
            citation: caseLaw.citation,
            court: caseLaw.court,
            date: caseLaw.date.toISOString().split('T')[0],
            year: caseLaw.year,
            topic: caseLaw.topic,
            summary: caseLaw.summary,
            tags: caseLaw.tags.split(',').map(t => t.trim()),
            sourceUrl: caseLaw.sourceUrl
        });
    } catch (error) {
        console.error("Get case error:", error);
        return NextResponse.json({ error: "Failed to fetch case" }, { status: 500 });
    }
}
