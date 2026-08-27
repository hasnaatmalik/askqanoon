"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Gavel,
    ChevronLeft,
    Send,
    Loader2,
    AlertTriangle,
    Scale,
    Lightbulb,
    Bomb,
    Info,
    RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface DepositionSimulatorProps {
    onBack: () => void;
}

const difficultyConfig = {
    gentle: {
        icon: Lightbulb,
        label: "Gentle Prep",
        desc: "Supportive examiner with coaching notes after each answer.",
        activeClass: "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/10",
        iconClass: "text-emerald-600 dark:text-emerald-400",
        badgeClass: "bg-emerald-500 animate-pulse",
        badgeLabel: "Supportive Mode",
    },
    standard: {
        icon: Scale,
        label: "Standard",
        desc: "Professional and firm opposing counsel — realistic courtroom experience.",
        activeClass: "border-primary bg-primary/10",
        iconClass: "text-primary",
        badgeClass: "bg-amber-500",
        badgeLabel: "Standard Mode",
    },
    aggressive: {
        icon: Bomb,
        label: "Stress Test",
        desc: "Hostile examiner looking for contradictions. Prepare for the worst.",
        activeClass: "border-red-500 bg-red-500/10 dark:bg-red-500/10",
        iconClass: "text-red-500 dark:text-red-400",
        badgeClass: "bg-red-500 animate-pulse",
        badgeLabel: "Stress Test Mode",
    },
};

