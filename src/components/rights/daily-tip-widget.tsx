"use client";

import { Lightbulb } from "lucide-react";
import { useEffect, useState } from "react";
import { getTodaysTip } from "@/data/daily-tips";
import type { DailyTip } from "@/data/daily-tips";

export function DailyTipWidget() {
    const [tip, setTip] = useState<DailyTip | null>(null);

    useEffect(() => {
        setTip(getTodaysTip());
    }, []);

    if (!tip) return null;

    return (
        <aside className="rounded-2xl border border-line bg-warn-soft p-5">
            <p className="eyebrow flex items-center gap-1.5 !text-warn">
                <Lightbulb className="h-3.5 w-3.5" /> Daily legal tip
            </p>
            <h2 className="mt-3 text-lg font-semibold">{tip.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed">{tip.content}</p>
            <p className="mt-3 text-xs italic text-quiet">Source: {tip.source}</p>
        </aside>
    );
}

export default DailyTipWidget;
