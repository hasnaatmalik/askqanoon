"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    X,
    Shield,
    Home,
    Heart,
    Scale,
    Clock,
    Users,
    FileText,
    Info,
    Lightbulb,
    ExternalLink,
    RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DailyTip {
    id: string;
    title: string;
    content: string;
    source: string;
    category: "police" | "property" | "family" | "labor" | "consumer" | "general";
    icon: string;
}

const iconMap: Record<string, React.ElementType> = {
    Shield,
    Home,
    Heart,
    Scale,
    Clock,
    Users,
    FileText,
    Info,
    Lightbulb
};

const categoryColors: Record<string, string> = {
    police: "bg-red-100 text-red-700 border-red-200",
    property: "bg-blue-100 text-blue-700 border-blue-200",
    family: "bg-pink-100 text-pink-700 border-pink-200",
    labor: "bg-orange-100 text-orange-700 border-orange-200",
    consumer: "bg-purple-100 text-purple-700 border-purple-200",
    general: "bg-green-100 text-green-700 border-green-200"
};

const categoryLabels: Record<string, string> = {
    police: "Police & Rights",
    property: "Property Law",
    family: "Family Law",
    labor: "Labor Rights",
    consumer: "Consumer Rights",
    general: "General"
};

export function DailyTipPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [tip, setTip] = useState<DailyTip | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasUnread, setHasUnread] = useState(true);

    // Check localStorage for seen tips
    useEffect(() => {
        const seenTips = localStorage.getItem("seenTips");
        const today = new Date().toISOString().split("T")[0];

        if (seenTips) {
            const parsed = JSON.parse(seenTips);
            if (parsed.date === today) {
                setHasUnread(false);
            }
        }
    }, []);

    const fetchTip = async (random = false) => {
        setLoading(true);
        try {
            const url = random
                ? "/api/notifications/tip-of-the-day?random=true"
                : "/api/notifications/tip-of-the-day";

            const res = await fetch(url);
            const data = await res.json();

            if (data.success) {
                setTip(data.tip);

                // Mark as seen
                const today = new Date().toISOString().split("T")[0];
                localStorage.setItem("seenTips", JSON.stringify({
                    date: today,
                    tipId: data.tip.id
                }));
                setHasUnread(false);
            }
        } catch (error) {
            console.error("Failed to fetch tip:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        if (!tip) {
            fetchTip();
        }
    };

    const Icon = tip ? (iconMap[tip.icon] || Lightbulb) : Lightbulb;

    return (
        <div className="relative">
            {/* Bell Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={handleOpen}
                className="relative h-10 w-10 rounded-full hover:bg-primary/10"
            >
                <Bell className="h-5 w-5" />

                {/* Unread indicator */}
                {hasUnread && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background"
                    />
                )}
            </Button>

            {/* Popup */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Popup Content */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-2xl border border-border/50 bg-background/95 shadow-2xl backdrop-blur-md"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-border/50 p-4">
                                <div className="flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                                    <h3 className="font-serif font-bold">Know Your Rights</h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="h-8 w-8 rounded-full"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                ) : tip ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-4"
                                    >
                                        {/* Category Badge */}
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className={cn("text-xs", categoryColors[tip.category])}
                                            >
                                                {categoryLabels[tip.category]}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                Tip of the Day
                                            </span>
                                        </div>

                                        {/* Tip Card */}
                                        <div className="rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 p-4 border border-primary/10">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="font-bold text-foreground">
                                                        {tip.title}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        {tip.content}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Source */}
                                            <div className="mt-4 flex items-center gap-2 rounded-lg bg-background/50 px-3 py-2 text-xs">
                                                <Scale className="h-3 w-3 text-emerald-600" />
                                                <span className="font-mono text-emerald-700">
                                                    {tip.source}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 gap-2"
                                                onClick={() => fetchTip(true)}
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                                Another Tip
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="flex-1 gap-2"
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    window.location.href = "/dashboard/rights";
                                                }}
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                Learn More
                                            </Button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="py-8 text-center text-sm text-muted-foreground">
                                        Failed to load tip. Please try again.
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-border/50 p-3 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
                                Daily Legal Knowledge
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export default DailyTipPopup;
