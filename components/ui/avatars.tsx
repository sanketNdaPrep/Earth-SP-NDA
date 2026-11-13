import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "gold" | "emerald" | "steel";

interface AvatarDef {
  id: number;
  label: string;
  tone: Tone;
  /** SVG children drawn on a 24 by 24 grid, stroke only. */
  art: React.ReactNode;
}

/** The 10 predefined avatars. The id (1 to 10) is what gets saved to profiles.avatar_id. */
export const AVATARS: readonly AvatarDef[] = [
  { id: 1, label: "Shield", tone: "gold", art: <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z" /> },
  { id: 2, label: "Star", tone: "gold", art: <path d="M12 3l2.6 6.2 6.4.6-4.8 4.2 1.5 6.5L12 17l-5.7 3.5 1.5-6.5L3 9.8l6.4-.6L12 3z" /> },
  {
    id: 3,
    label: "Compass",
    tone: "emerald",
    art: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" />
      </>
    ),
  },
  { id: 4, label: "Jet", tone: "steel", art: <path d="M3 11l18-8-8 18-2-8-8-2z" /> },
  { id: 5, label: "Mountain", tone: "emerald", art: <path d="M3 19l6-10 4 6 3-4 5 8H3z" /> },
  {
    id: 6,
    label: "Anchor",
    tone: "steel",
    art: (
      <>
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v13M8 11h8M5 13a7 7 0 0 0 14 0" />
      </>
    ),
  },
  { id: 7, label: "Bolt", tone: "gold", art: <path d="M13 2L5 14h6l-1 8 8-12h-6l1-8z" /> },
  {
    id: 8,
    label: "Target",
    tone: "emerald",
    art: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" />
      </>
    ),
  },
  {
    id: 9,
    label: "Medal",
    tone: "gold",
    art: (
      <>
        <circle cx="12" cy="15" r="5" />
        <path d="M8.5 3l3.5 7 3.5-7" />
      </>
    ),
  },
  { id: 10, label: "Book", tone: "steel", art: <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5z" /> },
] as const;

const TONES: Record<Tone, string> = {
  gold: "border-gold-400/40 bg-gold-400/15 text-gold-300",
  emerald: "border-emerald-400/40 bg-emerald-400/15 text-emerald-300",
  steel: "border-steel-500/50 bg-steel-700/60 text-steel-100",
};

const SIZES = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-20 text-xl",
} as const;

/** Two letters from a name, or from the email when there is no name. */
export function getInitials(name?: string | null, email?: string | null) {
  const source = (name ?? "").trim() || (email ?? "").split("@")[0] || "";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const letters = parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[1][0];
  return letters.toUpperCase();
}

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 1 to 10. Leave empty to show initials. */
  avatarId?: number | null;
  name?: string | null;
  email?: string | null;
  size?: keyof typeof SIZES;
}

/** Round avatar: the chosen icon, or initials when none is chosen yet. */
export function Avatar({ avatarId, name, email, size = "md", className, ...props }: AvatarProps) {
  const def = AVATARS.find((a) => a.id === avatarId);
  const base = "inline-flex shrink-0 items-center justify-center rounded-full border font-bold";

  if (!def) {
    return (
      <span
        role="img"
        aria-label={name || email || "Profile"}
        className={cn(base, TONES.gold, SIZES[size], className)}
        {...props}
      >
        {getInitials(name, email)}
      </span>
    );
  }

  return (
    <span role="img" aria-label={`${def.label} avatar`} className={cn(base, TONES[def.tone], SIZES[size], className)} {...props}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-3/5"
      >
        {def.art}
      </svg>
    </span>
  );
}
