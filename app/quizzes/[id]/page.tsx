'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  category: string;
  time_limit_mins: number;
}

function QuizRunnerContent() {
  const params = useParams();
  const quizId = params?.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!quizId) return;

    async function loadQuizData() {
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizData) {
        setQuiz(quizData);
        setTimeLeft(quizData.time_limit_mins * 60);
      }

      const { data: questionData } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId);

      if (questionData) {
        setQuestions(questionData);
      }

      setLoading(false);
    }

    loadQuizData();
  }, [quizId]);

  useEffect(() => {
    if (loading || submitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, submitted, timeLeft]);

  const handleSelectOption = (option: 'A' | 'B' | 'C' | 'D') => {
    if (submitted) return;
    setSelectedOptions((prev) => ({ ...prev, [currentIndex]: option }));
  };

  const handleSubmitQuiz = async () => {
    if (submitted) return;

    let totalScore = 0;
    questions.forEach((q, idx) => {
      if (selectedOptions[idx] === q.correct_option) {
        totalScore += 1;
      }
    });

    setScore(totalScore);
    setSubmitted(true);

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      console.error('User session not found:', userError);
      return;
    }

    const { error: insertError } = await supabase.from('user_quiz_attempts').insert({
      user_id: userData.user.id,
      quiz_id: quizId,
      score: totalScore,
      total_questions: questions.length,
    });

    if (insertError) {
      console.error('Failed to log test attempt:', insertError);
    } else {
      console.log('Quiz attempt successfully recorded!');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <p className="text-slate-400 animate-pulse">Loading examination module...</p>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-slate-200">No questions available for this module yet.</h2>
        <p className="text-slate-500 text-sm mt-2">Questions seeded in Supabase will automatically render here.</p>
        <Link href="/quizzes" className="mt-6 bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all">
          ← Return to Modules
        </Link>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans flex flex-col items-center">
      <div className="max-w-3xl w-full">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              {quiz.category}
            </span>
            <h1 className="text-2xl font-bold text-white mt-2">{quiz.title}</h1>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block uppercase">Time Remaining</span>
            <span className={`text-xl font-mono font-bold ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
              ⏱️ {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {submitted ? (
          <div className="bg-slate-900 border border-emerald-500/30 p-8 rounded-2xl text-center shadow-xl mb-8">
            <h2 className="text-3xl font-extrabold text-white">Quiz Completed!</h2>
            <p className="text-slate-400 text-sm mt-2">Your score has been logged to your aspirant profile.</p>

            <div className="my-6 inline-block bg-slate-950 border border-slate-800 px-8 py-4 rounded-xl">
              <span className="text-4xl font-black text-emerald-400">{score}</span>
              <span className="text-xl text-slate-500"> / {questions.length}</span>
            </div>

            <div className="flex gap-4 justify-center">
              <Link href="/quizzes" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all">
                Try Another Module
              </Link>
              <Link href="/dashboard" className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl transition-all">
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
            <div className="flex justify-between text-xs text-slate-400 font-semibold mb-4">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>Select 1 Answer</span>
            </div>

            <p className="text-lg font-medium text-white mb-6 leading-relaxed">{currentQ.question_text}</p>

            <div className="space-y-3">
              {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                const optKey = `option_${opt.toLowerCase()}` as keyof Question;
                const isSelected = selectedOptions[currentIndex] === opt;

                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left p-4 rounded-xl border transition-all text-sm font-medium flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>
                      <strong className="mr-3 text-slate-500">{opt}.</strong>
                      {currentQ[optKey] as string}
                    </span>
                    {isSelected && <span className="text-emerald-400 font-bold">✓</span>}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-800">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-all"
              >
                Previous
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-500/20"
                >
                  Submit Final Answers
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-all"
                >
                  Next Question →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuizRunnerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
          <p className="text-slate-400 animate-pulse">Loading examination module...</p>
        </div>
      }
    >
      <QuizRunnerContent />
    </Suspense>
  );
}