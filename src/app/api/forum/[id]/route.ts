import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get single thread with replies
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const thread = await prisma.forumThread.findUnique({
            where: { id },
            include: {
                user: {
                    select: { name: true, image: true }
                },
                replies: {
                    orderBy: { createdAt: "asc" },
                    include: {
                        user: {
                            select: { name: true, image: true }
                        }
                    }
                }
            }
        });

        if (!thread) {
            return NextResponse.json({ error: "Thread not found" }, { status: 404 });
        }

        const formattedThread = {
            id: thread.id,
            title: thread.title,
            content: thread.content,
            author: thread.isAnonymous ? "Anonymous" : thread.authorName,
            authorImage: thread.isAnonymous ? null : thread.user?.image,
            role: thread.authorRole,
            category: thread.category,
            views: thread.views,
            createdAt: thread.createdAt.toISOString(),
            replies: thread.replies.map(reply => ({
                id: reply.id,
                content: reply.content,
                author: reply.isAnonymous ? "Anonymous" : reply.authorName,
                authorImage: reply.isAnonymous ? null : reply.user?.image,
                role: reply.authorRole,
                createdAt: reply.createdAt.toISOString()
            }))
        };

        return NextResponse.json(formattedThread);
    } catch (error) {
        console.error("Get thread error:", error);
        return NextResponse.json({ error: "Failed to fetch thread" }, { status: 500 });
    }
}

// PATCH - Increment view count
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.forumThread.update({
            where: { id },
            data: { views: { increment: 1 } }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update views error:", error);
        return NextResponse.json({ error: "Failed to update views" }, { status: 500 });
    }
}
