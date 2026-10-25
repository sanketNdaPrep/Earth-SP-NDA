'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatDuration, formatMarks } from './scoring';
import { focusRing, primaryButton } from './styles';
import type { MarkingScheme, QuizRecord } from './types';

interface BriefingScreenProps {
  quiz: QuizRecord;
  scheme: MarkingScheme;
  questionCount: number;
  /** null for an untimed module. */
  limitSecs: number | null;
  storageOk: boolean;
  onBegin: () => void;
}

export function BriefingScreen({ quiz, scheme, questionCount, limitSecs, storageOk, onBegin }: BriefingScreenProps) {
  const facts = [
    { label: 'Questions', value: String(questionCount) },
    { label: 'Time allowed', value: limitSecs === null ? 'No limit' : formatDuration(limitSecs) },
    { label: 'Correct answer', value: `+${formatMarks(scheme.correct)}` },
    { label: 'Wrong answer', value: scheme.wrong > 0 ? `-${formatMarks(scheme.wrong)}` : 'No penalty' },
  ];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="rounded-lg border border-steel-700 bg-navy-900 p-6 sm:p-8"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-gold-400/50 bg-gold-400/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-gold-300">
            {quiz.category}
          </span>
          <span className="rounded-md border border-steel-700 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-steel-300">
            {scheme.label} mode
          </span>
        </div>

        <h1 className="mt-4 text-balance text-2xl font-semibold text-white sm:text-3xl">{quiz.title}</h1>
        {quiz.description ? <p className="mt-2 text-sm leading-relaxed text-steel-300">{quiz.description}</p> : null}

        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="rounded-md border border-steel-700/60 bg-navy-950 px-3 py-3">
              <dt className="text-xs text-steel-300">{fact.label}</dt>
              <dd className="mt-1 font-mono text-base font-semibold tabular-nums text-white">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-8 text-sm font-semibold text-steel-100">Before you start</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-steel-300 marker:text-steel-500">
          {limitSecs !== null ? (
            <li>The timer starts when you press Begin and keeps running if you reload or close the tab.</li>
          ) : null}
          <li>
            {storageOk
              ? 'Your answers are saved in this browser as you go, so an accidental refresh brings you back to the same question.'
              : 'This browser is blocking site storage, so your answers cannot be auto-saved. Do not reload the page.'}
          </li>
          <li>Use the question palette to jump between questions. Mark any question for review and come back to it.</li>
          <li>When the time ends, your test is submitted automatically.</li>
        </ul>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/quizzes"
            className={`inline-flex min-h-11 items-center justify-center rounded-md px-3 text-sm font-medium text-steel-300 underline underline-offset-4 hover:text-white ${focusRing}`}
          >
            Back to modules
          </Link>
          <button type="button" onClick={onBegin} className={`${primaryButton} sm:min-w-44`}>
            Begin test
          </button>
        </div>
      </motion.div>
    </main>
  );
}