import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { AuthShell } from "@/components/auth/auth-shell";

export default function ForgotPasswordPage() {
    return (
        <AuthShell>
            <ForgotPasswordForm />
        </AuthShell>
    );
}
