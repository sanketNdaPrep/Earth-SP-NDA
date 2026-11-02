'use client';

import { CheckIcon, CrossIcon, FlagIcon } from '@/components/quiz/icons';
import { MathText } from '@/components/quiz/math-text';
import { focusRing } from '@/components/quiz/styles';
import { SPEED_TEXT } from './speed-meter';
import { formatSeconds, SPEED_LABEL } from './speed';
import type { ReviewItem, ReviewStatus } from './types';

export const STATUS_META: Record<ReviewStatus, { label: string; badge: string; text: string }> = {
  correct: { label: 'Correct', badge: 'border-emerald-400 bg-emerald-400 text-navy-950', text: 'text-emerald-300' },
  wrong: { label: 'Wrong', badge: 'border-gold-400 bg-gold-400 text-navy-950', text: 'text-gold-300' },
  unattempted: { label: 'Unattempted', badge: 'border-steel-500 bg-transparent text-steel-300', text: 'text-steel-300' },
  unscored: { label: 'Not scored', badge: 'border-steel-500 bg-transparent text-steel-300', text: 'text-steel-300' },
  unknown: { label: 'Open solution', badge: 'border-steel-500 bg-navy-800 text-white', text: 'text-steel-300' },
};

export const rowId = (questionId: string) => `review-row-${questionId}`;

export function StatusIcon({ status }: { status: ReviewStatus }) {
  if (status === 'correct') return <CheckIcon className="size-4" />;
  if (status === 'wrong') return <CrossIcon className="size-4" />;
  return null;
}

interface QuestionListProps {
  items: ReviewItem[];
  onOpen: (listIndex: number) => void;
}

export function QuestionList({ items, onOpen }: QuestionListProps) {
  return (
    <ul className="divide-y divide-steel-700/60 rounded-md border border-steel-700/60 bg-navy-950">
      {items.map((item, listIndex) => {
        const meta = STATUS_META[item.status];
        return (
          <li key={item.question.id}>
            <button
              type="button"
              id={rowId(item.question.id)}
              onClick={() => onOpen(listIndex)}
              aria-label={`Question ${item.index + 1}, ${meta.label}${item.flagged ? ', flagged' : ''}. Open solution`}
              className={`flex w-full touch-manipulation items-start gap-4 px-4 py-4 text-left transition-colors hover:bg-white/5 ${focusRing}`}
            >
              <span
                aria-hidden="true"
                className={`grid size-9 shrink-0 place-items-center rounded-md border text-sm font-semibold tabular-nums ${meta.badge}`}
              >
                {item.index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-sm leading-relaxed text-steel-100">
                  <MathText text={item.question.question_text} />
                </span>
                <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className={`inline-flex items-center gap-1 font-semibold ${meta.text}`}>
                    <StatusIcon status={item.status} />
                    {meta.label}
                  </span>
                  {item.picked ? <span className="text-steel-300">You chose {item.picked}</span> : null}
                  {item.flagged ? (
                    <span className="inline-flex items-center gap-1 font-medium text-gold-300">
                      <FlagIcon className="size-3.5" />
                      Flagged
                    </span>
                  ) : null}
                  {item.seconds !== null && item.speed ? (
                    <span className={`tabular-nums ${SPEED_TEXT[item.speed]}`}>
                      {SPEED_LABEL[item.speed]}, {formatSeconds(item.seconds)}
                    </span>
                  ) : null}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}