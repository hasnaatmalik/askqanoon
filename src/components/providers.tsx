"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <NextThemesProvider
                attribute="class"
                defaultTheme="light"
                forcedTheme="light" // The law-made-simple design is specifically tailored for light mode (warm paper)
                disableTransitionOnChange
            >
                {children}
            </NextThemesProvider>
        </SessionProvider>
    );
}
