import LoginForm from "@/components/auth/LoginForm";
import { AuthShell } from "@/components/auth/auth-shell";

export default function LoginPage() {
    return (
        <AuthShell>
            <LoginForm />
        </AuthShell>
    );
}
