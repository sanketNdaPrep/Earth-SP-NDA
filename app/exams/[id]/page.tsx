"use client";

import { ExamGuide } from "@/components/exams/exam-guide";
import { SyllabusDownload } from "@/components/exams/syllabus-download";
import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { supabase } from "@/lib/supabaseClient";

interface ExamConfig {
  code: string;
  name: string;
  description: string;
  eligibility: string;
  ageLimit: string;
  markingScheme: string;
  pattern: { paper: string; duration: string; marks: string; questions: string }[];
  syllabus: { subject: string; topics: string }[];
}

const EXAM_DATA: Record<string, ExamConfig> = {
  nda: {
    code: "NDA / NA",
    name: "National Defence Academy",
    description:
      "Joint Services academy of the Indian Armed Forces evaluating candidates through Mathematics and General Ability Test (GAT) papers.",
    eligibility: "10+2 passed or appearing. Physics and Mathematics are needed for the Air Force, Naval and Naval Academy entries.",
    ageLimit: "16.5 to 19.5 years",
    markingScheme: "+2.50 / -0.83 per question in Maths. +4.00 / -1.33 per question in GAT.",
    pattern: [
      { paper: "Paper I: Mathematics", duration: "2.5 Hours", marks: "300 Marks", questions: "120 Qs" },
      { paper: "Paper II Part A: English (GAT)", duration: "2.5 Hours for Paper II", marks: "200 Marks", questions: "50 Qs" },
      { paper: "Paper II Part B: General Knowledge (GAT)", duration: "2.5 Hours for Paper II", marks: "400 Marks", questions: "100 Qs" },
      { paper: "SSB Interview", duration: "5 Days", marks: "900 Marks", questions: "Five-day process" },
    ],
    syllabus: [
      {
        subject: "Mathematics",
        topics:
          "Algebra, Matrices & Determinants, Trigonometry, Analytical Geometry (2D/3D), Differential & Integral Calculus, Vector Algebra, Statistics & Probability.",
      },
      {
        subject: "English (GAT Part A)",
        topics: "Grammar & Usage, Vocabulary, Reading Comprehension, Spotting Errors, Sentence Improvement & Ordering.",
      },
      {
        subject: "General Science (GAT Part B)",
        topics: "Physics (Mechanics, Optics, Electricity), Chemistry (Physical & Organic Basics), General Biology.",
      },
      {
        subject: "History & Civics",
        topics: "Indian Freedom Movement, Constitution of India, World History Overview, Fundamental Rights & Duties.",
      },
      {
        subject: "Geography & Current Affairs",
        topics: "Physical Geography, Climate Systems, Natural Resources, Indian Geography, Defence Updates & Global Events.",
      },
    ],
  },
  cds: {
    code: "CDS (IMA/INA/AFA/OTA)",
    name: "Combined Defence Services",
    description:
      "Graduate-level entry examination conducted by UPSC for officer cadre entry into Indian Military Academy, Naval Academy, Air Force Academy, and Officer's Training Academy.",
    eligibility: "A bachelor's degree. Engineering for the Naval Academy, and Physics and Maths at Class 12 or engineering for the Air Force Academy.",
    ageLimit: "19 to 24 years (IMA/INA) | 20 to 24 years (AFA) | 19 to 25 years (OTA)",
    markingScheme: "One third of a question's marks is deducted for every wrong answer.",
    pattern: [
      { paper: "Paper I: English", duration: "2.0 Hours", marks: "100 Marks", questions: "120 Qs" },
      { paper: "Paper II: General Knowledge", duration: "2.0 Hours", marks: "100 Marks", questions: "120 Qs" },
      { paper: "Paper III: Elementary Mathematics (not for OTA)", duration: "2.0 Hours", marks: "100 Marks", questions: "100 Qs" },
      { paper: "SSB Interview (IMA, INA, AFA)", duration: "5 Days", marks: "300 Marks", questions: "Five-day process" },
    ],
    syllabus: [
      {
        subject: "English",
        topics: "Synonyms & Antonyms, Reading Comprehension, Sentence Ordering, Idioms & Phrases, Cloze Test.",
      },
      {
        subject: "General Knowledge",
        topics: "Indian Polity & Constitution, Modern Indian History, Physical Geography, Basic Science, International Relations.",
      },
      {
        subject: "Elementary Mathematics",
        topics: "Arithmetic, Algebra, Geometry, Mensuration, Trigonometry, Statistics & Data Interpretation.",
      },
    ],
  },
  afcat: {
    code: "AFCAT Flying & Ground Duty",
    name: "Air Force Common Admission Test",
    description: "Official entry exam conducted by the Indian Air Force for Flying Branch and Ground Duty (Technical & Non-Technical) branches.",
    eligibility: "Graduation with at least 60%. Flying and Technical branches also need 50% in Maths and Physics in Class 12.",
    ageLimit: "20 to 24 years (Flying Branch) | 20 to 26 years (Ground Duty)",
    markingScheme: "+3 for a right answer and -1 for a wrong answer.",
    pattern: [
      { paper: "AFCAT Online Examination", duration: "2.0 Hours", marks: "300 Marks", questions: "100 Qs" },
      { paper: "EKT (Technical Branch Candidates Only)", duration: "45 Minutes", marks: "150 Marks", questions: "50 Qs" },
    ],
    syllabus: [
      {
        subject: "Verbal Ability in English",
        topics: "Comprehension, Error Detection, Sentence Completion, Synonyms & Antonyms, Idioms & Phrases.",
      },
      {
        subject: "Numerical Ability",
        topics: "Decimal Fractions, Time & Work, Averages, Profit & Loss, Percentage, Simple Interest, Ratio & Proportion.",
      },
      {
        subject: "Reasoning & Military Aptitude",
        topics: "Verbal Skills, Spatial Reasoning, Analogy, Data Sufficiency, Embedded Figures & Pattern Matching.",
      },
      {
        subject: "General Awareness",
        topics: "Indian History, Sports, National & International Organisations, Science & Technology, Defence News.",
      },
    ],
  },
};

