"use client";

import { motion } from "framer-motion";
import {
    Database,
    Search,
    Zap,
    UserCheck,
    FileText,
    MessageSquareOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
    {
        title: "Document Retrieval (RAG)",
        description: "Our system fetches relevant sections from PPC, CrPC, and other verified Pakistani law sources in real-time.",
        icon: Database,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    {
        title: "Semantic Search",
        description: "Search by meaning, not just keywords. Understand legal nuances with Gemini's advanced reasoning.",
        icon: Search,
        color: "text-primary",
        bg: "bg-primary/10",
    },
    {
        title: "Simple Language",
        description: "Complexity made simple. Get legal explanations in plain English or Roman Urdu for better clarity.",
        icon: Zap,
        color: "text-secondary-foreground",
        bg: "bg-secondary/10",
    },
    {
        title: "No Authentication",
        description: "Access legal information instantly. No sign-ups required to get the information you need.",
        icon: UserCheck,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
    },
    {
        title: "Source Transparency",
        description: "Every answer includes citations with law names and section numbers for your own verification.",
        icon: FileText,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
    },
    {
        title: "Guardrails & Safety",
        description: "Strictly provides information, not advice. refuses illegal requests to ensure legal compliance.",
        icon: MessageSquareOff,
        color: "text-red-500",
        bg: "bg-red-500/10",
    },
];

export function Features() {
    return (
        <section id="features" className="py-24 bg-muted/30">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="font-serif text-3xl font-bold tracking-tighter sm:text-5xl">
                            Powerful Features for Pakistani Law
                        </h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            AskQanoon combines cutting-edge AI with indexed legal documents to provide accurate information at your fingertips.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                            <Card className="h-full border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                                <CardHeader>
                                    <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${feature.bg} ${feature.color}`}>
                                        <feature.icon className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="font-serif text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
