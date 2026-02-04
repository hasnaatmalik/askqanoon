"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, AlertTriangle, X, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MatrixResult {
    analysis: string;
    conflictLevel: "High" | "Medium" | "Low";
    matrix: {
        jurisdiction: string;
        requirement: string;
        status: "Compliant" | "Stricter" | "Lax" | "Unknown";
    }[];
    conflicts: string[];
}

const AVAILABLE_JURISDICTIONS = ["Pakistan", "EU", "California", "USA Fed"];

export function JurisdictionMatrix() {
    const [topic, setTopic] = useState("");
    const [selectedJurisdictions, setSelectedJurisdictions] = useState<string[]>(["Pakistan", "EU"]);
    const [result, setResult] = useState<MatrixResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const toggleJurisdiction = (jur: string) => {
        if (selectedJurisdictions.includes(jur)) {
            setSelectedJurisdictions(prev => prev.filter(j => j !== jur));
        } else {
            setSelectedJurisdictions(prev => [...prev, jur]);
        }
    };

    const handleAnalyze = async () => {
        if (!topic) return;
        setIsLoading(true);
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
        <div className="space-y-8">
            <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-emerald-500" />
                        Compliance Scope
                    </CardTitle>
                    <CardDescription>
                        Select jurisdictions and a compliance topic to detect regulatory conflicts.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Target Jurisdictions</label>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_JURISDICTIONS.map(jur => (
                                <Badge
                                    key={jur}
                                    variant={selectedJurisdictions.includes(jur) ? "default" : "outline"}
                                    className="cursor-pointer text-sm py-1 px-3 hover:bg-primary/90"
                                    onClick={() => toggleJurisdiction(jur)}
                                >
                                    {jur}
                                    {selectedJurisdictions.includes(jur) && <Check className="ml-2 h-3 w-3" />}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Regulation Topic</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="e.g., Data Retention, User Consent, Breach Notification"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="bg-background"
                            />
                            <Button onClick={handleAnalyze} disabled={isLoading || !topic || selectedJurisdictions.length < 2}>
                                {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Generate Matrix"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-l-4 border-l-primary">
                            <CardHeader>
                                <CardTitle className="text-lg">Executive Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{result.analysis}</p>
                            </CardContent>
                        </Card>

                        <Card className={`border-l-4 ${result.conflictLevel === "High" ? "border-l-red-500" :
                                result.conflictLevel === "Medium" ? "border-l-yellow-500" : "border-l-emerald-500"
                            }`}>
                            <CardHeader>
                                <CardTitle className="text-lg flex justify-between">
                                    Conflict Analysis
                                    <Badge variant={
                                        result.conflictLevel === "High" ? "destructive" :
                                            result.conflictLevel === "Medium" ? "secondary" : "outline"
                                    } className={result.conflictLevel === "Medium" ? "bg-yellow-500/10 text-yellow-600" : ""}>
                                        {result.conflictLevel} Risk
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {result.conflicts.map((c, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                                            <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                            {c}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Regulation Matrix</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left font-medium p-4 text-muted-foreground">Jurisdiction</th>
                                            <th className="text-left font-medium p-4 text-muted-foreground">Requirement Summary</th>
                                            <th className="text-left font-medium p-4 text-muted-foreground">Status relative to others</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.matrix.map((row, i) => (
                                            <tr key={i} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                                <td className="p-4 font-semibold">{row.jurisdiction}</td>
                                                <td className="p-4">{row.requirement}</td>
                                                <td className="p-4">
                                                    <Badge variant="outline" className={`
                                                        ${row.status === "Stricter" ? "bg-red-500/10 text-red-600 border-red-200" :
                                                            row.status === "Lax" ? "bg-yellow-500/10 text-yellow-600 border-yellow-200" :
                                                                "bg-emerald-500/10 text-emerald-600 border-emerald-200"}
                                                    `}>
                                                        {row.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
