"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/**
 * One sign-out for every portal. Clears the session cookie, then sends the
 * person to the Home page, whether they were a student or an admin.
 */
export function useSignOut() {
  const router = useRouter();

  return React.useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }, [router]);
}
