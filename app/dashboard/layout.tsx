"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { supabase } from "@/lib/supabaseClient";

interface NavItem {
  label: string;
  href: string;
  icon: keyof typeof Icons;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: "target" },
  { label: "Study Tracker", href: "/dashboard/study-tracker", icon: "book" },
  { label: "Mock Tests", href: "/dashboard/mocks", icon: "calculator" },
  { label: "Analytics", href: "/dashboard/analytics", icon: "sigma" },
  { label: "Admin Suite", href: "/admin", icon: "shield" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen bg-navy-950 text-steel-100">
      {/* Sidebar Navigation */}
      <aside className="hidden w-64 flex-col border-r border-steel-700/60 bg-navy-900 md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-steel-700/60 px-6">
          <Icons.logo className="size-6 text-gold-400" />
          <span className="font-mono text-sm font-bold tracking-wider text-white">
            EARTH SP NDA
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map((item) => {
            const Icon = Icons[item.icon] || Icons.target;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-navy-800 text-gold-300 font-semibold"
                    : "text-steel-300 hover:bg-navy-800/60 hover:text-white"
                }`}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-steel-700/60 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-steel-300 hover:text-danger-400"
          >
            <Icons.close className="size-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col">
        {/* Top Header Mobile/Desktop */}
        <header className="flex h-16 items-center justify-between border-b border-steel-700/60 bg-navy-900/60 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3 md:hidden">
            <Icons.logo className="size-6 text-gold-400" />
            <span className="font-mono text-sm font-bold text-white">EARTH SP NDA</span>
          </div>

          <div className="hidden font-mono text-xs uppercase tracking-wider text-steel-300 md:block">
            Cadet Dashboard // NDA Command Portal
          </div>

          <div className="flex items-center gap-4">
            <Link href="/ui-demo">
              <Button variant="outline" size="sm">UI Demo</Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-gold-400/20 text-gold-300 flex items-center justify-center font-bold text-xs border border-gold-400/40">
                SK
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Body */}
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}