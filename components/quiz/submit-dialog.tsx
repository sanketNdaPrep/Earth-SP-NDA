'use client';

import Link from 'next/link';
import { AlertIcon, CheckIcon, SpinnerIcon } from './icons';
import { Dialog } from './dialog';
import { formatClock, formatMarks } from './scoring';
import { ghostButton, goldButton, primaryButton } from './styles';
import type { AttemptResult, LogState, MarkingScheme } from './types';

// ------------------------------------------------------------------ confirm

export interface SubmitCounts {
  total: number;
  answered: number;
  /** Visited but not answered. */
  unanswered: number;
  unvisited: number;
  marked: number;
}

interface ConfirmSubmitDialogProps {
  counts: SubmitCounts;
  /** Seconds left, null for an untimed module. */
  remaining: number | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmSubmitDialog({ counts, remaining, onConfirm, onCancel }: ConfirmSubmitDialogProps) {
  const open = counts.unanswered + counts.unvisited;
  const rows: Array<{ label: string; value: number; tone: string }> = [
    { label: 'Answered', value: counts.answered, tone: 'text-emerald-300' },
    { label: 'Not answered', value: counts.unanswered, tone: 'text-white' },
    { label: 'Unvisited', value: counts.unvisited, tone: 'text-white' },
    { label: 'Marked for review', value: counts.marked, tone: 'text-gold-300' },
  ];

  return (
    <Dialog labelledBy="confirm-title" describedBy="confirm-desc" onClose={onCancel}>
      <div className="p-6 sm:p-8">
        <h2 id="confirm-title" className="text-xl font-semibold text-white">
          Submit your test?
        </h2>
        <p id="confirm-desc" className="mt-2 text-sm leading-relaxed text-steel-300">
          {open > 0
            ? `${open} ${open === 1 ? 'question has' : 'questions have'} no answer. You cannot change anything after you submit.`
            : 'Every question has an answer. You cannot change anything after you submit.'}
        </p>

        <dl className="mt-5 divide-y divide-steel-700/60 rounded-md border border-steel-700/60 bg-navy-950">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between px-4 py-3 text-sm">
              <dt className="text-steel-300">{row.label}</dt>
              <dd className={`font-semibold tabular-nums ${row.tone}`}>
                {row.value} <span className="font-normal text-steel-500">of {counts.total}</span>
              </dd>
            </div>
          ))}
          {remaining !== null ? (
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <dt className="text-steel-300">Time left</dt>
              <dd className="font-mono font-semibold tabular-nums text-white">{formatClock(remaining)}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className={ghostButton}>
            Keep working
          </button>
          <button type="button" onClick={onConfirm} className={primaryButton}>
            Submit and see my score
          </button>
        </div>
      </div>
    </Dialog>
  );
}

// ------------------------------------------------------------------- result

interface ResultDialogProps {
  quizTitle: string;
  scheme: MarkingScheme;
  result: AttemptResult;
  log: LogState;
  onRetryLog: () => void;
  onReview: () => void;
}

function LogLine({ log, correct, total, onRetry }: { log: LogState; correct: number; total: number; onRetry: () => void }) {
  if (log.status === 'saving' || log.status === 'idle') {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-steel-300">
        <SpinnerIcon className="size-4" />
        Saving this attempt to your record...
      </p>
    );
  }
  if (log.status === 'saved') {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-emerald-300">
        <CheckIcon className="size-4" />
        Saved to your record as {correct} of {total} correct.
      </p>
    );
  }
  if (log.status === 'guest') {
    return (
      <p role="status" className="flex items-start gap-2 text-sm text-gold-300">
        <AlertIcon className="mt-0.5 size-4 shrink-0" />
        <span>
          You are not signed in, so this attempt was not saved.{' '}
          <Link href="/login" className="font-semibold underline underline-offset-4">
            Sign in
          </Link>{' '}
          before your next test to keep your record.
        </span>
      </p>
    );
  }
  return (
    <div role="alert" className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gold-300">
      <span className="flex min-w-0 flex-1 items-start gap-2">
        <AlertIcon className="mt-0.5 size-4 shrink-0" />
        <span>Could not save this attempt: {log.message}</span>
      </span>
      <button type="button" onClick={onRetry} className={goldButton}>
        Try saving again
      </button>
    </div>
  );
}

