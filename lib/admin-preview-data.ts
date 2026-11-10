export interface StudentPreview {
  id: string;
  name: string;
  email: string;
  targetExam: "NDA" | "CDS" | "AFCAT";
  status: "Active" | "Pending" | "Inactive";
  score: number;
  joinedDate: string;
}

export interface ExamStatPreview {
  exam: string;
  totalEnrolled: number;
  avgScore: number;
  passRate: string;
}

export interface QueryItem {
  id: string;
  student_name: string;
  student_email: string;
  query_text: string;
  created_at: string;
  status: string;
  cadet: string;
  topic: string;
}

export const ADMIN_STUDENTS_PREVIEW: StudentPreview[] = [
  {
    id: "std-001",
    name: "Sanket Kumar",
    email: "sanket@earthspnda.com",
    targetExam: "NDA",
    status: "Active",
    score: 450,
    joinedDate: "2026-09-15",
  },
  {
    id: "std-002",
    name: "Vikram Singh",
    email: "vikram@example.com",
    targetExam: "CDS",
    status: "Active",
    score: 412,
    joinedDate: "2026-10-01",
  },
  {
    id: "std-003",
    name: "Ananya Sharma",
    email: "ananya@example.com",
    targetExam: "AFCAT",
    status: "Active",
    score: 235,
    joinedDate: "2026-10-10",
  },
  {
    id: "std-004",
    name: "Rahul Verma",
    email: "rahul@example.com",
    targetExam: "NDA",
    status: "Pending",
    score: 380,
    joinedDate: "2026-10-25",
  },
  {
    id: "std-005",
    name: "Priya Patel",
    email: "priya@example.com",
    targetExam: "CDS",
    status: "Inactive",
    score: 290,
    joinedDate: "2026-08-12",
  },
];

export const ADMIN_EXAM_STATS_PREVIEW: ExamStatPreview[] = [
  { exam: "NDA / NA", totalEnrolled: 1240, avgScore: 415, passRate: "68%" },
  { exam: "CDS Exam", totalEnrolled: 890, avgScore: 395, passRate: "62%" },
  { exam: "AFCAT Flying/Tech", totalEnrolled: 650, avgScore: 210, passRate: "74%" },
];

export const PREVIEW_ACTIVITY: any[] = [
  { id: "act-1", label: "Mock Exam", text: "Attempted NDA Mathematics Mock 4", at: "10m ago", tone: "info", title: "Attempted NDA Mathematics Mock 4", time: "10m ago", category: "mock" },
  { id: "act-2", label: "Study Log", text: "Submitted Study Log: 2h Physics", at: "1h ago", tone: "success", title: "Submitted Study Log: 2h Physics", time: "1h ago", category: "study" },
  { id: "act-3", label: "New User", text: "New Cadet Registered: Rahul Verma", at: "3h ago", tone: "warning", title: "New Cadet Registered: Rahul Verma", time: "3h ago", category: "user" },
];

export const PREVIEW_KPIS = Object.assign(
  [
    { label: "Enrolled Cadets", value: 2450, change: "+12%", hint: "vs last week" },
    { label: "Questions in Bank", value: 15200, change: "+450", hint: "added this month" },
    { label: "Tests Attempted", value: 8920, change: "+8%", hint: "total completed" },
    { label: "Avg Math Score", value: 214, change: "+14 pts", hint: "average accuracy" },
  ],
  {
    enrolledCadets: { label: "Enrolled Cadets", value: 2450, change: "+12%", hint: "vs last week" },
    questionsInBank: { label: "Questions in Bank", value: 15200, change: "+450", hint: "added this month" },
    testsAttempted: { label: "Tests Attempted", value: 8920, change: "+8%", hint: "total completed" },
  }
);

export const PREVIEW_QUERIES: QueryItem[] = [
  {
    id: "q-1",
    student_name: "Sanket Kumar",
    student_email: "sanket@earthspnda.com",
    query_text: "Trigonometry Identity Proofs assistance",
    created_at: "2026-10-20",
    status: "Resolved",
    cadet: "Sanket Kumar",
    topic: "Trigonometry Identity Proofs",
  },
  {
    id: "q-2",
    student_name: "Ananya Sharma",
    student_email: "ananya@example.com",
    query_text: "AFCAT Reasoning Marking Scheme breakdown",
    created_at: "2026-10-22",
    status: "Open",
    cadet: "Ananya Sharma",
    topic: "AFCAT Reasoning Marking Scheme",
  },
];

export const SHOW_SAMPLE_DATA = true;