"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    UserCheck,
    ShieldAlert,
    FileText,
    Gavel,
    ChevronRight,
    Star,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    BrainCircuit,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Mock Data Types
interface ExpertProfile {
    id: string;
    name: string;
    specialty: string;
    credentials: string;
    experienceYears: number;
    casesTestified: number;
    credibilityScore: number;
    winRate: number;
    hourlyRate: number;
    location: string;
    image?: string;
    tags: string[];
    pastTestimony: {
        caseName: string;
        date: string;
        outcome: "Won" | "Lost" | "Settled";
        notes: string;
    }[];
    daubertRisk: "Low" | "Medium" | "High";
}

// Mock Experts Database
const MOCK_EXPERTS: ExpertProfile[] = [
    {
        id: "exp-001",
        name: "Dr. Elena Rodriguez",
        specialty: "Forensic Pathology",
        credentials: "MD, PhD, Board Certified",
        experienceYears: 18,
        casesTestified: 42,
        credibilityScore: 94,
        winRate: 82,
        hourlyRate: 650,
        location: "New York, NY",
        tags: ["Homicide", "Toxicology", "Medical Malpractice"],
        daubertRisk: "Low",
        pastTestimony: [
            { caseName: "State v. Johnson", date: "2024-03-12", outcome: "Won", notes: "Testimony on TOD was pivotal." },
            { caseName: "Estate of Miller vs. General Hospital", date: "2023-11-05", outcome: "Settled", notes: "Defense expert conceded on cross." }
        ]
    },
    {
        id: "exp-002",
        name: "Prof. Alan Chen",
        specialty: "Structural Engineering",
        credentials: "PE, SE, PhD Civil Engineering",
        experienceYears: 25,
        casesTestified: 68,
        credibilityScore: 88,
        winRate: 75,
        hourlyRate: 500,
        location: "San Francisco, CA",
        tags: ["Construction Defect", "Bridge Failure", "Seismic Analysis"],
        daubertRisk: "Low",
        pastTestimony: [
            { caseName: "City Infrastructure vs. BuildCo", date: "2024-01-20", outcome: "Won", notes: "Clear explanation of load factors." },
            { caseName: "Residences at the Park vs. Developer", date: "2023-08-14", outcome: "Lost", notes: "Jury found methodology too complex." }
        ]
    },
    {
        id: "exp-003",
        name: "Sarah Jenkins, CPA",
        specialty: "Forensic Accounting",
        credentials: "CPA, CFF, CFE",
        experienceYears: 12,
        casesTestified: 15,
        credibilityScore: 91,
        winRate: 88,
        hourlyRate: 425,
        location: "Chicago, IL",
        tags: ["Embezzlement", "Divorce Assets", "Business Valuation"],
        daubertRisk: "Low",
        pastTestimony: [
            { caseName: "TechCorp vs. Ex-CFO", date: "2024-05-02", outcome: "Won", notes: "Traced hidden assets through shell companies." }
        ]
    },
    {
        id: "exp-004",
        name: "Dr. Marcus Thorne",
        specialty: "Cybersecurity Analyst",
        credentials: "PhD Computer Science, CISSP",
        experienceYears: 8,
        casesTestified: 6,
        credibilityScore: 72,
        winRate: 50,
        hourlyRate: 350,
        location: "Remote",
        tags: ["Data Breach", "IP Theft", "Digital Forensics"],
        daubertRisk: "Medium", // Flagged for recent methodology challenge
        pastTestimony: [
            { caseName: "Streamline vs. Hacker Group", date: "2023-12-10", outcome: "Settled", notes: " Methodology challenged under Daubert." }
        ]
    }
];