export function ResultDialog({ quizTitle, scheme, result, log, onRetryLog, onReview }: ResultDialogProps) {
  const negative = result.marks < 0;
  const rows = [
    {
      label: 'Correct',
      detail: `${result.correct} x ${formatMarks(scheme.correct)}`,
      value: `+${formatMarks(result.gained)}`,
      tone: 'text-emerald-300',
    },
    {
      label: 'Wrong',
      detail: `${result.wrong} x ${formatMarks(scheme.wrong)}`,
      value: result.deducted > 0 ? `-${formatMarks(result.deducted)}` : formatMarks(0),
      tone: result.deducted > 0 ? 'text-gold-300' : 'text-steel-300',
    },
    {
      label: 'Not answered',
      detail: `${result.unanswered} x 0`,
      value: formatMarks(0),
      tone: 'text-steel-300',
    },
  ];

  return (
    <Dialog labelledBy="result-title" describedBy="result-desc" onClose={onReview}>
      <div className="p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-300">{scheme.label} marking</p>
        <h2 id="result-title" className="mt-1 text-xl font-semibold text-white">
          {quizTitle}
        </h2>
        <p id="result-desc" className="sr-only">
          Your score is {formatMarks(result.marks)} out of {formatMarks(result.maxMarks)}.
        </p>

        <div className="mt-5 rounded-md border border-steel-700 bg-navy-950 p-5 text-center">
          <p className="text-sm text-steel-300">Your score</p>
          <p className="mt-1 font-mono text-4xl font-semibold tabular-nums sm:text-5xl">
            <span className={negative ? 'text-gold-300' : 'text-emerald-400'}>{formatMarks(result.marks)}</span>
            <span className="text-xl text-steel-500"> / {formatMarks(result.maxMarks)}</span>
          </p>
          {negative ? (
            <p className="mt-2 text-sm text-gold-300">Negative marking outweighed your correct answers on this attempt.</p>
          ) : null}
        </div>

        <table className="mt-5 w-full text-left text-sm">
          <caption className="sr-only">How your score was calculated</caption>
          <thead>
            <tr className="text-steel-300">
              <th scope="col" className="pb-2 font-medium">
                Answers
              </th>
              <th scope="col" className="pb-2 font-medium">
                Marks each
              </th>
              <th scope="col" className="pb-2 text-right font-medium">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="border-t border-steel-700/60">
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-steel-700/40">
                <th scope="row" className="py-2.5 font-medium text-white">
                  {row.label}
                </th>
                <td className="py-2.5 tabular-nums text-steel-300">{row.detail}</td>
                <td className={`py-2.5 text-right font-semibold tabular-nums ${row.tone}`}>{row.value}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={2} className="pt-3 font-semibold text-white">
                Final score
              </th>
              <td className={`pt-3 text-right font-semibold tabular-nums ${negative ? 'text-gold-300' : 'text-emerald-300'}`}>
                {formatMarks(result.marks)}
              </td>
            </tr>
          </tfoot>
        </table>

        <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Attempted', value: `${result.attempted} / ${result.total}` },
            {
              label: 'Accuracy',
              value: result.accuracy === null ? 'None' : `${result.accuracy}%`,
            },
            { label: 'Time taken', value: formatClock(result.timeTakenSecs) },
          ].map((item) => (
            <div key={item.label} className="rounded-md border border-steel-700/60 bg-navy-950 px-2 py-3">
              <dt className="text-xs text-steel-300">{item.label}</dt>
              <dd className="mt-1 font-mono text-sm font-semibold tabular-nums text-white">{item.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 border-t border-steel-700/60 pt-4">
          <LogLine log={log} correct={result.correct} total={result.total} onRetry={onRetryLog} />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link href="/quizzes" className={ghostButton}>
            More tests
          </Link>
          <Link href="/dashboard" className={ghostButton}>
            Dashboard
          </Link>
          <button type="button" onClick={onReview} className={primaryButton}>
            Review answers
          </button>
        </div>
      </div>
    </Dialog>
  );
}