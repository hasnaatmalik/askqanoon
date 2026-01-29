import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ragService } from "@/services/rag/rag.service";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const { question, history, useRomanUrdu, conversationId } = await req.json();

        if (!question) {
            return NextResponse.json({ error: "Question is required" }, { status: 400 });
        }

        // 1. Get answer from RAG
        const result = await ragService.query(question, history, useRomanUrdu);

        // 2. If user is logged in, save to database
        if (session?.user) {
            const userId = (session.user as any).id;

            // Find or create conversation
            let conversation;
            if (conversationId) {
                conversation = await prisma.conversation.findUnique({
                    where: { id: conversationId }
                });
            }

            if (!conversation) {
                conversation = await prisma.conversation.create({
                    data: {
                        userId,
                        title: question.substring(0, 50) + "...",
                    }
                });
            }

            // Save messages
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
                        metadata: result.sources as any,
                    }
                ]
            });

            // Add the real conversationId to result
            (result as any).conversationId = conversation.id;
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Chat API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
