
import RegisterForm from "@/components/auth/RegisterForm";
import Link from "next/link";
import { ChevronLeft, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
    return (
        <div className="relative flex min-h-screen items-center justify-center bg-background overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_40%,oklch(0.45_0.12_160_/_0.12)_0%,transparent_80%)]" />
                <div className="absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
                <div className="absolute -right-32 bottom-1/3 h-80 w-80 rounded-full bg-secondary/15 blur-[100px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.5_0.08_160_/_0.03)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.5_0.08_160_/_0.03)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
            </div>

            {/* Back button */}
            <Link href="/" className="absolute top-6 left-6 z-10">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/60">
                    <ChevronLeft className="h-4 w-4" />
                    Back to Home
                </Button>
            </Link>

            {/* Brand mark top center */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-60">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Scale className="h-4 w-4" />
                </div>
                <span className="font-serif text-sm font-bold tracking-tight text-foreground">AskQanoon</span>
            </div>

            <RegisterForm />
        </div>
    );
}
