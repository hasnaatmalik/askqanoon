"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";

const nav = [
  { to: "/chat", label: "Ask" },
  { to: "/settlement", label: "Settlement" },
  { to: "/compliance", label: "Compliance" },
  { to: "/deposition", label: "Deposition prep" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);
  const linkClass = (to: string) =>
    `rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-panel hover:text-ink ${
      isActive(to) ? "bg-panel text-ink" : "text-quiet"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight" onClick={() => setOpen(false)}>
          Ask<span className="text-primary">Qanoon</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map((item) => (
            <Link key={item.to} href={item.to} className={linkClass(item.to)} aria-current={isActive(item.to) ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {status !== "loading" &&
            (session ? (
              <Link
                href="/dashboard"
                className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-ink/90"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden rounded-full px-3.5 py-2 text-sm font-medium text-quiet transition-colors hover:bg-panel hover:text-ink sm:block">
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Create account
                </Link>
              </>
            ))}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card text-ink md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-background px-4 pb-4 pt-2 md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link key={item.to} href={item.to} onClick={() => setOpen(false)} className={`${linkClass(item.to)} py-2.5`}>
                {item.label}
              </Link>
            ))}
            {!session && (
              <Link href="/login" onClick={() => setOpen(false)} className={`${linkClass("/login")} py-2.5`}>
                Sign in
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
