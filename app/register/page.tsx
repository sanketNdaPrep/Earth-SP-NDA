"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { PasswordField } from "@/components/ui/password-field";
import { Select } from "@/components/ui/select";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [targetExam, setTargetExam] = React.useState("NDA");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Checked here, before anything is sent, so a typing slip never creates an account with a password nobody knows.
    if (password !== confirm) {
      setError("The two passwords do not match. Type the same password in both boxes.");
      return;
    }
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          target_exam: targetExam,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // The profile row is created by a database trigger from the sign-up data above.

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-navy-950 px-4 py-12">
      <ThemeToggle className="absolute right-4 top-4" />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Link href="/" aria-label="EARTH SP NDA home" className="mx-auto mb-2 flex items-center justify-center gap-2 rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400">
            <Icons.logo className="size-10 text-gold-400" />
            <span className="font-display whitespace-nowrap text-base font-bold uppercase tracking-widest text-white">EARTH SP NDA</span>
          </Link>
          <CardTitle className="text-2xl font-bold">Cadet Registration</CardTitle>
          <CardDescription>Create your account to unlock interactive mock series</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="rounded-control border border-danger-500/30 bg-danger-500/10 p-3 text-xs text-danger-400">
                {error}
              </div>
            )}
            <div className="space-y-1">
              <label htmlFor="reg-name" className="text-xs font-semibold uppercase tracking-wider text-steel-300">Full Name</label>
              <input
                id="reg-name"
                autoComplete="name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Sanket Kumar"
                className="w-full rounded-control border border-steel-700 bg-navy-950 px-3 py-2 text-sm text-steel-100 placeholder:text-steel-500 focus:border-gold-400 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="reg-email" className="text-xs font-semibold uppercase tracking-wider text-steel-300">Email Address</label>
              <input
                id="reg-email"
                autoComplete="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cadet@earthspnda.com"
                className="w-full rounded-control border border-steel-700 bg-navy-950 px-3 py-2 text-sm text-steel-100 placeholder:text-steel-500 focus:border-gold-400 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-steel-300">Target Entry Scheme</label>
              <Select value={targetExam} onChange={(e) => setTargetExam(e.target.value)}>
                <option value="NDA">NDA / NA Entrance Exam</option>
                <option value="CDS">CDS Combined Defence Services</option>
                <option value="AFCAT">AFCAT Air Force Common Admission Test</option>
              </Select>
            </div>
            <div className="space-y-1">
              <label htmlFor="reg-password" className="text-xs font-semibold uppercase tracking-wider text-steel-300">Password</label>
              <PasswordField id="reg-password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="space-y-1">
              <label htmlFor="reg-confirm" className="text-xs font-semibold uppercase tracking-wider text-steel-300">Confirm Password</label>
              <PasswordField id="reg-confirm" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" aria-invalid={confirm.length > 0 && confirm !== password} />
            </div>
            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Register Cadet Profile"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-steel-700/50 pt-4 text-xs text-steel-300">
          <span>Already registered? </span>
          <Link href="/login" className="ml-1 font-semibold text-gold-300 hover:underline">
            Sign In Here
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}