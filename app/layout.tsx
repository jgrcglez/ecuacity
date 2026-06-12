import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {TooltipProvider} from "@/components/ui/tooltip";
import {Toaster} from "@/components/ui/sonner";
import SessionGuard from "@/components/session-guard";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Ecuacity",
    description: "Aplicación Ecuacity",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="es"
            className={`${geistSans.variable} ${geistMono.variable} h-full`}
            data-scroll-behavior="smooth"
        >
        <body className={`${geistSans.className} min-h-full flex flex-col antialiased`}>
        <link rel="preload" href="/landing/quito.jpg" as="image" fetchPriority="high" />
        <TooltipProvider>
        <SessionGuard>
        {children}
        </SessionGuard>
        <Toaster/>
        </TooltipProvider>
        </body>
        </html>
    );
}
