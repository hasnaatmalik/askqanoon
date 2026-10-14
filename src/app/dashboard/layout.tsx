import { Sidebar, MobileNav } from "@/components/dashboard/sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="flex h-[100dvh] bg-background">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-background px-4 lg:hidden">
                    <Link href="/" className="font-display text-lg font-semibold tracking-tight">Ask<span className="text-primary">Qanoon</span></Link>
                    <Link href="/chat" className="flex items-center gap-1.5 text-sm font-medium text-primary"><MessageSquare className="h-4 w-4" />Ask AI</Link>
                </header>
                <MobileNav />
                <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
