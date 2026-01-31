
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mockRights = [
    {
        title: "Right to Fair Trial",
        description: "Every citizen has the right to a fair trial and due process.",
        article: "Article 10-A",
        icon: "Gavan",
        details: "No person shall be detained without a trial. You have the right to a lawyer and to be informed of the charges against you immediately upon arrest."
    },
    {
        title: "Freedom of Speech",
        description: "Freedom of speech and expression for all citizens.",
        article: "Article 19",
        icon: "Message",
        details: "Every citizen shall have the right to freedom of speech and expression, and there shall be freedom of the press, subject to any reasonable restrictions imposed by law."
    },
    {
        title: "Privacy of Home",
        description: "The privacy of home is inviolable and protected.",
        article: "Article 14",
        icon: "Home",
        details: "The dignity of man and, subject to law, the privacy of home, shall be inviolable. No police officer can enter your home without a search warrant."
    },
    {
        title: "Protection Against Arrest",
        description: "Safeguards as to arrest and detention.",
        article: "Article 10",
        icon: "Lock",
        details: "No person who is arrested shall be detained in custody without being informed of the grounds for such arrest, nor shall he be denied the right to consult and be defended by a legal practitioner of his choice."
    },
    {
        title: "Freedom of Assembly",
        description: "The right to gather peacefully without arms.",
        article: "Article 16",
        icon: "Users",
        details: "Every citizen shall have the right to assemble peacefully and without arms, subject to any reasonable restrictions imposed by law in the interest of public order."
    },
    {
        title: "Equality of Citizens",
        description: "All citizens are equal before law.",
        article: "Article 25",
        icon: "Shield",
        details: "All citizens are equal before law and are entitled to equal protection of law. There shall be no discrimination on the basis of sex alone."
    }
];

async function main() {
    console.log('Seeding Rights...');
    for (const r of mockRights) {
        const exists = await prisma.right.findUnique({
            where: { article: r.article }
        });

        if (!exists) {
            await prisma.right.create({
                data: r
            });
            console.log(`Created: ${r.article}`);
        } else {
            console.log(`Skipped (Exists): ${r.article}`);
        }
    }
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
