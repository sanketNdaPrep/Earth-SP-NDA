import type { Metadata } from "next";
import "@/app/globals.css";
import { ThemeSync } from "@/components/theme/theme-sync";
import { Toaster } from "@/components/ui/toast";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

export const metadata: Metadata = {
  title: "EARTH SP NDA - Tactical Defence Exam Prep",
  description:
    "Enterprise-grade study tracking, interactive mock papers, and real-time performance analytics tailored for NDA, CDS, and AFCAT defence aspirants.",
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
        {children}
        <ThemeSync />
        <Toaster />
      </body>
    </html>
  );
}