import { FAQS } from '@/lib/landing-content';
import { ChevronDownIcon } from './icons';

export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="scroll-mt-20 border-t border-steel-700/40 bg-navy-900 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-3xl px-5">
        <h2
          id="faq-title"
          className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        >
          Questions students ask me
        </h2>

        <div className="mt-8 border-t border-steel-700/60">
          {FAQS.map((item) => (
            <details key={item.q} name="faq" className="faq-item group border-b border-steel-700/60">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-base font-medium text-white marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="text-pretty">{item.q}</span>
                <ChevronDownIcon className="size-5 shrink-0 text-steel-300 transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <p className="max-w-[62ch] pb-5 pr-9 leading-relaxed text-steel-300">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}