export interface Deck {
  id: string;
  title: string;
  category: string;
  description: string;
  created_at: string;
  /** Filled by the list query: flashcards(count). */
  flashcards?: { count: number }[] | null;
}

export interface Card {
  id: string;
  front: string;
  back: string;
  position: number;
}

export const DECK_LIMITS = { titleMin: 2, titleMax: 80, descriptionMax: 300, frontMax: 500, backMax: 1000, cardsMax: 200 } as const;

export const DECK_CATEGORIES = ["Maths", "Physics", "Chemistry", "English", "General Awareness", "Other"];

/** The separator between the question and the answer on one line of the admin editor. */
export const CARD_SEPARATOR = " | ";

export interface ParsedCard {
  front: string;
  back: string;
}

export type ParseResult = { ok: true; cards: ParsedCard[] } | { ok: false; error: string };

/**
 * Turns the admin's text box into cards. One card per line: "question | answer".
 * Blank lines are skipped. The error names the first line that cannot be used.
 */
export function parseCards(text: string): ParseResult {
  const cards: ParsedCard[] = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    const at = line.indexOf("|");
    const front = at === -1 ? "" : line.slice(0, at).trim();
    const back = at === -1 ? "" : line.slice(at + 1).trim();
    if (!front || !back) return { ok: false, error: `Line ${i + 1} needs a question and an answer separated by "|".` };
    if (front.length > DECK_LIMITS.frontMax) return { ok: false, error: `Line ${i + 1}: the question is over ${DECK_LIMITS.frontMax} characters.` };
    if (back.length > DECK_LIMITS.backMax) return { ok: false, error: `Line ${i + 1}: the answer is over ${DECK_LIMITS.backMax} characters.` };
    cards.push({ front, back });
  }
  if (cards.length === 0) return { ok: false, error: "Add at least one card." };
  if (cards.length > DECK_LIMITS.cardsMax) return { ok: false, error: `A deck can hold at most ${DECK_LIMITS.cardsMax} cards.` };
  return { ok: true, cards };
}

/** The reverse of parseCards, used when an admin edits an existing deck. */
export function formatCards(cards: Pick<Card, "front" | "back">[]): string {
  return cards.map((c) => `${c.front.replace(/\n/g, " ")}${CARD_SEPARATOR}${c.back.replace(/\n/g, " ")}`).join("\n");
}

/** Fisher-Yates shuffle that leaves the input alone. */
export function shuffled<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function cardCount(deck: Deck): number {
  return deck.flashcards?.[0]?.count ?? 0;
}
