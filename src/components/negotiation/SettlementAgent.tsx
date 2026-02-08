"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, Brain, Mail, Settings, RefreshCw, Send, DollarSign, TrendingUp, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Tone = "Aggressive" | "Balanced" | "Conciliatory";

interface AnalysisResult {
    opponentStrategy: string;
    settlementRange: { low: number; ideal: number; high: number };
    winProbability: number;
    recommendedOffer: number;
    rationale: string;
}

export function SettlementAgent() {
    const [activeTab, setActiveTab] = useState("analyze");
    const [caseFacts, setCaseFacts] = useState("");
    const [opponentHistory, setOpponentHistory] = useState("");
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Draft State
    const [offerAmount, setOfferAmount] = useState<number>(0);
    const [tone, setTone] = useState<Tone>("Balanced");
    const [draft, setDraft] = useState("");
    const [isDrafting, setIsDrafting] = useState(false);

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
            setOfferAmount(data.recommendedOffer);
            setActiveTab("results");
        } catch (e) {
            console.error(e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleDraft = async () => {
        setIsDrafting(true);
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

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="analyze">1. Analysis Input</TabsTrigger>
                    <TabsTrigger value="results" disabled={!analysis}>2. Strategy & Range</TabsTrigger>
                    <TabsTrigger value="draft" disabled={!analysis}>3. Draft Offer</TabsTrigger>
                </TabsList>

                <TabsContent value="analyze">
                    <Card>
                        <CardHeader>
                            <CardTitle>Case & Opponent Details</CardTitle>
                            <CardDescription>Provide facts to calibrate the AI's strategic engine.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Case Facts</Label>
                                <Textarea
                                    className="min-h-[150px]"
                                    placeholder="Describe the dispute, damages, and key evidence..."
                                    value={caseFacts}
                                    onChange={(e) => setCaseFacts(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Opponent History/Behavior (Optional)</Label>
                                <Textarea
                                    placeholder="Past settlement patterns, known counsel style (e.g., 'Usually settles early', 'Aggressive litigator')..."
                                    value={opponentHistory}
                                    onChange={(e) => setOpponentHistory(e.target.value)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleAnalyze} disabled={isAnalyzing || !caseFacts} className="w-full">
                                {isAnalyzing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
                                Analyze Case Strategy
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="results">
                    {analysis && (
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Win Probably (Trial)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-4xl font-bold flex items-center gap-2">
                                            {analysis.winProbability}%
                                            <Badge variant={analysis.winProbability > 70 ? "default" : "secondary"}>
                                                {analysis.winProbability > 70 ? "Strong Case" : "Risky"}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Opponent Profile</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-lg font-semibold">{analysis.opponentStrategy}</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="bg-slate-50 dark:bg-slate-900 border-indigo-100 dark:border-indigo-900/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                                        Optimal Settlement Range
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="relative h-4 bg-slate-200 rounded-full mt-4">
                                        {/* Visualization of range */}
                                        <div
                                            className="absolute h-full bg-indigo-500/30 rounded-full"
                                            style={{ left: '20%', right: '20%' }}
                                        />
                                        <div className="absolute top-6 left-[20%] -translate-x-1/2 text-center">
                                            <div className="text-xs font-bold text-slate-500">LOW</div>
                                            <div className="font-mono text-sm">${analysis.settlementRange?.low?.toLocaleString() || "N/A"}</div>
                                        </div>
                                        <div className="absolute top-6 left-[50%] -translate-x-1/2 text-center">
                                            <div className="text-xs font-bold text-indigo-600">IDEAL</div>
                                            <div className="font-mono text-xl font-bold text-indigo-600">${analysis.settlementRange?.ideal?.toLocaleString() || "N/A"}</div>
                                        </div>
                                        <div className="absolute top-6 left-[80%] -translate-x-1/2 text-center">
                                            <div className="text-xs font-bold text-slate-500">HIGH</div>
                                            <div className="font-mono text-sm">${analysis.settlementRange?.high?.toLocaleString() || "N/A"}</div>
                                        </div>
                                    </div>
                                    <p className="pt-12 text-sm text-muted-foreground italic text-center max-w-2xl mx-auto">
                                        "{analysis.rationale}"
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={() => setActiveTab("draft")} className="w-full">
                                        Proceed to Drafting
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="draft">
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="md:col-span-1 h-fit">
                            <CardHeader>
                                <CardTitle>Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Offer Amount ($)</Label>
                                    <Input
                                        type="number"
                                        value={offerAmount}
                                        onChange={(e) => setOfferAmount(Number(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label>Tone: <span className="text-primary font-semibold">{tone}</span></Label>
                                    <div className="flex flex-col gap-2">
                                        {["Aggressive", "Balanced", "Conciliatory"].map((t) => (
                                            <Button
                                                key={t}
                                                variant={tone === t ? "default" : "outline"}
                                                onClick={() => setTone(t as Tone)}
                                                className="justify-start"
                                                size="sm"
                                            >
                                                {t === "Aggressive" && <Gavel className="mr-2 h-4 w-4" />}
                                                {t === "Balanced" && <Scale className="mr-2 h-4 w-4" />}
                                                {t === "Conciliatory" && <DollarSign className="mr-2 h-4 w-4" />}
                                                {t}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <Button onClick={handleDraft} disabled={isDrafting} className="w-full mt-4">
                                    {isDrafting ? "Generating..." : "Generate Draft"}
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    Draft Email
                                    <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(draft)}>Copy</Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    className="min-h-[400px] font-mono text-sm leading-relaxed bg-muted/20"
                                    value={draft}
                                    readOnly={!draft} // Could allow edit, but read-only for now until generated
                                    placeholder="Draft will appear here..."
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
