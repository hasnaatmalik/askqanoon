import { Info } from "lucide-react";

/** Shown on tools that run on sample data, so nobody mistakes it for real court records. */
export function PreviewNotice() {
    return (
        <p className="mb-6 flex items-start gap-2.5 rounded-xl bg-warn-soft px-4 py-3 text-sm leading-snug">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
            <span>
                <strong className="font-semibold">Preview.</strong> This tool shows sample data to demonstrate the workflow. It isn&apos;t connected to any court system.
            </span>
        </p>
    );
}
