import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import {
    MessageSquare, FileText, Scale, Search, Users, BookOpen, ShieldCheck,
    TrendingUp, Gavel, Calendar, FolderKanban, Mic, ArrowRight,
} from "lucide-react";
import { DailyTipWidget } from "@/components/rights/daily-tip-widget";

const tools = [
    { href: "/chat", Icon: MessageSquare, label: "Ask Qanoon", desc: "Plain answers with sources" },
    { href: "/dashboard/documents", Icon: FileText, label: "Legal documents", desc: "Rent agreements, affidavits" },
    { href: "/dashboard/inheritance", Icon: Scale, label: "Inheritance", desc: "Calculate Islamic shares" },
    { href: "/dashboard/caselaw", Icon: Search, label: "Case law", desc: "Search court judgments" },
    { href: "/dashboard/rights", Icon: BookOpen, label: "Know your rights", desc: "Constitutional rights" },
    { href: "/dashboard/forum", Icon: Users, label: "Community forum", desc: "Ask anonymously" },
    { href: "/settlement", Icon: TrendingUp, label: "Settlement", desc: "Case strength and offer letter" },
    { href: "/compliance", Icon: ShieldCheck, label: "Compliance", desc: "Compare jurisdictions" },
    { href: "/deposition", Icon: Mic, label: "Deposition prep", desc: "Practise with an examiner" },
    { href: "/dashboard/expert-matcher", Icon: Gavel, label: "Expert matcher", desc: "Find expert witnesses" },
    { href: "/dashboard/filing-tracker", Icon: Calendar, label: "Filing tracker", desc: "Court deadlines" },
    { href: "/dashboard/exhibit-manager", Icon: FolderKanban, label: "Exhibits", desc: "Organise evidence" },
];

async function loadActivity(userId?: string) {
    if (!userId) return { count: 0, recent: [] as { id: string; title: string; updatedAt: Date }[] };
    try {
        const [count, recent] = await Promise.all([
            prisma.conversation.count({ where: { userId } }),
            prisma.conversation.findMany({
                where: { userId },
                orderBy: { updatedAt: "desc" },
                take: 5,
                select: { id: true, title: true, updatedAt: true },
            }),
        ]);
        return { count, recent };
    } catch (error) {
        console.error("Dashboard activity error:", error);
        return { count: 0, recent: [] };
    }
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; name?: string | null } | undefined;
    const { count, recent } = await loadActivity(user?.id);
    const firstName = user?.name?.split(" ")[0];

    return (
        <div className="mx-auto max-w-5xl space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="eyebrow">Your workspace</p>
                    <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
                        {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
                    </h1>
                </div>
                <Link
                    href="/chat"
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    <MessageSquare className="h-4 w-4" /> Ask a question
                </Link>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <section className="rounded-2xl border border-line bg-card p-5 lg:col-span-2">
                    <div className="flex items-baseline justify-between">
                        <h2 className="text-lg font-semibold">Recent questions</h2>
                        {count > 0 && <span className="text-sm text-quiet">{count} in total</span>}
                    </div>
                    {recent.length === 0 ? (
                        <div className="mt-4 rounded-xl border border-dashed border-line p-6 text-center">
                            <p className="text-sm text-quiet">Nothing here yet. Your saved questions will show up after you ask one.</p>
                            <Link href="/chat" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                                Ask your first question <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    ) : (
                        <ul className="mt-3 divide-y divide-line">
                            {recent.map((c) => (
                                <li key={c.id}>
                                    <Link
                                        href={`/chat?q=${encodeURIComponent(c.title.replace(/\.{3}$/, ""))}`}
                                        className="flex items-center justify-between gap-4 py-3 transition-colors hover:text-primary"
                                    >
                                        <span className="truncate text-[15px] font-medium">{c.title}</span>
                                        <span className="shrink-0 text-xs text-quiet">
                                            {formatDistanceToNow(c.updatedAt, { addSuffix: true })}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <DailyTipWidget />
            </div>

            <section>
                <h2 className="text-lg font-semibold">Tools</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {tools.map(({ href, Icon, label, desc }) => (
                        <Link
                            key={href}
                            href={href}
                            className="group flex items-center gap-3.5 rounded-2xl border border-line bg-card p-4 transition-colors hover:border-primary"
                        >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-panel text-primary">
                                <Icon className="h-[1.125rem] w-[1.125rem]" />
                            </span>
                            <span className="min-w-0">
                                <span className="block text-sm font-semibold">{label}</span>
                                <span className="block truncate text-[13px] text-quiet">{desc}</span>
                            </span>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
