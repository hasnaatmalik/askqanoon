export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-quiet sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[60ch]">
          AskQanoon gives legal information, not legal advice. AI answers can be wrong — check with a
          qualified advocate before you act.
        </p>
        <p className="text-xs uppercase tracking-[0.14em]">Grounded in Pakistani statute</p>
      </div>
    </footer>
  );
}
