'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface UserData {
  name: string;
  email: string;
  targetExam: string;
}

interface UserStats {
  totalTests: number;
  avgAccuracy: number;
}

interface ResourcePdf {
  id: string;
  title: string;
  category: string;
  size: string;
  downloads: number;
  recommended_for: string;
  download_url: string;
}

const RECOMMENDED_BOOKS = [
  {
    title: 'NDA/NA & CDS Chapterwise & Topicwise Solved Papers',
    author: 'Standard Defence Series',
    category: 'Mathematics & General Studies',
    bestFor: 'Building speed with authentic 10-year Previous Year Questions.',
    usageGuide: 'Solve 30 questions daily under timed conditions. Mark recurring log and calculus formulas in a dedicated notebook.',
  },
  {
    title: 'SSB OIR Test & PPDT Master Guide',
    author: 'Defence Selection Board Series',
    category: 'Stage-1 Screening',
    bestFor: 'Clearing Stage-1 screening at 22 SSB and all selection boards.',
    usageGuide: 'Practice 1 set of 50 spatial questions daily within 20 minutes to aim for OIR Rank 1.',
  },
  {
    title: 'Word Association Test (WAT) & TAT Workbook',
    author: 'Psychological Test Prep',
    category: 'SSB Psychology',
    bestFor: 'Developing natural, positive, and leadership-driven psychological responses.',
    usageGuide: 'Write 60 WAT words in 15 minutes without overthinking. Focus on action-oriented verbs.',
  },
];

