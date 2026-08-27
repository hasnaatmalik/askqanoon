"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
    Send,
    User,
    Bot,
    ChevronLeft,
    Info,
    Languages,
    Plus,
    MessageSquare,
    PanelLeftClose,
    PanelLeftOpen,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { VoiceInput } from "@/components/voice-input";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    sources?: { id: number; law: string; section: string; excerpt: string }[];
}

interface Conversation {
    id: string;
    title: string;
    updatedAt: string;
}

export function ChatInterface({
    initialQuestion = "",
    onBack,
}: {
    initialQuestion?: string;
    onBack?: () => void;
} = {}) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [useRomanUrdu, setUseRomanUrdu] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [history, setHistory] = useState<Conversation[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const hasFetchedInitialRef = useRef(false);

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

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
            setMessages(data.messages.map((m: { id: string; role: "user" | "assistant"; content: string; metadata: Message["sources"] }) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                sources: Array.isArray(m.metadata) ? m.metadata.map((source) => ({
                    id: source.id ?? 0,
                    law: source.law,
                    section: source.section,
                    excerpt: source.excerpt ?? (source as unknown as { content?: string }).content ?? "",
                })) : undefined,
            })));
            setConversationId(id);
            setIsSidebarOpen(false);
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
        setIsSidebarOpen(false);
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

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.error || "Unable to get an answer right now.");
            }

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
                content: error instanceof Error ? `I couldn’t complete that request: ${error.message}` : "I couldn’t complete that request. Please try again."
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
        <div className="flex h-[calc(100dvh-4rem)] min-h-0 w-full overflow-hidden bg-background">
            {/* Sidebar */}
            <AnimatePresence mode="wait">
                {isSidebarOpen && session && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="absolute inset-y-0 left-0 z-20 flex h-full w-[min(18rem,85vw)] flex-col border-r border-border/40 bg-background shadow-xl md:relative md:w-[17.5rem] md:shadow-none"
                    >
                        <div className="p-4">
                            <Button
                                onClick={startNewChat}
                                className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20"
                                variant="ghost"
                            >
                                <Plus className="h-4 w-4" />
                                New chat
                            </Button>
                        </div>
                        <ScrollArea className="flex-1 px-4">
                            <div className="space-y-2 py-2">
                                <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                    Recent chats
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
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-border/40 bg-background/95 px-4 py-3 md:px-6">
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
                        {onBack && (
                            <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-primary/5" aria-label="Back to home">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        )}
                        <div>
                            <h2 className="font-serif text-lg font-bold leading-tight">Ask Qanoon</h2>
                            <div className="flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Grounded legal information</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex">
                            <VoiceInput
                                onTranscript={(text) => setInput(text)}
                                language={useRomanUrdu ? "ur-PK" : "en-US"}
                                size="sm"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className={`gap-2 ${useRomanUrdu ? 'border-primary bg-primary/5 text-primary' : ''}`}
                            onClick={() => setUseRomanUrdu(!useRomanUrdu)}
                        >
                            <Languages className="h-4 w-4" />
                            <span className="hidden sm:inline">{useRomanUrdu ? "Roman Urdu" : "English"}</span>
                        </Button>
                    </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="min-h-0 flex-1 px-4 py-6 md:px-6">
                    <div className="mx-auto max-w-3xl space-y-6 pb-4">
                        {messages.length === 0 && !isLoading && (
                            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles className="h-5 w-5" /></div>
                                <h3 className="font-serif text-2xl font-bold">What can I help you understand?</h3>
                                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Ask about the legal texts in our database. I’ll cite the exact sources used and tell you when the database cannot verify an answer.</p>
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {["How do I file an FIR?", "What does PPC section 420 cover?", "Mujhe bail ke bare mein maloomat chahiye"].map((suggestion) => (
                                        <Button key={suggestion} variant="outline" size="sm" className="h-auto whitespace-normal text-left" onClick={() => { setInput(suggestion); }}>
                                            {suggestion}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
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
                                            {m.role === "assistant" ? (
                                                <div className="text-sm leading-relaxed">
                                                    <ReactMarkdown 
                                                        components={{
                                                            p: (props) => <p className="mb-3 last:mb-0" {...props} />,
                                                            strong: (props) => <strong className="font-semibold text-emerald-700 dark:text-emerald-400" {...props} />,
                                                            ul: (props) => <ul className="mb-3 list-disc space-y-1 pl-5" {...props} />,
                                                            ol: (props) => <ol className="mb-3 list-decimal space-y-1 pl-5" {...props} />,
                                                            li: (props) => <li className="pl-1" {...props} />
                                                        }}
                                                    >
                                                        {m.content}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                                            )}
                                        </div>

                                        {m.sources && m.sources.length > 0 && (
                                            <div className="mt-2 w-full space-y-3 rounded-xl bg-muted/30 p-4 border border-border/40">
                                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                    <Info className="h-3 w-3 text-emerald-500" />
                                                    Sources used for this answer
                                                </div>
                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    {m.sources.map((s, idx) => (
                                                        <Card key={idx} className="flex flex-col gap-2 border-emerald-500/20 bg-background/60 p-3 shadow-sm transition-colors hover:border-emerald-500/40 hover:bg-background/80">
                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                <Badge variant="secondary" className="border-0 bg-emerald-500/10 text-[10px] text-emerald-700 hover:bg-emerald-500/20">
                                                                    {s.law}
                                                                </Badge>
                                                                {s.section && s.section !== "N/A" && (
                                                                    <Badge variant="outline" className="text-[10px] border-emerald-500/20 text-muted-foreground">
                                                                        Sec {s.section}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="line-clamp-3 text-xs italic leading-relaxed text-muted-foreground relative">
                                                                <span className="absolute -left-1 -top-1 text-lg font-serif text-emerald-500/30">&ldquo;</span>
                                                                <span className="pl-2">{s.excerpt}</span>
                                                                <span className="absolute -bottom-2 text-lg font-serif text-emerald-500/30">&rdquo;</span>
                                                            </p>
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
                        <div ref={endOfMessagesRef} />
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="shrink-0 border-t border-border/40 bg-background/95 p-4">
                    <div className="mx-auto max-w-3xl">
                        <div className="relative flex items-center gap-2">
                            <VoiceInput
                                onTranscript={(text) => setInput(text)}
                                language={useRomanUrdu ? "ur-PK" : "en-US"}
                                size="lg"
                                className="sm:hidden"
                            />
                            <div className="group relative flex-1">
                                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary/50 to-secondary/50 opacity-10 blur transition group-focus-within:opacity-30" />
                                <Input
                                placeholder={useRomanUrdu ? "Roman Urdu mein apna legal sawal likhein…" : "Ask a legal question about Pakistan…"}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
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
                            Legal information only · Sources are shown with each answer
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
