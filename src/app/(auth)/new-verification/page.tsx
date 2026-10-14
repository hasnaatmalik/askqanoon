import { Suspense } from "react";
import { NewVerificationForm } from "@/components/auth/new-verification-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function NewVerificationPage() {
    return (
        <AuthShell>
            <Suspense fallback={<p className="text-center text-quiet">Loading…</p>}>
                <NewVerificationForm />
            </Suspense>
        </AuthShell>
    );
}
