
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ForumList from "@/components/forum/forum-list";
import { Button } from "@/components/ui/button";

export default function ForumPage() {
    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Community Forum</h1>
                    <p className="text-muted-foreground mt-1">Connect with lawyers, students, and citizens.</p>
                </div>
            </div>

            <div className="flex-1">
                <ForumList />
            </div>
        </div>
    );
}
