import { JurisdictionMatrix } from "@/components/compliance/JurisdictionMatrix";
import { PageShell, PageIntro } from "@/components/page-shell";

export const metadata = { title: "Compliance matrix — AskQanoon" };

export default function CompliancePage() {
    return (
        <PageShell>
            <PageIntro eyebrow="Compliance matrix" title="Compare legal requirements across jurisdictions">
                Pick two or more jurisdictions and a topic to see where the rules overlap, conflict, or leave gaps.
            </PageIntro>
            <div className="py-10">
                <JurisdictionMatrix />
            </div>
        </PageShell>
    );
}
