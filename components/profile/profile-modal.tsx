"use client";

import * as React from "react";
import Link from "next/link";
import { Avatar, AVATARS } from "@/components/ui/avatars";
import { Button } from "@/components/ui/button";
import type { ProfileData } from "@/hooks/use-profile";

interface ProfileModalProps {
  open: boolean;
  profile: ProfileData | null;
  onClose: () => void;
  onSave: (avatarId: number) => Promise<{ ok: true } | { ok: false; error: string }>;
}

/** Profile dialog: name, email, and a picker for one of the 10 avatars. */
export function ProfileModal({ open, profile, onClose, onSave }: ProfileModalProps) {
  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="profile-modal-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-full max-w-md rounded-panel border border-steel-700 bg-navy-900 p-0 text-steel-100 shadow-panel backdrop:bg-navy-950/80"
    >
      {open ? <ProfileModalBody profile={profile} onClose={onClose} onSave={onSave} /> : null}
    </dialog>
  );
}

function ProfileModalBody({
  profile,
  onClose,
  onSave,
}: Pick<ProfileModalProps, "profile" | "onClose" | "onSave">) {
  const [selected, setSelected] = React.useState<number | null>(profile?.avatarId ?? null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const changed = selected !== null && selected !== (profile?.avatarId ?? null);

  const save = async () => {
    if (selected === null) return;
    setSaving(true);
    setError(null);
    const result = await onSave(selected);
    setSaving(false);
    if (result.ok) onClose();
    else setError(result.error);
  };

  return (
    <div className="space-y-5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar size="lg" avatarId={selected} name={profile?.fullName} email={profile?.email} />
          <div className="min-w-0">
            <h2 id="profile-modal-title" className="truncate text-lg font-bold text-white">
              {profile?.fullName || "Your profile"}
            </h2>
            <p className="truncate text-xs text-steel-300">{profile?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close profile"
          className="rounded-control px-2 py-1 text-sm text-steel-300 hover:text-white focus-visible:outline-2 focus-visible:outline-gold-400"
        >
          Close
        </button>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold uppercase tracking-wider text-steel-300">Choose your avatar</legend>
        <div className="grid grid-cols-5 gap-3">
          {AVATARS.map((a) => (
            <label key={a.id} className="relative flex cursor-pointer justify-center">
              <input
                type="radio"
                name="avatar"
                value={a.id}
                checked={selected === a.id}
                onChange={() => setSelected(a.id)}
                className="peer sr-only"
              />
              <Avatar
                avatarId={a.id}
                size="md"
                className="peer-checked:ring-2 peer-checked:ring-gold-400 peer-checked:ring-offset-2 peer-checked:ring-offset-navy-900 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-400 hover:brightness-125"
              />
            </label>
          ))}
        </div>
      </fieldset>

      {error ? (
        <p role="alert" className="text-xs text-danger-300">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <Link href="/profile" onClick={onClose} className="text-xs text-steel-300 hover:text-gold-300 hover:underline">
          Edit full profile
        </Link>
        <Button variant="gold" size="sm" onClick={save} disabled={!changed || saving}>
          {saving ? "Saving..." : "Save avatar"}
        </Button>
      </div>
    </div>
  );
}
