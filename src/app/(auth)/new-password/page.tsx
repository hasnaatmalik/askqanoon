"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import axios from "axios";

function NewPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        if (!token) {
            setError("Missing token");
            setLoading(false);
            return;
        }

        try {
            await axios.post("/api/auth/reset-password", { token, password });
            setMessage("Password reset successful. Redirecting to login...");
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (error) {
            setError("Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Set New Password</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Input
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {message && <p className="text-ok text-sm">{message}</p>}
                    {error && <p className="text-flag text-sm">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Resetting..." : "Reset Password"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default function NewPasswordPage() {
    return (
        <AuthShell>
            <Suspense fallback={<p className="text-center text-quiet">Loading…</p>}>
                <NewPasswordForm />
            </Suspense>
        </AuthShell>
    );
}
