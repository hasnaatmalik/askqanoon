"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, BookOpen, Gavel, X, Loader2, RefreshCw } from "lucide-react";

interface CaseLaw {
    id: string;
    title: string;
    citation: string;
    court: string;
    date: string;
    year: number;
    topic: string;
    summary: string;
    tags: string[];
    sourceUrl: string | null;
}

const COURTS = [
    "Supreme Court",
    "Lahore High Court",
    "Sindh High Court",
    "Islamabad High Court",
    "Peshawar High Court"
];

const TOPICS = [
    "Criminal Law",
    "Constitutional Law",
    "Family Law",
    "Property Law",
    "Banking Law",
    "Cyber Law",
    "Labor Law"
];

// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

export default function CaseSearch() {
    const [cases, setCases] = useState<CaseLaw[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCourt, setSelectedCourt] = useState<string>("all");
    const [selectedTopic, setSelectedTopic] = useState<string>("all");
    const [total, setTotal] = useState(0);

    const debouncedSearch = useDebounce(searchTerm, 300);

    const fetchCases = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (debouncedSearch) params.append("q", debouncedSearch);
            if (selectedCourt !== "all") params.append("court", selectedCourt);
            if (selectedTopic !== "all") params.append("topic", selectedTopic);

            const res = await fetch(`/api/caselaw?${params.toString()}`);
            const data = await res.json();

            if (data.cases) {
                setCases(data.cases);
                setTotal(data.pagination?.total || data.cases.length);
            }
        } catch (error) {
            console.error("Failed to fetch cases:", error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, selectedCourt, selectedTopic]);

    useEffect(() => {
        fetchCases();
    }, [fetchCases]);

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCourt("all");
        setSelectedTopic("all");
    };

    return (
        <div className="space-y-6">
            {/* Search Header */}
            <Card className="bg-slate-900 dark:bg-slate-950 border-slate-800 text-white shadow-xl">
                <CardContent className="p-6 md:p-8 space-y-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <Input
                                placeholder="Search by party name, citation (e.g. 2018 SCMR), or keywords..."
                                className="pl-10 h-11 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-green-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={fetchCases}
                            className="h-11 px-8 bg-green-600 hover:bg-green-700 text-white"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center text-sm text-slate-400 mr-2">
                            <Filter className="h-4 w-4 mr-2" /> Filters:
                        </div>

                        <Select value={selectedCourt} onValueChange={setSelectedCourt}>
                            <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white h-9 text-xs">
                                <SelectValue placeholder="Court" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courts</SelectItem>
                                {COURTS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                            <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white h-9 text-xs">
                                <SelectValue placeholder="Legal Topic" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Topics</SelectItem>
                                {TOPICS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        {(searchTerm || selectedCourt !== "all" || selectedTopic !== "all") && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="h-9 text-xs text-slate-400 hover:text-white"
                            >
                                <X className="h-3 w-3 mr-1" /> Clear
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground font-medium">
                        {loading ? "Searching..." : `Found ${total} judgments`}
                    </p>
                    <Button variant="ghost" size="sm" onClick={fetchCases} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                    </div>
                ) : cases.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <Gavel className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <h3 className="font-medium">No results found</h3>
                        <p className="text-sm">Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    cases.map((c) => (
                        <Card key={c.id} className="hover:border-green-500/50 transition-colors group cursor-pointer">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300">
                                                {c.court}
                                            </Badge>
                                            <Badge variant="outline" className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                                                {c.topic}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-lg text-blue-700 dark:text-blue-400 group-hover:underline decoration-2 underline-offset-4">
                                            {c.title}
                                        </CardTitle>
                                        <h4 className="font-serif font-bold text-slate-600 dark:text-slate-300 mt-1">{c.citation}</h4>
                                    </div>
                                    <div className="text-xs text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                        {c.date}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {c.summary}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {c.tags.map(tag => (
                                        <span key={tag} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-full">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0 pb-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-auto text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                                    onClick={() => c.sourceUrl && window.open(c.sourceUrl, '_blank')}
                                    disabled={!c.sourceUrl}
                                >
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Read Full Judgment
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
