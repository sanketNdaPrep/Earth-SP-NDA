import Link from "next/link";
import { Icons } from "@/components/ui/icons";
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
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    return error ? null : ((data ?? []) as SchemeCard[]);
  } catch {
    return null;
  }
}

/** The "Supported Entry Schemes" cards. Reads the active rows of the subjects table on every visit. */
export async function EntrySchemes() {
  const subjects = (await loadActiveSubjects()) ?? FALLBACK;

  if (subjects.length === 0) {
    return <p className="text-center text-sm text-steel-300">New entry schemes are being added. Please check back soon.</p>;
  }

  return (
    <ul className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-3">
      {subjects.map((subject) => {
        const Icon = Icons[subject.icon_name as keyof typeof Icons] ?? Icons.shield;
        return (
          <li key={subject.id}>
            <Link href={subjectHref(subject.slug)} className="group block h-full">
              <div className="flex h-full flex-col justify-between rounded-panel border border-steel-700 bg-navy-900 p-6 shadow-panel transition-all duration-300 group-hover:border-gold-400/60 group-hover:shadow-gold-400/10">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-gold-300">{subject.code}</span>
                    <Icon className="size-5 text-steel-500 transition-colors group-hover:text-gold-400" aria-hidden />
                  </div>
                  <h3 className="mt-2 text-xl font-bold text-white group-hover:text-gold-300">{subject.name}</h3>
                  <p className="mt-2 text-sm text-steel-300">{subject.description}</p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-steel-700/60 pt-4 text-xs text-steel-300">
                  <span>View syllabus and mock tests</span>
                  <Icons.chevronRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:text-gold-400" aria-hidden />
                </div>
              </div>
            </Link>
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
