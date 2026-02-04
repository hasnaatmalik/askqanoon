import { Suspense } from "react";
import { NewVerificationForm } from "@/components/auth/new-verification-form";

const NewVerificationPage = () => {
    return (
        <div className="h-full flex items-center justify-center my-10">
            <Suspense fallback={<div>Loading...</div>}>
                <NewVerificationForm />
            </Suspense>
        </div>
    );
}

export default NewVerificationPage;
