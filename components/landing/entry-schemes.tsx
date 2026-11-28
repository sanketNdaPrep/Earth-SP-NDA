import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TARGET_EXAMS } from "@/lib/landing-content";
import { subjectHref, type Subject } from "@/lib/subjects";
import { createSupabasePublicClient } from "@/lib/supabasePublic";

type SchemeCard = Pick<Subject, "id" | "name" | "slug" | "code" | "description" | "icon_name">;

/** Shown only when the database cannot be reached, so the homepage is never empty by accident. */
const FALLBACK: SchemeCard[] = TARGET_EXAMS.map((exam) => ({
  id: exam.id,
  name: exam.name,
  slug: exam.id,
  code: exam.code,
  description: exam.description,
  icon_name: "shield",
}));

async function loadActiveSubjects(): Promise<SchemeCard[] | null> {
  try {
    const { data, error } = await createSupabasePublicClient()
      .from("subjects")
      .select("id, name, slug, code, description, icon_name")
      .eq("kind", "exam")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    return error ? null : ((data ?? []) as SchemeCard[]);
  } catch {
    return null;
  }
}

/** Quick facts per scheme, from the official syllabus PDFs. A scheme without an entry here simply shows no tiles. */
const FACTS: Record<string, { body: string; facts: { label: string; value: string }[] }> = {
  nda: {
    body: "UPSC",
    facts: [
      { label: "Written", value: "900 marks" },
      { label: "SSB", value: "900 marks" },
      { label: "Maths paper", value: "120 Qs, 2.5 h" },
      { label: "Wrong answer", value: "-1/3 mark" },
    ],
  },
  cds: {
    body: "UPSC",
    facts: [
      { label: "Papers", value: "3 x 100 marks" },
      { label: "SSB", value: "300 marks" },
      { label: "Each paper", value: "2 hours" },
      { label: "Wrong answer", value: "-1/3 mark" },
    ],
  },
  afcat: {
    body: "Indian Air Force",
    facts: [
      { label: "Online test", value: "300 marks" },
      { label: "Questions", value: "100 in 2 hours" },
      { label: "Marking", value: "+3 / -1" },
      { label: "EKT", value: "50 Qs, 45 min" },
    ],
  },
};

/** The "Supported Entry Schemes" cards. Reads the active rows of the subjects table on every visit. */
export async function EntrySchemes() {
  const subjects = (await loadActiveSubjects()) ?? FALLBACK;

  if (subjects.length === 0) {
    return <p className="text-center text-sm text-steel-300">New entry schemes are being added. Please check back soon.</p>;
  }

  return (
    <ul className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-3">
      {subjects.map((subject) => {
        const info = FACTS[subject.slug];
        const page = subjectHref(subject.slug);
        return (
          <li key={subject.id} className="flex">
            <div className="flex w-full flex-col rounded-panel border border-steel-700 bg-navy-900 p-6 shadow-panel transition-colors duration-(--duration-base) ease-(--ease-standard) hover:border-gold-400/60 sm:p-7">
              <div>
                <span className="inline-block rounded-control bg-navy-800 px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wide text-gold-300">{subject.code}</span>
              </div>
              <h3 className="mt-4 text-balance font-display text-3xl font-bold leading-tight text-white">{subject.name}</h3>
              {info ? <p className="mt-1 text-sm text-steel-500">Conducted by {info.body}</p> : null}
              <p className="mt-2 text-pretty text-base leading-relaxed text-steel-300">{subject.description}</p>

              {info ? (
                <dl className="mt-5 grid grid-cols-2 gap-2.5">
                  {info.facts.map((fact) => (
                    <div key={fact.label} className="rounded-control border border-navy-800 bg-navy-950 p-3">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-steel-500">{fact.label}</dt>
                      <dd className="mt-1 text-base font-semibold text-white">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              <div className="mt-auto grid grid-cols-2 gap-2.5 pt-6">
                <Button asChild variant="primary" className="w-full">
                  <Link href={page}>Open folder</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`${page}#syllabus`}>View syllabus</Link>
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function EntrySchemesSkeleton() {
  return (
    <div aria-hidden="true" className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-52 rounded-panel border border-steel-700 bg-navy-900 motion-safe:animate-pulse" />
      ))}
    </div>
  );
}
