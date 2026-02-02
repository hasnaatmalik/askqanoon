"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { ChatInterface } from "@/components/chat-interface";
import { VideoAnalysis } from "@/components/video-analysis";
import { DepositionSimulator } from "@/components/deposition-simulator";

export default function Home() {
  const [view, setView] = useState<"landing" | "chat" | "video" | "deposition">("landing");
  const [initialQuestion, setInitialQuestion] = useState("");

  const handleStartChat = (question: string) => {
    setInitialQuestion(question);
    setView("chat");
  };

  const handleStartVideo = () => {
    setView("video");
  };

  const handleStartDeposition = () => {
    setView("deposition");
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar onVideoClick={handleStartVideo} onDepositionClick={handleStartDeposition} />
      <AnimatePresence mode="wait">
        {view === "landing" ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Hero onSearch={handleStartChat} />
            <Features />
            <Footer />
          </motion.div>
        ) : view === "chat" ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ChatInterface
              initialQuestion={initialQuestion}
              onBack={() => setView("landing")}
            />
          </motion.div>
        ) : view === "video" ? (
          <motion.div
            key="video"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <VideoAnalysis onBack={() => setView("landing")} />
          </motion.div>
        ) : (
          <motion.div
            key="deposition"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <DepositionSimulator onBack={() => setView("landing")} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
