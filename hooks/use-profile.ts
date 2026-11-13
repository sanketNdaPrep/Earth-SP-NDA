"use client";

import * as React from "react";
import { supabase } from "@/lib/supabaseClient";

export interface ProfileData {
  id: string;
  email: string;
  fullName: string;
  avatarId: number | null;
}

type SaveResult = { ok: true } | { ok: false; error: string };

/** Loads the signed-in person's profile and lets them change their avatar. */
export function useProfile() {
  const [profile, setProfile] = React.useState<ProfileData | null>(null);

  React.useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      if (!user || !active) return;
      const { data: row } = await supabase
        .from("profiles")
        .select("email, full_name, avatar_id")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;
      setProfile({
        id: user.id,
        email: row?.email || user.email || "",
        fullName: row?.full_name || (user.user_metadata?.full_name as string | undefined) || "",
        avatarId: typeof row?.avatar_id === "number" ? row.avatar_id : null,
      });
    });
    return () => {
      active = false;
    };
  }, []);

  const saveAvatar = React.useCallback(
    async (avatarId: number): Promise<SaveResult> => {
      if (!profile) return { ok: false, error: "You are not signed in." };
      const { data, error } = await supabase
        .from("profiles")
        .update({ avatar_id: avatarId })
        .eq("id", profile.id)
        .select("avatar_id");
      if (error) return { ok: false, error: error.message };
      if (!data || data.length === 0) return { ok: false, error: "Your profile row was not found." };
      setProfile((prev) => (prev ? { ...prev, avatarId } : prev));
      return { ok: true };
    },
    [profile],
  );

  return { profile, saveAvatar };
}
