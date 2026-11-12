"use client";

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
    eligibility: "10+2 Passed or Appearing (Physics, Chemistry, Maths required for Air Force & Navy branches).",
    ageLimit: "16.5 to 19.5 years",
    markingScheme: "+2.5 / -0.83 Marks (Maths) | +4.0 / -1.33 Marks (GAT)",
    pattern: [
      { paper: "Paper I: Mathematics", duration: "2.5 Hours", marks: "300 Marks", questions: "120 Qs" },
      { paper: "Paper II: General Ability Test (GAT)", duration: "2.5 Hours", marks: "600 Marks", questions: "150 Qs" },
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
    eligibility: "Graduation Degree in any discipline (B.E./B.Tech required for Naval & Air Force entries).",
    ageLimit: "19 to 24 years (IMA/INA/AFA) | 19 to 25 years (OTA)",
    markingScheme: "+1.0 / -0.33 Marks per question across all papers.",
    pattern: [
      { paper: "Paper I: English", duration: "2.0 Hours", marks: "100 Marks", questions: "120 Qs" },
      { paper: "Paper II: General Knowledge", duration: "2.0 Hours", marks: "100 Marks", questions: "120 Qs" },
      { paper: "Paper III: Elementary Mathematics (Non-OTA)", duration: "2.0 Hours", marks: "100 Marks", questions: "100 Qs" },
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
    eligibility: "Graduation with minimum 60% marks and minimum 60% in 10+2 Math & Physics.",
    ageLimit: "20 to 24 years (Flying Branch) | 20 to 26 years (Ground Duty)",
    markingScheme: "+3.0 / -1.0 Marks per question.",
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

function ExamDetailContent() {
  const params = useParams();
  const examId = (params?.id as string)?.toLowerCase() || "nda";
  const exam = EXAM_DATA[examId] || EXAM_DATA.nda;

  const [dbMocks, setDbMocks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchMocks() {
      try {
        const { data, error } = await supabase
          .from("mock_tests")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const filtered = data.filter(
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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider text-white">
            <Icons.logo className="size-6 text-gold-400" />
            <span>EARTH SP NDA</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/#exams">
              <Button variant="outline" size="sm">
                <Icons.chevronRight className="size-4 rotate-180" />
                All Entry Schemes
              </Button>
            </Link>
            <Link href="/dashboard/mocks">
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
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{exam.name}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-steel-300 md:text-base">{exam.description}</p>
            
            <div className="mt-6 flex flex-wrap gap-4 border-t border-steel-700/60 pt-4 text-xs">
              <div>
                <span className="text-steel-400 uppercase font-semibold">Eligibility:</span>
                <span className="ml-2 font-medium text-white">{exam.eligibility}</span>
              </div>
              <div>
                <span className="text-steel-400 uppercase font-semibold">Age Limit:</span>
                <span className="ml-2 font-mono font-bold text-gold-300">{exam.ageLimit}</span>
              </div>
            </div>
          </div>

          {/* Paper Pattern & Marking Scheme */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Examination Structure & Paper Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-steel-700 bg-navy-950 font-mono text-steel-400 uppercase">
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
                          <td className="p-3 font-mono text-steel-300">{p.duration}</td>
                          <td className="p-3 font-mono text-steel-300">{p.questions}</td>
                          <td className="p-3 font-mono font-bold text-gold-300">{p.marks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Marking Scheme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="rounded-control border border-steel-700/60 bg-navy-950 p-4">
                  <div className="text-steel-400 font-semibold uppercase">Official Marking Rule</div>
                  <div className="mt-2 font-mono font-bold text-gold-300">{exam.markingScheme}</div>
                </div>
                <div className="rounded-control border border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-300">
                  ⚡ Negative marking applies to all incorrect choices. Accurate answer selection is essential for clearing cutoffs.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Official Syllabus Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Official Syllabus & Core Topics</CardTitle>
            </CardHeader>
            <CardContent>
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
              <Link href="/dashboard/mocks">
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
                      <Link href={`/dashboard/mocks/${mock.id}`} className="block">
                        <Button variant="primary" className="w-full">Start Mock Exam</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Fallback default sample mock card */
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card className="flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-gold-300">{examId.toUpperCase()}-FULL-01</span>
                      <Badge variant="gold">{exam.code}</Badge>
                    </div>
                    <CardTitle className="mt-2 text-lg">{exam.name} Full Mock Paper 01</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 rounded-control border border-steel-700 bg-navy-950 p-3 text-center text-xs">
                      <div>
                        <div className="text-steel-500 uppercase font-semibold">Questions</div>
                        <div className="mt-1 font-mono font-bold text-white">120</div>
                      </div>
                      <div>
                        <div className="text-steel-500 uppercase font-semibold">Duration</div>
                        <div className="mt-1 font-mono font-bold text-white">150m</div>
                      </div>
                      <div>
                        <div className="text-steel-500 uppercase font-semibold">Marks</div>
                        <div className="mt-1 font-mono font-bold text-gold-300">300</div>
                      </div>
                    </div>
                    <Link href="/dashboard/mocks/nda-maths-01" className="block">
                      <Button variant="primary" className="w-full">
                        <Icons.calculator className="size-4" />
                        Start Mock Exam
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
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