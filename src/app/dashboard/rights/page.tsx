
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import RightsGrid from "@/components/rights/rights-grid";
import { Button } from "@/components/ui/button";

export default function RightsPage() {
    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Know Your Rights</h1>
                    <p className="text-muted-foreground mt-1">Fundamental rights guaranteed by the Constitution of Pakistan.</p>
                </div>
            </div>

            <div className="flex-1">
                <RightsGrid />
            </div>
        </div>
    );
}
