import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { LandingProviders } from '@/components/landing-data';
import './globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const viewport: Viewport = {
  themeColor: '#09090b',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  title: 'EARTH SP NDA | Practice Tests & Notes',
  description: 'Practice tests, free notes and study plans for NDA, CDS and AFCAT aspirants who study on their own.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
        <LandingProviders>
          {children}
        </LandingProviders>
      </body>
    </html>
  );
}