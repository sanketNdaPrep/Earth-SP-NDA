import { notFound } from "next/navigation";
import { Avatar, AVATARS } from "@/components/ui/avatars";

export const metadata = { title: "Avatars (dev only)", robots: { index: false } };

export default function AvatarsDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="bg-navy-950 text-steel-100 min-h-screen px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-2xl font-bold text-white">Avatars</h1>
        <section aria-label="All 10 avatars" className="space-y-3">
          <h2 className="text-sm font-semibold text-steel-300">Large</h2>
          <ul className="flex list-none flex-wrap gap-4 p-0">
            {AVATARS.map((a) => (
              <li key={a.id} className="flex flex-col items-center gap-1 text-xs text-steel-300">
                <Avatar avatarId={a.id} size="lg" />
                {a.label}
              </li>
            ))}
          </ul>
        </section>
        <section aria-label="Sizes and initials" className="space-y-3">
          <h2 className="text-sm font-semibold text-steel-300">Sizes and initials fallback</h2>
          <div className="flex items-center gap-4">
            <Avatar avatarId={1} size="sm" />
            <Avatar avatarId={1} size="md" />
            <Avatar name="Sanket Kumar" />
            <Avatar email="cadet@earthspnda.com" size="sm" />
            <Avatar />
          </div>
        </section>
      </div>
    </main>
  );
}
