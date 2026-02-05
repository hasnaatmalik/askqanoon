import { JurisdictionMatrix } from "@/components/compliance/JurisdictionMatrix";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CompliancePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 flex flex-col p-4 md:p-8">
            <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
                <div className="mb-8 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center text-slate-600 hover:text-indigo-700 transition"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Home
                    </Link>
                    <h1 className="text-xl font-bold font-serif text-slate-800 dark:text-gray-100">
                        AskQanoon <span className="text-indigo-600">Compliance</span>
                    </h1>
                </div>

                <div className="flex-1 space-y-6">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">
                            Multi-Jurisdiction Matrix
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                            Compare legal requirements across borders in real-time. Identify conflicts between GDPR, CCPA, PPC, and more using our AI analysis engine.
                        </p>
                    </div>

                    <JurisdictionMatrix />
                </div>
            </div>
        </div>
    );
}
