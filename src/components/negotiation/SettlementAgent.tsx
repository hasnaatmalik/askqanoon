"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Scale, Brain, Mail, RefreshCw, DollarSign, TrendingUp, Gavel,
    ChevronRight, Target, Shield, AlertTriangle, Lightbulb, Copy, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Tone = "Aggressive" | "Balanced" | "Conciliatory";

interface AnalysisResult {
    opponentStrategy: string;
    opponentBATNA?: string;
    ourBATNA?: string;
    zopa?: string;
    settlementRange: { low: number; ideal: number; high: number };
    winProbability: number;
    recommendedOffer: number;
    keyLeverages?: string[];
    watchOuts?: string[];
    rationale: string;
}

const toneConfig = {
    Aggressive: {
        icon: Gavel,
        desc: "Power positioning. Emphasize trial strength and deadlines.",
        class: "border-red-500/50 bg-red-500/5 dark:bg-red-500/10",
        activeClass: "border-red-500 bg-red-500/15",
        iconClass: "text-red-500",
    },
    Balanced: {
        icon: Scale,
        desc: "Mutual-gains framing. Rational, interest-based resolution.",
        class: "border-primary/30 bg-primary/5",
        activeClass: "border-primary bg-primary/15",
        iconClass: "text-primary",
    },
    Conciliatory: {
        icon: DollarSign,
        desc: "Relationship-preserving. Goodwill and empathy framing.",
        class: "border-emerald-500/30 bg-emerald-500/5",
        activeClass: "border-emerald-500 bg-emerald-500/15",
        iconClass: "text-emerald-600 dark:text-emerald-400",
    },
};

