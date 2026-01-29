"use client";

import { motion } from "framer-motion";
import { Search, ArrowRight, Gavel, ShieldCheck, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const suggestions = [
    "How to file an FIR?",
    "Is this offense bailable?",
    "Tenant rights in Punjab?",
    "Process for cybercrime complaint?",
];

export function Hero() {
    return (
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-20">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_50%,var(--primary-foreground)_0%,transparent_100%)] opacity-20" />
            <div className="absolute top-1/4 -left-20 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-[100px]" />
            <div className="absolute bottom-1/4 -right-20 -z-10 h-72 w-72 rounded-full bg-secondary/10 blur-[100px]" />

            <div className="container px-4 text-center md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4"
                >
                    <Badge variant="outline" className="border-secondary/30 bg-secondary/10 px-4 py-1.5 text-secondary-foreground backdrop-blur-sm">
                        Pakistani Legal Information Assistant
                    </Badge>
                    <h1 className="font-serif text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                        Understand Pakistani Law. <br />
                        <span className="bg-gradient-to-r from-primary to-secondary-foreground bg-clip-text text-transparent">
                            Simply.
                        </span>
                    </h1>
                    <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
                        Ask any legal question in English or Roman Urdu and get clear, documented answers based on Pakistan's legal framework.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mx-auto mt-10 max-w-2xl"
                >
                    <div className="relative group">
                        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/50 to-secondary/50 opacity-20 blur transition duration-1000 group-hover:opacity-40" />
                        <div className="relative flex items-center rounded-2xl border border-border/50 bg-background/80 p-2 shadow-2xl backdrop-blur-md">
                            <Search className="ml-4 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Ex: What are the requirements for a valid nikkah?"
                                className="border-0 bg-transparent text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                            <Button size="lg" className="h-12 rounded-xl bg-primary px-8 text-primary-foreground transition-all hover:bg-primary/90">
                                Ask Qanoon
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        {suggestions.map((suggestion, i) => (
                            <motion.button
                                key={suggestion}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                                className="rounded-full border border-border/50 bg-background/50 px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                            >
                                {suggestion}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Feature quick bits */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-3"
                >
                    <div className="flex flex-col items-center space-y-2">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Gavel className="h-6 w-6" />
                        </div>
                        <h3 className="font-serif text-xl font-bold">RAG Powered</h3>
                        <p className="text-sm text-muted-foreground">Responses directly from PPC, CrPC & Family Laws.</p>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary-foreground">
                            <Languages className="h-6 w-6" />
                        </div>
                        <h3 className="font-serif text-xl font-bold">Bilingual Support</h3>
                        <p className="text-sm text-muted-foreground">Ask in English or Roman Urdu for your convenience.</p>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <h3 className="font-serif text-xl font-bold">Safe & Verified</h3>
                        <p className="text-sm text-muted-foreground">No verdicts or guarantees—just verified information.</p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