/** The mock_tests columns this page shows. */
interface MockTestRow {
  id: string;
  code: string;
  title: string;
  target_exam: string | null;
  total_questions: number;
  duration_minutes: number;
  total_marks: number;
}

function ExamDetailContent() {
  const params = useParams();
  const examId = (params?.id as string)?.toLowerCase() || "nda";
  const exam = EXAM_DATA[examId] || EXAM_DATA.nda;

  const [dbMocks, setDbMocks] = React.useState<MockTestRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchMocks() {
      try {
        const { data, error } = await supabase
          .from("mock_tests")
          .select("*")
          .eq("kind", "mock")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const filtered = (data as MockTestRow[]).filter(
            (m) => m.target_exam?.toLowerCase() === examId || m.target_exam?.toLowerCase().includes(examId)
          );
          setDbMocks(filtered);
        }
      } catch (err) {
        console.error("Error fetching dynamic mocks:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMocks();
  }, [examId]);

  return (
    <div className="flex min-h-screen flex-col bg-navy-950 text-steel-100">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 border-b border-steel-700 bg-navy-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2 font-display text-base font-bold uppercase tracking-wider text-white">
            <Icons.logo className="size-6 text-gold-400" />
            <span className="whitespace-nowrap">EARTH SP NDA</span>
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link href="/#exams">
              <Button variant="outline" size="sm">
                <Icons.chevronRight className="size-4 rotate-180" />
                All Entry Schemes
              </Button>
            </Link>
            <Link href="/quizzes">
              <Button variant="primary" size="sm">Mock Test Center</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-10 md:px-8">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Hero Banner */}
          <div className="rounded-panel border border-gold-400/30 bg-navy-900 p-6 md:p-8">
            <Badge variant="gold" className="mb-3">{exam.code} Examination</Badge>
            <h1 className="text-balance font-display text-4xl font-bold tracking-tight text-white md:text-5xl">{exam.name}</h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-steel-300 md:text-lg">{exam.description}</p>
            <SyllabusDownload examSlug={examId} examName={examId.toUpperCase()} />
            
            <div className="mt-6 grid grid-cols-1 gap-3 border-t border-steel-700/60 pt-4 text-sm sm:grid-cols-2">
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wide text-steel-500">Eligibility</span>
                <span className="mt-1 block font-medium leading-relaxed text-white">{exam.eligibility}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wide text-steel-500">Age limit</span>
                <span className="mt-1 block font-semibold leading-relaxed text-gold-300">{exam.ageLimit}</span>
              </div>
            </div>
          </div>

          {/* Paper Pattern & Marking Scheme */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Examination Structure & Paper Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-steel-700 bg-navy-950 text-xs font-semibold uppercase tracking-wide text-steel-500">
                      <tr>
                        <th className="p-3">Paper</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Questions</th>
                        <th className="p-3">Total Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-steel-700/50">
                      {exam.pattern.map((p, idx) => (
                        <tr key={idx} className="hover:bg-navy-800/40">
                          <td className="p-3 font-semibold text-white">{p.paper}</td>
                          <td className="p-3 text-steel-300">{p.duration}</td>
                          <td className="p-3 text-steel-300">{p.questions}</td>
                          <td className="p-3 font-semibold text-gold-300">{p.marks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display text-2xl">Marking Scheme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="rounded-control border border-steel-700/60 bg-navy-950 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-steel-500">Official marking rule</div>
                  <div className="mt-2 font-semibold leading-relaxed text-gold-300">{exam.markingScheme}</div>
                </div>
                <div className="rounded-control border border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-300">
                  ⚡ Negative marking applies to all incorrect choices. Accurate answer selection is essential for clearing cutoffs.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Full guide: eligibility, age, medical, selection, SSB */}
          <ExamGuide examId={examId} />

          {/* Official Syllabus Breakdown */}
          <Card id="syllabus" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="text-lg">Syllabus & Core Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-xs text-steel-300">
                A student-friendly summary. Syllabus, pattern and dates can change, so check the latest notice on the official website
                ({examId === "afcat" ? "afcat.cdac.in" : "upsc.gov.in"}) before you apply.
              </p>
              <div className="space-y-4">
                {exam.syllabus.map((item, idx) => (
                  <div key={idx} className="rounded-control border border-steel-700/60 bg-navy-950 p-4 space-y-1">
                    <div className="font-mono text-xs font-bold uppercase text-gold-300">{item.subject}</div>
                    <p className="text-xs text-steel-200 leading-relaxed">{item.topics}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interactive Mock Test Series */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Available Mock Papers</h2>
                <p className="text-xs text-steel-300">Practice timed UPSC standard mock examinations for {exam.code}</p>
              </div>
              <Link href="/quizzes">
                <Button variant="outline" size="sm">View All Mocks</Button>
              </Link>
            </div>

            {loading ? (
              <div className="rounded-control border border-steel-700 bg-navy-900 p-6 text-center text-xs text-steel-400 font-mono">
                Loading available test series...
              </div>
            ) : dbMocks.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {dbMocks.map((mock) => (
                  <Card key={mock.id} className="flex flex-col justify-between">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-gold-300">{mock.code}</span>
                        <Badge variant="gold">{mock.target_exam}</Badge>
                      </div>
                      <CardTitle className="mt-2 text-lg">{mock.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-2 rounded-control border border-steel-700 bg-navy-950 p-3 text-center text-xs">
                        <div>
                          <div className="text-steel-500 uppercase font-semibold">Questions</div>
                          <div className="mt-1 font-mono font-bold text-white">{mock.total_questions}</div>
                        </div>
                        <div>
                          <div className="text-steel-500 uppercase font-semibold">Duration</div>
                          <div className="mt-1 font-mono font-bold text-white">{mock.duration_minutes}m</div>
                        </div>
                        <div>
                          <div className="text-steel-500 uppercase font-semibold">Marks</div>
                          <div className="mt-1 font-mono font-bold text-gold-300">{mock.total_marks}</div>
                        </div>
                      </div>
                      <Link href={`/quizzes/${mock.id}`} className="block">
                        <Button variant="primary" className="w-full">Start Mock Exam</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-panel border border-dashed border-steel-700 bg-navy-900/50 p-8 text-center">
                <p className="font-bold text-white">No mock tests published yet</p>
                <p className="mt-1 text-sm text-steel-300">Full papers for {exam.name} will appear here as soon as they go live.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ExamDetailPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-navy-950" />}>
      <ExamDetailContent />
    </React.Suspense>
  );
}