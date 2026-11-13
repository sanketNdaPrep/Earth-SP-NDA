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
      const { data } = await supabase.from('quizzes').select('*');
      if (data) {
        setQuizzes(data);
      }
      setLoading(false);
    }
    fetchQuizzes();
  }, []);

  return (
    <div className="min-h-screen bg-navy-950 text-steel-100 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Examination Modules</h1>
            <p className="text-steel-500 text-sm mt-1">Select an evaluation set to test your preparation.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard" 
              className="bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/10"
            >
              📊 Cadet Dashboard
            </Link>
            <Link 
              href="/" 
              className="bg-navy-800 hover:bg-steel-700 text-steel-300 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all"
            >
              ← Home
            </Link>
          </div>
        </div>

        {/* Modules Grid */}
        {loading ? (
          <p className="text-steel-500 animate-pulse text-center py-10">Loading examination modules...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-navy-900 border border-navy-800 p-6 rounded-2xl flex flex-col justify-between shadow-xl hover:border-steel-700 transition-all">
                <div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                    {quiz.category}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-3">{quiz.title}</h2>
                  <p className="text-steel-500 text-sm mt-2 leading-relaxed">{quiz.description}</p>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-navy-800/80">
                  <span className="text-xs text-steel-500 flex items-center gap-1 font-medium">
                    ⏱️ {quiz.time_limit_mins} mins
                  </span>
                  <Link
                    href={`/quiz/${quiz.id}`}
                    className="bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/10"
                  >
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