export function ExpertMatcher() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<ExpertProfile[]>([]);
    const [selectedExpert, setSelectedExpert] = useState<ExpertProfile | null>(null);
    const [voirDireQuestions, setVoirDireQuestions] = useState<string[]>([]);
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

    const handleSearch = () => {
        setIsSearching(true);
        // Simulate AI Search Latency
        setTimeout(() => {
            const filtered = MOCK_EXPERTS.filter(expert =>
                expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                expert.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                expert.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setResults(filtered);
            setIsSearching(false);
        }, 1500);
    };

    const handleGenerateQuestions = (expert: ExpertProfile) => {
        setIsGeneratingQuestions(true);
        // Simulate AI Generation
        setTimeout(() => {
            const questions = [
                `Dr. ${expert.name.split(' ')[1]}, you stated you have ${expert.experienceYears} years of experience. How many of those years were spent specifically in ${expert.specialty}?`,
                `Regarding your testimony in ${expert.pastTestimony[0]?.caseName || 'previous cases'}, strict methodology was applied. can you explain your standard error rate?`,
                `Have you ever been disqualified as an expert witness in any jurisdiction?`,
                `Your hourly rate is $${expert.hourlyRate}. How much have you billed for this case to date?`,
                `Isn't it true that your primary income comes from litigation support rather than active practice?`
            ];
            setVoirDireQuestions(questions);
            setIsGeneratingQuestions(false);
        }, 2000);
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Expert Witness Matcher</h1>
                <p className="text-muted-foreground">
                    AI-powered expert matching with Daubert challenge prediction and automated voir dire preparation.
                </p>
            </div>

            {/* Search Section */}
            <Card className="border-indigo-500/20 bg-gradient-to-br from-background to-indigo-500/5 shadow-lg">
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Describe your case facts (e.g., 'Structural failure of concrete bridge during seismic event')..."
                                className="h-12 text-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                        </div>
                        <Button
                            size="lg"
                            onClick={handleSearch}
                            disabled={isSearching || !searchQuery}
                            className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 transition-all duration-300"
                        >
                            {isSearching ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Analyzing Case...
                                </>
                            ) : (
                                <>
                                    <BrainCircuit className="mr-2 h-5 w-5" />
                                    Find Experts
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Results Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* List of Experts */}
                <div className={`col-span-12 ${selectedExpert ? 'md:col-span-5' : 'md:col-span-12'} transition-all duration-500`}>
                    <AnimatePresence>
                        {results.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-xl font-semibold">Matched Experts ({results.length})</h2>
                                </div>

                                {results.map((expert) => (
                                    <motion.div
                                        key={expert.id}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        whileHover={{ scale: 1.01 }}
                                        className="cursor-pointer"
                                        onClick={() => {
                                            setSelectedExpert(expert);
                                            setVoirDireQuestions([]); // Reset questions
                                        }}
                                    >
                                        <Card className={`overflow-hidden border transition-all ${selectedExpert?.id === expert.id ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md' : 'hover:border-indigo-300'}`}>
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-4">
                                                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                                        <AvatarImage src={expert.image} />
                                                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                                                            {expert.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="font-bold text-lg">{expert.name}</h3>
                                                                <p className="text-sm text-indigo-600 font-medium">{expert.specialty}</p>
                                                            </div>
                                                            <Badge variant={expert.credibilityScore > 90 ? "default" : "secondary"} className="ml-2">
                                                                Score: {expert.credibilityScore}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground line-clamp-2">{expert.credentials}</p>
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {expert.tags.slice(0, 3).map(tag => (
                                                                <Badge key={tag} variant="outline" className="text-xs py-0 h-5 bg-background/50">
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            !isSearching && searchQuery && (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Search className="mx-auto h-12 w-12 mb-4 opacity-20" />
                                    <p>No experts found matching your criteria.</p>
                                </div>
                            )
                        )}
                    </AnimatePresence>
                </div>

                {/* Selected Expert Detail View */}
                <AnimatePresence>
                    {selectedExpert && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="col-span-12 md:col-span-7"
                        >
                            <Card className="h-full border-t-4 border-t-indigo-500 shadow-xl overflow-hidden flex flex-col">
                                <CardHeader className="bg-muted/30 pb-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="bg-background text-foreground uppercase tracking-wider text-[10px] font-bold">
                                                    Analysis Report
                                                </Badge>
                                                {selectedExpert.daubertRisk === "High" && (
                                                    <Badge variant="destructive" className="animate-pulse">
                                                        <AlertTriangle className="mr-1 h-3 w-3" /> High Daubert Risk
                                                    </Badge>
                                                )}
                                                {selectedExpert.daubertRisk === "Medium" && (
                                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">
                                                        <AlertTriangle className="mr-1 h-3 w-3" /> Medium Risk
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardTitle className="text-2xl">{selectedExpert.name}</CardTitle>
                                            <CardDescription className="text-base mt-1">{selectedExpert.specialty} • {selectedExpert.location}</CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-indigo-600">{selectedExpert.credibilityScore}<span className="text-sm text-muted-foreground font-normal">/100</span></div>
                                            <div className="text-xs text-muted-foreground">Credibility Index</div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <Tabs defaultValue="overview" className="flex-1 flex flex-col">
                                    <div className="px-6 pt-2 border-b">
                                        <TabsList className="bg-transparent p-0 gap-6">
                                            <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-1 pb-2 font-medium">Overview</TabsTrigger>
                                            <TabsTrigger value="testimony" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-1 pb-2 font-medium">History & Testimony</TabsTrigger>
                                            <TabsTrigger value="voirdire" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-1 pb-2 font-medium">Voir Dire Gen</TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <CardContent className="flex-1 p-0 overflow-hidden">
                                        <ScrollArea className="h-[500px] w-full">
                                            <div className="p-6">
                                                <TabsContent value="overview" className="mt-0 space-y-6">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="bg-muted/30 p-4 rounded-lg">
                                                            <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
                                                            <div className="text-2xl font-bold flex items-center">
                                                                {selectedExpert.winRate}%
                                                                <TrendingUp className="ml-2 h-4 w-4 text-green-500" />
                                                            </div>
                                                        </div>
                                                        <div className="bg-muted/30 p-4 rounded-lg">
                                                            <div className="text-sm text-muted-foreground mb-1">Experience</div>
                                                            <div className="text-2xl font-bold">{selectedExpert.experienceYears} Years</div>
                                                        </div>
                                                        <div className="bg-muted/30 p-4 rounded-lg">
                                                            <div className="text-sm text-muted-foreground mb-1">Cases Testified</div>
                                                            <div className="text-2xl font-bold">{selectedExpert.casesTestified}</div>
                                                        </div>
                                                        <div className="bg-muted/30 p-4 rounded-lg">
                                                            <div className="text-sm text-muted-foreground mb-1">Hourly Rate</div>
                                                            <div className="text-2xl font-bold">${selectedExpert.hourlyRate}</div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-semibold mb-2 flex items-center">
                                                            <UserCheck className="mr-2 h-4 w-4 text-indigo-500" />
                                                            Credentials
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                                            {selectedExpert.credentials}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-semibold mb-2 flex items-center">
                                                            <ShieldAlert className="mr-2 h-4 w-4 text-indigo-500" />
                                                            Areas of Expertise
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedExpert.tags.map(tag => (
                                                                <Badge key={tag} variant="secondary">#{tag}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="testimony" className="mt-0 space-y-4">
                                                    {selectedExpert.pastTestimony.map((testimony, idx) => (
                                                        <div key={idx} className="border rounded-lg p-4 space-y-2 hover:bg-muted/20 transition-colors">
                                                            <div className="flex justify-between items-start">
                                                                <h4 className="font-bold">{testimony.caseName}</h4>
                                                                <span className="text-xs text-muted-foreground">{testimony.date}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant={testimony.outcome === "Won" ? "default" : testimony.outcome === "Lost" ? "destructive" : "outline"}>
                                                                    {testimony.outcome}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground bg-muted p-2 rounded italic">
                                                                "{testimony.notes}"
                                                            </p>
                                                        </div>
                                                    ))}
                                                </TabsContent>

                                                <TabsContent value="voirdire" className="mt-0">
                                                    <div className="space-y-4">
                                                        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900">
                                                            <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center">
                                                                <BrainCircuit className="mr-2 h-4 w-4" />
                                                                AI-Generated Cross-Examination
                                                            </h4>
                                                            <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80 mb-4">
                                                                Based on this expert's profile and past testimony, here are recommended questions to challenge their credibility.
                                                            </p>

                                                            {isGeneratingQuestions ? (
                                                                <div className="flex items-center justify-center py-8">
                                                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                                                </div>
                                                            ) : voirDireQuestions.length > 0 ? (
                                                                <ul className="space-y-3">
                                                                    {voirDireQuestions.map((q, idx) => (
                                                                        <motion.li
                                                                            key={idx}
                                                                            initial={{ opacity: 0, x: -10 }}
                                                                            animate={{ opacity: 1, x: 0 }}
                                                                            transition={{ delay: idx * 0.1 }}
                                                                            className="flex gap-3 text-sm"
                                                                        >
                                                                            <div className="bg-background rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 border text-xs font-bold text-muted-foreground shadow-sm">
                                                                                {idx + 1}
                                                                            </div>
                                                                            <span className="leading-relaxed">{q}</span>
                                                                        </motion.li>
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                <div className="text-center py-6">
                                                                    <Button onClick={() => handleGenerateQuestions(selectedExpert)} variant="outline" className="border-indigo-200 hover:bg-indigo-100 hover:text-indigo-900 dark:border-indigo-800 dark:hover:bg-indigo-900/50">
                                                                        Generate Questions
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TabsContent>
                                            </div>
                                        </ScrollArea>
                                    </CardContent>

                                    <CardFooter className="border-t p-4 bg-muted/10">
                                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                                            <FileText className="mr-2 h-4 w-4" /> Save Profile to Case
                                        </Button>
                                    </CardFooter>
                                </Tabs>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
