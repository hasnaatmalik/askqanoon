"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, MessageCircle, Home, Lock, Gavel, Users, Info, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const iconMap: any = {
    Shield: Shield,
    Message: MessageCircle,
    Home: Home,
    Lock: Lock,
    Gavan: Gavel,
    Users: Users
};

interface Right {
    id: string;
    title: string;
    description: string;
    article: string;
    icon: string;
    details: string;
}

export default function RightsGrid() {
    const [rights, setRights] = useState<Right[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRight, setSelectedRight] = useState<string | null>(null);

    useEffect(() => {
        const fetchRights = async () => {
            try {
                const res = await fetch("/api/rights");
                const data = await res.json();
                if (data.rights) {
                    setRights(data.rights);
                }
            } catch (error) {
                console.error("Failed to fetch rights:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRights();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rights.map((right, i) => {
                const Icon = iconMap[right.icon] || Shield;

                return (
                    <motion.div
                        key={right.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                        onClick={() => setSelectedRight(selectedRight === right.id ? null : right.id)}
                        className="cursor-pointer"
                    >
                        <Card className={`h-full border-2 transition-all hover:shadow-lg ${selectedRight === right.id ? 'border-green-500 ring-4 ring-green-500/10' : 'border-transparent hover:border-green-200'}`}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-lg font-bold text-slate-800">
                                    {right.title}
                                </CardTitle>
                                <div className={`p-2 rounded-full ${selectedRight === right.id ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs font-mono text-green-600 bg-green-50 w-fit px-2 py-1 rounded mb-3">
                                    {right.article}
                                </div>
                                <p className="text-sm text-slate-600 mb-4">
                                    {right.description}
                                </p>

                                {selectedRight === right.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="pt-4 border-t border-dashed border-green-200"
                                    >
                                        <div className="flex gap-2 text-sm text-slate-700 bg-green-50/50 p-3 rounded-lg">
                                            <Info className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                            {right.details}
                                        </div>
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                );
            })}
        </div>
    );
}
