"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { getTodaysTip } from "@/data/daily-tips";
import { useEffect, useState } from "react";
import type { DailyTip } from "@/data/daily-tips";

export function DailyTipWidget() {
    const [tip, setTip] = useState<DailyTip | null>(null);

    useEffect(() => {
        setTip(getTodaysTip());
    }, []);

    if (!tip) return null;

    return (
        <Card className="shadow-md border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-400">
                    Daily Legal Tip
                </CardTitle>
                <Lightbulb className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
                <div className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-1">
                    {tip.title}
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300 line-clamp-3">
                    {tip.content}
                </p>
                <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-2 italic">
                    Source: {tip.source}
                </p>
            </CardContent>
        </Card>
    );
}

export default DailyTipWidget;
