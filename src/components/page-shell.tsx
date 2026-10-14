import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/** Standard page frame: header, centred content column, footer. */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <section className="border-b border-line py-10 sm:py-14">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-4 max-w-[26ch] text-balance text-[2.1rem] font-semibold leading-[1.08] sm:text-[2.6rem]">{title}</h1>
      {children && <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-quiet">{children}</p>}
    </section>
  );
}
