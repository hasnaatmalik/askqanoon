"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Scale, User, ChevronDown, Sparkles } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";
import { DailyTipPopup } from "@/components/notifications/daily-tip-popup";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Scale className="h-6 w-6" />
                    </div>
                    <span className="font-serif text-xl font-bold tracking-tight text-foreground">
                        Ask<span className="text-secondary-foreground">Qanoon</span>
                    </span>
                </Link>
                <div className="hidden items-center gap-1 md:flex">
                    <Link href="/chat" className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-primary">
                        Ask AI
                    </Link>
                    <Link href={session ? "/dashboard" : "/#features"} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-primary">
                        {session ? "Dashboard" : "How it works"}
                    </Link>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-primary">
                                Tools <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-48">
                            <DropdownMenuItem asChild><Link href="/deposition">Deposition prep</Link></DropdownMenuItem>
                            <DropdownMenuItem asChild><Link href="/compliance">Compliance matrix</Link></DropdownMenuItem>
                            <DropdownMenuItem asChild><Link href="/negotiation">Settlement assistant</Link></DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex items-center gap-4">
                    <DailyTipPopup />
                    <ModeToggle />
                    {session ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                    <Avatar className="h-9 w-9 border-2 border-primary/10 transition-transform hover:scale-105">
                                        <AvatarImage src={session.user?.image || ""} />
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                            <User className="h-4 w-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <div className="flex items-center justify-start gap-2 p-2">
                                    <div className="flex flex-col space-y-1 leading-none">
                                        {session.user?.name && (
                                            <p className="font-medium">{session.user.name}</p>
                                        )}
                                        {session.user?.email && (
                                            <p className="w-[200px] truncate text-xs text-muted-foreground">
                                                {session.user.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard" className="cursor-pointer">
                                        Dashboard
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/profile" className="cursor-pointer">
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/settings" className="cursor-pointer">
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600 cursor-pointer"
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                >
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                className="hidden border-primary/20 hover:bg-primary/5 hover:text-primary md:inline-flex"
                                asChild
                            >
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button
                                className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                                asChild
                            >
                                <Link href="/register"><Sparkles className="h-4 w-4" />Get Started</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
