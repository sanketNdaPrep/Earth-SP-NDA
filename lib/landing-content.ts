export const ABOUT = [
  "I started my NDA journey in 9th class on a village ground. I failed the written exam five times before finally clearing it on my sixth attempt in April 2026.",
  "This platform is exactly what I wished I had during those failed attempts: a structured system, proper revision notes, and realistic practice tests. I built this to help you study with a plan."
];

export const PRINCIPLES = [
  { title: "Consistency over intensity", body: "Studying 2 hours every single day is better than studying 10 hours once a week." },
  { title: "PYQs are the syllabus", body: "The UPSC repeats patterns. Mastering Previous Year Questions gave me the exact blueprint of the exam." }
];

export const BOOKS = [
  { 
    category: "Mathematics", 
    title: "NDA Mathematics", 
    author: "RS Aggarwal", 
    bestFor: "Building foundational concepts.", 
    usageGuide: "Solve 50 questions daily, focusing on your weak chapters." 
  },
  { 
    category: "GAT - English", 
    title: "Objective General English", 
    author: "SP Bakshi", 
    bestFor: "Grammar rules and vocabulary.", 
    usageGuide: "Read one chapter a week and practice the exercises twice." 
  }
];

export type JourneyOutcome = 'start' | 'failed' | 'cleared' | 'ssb';

export const JOURNEY: { when: string; title: string; body: string; outcome: JourneyOutcome }[] = [
  { when: "Sep 2023", title: "First Attempt", body: "Gave the exam with zero preparation. Realized the true difficulty level.", outcome: "failed" },
  { when: "Apr 2024", title: "Second Attempt", body: "Studied a bit, but lacked a proper strategy and revision plan.", outcome: "failed" },
  { when: "Sep 2024", title: "Third Attempt", body: "Improved my GAT score but couldn't clear the Mathematics sectional cutoff.", outcome: "failed" },
  { when: "Apr 2025", title: "Fourth Attempt", body: "Missed the overall cutoff by just a few marks.", outcome: "failed" },
  { when: "Sep 2025", title: "Fifth Attempt", body: "Worked hard but still fell short. Decided to change my entire strategy.", outcome: "failed" },
  { when: "Apr 2026", title: "Sixth Attempt", body: "Finally cleared the written exam with a comfortable margin.", outcome: "cleared" },
  { when: "May 2026", title: "SSB Interview", body: "Attended the 5-day SSB interview at 22 SSB Bhopal.", outcome: "ssb" }
];

export const FAQS = [
  { q: "Is this platform completely free?", a: "The revision notes, planners, and my personal strategies are 100% free." },
  { q: "Can I crack NDA without coaching?", a: "Absolutely. I cleared it on my 6th attempt purely through self-study and disciplined revision." }
];

export const ATTEMPTS = [
  { n: 1, month: "Sep", year: "2023", cleared: false },
  { n: 2, month: "Apr", year: "2024", cleared: false },
  { n: 3, month: "Sep", year: "2024", cleared: false },
  { n: 4, month: "Apr", year: "2025", cleared: false },
  { n: 5, month: "Sep", year: "2025", cleared: false },
  { n: 6, month: "Apr", year: "2026", cleared: true }
];

export const DRIVE_FOLDERS = [
  { href: "#", title: "Mathematics Notes", description: "Formulas and shortcut tricks for quick revision." },
  { href: "#", title: "GAT Science", description: "Physics, Chemistry, and Biology NCERT summaries." }
];

export const DISCLAIMER = "This is a personal project. It is not affiliated with UPSC or the Indian Armed Forces. Please verify all official details, dates, and eligibility on upsc.gov.in.";