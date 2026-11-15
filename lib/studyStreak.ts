/** Study streak: how many days in a row (counting back from today) the cadet did something. */

/** Local calendar day of a timestamp, as YYYY-MM-DD. */
export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Consecutive active days ending today. If nothing happened yet today, a streak that
 * reaches yesterday still counts, so it does not read zero first thing in the morning.
 * `timestamps` are ISO strings from attempts and study logs; bad values are ignored.
 */
export function studyStreak(timestamps: readonly (string | null | undefined)[], now: Date): number {
  const days = new Set<string>();
  for (const value of timestamps) {
    if (!value) continue;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) days.add(dayKey(parsed));
  }

  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
