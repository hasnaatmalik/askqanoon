"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    MessageSquare,
    Eye,
    Clock,
    PlusCircle,
    User,
    Loader2,
    RefreshCw
} from "lucide-react";

interface ForumThread {
    id: string;
    title: string;
    author: string;
    authorImage?: string;
    role: string;
    replies: number;
    views: number;
    category: string;
    lastActive: string;
    preview: string;
    createdAt: string;
}

const CATEGORIES = [
    "Property",
    "Tenancy",
    "Criminal Law",
    "Family Law",
    "Labor Law",
    "Consumer Rights",
    "Cyber Crime",
    "Constitutional Law",
    "Education",
    "General"
];

const ROLES = ["Citizen", "Lawyer", "Student"];

export default function ForumList() {
    const { data: session } = useSession();
    const [threads, setThreads] = useState<ForumThread[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // New topic form
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newCategory, setNewCategory] = useState("");
    const [newRole, setNewRole] = useState("Citizen");
    const [isAnonymous, setIsAnonymous] = useState(false);

    const fetchThreads = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/forum");
            const data = await res.json();
            if (data.threads) {
                setThreads(data.threads);
            }
        } catch (error) {
            console.error("Failed to fetch threads:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchThreads();
    }, []);

    const handleSubmit = async () => {
        if (!newTitle || !newContent || !newCategory) return;

        setSubmitting(true);
        try {
            const res = await fetch("/api/forum", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTitle,
                    content: newContent,
                    category: newCategory,
                    role: newRole,
                    isAnonymous
                })
            });

            if (res.ok) {
                setDialogOpen(false);
                setNewTitle("");
                setNewContent("");
                setNewCategory("");
                setIsAnonymous(false);
                fetchThreads();
            }
        } catch (error) {
            console.error("Failed to create thread:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Recent Discussions</h3>
                    <p className="text-sm text-slate-500">Join the conversation with the community.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={fetchThreads}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-green-600 hover:bg-green-700" disabled={!session}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New Topic
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Start a New Discussion</DialogTitle>
                                <DialogDescription>
                                    Ask a legal question or share knowledge with the community.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="Enter a descriptive title..."
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select value={newCategory} onValueChange={setNewCategory}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CATEGORIES.map(cat => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Your Role</Label>
                                        <Select value={newRole} onValueChange={setNewRole}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ROLES.map(role => (
                                                    <SelectItem key={role} value={role}>{role}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="content">Your Question/Topic</Label>
                                    <Textarea
                                        id="content"
                                        placeholder="Describe your legal question in detail..."
                                        rows={5}
                                        value={newContent}
                                        onChange={(e) => setNewContent(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="anonymous"
                                        checked={isAnonymous}
                                        onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                                    />
                                    <Label htmlFor="anonymous" className="text-sm text-muted-foreground">
                                        Post anonymously
                                    </Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitting || !newTitle || !newContent || !newCategory}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Post Topic
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {threads.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No discussions yet. Be the first to start one!</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {threads.map((thread) => (
                        <Card key={thread.id} className="hover:border-green-500/50 transition-all cursor-pointer group">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-4 justify-between">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300">
                                                {thread.category}
                                            </Badge>
                                            <span className="text-xs text-slate-400 flex items-center">
                                                <Clock className="h-3 w-3 mr-1" /> {thread.lastActive}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 group-hover:text-green-700 dark:group-hover:text-green-500 flex items-center gap-2">
                                            {thread.title}
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                            {thread.preview}
                                        </p>
                                        <div className="flex items-center gap-2 pt-2">
                                            <div className="flex items-center text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                                <User className="h-3 w-3 mr-1" />
                                                {thread.author} • <span className="text-green-600 font-medium ml-1">{thread.role}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex md:flex-col items-center justify-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 min-w-[100px]">
                                        <div className="flex flex-col items-center text-slate-500">
                                            <div className="flex items-center gap-1 font-semibold text-lg text-slate-700 dark:text-slate-300">
                                                <MessageSquare className="h-4 w-4" />
                                                {thread.replies}
                                            </div>
                                            <span className="text-xs">Replies</span>
                                        </div>
                                        <div className="flex flex-col items-center text-slate-400">
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-4 w-4" />
                                                {thread.views}
                                            </div>
                                            <span className="text-xs">Views</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
