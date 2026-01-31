"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scale, Users, Coins } from "lucide-react";

interface Heir {
    relation: string;
    share: number; // fraction
    amount: number;
    percentage: number;
}

export default function InheritanceCalculator() {
    const [assets, setAssets] = useState<number>(0);
    const [gender, setGender] = useState<"male" | "female">("male");
    const [spouse, setSpouse] = useState<number>(1); // 0 or 1 (wives can be up to 4, but simplified for MVP)
    const [sons, setSons] = useState<number>(0);
    const [daughters, setDaughters] = useState<number>(0);
    const [father, setFather] = useState<boolean>(true);
    const [mother, setMother] = useState<boolean>(true);

    const [result, setResult] = useState<Heir[] | null>(null);

    const calculateShares = () => {
        let shares: Heir[] = [];
        let remainingShare = 1;

        // 1. Spouse Share
        let spouseShare = 0;
        if (gender === "male") {
            // Wife: 1/8 if children, 1/4 if no children
            spouseShare = (sons > 0 || daughters > 0) ? 0.125 : 0.25;
            if (spouse > 0) {
                shares.push({ relation: "Wife", share: spouseShare, amount: 0, percentage: 0 });
                remainingShare -= spouseShare;
            }
        } else {
            // Husband: 1/4 if children, 1/2 if no children
            spouseShare = (sons > 0 || daughters > 0) ? 0.25 : 0.5;
            if (spouse > 0) {
                shares.push({ relation: "Husband", share: spouseShare, amount: 0, percentage: 0 });
                remainingShare -= spouseShare;
            }
        }

        // 2. Parents Share (Fixed 1/6 each if children exist)
        // Simplified Logic: Father gets 1/6, Mother gets 1/6 if children.
        // If no children, Mother gets 1/3, Father gets Residue (Simplified)
        if (sons > 0 || daughters > 0) {
            if (father) {
                shares.push({ relation: "Father", share: (1 / 6), amount: 0, percentage: 0 });
                remainingShare -= (1 / 6);
            }
            if (mother) {
                shares.push({ relation: "Mother", share: (1 / 6), amount: 0, percentage: 0 });
                remainingShare -= (1 / 6);
            }
        } else {
            if (mother) {
                shares.push({ relation: "Mother", share: (1 / 3), amount: 0, percentage: 0 });
                remainingShare -= (1 / 3);
            }
            // Father will catch residue later if no sons
        }

        // 3. Children Share (Residue)
        // Son = 2 parts, Daughter = 1 part
        if (sons > 0 || daughters > 0) {
            const totalUnits = (sons * 2) + daughters;
            const unitShare = remainingShare / totalUnits;

            if (sons > 0) {
                shares.push({ relation: "Sons (Combined)", share: unitShare * 2 * sons, amount: 0, percentage: 0 });
            }
            if (daughters > 0) {
                shares.push({ relation: "Daughters (Combined)", share: unitShare * daughters, amount: 0, percentage: 0 });
            }
            remainingShare = 0; // All distributed
        } else {
            // No children -> Father gets residue (Asaba)
            if (father) {
                // Check if father already added (case with children), if not add him as residue
                const existingFather = shares.find(s => s.relation === "Father");
                if (!existingFather) {
                    shares.push({ relation: "Father (Residue)", share: remainingShare, amount: 0, percentage: 0 });
                    remainingShare = 0;
                } else {
                    // In complex cases father gets 1/6 + residue, but simplified here
                }
            }
        }

        // Calculate amounts
        const finalHeirs = shares.map(heir => ({
            ...heir,
            amount: Math.round(heir.share * assets),
            percentage: parseFloat((heir.share * 100).toFixed(2))
        }));

        setResult(finalHeirs);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Coins className="h-5 w-5 text-yellow-500" />
                            Assets & Deceased Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Total Assets Value (PKR)</Label>
                            <Input
                                type="number"
                                value={assets}
                                onChange={(e) => setAssets(Number(e.target.value))}
                                className="text-lg font-semibold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Gender of Deceased</Label>
                            <Select value={gender} onValueChange={(v: any) => setGender(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male (Husband/Father)</SelectItem>
                                    <SelectItem value="female">Female (Wife/Mother)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-500" />
                            Heirs Listing
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{gender === 'male' ? 'Wife' : 'Husband'}</Label>
                            <Select value={spouse.toString()} onValueChange={(v) => setSpouse(Number(v))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">None</SelectItem>
                                    <SelectItem value="1">1 {gender === 'male' ? '(or more)' : ''}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Father Alive?</Label>
                            <Select value={father ? "yes" : "no"} onValueChange={(v) => setFather(v === "yes")}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Mother Alive?</Label>
                            <Select value={mother ? "yes" : "no"} onValueChange={(v) => setMother(v === "yes")}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-2 grid grid-cols-2 gap-4 pt-2 border-t mt-2">
                            <div className="space-y-2">
                                <Label>Number of Sons</Label>
                                <Input type="number" min="0" value={sons} onChange={(e) => setSons(Number(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Number of Daughters</Label>
                                <Input type="number" min="0" value={daughters} onChange={(e) => setDaughters(Number(e.target.value))} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Button size="lg" className="w-full bg-purple-600 hover:bg-purple-700" onClick={calculateShares}>
                    <Scale className="mr-2 h-5 w-5" /> Calculate Shares
                </Button>
            </div>

            <div className="space-y-6">
                {result ? (
                    <Card className="h-full border-green-500/20 bg-green-50/20">
                        <CardHeader>
                            <CardTitle>Distribution Result</CardTitle>
                            <CardDescription>Based on Sunni Islamic Laws of Inheritance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border bg-white overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-100 border-b">
                                        <tr>
                                            <th className="p-3 font-semibold">Heir</th>
                                            <th className="p-3 font-semibold">Share %</th>
                                            <th className="p-3 font-semibold text-right">Amount (PKR)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {result.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="p-3 font-medium">{item.relation}</td>
                                                <td className="p-3 text-slate-600">{item.percentage}%</td>
                                                <td className="p-3 text-right font-bold font-mono">
                                                    {item.amount.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                                            <td className="p-3">TOTAL</td>
                                            <td className="p-3">{result.reduce((a, b) => a + b.percentage, 0).toFixed(0)}%</td>
                                            <td className="p-3 text-right">{result.reduce((a, b) => a + b.amount, 0).toLocaleString()}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-slate-500 mt-4 italic">
                                * This calculation is based on standard Hanafi jurisprudence. Complex cases involving grandparents, predeceased children, or other special scenarios should be verified by a scholar.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-400 border-2 border-dashed rounded-xl">
                        <Scale className="h-16 w-16 mb-4 opacity-20" />
                        <h3 className="text-lg font-semibold">No Calculation Yet</h3>
                        <p>Enter details and click Calculate to see the breakdown.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