export function DepositionSimulator({ onBack }: DepositionSimulatorProps) {
    const [caseFacts, setCaseFacts] = useState("");
    const [isStarted, setIsStarted] = useState(false);
    const [difficulty, setDifficulty] = useState<"gentle" | "standard" | "aggressive">("standard");
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleStart = async () => {
        if (!caseFacts.trim()) return;
        setLoading(true);
        setIsStarted(true);
        try {
            const response = await fetch("/api/deposition", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [], difficulty, caseFacts }),
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setMessages([{ role: "assistant", content: data.question }]);
        } catch (err) {
            console.error(err);
            setIsStarted(false);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = { role: "user" as const, content: input };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput("");
        setLoading(true);
        try {
            const response = await fetch("/api/deposition", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages, difficulty, caseFacts }),
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setMessages([...newMessages, { role: "assistant", content: data.question }]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setIsStarted(false);
        setMessages([]);
        setInput("");
    };

    const config = difficultyConfig[difficulty];

    if (!isStarted) {
        return (
            <div className="container mx-auto max-w-4xl px-4 py-16">
                <Button variant="ghost" onClick={onBack} className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="h-4 w-4" />
                    Back
                </Button>

                <div className="space-y-8">
                    <div className="text-center space-y-4">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
                            <Gavel className="h-8 w-8" />
                        </div>
                        <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground">
                            Witness <span className="text-primary tracking-normal italic font-medium">Prep Simulator</span>
                        </h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto text-lg text-pretty">
                            Prepare for depositions with an AI-powered examiner. Practice maintaining consistency and handling pressure under oath.
                        </p>
                    </div>

                    <Card className="border-2 border-border shadow-xl bg-card">
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                    Case Facts &amp; Context
                                </label>
                                <textarea
                                    className="w-full min-h-[200px] p-4 rounded-xl border-2 border-border bg-background text-foreground focus:border-primary transition-all outline-none resize-none placeholder:text-muted-foreground"
                                    placeholder="Paste witness statements, police reports, or case details here. The AI examiner will use this to check your consistency during the deposition..."
                                    value={caseFacts}
                                    onChange={(e) => setCaseFacts(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Tip: The more detailed your case facts, the more realistic and challenging the simulation.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Examiner Difficulty</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {(Object.entries(difficultyConfig) as [keyof typeof difficultyConfig, typeof difficultyConfig["gentle"]][]).map(([key, cfg]) => {
                                        const Icon = cfg.icon;
                                        const isSelected = difficulty === key;
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => setDifficulty(key)}
                                                className={`p-4 rounded-xl border-2 transition-all text-left flex flex-col gap-2 ${isSelected ? cfg.activeClass : "border-border hover:border-border/80 bg-card"}`}
                                            >
                                                <Icon className={`h-5 w-5 ${isSelected ? cfg.iconClass : "text-muted-foreground"}`} />
                                                <div>
                                                    <p className={`font-bold text-foreground`}>{cfg.label}</p>
                                                    <p className="text-xs text-muted-foreground text-pretty">{cfg.desc}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <Button
                                onClick={handleStart}
                                disabled={!caseFacts.trim() || loading}
                                className="w-full h-14 text-lg rounded-xl shadow-lg"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Start Mock Deposition"}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
            {/* Header */}
            <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack} className="text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="font-serif font-bold text-foreground">Deposition Room</h2>
                        <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${config.badgeClass}`} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                {config.badgeLabel}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={handleReset} className="text-xs flex items-center gap-1">
                        <RotateCcw className="h-3 w-3" />
                        New Session
                    </Button>
                </div>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 container mx-auto max-w-4xl">
                <div className="flex justify-center mb-6">
                    <div className="bg-muted border border-border rounded-lg px-4 py-2 flex items-center gap-2 text-muted-foreground text-xs">
                        <Info className="h-3 w-3" />
                        Witness is under oath. All statements are being checked for consistency against the case record.
                    </div>
                </div>

                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-[85%] space-y-2 ${msg.role === "assistant" ? "w-full" : ""}`}>
                                <div className={`flex items-center gap-2 mb-1 ${msg.role === "user" ? "flex-row-reverse text-right" : ""}`}>
                                    {msg.role === "assistant" ? (
                                        <div className="h-6 w-6 rounded bg-foreground flex items-center justify-center text-[10px] text-background font-bold">EX</div>
                                    ) : (
                                        <div className="h-6 w-6 rounded bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-bold">WT</div>
                                    )}
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        {msg.role === "assistant" ? "Examiner" : "Witness (You)"}
                                    </span>
                                </div>

                                <div className={`p-5 rounded-2xl shadow-sm border ${msg.role === "user"
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-card border-border text-foreground font-serif leading-relaxed"
                                    }`}>
                                    {msg.content.split('\n').map((line, idx) => {
                                        if (line.includes("⚖️ [CONSISTENCY ALERT]")) {
                                            return (
                                                <div key={idx} className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-start gap-3">
                                                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                                                    <span className="font-sans font-bold text-sm tracking-tight">{line.replace("⚖️ [CONSISTENCY ALERT]", "").trim()}</span>
                                                </div>
                                            );
                                        }
                                        if (line.includes("[COACH NOTE]")) {
                                            return (
                                                <div key={idx} className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-start gap-3">
                                                    <Lightbulb className="h-5 w-5 shrink-0 mt-0.5" />
                                                    <div className="text-sm font-sans">
                                                        <span className="font-bold block mb-1">Coach Note:</span>
                                                        <span className="leading-normal">{line.replace("[COACH NOTE]", "").trim()}</span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return line ? <p key={idx} className="mb-1">{line}</p> : <br key={idx} />;
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <div className="flex justify-start">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="h-6 w-6 rounded bg-foreground flex items-center justify-center text-[10px] text-background font-bold">EX</div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Examiner is formulating...</span>
                            </div>
                            <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex gap-1">
                                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="bg-card border-t border-border p-6 shadow-2xl">
                <div className="container mx-auto max-w-4xl flex gap-4">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="State your answer clearly and precisely..."
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                        disabled={loading}
                        className="flex-1 h-14 rounded-xl border-2 border-border bg-background focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={loading || !input.trim()}
                        size="icon"
                        className="h-14 w-14 rounded-xl bg-foreground hover:bg-foreground/90 text-background shadow-lg"
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
                <div className="container mx-auto max-w-4xl mt-2 flex justify-between px-2">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Say "I don't recall" if uncertain</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Enter to Submit</span>
                </div>
            </div>
        </div>
    );
}
