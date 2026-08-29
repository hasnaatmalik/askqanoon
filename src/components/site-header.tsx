import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

const nav = [
  { to: "/", label: "Ask" },
  { to: "/compliance", label: "Compliance" },
  { to: "/settlement", label: "Settlement" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-6">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight">
          Ask<span className="text-primary">Qanoon</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {nav.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              className="rounded-full px-3.5 py-1.5 font-medium text-quiet transition-colors hover:text-ink hover:bg-panel"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <span className="hidden text-xs font-medium uppercase tracking-[0.14em] text-quiet sm:inline">
            PPC · CrPC · Constitution
          </span>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
