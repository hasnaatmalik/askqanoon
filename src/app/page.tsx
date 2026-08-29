"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const starters = [
  "What happens if my landlord keeps my deposit?",
  "Can I refuse a police summons?",
  "How do I report an online order gone wrong?",
  "What are my rights as a tenant?",
];

const sources = [
  {
    tag: "S1",
    title: "Pakistan Penal Code — Section 379",
    body: "Whoever dishonestly takes any movable property out of another person's possession commits theft.",
  },
  {
    tag: "S2",
    title: "Code of Criminal Procedure — Section 154",
    body: "Information relating to a cognizable offence shall be reduced to writing: the FIR.",
  },
];

const steps = [
  {
    n: "01",
    title: "Ask in your own words",
    body: "English or Roman Urdu, no legal vocabulary needed.",
  },
  {
    n: "02",
    title: "We search the statute books",
    body: "The question is matched against the real text of Pakistani law.",
  },
  {
    n: "03",
    title: "You get the section number",
    body: "Every claim carries the source it was pulled from, so you can verify it.",
  },
];

export default function Home() {
  const [lang, setLang] = useState<"en" | "ur">("en");
  const [question, setQuestion] = useState("");
  const router = useRouter();

  const handleAsk = () => {
    if (!question.trim()) return;
    router.push(`/chat?q=${encodeURIComponent(question)}&lang=${lang}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full flex-1 max-w-6xl px-6">
      {/* Ask */}
      <section className="grid gap-10 border-b border-line py-14 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-5">
          <p className="eyebrow">Ask one question at a time</p>
          <h1 className="mt-4 text-[2.6rem] font-semibold leading-[1.03] text-balance sm:text-5xl">
            What does the law say about your situation?
          </h1>
          <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-quiet">
            Plain-English answers for everyday Pakistani legal questions. No jargon, no lawyer
            required to get started.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
            <div className="bg-card px-4 py-3.5">
              <dt className="text-xs uppercase tracking-[0.12em] text-quiet">Sources</dt>
              <dd className="mt-1 font-display text-lg font-semibold">PPC · CrPC</dd>
            </div>
            <div className="bg-card px-4 py-3.5">
              <dt className="text-xs uppercase tracking-[0.12em] text-quiet">Languages</dt>
              <dd className="mt-1 font-display text-lg font-semibold">EN · Roman Urdu</dd>
            </div>
          </dl>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <label htmlFor="q" className="text-sm font-semibold">
                Your question
              </label>
              <div className="flex rounded-full border border-line bg-card p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`rounded-full px-3 py-1.5 transition-colors ${lang === "en" ? "bg-ink text-background" : "text-quiet"}`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLang("ur")}
                  className={`rounded-full px-3 py-1.5 transition-colors ${lang === "ur" ? "bg-ink text-background" : "text-quiet"}`}
                >
                  Roman Urdu
                </button>
              </div>
            </div>

            <textarea
              id="q"
              rows={4}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
              placeholder={
                lang === "en"
                  ? "What happens if my landlord refuses to return my deposit?"
                  : "Agar mera landlord deposit wapas na kare to kya hoga?"
              }
              className="mt-3 w-full resize-none rounded-xl border border-line bg-card px-4 py-3 text-[15px] leading-relaxed placeholder:text-quiet focus:border-primary focus:outline-none"
            />

            <div className="mt-3 flex items-center justify-between gap-4">
              <p className="text-xs text-quiet">Answers cite the section they came from.</p>
              <button
                type="button"
                onClick={handleAsk}
                disabled={!question.trim()}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                Ask Qanoon
              </button>
            </div>
          </div>

          <p className="mt-6 text-sm font-medium text-quiet">Or start with one of these</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {starters.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuestion(s)}
                className="rounded-xl border border-line bg-card px-4 py-3 text-left text-sm transition-colors hover:border-primary hover:text-primary"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Example answer */}
      <section className="grid gap-8 border-b border-line py-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow">What an answer looks like</p>
          <h2 className="mt-3 text-2xl font-semibold">Every sentence carries its source</h2>
          <p className="mt-3 text-sm leading-relaxed text-quiet">
            Citation chips link each statement to the statute card beside it. If the law library
            can&apos;t support an answer, AskQanoon says so instead of inventing one.
          </p>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-line bg-card p-5">
            <p className="text-sm font-medium text-quiet">
              If someone steals my phone, what section applies?
            </p>
            <div className="mt-4 border-t border-line pt-4 text-[15px] leading-relaxed">
              <p>
                Taking a phone that isn&apos;t yours is theft under the Pakistan Penal Code.
                <span className="ml-1 rounded bg-panel px-1.5 py-0.5 align-middle text-[11px] font-semibold text-primary">
                  S1
                </span>
              </p>
              <p className="mt-3">
                Report it at your nearest police station — they are required to register an FIR
                for a cognizable offence.
                <span className="ml-1 rounded bg-panel px-1.5 py-0.5 align-middle text-[11px] font-semibold text-primary">
                  S2
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 lg:col-span-3">
          {sources.map((s) => (
            <div key={s.tag} className="rounded-xl border border-line bg-panel p-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                {s.tag}
              </span>
              <p className="mt-1.5 text-sm font-semibold">{s.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-quiet">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-14">
        <p className="eyebrow">How it works</p>
        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="bg-card p-6">
              <span className="font-display text-sm font-semibold text-primary">{s.n}</span>
              <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-quiet">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>
  );
}
