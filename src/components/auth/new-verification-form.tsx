"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Loader2 } from "lucide-react";

export const NewVerificationForm = () => {
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();

    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const onSubmit = useCallback(() => {
        if (success || error) return;

        if (!token) {
            setError("Missing token!");
            return;
        }

        axios.post("/api/new-verification", { token })
            .then(() => {
                setSuccess("Email verified!");
            })
            .catch((err) => {
                setError(err.response?.data || "Something went wrong!");
            });
    }, [token, success, error]);

    useEffect(() => {
        onSubmit();
    }, [onSubmit]);

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <h1 className="text-2xl font-bold">Email Verification</h1>
            {!success && !error && (
                <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            )}

            {!success && !error && (
                <p>Verifying your email...</p>
            )}

            {success && (
                <div className="text-green-500 bg-green-100 p-3 rounded-md">
                    {success}
                </div>
            )}

            {error && (
                <div className="text-red-500 bg-red-100 p-3 rounded-md">
                    {error}
                </div>
            )}

            <Link href="/auth/signin" className="underline">
                Back to login
            </Link>
        </div>
    );
};
