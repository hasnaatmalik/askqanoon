"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    Scale,
    User,
    Bot,
    ChevronLeft,
    Info,
    ExternalLink,
    Languages
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    sources?: { law: string; section: string; content: string }[];
}

export function ChatInterface({
    initialQuestion,
    onBack
}: {
    initialQuestion: string;
    onBack: () => void;
}) {
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", role: "user", content: initialQuestion },
        {
            id: "2",
            role: "assistant",
            content: "I am analyzing Pakistan's legal documents (PPC, CrPC) to provide you with the most accurate information. Please wait a moment...",
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [useRomanUrdu, setUseRomanUrdu] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const fetchResponse = async (question: string, currentMessages: Message[]) => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question,
                    useRomanUrdu,
                    history: currentMessages.map(m => ({ role: m.role, content: m.content }))
                }),
            });

            if (!response.ok) throw new Error("Failed to fetch response");

            const data = await response.json();

            const botResponse: Message = {
                id: Date.now().toString(),
                role: "assistant",
                content: data.answer,
                sources: data.sources
            };

            setMessages(prev => [...prev, botResponse]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: "assistant",
                content: "I apologize, but I encountered an error while retrieving that legal information. Please try again or check your connection."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (messages.length === 2 && messages[1].id === "2") {
            const timer = setTimeout(() => {
                setMessages([messages[0]]); // Clear placeholder
                fetchResponse(initialQuestion, [messages[0]]);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        const newMessage: Message = { id: Date.now().toString(), role: "user", content: input };
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        setInput("");
        fetchResponse(input, updatedMessages);
    };

    return (
        <div className="flex h-[calc(100vh-64px)] w-full flex-col bg-background pt-16">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-border/40 bg-background/80 px-4 py-3 backdrop-blur-md md:px-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-primary/5">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="font-serif text-lg font-bold leading-tight">AskQanoon Chat</h2>
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold font-sans">Gemini 3 Powered</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className={`gap-2 ${useRomanUrdu ? 'border-primary bg-primary/5 text-primary' : ''}`}
                        onClick={() => setUseRomanUrdu(!useRomanUrdu)}
                    >
                        <Languages className="h-4 w-4" />
                        <span className="hidden sm:inline">{useRomanUrdu ? "English" : "Roman Urdu"} Mode</span>
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 px-4 py-6 md:px-6">
                <div className="mx-auto max-w-3xl space-y-6">
                    <AnimatePresence initial={false}>
                        {messages.map((m) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                            >
                                <Avatar className={`mt-1 border-2 ${m.role === "assistant" ? "border-primary/20" : "border-secondary/20"}`}>
                                    <AvatarFallback className={m.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}>
                                        {m.role === "assistant" ? <Bot size={20} /> : <User size={20} />}
                                    </AvatarFallback>
                                </Avatar>
                                <div className={`flex max-w-[85%] flex-col gap-2 ${m.role === "user" ? "items-end" : "items-start"}`}>
                                    <div className={`rounded-2xl px-4 py-3 shadow-sm ${m.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                        : "bg-muted/50 border border-border/50 text-foreground rounded-tl-none"
                                        }`}>
                                        <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                                    </div>

                                    {m.sources && m.sources.length > 0 && (
                                        <div className="mt-2 space-y-2 w-full">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                <Info className="h-3 w-3" />
                                                Source Citations
                                            </div>
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                {m.sources.map((s, idx) => (
                                                    <Card key={idx} className="bg-background/50 border-emerald-500/20 p-3 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
                                                        <div>
                                                            <Badge variant="secondary" className="mb-1 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-0">
                                                                {s.law} Section {s.section}
                                                            </Badge>
                                                            <p className="text-[10px] text-muted-foreground line-clamp-2 italic italic italic italic">"{s.content}"</p>
                                                        </div>
                                                        <Button variant="link" size="sm" className="h-auto p-0 text-[10px] text-primary self-end flex items-center gap-1">
                                                            View Full Section <ExternalLink className="h-2 w-2" />
                                                        </Button>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex gap-4"
                            >
                                <Avatar className="mt-1 border-2 border-primary/20">
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        <Bot size={20} />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex h-10 items-center gap-1 rounded-2xl bg-muted/50 px-4">
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40" style={{ animationDelay: '0ms' }} />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40" style={{ animationDelay: '150ms' }} />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40" style={{ animationDelay: '300ms' }} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-border/40 bg-background/80 p-4 backdrop-blur-md">
                <div className="mx-auto max-w-3xl">
                    <div className="relative flex items-center gap-2">
                        <div className="relative flex-1 group">
                            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary/50 to-secondary/50 opacity-10 blur transition group-focus-within:opacity-30" />
                            <Input
                                placeholder="Type your follow-up legal question..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                className="relative h-12 rounded-xl border-border/50 bg-background pl-4 pr-12 focus-visible:ring-primary/20"
                            />
                            <Button
                                size="icon"
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className={`absolute right-1 top-1 h-10 w-10 rounded-lg bg-primary text-primary-foreground transition-all hover:scale-105 ${!input.trim() ? "opacity-50" : "shadow-lg shadow-primary/20"}`}
                            >
                                <Send className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                    <p className="mt-2 text-center text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        This is legal information, not legal advice.
                    </p>
                </div>
            </div>
        </div>
    );
}
