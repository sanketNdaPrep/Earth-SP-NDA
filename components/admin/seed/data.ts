import type { Opt } from './types';

export const OPTS: Opt[] = ['A', 'B', 'C', 'D'];

/** UI-only tags. They are not written to the database (see README). */
export const TAXONOMY: Record<string, string[]> = {
  'NDA Maths': [
    'Algebra',
    'Trigonometry',
    'Calculus',
    'Vectors',
    'Matrices & Determinants',
    'Coordinate Geometry',
    'Probability',
    'Statistics',
  ],
  GAT: ['Physics', 'Chemistry', 'History', 'Polity', 'Geography', 'Biology', 'Current Affairs'],
  English: ['Grammar', 'Vocabulary', 'Comprehension', 'Sentence Improvement'],
};

export const SYMBOLS = [
  '²', '³', '√', 'π', 'θ', 'α', 'β', '∫', 'Σ', '∞', '≤', '≥', '≠', '±', '×', '÷', '°', '→',
];

export const RESOURCE_CATEGORIES = ['Study Planner', 'E-Book / PDF', 'SSB Drill', 'PYQ Sheet'];
export const QUIZ_CATEGORIES = ['NDA', 'CDS', 'AFCAT', 'SSB OIR'];

export const BULK_SAMPLE = `Q: If sin θ = 3/5 and θ is acute, what is cos θ?
A: 3/5
B: 4/5
C: 5/4
D: 5/3
Ans: B
Exp: cos θ = √(1 − sin²θ) = √(1 − 9/25) = 4/5.

Q: The derivative of x³ with respect to x is
A: x²
B: 2x²
C: 3x²
D: 3x
Ans: C
Exp: Power rule: d/dx xⁿ = n·xⁿ⁻¹, so d/dx x³ = 3x².`;

export const BULK_LIMIT = 200;
export const BULK_CHUNK = 50;
export const BULK_MAX_FILE_BYTES = 1_000_000;