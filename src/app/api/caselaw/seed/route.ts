import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Mock cases to seed
const mockCases = [
    {
        title: "Sughran Bibi vs. The State",
        citation: "PLD 2018 SC 595",
        court: "Supreme Court",
        date: "2018-05-12",
        year: 2018,
        topic: "Criminal Law",
        summary: "Supreme Court redefined 'Life Imprisonment' in Pakistan, clarifying that it means imprisonment for the remaining natural life of the convict, subject to statutory minimums.",
        tags: "Murder, Life Imprisonment, Sentencing",
        sourceUrl: "https://www.supremecourt.gov.pk/downloads_judgements/C.P._26_L_2011.pdf"
    },
    {
        title: "Asma Jahangir vs. Federation of Pakistan",
        citation: "2013 SCMR 102",
        court: "Supreme Court",
        date: "2013-09-20",
        year: 2013,
        topic: "Constitutional Law",
        summary: "Landmark judgment regarding the right to fair trial and military courts, emphasizing due process under Article 10-A.",
        tags: "Human Rights, Fair Trial, Military Courts",
        sourceUrl: "https://www.supremecourt.gov.pk/downloads_judgements/Const.P.19_2011.pdf"
    },
    {
        title: "Khurshid Ahmed vs. Financial Institution",
        citation: "2024 CLD 156",
        court: "Lahore High Court",
        date: "2024-01-15",
        year: 2024,
        topic: "Banking Law",
        summary: "Clarification on the recovery verification process for defaulted loans under the new Financial Institutions Recovery Ordinance.",
        tags: "Banking, Recovery, Loan Default",
        sourceUrl: "https://lhc.gov.pk/judgments"
    },
    {
        title: "Mst. Fatima vs. Ahmed Ali",
        citation: "2022 YLR 450",
        court: "Sindh High Court",
        date: "2022-03-10",
        year: 2022,
        topic: "Family Law",
        summary: "Detailed judgment on Khula and the return of Haq Mehr. The court ruled that a wife is entitled to Khula if she cannot live within the limits prescribed by Allah.",
        tags: "Divorce, Khula, Haq Mehr",
        sourceUrl: "https://caselaw.shc.gov.pk/caselaw/"
    },
    {
        title: "Digital Rights Foundation vs. PTA",
        citation: "PLD 2021 IHC 201",
        court: "Islamabad High Court",
        date: "2021-11-05",
        year: 2021,
        topic: "Cyber Law",
        summary: "Judgment regarding the blocking of social media apps. The court emphasized the need for transparency and adherence to PECA rules before banning platforms.",
        tags: "PECA, Social Media, Freedom of Speech",
        sourceUrl: "https://mis.ihc.gov.pk/judgments"
    },
    {
        title: "Punjab vs. Ahmed Khan",
        citation: "2023 PCrLJ 1245",
        court: "Lahore High Court",
        date: "2023-06-20",
        year: 2023,
        topic: "Criminal Law",
        summary: "Bail granted in murder case due to lack of direct evidence and delay in trial. Established precedent for bail in delayed trials.",
        tags: "Bail, Murder, Evidence",
        sourceUrl: "https://lhc.gov.pk/judgments"
    },
    {
        title: "Workers Union vs. Textile Mills",
        citation: "2022 MLD 890",
        court: "Sindh High Court",
        date: "2022-08-14",
        year: 2022,
        topic: "Labor Law",
        summary: "Workers entitled to full benefits including EOBI and Social Security. Employer cannot deny benefits based on contract employment status beyond 6 months.",
        tags: "Labor Rights, EOBI, Social Security",
        sourceUrl: "https://caselaw.shc.gov.pk/"
    },
    {
        title: "Land Revenue Board vs. Malik Estate",
        citation: "2021 CLC 456",
        court: "Peshawar High Court",
        date: "2021-04-10",
        year: 2021,
        topic: "Property Law",
        summary: "Mutation cannot be challenged after 6 months without strong evidence of fraud. Established limitation for challenging land records.",
        tags: "Land Revenue, Mutation, Property",
        sourceUrl: "https://peshawarhighcourt.gov.pk/"
    }
];

// POST - Seed database with mock cases
export async function POST() {
    try {
        let created = 0;
        let skipped = 0;

        for (const caseData of mockCases) {
            try {
                await prisma.caseLaw.create({
                    data: {
                        ...caseData,
                        date: new Date(caseData.date)
                    }
                });
                created++;
            } catch (error: any) {
                if (error.code === 'P2002') {
                    skipped++;
                } else {
                    throw error;
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Seeded ${created} cases, skipped ${skipped} existing`
        });
    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json({ error: "Failed to seed cases" }, { status: 500 });
    }
}
