"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import axios from "axios";

export default function RegisterForm() {
    const router = useRouter();
    // Default name to empty string
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            await axios.post("/api/register", {
                name,
                email,
                password,
            });

            setSuccess("Account created! Redirecting to login...");
            setTimeout(() => {
                router.push("/login");
            }, 1000);
        } catch (error: any) {
            setError(error.response?.data || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Input
                            type="text"
                            aria-label="Full name"
                            autoComplete="name"
                            placeholder="Full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Input
                            type="email"
                            autoComplete="email"
                            aria-label="Email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Input
                            type="password"
                            autoComplete="new-password"
                            aria-label="Password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-flag text-sm">{error}</p>}
                    {success && <p className="text-ok text-sm">{success}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating account…" : "Create account"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="justify-center">
                <Link href="/login" className="text-sm text-primary hover:underline">
                    Already have an account? Sign in
                </Link>
            </CardFooter>
        </Card>
    );
}