export default function LandingPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<UserStats>({ totalTests: 0, avgAccuracy: 0 });
  const [resources, setResources] = useState<ResourcePdf[]>([]);
  const [downloadedFiles, setDownloadedFiles] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<'all' | 'planners'>('all');

  useEffect(() => {
    async function loadData() {
      // Fetch Cadet session
      const { data: authData } = await supabase.auth.getUser();

      if (authData?.user) {
        setUser({
          name: authData.user.user_metadata?.full_name || 'Cadet',
          email: authData.user.email || '',
          targetExam: authData.user.user_metadata?.target_exam || 'NDA / CDS',
        });

        const { data: attemptData } = await supabase
          .from('user_quiz_attempts')
          .select('score, total_questions')
          .eq('user_id', authData.user.id);

        if (attemptData && attemptData.length > 0) {
          const totalTests = attemptData.length;
          const totalScore = attemptData.reduce((acc, curr) => acc + curr.score, 0);
          const totalPossible = attemptData.reduce((acc, curr) => acc + curr.total_questions, 0);
          const avgAccuracy = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

          setStats({ totalTests, avgAccuracy });
        }
      }

      // Fetch dynamic resources from Supabase
      const { data: resData } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
      if (resData) {
        setResources(resData);
      }
    }

    loadData();
  }, []);

  const handleDownload = async (file: ResourcePdf) => {
    if (!downloadedFiles.includes(file.title)) {
      setDownloadedFiles((prev) => [...prev, file.title]);
    }

    // Increment download count in Supabase
    await supabase
      .from('resources')
      .update({ downloads: (file.downloads || 0) + 1 })
      .eq('id', file.id);

    if (file.download_url && file.download_url !== '#') {
      window.open(file.download_url, '_blank');
    } else {
      alert(`Downloading "${file.title}"... File downloaded to local drive.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* Top Announcement Bar */}
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 py-2 px-4 text-center text-xs font-semibold text-emerald-400">
        🔥 Built for NDA, CDS, AFCAT & SSB Aspirants • Inspired by Persevering SSB Bhopal Candidates
      </div>

      {/* Main Navigation */}
      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <span className="bg-emerald-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-md">EARTH SP</span>
          <span className="font-extrabold text-lg tracking-tight text-white">NDA PREP</span>
        </Link>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <Link href="/quizzes" className="hover:text-emerald-400 transition-all">Tests & Drills</Link>
          <Link href="#resources" className="hover:text-emerald-400 transition-all">PDF Hub</Link>
          <Link href="#books" className="hover:text-emerald-400 transition-all">Recommended Books</Link>
          <Link href="/admin/seed" className="text-slate-400 hover:text-white transition-all">Admin Control</Link>
          
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl transition-all">
                📊 Dashboard
              </Link>
              <Link href="/profile" className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-2 rounded-xl transition-all">
                👤 Profile
              </Link>
            </div>
          ) : (
            <Link href="/login" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl transition-all">
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 text-center space-y-6">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
          Integrated Officer Training Portal
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Master Written Defence Exams & Stage-1 SSB Screening
        </h1>
        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          High-yield practice drills, authentic topic-wise PYQs, curated study planners, and real-time performance analytics designed to take you from written clearing to recommended status.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link href="/quizzes" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20">
            Start Practice Test →
          </Link>
          <a href="#resources" className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold px-8 py-3.5 rounded-xl text-sm transition-all">
            Download Study PDFs
          </a>
        </div>
      </section>

      {/* Active Cadet Snapshot */}
      {user && (
        <section className="max-w-6xl mx-auto px-6 my-8">
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/30 p-6 md:p-8 rounded-2xl shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Active Cadet Profile</span>
                <h2 className="text-2xl font-extrabold text-white mt-1">Welcome Back, {user.name}</h2>
                <p className="text-xs text-slate-400">Target Entry: <strong className="text-slate-200">{user.targetExam}</strong></p>
              </div>
              <Link href="/dashboard" className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-4 py-2 rounded-xl transition-all">
                Full Analytics Dashboard →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold">Evaluations Completed</span>
                <p className="text-2xl font-black text-white mt-1">{stats.totalTests} Drills</p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold">Average Accuracy</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">{stats.avgAccuracy}%</p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold">Files Downloaded This Session</span>
                <p className="text-2xl font-black text-white mt-1">{downloadedFiles.length} PDFs</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Dynamic PDF Resources Hub */}
      <section id="resources" className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Sanket NDA Prep Vault</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">PDF Resources & Study Planners</h2>
            <p className="text-slate-400 text-sm mt-1">Curated study roadmaps, PYQ collections, and SSB screening preparation sheets.</p>
          </div>

          <div className="flex gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs font-semibold">
            <button 
              onClick={() => setSelectedTab('all')} 
              className={`px-3 py-1.5 rounded-lg transition-all ${selectedTab === 'all' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              All Files
            </button>
            <button 
              onClick={() => setSelectedTab('planners')} 
              className={`px-3 py-1.5 rounded-lg transition-all ${selectedTab === 'planners' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Study Planners
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources
            .filter((file) => selectedTab === 'all' || (selectedTab === 'planners' && file.category === 'Study Planner'))
            .map((file) => (
              <div key={file.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      {file.category}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">📥 {file.downloads} Downloads</span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug">{file.title}</h3>
                  <p className="text-xs text-slate-400 mt-2">Recommended for: <strong className="text-slate-300">{file.recommended_for}</strong></p>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
                  <span className="text-xs text-slate-500 font-mono">PDF • {file.size}</span>
                  <button
                    onClick={() => handleDownload(file)}
                    className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-2"
                  >
                    ⬇️ Download PDF
                  </button>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Recommended Books */}
      <section id="books" className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="border-b border-slate-800 pb-6">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Aspirant Arsenal</span>
          <h2 className="text-3xl font-extrabold text-white mt-1">Recommended Books & Effective Usage Guides</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {RECOMMENDED_BOOKS.map((book, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                  {book.category}
                </span>
                <h3 className="text-lg font-bold text-white leading-snug">{book.title}</h3>
                <p className="text-xs text-emerald-400 font-medium">Best For: {book.bestFor}</p>
                
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-emerald-400 block uppercase tracking-wider text-[10px]">How to Use Effectively:</span>
                  <p className="leading-relaxed">{book.usageGuide}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <p>© 2026 EARTH SP NDA Prep. Built for Defence Officers & Aspirants.</p>
      </footer>

    </div>
  );
}