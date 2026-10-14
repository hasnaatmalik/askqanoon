import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockRights } from "@/data/rights/mock-rights";

export async function GET() {
    try {
        const rights = await prisma.right.findMany({ orderBy: { article: "asc" }, take: 50 });
        if (rights.length > 0) return NextResponse.json({ rights });
    } catch (error) {
        console.error("Rights fetch error (using built-in list):", error);
    }
    // Database empty or unavailable: serve the built-in constitutional rights so the page never breaks.
    return NextResponse.json({ rights: mockRights });
}
