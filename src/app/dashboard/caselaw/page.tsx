import CaseSearch from "@/components/caselaw/case-search";

export default function CaseLawPage() {
    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Case Law Search</h1>
                    <p className="text-muted-foreground mt-1">Search through our database of Pakistani judgments and legal precedents.</p>
                </div>
            </div>
            <div className="flex-1">
                <CaseSearch />
            </div>
        </div>
    );
}
