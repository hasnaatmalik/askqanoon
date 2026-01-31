
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Deleting all verification tokens...");
        await prisma.verificationToken.deleteMany();

        console.log("Deleting all users...");
        await prisma.user.deleteMany();

        console.log("✅ Database cleaned (Users and Tokens removed).");
    } catch (error) {
        console.error("❌ Error deleting data:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
