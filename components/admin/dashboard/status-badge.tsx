const DONE = new Set(['resolved', 'completed', 'done']);

/** Anything that is not explicitly finished counts as pending. */
export function isDone(status: string): boolean {
  return DONE.has(status.trim().toLowerCase());
}

/** Pending is gold, resolved is emerald. */
export function StatusBadge({
  status,
  doneLabel = 'Resolved',
}: {
  status: string;
  doneLabel?: string;
}) {
  const done = isDone(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium ${
        done
          ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
          : 'border-gold-400/40 bg-gold-400/10 text-gold-300'
      }`}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${done ? 'bg-emerald-400' : 'bg-gold-400'}`}
      />
      {done ? doneLabel : 'Pending'}
    </span>
  );
}