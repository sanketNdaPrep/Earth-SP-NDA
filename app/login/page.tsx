'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(`Login failed: ${error.message}`);
    } else {
      setMessage('Success! Redirecting...');
      router.push('/quizzes');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-white text-center">Cadet Login</h2>
        <p className="text-slate-400 text-xs text-center mt-1">Access your EARTH SP NDA portal</p>

        {message && <p className="mt-4 p-3 rounded bg-slate-800 text-xs text-center font-medium text-emerald-400">{message}</p>}

        <form onSubmit={handleLogin} className="mt-6 space-y-4 text-sm">
          <div>
            <label className="block text-slate-400 mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="cadet@defence.in" />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold p-3 rounded-xl transition-all">
            Login
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Need an account? <Link href="/signup" className="text-emerald-400 hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}