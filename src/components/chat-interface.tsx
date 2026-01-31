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
    Languages,
    History,
    Plus,
    MessageSquare,
    PanelLeftClose,
    PanelLeftOpen,
    Mic
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    sources?: { law: string; section: string; content: string }[];
}

interface Conversation {
    id: string;
    title: string;
    updatedAt: string;
}

export function ChatInterface({
    initialQuestion,
    onBack
}: {
    initialQuestion: string;
    onBack: () => void;
}) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [useRomanUrdu, setUseRomanUrdu] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [history, setHistory] = useState<Conversation[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const hasFetchedInitialRef = useRef(false);

    // Fetch conversation history
    const fetchHistory = async () => {
        if (!session) return;
        try {
            const res = await fetch("/api/conversations");
            const data = await res.json();
            if (Array.isArray(data)) setHistory(data);
        } catch (e) {
            console.error("History fetch error:", e);
        }
    };

    useEffect(() => {
        if (session) fetchHistory();
    }, [session]);

    const loadConversation = async (id: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/conversations/${id}`);
            const data = await res.json();
            setMessages(data.messages.map((m: any) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                sources: m.metadata
            })));
            setConversationId(id);
        } catch (e) {
            console.error("Load conversation error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const startNewChat = () => {
        setMessages([]);
        setConversationId(null);
        setInput("");
        hasFetchedInitialRef.current = false;
    };

    const fetchResponse = async (question: string, currentMessages: Message[]) => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question,
                    useRomanUrdu,
                    conversationId,
                    history: currentMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content }))
                }),
            });

            if (!response.ok) throw new Error("Failed to fetch response");

            const data = await response.json();

            if (data.conversationId && !conversationId) {
                setConversationId(data.conversationId);
                fetchHistory(); // Refresh sidebar
            }

            const botResponse: Message = {
                id: Date.now().toString(),
                role: "assistant",
                content: data.answer,
                sources: data.sources
            };

            setMessages(prev => [...prev.filter(m => m.id !== "loading"), botResponse]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev.filter(m => m.id !== "loading"), {
                id: Date.now().toString(),
                role: "assistant",
                content: "I apologize, but I encountered an error. Please try again."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (initialQuestion && !hasFetchedInitialRef.current && !isLoading) {
            hasFetchedInitialRef.current = true;
            const userMsg: Message = { id: "1", role: "user", content: initialQuestion };
            setMessages([userMsg]);
            fetchResponse(initialQuestion, [userMsg]);
        }
    }, [initialQuestion, isLoading]);

    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        const newMessage: Message = { id: Date.now().toString(), role: "user", content: input };
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        setInput("");
        fetchResponse(input, updatedMessages);
    };

    return (
        <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-background pt-16">
            {/* Sidebar */}
            <AnimatePresence mode="wait">
                {isSidebarOpen && session && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="flex h-full flex-col border-r border-border/40 bg-muted/20"
                    >
                        <div className="p-4">
                            <Button
                                onClick={startNewChat}
                                className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20"
                                variant="ghost"
                            >
                                <Plus className="h-4 w-4" />
                                New Consultation
                            </Button>
                        </div>
                        <ScrollArea className="flex-1 px-4">
                            <div className="space-y-2 py-2">
                                <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                    Recent Consultations
                                </p>
                                {history.map((chat) => (
                                    <button
                                        key={chat.id}
                                        onClick={() => loadConversation(chat.id)}
                                        className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all hover:bg-muted ${conversationId === chat.id ? "bg-muted ring-1 ring-primary/20" : ""
                                            }`}
                                    >
                                        <MessageSquare className={`h-4 w-4 shrink-0 ${conversationId === chat.id ? "text-primary" : "text-muted-foreground"}`} />
                                        <div className="overflow-hidden">
                                            <p className="truncate text-sm font-medium">{chat.title}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {new Date(chat.updatedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <div className="relative flex flex-1 flex-col overflow-hidden">
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-border/40 bg-background/80 px-4 py-3 backdrop-blur-md md:px-6">
                    <div className="flex items-center gap-3">
                        {session && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="text-muted-foreground hover:bg-primary/5"
                            >
                                {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-primary/5">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h2 className="font-serif text-lg font-bold leading-tight">Consultation</h2>
                            <div className="flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Live Database</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 hidden sm:flex text-muted-foreground hover:text-primary"
                            onClick={() => alert("Voice input coming soon!")}
                        >
                            <Mic className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className={`gap-2 ${useRomanUrdu ? 'border-primary bg-primary/5 text-primary' : ''}`}
                            onClick={() => setUseRomanUrdu(!useRomanUrdu)}
                        >
                            <Languages className="h-4 w-4" />
                            <span className="hidden sm:inline">{useRomanUrdu ? "English" : "Roman Urdu"}</span>
                        </Button>
                    </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 px-4 py-6 md:px-6">
                    <div className="mx-auto max-w-3xl space-y-6 pb-4">
                        <AnimatePresence initial={false}>
                            {messages.map((m) => (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                                >
                                    <Avatar className={`mt-1 h-9 w-9 border-2 ${m.role === "assistant" ? "border-primary/20" : "border-secondary/20"}`}>
                                        <AvatarFallback className={m.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}>
                                            {m.role === "assistant" ? <Bot size={18} /> : <User size={18} />}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={`flex max-w-[85%] flex-col gap-2 ${m.role === "user" ? "items-end" : "items-start"}`}>
                                        <div className={`rounded-2xl px-4 py-3 shadow-sm ${m.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-muted/50 border border-border/50 text-foreground rounded-tl-none"
                                            }`}>
                                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                                        </div>

                                        {m.sources && m.sources.length > 0 && (
                                            <div className="mt-2 w-full space-y-2">
                                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                    <Info className="h-3 w-3" />
                                                    Legal Sources
                                                </div>
                                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                    {m.sources.map((s, idx) => (
                                                        <Card key={idx} className="flex flex-col justify-between border-emerald-500/20 bg-background/50 p-3 transition-colors hover:border-emerald-500/40">
                                                            <div>
                                                                <Badge variant="secondary" className="mb-1 border-0 bg-emerald-500/10 text-[10px] text-emerald-700 hover:bg-emerald-500/20">
                                                                    {s.law}
                                                                </Badge>
                                                                <p className="line-clamp-2 text-[10px] italic text-muted-foreground">"{s.content}"</p>
                                                            </div>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                                    <Avatar className="mt-1 h-9 w-9 border-2 border-primary/20">
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                            <Bot size={18} />
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
                            <div className="group relative flex-1">
                                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary/50 to-secondary/50 opacity-10 blur transition group-focus-within:opacity-30" />
                                <Input
                                    placeholder="Ask your legal question..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    className="relative h-12 rounded-xl border-border/50 bg-background pl-4 pr-12 text-sm focus-visible:ring-primary/20"
                                />
                                <Button
                                    size="icon"
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className={`absolute right-1 top-1 h-10 w-10 rounded-lg bg-primary text-primary-foreground transition-all hover:scale-105 ${!input.trim() || isLoading ? "opacity-50" : "shadow-lg shadow-primary/20"}`}
                                >
                                    <Send className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                        <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Legal Information Only • Not Advice
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
