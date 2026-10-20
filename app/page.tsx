import { SiteHeader } from '@/components/site-header';
import { Hero } from '@/components/hero';
import { CadetSnapshot } from '@/components/cadet-snapshot';
import { About } from '@/components/about';
import { Journey } from '@/components/journey';
import { Books } from '@/components/books';
import { Vault } from '@/components/vault';
import { Faq } from '@/components/faq';
import { SiteFooter } from '@/components/site-footer';

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <Hero />
        <CadetSnapshot />
        <About />
        <Journey />
        <Books />
        <Vault />
        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}