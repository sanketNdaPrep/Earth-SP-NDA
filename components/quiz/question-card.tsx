'use client';

import { motion } from 'framer-motion';
import { CheckIcon, CrossIcon, FlagIcon } from './icons';
import { MathText } from './math-text';
import { focusRing, ghostButton, goldButton } from './styles';
import { OPTION_LETTERS, type OptionLetter, type QuizQuestion } from './types';

const OPTION_TEXT: Record<OptionLetter, 'option_a' | 'option_b' | 'option_c' | 'option_d'> = {
  A: 'option_a',
  B: 'option_b',
  C: 'option_c',
  D: 'option_d',
};

interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
  total: number;
  selected: OptionLetter | null;
  marked: boolean;
  /** exam: cadet is answering. review: attempt is over, answers are shown. */
  mode: 'exam' | 'review';
  onSelect: (letter: OptionLetter) => void;
  onClear: () => void;
  onToggleMark: () => void;
}

export function QuestionCard({
  question,
  index,
  total,
  selected,
  marked,
  mode,
  onSelect,
  onClear,
  onToggleMark,
}: QuestionCardProps) {
  const review = mode === 'review';
  const steps = (question.explanation ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <motion.section
      key={question.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      aria-labelledby="question-heading"
      className="rounded-lg border border-steel-700 bg-navy-900 p-5 sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="question-heading" className="text-sm font-semibold uppercase tracking-wider text-steel-300">
          Question <span className="tabular-nums text-white">{index + 1}</span> of{' '}
          <span className="tabular-nums">{total}</span>
        </h2>
        {marked && !review ? (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-gold-400/60 bg-gold-400/10 px-2.5 py-1 text-xs font-semibold text-gold-300">
            <FlagIcon className="size-3.5" />
            Marked for review
          </span>
        ) : null}
      </div>

      <p className="mt-5 text-lg leading-relaxed text-white sm:text-xl">
        <MathText text={question.question_text} />
      </p>

      <fieldset className="mt-6">
        <legend className="sr-only">{review ? 'Answer options' : 'Choose one answer'}</legend>
        <div className="space-y-3">
          {OPTION_LETTERS.map((letter) => {
            const isPicked = selected === letter;
            const isCorrect = question.correct_option === letter;
            const showCorrect = review && isCorrect;
            const showWrong = review && isPicked && !isCorrect;

            const tone = showCorrect
              ? 'border-emerald-400 bg-emerald-400/10'
              : showWrong
                ? 'border-gold-400 bg-gold-400/10'
                : isPicked
                  ? 'border-emerald-400 bg-emerald-400/10'
                  : 'border-steel-700 bg-navy-950 hover:border-steel-500';

            const badge = showCorrect
              ? 'border-emerald-400 bg-emerald-400 text-navy-950'
              : showWrong
                ? 'border-gold-400 bg-gold-400 text-navy-950'
                : isPicked
                  ? 'border-emerald-400 bg-emerald-400 text-navy-950'
                  : 'border-steel-700 text-steel-300';

            return (
              <div key={letter} className="relative">
                <input
                  type="radio"
                  id={`option-${letter}`}
                  name={`question-${question.id}`}
                  value={letter}
                  checked={isPicked}
                  disabled={review}
                  onChange={() => onSelect(letter)}
                  className="peer sr-only"
                />
                <label
                  htmlFor={`option-${letter}`}
                  className={`flex min-h-14 touch-manipulation items-start gap-4 rounded-md border p-4 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-400 ${
                    review ? 'cursor-default' : 'cursor-pointer'
                  } ${tone}`}
                >
                  <span
                    aria-hidden="true"
                    className={`grid size-8 shrink-0 place-items-center rounded-md border text-sm font-semibold ${badge}`}
                  >
                    {showCorrect ? <CheckIcon className="size-4" /> : showWrong ? <CrossIcon className="size-4" /> : letter}
                  </span>
                  <span className="min-w-0 flex-1 pt-1 text-base leading-relaxed text-steel-100">
                    <span className="sr-only">Option {letter}: </span>
                    <MathText text={question[OPTION_TEXT[letter]]} />
                    {showCorrect ? (
                      <span className="mt-1 block text-sm font-semibold text-emerald-300">Correct answer</span>
                    ) : null}
                    {showWrong ? (
                      <span className="mt-1 block text-sm font-semibold text-gold-300">Your answer</span>
                    ) : null}
                    {review && isPicked && isCorrect ? (
                      <span className="mt-1 block text-sm text-steel-300">You chose this one.</span>
                    ) : null}
                  </span>
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>

      {review ? (
        <div className="mt-6 space-y-4">
          {selected === null ? (
            <p className="text-sm font-medium text-steel-300">You did not answer this question.</p>
          ) : null}
          {question.correct_option === null ? (
            <p className="text-sm font-medium text-gold-300">
              This question has no valid answer key, so it was not scored.
            </p>
          ) : null}
          <div className="rounded-md border border-steel-700/60 bg-navy-950 p-4">
            <h3 className="text-sm font-semibold text-steel-100">Solution</h3>
            {steps.length > 0 ? (
              <ol className="mt-3 space-y-2 text-base leading-relaxed text-steel-300">
                {steps.map((step, stepIndex) => (
                  <li key={stepIndex}>
                    <MathText text={step.replace(/^step\s*\d+\s*[:.)-]\s*/i, '')} />
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-sm text-steel-300">No solution has been written for this question yet.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onToggleMark}
            aria-pressed={marked}
            className={marked ? `${goldButton} bg-gold-400/10` : ghostButton}
          >
            <FlagIcon className="size-4" />
            {marked ? 'Unmark review' : 'Mark for review'}
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={selected === null}
            className={`min-h-11 touch-manipulation px-3 text-sm font-medium text-steel-300 underline underline-offset-4 transition-colors hover:text-white disabled:cursor-not-allowed disabled:no-underline disabled:opacity-40 ${focusRing}`}
          >
            Clear response
          </button>
        </div>
      )}
    </motion.section>
  );
}