
import { ChatInterface } from "@/components/chat-interface";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ChatPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 flex flex-col p-4 md:p-8">
            <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        href="/dashboard"
                        className="flex items-center text-slate-600 hover:text-green-700 transition"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-xl font-bold font-serif text-slate-800 dark:text-gray-100">
                        Ask Qanoon <span className="text-green-600">AI</span>
                    </h1>
                </div>

                <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <ChatInterface />
                </div>
            </div>
        </div>
    );
}
