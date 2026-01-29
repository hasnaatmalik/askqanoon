"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";

export function Navbar() {
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
                <div className="hidden items-center gap-6 md:flex">
                    <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                        How it works
                    </Link>
                    <Link href="#about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                        About
                    </Link>
                    <Link href="#disclaimer" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                        Disclaimer
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="hidden border-primary/20 hover:bg-primary/5 hover:text-primary md:inline-flex">
                        Login
                    </Button>
                    <Button className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95">
                        Get Started
                    </Button>
                </div>
            </div>
        </nav>
    );
}
