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
  { label: "Study Materials", href: "/admin/resources", icon: "component" },
  { label: "Flashcards", href: "/admin/flashcards", icon: "book" },
  { label: "Subjects", href: "/admin/subjects", icon: "target" },
  { label: "Syllabus", href: "/admin/syllabus", icon: "book" },
  { label: "Audit Logs", href: "/admin/logs", icon: "clipboardCheck" },
];

/** Marks the whole page as admin, so popups and menus outside this layout use the admin font too. */
function AdminSurface() {
  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-surface", "admin");
    return () => root.removeAttribute("data-surface");
  }, []);
  return null;
}

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
    <div data-surface="admin" className="flex min-h-screen bg-navy-950 text-steel-100 font-sans">
      <AdminSurface />
      {/* Admin Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-steel-700/60 bg-navy-900 md:flex">
        <div className="flex h-16 items-center border-b border-steel-700/60 px-6">
          <Link href="/" aria-label="EARTH SP NDA home" className="flex items-center gap-2 rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400">
            <Icons.logo className="size-6 text-gold-400" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">EARTH SP Admin</span>
          </Link>
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
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-3 border-b border-steel-700/60 bg-navy-900/60 px-4 backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {/* Phones have no sidebar, so the same pages live in this menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Open admin menu"
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-control border border-steel-700 text-steel-100 transition-colors hover:border-gold-400 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400 md:hidden"
                >
                  <Icons.menu className="size-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {ADMIN_NAV_ITEMS.map((item) => {
                  const Icon = Icons[item.icon] || Icons.shield;
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
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <Icons.chevronRight className="size-4 rotate-180" />
                    <span>Exit Admin Portal</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleSignOut}>
                  <Icons.close className="size-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/" aria-label="EARTH SP NDA home" className="flex shrink-0 items-center gap-2 rounded-control md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400">
              <Icons.logo className="size-6 text-gold-400" />
              <span className="sr-only">EARTH SP NDA home</span>
            </Link>
            <div className="truncate font-mono text-xs uppercase tracking-wider text-gold-300">
              <span className="md:hidden">Admin Suite</span>
              <span className="hidden md:inline">System Control // Command Center</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden rounded-full bg-emerald-400/10 border border-emerald-400/30 px-3 py-1 font-mono text-xs font-bold text-emerald-300 sm:inline-block">
              ● System Active
            </span>
            <ThemeToggle />
            <ProfileMenu />
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}