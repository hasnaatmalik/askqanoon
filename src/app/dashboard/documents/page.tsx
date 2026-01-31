import DocumentGenerator from "@/components/documents/document-generator";

export default function DocumentsPage() {
    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Legal Document Generator</h1>
                    <p className="text-muted-foreground mt-1">Select a template and fill in the details to generate instant drafts.</p>
                </div>
            </div>
            <div className="flex-1">
                <DocumentGenerator />
            </div>
        </div>
    );
}
