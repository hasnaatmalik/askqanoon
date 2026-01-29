import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { question, history, useRomanUrdu } = await req.json();

        // In a real implementation, this would call RAGService.query()
        // For now, we return a structured mock response

        // Simulate some delay for AI reasoning
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const mockResponse = {
            answer: useRomanUrdu
                ? "Pakistan ke qanoon ke mutabiq, bailable offenses wo hain jisme zamant haqq ke taur par mangi ja sakti hai. CrPC Section 496 is bare mein wazahat karta hai."
                : "Under Pakistani law, bailable offenses are those where bail can be claimed as a matter of right. Section 496 of the Code of Criminal Procedure (CrPC) provides the legal basis for this.",
            sources: [
                {
                    law: "Code of Criminal Procedure (CrPC)",
                    section: "496",
                    content: "In what cases bail to be taken. When any person other than a person accused of a non-bailable offence is arrested or detained without warrant by an officer in charge of a police-station..."
                },
                {
                    law: "Pakistan Penal Code (PPC)",
                    section: "Introductory",
                    content: "The Code defines various offenses and classifies them into bailable and non-bailable categories in its schedules."
                }
            ]
        };

        return NextResponse.json(mockResponse);
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
