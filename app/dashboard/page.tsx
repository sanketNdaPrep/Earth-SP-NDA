'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface Attempt {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  attempted_at: string;
  quizzes?: {
    title: string;
    category: string;
  } | null;
}

interface UserProfile {
  full_name?: string;
  target_exam?: string;
  email?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    async function loadCadetData() {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData?.user) {
        router.push('/login');
        return;
      }

      setProfile({
        email: authData.user.email,
        full_name: authData.user.user_metadata?.full_name || 'Cadet',
        target_exam: authData.user.user_metadata?.target_exam || 'CDS',
      });

      // Fetch attempt data with relational fallback
      const { data: attemptData, error } = await supabase
        .from('user_quiz_attempts')
        .select(`
          id,
          quiz_id,
          score,
          total_questions,
          attempted_at,
          quizzes (
            title,
            category
          )
        `)
        .eq('user_id', authData.user.id)
        .order('attempted_at', { ascending: false });

      if (error || !attemptData) {
        // Fallback: direct attempt query
        const { data: rawAttempts } = await supabase
          .from('user_quiz_attempts')
          .select('*')
          .eq('user_id', authData.user.id)
          .order('attempted_at', { ascending: false });

        if (rawAttempts) {
          setAttempts(rawAttempts as Attempt[]);
        }
      } else {
        setAttempts(attemptData as unknown as Attempt[]);
      }

      setLoading(false);
    }

    loadCadetData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <p className="text-slate-400 animate-pulse">Loading cadet profile & performance metrics...</p>
      </div>
    );
  }

  const totalTests = attempts.length;
  const totalScore = attempts.reduce((acc, curr) => acc + curr.score, 0);
  const totalPossible = attempts.reduce((acc, curr) => acc + curr.total_questions, 0);
  const averagePercentage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
  const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
          <div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider">
              Target Entry: {profile?.target_exam}
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-3">{profile?.full_name}</h1>
            <p className="text-slate-400 text-sm mt-1">{profile?.email}</p>
          </div>

          <div className="flex gap-3">
            <Link href="/quizzes" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all">
              Take Practice Test
            </Link>
            <button onClick={handleLogout} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all">
              Sign Out
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <span className="text-xs text-slate-400 uppercase font-semibold">Total Evaluation Drills</span>
            <p className="text-3xl font-black text-white mt-2">{totalTests}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <span className="text-xs text-slate-400 uppercase font-semibold">Average Accuracy</span>
            <p className="text-3xl font-black text-emerald-400 mt-2">{averagePercentage}%</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <span className="text-xs text-slate-400 uppercase font-semibold">Highest Score Achieved</span>
            <p className="text-3xl font-black text-white mt-2">{bestScore}</p>
          </div>
        </div>

        {/* Attempt History Table */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Recent Test Attempts</h2>

          {attempts.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
              <p className="text-slate-400 text-sm">No evaluation drills attempted yet.</p>
              <Link href="/quizzes" className="inline-block mt-4 text-xs font-bold text-emerald-400 hover:underline">
                Attempt Your First Practice Test →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Module Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Score</th>
                    <th className="py-3.5 px-4">Date Attempted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {attempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 font-semibold text-white">
                        {attempt.quizzes?.title || 'Practice Drill'}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                          {attempt.quizzes?.category || 'General'}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-emerald-400">
                        {attempt.score} / {attempt.total_questions}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-400">
                        {new Date(attempt.attempted_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}