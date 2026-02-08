"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Clock,
    AlertTriangle,
    FileCheck,
    CheckCircle2,
    Plus,
    MoreVertical,
    Scale,
    Building,
    Gavel,
    ArrowRight,
    Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, addDays, isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";

// Mock Data Interfaces
interface FilingDeadline {
    id: string;
    caseName: string;
    documentType: "Motion" | "Brief" | "Response" | "Petition" | "Evidence";
    court: "Federal" | "State" | "Appellate";
    dueDate: Date;
    status: "Pending" | "Filed" | "Overdue" | "Drafting";
    priority: "High" | "Medium" | "Low";
    assignedTo: string;
    ruleViolation?: string; // If present, indicates a detected issue
}

const MOCK_DEADLINES: FilingDeadline[] = [
    {
        id: "f-001",
        caseName: "Smith v. TechCorp",
        documentType: "Motion",
        court: "Federal",
        dueDate: addDays(new Date(), 2),
        status: "Drafting",
        priority: "High",
        assignedTo: "A. Lawyer"
    },
    {
        id: "f-002",
        caseName: "Estate of Doe",
        documentType: "Petition",
        court: "State",
        dueDate: addDays(new Date(), 5),
        status: "Pending",
        priority: "Medium",
        assignedTo: "B. Associate"
    },
    {
        id: "f-003",
        caseName: "City vs. Builders Inc.",
        documentType: "Response",
        court: "Federal",
        dueDate: addDays(new Date(), 0), // Today
        status: "Filed",
        priority: "High",
        assignedTo: "A. Lawyer"
    },
    {
        id: "f-004",
        caseName: "In Re: Bankruptcy",
        documentType: "Brief",
        court: "Appellate",
        dueDate: addDays(new Date(), -1), // Overdue
        status: "Overdue",
        priority: "High",
        assignedTo: "C. Partner",
        ruleViolation: "Exceeds page limit for 9th Circuit"
    }
];

