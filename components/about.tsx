import { ABOUT, PRINCIPLES } from '@/lib/landing-content';

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="scroll-mt-20 border-y border-steel-700/40 bg-navy-900 py-16 sm:py-20"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div>
          <h2
            id="about-title"
            className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl"
          >
            Hi, I am Sanket
          </h2>
          <div className="mt-5 max-w-[62ch] space-y-4 text-lg leading-relaxed text-steel-300">
            {ABOUT.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium text-white">What changed my results</h3>
          <dl className="mt-5 space-y-6">
            {PRINCIPLES.map((principle) => (
              <div key={principle.title} className="border-l-2 border-emerald-400/60 pl-5">
                <dt className="font-semibold text-emerald-300">{principle.title}</dt>
                <dd className="mt-1.5 leading-relaxed text-steel-300">{principle.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}