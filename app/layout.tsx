import { Suspense } from "react";
import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource/barlow-semi-condensed/500.css";
import "@fontsource/barlow-semi-condensed/600.css";
import "@fontsource/barlow-semi-condensed/700.css";
import "@/app/globals.css";
import { ThemeSync } from "@/components/theme/theme-sync";
import { BackBar } from "@/components/ui/back-bar";
import { Toaster } from "@/components/ui/toast";
import { SITE_URL } from "@/lib/site";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { SpeedInsights } from "@vercel/speed-insights/next";

const SITE_TITLE = "EARTH SP NDA - Defence Exam Prep";
const SITE_DESCRIPTION =
  "Free study material, flashcards, mock tests and mentor guidance for NDA, CDS and AFCAT aspirants.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: "%s | EARTH SP NDA" },
  description: SITE_DESCRIPTION,
  applicationName: "EARTH SP NDA",
  openGraph: {
    type: "website",
    siteName: "EARTH SP NDA",
    locale: "en_IN",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-navy-950 text-steel-100 antialiased selection:bg-gold-400 selection:text-navy-950">
        <Suspense fallback={null}>
          <BackBar />
        </Suspense>
        {children}
        <ThemeSync />
        <Toaster />
        <SpeedInsights />
      </body>
    </html>
  );
}