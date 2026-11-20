"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icons } from "@/components/ui/icons";
import { ProfileMenu } from "@/components/profile/profile-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getAdminStatus } from "@/lib/adminAuth";
import { useSignOut } from "@/hooks/use-sign-out";
import { supabase } from "@/lib/supabaseClient";

interface NavItem {
  label: string;
  href: string;
  icon: keyof typeof Icons;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: "target" },
  { label: "Study Tracker", href: "/dashboard/study-tracker", icon: "book" },
  { label: "Mock Tests", href: "/quizzes", icon: "calculator" },
  { label: "Analytics", href: "/dashboard/analytics", icon: "sigma" },
  { label: "Study Materials", href: "/dashboard/resources", icon: "component" },
  { label: "Flashcards", href: "/flashcards", icon: "book" },
  { label: "Ask a Mentor", href: "/dashboard/mentor", icon: "user" },
];

const ADMIN_NAV_ITEM: NavItem = { label: "Admin Suite", href: "/admin", icon: "shield" };

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = React.useState(false);

  // Only approved admins see the Admin Suite link
  React.useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) setIsAdmin(getAdminStatus(data.user) === "approved");
    });
    return () => {
      active = false;
    };
  }, []);

  const navItems = isAdmin ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS;

  const handleSignOut = useSignOut();

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
          {navItems.map((item) => {
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
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header Mobile/Desktop */}
        <header className="flex h-16 items-center justify-between gap-3 border-b border-steel-700/60 bg-navy-900/60 px-4 backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 items-center gap-3 md:hidden">
            {/* Phones have no sidebar, so the same pages live in this menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Open dashboard menu"
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-control border border-steel-700 text-steel-100 transition-colors hover:border-gold-400 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
                >
                  <Icons.menu className="size-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {navItems.map((item) => {
                  const Icon = Icons[item.icon] || Icons.target;
                  const isActive = pathname === item.href;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className={isActive ? "font-semibold text-gold-300" : undefined}>
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleSignOut}>
                  <Icons.close className="size-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Icons.logo className="size-6 shrink-0 text-gold-400" />
            <span className="truncate font-mono text-sm font-bold text-white">EARTH SP NDA</span>
          </div>

          <div className="hidden font-mono text-xs uppercase tracking-wider text-steel-300 md:block">
            Cadet Dashboard // NDA Command Portal
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <ThemeToggle />
            <ProfileMenu />
          </div>
        </header>

        {/* Dynamic Content Body */}
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}