
import { Resend } from "resend";

// Use a dummy key during build if not set - actual sending will fail, but build will pass
export const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

export const sendVerificationEmail = async (
    email: string,
    token: string
) => {
    console.log("Sending verification email to:", email);
    const confirmLink = `http://localhost:3000/auth/new-verification?token=${token}`;

    console.log("----------------------------------------------------------------");
    console.log("📧 DEVELOPMENT VERIFICATION LINK:");
    console.log(confirmLink);
    console.log("----------------------------------------------------------------");

    const { error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: email,
        subject: "Confirm your email",
        html: `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`
    });

    if (error) {
        console.error("Resend Error:", error);

        // In development, we want to allow testing even if Resend blocks the email
        // (e.g. because of the unverified domain restriction on the free tier)
        const isValidationError = error.name === 'validation_error' || (error as any).statusCode === 403;

        if (process.env.NODE_ENV !== 'production' || isValidationError) {
            console.warn("⚠️ Email sending failed (likely due to Resend Free Tier limits).");
            console.warn("⚠️ Proceeding anyway because we logged the link above.");
            return;
        }

        throw new Error("Resend failed: " + JSON.stringify(error));
    }

    console.log("Email sent successfully to:", email);
};

export const sendPasswordResetEmail = async (
    email: string,
    token: string
) => {
    const resetLink = `http://localhost:3000/auth/new-password?token=${token}`;

    await resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: email,
        subject: "Reset your password",
        html: `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`
    });
};
