
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, password } = body;

        if (!token || !password) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        const verificationToken = await prisma.verificationToken.findUnique({
            where: {
                token,
            },
        });

        if (!verificationToken) {
            return new NextResponse("Invalid token", { status: 400 });
        }

        const hasExpired = new Date(verificationToken.expires) < new Date();

        if (hasExpired) {
            return new NextResponse("Token expired", { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email: verificationToken.identifier,
            },
        });

        if (!existingUser) {
            return new NextResponse("User does not exist", { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await prisma.user.update({
            where: {
                id: existingUser.id,
            },
            data: {
                password: hashedPassword,
            },
        });

        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: verificationToken.identifier,
                    token: verificationToken.token,
                },
            },
        });

        return NextResponse.json({ message: "Password updated" });
    } catch (error) {
        console.error("[RESET_PASSWORD_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
