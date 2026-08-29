"use client";

import { Suspense } from "react";
import { ChatInterface } from "@/components/chat-interface";
import { useRouter, useSearchParams } from "next/navigation";

function ChatContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const initialQuestion = searchParams.get("q") || "";
    const initialLang = searchParams.get("lang") === "ur" ? "ur" : "en";

    return (
        <main className="flex flex-1 flex-col min-h-0 overflow-hidden bg-background">
            <ChatInterface 
                onBack={() => router.push("/")} 
                initialQuestion={initialQuestion}
                initialLang={initialLang}
            />
        </main>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center text-quiet">Loading chat...</div>}>
            <ChatContent />
        </Suspense>
    );
}
