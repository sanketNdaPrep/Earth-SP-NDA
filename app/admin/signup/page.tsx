'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';

export default function AdminSignupPage() {
  const router = useRouter();
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

    if (password !== confirmPassword) {
      setMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setLoading(true);

    // The server checks the passcode and decides the account status.
    try {
      const res = await fetch('/api/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: signupMode,
          passcode: secretPasscode,
          fullName,
          email,
          phone,
          about,
          password,
        }),
      });
      const data = (await res.json()) as { ok: boolean; approved?: boolean; error?: string };

      if (!data.ok) {
        setMsg({ type: 'error', text: data.error ?? 'Registration failed.' });
      } else if (data.approved) {
        setMsg({ type: 'success', text: 'Passcode Verified! Account created & activated. Redirecting to login...' });
        setTimeout(() => {
          router.push('/admin/login');
        }, 1500);
      } else {
        setMsg({
          type: 'success',
          text: 'Approval Request Submitted! Your profile is pending Super Admin review. You can log in once approved.',
        });
      }
    } catch {
      setMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-control border border-steel-700 bg-navy-950 px-3 py-2 text-sm text-steel-100 placeholder:text-steel-500 focus:border-gold-400 focus:outline-none';
  const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-steel-300';
  const toggleClass =
    'absolute right-2 top-1/2 -translate-y-1/2 rounded-control px-2 py-1 text-xs font-semibold text-steel-300 hover:text-white focus-visible:outline-2 focus-visible:outline-gold-400';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-950 px-4 py-10 text-steel-100">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center">
          <Badge variant="gold" className="mb-3">
            Restricted Access // Command Center
          </Badge>
          <h1 className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tight text-white">
            <Icons.logo className="size-6 text-gold-400" />
            Admin Registration
          </h1>
          <p className="mt-1 text-xs text-steel-300">Choose how you want to verify your admin account.</p>
        </div>

        <Card className="border-gold-400/30 bg-navy-900/90 shadow-2xl backdrop-blur-md">
          <CardContent className="space-y-5 pt-6">
            <div role="group" aria-label="Registration method" className="grid grid-cols-2 gap-2 rounded-control border border-steel-700 bg-navy-950 p-1.5">
              {([
                ['passcode', 'Instant, with passcode'],
                ['approval', 'Request approval'],
              ] as const).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={signupMode === mode}
                  onClick={() => {
                    setSignupMode(mode);
                    setMsg(null);
                  }}
                  className={`rounded-control px-3 py-2.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-gold-400 ${
                    signupMode === mode ? 'bg-gold-400 text-navy-950' : 'text-steel-300 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {msg && (
              <div
                role={msg.type === 'error' ? 'alert' : 'status'}
                className={`flex items-start gap-2 rounded-control border p-3 text-xs ${
                  msg.type === 'success'
                    ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
                    : 'border-danger-500/40 bg-danger-500/10 text-danger-300'
                }`}
              >
                {msg.type === 'success' ? (
                  <Icons.checkCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                ) : (
                  <Icons.info className="mt-0.5 size-4 shrink-0" aria-hidden />
                )}
                <span>{msg.text}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              {signupMode === 'passcode' ? (
                <div className="space-y-1 rounded-control border border-gold-400/30 bg-gold-400/5 p-4">
                  <label htmlFor="admin-passcode" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-300">
                    <Icons.lock className="size-4" aria-hidden />
                    Admin security passcode
                  </label>
                  <div className="relative">
                    <input
                      id="admin-passcode"
                      required
                      autoComplete="off"
                      type={showSecretPasscode ? 'text' : 'password'}
                      value={secretPasscode}
                      onChange={(e) => setSecretPasscode(e.target.value)}
                      placeholder="Enter the admin passcode"
                      className={`${inputClass} pr-16`}
                    />
                    <button type="button" onClick={() => setShowSecretPasscode(!showSecretPasscode)} className={toggleClass} aria-pressed={showSecretPasscode}>
                      {showSecretPasscode ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <p className="text-xs text-steel-500">A correct passcode activates your account right away.</p>
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-control border border-steel-700 bg-navy-950 p-4 text-xs text-steel-300">
                  <Icons.info className="mt-0.5 size-4 shrink-0 text-gold-300" aria-hidden />
                  <p>
                    <strong className="text-white">Manual approval:</strong> your account is created as pending. You can log in after an approved admin approves it.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="admin-name" className={labelClass}>Full name</label>
                  <input id="admin-name" required autoComplete="name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label htmlFor="admin-email" className={labelClass}>Email address</label>
                  <input id="admin-email" required autoComplete="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@earthspnda.com" className={inputClass} />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="admin-phone" className={labelClass}>Phone number</label>
                <input id="admin-phone" required autoComplete="tel" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" className={inputClass} />
              </div>

              <div className="space-y-1">
                <label htmlFor="admin-about" className={labelClass}>About you (optional)</label>
                <textarea id="admin-about" rows={2} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Short introduction" className={inputClass} />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="admin-password" className={labelClass}>Password</label>
                  <div className="relative">
                    <input id="admin-password" required minLength={8} autoComplete="new-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className={`${inputClass} pr-16`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className={toggleClass} aria-pressed={showPassword}>
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="admin-confirm" className={labelClass}>Confirm password</label>
                  <div className="relative">
                    <input id="admin-confirm" required minLength={8} autoComplete="new-password" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className={`${inputClass} pr-16`} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={toggleClass} aria-pressed={showConfirmPassword}>
                      {showConfirmPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </div>

              <Button type="submit" variant="gold" disabled={loading} className="w-full py-2.5">
                <Icons.shield className="size-4" aria-hidden />
                <span>
                  {loading
                    ? 'Processing registration...'
                    : signupMode === 'passcode'
                    ? 'Verify passcode and register'
                    : 'Submit for approval'}
                </span>
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex justify-between px-2 text-xs text-steel-400">
          <Link href="/admin/login" className="hover:text-gold-300 hover:underline">
            Already an admin? Log in
          </Link>
          <Link href="/" className="hover:text-white hover:underline">
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
