
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mockCases = [
    {
        title: "Sughran Bibi vs. The State",
        citation: "PLD 2018 SC 595",
        court: "Supreme Court",
        date: new Date("2018-05-12"),
        year: 2018,
        topic: "Criminal Law",
        summary: "Supreme Court redefined 'Life Imprisonment' in Pakistan, clarifying that it means imprisonment for the remaining natural life of the convict, subject to statutory minimums.",
        tags: "Murder,Life Imprisonment,Sentencing",
        sourceUrl: "https://www.supremecourt.gov.pk/downloads_judgements/C.P._26_L_2011.pdf"
    },
    {
        title: "Asma Jahangir vs. Federation of Pakistan",
        citation: "2013 SCMR 102",
        court: "Supreme Court",
        date: new Date("2013-09-20"),
        year: 2013,
        topic: "Constitutional Law",
        summary: "Landmark judgment regarding the right to fair trial and military courts, emphasizing due process under Article 10-A.",
        tags: "Human Rights,Fair Trial,Military Courts",
        sourceUrl: "https://www.supremecourt.gov.pk/downloads_judgements/Const.P.19_2011.pdf"
    },
    {
        title: "Khurshid Ahmed vs. Financial Institution",
        citation: "2024 CLD 156",
        court: "Lahore High Court",
        date: new Date("2024-01-15"),
        year: 2024,
        topic: "Banking Law",
        summary: "Clarification on the recovery verification process for defaulted loans under the new Financial Institutions Recovery Ordinance.",
        tags: "Banking,Recovery,Loan Default",
        sourceUrl: "https://lhc.gov.pk/judgments"
    },
    {
        title: "Mst. Fatima vs. Ahmed Ali",
        citation: "2022 YLR 450",
        court: "Sindh High Court",
        date: new Date("2022-03-10"),
        year: 2022,
        topic: "Family Law",
        summary: "Detailed judgment on Khula and the return of Haq Mehr. The court ruled that a wife is entitled to Khula if she cannot live within the limits prescribed by Allah.",
        tags: "Divorce,Khula,Haq Mehr",
        sourceUrl: "https://caselaw.shc.gov.pk/caselaw/"
    },
    {
        title: "Digital Rights Foundation vs. PTA",
        citation: "PLD 2021 IHC 201",
        court: "Islamabad High Court",
        date: new Date("2021-11-05"),
        year: 2021,
        topic: "Cyber Law",
        summary: "Judgment regarding the blocking of social media apps. The court emphasized the need for transparency and adherence to PECA rules before banning platforms.",
        tags: "PECA,Social Media,Freedom of Speech",
        sourceUrl: "https://mis.ihc.gov.pk/judgments"
    }
];

async function main() {
    console.log('Seeding Case Laws...');
    for (const c of mockCases) {
        const exists = await prisma.caseLaw.findUnique({
            where: { citation: c.citation }
        });

        if (!exists) {
            await prisma.caseLaw.create({
                data: c
            });
            console.log(`Created: ${c.citation}`);
        } else {
            console.log(`Skipped (Exists): ${c.citation}`);
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
