
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return new NextResponse("Missing email", { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            // Check if user exists but doesn't have password (Google Auth)
            // But for security, we usually just say "If email exists, we sent a link"
            return NextResponse.json({ message: "Reset email sent" });
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

        // We need a model to store verification tokens. Schema has VerificationToken.
        // It has identifier, token, expires. Identifier can be email.

        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires,
            },
        });

        await sendPasswordResetEmail(email, token);

        return NextResponse.json({ message: "Reset email sent" });
    } catch (error) {
        console.error("[FORGOT_PASSWORD_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
