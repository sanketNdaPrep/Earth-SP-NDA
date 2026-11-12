import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BadgeAliases,
  BadgeDotVariants,
  BadgeSolidVariants,
  BadgeVariants,
} from "@/components/ui/badge-variants";

export const metadata = { title: "Badge (dev only)", robots: { index: false } };

export default function BadgeDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-10 bg-navy-950 px-4 py-12 text-steel-100 sm:px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-white">Badge</h1>
        <Badge variant="outline">Sample copy</Badge>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Variants</h2>
        <BadgeVariants />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Aliases (secondary, destructive)</h2>
        <BadgeAliases />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Solid</h2>
        <BadgeSolidVariants />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">With dot</h2>
        <BadgeDotVariants />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">In context</h2>
        <Card className="max-w-sm">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="gold">NDA Maths</Badge>
              <Badge variant="emerald" dot>Live</Badge>
              <Badge variant="danger" solid>Closes today</Badge>
              <Badge variant="outline">Free</Badge>
            </div>
            <CardTitle className="text-base font-semibold leading-6">Mock test 4</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-steel-300">
            Badges wrap onto a second row on narrow screens instead of overflowing.
          </CardContent>
        </Card>
      </section>
    </main>
  );
}