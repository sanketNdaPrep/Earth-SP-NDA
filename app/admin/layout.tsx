"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { useSignOut } from "@/hooks/use-sign-out";

interface AdminNavItem {
  label: string;
  href: string;
  icon: keyof typeof Icons;
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Admin Overview", href: "/admin", icon: "shield" },
  { label: "Student Roster", href: "/admin/students", icon: "users" },
  { label: "Question Bank", href: "/admin/questions", icon: "book" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const handleSignOut = useSignOut();

  // Login and signup are standalone pages: no sidebar or command-center header
  if (pathname === "/admin/login" || pathname === "/admin/signup") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-navy-950 text-steel-100">
      {/* Admin Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-steel-700/60 bg-navy-900 md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-steel-700/60 px-6">
          <Icons.logo className="size-6 text-gold-400" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
            EARTH SP Admin
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = Icons[item.icon] || Icons.shield;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gold-400/10 text-gold-300 font-semibold border border-gold-400/30"
                    : "text-steel-300 hover:bg-navy-800/60 hover:text-white"
                }`}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-steel-700/60 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-steel-300 hover:text-danger-400"
          >
            <Icons.close className="size-4" />
            <span>Sign Out</span>
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="w-full justify-start text-steel-300">
              <Icons.chevronRight className="size-4 rotate-180" />
              <span>Exit Admin Portal</span>
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-steel-700/60 bg-navy-900/60 px-6 backdrop-blur-md">
          <div className="font-mono text-xs uppercase tracking-wider text-gold-300">
            System Control // Command Center
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-400/10 border border-emerald-400/30 px-3 py-1 font-mono text-xs font-bold text-emerald-300">
              ● System Active
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}