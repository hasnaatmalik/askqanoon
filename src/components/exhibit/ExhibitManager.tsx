"use client";

import { useState } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import {
    FileText,
    Image as ImageIcon,
    Move,
    Printer,
    Trash2,
    Plus,
    Link as LinkIcon,
    FileOutput,
    LayoutGrid,
    List,
    Search,
    MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Mock Data
interface Exhibit {
    id: string;
    number: string;
    title: string;
    type: "Document" | "Image" | "Email" | "Audio";
    description: string;
    date: string;
    linkedTo?: string[]; // IDs of other exhibits
}

const MOCK_EXHIBITS: Exhibit[] = [
    { id: "ex-1", number: "1", title: "Contract Agreement", type: "Document", description: "Signed MSA between parties", date: "2023-01-15" },
    { id: "ex-2", number: "2", title: "Email Chain", type: "Email", description: "Discussion re: project scope", date: "2023-02-10", linkedTo: ["ex-1"] },
    { id: "ex-3", number: "3", title: "Site Photo A", type: "Image", description: "Damage to foundation", date: "2023-03-22" },
    { id: "ex-4", number: "4", title: "Invoice #5002", type: "Document", description: "Disputed billing record", date: "2023-04-01" },
];

export function ExhibitManager() {
    const [exhibits, setExhibits] = useState<Exhibit[]>(MOCK_EXHIBITS);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [showStickers, setShowStickers] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [showExportDialog, setShowExportDialog] = useState(false);

    const handleReorder = (newOrder: Exhibit[]) => {
        // Automatically re-number based on new order
        const reorderedExhibits = newOrder.map((ex, index) => ({
            ...ex,
            number: String(index + 1)
        }));
        setExhibits(reorderedExhibits);
    };

    const handleDelete = (id: string) => {
        const newOrder = exhibits.filter(e => e.id !== id);
        handleReorder(newOrder); // Re-trigger manual reorder to fix numbers
    };

    const handleAddExhibit = () => {
        const newEx: Exhibit = {
            id: `ex-${Date.now()}`,
            number: String(exhibits.length + 1),
            title: "New Evidence Item",
            type: "Document",
            description: "Description pending...",
            date: new Date().toISOString().split('T')[0]
        };
        setExhibits([...exhibits, newEx]);
    };

    const filteredExhibits = exhibits.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full max-w-7xl mx-auto p-6 space-y-6 h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Exhibit Manager</h2>
                    <p className="text-muted-foreground">Organize, sticker, and ready your evidence for trial.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowStickers(!showStickers)}>
                        {showStickers ? "Hide Stickers" : "Show Stickers"}
                    </Button>

                    <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700">
                                <Printer className="mr-2 h-4 w-4" /> Export Index
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Exhibit Index</DialogTitle>
                                <DialogDescription>Formatted index for trial binders.</DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="h-[400px] border rounded-md p-4 bg-white dark:bg-slate-950 font-mono text-sm">
                                <div className="space-y-4">
                                    <div className="text-center font-bold border-b pb-2 mb-4">
                                        <p>SUPERIOR COURT OF CALIFORNIA</p>
                                        <p>COUNTY OF SAN FRANCISCO</p>
                                        <br />
                                        <p>EXHIBIT LIST</p>
                                    </div>
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="pb-2 w-16">EX #</th>
                                                <th className="pb-2 w-24">DATE</th>
                                                <th className="pb-2">DESCRIPTION</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {exhibits.map(ex => (
                                                <tr key={ex.id} className="border-b border-dashed">
                                                    <td className="py-2 align-top">{ex.number}</td>
                                                    <td className="py-2 align-top">{ex.date}</td>
                                                    <td className="py-2 align-top">
                                                        {ex.title}
                                                        <div className="text-xs text-muted-foreground">{ex.description}</div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </ScrollArea>
                            <DialogFooter>
                                <Button onClick={() => window.print()}>Print / Save PDF</Button>
                                <Button variant="outline" onClick={() => setShowExportDialog(false)}>Close</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden border-t-4 border-t-indigo-500">
                <CardHeader className="bg-muted/10 pb-4 border-b">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 bg-background p-1 rounded-md border">
                            <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("grid")}>
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("list")}>
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search exhibits..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleAddExhibit} size="sm">
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden p-0 bg-slate-50/50 dark:bg-slate-950/20">
                    <ScrollArea className="h-full p-6">
                        <Reorder.Group axis="y" values={exhibits} onReorder={handleReorder} className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6" : "space-y-2"}>
                            {filteredExhibits.map((exhibit) => (
                                <Reorder.Item key={exhibit.id} value={exhibit} dragListener={viewMode === "list"}> {/* Enable drag in list mode for simplicity, or handle grid drag later */}
                                    {viewMode === "grid" ? (
                                        <motion.div layoutId={exhibit.id} className="relative group cursor-grab active:cursor-grabbing">
                                            <Card className="overflow-hidden hover:shadow-lg transition-shadow border-indigo-200/50 dark:border-indigo-800/50">
                                                <div className="h-32 bg-slate-200 dark:bg-slate-800 flex items-center justify-center relative">
                                                    {exhibit.type === "Image" ? <ImageIcon className="h-12 w-12 text-slate-400" /> :
                                                        exhibit.type === "Email" ? <FileOutput className="h-12 w-12 text-slate-400" /> :
                                                            <FileText className="h-12 w-12 text-slate-400" />}

                                                    {/* Sticker Overlay */}
                                                    {showStickers && (
                                                        <div className="absolute bottom-2 right-2 bg-yellow-400 text-black px-3 py-1 text-xs font-bold shadow-md transform rotate-[-2deg] border border-yellow-600">
                                                            EXHIBIT {exhibit.number}
                                                        </div>
                                                    )}
                                                </div>
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h3 className="font-bold truncate" title={exhibit.title}>{exhibit.title}</h3>
                                                        <Button variant="ghost" size="icon" h-6 w-6 className="h-6 w-6 -mr-2">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{exhibit.description}</p>
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant="outline" className="text-[10px]">{exhibit.type}</Badge>
                                                        <span className="text-[10px] text-muted-foreground">{exhibit.date}</span>
                                                    </div>
                                                    {exhibit.linkedTo && (
                                                        <div className="mt-2 flex items-center text-[10px] text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 w-fit px-1.5 py-0.5 rounded">
                                                            <LinkIcon className="h-3 w-3 mr-1" />
                                                            Linked to Ex {exhibit.linkedTo.map(id => exhibits.find(e => e.id === id)?.number).join(", ")}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ) : (
                                        <motion.div layoutId={exhibit.id} className="cursor-grab active:cursor-grabbing">
                                            <div className="flex items-center gap-4 p-3 bg-card border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="cursor-grab text-muted-foreground">
                                                    <Move className="h-4 w-4" />
                                                </div>
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center relative flex-shrink-0">
                                                    <span className="text-sm font-bold text-slate-500">{exhibit.number}</span>
                                                    {showStickers && (
                                                        <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-black px-1.5 py-0.5 text-[8px] font-bold shadow-sm border border-yellow-600">
                                                            EX
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold truncate">{exhibit.title}</h4>
                                                    <p className="text-sm text-muted-foreground truncate">{exhibit.description}</p>
                                                </div>
                                                <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>{exhibit.date}</span>
                                                    <Badge variant="secondary">{exhibit.type}</Badge>
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(exhibit.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>

                        {filteredExhibits.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No exhibits found.</p>
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
                <CardFooter className="bg-muted/10 border-t p-2 px-4 flex justify-between text-xs text-muted-foreground">
                    <span>{exhibits.length} Items Total</span>
                    <span>Drag items to reorder & auto-renumber</span>
                </CardFooter>
            </Card>
        </div>
    );
}
