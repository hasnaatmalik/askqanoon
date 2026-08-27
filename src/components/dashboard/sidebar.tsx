"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, User, Settings, LogOut, FileText, Scale, Search, Users, BookOpen, Mic, Gavel, Calendar, FolderKanban } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

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
        href: "/dashboard/deposition",
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
        <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-white lg:flex">
            <div className="p-6 border-b border-slate-800">
                <Link href="/" className="flex items-center gap-2 font-serif text-2xl">
                    <span className="text-green-500">Ask</span>Qanoon
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-5">
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Workspace</p>
                <div className="flex flex-col gap-1">
                {sidebarItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                            pathname === item.href
                                ? "bg-green-600/20 text-green-400 border border-green-600/30 shadow-sm"
                                : "hover:bg-slate-800 text-slate-400 hover:text-white"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.title}
                    </Link>
                ))}
                </div>
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-2">
                <div className="flex justify-between items-center px-2">
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Theme</span>
                    <ModeToggle />
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10 gap-3"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </Button>
            </div>
        </aside>
    );
}
