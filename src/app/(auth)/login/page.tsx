
import LoginForm from "@/components/auth/LoginForm";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 relative">
            <Link href="/" className="absolute top-8 left-8">
                <Button variant="ghost" className="gap-2 text-slate-600 hover:text-primary">
                    <ChevronLeft className="h-4 w-4" />
                    Back to Home
                </Button>
            </Link>
            <LoginForm />
        </div>
    );
}
