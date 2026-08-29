"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
    Send,
    User,
    Bot,
    ChevronLeft,
    RotateCcw,
    Scale
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VoiceInput } from "@/components/voice-input";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    sources?: { id: number; law: string; section: string; excerpt: string }[];
}

export function ChatInterface({
    initialQuestion = "",
    initialLang = "en",
    onBack,
}: {
    initialQuestion?: string;
    initialLang?: "en" | "ur";
    onBack?: () => void;
} = {}) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [useRomanUrdu, setUseRomanUrdu] = useState(initialLang === "ur");
    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const hasFetchedInitialRef = useRef(false);

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const fetchResponse = async (question: string, currentMessages: Message[]) => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question,
                    useRomanUrdu,
                    history: currentMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content }))
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.error || "Unable to get an answer right now.");
            }

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
                content: error instanceof Error
                    ? `⚠️ ${error.message}`
                    : "⚠️ Something went wrong. Please try again."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (initialQuestion && !hasFetchedInitialRef.current) {
            hasFetchedInitialRef.current = true;
            const userMsg: Message = { id: "1", role: "user", content: initialQuestion };
            setMessages([userMsg]);
            fetchResponse(initialQuestion, [userMsg]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialQuestion]);

    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        const newMessage: Message = { id: Date.now().toString(), role: "user", content: input };
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        setInput("");
        fetchResponse(input, updatedMessages);
    };

    const handleReset = () => {
        setMessages([]);
        setInput("");
        hasFetchedInitialRef.current = false;
    };

    const SUGGESTIONS = [
        "How do I file an FIR?",
        "Mujhe bail ke bare mein maloomat chahiye",
        "What are tenant rights in Punjab?",
        "What does PPC section 420 cover?"
    ];

    return (
        <div className="relative flex flex-1 min-h-0 w-full flex-col bg-background">
            {/* ─── Chat Header ─── */}
            <div className="absolute top-0 z-10 flex w-full shrink-0 items-center justify-between border-b border-line/40 bg-background/80 px-4 py-3 backdrop-blur-md md:px-6">
                <div className="flex items-center gap-2">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-quiet transition-colors hover:bg-panel hover:text-ink"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                    )}
                    {!onBack && (
                        <div className="flex items-center gap-2 font-display font-semibold text-ink">
                            <Scale className="h-5 w-5 text-primary" />
                            <span>AskQanoon</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex rounded-full border border-line bg-card p-0.5 text-xs font-medium shadow-sm">
                        <button
                            type="button"
                            onClick={() => setUseRomanUrdu(false)}
                            className={`rounded-full px-3 py-1 transition-colors ${!useRomanUrdu ? "bg-ink text-background" : "text-quiet hover:text-ink"}`}
                        >
                            EN
                        </button>
                        <button
                            type="button"
                            onClick={() => setUseRomanUrdu(true)}
                            className={`rounded-full px-3 py-1 transition-colors ${useRomanUrdu ? "bg-ink text-background" : "text-quiet hover:text-ink"}`}
                        >
                            UR
                        </button>
                    </div>
                    {messages.length > 0 && (
                        <button
                            onClick={handleReset}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-quiet transition-colors hover:bg-panel hover:text-ink"
                            title="Clear chat"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* ─── Messages Area ─── */}
            <ScrollArea className="flex-1 px-4 pt-20 pb-32 md:px-8">
                <div className="mx-auto max-w-3xl pb-4">
                    {messages.length === 0 && !isLoading && (
                        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Scale className="h-8 w-8" />
                            </div>
                            <h3 className="font-display text-3xl font-semibold text-ink">
                                What can I help you understand?
                            </h3>
                            <p className="mt-3 max-w-md text-base leading-relaxed text-quiet">
                                Ask about Pakistani law in plain English or Roman Urdu. I&apos;ll cite the exact legal sources used in every answer.
                            </p>
                            
                            <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setInput(s)}
                                        className="rounded-2xl border border-line bg-card p-4 text-left text-[14px] leading-relaxed text-ink shadow-sm transition-all hover:border-primary/40 hover:bg-panel"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-8">
                        <AnimatePresence initial={false}>
                            {messages.map((m) => (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                                >
                                    <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.role === "assistant" ? "bg-primary text-primary-foreground shadow-sm" : "bg-panel text-quiet border border-line"}`}>
                                        {m.role === "assistant" ? <Bot size={16} /> : <User size={14} />}
                                    </div>

                                    <div className={`flex max-w-[85%] flex-col gap-2 ${m.role === "user" ? "items-end" : "items-start"}`}>
                                        <div className={`rounded-3xl px-6 py-4 shadow-sm ${m.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                                            : "bg-card border border-line text-ink rounded-tl-sm"
                                            }`}>
                                            {m.role === "assistant" ? (
                                                <div className="text-[15px] leading-relaxed">
                                                    <ReactMarkdown
                                                        components={{
                                                            p: (props) => <p className="mb-4 last:mb-0" {...props} />,
                                                            strong: (props) => <strong className="font-semibold text-primary" {...props} />,
                                                            ul: (props) => <ul className="mb-4 list-disc space-y-2 pl-5" {...props} />,
                                                            ol: (props) => <ol className="mb-4 list-decimal space-y-2 pl-5" {...props} />,
                                                            li: (props) => <li className="pl-1" {...props} />,
                                                            code: (props) => <code className="rounded bg-panel px-1.5 py-0.5 text-[13px] font-mono border border-line" {...props} />,
                                                        }}
                                                    >
                                                        {m.content}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{m.content}</p>
                                            )}
                                        </div>

                                        {/* Sources - Polished statute cards */}
                                        {m.sources && m.sources.length > 0 && (
                                            <div className="mt-2 w-full max-w-full space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-px flex-1 bg-line/50" />
                                                    <p className="eyebrow text-quiet">Sources cited in this answer</p>
                                                    <div className="h-px flex-1 bg-line/50" />
                                                </div>
                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    {m.sources.map((s, idx) => (
                                                        <div key={idx} className="rounded-2xl border border-line bg-card p-4 shadow-sm transition-colors hover:border-primary/40">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="rounded bg-panel px-2 py-1 text-[10px] font-bold tracking-widest text-primary uppercase">
                                                                    S{idx + 1}
                                                                </span>
                                                                {s.section && s.section !== "N/A" && (
                                                                    <span className="text-[11px] font-semibold text-quiet uppercase tracking-wider">
                                                                        Section {s.section}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="mt-3 text-sm font-semibold text-ink line-clamp-1">{s.law}</p>
                                                            <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-quiet italic">
                                                                &ldquo;{s.excerpt}&rdquo;
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-4"
                                >
                                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                                        <Bot size={16} />
                                    </div>
                                    <div className="flex items-center gap-1.5 rounded-3xl rounded-tl-sm border border-line bg-card px-6 py-5 shadow-sm">
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: "0ms" }} />
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: "160ms" }} />
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: "320ms" }} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div ref={endOfMessagesRef} />
                </div>
            </ScrollArea>

            {/* ─── Floating Input Area ─── */}
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-background via-background to-transparent pb-6 pt-10 px-4 md:px-6">
                <div className="mx-auto max-w-3xl">
                    <div className="flex items-center gap-2 rounded-full border border-line bg-card p-2 shadow-sm transition-all focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
                        <VoiceInput
                            onTranscript={(text) => setInput(text)}
                            language={useRomanUrdu ? "ur-PK" : "en-US"}
                            className="shrink-0 rounded-full"
                        />
                        <input
                            type="text"
                            placeholder={useRomanUrdu
                                ? "Roman Urdu mein apna sawal puchiye..."
                                : "Ask your legal question..."
                            }
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            className="flex-1 bg-transparent px-3 text-[15px] outline-none placeholder:text-quiet"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all
                                ${!input.trim() || isLoading
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:scale-105 shadow-sm"
                                }`}
                        >
                            <Send className="h-4 w-4 ml-0.5" />
                        </button>
                    </div>
                    <p className="mt-3 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-quiet">
                        AskQanoon can make mistakes. Check important info.
                    </p>
                </div>
            </div>
        </div>
    );
}
