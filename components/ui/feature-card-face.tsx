import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export type FeatureTone = "gold" | "emerald" | "steel";

export interface Feature {
  title: string;
  category: string;
  /** Short labels such as marking schemes, shown as badges. */
  badges?: string[];
  icon: "calculator" | "book" | "plane" | "shield" | "target";
  tone?: FeatureTone;
  /** When set the whole card is a link, which also makes it keyboard focusable. */
  href?: string;
}

const tones: Record<FeatureTone, { art: string; icon: string }> = {
  gold: { art: "from-gold-400/25 via-navy-900 to-navy-950", icon: "text-gold-400" },
  emerald: { art: "from-emerald-400/25 via-navy-900 to-navy-950", icon: "text-emerald-300" },
  steel: { art: "from-steel-500/30 via-navy-900 to-navy-950", icon: "text-steel-300" },
};

/** Shared outer shell for a feature card (size, border, glow on hover and focus). */
export const FEATURE_CARD_SHELL =
  "relative flex h-72 w-56 flex-col overflow-hidden rounded-panel border border-steel-700 bg-navy-900 text-left shadow-panel transition-shadow duration-(--duration-slow) ease-(--ease-standard) hover:shadow-glow focus-visible:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300";

/** The visual content of a feature card: gradient art, icon, category and title bar. */
export function FeatureCardFace({ feature }: { feature: Feature }) {
  const { title, category, badges = [], icon, tone = "gold" } = feature;
  const Icon = Icons[icon];
  const palette = tones[tone];

  return (
    <>
      <div aria-hidden="true" className={cn("absolute inset-0 bg-linear-to-br", palette.art)} />
      <div aria-hidden="true" className="graticule absolute inset-0 opacity-60" />
      <Icon aria-hidden="true" className={cn("absolute top-1/3 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2", palette.icon)} />
      <div className="relative z-10 flex h-full w-full flex-col p-3">
        <Badge variant="outline" className="w-fit bg-navy-950/60 backdrop-blur-md">
          {category}
        </Badge>
        <div className="flex-1" />
        <div className="flex flex-col gap-2 rounded-panel bg-navy-950/70 p-3 backdrop-blur-md">
          <h3 className="text-base font-bold leading-snug text-white">{title}</h3>
          {badges.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {badges.map((b) => (
                <Badge key={b} variant={tone === "emerald" ? "emerald" : "gold"}>
                  {b}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}