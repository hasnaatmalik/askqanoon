
import { NextResponse } from "next/server";
// Avoid top-level import of @/lib/prisma to prevent crash on load
// import { prisma } from "@/lib/prisma"; 
import { PrismaClient } from "@prisma/client";

export async function GET() {
    try {
        console.log("Test DB Route Started");

        // Try local instantiation
        const prisma = new PrismaClient();
        console.log("Prisma Client Instantiated");

        const userCount = await prisma.user.count();
        console.log("User Count:", userCount);

        await prisma.$disconnect();

        return NextResponse.json({ status: "success", userCount });
    } catch (error: any) {
        console.error("Test DB Error (Local):", error);
        return NextResponse.json({ status: "error", message: error.message, stack: error.stack }, { status: 500 });
    }
}
