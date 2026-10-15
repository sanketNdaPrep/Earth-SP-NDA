import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-black tracking-wider text-emerald-400">EARTH SP NDA</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 font-semibold">
              SSB & Officer Entry
            </span>
          </div>
          <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-300">
            <a href="#about" className="hover:text-emerald-400 transition-colors">Vision</a>
            <a href="#courses" className="hover:text-emerald-400 transition-colors">Exams (NDA/CDS/AFCAT)</a>
            <a href="#ssb" className="hover:text-emerald-400 transition-colors">SSB prep</a>
          </nav>
          <div className="flex items-center space-x-4">
            <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition-all shadow-lg shadow-emerald-500/20">
              Join Portal
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative py-20 px-6 max-w-6xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 bg-slate-800/80 border border-slate-700 px-4 py-1.5 rounded-full text-xs font-medium text-emerald-400 mb-8">
            <span>🛡️ Dedicated to Defense Aspirants Across India</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
            From Ground Zero to the <span className="text-emerald-400">Academy Uniform</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
            Inspired by the spirit of perseverance—clearing NDA on the 6th attempt at 22 SSB Bhopal. Built for NDA, CDS, AFCAT, and ACC aspirants mastering written exams & SSB interviews.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
            <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20">
              Start Practice Quizzes
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-all">
              SSB Preparation Guides
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left">
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
              <div className="text-3xl font-extrabold text-emerald-400">NDA / CDS / AFCAT</div>
              <div className="text-sm font-semibold text-slate-200 mt-1">Structured Study Material</div>
              <p className="text-xs text-slate-400 mt-2">Targeted pyq practice, topic-wise mathematics, general ability tests, and current affairs.</p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
              <div className="text-3xl font-extrabold text-emerald-400">5-Day SSB Prep</div>
              <div className="text-sm font-semibold text-slate-200 mt-1">Stage 1 & Stage 2 Focus</div>
              <p className="text-xs text-slate-400 mt-2">OIR practice, PPDT story narration strategies, TAT/WAT/SRT frameworks, and interview prep.</p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
              <div className="text-3xl font-extrabold text-emerald-400">Resilience First</div>
              <div className="text-sm font-semibold text-slate-200 mt-1">Community Driven</div>
              <p className="text-xs text-slate-400 mt-2">Built for every aspirant who gets up after recommendation setbacks until the final merit list.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        EARTH SP NDA © 2026 — Built for Armed Forces Aspirants.
      </footer>
    </div>
  );
}