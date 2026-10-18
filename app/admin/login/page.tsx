'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setMsg({ type: 'error', text: `Login failed: ${error.message}` });
      return;
    }

    // Check admin profile and approval status
    const { data: adminRecord } = await supabase
      .from('admin_profiles')
      .select('role, is_approved')
      .eq('id', data.user.id)
      .single();

    setLoading(false);

    if (!adminRecord) {
      await supabase.auth.signOut();
      setMsg({ type: 'error', text: 'Access Denied. You do not have registered Admin privileges.' });
    } else if (!adminRecord.is_approved) {
      await supabase.auth.signOut();
      setMsg({
        type: 'error',
        text: 'Account Pending Approval. Your registration has not been approved by the Super Admin yet.',
      });
    } else {
      setMsg({ type: 'success', text: 'Authentication Granted! Redirecting to workspace...' });
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
        
        <div className="text-center space-y-2 border-b border-slate-800 pb-6">
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider">
            Admin Portal Access
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-1">Admin Sign In</h1>
          <p className="text-xs text-slate-400">Authenticate credentials to manage portal content.</p>
        </div>

        {msg && (
          <div className={`p-4 rounded-xl border text-xs font-semibold ${
            msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Admin Email Address</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@earthspnda.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20">
            {loading ? 'Authenticating Credentials...' : 'Sign In to Admin Workspace'}
          </button>
        </form>

        <div className="flex justify-between items-center pt-2 text-xs text-slate-400">
          <Link href="/admin/signup" className="text-emerald-400 font-bold hover:underline">New Admin? Sign Up →</Link>
          <Link href="/" className="hover:text-white">← Return Home</Link>
        </div>

      </div>
    </div>
  );
}