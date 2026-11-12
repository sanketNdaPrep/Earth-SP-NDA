"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandMark } from "@/components/ui/brand-mark";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export type AuthMode = "signin" | "signup";

export interface AuthFormValues {
  mode: AuthMode;
  email: string;
  password: string;
  fullName?: string;
  targetExam?: string;
}

export interface AuthFormProps {
  className?: string;
  defaultMode?: AuthMode;
  onSubmit?: (values: AuthFormValues) => void;
  loading?: boolean;
  message?: { type: "success" | "error"; text: string } | null;
}

const TARGET_EXAMS = [
  { value: "NDA", label: "NDA (National Defence Academy)" },
  { value: "CDS", label: "CDS (Combined Defence Services)" },
  { value: "AFCAT", label: "AFCAT (Air Force Common Admission Test)" },
  { value: "ACC", label: "ACC (Army Candidate Corps)" },
];

const MIN_PASSWORD_LENGTH = 6;

type Errors = Partial<Record<"password" | "confirmPassword", string>>;

function Field({
  label,
  htmlFor,
  icon,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  icon?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-steel-500">{icon}</span>
        ) : null}
        {children}
      </div>
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs text-danger-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AuthForm({ className, defaultMode = "signin", onSubmit, loading = false, message = null }: AuthFormProps) {
  const reduceMotion = useReducedMotion();
  const [mode, setMode] = React.useState<AuthMode>(defaultMode);
  const [values, setValues] = React.useState({ fullName: "", email: "", password: "", confirmPassword: "", targetExam: "NDA" });
  const [errors, setErrors] = React.useState<Errors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleModeChange = (next: string) => {
    setMode(next as AuthMode);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: Errors = {};
    if (mode === "signup") {
      if (values.password.length < MIN_PASSWORD_LENGTH) next.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
      if (values.password !== values.confirmPassword) next.confirmPassword = "Passwords do not match.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSubmit?.({
      mode,
      email: values.email,
      password: values.password,
      ...(mode === "signup" ? { fullName: values.fullName, targetExam: values.targetExam } : {}),
    });
  };

  const fieldMotion = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: -6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2 } };

  const emailAndPassword = (
    <>
      <Field label="Email" htmlFor="auth-email" icon={<Icons.mail className="size-4" />}>
        <Input id="auth-email" name="email" type="email" value={values.email} onChange={handleChange} required autoComplete="email" placeholder="cadet@defence.in" className="pl-10" />
      </Field>
      <Field label="Password" htmlFor="auth-password" icon={<Icons.lock className="size-4" />} error={errors.password}>
        <Input
          id="auth-password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          required
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          placeholder="Enter password"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? "auth-password-error" : undefined}
          className="pl-10"
        />
      </Field>
    </>
  );

  return (
    <Card className={cn("w-full max-w-md p-6 sm:p-8", className)}>
      <BrandMark />

      <form onSubmit={handleSubmit} className="mt-6">
        <Tabs value={mode} onValueChange={handleModeChange}>
          <TabsList aria-label="Choose how to continue">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {message ? (
            <p
              role="status"
              className={cn(
                "mt-6 rounded-control p-3 text-center text-xs font-medium",
                message.type === "error" ? "bg-danger-500/15 text-danger-400" : "bg-emerald-400/15 text-emerald-300",
              )}
            >
              {message.text}
            </p>
          ) : null}

          <TabsContent value="signin" className="mt-6">
            <motion.div {...fieldMotion} className="grid gap-4">
              {emailAndPassword}
            </motion.div>
          </TabsContent>

          <TabsContent value="signup" className="mt-6">
            <motion.div {...fieldMotion} className="grid gap-4">
              <Field label="Full Name" htmlFor="auth-fullname" icon={<Icons.user className="size-4" />}>
                <Input id="auth-fullname" name="fullName" value={values.fullName} onChange={handleChange} required autoComplete="name" placeholder="Your full name" className="pl-10" />
              </Field>
              {emailAndPassword}
              <Field label="Confirm Password" htmlFor="auth-confirm" icon={<Icons.lock className="size-4" />} error={errors.confirmPassword}>
                <Input
                  id="auth-confirm"
                  name="confirmPassword"
                  type="password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  aria-invalid={errors.confirmPassword ? true : undefined}
                  aria-describedby={errors.confirmPassword ? "auth-confirm-error" : undefined}
                  className="pl-10"
                />
              </Field>
              <Field label="Target Entry" htmlFor="auth-target">
                <Select id="auth-target" name="targetExam" value={values.targetExam} onChange={handleChange}>
                  {TARGET_EXAMS.map((exam) => (
                    <option key={exam.value} value={exam.value}>
                      {exam.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </motion.div>
          </TabsContent>
        </Tabs>

        <Button type="submit" size="lg" loading={loading} className="mt-6 w-full">
          {mode === "signup" ? "Create Account" : "Sign In"}
        </Button>

        <p className="mt-6 text-center text-sm text-steel-500">
          <button
            type="button"
            onClick={() => handleModeChange(mode === "signup" ? "signin" : "signup")}
            className="rounded-control text-gold-400 transition-colors hover:text-gold-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/60"
          >
            {mode === "signup" ? "Already have an account?" : "Don't have an account yet?"}
          </button>
        </p>
      </form>
    </Card>
  );
}

export default AuthForm;