"use client";

import { DepositionSimulator } from "@/components/deposition-simulator";
import { useRouter } from "next/navigation";

export default function DepositionPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background">
            <DepositionSimulator onBack={() => router.push("/")} />
        </div>
    );
}
