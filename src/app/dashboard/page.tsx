import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    MessageSquare, FileText, Scale, ExternalLink, Search,
    Users, BookOpen, ShieldCheck, TrendingUp, Gavel,
    Calendar, FolderKanban, Sparkles
} from "lucide-react";
import { DailyTipWidget } from "@/components/rights/daily-tip-widget";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Welcome back, {user?.name?.split(" ")[0] || "Counsellor"} 👋
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Your personal legal assistant dashboard.
                    </p>
                </div>
                <Link href="/chat">
                    <Button className="gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90">
                        <MessageSquare className="h-4 w-4" />
                        New Chat
                    </Button>
                </Link>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Consultations</CardTitle>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <MessageSquare className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">12</div>
                        <p className="mt-1 text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                </Card>

                <Card className="border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Saved Documents</CardTitle>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <FileText className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">4</div>
                        <p className="mt-1 text-xs text-muted-foreground">Legal forms & drafts</p>
                    </CardContent>
                </Card>

                <Card className="border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Account Status</CardTitle>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Scale className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Active</div>
                        <p className="mt-1 text-xs text-muted-foreground">Free Tier</p>
                    </CardContent>
                </Card>

                {/* Daily Tip Widget */}
                <DailyTipWidget />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card className="border-border/60 bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-foreground">Recent Activity</CardTitle>
                        <CardDescription>Your latest legal queries and actions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            { title: "How to file an FIR?", date: "2 hours ago" },
                            { title: "Divorce procedure in Punjab", date: "Yesterday" },
                            { title: "Tenant rights inquiry", date: "3 days ago" },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/40 p-3 transition-colors hover:bg-muted/70"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <MessageSquare className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                                        <p className="text-xs text-muted-foreground">{item.date}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Quick Ask CTA */}
                <Card className="border-primary/20 bg-gradient-to-br from-primary/8 to-emerald-500/5 shadow-sm">
                    <CardHeader>
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-foreground">Ask a Legal Question</CardTitle>
                        <CardDescription>
                            Get instant, source-grounded answers from Pakistan&apos;s legal database.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            {[
                                "How do I file an FIR?",
                                "What are tenant rights in Punjab?",
                                "Mujhe bail ke bare mein maloomat chahiye",
                            ].map((q) => (
                                <Link key={q} href={`/chat`}>
                                    <div className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/40 bg-background/60 px-3 py-2 transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary">
                                        <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
                                        <span>{q}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Legal Tools Grid */}
            <Card className="border-border/60 bg-card shadow-sm">
                <CardHeader>
                    <CardTitle className="text-foreground">Legal Tools & Services</CardTitle>
                    <CardDescription>Access our full suite of AI-powered legal assistance tools.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {[
                        { href: "/chat", Icon: MessageSquare, label: "Ask Qanoon AI", desc: "Instant legal answers", color: "text-primary", bg: "bg-primary/10", hoverBorder: "hover:border-primary/40", hoverBg: "hover:bg-primary/5" },
                        { href: "/dashboard/documents", Icon: FileText, label: "Legal Docs", desc: "Generate drafts", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", hoverBorder: "hover:border-blue-500/40", hoverBg: "hover:bg-blue-50/50 dark:hover:bg-blue-950/30" },
                        { href: "/dashboard/inheritance", Icon: Scale, label: "Inheritance", desc: "Islamic shares calc", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10", hoverBorder: "hover:border-purple-500/40", hoverBg: "hover:bg-purple-50/50 dark:hover:bg-purple-950/30" },
                        { href: "/dashboard/caselaw", Icon: Search, label: "Case Search", desc: "Court judgments", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", hoverBorder: "hover:border-amber-500/40", hoverBg: "hover:bg-amber-50/50 dark:hover:bg-amber-950/30" },
                        { href: "/dashboard/forum", Icon: Users, label: "Community", desc: "Anonymous forum", color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-500/10", hoverBorder: "hover:border-pink-500/40", hoverBg: "hover:bg-pink-50/50 dark:hover:bg-pink-950/30" },
                        { href: "/dashboard/rights", Icon: BookOpen, label: "Your Rights", desc: "Daily legal tips", color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-500/10", hoverBorder: "hover:border-teal-500/40", hoverBg: "hover:bg-teal-50/50 dark:hover:bg-teal-950/30" },
                        { href: "/compliance", Icon: ShieldCheck, label: "Compliance Matrix", desc: "Multi-jurisdiction", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", hoverBorder: "hover:border-emerald-500/40", hoverBg: "hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30" },
                        { href: "/negotiation", Icon: TrendingUp, label: "Settlement Agent", desc: "AI negotiation", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-500/10", hoverBorder: "hover:border-indigo-500/40", hoverBg: "hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30" },
                        { href: "/dashboard/expert-matcher", Icon: Gavel, label: "Expert Matcher", desc: "Find witnesses", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10", hoverBorder: "hover:border-violet-500/40", hoverBg: "hover:bg-violet-50/50 dark:hover:bg-violet-950/30" },
                        { href: "/dashboard/filing-tracker", Icon: Calendar, label: "Filing Tracker", desc: "Court deadlines", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10", hoverBorder: "hover:border-orange-500/40", hoverBg: "hover:bg-orange-50/50 dark:hover:bg-orange-950/30" },
                        { href: "/dashboard/exhibit-manager", Icon: FolderKanban, label: "Exhibits Manager", desc: "Organize evidence", color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-500/10", hoverBorder: "hover:border-cyan-500/40", hoverBg: "hover:bg-cyan-50/50 dark:hover:bg-cyan-950/30" },
                    ].map(({ href, Icon, label, desc, color, bg, hoverBorder, hoverBg }) => (
                        <Link key={href} href={href} className="group">
                            <div className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-border/50 bg-muted/30 p-4 text-center transition-all ${hoverBorder} ${hoverBg} hover:shadow-sm h-full min-h-[6rem]`}>
                                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg} ${color} transition-transform group-hover:scale-110`}>
                                    <Icon className="h-4.5 w-4.5 h-[1.125rem] w-[1.125rem]" />
                                </div>
                                <span className="text-xs font-semibold text-foreground leading-tight">{label}</span>
                                <p className="text-[10px] text-muted-foreground leading-tight">{desc}</p>
                            </div>
                        </Link>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
