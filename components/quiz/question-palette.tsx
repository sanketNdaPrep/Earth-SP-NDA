import { focusRing } from './styles';
import type { PaletteStatus } from './types';

interface LegendItem {
  status: PaletteStatus;
  label: string;
}

const EXAM_LEGEND: LegendItem[] = [
  { status: 'answered', label: 'Answered' },
  { status: 'marked', label: 'Marked for review' },
  { status: 'unanswered', label: 'Not answered' },
  { status: 'unvisited', label: 'Unvisited' },
];

const REVIEW_LEGEND: LegendItem[] = [
  { status: 'correct', label: 'Correct' },
  { status: 'wrong', label: 'Wrong' },
  { status: 'skipped', label: 'Not answered' },
];

const STATUS_TEXT: Record<PaletteStatus, string> = {
  unvisited: 'not visited',
  unanswered: 'not answered',
  answered: 'answered',
  marked: 'marked for review',
  'answered-marked': 'answered and marked for review',
  correct: 'correct',
  wrong: 'wrong',
  skipped: 'not answered',
};

const STATUS_CLASS: Record<PaletteStatus, string> = {
  unvisited: 'border-steel-700 bg-transparent text-steel-300 hover:border-steel-500',
  unanswered: 'border-steel-500 bg-navy-800 text-white hover:border-steel-300',
  answered: 'border-emerald-400 bg-emerald-400 text-navy-950 hover:bg-emerald-300',
  marked: 'border-gold-400 bg-gold-400/15 text-gold-300 hover:bg-gold-400/25',
  'answered-marked': 'border-gold-400 bg-emerald-400 text-navy-950 hover:bg-emerald-300',
  correct: 'border-emerald-400 bg-emerald-400 text-navy-950 hover:bg-emerald-300',
  wrong: 'border-gold-400 bg-gold-400 text-navy-950 hover:bg-gold-300',
  skipped: 'border-steel-700 bg-transparent text-steel-300 hover:border-steel-500',
};

const SWATCH_CLASS: Record<PaletteStatus, string> = {
  unvisited: 'border-steel-700 bg-transparent',
  unanswered: 'border-steel-500 bg-navy-800',
  answered: 'border-emerald-400 bg-emerald-400',
  marked: 'border-gold-400 bg-gold-400/15',
  'answered-marked': 'border-gold-400 bg-emerald-400',
  correct: 'border-emerald-400 bg-emerald-400',
  wrong: 'border-gold-400 bg-gold-400',
  skipped: 'border-steel-700 bg-transparent',
};

const MARKED: ReadonlySet<PaletteStatus> = new Set(['marked', 'answered-marked']);

function Swatch({ status }: { status: PaletteStatus }) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block size-5 shrink-0 rounded border ${SWATCH_CLASS[status]}`}
    >
      {MARKED.has(status) ? (
        <span className="absolute -right-1 -top-1 size-2 rounded-full border border-navy-900 bg-gold-400" />
      ) : null}
    </span>
  );
}

interface QuestionPaletteProps {
  statuses: PaletteStatus[];
  current: number;
  review: boolean;
  onJump: (index: number) => void;
}

export function QuestionPalette({ statuses, current, review, onJump }: QuestionPaletteProps) {
  const legend = review ? REVIEW_LEGEND : EXAM_LEGEND;

  // Answered and answered-and-marked are one group in the legend counts, as in the real exam.
  const count = (status: PaletteStatus) =>
    statuses.filter((item) => item === status || (status === 'answered' && item === 'answered-marked')).length;
  const markedCount = statuses.filter((item) => MARKED.has(item)).length;

  return (
    <div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-steel-300">
        {legend.map((item) => (
          <li key={item.status} className="flex items-center gap-2">
            <Swatch status={item.status} />
            <span>
              {item.label}{' '}
              <span className="font-medium tabular-nums text-white">
                {item.status === 'marked' ? markedCount : count(item.status)}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <ol
        aria-label="Question palette"
        className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5"
      >
        {statuses.map((status, index) => (
          <li key={index}>
            <button
              type="button"
              onClick={() => onJump(index)}
              aria-current={index === current ? 'true' : undefined}
              aria-label={`Question ${index + 1}, ${STATUS_TEXT[status]}`}
              className={`relative grid size-11 w-full touch-manipulation place-items-center rounded-md border text-sm font-semibold tabular-nums transition-colors ${STATUS_CLASS[status]} ${
                index === current ? 'ring-2 ring-white ring-offset-2 ring-offset-navy-900' : ''
              } ${focusRing}`}
            >
              {index + 1}
              {MARKED.has(status) ? (
                <span
                  aria-hidden="true"
                  className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-navy-900 bg-gold-400"
                />
              ) : null}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}