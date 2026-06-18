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

const siteUrl = "https://ecuacity.com";

export const metadata: Metadata = {
    title: {
        template: "%s | Ecuacity",
        default: "Ecuacity — Simulador de Ciudadanía Ecuatoriana",
    },
    description:
        "Prepárate para el examen de naturalización ecuatoriana con nuestro simulador oficial. Más de 1,000 preguntas de historia, geografía, cultura y leyes del Ecuador.",
    icons: "/logo.png",
    metadataBase: new URL(siteUrl),
    alternates: { canonical: siteUrl },
    openGraph: {
        title: "Ecuacity — Simulador de Ciudadanía Ecuatoriana",
        description:
            "Prepárate para el examen de naturalización. Más de 1,000 preguntas oficiales.",
        url: siteUrl,
        siteName: "Ecuacity",
        locale: "es_EC",
        type: "website",
        images: [{ url: "/logo.png", width: 512, height: 512 }],
    },
    twitter: {
        card: "summary",
        title: "Ecuacity — Simulador de Ciudadanía",
        description: "Prepárate para el examen de naturalización ecuatoriana.",
        images: ["/logo.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    keywords: [
        "examen ciudadanía ecuatoriana",
        "naturalización Ecuador",
        "simulador examen Ecuador",
        "preguntas ciudadanía Ecuador",
        "test naturalización ecuatoriana",
        "ciudadanía ecuatoriana",
        "examen de nacionalidad Ecuador",
    ],
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{
            __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: "Ecuacity",
                url: siteUrl,
                description: "Simulador de examen de ciudadanía ecuatoriana con más de 1,000 preguntas.",
                applicationCategory: "EducationalApplication",
                operatingSystem: "All",
                offers: { "@type": "Offer", price: "9.99", priceCurrency: "USD" },
                author: { "@type": "Organization", name: "Ecuacity" },
            }),
        }} />
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
