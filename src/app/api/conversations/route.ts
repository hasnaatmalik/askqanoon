import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;

        const conversations = await prisma.conversation.findMany({
            where: { userId },
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                title: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(conversations);
    } catch (error) {
        console.error("Fetch Conversations Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
