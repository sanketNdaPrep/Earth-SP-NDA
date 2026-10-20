import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { LandingProviders } from '@/components/landing-data';
import './globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const viewport: Viewport = {
  themeColor: '#020617',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  title: 'EARTH SP NDA | Practice Tests & Notes',
  description: 'Practice tests, free notes and study plans for NDA, CDS and AFCAT aspirants who study on their own.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col font-sans antialiased selection:bg-emerald-400/30 selection:text-emerald-900">
        <LandingProviders>
          {children}
        </LandingProviders>
      </body>
    </html>
  );
}