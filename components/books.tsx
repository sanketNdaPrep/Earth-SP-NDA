import { BOOKS } from '@/lib/landing-content';

export function Books() {
  return (
    <section
      id="books"
      aria-labelledby="books-title"
      className="scroll-mt-20 border-t border-steel-700/40 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-5">
        <h2
          id="books-title"
          className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        >
          Recommended books and how to use them
        </h2>
        <p className="mt-3 max-w-[60ch] text-steel-300">
          A book only helps if you use it on a schedule. Each one below comes with a daily routine.
        </p>

        <ul className="mt-10 border-t border-steel-700/60">
          {BOOKS.map((book) => (
            <li
              key={book.title}
              className="grid gap-5 border-b border-steel-700/60 py-8 md:grid-cols-[1fr_1fr] md:gap-12"
            >
              <div>
                <p className="text-sm text-gold-300">{book.category}</p>
                <h3 className="mt-1.5 text-pretty text-xl font-semibold leading-snug text-white">
                  {book.title}
                </h3>
                <p className="mt-1 text-sm text-steel-300">{book.author}</p>
              </div>

              <div className="space-y-4">
                <p className="leading-relaxed text-steel-100">{book.bestFor}</p>
                <div className="border-l-2 border-emerald-400/60 pl-4">
                  <p className="text-sm font-semibold text-emerald-300">How to use it</p>
                  <p className="mt-1 leading-relaxed text-steel-300">{book.usageGuide}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}