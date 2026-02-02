"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// SpeechRecognition types for browser compatibility
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

interface SpeechRecognitionInstance {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onstart: (() => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
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
    size = "default"
}: VoiceInputProps) {
    const [state, setState] = useState<RecognitionState>("idle");
    const [isSupported, setIsSupported] = useState(true);
    const [recognition, setRecognition] = useState<SpeechRecognitionInstance | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");

    // Check for browser support
    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SpeechRecognitionAPI) {
                setIsSupported(false);
                setState("unsupported");
            } else {
                const recognitionInstance = new SpeechRecognitionAPI();
                recognitionInstance.continuous = false;
                recognitionInstance.interimResults = true;
                recognitionInstance.lang = language;
                setRecognition(recognitionInstance);
            }
        }
    }, [language]);

    // Handle recognition events
    useEffect(() => {
        if (!recognition) return;

        recognition.onstart = () => {
            setState("listening");
            setErrorMessage("");
        };

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map((result) => result[0].transcript)
                .join("");

            if (event.results[0].isFinal) {
                setState("processing");
                onTranscript(transcript);
                setTimeout(() => setState("idle"), 500);
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setState("error");

            switch (event.error) {
                case "not-allowed":
                    setErrorMessage("Microphone access denied. Please allow microphone permissions.");
                    break;
                case "no-speech":
                    setErrorMessage("No speech detected. Please try again.");
                    break;
                case "network":
                    setErrorMessage("Network error. Check your connection.");
                    break;
                default:
                    setErrorMessage("Voice input failed. Please try again.");
            }

            setTimeout(() => {
                setState("idle");
                setErrorMessage("");
            }, 3000);
        };

        recognition.onend = () => {
            if (state === "listening") {
                setState("idle");
            }
        };

        return () => {
            recognition.onstart = null;
            recognition.onresult = null;
            recognition.onerror = null;
            recognition.onend = null;
        };
    }, [recognition, onTranscript, state]);

    const toggleListening = useCallback(() => {
        if (!recognition) return;

        if (state === "listening") {
            recognition.stop();
            setState("idle");
        } else {
            recognition.lang = language;
            recognition.start();
        }
    }, [recognition, state, language]);

    const sizeClasses = {
        sm: "h-8 w-8",
        default: "h-10 w-10",
        lg: "h-12 w-12",
    };

    const iconSizes = {
        sm: "h-4 w-4",
        default: "h-5 w-5",
        lg: "h-6 w-6",
    };

    if (!isSupported) {
        return (
            <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled
                className={cn(sizeClasses[size], "cursor-not-allowed opacity-50", className)}
                title="Voice input not supported in this browser"
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
                    state === "listening" && "bg-red-500 hover:bg-red-600 text-white",
                    state === "error" && "bg-red-100 text-red-600",
                    className
                )}
                title={
                    state === "listening"
                        ? "Click to stop listening"
                        : "Click to speak your question"
                }
            >
                <AnimatePresence mode="wait">
                    {state === "processing" ? (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        >
                            <Loader2 className={cn(iconSizes[size], "animate-spin")} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="mic"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        >
                            <Mic className={iconSizes[size]} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pulsing ring animation when listening */}
                {state === "listening" && (
                    <motion.span
                        className="absolute inset-0 rounded-full bg-red-400"
                        initial={{ opacity: 0.6, scale: 1 }}
                        animate={{ opacity: 0, scale: 1.5 }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                )}
            </Button>

            {/* Error tooltip */}
            <AnimatePresence>
                {errorMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 w-48 px-3 py-2 text-xs text-white bg-red-600 rounded-lg shadow-lg whitespace-normal text-center"
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
