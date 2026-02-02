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
    User,
    Scale,
    Lightbulb,
    Bomb,
    Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface DepositionSimulatorProps {
    onBack: () => void;
}

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
                body: JSON.stringify({
                    messages: [],
                    difficulty,
                    caseFacts
                }),
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setMessages([{ role: "assistant", content: data.question }]);
        } catch (err) {
            console.error(err);
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
                body: JSON.stringify({
                    messages: newMessages,
                    difficulty,
                    caseFacts
                }),
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

    if (!isStarted) {
        return (
            <div className="container mx-auto max-w-4xl px-4 py-24">
                <Button variant="ghost" onClick={onBack} className="mb-8 flex items-center gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    Back
                </Button>

                <div className="space-y-8">
                    <div className="text-center space-y-4">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10 text-secondary mb-6">
                            <Gavel className="h-8 w-8" />
                        </div>
                        <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground">
                            Witness <span className="text-secondary tracking-normal italic font-medium">Prep Simulator</span>
                        </h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto text-lg text-pretty">
                            Prepare for depositions with an AI-generated examiner. Practice maintaining consistency and handling pressure.
                        </p>
                    </div>

                    <Card className="p-8 border-2 border-secondary/10 shadow-xl">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Case Facts & Context</label>
                                <textarea
                                    className="w-full min-h-[200px] p-4 rounded-xl border-2 border-muted bg-white focus:border-secondary transition-all outline-none text-slate-700"
                                    placeholder="Paste witness statements, police reports, or case details here. This will be used to check your consistency..."
                                    value={caseFacts}
                                    onChange={(e) => setCaseFacts(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => setDifficulty("gentle")}
                                    className={`p-4 rounded-xl border-2 transition-all text-left flex flex-col gap-2 ${difficulty === "gentle" ? "border-green-500 bg-green-50" : "border-muted hover:border-green-200"}`}
                                >
                                    <Lightbulb className={`h-5 w-5 ${difficulty === "gentle" ? "text-green-600" : "text-muted-foreground"}`} />
                                    <div>
                                        <p className="font-bold">Gentle Prep</p>
                                        <p className="text-xs text-muted-foreground text-pretty">Supportive examiner with helpful coaching notes.</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setDifficulty("standard")}
                                    className={`p-4 rounded-xl border-2 transition-all text-left flex flex-col gap-2 ${difficulty === "standard" ? "border-secondary bg-secondary/5" : "border-muted hover:border-secondary/20"}`}
                                >
                                    <Scale className={`h-5 w-5 ${difficulty === "standard" ? "text-secondary" : "text-muted-foreground"}`} />
                                    <div>
                                        <p className="font-bold">Standard</p>
                                        <p className="text-xs text-muted-foreground text-pretty">Professional and firm opposing counsel experience.</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setDifficulty("aggressive")}
                                    className={`p-4 rounded-xl border-2 transition-all text-left flex flex-col gap-2 ${difficulty === "aggressive" ? "border-red-500 bg-red-50" : "border-muted hover:border-red-200"}`}
                                >
                                    <Bomb className={`h-5 w-5 ${difficulty === "aggressive" ? "text-red-600" : "text-muted-foreground"}`} />
                                    <div>
                                        <p className="font-bold text-red-700">Stress Test</p>
                                        <p className="text-xs text-muted-foreground text-pretty">Hostile examiner looking for small contradictions.</p>
                                    </div>
                                </button>
                            </div>

                            <Button
                                onClick={handleStart}
                                disabled={!caseFacts.trim() || loading}
                                className="w-full bg-secondary text-white hover:bg-secondary/90 h-14 text-lg rounded-xl shadow-lg shadow-secondary/20"
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
        <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="font-serif font-bold text-slate-800">Deposition Room</h2>
                        <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${difficulty === 'aggressive' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                Difficulty: {difficulty}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-400">Live Recording</span>
                        <span className="text-xs text-secondary font-mono">00:15:42</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsStarted(false)} className="text-xs">End Session</Button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 container mx-auto max-w-4xl"
            >
                <div className="flex justify-center mb-8">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 flex items-center gap-2 text-blue-700 text-xs">
                        <Info className="h-3 w-3" />
                        Witness is currently under oath. Statements are being checked for consistency.
                    </div>
                </div>

                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`max-w-[85%] space-y-2 ${msg.role === 'assistant' ? 'w-full' : ''}`}>
                            <div className={`flex items-center gap-2 mb-1 ${msg.role === "user" ? "flex-row-reverse text-right" : ""}`}>
                                {msg.role === "assistant" ? (
                                    <div className="h-6 w-6 rounded bg-slate-800 flex items-center justify-center text-[10px] text-white font-bold">EX</div>
                                ) : (
                                    <div className="h-6 w-6 rounded bg-secondary flex items-center justify-center text-[10px] text-white font-bold">WT</div>
                                )}
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    {msg.role === "assistant" ? "Examiner" : "Witness (You)"}
                                </span>
                            </div>

                            <div className={`p-5 rounded-2xl shadow-sm border ${msg.role === "user"
                                    ? "bg-secondary text-white border-secondary"
                                    : "bg-white border-slate-200 text-slate-700 font-serif leading-relaxed"
                                }`}>
                                {msg.content.split('\n').map((line, idx) => {
                                    if (line.includes("⚖️ [CONSISTENCY ALERT]")) {
                                        return (
                                            <div key={idx} className="mb-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 flex items-start gap-3">
                                                <AlertTriangle className="h-5 w-5 shrink-0" />
                                                <span className="font-sans font-bold text-sm tracking-tight">{line.replace("⚖️ [CONSISTENCY ALERT]", "").trim()}</span>
                                            </div>
                                        );
                                    }
                                    if (line.includes("[COACH NOTE]")) {
                                        return (
                                            <div key={idx} className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 flex items-start gap-3">
                                                <Lightbulb className="h-5 w-5 shrink-0" />
                                                <div className="text-sm">
                                                    <span className="font-bold block mb-1">Coach Note:</span>
                                                    <span className="font-sans leading-normal">{line.replace("[COACH NOTE]", "").trim()}</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return <p key={idx}>{line}</p>;
                                })}
                            </div>
                        </div>
                    </motion.div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="h-6 w-6 rounded bg-slate-800 flex items-center justify-center text-[10px] text-white font-bold">EX</div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Examiner is thinking...</span>
                            </div>
                            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white border-t border-slate-200 p-6 shadow-2xl">
                <div className="container mx-auto max-w-4xl flex gap-4">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="State your answer clearly..."
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        disabled={loading}
                        className="flex-1 h-14 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-secondary transition-all text-slate-800"
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={loading || !input.trim()}
                        size="icon"
                        className="h-14 w-14 rounded-xl bg-slate-800 hover:bg-slate-700 text-white shadow-lg"
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
                <div className="container mx-auto max-w-4xl mt-2 flex justify-between px-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Type "I don't recall" if you're unsure</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Press Enter to Submit</span>
                </div>
            </div>
        </div>
    );
}
