"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
    AlertTriangle,
    ArrowUp,
    Check,
    ChevronLeft,
    Copy,
    Phone,
    RotateCcw,
    Scale,
    SquarePen,
} from "lucide-react";
import { VoiceInput } from "@/components/voice-input";
import { MAX_QUESTION_LENGTH, STARTER_TOPICS } from "@/data/starter-questions";
import type { LegalSource } from "@/lib/chat";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    sources?: LegalSource[];
    followUps?: string[];
    grounded?: boolean;
    error?: boolean;
}

const LOADING_STAGES = [
    "Understanding your question…",
    "Searching the statute books…",
    "Reading the relevant sections…",
    "Writing your answer…",
];

let messageCounter = 0;
const nextId = () => `m${Date.now()}-${messageCounter++}`;

/** Turn "[S2]" tags into markdown links the renderer shows as tappable chips. */
function linkCitations(content: string) {
    return content.replace(/\[S(\d+)\]/g, "[S$1](#cite-$1)");
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
    const [stage, setStage] = useState(0);
    const [useRomanUrdu, setUseRomanUrdu] = useState(initialLang === "ur");
    const [activeTopic, setActiveTopic] = useState(STARTER_TOPICS[0].id);
    const [highlight, setHighlight] = useState<{ messageId: string; sourceId: number } | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const hasFetchedInitialRef = useRef(false);
    const conversationIdRef = useRef<string | undefined>(undefined);
    const messagesRef = useRef<Message[]>([]);
    messagesRef.current = messages;

    const lang = useRomanUrdu ? "ur" : "en";

    // Keep the newest message in view.
    useEffect(() => {
        const el = scrollRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }, [messages, isLoading]);

    // Cycle the status line while waiting, so the wait feels purposeful.
    useEffect(() => {
        if (!isLoading) return;
        setStage(0);
        const timer = setInterval(() => setStage((s) => Math.min(s + 1, LOADING_STAGES.length - 1)), 1600);
        return () => clearInterval(timer);
    }, [isLoading]);

    // Auto-grow the textarea up to ~6 lines.
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
    }, [input]);

    const fetchResponse = useCallback(
        async (question: string, history: Message[]) => {
            setIsLoading(true);
            try {
                const response = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        question,
                        useRomanUrdu,
                        conversationId: conversationIdRef.current,
                        history: history
                            .filter((m) => !m.error)
                            .map((m) => ({ role: m.role, content: m.content })),
                    }),
                });

                if (!response.ok) {
                    const data = await response.json().catch(() => null);
                    throw new Error(data?.error || "Unable to get an answer right now.");
                }

                const data = await response.json();
                if (data.conversationId) conversationIdRef.current = data.conversationId;

                setMessages((prev) => [
                    ...prev,
                    {
                        id: nextId(),
                        role: "assistant",
                        content: data.answer,
                        sources: data.sources ?? [],
                        followUps: data.followUps ?? [],
                        grounded: data.grounded !== false,
                    },
                ]);
            } catch (error) {
                console.error("Chat error:", error);
                setMessages((prev) => [
                    ...prev,
                    {
                        id: nextId(),
                        role: "assistant",
                        error: true,
                        content: error instanceof Error ? error.message : "Something went wrong. Please try again.",
                    },
                ]);
            } finally {
                setIsLoading(false);
            }
        },
        [useRomanUrdu]
    );

    const ask = useCallback(
        (question: string) => {
            const text = question.trim().slice(0, MAX_QUESTION_LENGTH);
            if (!text || isLoading) return;
            const history = messagesRef.current;
            setMessages([...history, { id: nextId(), role: "user", content: text }]);
            setInput("");
            fetchResponse(text, history);
        },
        [fetchResponse, isLoading]
    );

    useEffect(() => {
        if (initialQuestion && !hasFetchedInitialRef.current) {
            hasFetchedInitialRef.current = true;
            ask(initialQuestion);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialQuestion]);

    const retry = () => {
        const current = messagesRef.current;
        const lastUserIndex = current.map((m) => m.role).lastIndexOf("user");
        if (lastUserIndex === -1 || isLoading) return;
        const question = current[lastUserIndex].content;
        const history = current.slice(0, lastUserIndex);
        setMessages(current.slice(0, lastUserIndex + 1));
        fetchResponse(question, history);
    };

    const handleReset = () => {
        setMessages([]);
        setInput("");
        conversationIdRef.current = undefined;
        textareaRef.current?.focus();
    };

    const jumpToSource = (messageId: string, sourceId: number) => {
        setHighlight({ messageId, sourceId });
        document
            .getElementById(`${messageId}-source-${sourceId}`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => setHighlight(null), 2200);
    };

    const topic = STARTER_TOPICS.find((t) => t.id === activeTopic) ?? STARTER_TOPICS[0];
    const lastAssistantId = useMemo(
        () => [...messages].reverse().find((m) => m.role === "assistant")?.id,
        [messages]
    );
    const isEmpty = messages.length === 0 && !isLoading;
    const nearLimit = input.length > MAX_QUESTION_LENGTH * 0.8;

    return (
        <div className="flex h-full min-h-0 w-full flex-1 flex-col bg-background">
            {/* ─── Header ─── */}
            <header className="shrink-0 border-b border-line bg-background/95 backdrop-blur">
                <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4">
                    <div className="flex items-center gap-1">
                        {onBack && (
                            <button
                                onClick={onBack}
                                aria-label="Back to home"
                                className="flex h-9 items-center gap-1 rounded-full px-2.5 text-sm font-medium text-quiet transition-colors hover:bg-panel hover:text-ink"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Home</span>
                            </button>
                        )}
                        <span className="ml-1 font-display text-lg font-semibold tracking-tight">
                            Ask<span className="text-primary">Qanoon</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div
                            role="group"
                            aria-label="Answer language"
                            className="flex rounded-full border border-line bg-card p-0.5 text-xs font-medium"
                        >
                            {(["en", "ur"] as const).map((l) => (
                                <button
                                    key={l}
                                    type="button"
                                    aria-pressed={lang === l}
                                    onClick={() => setUseRomanUrdu(l === "ur")}
                                    className={`rounded-full px-3 py-1.5 transition-colors ${lang === l ? "bg-ink text-background" : "text-quiet hover:text-ink"}`}
                                >
                                    {l === "en" ? "English" : "Roman Urdu"}
                                </button>
                            ))}
                        </div>
                        {messages.length > 0 && (
                            <button
                                onClick={handleReset}
                                className="flex h-9 items-center gap-1.5 rounded-full border border-line bg-card px-3 text-xs font-medium text-ink transition-colors hover:border-primary hover:text-primary"
                            >
                                <SquarePen className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">New chat</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* ─── Messages ─── */}
            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto max-w-3xl px-4 py-8">
                    {isEmpty && (
                        <div className="py-6 sm:py-12">
                            <div className="text-center">
                                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Scale className="h-7 w-7" />
                                </div>
                                <h1 className="text-balance font-display text-3xl font-semibold text-ink sm:text-4xl">
                                    {lang === "ur" ? "Aap kya jaanna chahte hain?" : "What would you like to understand?"}
                                </h1>
                                <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-quiet">
                                    {lang === "ur"
                                        ? "Apna sawal aam zubaan mein likhein. Har jawab ke saath qanoon ka hawala milega."
                                        : "Ask in your own words. Every answer shows the exact law it came from."}
                                </p>
                            </div>

                            <p className="eyebrow mt-10 text-center">
                                {lang === "ur" ? "Mauzoo chunein" : "Pick a situation"}
                            </p>
                            <div className="mt-3 flex flex-wrap justify-center gap-2" role="tablist">
                                {STARTER_TOPICS.map((t) => (
                                    <button
                                        key={t.id}
                                        role="tab"
                                        aria-selected={t.id === activeTopic}
                                        onClick={() => setActiveTopic(t.id)}
                                        className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                                            t.id === activeTopic
                                                ? "border-ink bg-ink text-background"
                                                : "border-line bg-card text-quiet hover:border-primary hover:text-primary"
                                        }`}
                                    >
                                        {t.label[lang]}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                                {topic.questions.map((q) => (
                                    <button
                                        key={q.en}
                                        onClick={() => ask(q[lang])}
                                        className="group flex items-start justify-between gap-3 rounded-2xl border border-line bg-card p-4 text-left text-[15px] leading-snug text-ink transition-colors hover:border-primary"
                                    >
                                        <span>{q[lang]}</span>
                                        <ArrowUp className="mt-0.5 h-4 w-4 shrink-0 rotate-45 text-quiet transition-colors group-hover:text-primary" />
                                    </button>
                                ))}
                            </div>
                            <p className="mt-6 text-center text-sm text-quiet">
                                {lang === "ur"
                                    ? "Ya neeche apna sawal khud likhein."
                                    : "Or type your own question below."}
                            </p>
                        </div>
                    )}

                    <div className="space-y-7">
                        <AnimatePresence initial={false}>
                            {messages.map((m) =>
                                m.role === "user" ? (
                                    <motion.div
                                        key={m.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.18 }}
                                        className="flex justify-end"
                                    >
                                        <p className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-tr-md bg-primary px-5 py-3 text-[15px] leading-relaxed text-primary-foreground">
                                            {m.content}
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key={m.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.18 }}
                                    >
                                        <AssistantMessage
                                            message={m}
                                            isLast={m.id === lastAssistantId}
                                            highlightId={highlight?.messageId === m.id ? highlight.sourceId : null}
                                            onJump={(sourceId) => jumpToSource(m.id, sourceId)}
                                            onRetry={retry}
                                            onFollowUp={ask}
                                            disabled={isLoading}
                                        />
                                    </motion.div>
                                )
                            )}

                            {isLoading && (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-3 rounded-2xl border border-line bg-card px-5 py-4"
                                    role="status"
                                    aria-live="polite"
                                >
                                    <span className="flex gap-1">
                                        {[0, 160, 320].map((d) => (
                                            <span
                                                key={d}
                                                className="h-2 w-2 animate-bounce rounded-full bg-primary/60"
                                                style={{ animationDelay: `${d}ms` }}
                                            />
                                        ))}
                                    </span>
                                    <span className="text-sm text-quiet">{LOADING_STAGES[stage]}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* ─── Composer ─── */}
            <div className="shrink-0 border-t border-line bg-background px-4 pb-4 pt-3">
                <div className="mx-auto max-w-3xl">
                    <div className="flex items-end gap-2 rounded-3xl border border-line bg-card p-2 transition-colors focus-within:border-primary">
                        <VoiceInput
                            onTranscript={(text) => setInput(text)}
                            language={useRomanUrdu ? "ur-PK" : "en-US"}
                            className="shrink-0 rounded-full"
                        />
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            aria-label="Your legal question"
                            placeholder={
                                useRomanUrdu
                                    ? "Roman Urdu mein apna sawal likhein…"
                                    : "Describe your situation or ask a question…"
                            }
                            value={input}
                            maxLength={MAX_QUESTION_LENGTH}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                                    e.preventDefault();
                                    ask(input);
                                }
                            }}
                            className="max-h-[150px] min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 text-[15px] leading-relaxed outline-none placeholder:text-quiet"
                        />
                        <button
                            onClick={() => ask(input)}
                            disabled={!input.trim() || isLoading}
                            aria-label="Send question"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
                        >
                            <ArrowUp className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-2 text-xs text-quiet">
                        <span className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3" />
                            In danger? Call Police <strong className="font-semibold text-ink">15</strong> or Rescue{" "}
                            <strong className="font-semibold text-ink">1122</strong>
                        </span>
                        <span>
                            {nearLimit
                                ? `${input.length}/${MAX_QUESTION_LENGTH}`
                                : "Legal information, not legal advice. Enter to send."}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AssistantMessage({
    message,
    isLast,
    highlightId,
    onJump,
    onRetry,
    onFollowUp,
    disabled,
}: {
    message: Message;
    isLast: boolean;
    highlightId: number | null;
    onJump: (sourceId: number) => void;
    onRetry: () => void;
    onFollowUp: (q: string) => void;
    disabled: boolean;
}) {
    const [copied, setCopied] = useState(false);
    const sources = message.sources ?? [];

    const copy = async () => {
        try {
            const refs = sources.map((s) => `[S${s.id}] ${s.law}${hasSection(s) ? `, Section ${s.section}` : ""}`);
            await navigator.clipboard.writeText([message.content, ...(refs.length ? ["", ...refs] : [])].join("\n"));
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        } catch {
            /* clipboard unavailable */
        }
    };

    if (message.error) {
        return (
            <div className="flex items-start gap-3 rounded-2xl border border-flag/30 bg-flag-soft px-5 py-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-flag" />
                <div className="flex-1">
                    <p className="text-[15px] text-ink">{message.content}</p>
                    {isLast && (
                        <button
                            onClick={onRetry}
                            disabled={disabled}
                            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline disabled:opacity-50"
                        >
                            <RotateCcw className="h-3.5 w-3.5" /> Try again
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="rounded-2xl border border-line bg-card px-5 py-4 sm:px-6 sm:py-5">
                {!message.grounded && (
                    <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-warn-soft px-3.5 py-2.5 text-[13px] leading-snug text-ink">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" />
                        <span>
                            I couldn&apos;t verify this against the law library, so no sources are shown. Please check with a
                            qualified advocate.
                        </span>
                    </div>
                )}

                <div className="text-[15px] leading-relaxed text-ink">
                    <ReactMarkdown
                        components={{
                            p: (props) => <p className="mb-3.5 last:mb-0" {...props} />,
                            h2: (props) => <h3 className="mb-2 mt-5 font-display text-base font-semibold first:mt-0" {...props} />,
                            h3: (props) => (
                                <h4 className="eyebrow mb-2 mt-5 first:mt-0 !text-[0.6875rem]" {...props} />
                            ),
                            strong: (props) => <strong className="font-semibold text-primary" {...props} />,
                            ul: (props) => <ul className="mb-3.5 list-disc space-y-1.5 pl-5 last:mb-0" {...props} />,
                            ol: (props) => <ol className="mb-3.5 list-decimal space-y-1.5 pl-5 last:mb-0" {...props} />,
                            li: (props) => <li className="pl-1" {...props} />,
                            code: (props) => (
                                <code className="rounded border border-line bg-panel px-1.5 py-0.5 font-mono text-[13px]" {...props} />
                            ),
                            a: ({ href, children }) => {
                                const id = href?.match(/^#cite-(\d+)$/)?.[1];
                                if (!id) {
                                    return (
                                        <a href={href} target="_blank" rel="noreferrer" className="text-primary underline">
                                            {children}
                                        </a>
                                    );
                                }
                                return (
                                    <button
                                        type="button"
                                        onClick={() => onJump(Number(id))}
                                        title={sourceLabel(sources.find((s) => s.id === Number(id)))}
                                        className="mx-0.5 inline-flex h-[1.35rem] min-w-[1.6rem] -translate-y-px items-center justify-center rounded-md bg-panel px-1.5 align-middle text-[11px] font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                                    >
                                        {children}
                                    </button>
                                );
                            },
                        }}
                    >
                        {linkCitations(message.content)}
                    </ReactMarkdown>
                </div>

                {sources.length > 0 && (
                    <div className="mt-5 border-t border-line pt-4">
                        <p className="eyebrow mb-2.5 text-quiet">
                            {sources.length === 1 ? "Source" : `${sources.length} sources`}
                        </p>
                        <ul className="grid gap-2 sm:grid-cols-2">
                            {sources.map((s) => (
                                <li
                                    key={s.id}
                                    id={`${message.id}-source-${s.id}`}
                                    className={`rounded-xl border bg-panel p-3.5 transition-colors ${
                                        highlightId === s.id ? "border-primary" : "border-line"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="rounded bg-card px-1.5 py-0.5 text-[11px] font-semibold text-primary">
                                            S{s.id}
                                        </span>
                                        {hasSection(s) && (
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-quiet">
                                                Section {s.section}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-2 text-sm font-semibold leading-snug">{s.law}</p>
                                    <p className="mt-1.5 line-clamp-4 text-[13px] leading-relaxed text-quiet">
                                        &ldquo;{s.excerpt}&rdquo;
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="mt-2 flex items-center gap-1 px-1">
                <button
                    onClick={copy}
                    className="flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-quiet transition-colors hover:bg-panel hover:text-ink"
                >
                    {copied ? <Check className="h-3.5 w-3.5 text-ok" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                </button>
                {isLast && (
                    <button
                        onClick={onRetry}
                        disabled={disabled}
                        className="flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-quiet transition-colors hover:bg-panel hover:text-ink disabled:opacity-50"
                    >
                        <RotateCcw className="h-3.5 w-3.5" /> Regenerate
                    </button>
                )}
            </div>

            {isLast && message.followUps && message.followUps.length > 0 && (
                <div className="mt-3">
                    <p className="eyebrow mb-2 px-1 text-quiet">You might also ask</p>
                    <div className="flex flex-col items-start gap-2">
                        {message.followUps.map((q) => (
                            <button
                                key={q}
                                disabled={disabled}
                                onClick={() => onFollowUp(q)}
                                className="rounded-2xl border border-line bg-card px-4 py-2.5 text-left text-sm leading-snug text-ink transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function hasSection(s: LegalSource) {
    return !!s.section && !["N/A", "General"].includes(s.section);
}

function sourceLabel(s?: LegalSource) {
    if (!s) return undefined;
    return hasSection(s) ? `${s.law}, Section ${s.section}` : s.law;
}
