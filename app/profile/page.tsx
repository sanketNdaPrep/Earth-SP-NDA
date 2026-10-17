'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // User Profile State
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [targetExam, setTargetExam] = useState('NDA');
  const [targetBranch, setTargetBranch] = useState('Armoured Corps');

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status Alerts
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadCadetProfile() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setEmail(user.email || '');
      setFullName(user.user_metadata?.full_name || '');
      setTargetExam(user.user_metadata?.target_exam || 'NDA');
      setTargetBranch(user.user_metadata?.target_branch || 'Armoured Corps');
      setLoading(false);
    }

    loadCadetProfile();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        target_exam: targetExam,
        target_branch: targetBranch,
      },
    });

    setSavingProfile(false);

    if (error) {
      setProfileMsg({ type: 'error', text: `Failed to update profile: ${error.message}` });
    } else {
      setProfileMsg({ type: 'success', text: 'Cadet profile details updated successfully!' });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setUpdatingPassword(true);
    setPasswordMsg(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setUpdatingPassword(false);

    if (error) {
      setPasswordMsg({ type: 'error', text: `Failed to update password: ${error.message}` });
    } else {
      setPasswordMsg({ type: 'success', text: 'Security credentials updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-sans text-sm">
        Loading Cadet Profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider">
              Cadet Dossier
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">Profile & Security Settings</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl text-xs transition-all">
              📊 Performance Dashboard
            </Link>
            <button
              onClick={handleSignOut}
              className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-semibold px-4 py-2 rounded-xl text-xs transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Section 1: Cadet Information */}
        <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white">1. Service & Personal Information</h2>
            <p className="text-xs text-slate-400 mt-1">Configure your target commissioning entry and preferred combat or support arm.</p>
          </div>

          {profileMsg && (
            <div className={`p-4 rounded-xl border text-xs font-semibold ${
              profileMsg.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Cadet Officer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Registered Email Address</label>
                <input
                  disabled
                  type="email"
                  value={email}
                  className="w-full bg-slate-950/50 border border-slate-800/80 text-slate-500 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Target Entry / Examination</label>
                <select
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none"
                >
                  <option value="NDA">NDA (National Defence Academy)</option>
                  <option value="CDS">CDS (Combined Defence Services)</option>
                  <option value="AFCAT">AFCAT (Air Force Common Admission Test)</option>
                  <option value="ACC">ACC (Army Candidate Corps)</option>
                  <option value="SSB Direct">SSB Direct Entry / Tech</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Aspirational Branch / Arm</label>
                <select
                  value={targetBranch}
                  onChange={(e) => setTargetBranch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none"
                >
                  <option value="Armoured Corps">Armoured Corps</option>
                  <option value="Corps of Signals">Corps of Signals</option>
                  <option value="Army Ordnance Corps / Logistics">Army Ordnance Corps / Logistics</option>
                  <option value="Flying Branch (IAF)">Flying Branch (IAF)</option>
                  <option value="Infantry">Infantry</option>
                  <option value="Executive Branch (Navy)">Executive Branch (Navy)</option>
                  <option value="Technical / Engineering Branch">Technical / Engineering Branch</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={savingProfile}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20"
              >
                {savingProfile ? 'Saving Changes...' : 'Update Profile Dossier'}
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Security & Credentials */}
        <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white">2. Access Control & Password Reset</h2>
            <p className="text-xs text-slate-400 mt-1">Update your password credentials to maintain account security.</p>
          </div>

          {passwordMsg && (
            <div className={`p-4 rounded-xl border text-xs font-semibold ${
              passwordMsg.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">New Password</label>
                <input
                  required
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Confirm New Password</label>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={updatingPassword}
                className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold px-6 py-2.5 rounded-xl text-xs transition-all border border-slate-700"
              >
                {updatingPassword ? 'Updating Password...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}