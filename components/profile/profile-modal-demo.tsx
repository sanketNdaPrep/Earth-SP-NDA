"use client";

import * as React from "react";
import { Avatar } from "@/components/ui/avatars";
import { ProfileModal } from "@/components/profile/profile-modal";
import type { ProfileData } from "@/hooks/use-profile";

/** Preview of the profile dialog with fake data. Nothing is saved anywhere. */
export function ProfileModalDemo() {
  const [open, setOpen] = React.useState(false);
  const [profile, setProfile] = React.useState<ProfileData>({
    id: "demo",
    email: "cadet@earthspnda.com",
    fullName: "Sanket Kumar",
    avatarId: null,
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open your profile"
        className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
      >
        <Avatar size="md" avatarId={profile.avatarId} name={profile.fullName} />
      </button>
      <ProfileModal
        open={open}
        profile={profile}
        onClose={() => setOpen(false)}
        onSave={async (avatarId) => {
          setProfile((p) => ({ ...p, avatarId }));
          return { ok: true };
        }}
      />
    </>
  );
}
