'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetExam, setTargetExam] = useState('NDA');
  const [message, setMessage] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, target_exam: targetExam },
      },
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Registration successful! Check your email or try logging in.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-white text-center">Cadet Registration</h2>
        <p className="text-slate-400 text-xs text-center mt-1">Create your aspirant account for EARTH SP NDA</p>

        {message && <p className="mt-4 p-3 rounded bg-slate-800 text-xs text-center font-medium text-emerald-400">{message}</p>}

        <form onSubmit={handleSignup} className="mt-6 space-y-4 text-sm">
          <div>
            <label className="block text-slate-400 mb-1">Full Name</label>
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="Cadet Name" />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="cadet@defence.in" />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Target Entry</label>
            <select value={targetExam} onChange={(e) => setTargetExam(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none">
              <option value="NDA">NDA (National Defence Academy)</option>
              <option value="CDS">CDS (Combined Defence Services)</option>
              <option value="AFCAT">AFCAT (Air Force Common Admission Test)</option>
              <option value="ACC">ACC (Army Candidate Corps)</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold p-3 rounded-xl transition-all">
            Create Account
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already registered? <Link href="/login" className="text-emerald-400 hover:underline">Log in here</Link>
        </p>
      </div>
    </div>
  );
}