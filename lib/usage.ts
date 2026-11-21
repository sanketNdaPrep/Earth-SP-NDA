/** Pure helpers for "is anything filed under this?" checks before deleting. */

/** Counts rows per id. `rows` are the filed items, `key` says which field holds the id. */
export function tally<T extends Record<string, unknown>>(rows: readonly T[], key: keyof T, ids: readonly string[]): Record<string, number> {
  const counts: Record<string, number> = Object.fromEntries(ids.map((id) => [id, 0]));
  for (const row of rows) {
    const id = row[key];
    if (typeof id === "string" && id in counts) counts[id] += 1;
  }
  return counts;
}

/** Splits ids into those with nothing inside (safe to delete) and those that still hold something. */
export function splitDeletable(ids: readonly string[], usage: Record<string, number>): { free: string[]; busy: string[] } {
  return { free: ids.filter((id) => !usage[id]), busy: ids.filter((id) => usage[id] > 0) };
}

/** "3 items" style text for the block message. */
export function blockedMessage(kind: "chapter" | "subject", names: readonly string[]): string {
  const list = names.slice(0, 3).join(", ") + (names.length > 3 ? ` and ${names.length - 3} more` : "");
  return `${names.length === 1 ? `This ${kind} still has` : `These ${kind}s still have`} files, cards or decks in ${names.length === 1 ? "it" : "them"} (${list}). Move or delete those first, so nothing is lost by accident.`;
}
