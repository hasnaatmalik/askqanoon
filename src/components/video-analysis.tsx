"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Video, Loader2, FileText, Scale, ChevronLeft, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoAnalysisProps {
    onBack: () => void;
}

export function VideoAnalysis({ onBack }: VideoAnalysisProps) {
    const [file, setFile] = useState<File | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setAnalyzing(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/video-analysis", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Analysis failed");
            }

            setResult(data.analysis);
        } catch (err: any) {
            setError(err.message || "An error occurred during analysis.");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="container mx-auto max-w-4xl px-4 py-24">
            <Button
                variant="ghost"
                onClick={onBack}
                className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
                <ChevronLeft className="h-4 w-4" />
                Back to Dashboard
            </Button>

            <div className="space-y-8">
                <div className="text-center space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
                        <Video className="h-8 w-8" />
                    </div>
                    <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground">
                        Forensic <span className="text-primary tracking-normal italic font-medium">Video Analysis</span>
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                        Leverage Gemini 3 "Deep Think" capabilities to analyze video evidence for legal forensic reasoning and Pakistani law context.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-1">
                    <Card className="border-2 border-dashed border-primary/20 bg-primary/5 hover:border-primary/40 transition-all">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <input
                                type="file"
                                accept="video/mp4,video/x-m4v,video/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />

                            {!file ? (
                                <div className="space-y-6">
                                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-background shadow-xl">
                                        <Upload className="h-8 w-8 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xl font-semibold">Upload Video Evidence</p>
                                        <p className="text-sm text-muted-foreground">MP4, MOV or AVI files (Max 50MB for demo)</p>
                                    </div>
                                    <Button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg rounded-xl shadow-lg shadow-primary/20"
                                    >
                                        Select Video File
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6 w-full max-w-md">
                                    <div className="flex items-center gap-4 p-4 bg-background rounded-2xl border border-primary/20 shadow-sm">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <Video className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-semibold truncate">{file.name}</p>
                                            <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setFile(null)}
                                            className="text-destructive hover:bg-destructive/10"
                                        >
                                            Remove
                                        </Button>
                                    </div>

                                    <Button
                                        disabled={analyzing}
                                        onClick={handleUpload}
                                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-lg rounded-xl shadow-lg shadow-primary/20"
                                    >
                                        {analyzing ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Gemini 3 Deep Thinking...
                                            </>
                                        ) : (
                                            "Start Forensic Analysis"
                                        )}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-3 text-2xl font-serif font-bold p-2 border-b-2 border-primary/10">
                                    <ShieldCheck className="h-7 w-7 text-primary" />
                                    Analysis Results
                                </div>

                                <Card className="border-none shadow-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
                                    <CardContent className="p-8">
                                        <div className="prose prose-slate max-w-none dark:prose-invert">
                                            {result.split('\n').map((line, i) => (
                                                <p key={i} className="mb-4 text-slate-700 leading-relaxed font-sans">
                                                    {line}
                                                </p>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                                        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
                                            <Scale className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1">Legal Context</h4>
                                            <p className="text-sm text-muted-foreground">Analysis includes references to relevant Pakistani statutes and legal reasoning.</p>
                                        </div>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 flex items-start gap-4">
                                        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground shrink-0">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1">Deep Think Reasoning</h4>
                                            <p className="text-sm text-muted-foreground">Gemini 3 analyzes cause-and-effect to uncover intent and hidden patterns.</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
