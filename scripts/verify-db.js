
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Connecting to DB...");
        const userCount = await prisma.user.count();
        console.log(`Connection successful. User count: ${userCount}`);
    } catch (error) {
        console.error("DB Connection failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
