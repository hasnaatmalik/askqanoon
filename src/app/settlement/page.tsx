"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const tones = ["Aggressive", "Balanced", "Conciliatory"] as const;
type Tone = (typeof tones)[number];

const drafts: Record<Tone, string> = {
  Aggressive:
    "We are prepared to proceed to court and expect a full award. To avoid that cost, we will accept PKR 220,000 in full and final settlement if paid within 7 days. After that date this offer lapses.",
  Balanced:
    "Following the incident of 12 March and the agreed damage assessment of roughly PKR 180,000, we propose a full and final settlement of PKR 185,000, payable within 14 days, in exchange for a written release of all further claims.",
  Conciliatory:
    "We would much rather resolve this without troubling the courts. If PKR 140,000 can be paid within 30 days, we are content to close the matter entirely and consider it settled in good faith.",
};

export default function SettlementPage() {
  const [tone, setTone] = useState<Tone>("Balanced");

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full flex-1 max-w-6xl px-6">
      <section className="border-b border-line py-14">
        <p className="eyebrow">Settlement analyzer</p>
        <h1 className="mt-4 max-w-[22ch] text-[2.4rem] font-semibold leading-[1.05] text-balance sm:text-[2.75rem]">
          How strong is your case, and what should you offer?
        </h1>
        <p className="mt-5 max-w-[54ch] text-base leading-relaxed text-quiet">
          Describe what happened in ordinary language. You&apos;ll get an estimated chance of success,
          a sensible money range, and an email you can actually send.
        </p>
      </section>

      <section className="grid gap-8 py-12 lg:grid-cols-12">
        {/* Inputs */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Your case</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="facts" className="text-sm font-medium">
                  What happened
                </label>
                <textarea
                  id="facts"
                  rows={4}
                  className="mt-1.5 w-full resize-none rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm placeholder:text-quiet focus:border-primary focus:outline-none"
                  placeholder="Car accident, no injuries, property damage around PKR 180,000, the other driver admitted fault."
                />
              </div>
              <div>
                <label htmlFor="opponent" className="text-sm font-medium">
                  About the other side
                </label>
                <input
                  id="opponent"
                  className="mt-1.5 w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm placeholder:text-quiet focus:border-primary focus:outline-none"
                  placeholder="First claim, insurer has been responsive"
                />
              </div>
              <button
                type="button"
                className="w-full rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Analyze case
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4 lg:col-span-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.12em] text-quiet">Win probability</p>
              <p className="mt-2 font-display text-4xl font-semibold">72%</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-panel">
                <div className="h-full w-[72%] rounded-full bg-primary" />
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-quiet">
                Admitted fault and documented damage make this a strong claim.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.12em] text-quiet">Settlement range</p>
              <dl className="mt-3 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-quiet">Low</dt>
                  <dd className="font-medium">PKR 140,000</dd>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-panel px-2.5 py-1.5">
                  <dt className="font-medium text-primary">Ideal</dt>
                  <dd className="font-semibold text-primary">PKR 185,000</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-quiet">High</dt>
                  <dd className="font-medium">PKR 220,000</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
              <h2 className="text-base font-semibold">Draft settlement offer</h2>
              <div className="flex rounded-full border border-line bg-panel p-0.5 text-xs font-medium">
                {tones.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`rounded-full px-3 py-1.5 transition-colors ${t === tone ? "bg-ink text-background" : "text-quiet"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-5 py-5 text-[15px] leading-relaxed">
              <p className="font-medium">Re: Settlement offer — property damage claim</p>
              <p className="mt-3">Dear Mr. Hassan,</p>
              <p className="mt-3">{drafts[tone]}</p>
              <p className="mt-3">
                Kind regards,
                <br />
                S. Malik, on behalf of the claimant
              </p>
            </div>
            <div className="flex gap-2 border-t border-line px-5 py-4">
              <button
                type="button"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Copy email
              </button>
              <button
                type="button"
                className="rounded-full border border-line px-4 py-2 text-sm font-medium transition-colors hover:bg-panel"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>
  );
}
