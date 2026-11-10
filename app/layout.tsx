import type { Metadata } from "next";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/toast";

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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-navy-950 text-steel-100 antialiased selection:bg-gold-400 selection:text-navy-950">
        {children}
        <Toaster />
      </body>
    </html>
  );
}