
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, name } = body;

        if (!email || !password || !name) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            return new NextResponse("User already exists", { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        // const verificationToken = await generateVerificationToken(email);
        // await sendVerificationEmail(verificationToken.identifier, verificationToken.token);

        return NextResponse.json(user);
    } catch (error) {
        console.error("[REGISTER_ERROR]", error);
        return new NextResponse((error as Error).message || "Internal Error", { status: 500 });
    }
}
