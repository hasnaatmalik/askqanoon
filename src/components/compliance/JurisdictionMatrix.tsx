"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertTriangle, Loader2, ShieldCheck, Globe, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MatrixRow {
    jurisdiction: string;
    requirement: string;
    standard?: string;
    enforcementBody?: string;
    status: "Compliant" | "Stricter" | "Lax" | "Unknown";
}

interface MatrixResult {
    analysis: string;
    conflictLevel: "High" | "Medium" | "Low";
    strictestJurisdiction?: string;
    complianceRecommendation?: string;
    matrix: MatrixRow[];
    conflicts: string[];
    gaps?: string[];
}

const AVAILABLE_JURISDICTIONS = ["Pakistan", "EU", "California", "USA Fed", "UK", "UAE", "Saudi Arabia"];

const statusConfig = {
    Stricter: { class: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30", label: "Stricter" },
    Compliant: { class: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30", label: "Compliant" },
    Lax: { class: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30", label: "Lax" },
    Unknown: { class: "bg-muted text-muted-foreground border-border", label: "Unknown" },
};

const conflictLevelConfig = {
    High: { class: "border-l-red-500", badgeClass: "border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/10", label: "High Risk" },
    Medium: { class: "border-l-amber-500", badgeClass: "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10", label: "Medium Risk" },
    Low: { class: "border-l-emerald-500", badgeClass: "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10", label: "Low Risk" },
};

const EXAMPLE_TOPICS = ["Data Retention", "User Consent", "Breach Notification", "Employment Termination", "Privacy Rights"];

export function JurisdictionMatrix() {
    const [topic, setTopic] = useState("");
    const [selectedJurisdictions, setSelectedJurisdictions] = useState<string[]>(["Pakistan", "EU"]);
    const [result, setResult] = useState<MatrixResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    const toggleJurisdiction = (jur: string) => {
        if (selectedJurisdictions.includes(jur)) {
            if (selectedJurisdictions.length <= 2) return; // min 2
            setSelectedJurisdictions(prev => prev.filter(j => j !== jur));
        } else {
            setSelectedJurisdictions(prev => [...prev, jur]);
        }
    };

    const handleAnalyze = async () => {
        if (!topic || selectedJurisdictions.length < 2) return;
        setIsLoading(true);
        setResult(null);
        try {
            const res = await fetch("/api/compliance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic, jurisdictions: selectedJurisdictions }),
            });
            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Input Card */}
            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        Compliance Scope
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Select jurisdictions and enter a regulation topic. The AI uses a 4-step methodology: requirement extraction, comparative analysis, conflict identification, and risk rating.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Jurisdiction Selector */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            Target Jurisdictions
                            <span className="text-xs text-muted-foreground font-normal">(select 2 or more)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_JURISDICTIONS.map(jur => {
                                const isSelected = selectedJurisdictions.includes(jur);
                                return (
                                    <button
                                        key={jur}
                                        onClick={() => toggleJurisdiction(jur)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${isSelected
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                            }`}
                                    >
                                        {isSelected && <Check className="h-3 w-3" />}
                                        {jur}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Topic Input */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground">Regulation Topic</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="e.g., Data Retention, User Consent, Breach Notification..."
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                                className="bg-background text-foreground border-border placeholder:text-muted-foreground"
                            />
                            <Button
                                onClick={handleAnalyze}
                                disabled={isLoading || !topic.trim() || selectedJurisdictions.length < 2}
                                className="shrink-0"
                            >
                                {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Analyze"}
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {EXAMPLE_TOPICS.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTopic(t)}
                                    className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors border border-border"
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Loading */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground text-sm">Running 4-step compliance analysis across {selectedJurisdictions.length} jurisdictions...</p>
                </div>
            )}

            {/* Results */}
            <AnimatePresence>
                {result && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Summary Row */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card className="border-l-4 border-l-primary bg-card border-border">
                                <CardHeader>
                                    <CardTitle className="text-base text-foreground">Executive Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{result.analysis}</p>
                                    {result.complianceRecommendation && (
                                        <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20 flex gap-2">
                                            <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                            <p className="text-sm text-foreground font-medium">{result.complianceRecommendation}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className={`border-l-4 bg-card border-border ${conflictLevelConfig[result.conflictLevel].class}`}>
                                <CardHeader>
                                    <CardTitle className="text-base flex justify-between items-center text-foreground">
                                        Conflict Analysis
                                        <Badge variant="outline" className={conflictLevelConfig[result.conflictLevel].badgeClass}>
                                            {conflictLevelConfig[result.conflictLevel].label}
                                        </Badge>
                                    </CardTitle>
                                    {result.strictestJurisdiction && (
                                        <CardDescription className="text-muted-foreground">
                                            Strictest: <span className="font-semibold text-foreground">{result.strictestJurisdiction}</span>
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {result.conflicts?.length > 0 ? (
                                        <ul className="space-y-2">
                                            {result.conflicts.map((c, i) => (
                                                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                                                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                                    {c}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Check className="h-4 w-4 text-emerald-500" /> No direct conflicts detected.
                                        </p>
                                    )}
                                    {result.gaps?.length ? (
                                        <div className="pt-2 border-t border-border">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Regulatory Gaps</p>
                                            {result.gaps.map((g, i) => (
                                                <p key={i} className="text-xs text-muted-foreground">• {g}</p>
                                            ))}
                                        </div>
                                    ) : null}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Jurisdiction Matrix Table */}
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <CardTitle className="text-foreground">Jurisdiction Regulation Matrix</CardTitle>
                                <CardDescription className="text-muted-foreground">Click any row to see full details.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto rounded-xl border border-border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/50">
                                                <th className="text-left font-semibold p-4 text-muted-foreground">Jurisdiction</th>
                                                <th className="text-left font-semibold p-4 text-muted-foreground">Requirement</th>
                                                <th className="text-left font-semibold p-4 text-muted-foreground">Status</th>
                                                <th className="w-8 p-4" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.matrix?.map((row, i) => (
                                                <>
                                                    <tr
                                                        key={`row-${i}`}
                                                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                                                        onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                                                    >
                                                        <td className="p-4 font-semibold text-foreground whitespace-nowrap">{row.jurisdiction}</td>
                                                        <td className="p-4 text-muted-foreground max-w-xs">
                                                            <span className="line-clamp-2">{row.requirement}</span>
                                                        </td>
                                                        <td className="p-4">
                                                            <Badge variant="outline" className={statusConfig[row.status]?.class || statusConfig.Unknown.class}>
                                                                {row.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-4 text-muted-foreground">
                                                            {expandedRow === i ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                        </td>
                                                    </tr>
                                                    {expandedRow === i && (
                                                        <tr key={`expanded-${i}`} className="border-b border-border bg-muted/20">
                                                            <td colSpan={4} className="px-6 py-4">
                                                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                                                    <div>
                                                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Full Requirement</p>
                                                                        <p className="text-foreground">{row.requirement}</p>
                                                                    </div>
                                                                    {row.standard && (
                                                                        <div>
                                                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Specific Standard</p>
                                                                            <p className="text-foreground">{row.standard}</p>
                                                                        </div>
                                                                    )}
                                                                    {row.enforcementBody && (
                                                                        <div>
                                                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Enforcement Body</p>
                                                                            <p className="text-foreground">{row.enforcementBody}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
