
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET(req: NextRequest) {
    try {
        const prisma = new PrismaClient();
        const { searchParams } = new URL(req.url);
        const term = searchParams.get("term") || "";
        const court = searchParams.get("court") || "all";
        const topic = searchParams.get("topic") || "all";

        const where: any = {};

        if (term) {
            where.OR = [
                { title: { contains: term, mode: "insensitive" } }, // SQLite is case-insensitive by default for ASCII but explicit is fine
                { citation: { contains: term, mode: "insensitive" } },
                { summary: { contains: term, mode: "insensitive" } },
                { tags: { contains: term, mode: "insensitive" } }
            ];
        }

        if (court && court !== "all") {
            where.court = court;
        }

        if (topic && topic !== "all") {
            where.topic = topic;
        }

        const cases = await prisma.caseLaw.findMany({
            where,
            orderBy: { date: 'desc' },
            take: 50
        });
        await prisma.$disconnect();

        // Parse tags if stored as string
        const formattedCases = cases.map(c => ({
            ...c,
            tags: c.tags.split(',').map(t => t.trim()),
            // Ensure dates are strings for JSON serialization if needed, though Next handles it
            date: c.date.toISOString().split('T')[0]
        }));

        return NextResponse.json({ cases: formattedCases });

    } catch (error) {
        console.error("Case Law Search Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
