"use client";

import { VideoAnalysis } from "@/components/video-analysis";
import { useRouter } from "next/navigation";

export default function VideoPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <VideoAnalysis onBack={() => router.push("/")} />
        </div>
    );
}