export function FilingTracker() {
    const [deadlines, setDeadlines] = useState<FilingDeadline[]>(MOCK_DEADLINES);
    const [isAdding, setIsAdding] = useState(false);
    const [newFiling, setNewFiling] = useState<Partial<FilingDeadline>>({
        court: "Federal",
        priority: "Medium",
        status: "Pending"
    });

    const handleAddFiling = () => {
        if (!newFiling.caseName || !newFiling.documentType) return;

        // Simulate detecting a rule violation for demo purposes
        let detectedViolation = undefined;
        if (newFiling.documentType === "Brief" && newFiling.court === "Appellate") {
            detectedViolation = "Warning: Check Circuit Rule 32(a)(7) for word count limits.";
        }

        const filing: FilingDeadline = {
            id: `f-${Date.now()}`,
            caseName: newFiling.caseName,
            documentType: newFiling.documentType as any,
            court: newFiling.court as any,
            dueDate: newFiling.dueDate || addDays(new Date(), 7),
            status: "Pending",
            priority: newFiling.priority as any,
            assignedTo: "Me",
            ruleViolation: detectedViolation
        };

        setDeadlines([filing, ...deadlines]);
        setIsAdding(false);
        setNewFiling({ court: "Federal", priority: "Medium", status: "Pending" });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Filed": return "text-green-500 bg-green-100 dark:bg-green-900/30";
            case "Overdue": return "text-red-500 bg-red-100 dark:bg-red-900/30";
            case "Drafting": return "text-blue-500 bg-blue-100 dark:bg-blue-900/30";
            default: return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
        }
    };

    const sortedDeadlines = [...deadlines].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    return (
        <div className="w-full h-full p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Court Filing Tracker</h2>
                    <p className="text-muted-foreground">Manage deadlines, compliance, and multi-court dockets.</p>
                </div>
                <Dialog open={isAdding} onOpenChange={setIsAdding}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="mr-2 h-4 w-4" /> New Filing
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Filing Deadline</DialogTitle>
                            <DialogDescription>Track a new motion, brief, or petition.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="case" className="text-right">Case Name</Label>
                                <Input
                                    id="case"
                                    className="col-span-3"
                                    value={newFiling.caseName || ""}
                                    onChange={e => setNewFiling({ ...newFiling, caseName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="type" className="text-right">Doc Type</Label>
                                <Select onValueChange={v => setNewFiling({ ...newFiling, documentType: v as any })}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Motion">Motion</SelectItem>
                                        <SelectItem value="Brief">Brief</SelectItem>
                                        <SelectItem value="Response">Response</SelectItem>
                                        <SelectItem value="Petition">Petition</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="court" className="text-right">Court</Label>
                                <Select defaultValue="Federal" onValueChange={v => setNewFiling({ ...newFiling, court: v as any })}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select Court" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Federal">Federal District</SelectItem>
                                        <SelectItem value="State">State Court</SelectItem>
                                        <SelectItem value="Appellate">Appellate / Supreme</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" onClick={handleAddFiling}>Save Deadline</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Stats Cards */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming (7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{deadlines.filter(d => !isPast(d.dueDate) && d.dueDate <= addDays(new Date(), 7)).length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{deadlines.filter(d => isPast(d.dueDate) && d.status !== "Filed").length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{deadlines.filter(d => d.status === "Drafting").length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round((deadlines.filter(d => d.status === "Filed").length / deadlines.length) * 100)}%</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
                {/* List View */}
                <Card className="col-span-2 h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Calendar className="mr-2 h-5 w-5" />
                            Deadline Calendar
                        </CardTitle>
                        <CardDescription>
                            Upcoming filing deadlines sorted by urgency.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0">
                        <ScrollArea className="h-full">
                            <div className="p-6 space-y-4">
                                {sortedDeadlines.map((deadline) => (
                                    <motion.div
                                        key={deadline.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={cn("p-2 rounded-full mt-1",
                                                deadline.priority === "High" ? "bg-red-100 text-red-600 dark:bg-red-900/30" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                                            )}>
                                                <Scale className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold">{deadline.caseName}</h4>
                                                    {deadline.ruleViolation && (
                                                        <Badge variant="destructive" className="h-5 text-[10px] px-1">
                                                            <AlertTriangle className="mr-1 h-3 w-3" /> Rule Check
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{deadline.documentType} • {deadline.court} Court</p>
                                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    Due: {format(deadline.dueDate, 'MMM d, yyyy')}
                                                    {isToday(deadline.dueDate) && <span className="text-orange-500 font-bold ml-1">(TODAY)</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <Badge variant="outline" className={cn("capitalize", getStatusColor(deadline.status))}>
                                                {deadline.status}
                                            </Badge>
                                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                View Details <ArrowRight className="ml-1 h-3 w-3" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Integration Status / Rules Engine */}
                <Card className="col-span-1 h-full bg-slate-50 dark:bg-slate-950/50 border-dashed">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                            <Building className="mr-2 h-5 w-5 text-indigo-500" />
                            Court Integrations
                        </CardTitle>
                        <CardDescription>Live status from EFM systems</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-md border shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="font-medium text-sm">PACER (Federal)</span>
                                </div>
                                <Badge variant="secondary" className="text-xs">Online</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-md border shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    <span className="font-medium text-sm">State E-File (CA)</span>
                                </div>
                                <Badge variant="secondary" className="text-xs">Connected</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-md border shadow-sm opacity-50">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-gray-400" />
                                    <span className="font-medium text-sm">Odyssey (TX)</span>
                                </div>
                                <Badge variant="outline" className="text-xs">Offline</Badge>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h4 className="font-semibold mb-3 flex items-center text-sm">
                                <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
                                Local Rule Alerts
                            </h4>
                            <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-md text-sm text-orange-800 dark:text-orange-300">
                                <p className="font-medium mb-1">SDNY - Judge Smith</p>
                                <p className="text-xs opacity-90">"Courtesy copies must be delivered by 5 PM three days prior to hearing."</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full">Sync All Courts</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
