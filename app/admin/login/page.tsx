"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { getAdminStatus } from "@/lib/adminAuth";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Admin status is stored in app_metadata, which only the server can write
        const status = getAdminStatus(data.user);

        if (status !== "approved") {
          setError(
            status === "pending"
              ? "Your admin request is waiting for approval. You can log in once it is approved."
              : "Access Denied: Authorized Admin credentials required."
          );
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("System error during login execution.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-950 px-4 text-steel-100">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Badge variant="gold" className="mb-3">
            Restricted Access // Command Center
          </Badge>
          <h1 className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tight text-white">
            <Icons.logo className="size-6 text-gold-400" />
            EARTH SP Admin Portal
          </h1>
          <p className="mt-1 text-xs text-steel-400">
            Authenticate using authorized administrator credentials.
          </p>
        </div>

        <Card className="border-gold-400/30 bg-navy-900/90 shadow-2xl backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-center text-base font-semibold text-gold-300">
              System Credentials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              {error && (
                <div className="rounded-control border border-danger-500/40 bg-danger-500/10 p-3 text-xs text-danger-300">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-steel-300">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@earthspnda.com"
                  className="w-full rounded-control border border-steel-700 bg-navy-950 px-3 py-2 text-sm text-steel-100 focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-steel-300">
                  Security Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-control border border-steel-700 bg-navy-950 px-3 py-2 text-sm text-steel-100 focus:border-gold-400 focus:outline-none"
                />
              </div>

              <Button
                type="submit"
                variant="gold"
                disabled={loading}
                className="w-full py-2.5"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <Icons.shield className="size-4" />
                    <span>Access Admin Suite</span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-steel-300">
          New administrator?{" "}
          <Link href="/admin/signup" className="font-semibold text-gold-300 hover:underline">
            Register for admin access
          </Link>
        </p>

        <div className="flex justify-between px-2 text-xs text-steel-400">
          <Link href="/login" className="hover:text-gold-300 hover:underline">
            Switch to Cadet Login
          </Link>
          <Link href="/" className="hover:text-white hover:underline">
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}