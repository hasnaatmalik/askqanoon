
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProfileForm from "@/components/profile/profile-form";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
    return (
        <div className="space-y-6 h-full flex flex-col max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                    <p className="text-muted-foreground mt-1">Manage your account information.</p>
                </div>
            </div>

            <div className="flex-1">
                <ProfileForm />
            </div>
        </div>
    );
}
