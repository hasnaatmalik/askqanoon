
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking Prisma Client Keys...");
    const keys = Object.keys(prisma);
    console.log("Keys:", keys);

    if (prisma.right) {
        console.log("prisma.right exists!");
        const count = await prisma.right.count();
        console.log("Right count:", count);
    } else {
        console.error("prisma.right is MISSING");
        // Check for similar keys (case sensitivity?)
        const similar = keys.filter(k => k.toLowerCase().includes('right'));
        console.log("Similar keys:", similar);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
