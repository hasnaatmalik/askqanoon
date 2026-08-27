import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ragService } from "@/services/rag/rag.service";
import { isChatTurn } from "@/lib/chat";

type SessionUser = { id?: string };

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const body: unknown = await req.json();
        if (!body || typeof body !== "object") {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }
        const { question, history, useRomanUrdu, conversationId } = body as Record<string, unknown>;

        if (typeof question !== "string" || !question.trim()) {
            return NextResponse.json({ error: "A question is required" }, { status: 400 });
        }
        if (question.length > 2_000) return NextResponse.json({ error: "Please keep questions under 2,000 characters." }, { status: 400 });
        const safeHistory = Array.isArray(history) ? history.filter(isChatTurn).slice(-6) : [];
        const safeConversationId = typeof conversationId === "string" ? conversationId : undefined;

        // 1. Get answer from RAG — this is the critical path
        const result = await ragService.query(question, safeHistory, useRomanUrdu === true);

        // 2. If user is logged in, save to database
        // FIX: Isolated in its own try/catch — a DB failure will NOT break the response
        let savedConversationId: string | undefined;
        if (session?.user) {
            try {
                const userId = (session.user as SessionUser).id;
                if (!userId) throw new Error("Session is missing a user id");

                // Find or create conversation
                let conversation;
                if (safeConversationId) {
                    conversation = await prisma.conversation.findFirst({
                        where: { id: safeConversationId, userId }
                    });
                }

                if (!conversation) {
                    conversation = await prisma.conversation.create({
                        data: {
                            userId,
                            title: question.substring(0, 50) + (question.length > 50 ? "..." : ""),
                        }
                    });
                }

                // Save user message and AI response
                await prisma.message.createMany({
                    data: [
                        {
                            conversationId: conversation.id,
                            role: "user",
                            content: question,
                        },
                        {
                            conversationId: conversation.id,
                            role: "assistant",
                            content: result.answer,
                            metadata: JSON.parse(JSON.stringify(result.sources)),
                        }
                    ]
                });

                // createMany does not update the parent timestamp in SQLite.
                await prisma.conversation.update({ where: { id: conversation.id }, data: {} });
                savedConversationId = conversation.id;
            } catch (dbError) {
                // Log the DB error but still return the AI answer to the user
                console.error("Chat DB Save Error (non-fatal):", dbError);
            }
        }

        return NextResponse.json({ ...result, conversationId: savedConversationId });
    } catch (error: unknown) {
        console.error("Chat API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
