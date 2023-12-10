import type { Metadata } from "next";

import "./globals.scss";
import { Toaster } from "sonner";

export const metadata: Metadata = {
    title: "FPIS - Frontend",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Toaster richColors position="top-right" />
                {children}
            </body>
        </html>
    );
}
