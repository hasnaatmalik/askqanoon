"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfileForm() {
    const { data: session, status } = useSession();
    const user = session?.user;

    return (
        <div className="rounded-2xl border border-line bg-card p-6">
            <dl className="space-y-5">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-panel text-primary"><User className="h-4 w-4" /></span>
                    <div>
                        <dt className="text-xs uppercase tracking-[0.12em] text-quiet">Name</dt>
                        <dd className="text-[15px] font-medium">{status === "loading" ? "…" : user?.name || "Not set"}</dd>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-panel text-primary"><Mail className="h-4 w-4" /></span>
                    <div>
                        <dt className="text-xs uppercase tracking-[0.12em] text-quiet">Email</dt>
                        <dd className="text-[15px] font-medium">{status === "loading" ? "…" : user?.email || "Not set"}</dd>
                    </div>
                </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5">
                <Button variant="outline" asChild>
                    <Link href="/forgot-password">Change password</Link>
                </Button>
                <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>Sign out</Button>
            </div>
        </div>
    );
}
