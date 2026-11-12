import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { FooterDemo, FooterFourColumnDemo, FooterMinimalDemo } from "@/components/ui/footer-demo";

export const metadata = { title: "Footer (dev only)", robots: { index: false } };

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="px-4 font-mono text-xs uppercase tracking-wider text-steel-300 sm:px-8">{title}</h2>
      {children}
    </section>
  );
}

export default function FooterDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="flex min-h-dvh w-full flex-col gap-12 bg-navy-950 py-12 text-steel-100">
      <div className="flex items-center gap-3 px-4 sm:px-8">
        <h1 className="text-2xl font-semibold text-white">Footer</h1>
        <Badge variant="outline">Sample copy</Badge>
      </div>
      <Block title="Full: brand, highlights, legal">
        <FooterDemo />
      </Block>
      <Block title="Minimal: one column only">
        <FooterMinimalDemo />
      </Block>
      <Block title="Four columns">
        <FooterFourColumnDemo />
      </Block>
    </main>
  );
}