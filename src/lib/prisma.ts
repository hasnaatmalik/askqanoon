import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const libsql = createClient({
    url: process.env.DATABASE_URL || "file:./dev.db",
});

const adapter = new PrismaLibSql(libsql as any); // Using any to bypass strict type mismatch in this dev phase if needed, but trying to fix fundamentally.

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
        log: ["query"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
