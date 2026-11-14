"use client";

import * as React from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { Avatar } from "@/components/ui/avatars";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/use-profile";
import { useSignOut } from "@/hooks/use-sign-out";
import { getAdminStatus } from "@/lib/adminAuth";
import { supabase } from "@/lib/supabaseClient";

type AuthState =
  | { status: "loading" }
  | { status: "out" }
  | { status: "in"; email: string; isAdmin: boolean };

/** Tracks whether someone is signed in, and updates when they sign in or out. */
function useAuthState(): AuthState {
  const [state, setState] = React.useState<AuthState>({ status: "loading" });

  React.useEffect(() => {
    let active = true;
    const apply = (user: User | null) => {
      if (!active) return;
      setState(
        user
          ? { status: "in", email: user.email ?? "", isAdmin: getAdminStatus(user) === "approved" }
          : { status: "out" },
      );
    };

    supabase.auth.getSession().then(({ data }) => apply(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => apply(session?.user ?? null));

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return state;
}

function AccountMenu({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  const { profile } = useProfile();
  const signOut = useSignOut();
  const name = profile?.fullName || "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open account menu"
          className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
        >
          <Avatar size="sm" avatarId={profile?.avatarId} name={name} email={profile?.email || email} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          {name ? <p className="truncate text-sm font-bold text-white">{name}</p> : null}
          <p className="truncate text-xs text-steel-300">{profile?.email || email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        {isAdmin ? (
          <DropdownMenuItem asChild>
            <Link href="/admin">Admin Suite</Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem tone="danger" onSelect={() => void signOut()}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * The right side of the Home page header.
 * Signed out: Admin Login and Get Started. Signed in: the person's avatar with a menu.
 */
export function HeaderActions() {
  const auth = useAuthState();

  if (auth.status === "loading") {
    // Holds the space so the header does not jump once we know.
    return <Skeleton aria-hidden="true" className="h-9 w-48 rounded-control" />;
  }

  if (auth.status === "in") {
    return <AccountMenu email={auth.email} isAdmin={auth.isAdmin} />;
  }

  return (
    <div className="flex items-center gap-3">
      <Button asChild variant="gold" size="sm">
        <Link href="/admin/login">Admin Login</Link>
      </Button>
      <Button asChild variant="primary" size="sm">
        <Link href="/register">Get Started</Link>
      </Button>
    </div>
  );
}
