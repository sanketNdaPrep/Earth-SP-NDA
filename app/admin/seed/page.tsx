'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface Quiz {
  id: string;
  title: string;
  category: string;
}

export default function SeedQuestionPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  
  // New Quiz State
  const [showNewQuizForm, setShowNewQuizForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('NDA');
  const [newDescription, setNewDescription] = useState('');
  const [newTimeLimit, setNewTimeLimit] = useState(10);

  // New Question State
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [explanation, setExplanation] = useState('');

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch quizzes on mount
  useEffect(() => {
    fetchQuizzes();
  }, []);

  async function fetchQuizzes() {
    const { data } = await supabase.from('quizzes').select('id, title, category');
    if (data && data.length > 0) {
      setQuizzes(data);
      if (!selectedQuizId) setSelectedQuizId(data[0].id);
    }
  }

  // Create new Quiz
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    const { data, error } = await supabase
      .from('quizzes')
      .insert({
        title: newTitle,
        category: newCategory,
        description: newDescription,
        time_limit_mins: Number(newTimeLimit),
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      setStatusMsg({ type: 'error', text: `Failed to create quiz: ${error.message}` });
    } else if (data) {
      setStatusMsg({ type: 'success', text: `Module "${data.title}" created successfully!` });
      setNewTitle('');
      setNewDescription('');
      setShowNewQuizForm(false);
      await fetchQuizzes();
      setSelectedQuizId(data.id);
    }
  };

  // Add Question to selected Quiz with auto-calculated position
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizId) {
      setStatusMsg({ type: 'error', text: 'Please select a module first.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    // Fetch current question count to set position
    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_id', selectedQuizId);

    const nextPosition = (count || 0) + 1;

    const { error } = await supabase.from('questions').insert({
      quiz_id: selectedQuizId,
      question_text: questionText,
      option_a: optionA,
      option_b: optionB,
      option_c: optionC,
      option_d: optionD,
      correct_option: correctOption,
      explanation: explanation || null,
      position: nextPosition,
    });

    setLoading(false);

    if (error) {
      setStatusMsg({ type: 'error', text: `Failed to add question: ${error.message}` });
    } else {
      setStatusMsg({ type: 'success', text: `Question #${nextPosition} added successfully!` });
      // Reset question fields
      setQuestionText('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setExplanation('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider">
              Admin Suite
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">Question Bank Seeding Engine</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/quizzes" className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all">
              ← View Modules
            </Link>
          </div>
        </div>

        {/* Status Alert */}
        {statusMsg && (
          <div className={`p-4 rounded-xl border text-sm font-semibold ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {statusMsg.text}
          </div>
        )}

        {/* Module Selection / Creation Block */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">1. Select Target Examination Module</h2>
            <button
              onClick={() => setShowNewQuizForm(!showNewQuizForm)}
              className="text-xs text-emerald-400 font-bold hover:underline"
            >
              {showNewQuizForm ? '← Use Existing Module' : '+ Create New Module'}
            </button>
          </div>

          {showNewQuizForm ? (
            <form onSubmit={handleCreateQuiz} className="space-y-4 pt-2 border-t border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Module Title</label>
                  <input
                    required
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. AFCAT Flying Branch Technical Drill"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                  >
                    <option value="NDA">NDA</option>
                    <option value="CDS">CDS</option>
                    <option value="AFCAT">AFCAT</option>
                    <option value="SSB OIR">SSB OIR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Short Description</label>
                  <input
                    required
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="High-yield questions on spatial reasoning and numerical aptitude"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Time Limit (Minutes)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={newTimeLimit}
                    onChange={(e) => setNewTimeLimit(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs transition-all"
              >
                Save New Module
              </button>
            </form>
          ) : (
            <div>
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none"
              >
                {quizzes.map((q) => (
                  <option key={q.id} value={q.id}>
                    [{q.category}] {q.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Question Form Block */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-4">2. Add Question Item</h2>

          <form onSubmit={handleAddQuestion} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Question Statement</label>
              <textarea
                required
                rows={3}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter the complete question prompt here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Option A</label>
                <input
                  required
                  type="text"
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                  placeholder="Option A"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Option B</label>
                <input
                  required
                  type="text"
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  placeholder="Option B"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Option C</label>
                <input
                  required
                  type="text"
                  value={optionC}
                  onChange={(e) => setOptionC(e.target.value)}
                  placeholder="Option C"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Option D</label>
                <input
                  required
                  type="text"
                  value={optionD}
                  onChange={(e) => setOptionD(e.target.value)}
                  placeholder="Option D"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-emerald-400 mb-1">Correct Answer</label>
                <select
                  value={correctOption}
                  onChange={(e) => setCorrectOption(e.target.value as 'A' | 'B' | 'C' | 'D')}
                  className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-1">Explanation / Hint (Optional)</label>
                <input
                  type="text"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="e.g. Derived using logarithm property log(a*b) = log(a) + log(b)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20"
              >
                {loading ? 'Adding Question...' : 'Submit & Add Question to Database'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}