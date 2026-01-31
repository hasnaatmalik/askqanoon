
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET(req: NextRequest) {
    try {
        const prisma = new PrismaClient();
        const rights = await prisma.right.findMany({
            orderBy: { article: 'asc' },
            take: 50
        });
        await prisma.$disconnect();

        return NextResponse.json({ rights });
    } catch (error: any) {
        console.error("Rights Fetch Error:", error);
        // Write to file to debug
        const fs = require('fs');
        const path = require('path');
        fs.writeFileSync(path.join(process.cwd(), 'public', 'rights-error.txt'), JSON.stringify({ message: error.message, stack: error.stack }, null, 2));

        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
