export const MENTOR_TOPICS = ["Study plan", "Maths", "Physics", "Chemistry", "English", "General awareness", "SSB and interview", "Other"] as const;
export type MentorTopic = (typeof MENTOR_TOPICS)[number];

export const MENTOR_LIMITS = { min: 10, max: 1000, pendingMax: 5 } as const;

/** Room kept for the "[Topic] " prefix, so the stored text never passes the database limit of 1000. */
const PREFIX_ROOM = 20;

/** The admin inbox shows the question text only, so the topic travels as a prefix: "[Maths] How do I ...". */
export function buildQuestion(topic: MentorTopic, text: string): string {
  return `[${topic}] ${text.trim()}`;
}

/** Why a question cannot be sent yet, or null when it is fine. The limits match the database. */
export function questionProblem(text: string): string | null {
  const length = text.trim().length;
  if (length < MENTOR_LIMITS.min) return `Write at least ${MENTOR_LIMITS.min} characters so the mentor can help.`;
  if (length > MENTOR_LIMITS.max - PREFIX_ROOM) return `Keep it under ${MENTOR_LIMITS.max - PREFIX_ROOM} characters.`;
  return null;
}

export const MENTOR_TEXT_MAX = MENTOR_LIMITS.max - PREFIX_ROOM;
