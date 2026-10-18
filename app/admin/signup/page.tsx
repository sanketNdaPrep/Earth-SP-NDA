'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

const ADMIN_SECRET_PASSCODE = 'EARTH_SP_2026_OFFICER';

export default function AdminSignupPage() {
  const [signupMode, setSignupMode] = useState<'passcode' | 'approval'>('passcode');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [about, setAbout] = useState('');
  const [secretPasscode, setSecretPasscode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility Toggles
  const [showSecretPasscode, setShowSecretPasscode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (signupMode === 'passcode' && secretPasscode.trim() !== ADMIN_SECRET_PASSCODE) {
      setMsg({
        type: 'error',
        text: 'Invalid Admin Passcode. Switch to "Request Approval" if you do not have a passcode.',
      });
      return;
    }

    if (password !== confirmPassword) {
      setMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setLoading(true);

    const isApprovedImmediately = signupMode === 'passcode';

    // Sign up via Supabase Auth (Trigger creates admin_profiles row)
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phone,
          about: about || '',
          role: 'admin',
          is_approved: isApprovedImmediately,
        },
      },
    });

    setLoading(false);

    if (authError) {
      setMsg({ type: 'error', text: authError.message });
    } else if (isApprovedImmediately) {
      setMsg({ type: 'success', text: 'Passcode Verified! Account created & activated. Redirecting to login...' });
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 1500);
    } else {
      setMsg({
        type: 'success',
        text: 'Approval Request Submitted! Your profile is pending Super Admin review. You can log in once approved.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
        
        <div className="text-center space-y-2 border-b border-slate-800 pb-6">
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider">
            Protected Admin Portal
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-1">Admin Profile Registration</h1>
          <p className="text-xs text-slate-400">Choose registration verification method below.</p>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setSignupMode('passcode'); setMsg(null); }}
            className={`py-2.5 rounded-lg transition-all ${
              signupMode === 'passcode' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            🔑 Instant (With Passcode)
          </button>
          <button
            type="button"
            onClick={() => { setSignupMode('approval'); setMsg(null); }}
            className={`py-2.5 rounded-lg transition-all ${
              signupMode === 'approval' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⏳ Request Approval
          </button>
        </div>

        {msg && (
          <div className={`p-4 rounded-xl border text-xs font-semibold ${
            msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          
          {signupMode === 'passcode' ? (
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl space-y-1">
              <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider">
                🔒 Admin Security Passcode
              </label>
              <div className="relative">
                <input
                  required
                  type={showSecretPasscode ? 'text' : 'password'}
                  value={secretPasscode}
                  onChange={(e) => setSecretPasscode(e.target.value)}
                  placeholder="Enter Passcode (e.g. EARTH_SP_2026_OFFICER)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white focus:border-emerald-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowSecretPasscode(!showSecretPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-sm"
                  aria-label="Toggle Passcode Visibility"
                >
                  {showSecretPasscode ? '👁️' : '🙈'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">Provides instant account activation upon submission.</p>
            </div>
          ) : (
            <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl text-xs text-amber-400">
              ℹ️ <strong>Manual Approval Mode:</strong> Your profile will be created in <em>Pending</em> state. The Super Admin must approve your profile before login is granted.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
              <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@earthspnda.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
            <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">About Section / Role Bio (Optional)</label>
            <textarea rows={2} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Brief introduction..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-10 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-sm"
                  aria-label="Toggle Password Visibility"
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  required
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-10 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-sm"
                  aria-label="Toggle Confirm Password Visibility"
                >
                  {showConfirmPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all mt-2">
            {loading
              ? 'Processing Registration...'
              : signupMode === 'passcode'
              ? 'Verify Passcode & Register Admin Profile'
              : 'Submit Admin Profile for Approval'}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-400">
          Already an authorized Admin? <Link href="/admin/login" className="text-emerald-400 font-bold hover:underline">Log in as Admin →</Link>
        </div>

      </div>
    </div>
  );
}