"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, User, Settings, LogOut, FileText, Scale, Search, Users, BookOpen, Mic, Gavel, Calendar, FolderKanban } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: Home,
    },
    {
        title: "Ask Qanoon",
        href: "/chat",
        icon: MessageSquare,
    },
    {
        title: "Legal Documents",
        href: "/dashboard/documents",
        icon: FileText,
    },
    {
        title: "Inheritance Calc",
        href: "/dashboard/inheritance",
        icon: Scale,
    },
    {
        title: "Case Law Search",
        href: "/dashboard/caselaw",
        icon: Search,
    },
    {
        title: "Community Forum",
        href: "/dashboard/forum",
        icon: Users,
    },
    {
        title: "Know Your Rights",
        href: "/dashboard/rights",
        icon: BookOpen,
    },

    {
        title: "Deposition Prep",
        href: "/deposition",
        icon: Mic,
    },
    {
        title: "Expert Matcher",
        href: "/dashboard/expert-matcher",
        icon: Gavel,
    },
    {
        title: "Filing Tracker",
        href: "/dashboard/filing-tracker",
        icon: Calendar,
    },
    {
        title: "Exhibits Manager",
        href: "/dashboard/exhibit-manager",
        icon: FolderKanban,
    },
    {
        title: "Profile",
        href: "/dashboard/profile",
        icon: User,
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-line bg-panel lg:flex">
            <div className="border-b border-line p-6">
                <Link href="/" className="font-display text-2xl font-semibold tracking-tight">
                    Ask<span className="text-primary">Qanoon</span>
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Workspace">
                <p className="eyebrow mb-2 px-3 !text-quiet">Workspace</p>
                <div className="flex flex-col gap-0.5">
                    {sidebarItems.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                    active ? "bg-card text-primary shadow-sm ring-1 ring-line" : "text-quiet hover:bg-card hover:text-ink"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <div className="border-t border-line p-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-quiet hover:bg-card hover:text-flag"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <LogOut className="h-4 w-4" />
                    Sign out
                </Button>
            </div>
        </aside>
    );
}

/** Horizontal tab strip so every workspace page stays reachable on phones. */
export function MobileNav() {
    const pathname = usePathname();
    return (
        <nav className="flex shrink-0 gap-2 overflow-x-auto border-b border-line bg-background px-4 py-2.5 lg:hidden" aria-label="Workspace">
            {sidebarItems.map((item) => {
                const active = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                            "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                            active ? "border-ink bg-ink text-background" : "border-line bg-card text-quiet hover:text-ink"
                        )}
                    >
                        {item.title}
                    </Link>
                );
            })}
        </nav>
    );
}
