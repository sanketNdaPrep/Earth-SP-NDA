"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BrandMark } from "@/components/ui/brand-mark";
import { cn } from "@/lib/utils";

export interface LoginCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export function LoginCard({
  title = "Welcome Back",
  description = "Enter your credentials to access your account",
  children,
  className,
  ...props
}: LoginCardProps) {
  return (
    <Card
      className={cn(
        "w-full max-w-md border-steel-700 bg-navy-900/90 p-6 shadow-panel backdrop-blur-md sm:p-8",
        className
      )}
      {...props}
    >
      <CardHeader className="flex flex-col items-center text-center pb-6">
        <BrandMark className="mb-4" />
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 text-xs text-steel-400">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent className="px-0 pb-0">{children}</CardContent>
    </Card>
  );
}

export default LoginCard;