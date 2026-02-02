
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Search and list case laws with filters
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || searchParams.get("term") || "";
        const court = searchParams.get("court");
        const year = searchParams.get("year");
        const topic = searchParams.get("topic");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        if (query) {
            where.OR = [
                { title: { contains: query } },
                { citation: { contains: query } },
                { summary: { contains: query } },
                { tags: { contains: query } }
            ];
        }

        if (court && court !== "all") {
            where.court = court;
        }

        if (topic && topic !== "all") {
            where.topic = topic;
        }

        if (year) {
            where.year = parseInt(year);
        }

        const [cases, total] = await Promise.all([
            prisma.caseLaw.findMany({
                where,
                orderBy: { date: "desc" },
                skip,
                take: limit
            }),
            prisma.caseLaw.count({ where })
        ]);

        // Format for frontend
        const formattedCases = cases.map(c => ({
            id: c.id,
            title: c.title,
            citation: c.citation,
            court: c.court,
            date: c.date.toISOString().split('T')[0],
            year: c.year,
            topic: c.topic,
            summary: c.summary,
            tags: c.tags.split(',').map(t => t.trim()),
            sourceUrl: c.sourceUrl
        }));

        return NextResponse.json({
            cases: formattedCases,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Case law search error:", error);
        return NextResponse.json({ error: "Failed to search cases" }, { status: 500 });
    }
}

// POST - Add new case law
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, citation, court, date, year, topic, summary, tags, sourceUrl } = body;

        if (!title || !citation || !court || !date || !year || !topic || !summary) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const caseLaw = await prisma.caseLaw.create({
            data: {
                title,
                citation,
                court,
                date: new Date(date),
                year,
                topic,
                summary,
                tags: Array.isArray(tags) ? tags.join(', ') : tags || "",
                sourceUrl
            }
        });

        return NextResponse.json({ success: true, case: caseLaw });
    } catch (error: any) {
        console.error("Create case law error:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Citation already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create case" }, { status: 500 });
    }
}

