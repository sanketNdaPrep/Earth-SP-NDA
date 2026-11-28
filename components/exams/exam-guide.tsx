import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { EXAM_GUIDE } from "@/lib/exam-guide";

/** The full guide to one exam: stages, who can apply, age, medical standards, selection and the SSB. */
export function ExamGuide({ examId }: { examId: string }) {
  const guide = EXAM_GUIDE[examId];
  if (!guide) return null;

  return (
    <div className="space-y-6">
      <ol className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4" aria-label="Stages of selection">
        {guide.stages.map((stage, i) => (
          <li key={stage.title} className="rounded-panel border border-steel-700 bg-navy-900 p-4">
            <span className="flex size-7 items-center justify-center rounded-full bg-gold-400 text-sm font-bold text-navy-950">{i + 1}</span>
            <h3 className="mt-3 font-display text-xl font-bold text-white">{stage.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-steel-300">{stage.text}</p>
          </li>
        ))}
      </ol>

      {guide.sections.map((section) => (
        <Card key={section.id} id={section.id} className="scroll-mt-24">
          <CardHeader>
            <CardTitle className="font-display text-2xl">{section.title}</CardTitle>
            {section.intro ? <p className="mt-1 text-pretty text-sm leading-relaxed text-steel-300">{section.intro}</p> : null}
          </CardHeader>
          <CardContent>
            {section.rows ? (
              <dl className="divide-y divide-steel-700/60">
                {section.rows.map((row) => (
                  <div key={row.label} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-6">
                    <dt className="text-sm font-semibold text-white">{row.label}</dt>
                    <dd className="text-sm leading-relaxed text-steel-300 sm:col-span-2">{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {section.steps ? (
              <ol className="list-none space-y-3 p-0">
                {section.steps.map((step, i) => (
                  <li key={step.title} className="flex gap-4 rounded-control border border-steel-700/60 bg-navy-950 p-4">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-gold-400 text-sm font-bold text-gold-300">{i + 1}</span>
                    <div className="min-w-0">
                      <h4 className="text-base font-semibold text-white">{step.title}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-steel-300">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : null}
            {section.bullets ? (
              <ul className="list-none space-y-2 p-0">
                {section.bullets.map((b) => (
                  <li key={b} className="flex gap-3 text-sm leading-relaxed text-steel-200">
                    <Icons.check className="mt-0.5 size-4 shrink-0 text-emerald-300" aria-hidden />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>
      ))}

      <p className="border-l-2 border-gold-400 bg-navy-900/60 py-3 pl-4 pr-3 text-sm text-steel-300">
        This is a student-friendly summary. Dates, birth-date windows, vacancies and fees change every year, so read the latest notice on{" "}
        <a className="font-semibold text-gold-300 underline" href={guide.officialSite.url} target="_blank" rel="noreferrer">
          {guide.officialSite.label}
        </a>{" "}
        before you apply.
      </p>
    </div>
  );
}
