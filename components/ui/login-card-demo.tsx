"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BorderBeam } from "@/components/ui/border-beam";

export interface LoginCardDemoProps {
  /** Called with the entered credentials. Presentational only: no auth lives here. */
  onSubmit?: (email: string, password: string) => void;
  loading?: boolean;
  message?: { type: "success" | "error"; text: string } | null;
}

/** Presentational login card. Real auth stays in app/login/page.tsx (protected). */
export function LoginCardDemo({ onSubmit, loading = false, message = null }: LoginCardDemoProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    onSubmit?.(String(data.get("email") ?? ""), String(data.get("password") ?? ""));
  };

  return (
    <Card className="relative w-full max-w-sm overflow-hidden">
      <CardHeader>
        <CardTitle>Cadet Login</CardTitle>
        <CardDescription>Access your EARTH SP NDA portal.</CardDescription>
      </CardHeader>

      {message ? (
        <p
          role="status"
          className={
            message.type === "error"
              ? "mx-6 mb-4 rounded-control bg-danger-500/15 p-3 text-center text-xs font-medium text-danger-400"
              : "mx-6 mb-4 rounded-control bg-emerald-400/15 p-3 text-center text-xs font-medium text-emerald-300"
          }
        >
          {message.text}
        </p>
      ) : null}

      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="cadet@defence.in" autoComplete="email" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="Enter password" autoComplete="current-password" required />
          </div>
        </CardContent>

        <CardFooter className="justify-between">
          <Button asChild variant="secondary">
            <Link href="/signup">Register</Link>
          </Button>
          <Button type="submit" loading={loading}>
            Login
          </Button>
        </CardFooter>
      </form>

      <BorderBeam duration={4} size={300} reverse />
    </Card>
  );
}