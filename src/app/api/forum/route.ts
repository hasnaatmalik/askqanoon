import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - List all threads with pagination and filtering
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const where = category ? { category } : {};

        const [threads, total] = await Promise.all([
            prisma.forumThread.findMany({
                where,
                orderBy: { updatedAt: "desc" },
                skip,
                take: limit,
                include: {
                    _count: {
                        select: { replies: true }
                    },
                    user: {
                        select: { name: true, image: true }
                    }
                }
            }),
            prisma.forumThread.count({ where })
        ]);

        // Transform to match frontend interface
        const formattedThreads = threads.map(thread => ({
            id: thread.id,
            title: thread.title,
            content: thread.content,
            author: thread.isAnonymous ? "Anonymous" : thread.authorName,
            authorImage: thread.isAnonymous ? null : thread.user?.image,
            role: thread.authorRole,
            replies: thread._count.replies,
            views: thread.views,
            category: thread.category,
            lastActive: getRelativeTime(thread.updatedAt),
            preview: thread.content.substring(0, 150) + (thread.content.length > 150 ? "..." : ""),
            createdAt: thread.createdAt.toISOString()
        }));

        return NextResponse.json({
            threads: formattedThreads,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Forum list error:", error);
        return NextResponse.json({ error: "Failed to fetch threads" }, { status: 500 });
    }
}

// POST - Create new thread
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title, content, category, role, isAnonymous } = await req.json();

        if (!title || !content || !category || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const userId = (session.user as any).id;
        const userName = session.user.name || "User";

        const thread = await prisma.forumThread.create({
            data: {
                title,
                content,
                category,
                authorId: userId,
                authorName: isAnonymous ? "Anonymous" : userName,
                authorRole: role,
                isAnonymous: isAnonymous || false
            }
        });

        return NextResponse.json({
            success: true,
            thread: {
                id: thread.id,
                title: thread.title,
                category: thread.category
            }
        });
    } catch (error) {
        console.error("Create thread error:", error);
        return NextResponse.json({ error: "Failed to create thread" }, { status: 500 });
    }
}

// Helper function for relative time
function getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
}
