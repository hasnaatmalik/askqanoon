"use client";

import { useState } from "react";
import { templates, DocumentTemplate } from "@/data/templates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Printer, Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DocumentGenerator() {
    const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>(templates[0]);
    const [formData, setFormData] = useState<any>({});
    const [copied, setCopied] = useState(false);

    const handleInputChange = (id: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [id]: value }));
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(selectedTemplate.content(formData));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
            {/* Left Column: Template Selection & Inputs */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6 overflow-y-auto pr-2 pb-4">

                {/* Template Selector */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {templates.map((t) => (
                        <div
                            key={t.id}
                            onClick={() => {
                                setSelectedTemplate(t);
                                setFormData({});
                            }}
                            className={cn(
                                "cursor-pointer rounded-xl border p-4 transition-all hover:border-green-500 hover:bg-green-50/50",
                                selectedTemplate.id === t.id
                                    ? "border-green-500 bg-green-50 ring-1 ring-green-500/20"
                                    : "bg-white border-slate-200"
                            )}
                        >
                            <h3 className="font-semibold text-sm mb-1">{t.title}</h3>
                            <p className="text-xs text-slate-500 line-clamp-2">{t.description}</p>
                        </div>
                    ))}
                </div>

                {/* Input Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Fill Details</CardTitle>
                        <CardDescription>Enter the information below to generate your document.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {selectedTemplate.fields.map((field) => (
                            <div key={field.id} className="space-y-2">
                                <Label htmlFor={field.id}>{field.label}</Label>
                                {field.type === "textarea" ? (
                                    <Textarea
                                        id={field.id}
                                        placeholder={field.placeholder}
                                        className="min-h-[100px]"
                                        value={formData[field.id] || ""}
                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                    />
                                ) : (
                                    <Input
                                        id={field.id}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        value={formData[field.id] || ""}
                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                    />
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Live Preview */}
            <div className="w-full lg:w-1/2 flex flex-col h-full bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-inner">
                <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                        <FileText className="h-5 w-5 text-blue-500" />
                        Preview Document
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopy}>
                            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                            {copied ? "Copied" : "Copy Text"}
                        </Button>
                        <Button size="sm" onClick={() => window.print()} className="hidden md:flex">
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                    </div>
                </div>

                <div className="flex-1 p-8 overflow-y-auto font-serif text-slate-800 leading-relaxed whitespace-pre-wrap text-sm md:text-base bg-white m-4 shadow-sm border border-slate-200 min-h-[500px]">
                    {selectedTemplate.content(formData)}
                </div>
            </div>
        </div>
    );
}
