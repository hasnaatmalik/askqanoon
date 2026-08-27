"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Extend Window with speech recognition API
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    language?: "en-US" | "ur-PK";
    className?: string;
    size?: "sm" | "default" | "lg";
}

type RecognitionState = "idle" | "listening" | "processing" | "error" | "unsupported";

export function VoiceInput({
    onTranscript,
    language = "en-US",
    className,
    size = "default",
}: VoiceInputProps) {
    const [state, setState] = useState<RecognitionState>("idle");
    const [isSupported, setIsSupported] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const recognitionRef = useRef<any>(null);
    // Track whether we've received a final result — prevents onend from resetting prematurely
    const gotFinalRef = useRef(false);
    const interimTextRef = useRef<string>("");

    useEffect(() => {
        if (typeof window === "undefined") return;
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            setIsSupported(false);
            setState("unsupported");
            return;
        }

        const rec = new SpeechRecognitionAPI();
        // continuous = false → stops automatically after a pause (ideal for queries)
        rec.continuous = false;
        // interimResults = true → we show live feedback while speaking
        rec.interimResults = true;
        rec.maxAlternatives = 1;
        rec.lang = language;

        rec.onstart = () => {
            gotFinalRef.current = false;
            interimTextRef.current = "";
            setState("listening");
            setErrorMessage("");
        };

        rec.onresult = (event: any) => {
            let interimTranscript = "";
            let finalTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    interimTranscript += result[0].transcript;
                }
            }

            // Show live interim text in the input via callback
            if (interimTranscript) {
                interimTextRef.current = interimTranscript;
                // Stream interim result immediately for near-instant feel
                onTranscript(interimTranscript);
            }

            if (finalTranscript) {
                gotFinalRef.current = true;
                interimTextRef.current = "";
                setState("processing");
                onTranscript(finalTranscript.trim());
                // Short delay then return to idle — feels snappy
                setTimeout(() => setState("idle"), 400);
            }
        };

        rec.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            gotFinalRef.current = true; // prevent onend from overriding

            let msg = "Voice input failed. Please try again.";
            if (event.error === "not-allowed") msg = "Microphone access denied. Please allow microphone permissions.";
            else if (event.error === "no-speech") msg = "No speech detected. Please try again.";
            else if (event.error === "network") msg = "Network error. Check your connection.";
            else if (event.error === "audio-capture") msg = "No microphone found.";
            else if (event.error === "aborted") { setState("idle"); return; } // user navigated away

            setState("error");
            setErrorMessage(msg);
            setTimeout(() => { setState("idle"); setErrorMessage(""); }, 3000);
        };

        rec.onend = () => {
            // Only reset to idle if we didn't get a final result and aren't already processing/errored
            // This prevents the race condition where onend fires before onresult in Firefox/Safari
            if (!gotFinalRef.current) {
                setState((prev) => (prev === "listening" ? "idle" : prev));
            }
        };

        recognitionRef.current = rec;

        return () => {
            try { rec.abort(); } catch (_) {}
        };
    // Re-create recognition instance only when language changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language]);

    const toggleListening = useCallback(() => {
        const rec = recognitionRef.current;
        if (!rec) return;

        if (state === "listening") {
            rec.stop();
            setState("idle");
        } else if (state === "idle") {
            gotFinalRef.current = false;
            try {
                rec.lang = language;
                rec.start();
            } catch (e: any) {
                // InvalidStateError means it's already started — abort and retry
                if (e.name === "InvalidStateError") {
                    rec.abort();
                    setTimeout(() => {
                        try { rec.start(); } catch (_) {}
                    }, 100);
                }
            }
        }
    }, [state, language]);

    const sizeClasses = { sm: "h-8 w-8", default: "h-10 w-10", lg: "h-12 w-12" };
    const iconSizes = { sm: "h-4 w-4", default: "h-5 w-5", lg: "h-6 w-6" };

    if (!isSupported) {
        return (
            <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled
                className={cn(sizeClasses[size], "cursor-not-allowed opacity-40", className)}
                title="Voice input not supported in this browser (try Chrome)"
            >
                <MicOff className={cn(iconSizes[size], "text-muted-foreground")} />
            </Button>
        );
    }

    return (
        <div className="relative">
            <Button
                type="button"
                variant={state === "listening" ? "default" : "ghost"}
                size="icon"
                onClick={toggleListening}
                disabled={state === "processing"}
                className={cn(
                    sizeClasses[size],
                    "relative transition-all duration-200",
                    state === "listening" && "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30",
                    state === "error" && "bg-red-500/10 text-red-500",
                    className
                )}
                title={state === "listening" ? "Click to stop listening" : "Click to speak your question"}
            >
                <AnimatePresence mode="wait">
                    {state === "processing" ? (
                        <motion.div key="processing" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                            <Loader2 className={cn(iconSizes[size], "animate-spin")} />
                        </motion.div>
                    ) : (
                        <motion.div key="mic" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                            <Mic className={iconSizes[size]} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Concentric pulsing rings when actively listening */}
                {state === "listening" && (
                    <>
                        <motion.span
                            className="absolute inset-0 rounded-full bg-red-400"
                            initial={{ opacity: 0.5, scale: 1 }}
                            animate={{ opacity: 0, scale: 1.6 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
                        />
                        <motion.span
                            className="absolute inset-0 rounded-full bg-red-400"
                            initial={{ opacity: 0.3, scale: 1 }}
                            animate={{ opacity: 0, scale: 2.0 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                        />
                    </>
                )}
            </Button>

            {/* Error tooltip */}
            <AnimatePresence>
                {errorMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 w-56 px-3 py-2 text-xs text-white bg-red-600 rounded-lg shadow-xl whitespace-normal text-center"
                    >
                        {errorMessage}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default VoiceInput;
