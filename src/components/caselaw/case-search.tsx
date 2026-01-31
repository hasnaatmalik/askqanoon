"use client";

import { useState } from "react";
import { mockCases, CaseLaw } from "@/data/caselaw/mock-cases";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, BookOpen, Calendar, Gavel, X } from "lucide-react";

export default function CaseSearch() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCourt, setSelectedCourt] = useState<string>("all");
    const [selectedTopic, setSelectedTopic] = useState<string>("all");

    // Filter Logic
    const filteredCases = mockCases.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.citation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.summary.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCourt = selectedCourt === "all" || c.court === selectedCourt;
        const matchesTopic = selectedTopic === "all" || c.topic === selectedTopic;

        return matchesSearch && matchesCourt && matchesTopic;
    });

    const courts = Array.from(new Set(mockCases.map(c => c.court)));
    const topics = Array.from(new Set(mockCases.map(c => c.topic)));

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCourt("all");
        setSelectedTopic("all");
    };

    return (
        <div className="space-y-6">
            {/* Search Header */}
            <Card className="bg-slate-900 border-slate-800 text-white shadow-xl">
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
                        <Button className="h-11 px-8 bg-green-600 hover:bg-green-700 text-white">
                            Search
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
                                {courts.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                            <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white h-9 text-xs">
                                <SelectValue placeholder="Legal Topic" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Topics</SelectItem>
                                {topics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
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
                <p className="text-sm text-muted-foreground font-medium">
                    Found {filteredCases.length} judgments
                </p>
                {filteredCases.map((c) => (
                    <Card key={c.id} className="hover:border-green-500/50 transition-colors group cursor-pointer">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            {c.court}
                                        </Badge>
                                        <Badge variant="outline" className="bg-slate-50 text-slate-600">
                                            {c.topic}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg text-blue-700 group-hover:underline decoration-2 underline-offset-4">
                                        {c.title}
                                    </CardTitle>
                                    <h4 className="font-serif font-bold text-slate-600 mt-1">{c.citation}</h4>
                                </div>
                                <div className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded">
                                    {c.date}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {c.summary}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {c.tags.map(tag => (
                                    <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="pt-0 pb-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="ml-auto text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => window.open(c.sourceUrl, '_blank')}
                            >
                                <BookOpen className="h-4 w-4 mr-2" />
                                Read Full Judgment
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {filteredCases.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        <Gavel className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <h3 className="font-medium">No results found</h3>
                        <p className="text-sm">Try adjusting your filters or search terms.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
