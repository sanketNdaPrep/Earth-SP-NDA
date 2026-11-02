'use client';

import { useEffect, useRef } from 'react';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, CrossIcon, FlagIcon } from '@/components/quiz/icons';
import { MathText } from '@/components/quiz/math-text';
import { focusRing, ghostButton } from '@/components/quiz/styles';
import { OPTION_LETTERS, type OptionLetter, type QuizQuestion } from '@/components/quiz/types';
import { STATUS_META } from './question-list';
import { SpeedGauge } from './speed-meter';
import type { ReviewItem } from './types';

const OPTION_TEXT: Record<OptionLetter, 'option_a' | 'option_b' | 'option_c' | 'option_d'> = {
  A: 'option_a',
  B: 'option_b',
  C: 'option_c',
  D: 'option_d',
};

/** "Step 2: Factorise" becomes "Factorise", because the list numbers the steps itself. */
export function solutionSteps(question: QuizQuestion): string[] {
  return (question.explanation ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^step\s*\d+\s*[:.)-]\s*/i, ''))
    .filter(Boolean);
}

interface SolutionDrawerProps {
  item: ReviewItem;
  /** Position within the current filtered list, from 0. */
  position: number;
  count: number;
  par: number;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
}

/** A native modal dialog docked to the right edge: focus is trapped, Escape closes it. */
export function SolutionDrawer({ item, position, count, par, onPrevious, onNext, onClose }: SolutionDrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const { question } = item;
  const meta = STATUS_META[item.status];
  const steps = solutionSteps(question);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  // A new question starts at the top of the drawer.
  useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
  }, [question.id]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="drawer-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className="mb-0 ml-auto mr-0 mt-0 h-dvh max-h-none w-full max-w-xl overflow-y-auto overscroll-contain border-l border-steel-700 bg-navy-900 p-0 text-steel-100 shadow-2xl backdrop:bg-navy-950/80 backdrop:backdrop-blur-sm"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-steel-700/60 bg-navy-900/95 px-5 py-3 backdrop-blur">
        <div className="min-w-0">
          <h2 id="drawer-title" className="text-sm font-semibold uppercase tracking-wider text-steel-300">
            Question <span className="tabular-nums text-white">{item.index + 1}</span>
          </h2>
          <p className="text-xs tabular-nums text-steel-300">
            {position + 1} of {count} in this view
          </p>
        </div>
        <button type="button" onClick={onClose} className={ghostButton}>
          Close
        </button>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${meta.badge}`}>
            {item.status === 'correct' ? <CheckIcon className="size-3.5" /> : item.status === 'wrong' ? <CrossIcon className="size-3.5" /> : null}
            {meta.label}
          </span>
          {item.flagged ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-gold-400/60 bg-gold-400/10 px-2.5 py-1 text-xs font-semibold text-gold-300">
              <FlagIcon className="size-3.5" />
              Flagged for review
            </span>
          ) : null}
        </div>

        <p className="text-lg leading-relaxed text-white">
          <MathText text={question.question_text} />
        </p>

        <ul className="space-y-3" aria-label="Answer options">
          {OPTION_LETTERS.map((letter) => {
            const isCorrect = question.correct_option === letter;
            const isPicked = item.picked === letter;
            const tone = isCorrect
              ? 'border-emerald-400 bg-emerald-400/10'
              : isPicked
                ? 'border-gold-400 bg-gold-400/10'
                : 'border-steel-700 bg-navy-950';
            const badge = isCorrect
              ? 'border-emerald-400 bg-emerald-400 text-navy-950'
              : isPicked
                ? 'border-gold-400 bg-gold-400 text-navy-950'
                : 'border-steel-700 text-steel-300';
            return (
              <li key={letter} className={`flex items-start gap-3 rounded-md border p-3 ${tone}`}>
                <span aria-hidden="true" className={`grid size-8 shrink-0 place-items-center rounded-md border text-sm font-semibold ${badge}`}>
                  {isCorrect ? <CheckIcon className="size-4" /> : isPicked ? <CrossIcon className="size-4" /> : letter}
                </span>
                <span className="min-w-0 flex-1 pt-1 text-base leading-relaxed text-steel-100">
                  <span className="sr-only">Option {letter}: </span>
                  <MathText text={question[OPTION_TEXT[letter]]} />
                  {isCorrect ? <span className="mt-1 block text-sm font-semibold text-emerald-300">Correct answer</span> : null}
                  {isPicked && !isCorrect ? <span className="mt-1 block text-sm font-semibold text-gold-300">Your answer</span> : null}
                  {isPicked && isCorrect ? <span className="mt-1 block text-sm text-steel-300">You chose this one.</span> : null}
                </span>
              </li>
            );
          })}
        </ul>

        {item.status === 'unattempted' ? <p className="text-sm text-steel-300">You did not answer this question.</p> : null}
        {item.status === 'unscored' ? (
          <p className="text-sm text-gold-300">This question has no valid answer key, so it was not scored.</p>
        ) : null}

        {item.seconds !== null && item.speed ? (
          <div className="rounded-md border border-steel-700/60 bg-navy-950 p-4">
            <SpeedGauge seconds={item.seconds} par={par} speed={item.speed} />
          </div>
        ) : null}

        <section aria-labelledby="solution-heading" className="rounded-md border border-steel-700/60 bg-navy-950 p-4">
          <h3 id="solution-heading" className="text-sm font-semibold text-white">
            Step-by-step solution
          </h3>
          {steps.length > 0 ? (
            <ol className="mt-4 space-y-4">
              {steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-7 shrink-0 place-items-center rounded-full border border-gold-400/60 bg-gold-400/10 text-xs font-semibold tabular-nums text-gold-300"
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 pt-0.5 text-base leading-relaxed text-steel-100">
                    <span className="sr-only">Step {index + 1}: </span>
                    <MathText text={step} />
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-2 text-sm text-steel-300">No solution has been written for this question yet.</p>
          )}
        </section>
      </div>

      <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-steel-700/60 bg-navy-900/95 px-5 py-3 backdrop-blur">
        <button type="button" onClick={onPrevious} disabled={position === 0} className={ghostButton}>
          <ChevronLeftIcon className="size-4" />
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={position === count - 1}
          className={`inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 text-sm font-semibold text-navy-950 transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
        >
          Next
          <ChevronRightIcon className="size-4" />
        </button>
      </div>
    </dialog>
  );
}