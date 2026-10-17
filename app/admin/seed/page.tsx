'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface Quiz {
  id: string;
  title: string;
  category: string;
}

export default function AdminControlPage() {
  const [activeTab, setActiveTab] = useState<'questions' | 'resources'>('questions');
  
  // Quizzes & Questions State
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [showNewQuizForm, setShowNewQuizForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('NDA');
  const [newDescription, setNewDescription] = useState('');
  const [newTimeLimit, setNewTimeLimit] = useState(10);

  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [explanation, setExplanation] = useState('');

  // PDF Resource State
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfCategory, setPdfCategory] = useState('Study Planner');
  const [pdfSize, setPdfSize] = useState('2.5 MB');
  const [pdfRecommendedFor, setPdfRecommendedFor] = useState('NDA Aspirants');
  const [pdfUrl, setPdfUrl] = useState('');

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizId) {
      setStatusMsg({ type: 'error', text: 'Please select a module first.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

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
      setQuestionText('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setExplanation('');
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    const { error } = await supabase.from('resources').insert({
      title: pdfTitle,
      category: pdfCategory,
      size: pdfSize,
      recommended_for: pdfRecommendedFor,
      download_url: pdfUrl || '#',
      downloads: 0,
    });

    setLoading(false);

    if (error) {
      setStatusMsg({ type: 'error', text: `Failed to add resource: ${error.message}` });
    } else {
      setStatusMsg({ type: 'success', text: `PDF Resource "${pdfTitle}" published live to home page!` });
      setPdfTitle('');
      setPdfUrl('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider">
              Admin Portal
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">Content & Resource Control Engine</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all">
              ← View Website
            </Link>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-4 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('questions')}
            className={`pb-2 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'questions' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            ❓ Question & Module Manager
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`pb-2 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'resources' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            📚 PDF & Study Planner Publisher
          </button>
        </div>

        {statusMsg && (
          <div className={`p-4 rounded-xl border text-sm font-semibold ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {statusMsg.text}
          </div>
        )}

        {/* Tab 1: Questions & Modules */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
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
                        placeholder="e.g. AFCAT Technical Drill"
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
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                      <input
                        required
                        type="text"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="High-yield questions set"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Time Limit (Mins)</label>
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

                  <button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs">
                    Save New Module
                  </button>
                </form>
              ) : (
                <select
                  value={selectedQuizId}
                  onChange={(e) => setSelectedQuizId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none"
                >
                  {quizzes.map((q) => (
                    <option key={q.id} value={q.id}>
                      [{q.category}] {q.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-4">2. Add Question Item</h2>
              <form onSubmit={handleAddQuestion} className="space-y-4">
                <textarea
                  required
                  rows={3}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter question statement..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-emerald-500 outline-none"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required type="text" value={optionA} onChange={(e) => setOptionA(e.target.value)} placeholder="Option A" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                  <input required type="text" value={optionB} onChange={(e) => setOptionB(e.target.value)} placeholder="Option B" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                  <input required type="text" value={optionC} onChange={(e) => setOptionC(e.target.value)} placeholder="Option C" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                  <input required type="text" value={optionD} onChange={(e) => setOptionD(e.target.value)} placeholder="Option D" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select value={correctOption} onChange={(e) => setCorrectOption(e.target.value as 'A' | 'B' | 'C' | 'D')} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white">
                    <option value="A">Correct: Option A</option>
                    <option value="B">Correct: Option B</option>
                    <option value="C">Correct: Option C</option>
                    <option value="D">Correct: Option D</option>
                  </select>
                  <input type="text" value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Explanation (Optional)" className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-sm">
                  Add Question to Quiz
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Resource / PDF Publisher */}
        {activeTab === 'resources' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-4">Publish New Study Material or PDF</h2>
            
            <form onSubmit={handleAddResource} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Document Title</label>
                <input
                  required
                  type="text"
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  placeholder="e.g. NDA 2026 Mathematics Complete Formula Sheet"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                  <select
                    value={pdfCategory}
                    onChange={(e) => setPdfCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                  >
                    <option value="Study Planner">Study Planner</option>
                    <option value="E-Book / PDF">E-Book / PDF</option>
                    <option value="SSB Drill">SSB Drill</option>
                    <option value="PYQ Sheet">PYQ Sheet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">File Size</label>
                  <input
                    required
                    type="text"
                    value={pdfSize}
                    onChange={(e) => setPdfSize(e.target.value)}
                    placeholder="e.g. 3.2 MB"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Recommended For</label>
                  <input
                    required
                    type="text"
                    value={pdfRecommendedFor}
                    onChange={(e) => setPdfRecommendedFor(e.target.value)}
                    placeholder="e.g. NDA & CDS Aspirants"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">PDF File Drive Link / Download URL</label>
                <input
                  type="text"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="Paste Google Drive link or file URL here (or leave blank for placeholder)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 mt-4"
              >
                Publish Resource Live to Portal
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}