export function SettlementAgent() {
    const [activeTab, setActiveTab] = useState("analyze");
    const [caseFacts, setCaseFacts] = useState("");
    const [opponentHistory, setOpponentHistory] = useState("");
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [offerAmount, setOfferAmount] = useState<number>(0);
    const [tone, setTone] = useState<Tone>("Balanced");
    const [draft, setDraft] = useState("");
    const [isDrafting, setIsDrafting] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const res = await fetch("/api/settlement", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "analyze", caseFacts, opponentHistory }),
            });
            const data = await res.json();
            setAnalysis(data);
            setOfferAmount(data.recommendedOffer || 0);
            setActiveTab("results");
        } catch (e) {
            console.error(e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleDraft = async () => {
        setIsDrafting(true);
        setDraft("");
        try {
            const res = await fetch("/api/settlement", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "draft", caseFacts, offerAmount, tone }),
            });
            const data = await res.json();
            setDraft(data.draft);
        } catch (e) {
            console.error(e);
        } finally {
            setIsDrafting(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(draft);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const winColor = analysis
        ? analysis.winProbability > 70 ? "text-emerald-600 dark:text-emerald-400"
            : analysis.winProbability > 45 ? "text-amber-600 dark:text-amber-400"
                : "text-red-600 dark:text-red-400"
        : "";

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="analyze">1. Analysis Input</TabsTrigger>
                    <TabsTrigger value="results" disabled={!analysis}>2. Strategy &amp; Range</TabsTrigger>
                    <TabsTrigger value="draft" disabled={!analysis}>3. Draft Offer</TabsTrigger>
                </TabsList>

                {/* Tab 1: Input */}
                <TabsContent value="analyze">
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground">Case &amp; Opponent Details</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Provide facts to calibrate the AI's strategic analysis engine (BATNA/ZOPA modeling).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-foreground">Case Facts *</Label>
                                <Textarea
                                    className="min-h-[150px] bg-background text-foreground border-border placeholder:text-muted-foreground"
                                    placeholder="Describe the dispute: the parties involved, the damages claimed, key evidence, jurisdiction, and any procedural history..."
                                    value={caseFacts}
                                    onChange={(e) => setCaseFacts(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground">Opponent History / Behavioral Signals <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                                <Textarea
                                    className="bg-background text-foreground border-border placeholder:text-muted-foreground"
                                    placeholder="Past settlement patterns, counsel reputation, known tactics (e.g., 'Consistently settles before trial', 'Known for aggressive discovery tactics')..."
                                    value={opponentHistory}
                                    onChange={(e) => setOpponentHistory(e.target.value)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleAnalyze} disabled={isAnalyzing || !caseFacts.trim()} className="w-full h-12">
                                {isAnalyzing ? (
                                    <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Running Strategic Analysis...</>
                                ) : (
                                    <><Brain className="mr-2 h-4 w-4" /> Analyze Case &amp; Model Strategy</>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Tab 2: Results */}
                <TabsContent value="results">
                    {analysis && (
                        <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Top Stats */}
                                <div className="grid md:grid-cols-3 gap-4">
                                    <Card className="bg-card border-border">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Trial Win Probability</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className={`text-4xl font-bold tabular-nums ${winColor}`}>
                                                {analysis.winProbability}%
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`mt-2 ${analysis.winProbability > 70 ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : analysis.winProbability > 45 ? "border-amber-500/30 text-amber-600" : "border-red-500/30 text-red-600"}`}
                                            >
                                                {analysis.winProbability > 70 ? "Strong Case" : analysis.winProbability > 45 ? "Moderate Risk" : "High Risk"}
                                            </Badge>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-card border-border">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Opponent Profile</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-base font-semibold text-foreground leading-snug">{analysis.opponentStrategy}</div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-card border-border">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recommended Opening</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold text-foreground tabular-nums">
                                                {analysis.recommendedOffer?.toLocaleString() || "N/A"}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">Opening offer amount</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Settlement Range Visual */}
                                <Card className="bg-card border-border">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-foreground">
                                            <TrendingUp className="h-5 w-5 text-primary" />
                                            Settlement Range Analysis
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="relative h-3 bg-muted rounded-full mt-8 mb-16">
                                            <div
                                                className="absolute h-full bg-primary/30 rounded-full"
                                                style={{ left: "15%", right: "15%" }}
                                            />
                                            <div className="absolute h-5 w-5 bg-primary rounded-full -top-1 left-[50%] -translate-x-1/2 shadow-lg shadow-primary/40" />

                                            <div className="absolute top-6 left-[15%] -translate-x-1/2 text-center">
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Floor</div>
                                                <div className="font-mono text-sm font-semibold text-foreground">{analysis.settlementRange?.low?.toLocaleString() || "N/A"}</div>
                                            </div>
                                            <div className="absolute top-6 left-[50%] -translate-x-1/2 text-center">
                                                <div className="text-[10px] font-bold text-primary uppercase tracking-wider">Target</div>
                                                <div className="font-mono text-xl font-bold text-primary">{analysis.settlementRange?.ideal?.toLocaleString() || "N/A"}</div>
                                            </div>
                                            <div className="absolute top-6 left-[85%] -translate-x-1/2 text-center">
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Anchor</div>
                                                <div className="font-mono text-sm font-semibold text-foreground">{analysis.settlementRange?.high?.toLocaleString() || "N/A"}</div>
                                            </div>
                                        </div>

                                        {analysis.zopa && (
                                            <div className="p-3 rounded-lg bg-muted/50 border border-border">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Zone of Possible Agreement (ZOPA)</p>
                                                <p className="text-sm text-foreground">{analysis.zopa}</p>
                                            </div>
                                        )}

                                        <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-4">
                                            {analysis.rationale}
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Leverages & Watch-outs */}
                                {(analysis.keyLeverages?.length || analysis.watchOuts?.length) ? (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {analysis.keyLeverages?.length ? (
                                            <Card className="bg-card border-border">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                                                        <Target className="h-4 w-4 text-primary" /> Key Leverages
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <ul className="space-y-2">
                                                        {analysis.keyLeverages.map((l, i) => (
                                                            <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                                                                <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                                                {l}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </CardContent>
                                            </Card>
                                        ) : null}

                                        {analysis.watchOuts?.length ? (
                                            <Card className="bg-card border-border">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                                                        <Shield className="h-4 w-4 text-amber-500" /> Watch-Outs
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <ul className="space-y-2">
                                                        {analysis.watchOuts.map((w, i) => (
                                                            <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                                                                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                                                {w}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </CardContent>
                                            </Card>
                                        ) : null}
                                    </div>
                                ) : null}

                                <Button onClick={() => setActiveTab("draft")} className="w-full h-12">
                                    Proceed to Draft Offer <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </TabsContent>

                {/* Tab 3: Draft */}
                <TabsContent value="draft">
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="md:col-span-1 h-fit bg-card border-border">
                            <CardHeader>
                                <CardTitle className="text-foreground">Drafting Configuration</CardTitle>
                                <CardDescription className="text-muted-foreground">Configure offer parameters before generating.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-foreground">Offer Amount</Label>
                                    <Input
                                        type="number"
                                        value={offerAmount}
                                        onChange={(e) => setOfferAmount(Number(e.target.value))}
                                        className="bg-background text-foreground border-border"
                                    />
                                    {analysis && (
                                        <p className="text-xs text-muted-foreground">
                                            Recommended: {analysis.recommendedOffer?.toLocaleString()}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-foreground">Negotiation Tone</Label>
                                    {(Object.entries(toneConfig) as [Tone, typeof toneConfig["Aggressive"]][]).map(([t, cfg]) => {
                                        const Icon = cfg.icon;
                                        const isSelected = tone === t;
                                        return (
                                            <button
                                                key={t}
                                                onClick={() => setTone(t)}
                                                className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-start gap-3 ${isSelected ? cfg.activeClass : cfg.class}`}
                                            >
                                                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${isSelected ? cfg.iconClass : "text-muted-foreground"}`} />
                                                <div>
                                                    <p className="font-semibold text-sm text-foreground">{t}</p>
                                                    <p className="text-xs text-muted-foreground">{cfg.desc}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <Button onClick={handleDraft} disabled={isDrafting || !offerAmount} className="w-full">
                                    {isDrafting ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Drafting...</> : <><Mail className="mr-2 h-4 w-4" /> Generate Draft</>}
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2 bg-card border-border">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center text-foreground">
                                    <span>Settlement Offer Letter</span>
                                    {draft && (
                                        <Button variant="ghost" size="sm" onClick={handleCopy} className="text-muted-foreground hover:text-foreground">
                                            {copied ? <><Check className="h-4 w-4 mr-1 text-emerald-500" /> Copied</> : <><Copy className="h-4 w-4 mr-1" /> Copy</>}
                                        </Button>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isDrafting ? (
                                    <div className="min-h-[400px] flex items-center justify-center">
                                        <div className="text-center space-y-3">
                                            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto" />
                                            <p className="text-sm text-muted-foreground">Crafting your {tone.toLowerCase()} offer letter...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <Textarea
                                        className="min-h-[400px] font-mono text-sm leading-relaxed bg-muted/20 text-foreground border-border placeholder:text-muted-foreground"
                                        value={draft}
                                        onChange={(e) => setDraft(e.target.value)}
                                        placeholder="Configure parameters on the left and click 'Generate Draft' to create your settlement offer letter..."
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
