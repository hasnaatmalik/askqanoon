"use client";

import { DepositionSimulator } from "@/components/deposition-simulator";
import { SiteHeader } from "@/components/site-header";
import { useRouter } from "next/navigation";

export default function DepositionPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background">
            <SiteHeader />
            <DepositionSimulator onBack={() => router.push("/")} />
        </div>
    );
}
