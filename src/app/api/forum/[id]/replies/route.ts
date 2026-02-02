import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get replies for a thread
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const replies = await prisma.forumReply.findMany({
            where: { threadId: id },
            orderBy: { createdAt: "asc" },
            include: {
                user: {
                    select: { name: true, image: true }
                }
            }
        });

        const formattedReplies = replies.map(reply => ({
            id: reply.id,
            content: reply.content,
            author: reply.isAnonymous ? "Anonymous" : reply.authorName,
            authorImage: reply.isAnonymous ? null : reply.user?.image,
            role: reply.authorRole,
            createdAt: reply.createdAt.toISOString()
        }));

        return NextResponse.json({ replies: formattedReplies });
    } catch (error) {
        console.error("Get replies error:", error);
        return NextResponse.json({ error: "Failed to fetch replies" }, { status: 500 });
    }
}

// POST - Add reply to thread
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: threadId } = await params;
        const { content, role, isAnonymous } = await req.json();

        if (!content || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check thread exists
        const thread = await prisma.forumThread.findUnique({
            where: { id: threadId }
        });

        if (!thread) {
            return NextResponse.json({ error: "Thread not found" }, { status: 404 });
        }

        const userId = (session.user as any).id;
        const userName = session.user.name || "User";

        const reply = await prisma.forumReply.create({
            data: {
                content,
                threadId,
                authorId: userId,
                authorName: isAnonymous ? "Anonymous" : userName,
                authorRole: role,
                isAnonymous: isAnonymous || false
            }
        });

        // Update thread updatedAt
        await prisma.forumThread.update({
            where: { id: threadId },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json({
            success: true,
            reply: {
                id: reply.id,
                content: reply.content,
                author: isAnonymous ? "Anonymous" : userName,
                role: reply.authorRole,
                createdAt: reply.createdAt.toISOString()
            }
        });
    } catch (error) {
        console.error("Create reply error:", error);
        return NextResponse.json({ error: "Failed to create reply" }, { status: 500 });
    }
}
