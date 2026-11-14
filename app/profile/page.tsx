'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useSignOut } from '@/hooks/use-sign-out';
import { supabase } from '@/lib/supabaseClient';

type Notice = { type: 'success' | 'error'; text: string } | null;

function StatusNotice({ notice }: { notice: Notice }) {
  if (!notice) return null;
  const ok = notice.type === 'success';
  return (
    <div
      role={ok ? 'status' : 'alert'}
      className={cn(
        'rounded-control border p-3 text-xs font-semibold',
        ok
          ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
          : 'border-danger-500/40 bg-danger-500/10 text-danger-400',
      )}
    >
      {notice.text}
    </div>
  );
}

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
  const [profileMsg, setProfileMsg] = useState<Notice>(null);
  const [passwordMsg, setPasswordMsg] = useState<Notice>(null);

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

  const handleSignOut = useSignOut();

  if (loading) {
    return (
      <div
        role="status"
        className="flex min-h-screen items-center justify-center bg-navy-950 font-mono text-xs uppercase tracking-wider text-steel-300"
      >
        Loading Cadet Profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 p-6 text-steel-100 md:p-10">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Navigation & Header */}
        <header className="flex flex-col gap-4 border-b border-steel-700/60 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="gold">Cadet Dossier</Badge>
            <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight text-white">
              Profile &amp; Security Settings
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">
                <Icons.layoutDashboard className="size-4" />
                Performance Dashboard
              </Link>
            </Button>
            <Button variant="danger" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </header>

        {/* Section 1: Cadet Information */}
        <Card>
          <CardHeader className="border-b border-steel-700/60 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-control border border-gold-400/30 bg-gold-400/10 text-gold-300">
                <Icons.user className="size-4" />
              </span>
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-gold-300">Section 01</p>
                <CardTitle className="text-lg">Service &amp; Personal Information</CardTitle>
              </div>
            </div>
            <CardDescription className="pt-1">
              Configure your target commissioning entry and preferred combat or support arm.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-6">
            <StatusNotice notice={profileMsg} />

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="profile-name">Full Name</Label>
                  <Input
                    id="profile-name"
                    required
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Cadet Officer"
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="profile-email">Registered Email Address</Label>
                  <Input id="profile-email" disabled type="email" value={email} readOnly />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="profile-exam">Target Entry / Examination</Label>
                  <Select id="profile-exam" value={targetExam} onChange={(e) => setTargetExam(e.target.value)}>
                    <option value="NDA">NDA (National Defence Academy)</option>
                    <option value="CDS">CDS (Combined Defence Services)</option>
                    <option value="AFCAT">AFCAT (Air Force Common Admission Test)</option>
                    <option value="ACC">ACC (Army Candidate Corps)</option>
                    <option value="SSB Direct">SSB Direct Entry / Tech</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="profile-branch">Aspirational Branch / Arm</Label>
                  <Select id="profile-branch" value={targetBranch} onChange={(e) => setTargetBranch(e.target.value)}>
                    <option value="Armoured Corps">Armoured Corps</option>
                    <option value="Corps of Signals">Corps of Signals</option>
                    <option value="Army Ordnance Corps / Logistics">Army Ordnance Corps / Logistics</option>
                    <option value="Flying Branch (IAF)">Flying Branch (IAF)</option>
                    <option value="Infantry">Infantry</option>
                    <option value="Executive Branch (Navy)">Executive Branch (Navy)</option>
                    <option value="Technical / Engineering Branch">Technical / Engineering Branch</option>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end border-t border-steel-700/60 pt-5">
                <Button type="submit" loading={savingProfile}>
                  {savingProfile ? 'Saving Changes...' : 'Update Profile Dossier'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Section 2: Security & Credentials */}
        <Card>
          <CardHeader className="border-b border-steel-700/60 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-control border border-gold-400/30 bg-gold-400/10 text-gold-300">
                <Icons.lock className="size-4" />
              </span>
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-gold-300">Section 02</p>
                <CardTitle className="text-lg">Access Control &amp; Password Reset</CardTitle>
              </div>
            </div>
            <CardDescription className="pt-1">
              Update your password credentials to maintain account security.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-6">
            <StatusNotice notice={passwordMsg} />

            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="profile-new-password">New Password</Label>
                  <Input
                    id="profile-new-password"
                    required
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="profile-confirm-password">Confirm New Password</Label>
                  <Input
                    id="profile-confirm-password"
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="flex justify-end border-t border-steel-700/60 pt-5">
                <Button type="submit" variant="outline" loading={updatingPassword}>
                  {updatingPassword ? 'Updating Password...' : 'Change Password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
