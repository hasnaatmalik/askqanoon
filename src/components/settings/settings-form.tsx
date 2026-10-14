"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { KeyRound, LogOut } from "lucide-react";

const rows = [
    {
        Icon: KeyRound,
        title: "Password",
        body: "Get an email link to set a new password.",
        action: <Link href="/forgot-password" className="text-sm font-semibold text-primary hover:underline">Reset password</Link>,
    },
    {
        Icon: LogOut,
        title: "Sign out",
        body: "End your session on this device.",
        action: (
            <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm font-semibold text-flag hover:underline">
                Sign out
            </button>
        ),
    },
];

export default function SettingsForm() {
    return (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-card">
            {rows.map(({ Icon, title, body, action }) => (
                <li key={title} className="flex items-center justify-between gap-4 p-5">
                    <div className="flex items-center gap-3.5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-panel text-primary"><Icon className="h-4 w-4" /></span>
                        <div>
                            <p className="text-[15px] font-semibold">{title}</p>
                            <p className="text-sm text-quiet">{body}</p>
                        </div>
                    </div>
                    {action}
                </li>
            ))}
        </ul>
    );
}
