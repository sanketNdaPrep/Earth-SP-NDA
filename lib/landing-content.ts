export interface HeroContent {
  title: string;
  subtitle: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  badgeText: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface ExamCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  subjectsCount: number;
  mockCount: number;
}

export type JourneyOutcome = "cleared" | "ssb" | "failed" | "start";

export const HERO_CONTENT: HeroContent = {
  badgeText: "Targeting NDA I & II 2027",
  title: "Master the Written Exam with Tactical Precision",
  subtitle: "Enterprise-grade study tracking, interactive mock papers, and real-time performance analytics tailored for NDA, CDS, and AFCAT defence aspirants.",
  primaryCtaText: "Start Free Practice",
  primaryCtaHref: "/ui-demo",
  secondaryCtaText: "Explore Exam Roadmap",
  secondaryCtaHref: "#roadmap",
};

export const FEATURE_ITEMS: FeatureItem[] = [
  {
    id: "ft-1",
    title: "Precision Analytics",
    description: "Track accuracy trends across Mathematics, GAT, and General Studies with automated error log breakdown.",
    iconName: "target",
  },
  {
    id: "ft-2",
    title: "Timed Mock Series",
    description: "Simulate exact UPSC exam pressure with timed papers, real marking schemes, and detailed explanations.",
    iconName: "calculator",
  },
  {
    id: "ft-3",
    title: "Structured Roadmap",
    description: "Four-phase preparation trajectory taking you from syllabus mastery to final exam-week revision.",
    iconName: "shield",
  },
];

export const TARGET_EXAMS: ExamCategory[] = [
  {
    id: "nda",
    name: "National Defence Academy",
    code: "NDA / NA",
    description: "Maths (300 Marks) & GAT (600 Marks) complete syllabus preparation.",
    subjectsCount: 6,
    mockCount: 24,
  },
  {
    id: "cds",
    name: "Combined Defence Services",
    code: "CDS (IMA/INA/AFA/OTA)",
    description: "English, General Knowledge, and Elementary Mathematics test series.",
    subjectsCount: 5,
    mockCount: 18,
  },
  {
    id: "afcat",
    name: "Air Force Common Admission Test",
    code: "AFCAT Flying & Ground Duty",
    description: "Verbal Ability, Numerical Ability, Reasoning, and Military Aptitude.",
    subjectsCount: 4,
    mockCount: 15,
  },
];

export const ABOUT = [
  "EARTH SP NDA is a premier tactical ed-tech platform built specifically for NDA, CDS, and AFCAT aspirants.",
  "Our mission is to empower defence exam candidates with structured tools, realistic timed tests, and actionable performance insights.",
];

export const PRINCIPLES = [
  {
    title: "Discipline First",
    body: "Consistency beats intensity in competitive exam preparation.",
    description: "Consistency beats intensity in competitive exam preparation.",
  },
  {
    title: "Data-Driven Strategy",
    body: "Identify weak spots and refine test-taking strategies.",
    description: "Identify weak spots and refine test-taking strategies.",
  },
];

export const BOOKS = [
  {
    title: "NDA Mathematics Guide",
    author: "Defence Direct",
    category: "Maths",
    bestFor: "NDA/CDS Aspirants",
    usageGuide: "Daily 1 hour problem solving",
  },
  {
    title: "General Ability Master Volume",
    author: "Earth SP Prep",
    category: "GAT",
    bestFor: "GAT Sectional Prep",
    usageGuide: "Revision & Mock analysis",
  },
];

export const FAQS = [
  {
    q: "Is EARTH SP NDA free to use?",
    question: "Is EARTH SP NDA free to use?",
    a: "Yes, fundamental practice features and UI showcases are accessible to all candidates.",
    answer: "Yes, fundamental practice features and UI showcases are accessible to all candidates.",
  },
  {
    q: "Which exams are supported?",
    question: "Which exams are supported?",
    a: "NDA / NA, CDS (IMA/INA/AFA/OTA), and AFCAT entries.",
    answer: "NDA / NA, CDS (IMA/INA/AFA/OTA), and AFCAT entries.",
  },
];

export const JOURNEY = [
  {
    when: "Month 1-3",
    title: "Syllabus Foundation",
    body: "Covered foundational Mathematics and GAT concepts.",
    outcome: "cleared" as JourneyOutcome,
    phase: "Phase 1: Syllabus Foundation",
    duration: "Months 1-3",
  },
  {
    when: "Month 4-5",
    title: "SSB & Mocks",
    body: "Attempted full length sectional mock series.",
    outcome: "ssb" as JourneyOutcome,
    phase: "Phase 2: Timed Mock Practice",
    duration: "Months 4-5",
  },
  {
    when: "Month 6",
    title: "Final Revisions",
    body: "Exam week revision and paper strategies.",
    outcome: "failed" as JourneyOutcome,
    phase: "Phase 3: Final Exam Sprint",
    duration: "Month 6",
  },
];

export const ATTEMPTS = [
  {
    n: 1,
    cleared: true,
    month: "OCT",
    year: "2026",
    mockName: "NDA Mathematics Full Mock 01",
    score: "246/300",
    date: "2026-10-15",
  },
  {
    n: 2,
    cleared: false,
    month: "NOV",
    year: "2026",
    mockName: "General Ability Test Mock 02",
    score: "410/600",
    date: "2026-11-01",
  },
];

export const DISCLAIMER = "EARTH SP NDA is an independent educational platform and is not affiliated with the Union Public Service Commission (UPSC) or the Ministry of Defence.";

export const DRIVE_FOLDERS = [
  {
    title: "Mathematics Class Notes & Question Sets",
    href: "https://drive.google.com",
    description: "Algebra, Trigonometry & Calculus PDF bundles",
    name: "Mathematics Class Notes & Question Sets",
    link: "https://drive.google.com",
  },
  {
    title: "Physics & Chemistry Quick Revision PDFs",
    href: "https://drive.google.com",
    description: "Physical Organic Chemistry & Mechanics formula sheets",
    name: "Physics & Chemistry Quick Revision PDFs",
    link: "https://drive.google.com",
  },
];