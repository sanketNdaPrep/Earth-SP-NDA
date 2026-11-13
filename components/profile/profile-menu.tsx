"use client";

import * as React from "react";
import { Avatar } from "@/components/ui/avatars";
import { ProfileModal } from "@/components/profile/profile-modal";
import { useProfile } from "@/hooks/use-profile";

/** The round avatar in the header. Opens the profile dialog. */
export function ProfileMenu() {
  const { profile, saveAvatar } = useProfile();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="Open your profile"
        className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
      >
        <Avatar size="sm" avatarId={profile?.avatarId} name={profile?.fullName} email={profile?.email} />
      </button>
      <ProfileModal open={open} profile={profile} onClose={() => setOpen(false)} onSave={saveAvatar} />
    </>
  );
}
