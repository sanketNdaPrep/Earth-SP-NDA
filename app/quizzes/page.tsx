'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  time_limit_mins: number;
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuizzes() {
      const { data, error } = await supabase.from('quizzes').select('*');
      if (!error && data) {
        setQuizzes(data);
      }
      setLoading(false);
    }
    fetchQuizzes();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Examination Modules</h1>
            <p className="text-slate-400 text-sm mt-1">Select an evaluation set to test your preparation.</p>
          </div>
          <Link href="/" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300">
            ← Back Home
          </Link>
        </div>

        {loading ? (
          <p className="text-slate-400 animate-pulse">Loading available modules...</p>
        ) : quizzes.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center">
            <h3 className="text-lg font-bold text-slate-300">No active tests found in database</h3>
            <p className="text-slate-500 text-sm mt-2">Database connection is active. Seed test items in Supabase to display modules here.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    {quiz.category}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-3">{quiz.title}</h3>
                  <p className="text-slate-400 text-sm mt-2">{quiz.description}</p>
                </div>
                <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-800">
                  <span className="text-xs text-slate-400">⏱️ {quiz.time_limit_mins} mins</span>
                  <Link href={`/quizzes/${quiz.id}`} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all">
                    Start Test →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}