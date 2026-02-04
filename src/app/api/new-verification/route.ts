
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token } = body;

        console.log("Verifying token:", token);

        if (!token) {
            return new NextResponse("Missing token", { status: 400 });
        }

        const existingToken = await prisma.verificationToken.findFirst({
            where: { token }
        });

        if (!existingToken) {
            return new NextResponse("Token does not exist", { status: 400 });
        }

        const hasExpired = new Date(existingToken.expires) < new Date();

        if (hasExpired) {
            return new NextResponse("Token has expired", { status: 400 });
        }

        const existingUser = await prisma.user.findFirst({
            where: { email: existingToken.identifier }
        });

        if (!existingUser) {
            return new NextResponse("Email does not exist", { status: 400 });
        }

        await prisma.user.update({
            where: { id: existingUser.id },
            data: {
                emailVerified: new Date(),
                email: existingToken.identifier // Update email in case user changed it (if we supported that flow)
            }
        });

        await prisma.verificationToken.deleteMany({
            where: {
                token: existingToken.token,
                identifier: existingToken.identifier
            }
        });

        return new NextResponse("Email verified", { status: 200 });

    } catch (error) {
        console.error("[VERIFICATION_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
