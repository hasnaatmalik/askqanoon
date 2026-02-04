import { SettlementAgent } from "@/components/negotiation/SettlementAgent";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NegotiationPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col p-4 md:p-8">
            <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
                <div className="mb-8 flex items-center justify-between">
                    <Link
                        href="/dashboard"
                        className="flex items-center text-slate-600 hover:text-slate-900 transition"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-xl font-bold font-serif text-slate-800 dark:text-gray-100">
                        AskQanoon <span className="text-slate-500">Negotiate</span>
                    </h1>
                </div>

                <div className="flex-1 space-y-8">
                    <div className="text-center space-y-2 mb-12">
                        <h2 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">
                            Settlement Intelligence Agent
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Optimize your negotiation outcomes with AI-driven strategy analysis, win probability modeling, and tone-calibrated drafting.
                        </p>
                    </div>

                    <SettlementAgent />
                </div>
            </div>
        </div>
    );
}
