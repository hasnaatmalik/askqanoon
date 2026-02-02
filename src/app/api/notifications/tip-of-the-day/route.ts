import { NextResponse } from "next/server";
import { getTodaysTip, getRandomTip, DailyTip } from "@/data/daily-tips";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category") as DailyTip["category"] | null;
        const random = searchParams.get("random") === "true";

        let tip: DailyTip;

        if (random) {
            tip = getRandomTip(category || undefined);
        } else {
            tip = getTodaysTip();
        }

        return NextResponse.json({
            success: true,
            tip,
            date: new Date().toISOString().split("T")[0]
        });
    } catch (error) {
        console.error("Tip of the day error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to get tip" },
            { status: 500 }
        );
    }
}
