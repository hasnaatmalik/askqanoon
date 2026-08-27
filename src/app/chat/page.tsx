
import { ChatInterface } from "@/components/chat-interface";
import { Navbar } from "@/components/navbar";

export default function ChatPage() {
    return (
        <main className="h-[100dvh] overflow-hidden bg-background pt-16">
            <Navbar />
            <ChatInterface />
        </main>
    );
}
