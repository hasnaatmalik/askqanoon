import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/** Frame for sign-in / register / password pages. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-1 text-sm font-medium text-quiet transition-colors hover:text-ink">
          <ChevronLeft className="h-4 w-4" /> Home
        </Link>
        <Link href="/" className="font-display text-xl font-semibold tracking-tight">
          Ask<span className="text-primary">Qanoon</span>
        </Link>
        <span className="w-14" aria-hidden />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
