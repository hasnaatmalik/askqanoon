import { PageShell, PageIntro } from "@/components/page-shell";
import { SettlementTool } from "@/components/negotiation/settlement-tool";

export const metadata = { title: "Settlement analyzer — AskQanoon" };

export default function SettlementPage() {
  return (
    <PageShell>
      <PageIntro eyebrow="Settlement analyzer" title="How strong is your case, and what should you offer?">
        Describe what happened in ordinary language. You&apos;ll get an estimated chance of success, a sensible money range, and a letter you can actually send.
      </PageIntro>
      <SettlementTool />
    </PageShell>
  );
}
