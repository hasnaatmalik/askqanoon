"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, Check, Copy, Loader2 } from "lucide-react";

type Tone = "Aggressive" | "Balanced" | "Conciliatory";
const TONES: { id: Tone; hint: string }[] = [
    { id: "Aggressive", hint: "Firm, with a deadline" },
    { id: "Balanced", hint: "Fair to both sides" },
    { id: "Conciliatory", hint: "Keeps the relationship" },
];

interface Analysis {
    opponentStrategy: string;
    ourBATNA?: string;
    zopa?: string;
    settlementRange: { low: number; ideal: number; high: number };
    winProbability: number;
    recommendedOffer: number;
    keyLeverages?: string[];
    watchOuts?: string[];
    rationale: string;
}

const EXAMPLE = {
    facts: "Car accident, no injuries. Property damage around PKR 180,000. The other driver admitted fault at the scene, and I have photos and a repair estimate.",
    other: "First claim for them. Their insurer has been responsive so far.",
};

const money = (n: number) => `PKR ${Math.round(n).toLocaleString("en-US")}`;

async function post(body: unknown) {
    const res = await fetch("/api/settlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || "Something went wrong. Please try again.");
    return data;
}

export function SettlementTool() {
    const [facts, setFacts] = useState("");
    const [other, setOther] = useState("");
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState("");

    const [tone, setTone] = useState<Tone>("Balanced");
    const [amount, setAmount] = useState(0);
    const [draft, setDraft] = useState("");
    const [drafting, setDrafting] = useState(false);
    const [draftError, setDraftError] = useState("");
    const [copied, setCopied] = useState(false);

    const analyze = async () => {
        setAnalyzing(true);
        setError("");
        setDraft("");
        try {
            const data = (await post({ action: "analyze", caseFacts: facts, opponentHistory: other })) as Analysis;
            if (!data?.settlementRange || typeof data.winProbability !== "number") throw new Error("The analysis came back incomplete. Please try again.");
            setAnalysis(data);
            setAmount(Math.round(data.recommendedOffer || data.settlementRange.ideal));
        } catch (e) {
            setAnalysis(null);
            setError(e instanceof Error ? e.message : "Something went wrong.");
        } finally {
            setAnalyzing(false);
        }
    };

    const writeDraft = async () => {
        setDrafting(true);
        setDraftError("");
        try {
            const data = await post({ action: "draft", caseFacts: facts, offerAmount: amount, tone });
            setDraft(data.draft);
        } catch (e) {
            setDraftError(e instanceof Error ? e.message : "Something went wrong.");
        } finally {
            setDrafting(false);
        }
    };

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(draft);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        } catch {
            /* clipboard unavailable */
        }
    };

    const win = analysis?.winProbability ?? 0;
    const winLabel = win >= 70 ? "Strong position" : win >= 45 ? "Moderate risk" : "High risk";
    const range = analysis?.settlementRange;

    return (
        <div className="grid gap-6 py-10 lg:grid-cols-12">
            {/* ── Input ── */}
            <form
                className="rounded-2xl border border-line bg-panel p-5 lg:col-span-5 lg:self-start"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (facts.trim() && !analyzing) analyze();
                }}
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Your case</h2>
                    {!facts && (
                        <button
                            type="button"
                            onClick={() => {
                                setFacts(EXAMPLE.facts);
                                setOther(EXAMPLE.other);
                            }}
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            Try an example
                        </button>
                    )}
                </div>

                <label htmlFor="facts" className="mt-4 block text-sm font-medium">
                    What happened?
                </label>
                <textarea
                    id="facts"
                    rows={6}
                    value={facts}
                    maxLength={6000}
                    onChange={(e) => setFacts(e.target.value)}
                    placeholder="Who is involved, what was lost or damaged, what you can prove, and what the other side has said."
                    className="mt-1.5 w-full resize-y rounded-xl border border-line bg-card px-4 py-3 text-[15px] leading-relaxed placeholder:text-quiet focus:border-primary focus:outline-none"
                />

                <label htmlFor="other" className="mt-4 block text-sm font-medium">
                    About the other side <span className="font-normal text-quiet">(optional)</span>
                </label>
                <textarea
                    id="other"
                    rows={2}
                    value={other}
                    onChange={(e) => setOther(e.target.value)}
                    placeholder="Do they usually settle or fight? Do they have a lawyer or insurer?"
                    className="mt-1.5 w-full resize-y rounded-xl border border-line bg-card px-4 py-3 text-[15px] leading-relaxed placeholder:text-quiet focus:border-primary focus:outline-none"
                />

                <button
                    type="submit"
                    disabled={!facts.trim() || analyzing}
                    className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                    {analyzing ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Analysing your case…
                        </>
                    ) : (
                        "Analyse my case"
                    )}
                </button>

                {error && (
                    <p role="alert" className="mt-3 flex items-start gap-2 rounded-xl bg-flag-soft px-3.5 py-2.5 text-sm text-ink">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-flag" /> {error}
                    </p>
                )}
            </form>

            {/* ── Results ── */}
            <div className="space-y-4 lg:col-span-7">
                {!analysis && !analyzing && (
                    <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-card p-8 text-center">
                        <p className="font-display text-xl font-semibold">Your analysis will appear here</p>
                        <p className="mt-2 max-w-sm text-sm leading-relaxed text-quiet">
                            You&apos;ll get an estimated chance of success, a sensible settlement range, and a letter you can send.
                        </p>
                    </div>
                )}

                {analyzing && (
                    <div className="flex min-h-64 items-center justify-center rounded-2xl border border-line bg-card p-8" role="status">
                        <Loader2 className="mr-3 h-5 w-5 animate-spin text-primary" />
                        <span className="text-sm text-quiet">Weighing evidence, costs and the other side&apos;s likely moves…</span>
                    </div>
                )}

                {analysis && range && !analyzing && (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-line bg-card p-5">
                                <p className="eyebrow !text-quiet">Chance of winning in court</p>
                                <p className="mt-2 font-display text-4xl font-semibold tabular-nums">{win}%</p>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-line" role="img" aria-label={`${win} percent`}>
                                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(2, Math.min(100, win))}%` }} />
                                </div>
                                <p className="mt-3 text-sm font-medium">{winLabel}</p>
                            </div>

                            <div className="rounded-2xl border border-line bg-card p-5">
                                <p className="eyebrow !text-quiet">Settlement range</p>
                                <dl className="mt-3 space-y-1 text-sm">
                                    {(
                                        [
                                            ["Lowest to accept", range.low, false],
                                            ["Ideal", range.ideal, true],
                                            ["Open with", range.high, false],
                                        ] as const
                                    ).map(([label, value, strong]) => (
                                        <div key={label} className={`flex justify-between rounded-lg px-2.5 py-1.5 ${strong ? "bg-panel font-semibold text-primary" : ""}`}>
                                            <dt className={strong ? "" : "text-quiet"}>{label}</dt>
                                            <dd className="tabular-nums">{money(value)}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-line bg-card p-5">
                            <p className="eyebrow !text-quiet">Why</p>
                            <p className="mt-2 text-[15px] leading-relaxed">{analysis.rationale}</p>
                            <p className="mt-3 text-sm leading-relaxed text-quiet">
                                <span className="font-semibold text-ink">The other side: </span>
                                {analysis.opponentStrategy}
                            </p>
                            {!!analysis.keyLeverages?.length && (
                                <div className="mt-4">
                                    <p className="text-sm font-semibold">Your strengths</p>
                                    <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-relaxed">
                                        {analysis.keyLeverages.map((l) => (
                                            <li key={l}>{l}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {!!analysis.watchOuts?.length && (
                                <div className="mt-4 rounded-xl bg-warn-soft px-4 py-3">
                                    <p className="text-sm font-semibold">Watch out for</p>
                                    <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-relaxed">
                                        {analysis.watchOuts.map((w) => (
                                            <li key={w}>{w}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-line bg-card">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
                                <h2 className="text-lg font-semibold">Draft your offer letter</h2>
                                <div role="group" aria-label="Tone" className="flex rounded-full border border-line bg-background p-0.5 text-xs font-medium">
                                    {TONES.map((t) => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            title={t.hint}
                                            aria-pressed={tone === t.id}
                                            onClick={() => setTone(t.id)}
                                            className={`rounded-full px-3 py-1.5 transition-colors ${tone === t.id ? "bg-ink text-background" : "text-quiet hover:text-ink"}`}
                                        >
                                            {t.id}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-5">
                                <label htmlFor="amount" className="text-sm font-medium">
                                    Amount to offer (PKR)
                                </label>
                                <div className="mt-1.5 flex flex-wrap gap-2">
                                    <input
                                        id="amount"
                                        type="number"
                                        min={0}
                                        value={amount || ""}
                                        onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                                        className="h-11 w-48 rounded-xl border border-line bg-background px-4 text-[15px] tabular-nums focus:border-primary focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={writeDraft}
                                        disabled={drafting || amount <= 0}
                                        className="flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        {drafting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                                        {drafting ? "Writing…" : draft ? "Rewrite" : "Write the letter"}
                                    </button>
                                </div>
                                {draftError && <p role="alert" className="mt-3 text-sm text-flag">{draftError}</p>}

                                {draft && (
                                    <div className="mt-4">
                                        <pre className="whitespace-pre-wrap rounded-xl bg-panel p-4 font-sans text-[15px] leading-relaxed">{draft}</pre>
                                        <button
                                            type="button"
                                            onClick={copy}
                                            className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-background px-4 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
                                        >
                                            {copied ? <Check className="h-4 w-4 text-ok" /> : <Copy className="h-4 w-4" />}
                                            {copied ? "Copied" : "Copy letter"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="px-1 text-xs leading-relaxed text-quiet">
                            These are AI estimates from the facts you typed, not a prediction of what a court will do. Talk to an advocate before you send anything.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
