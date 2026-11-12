import * as React from "react";
import Link from "next/link";
import { FEATURE_CARD_SHELL, FeatureCardFace, type Feature } from "@/components/ui/feature-card-face";
import { cn } from "@/lib/utils";

export interface CardSpreadProps {
  features: Feature[];
  className?: string;
  label?: string;
}

export function CardSpread({ features, className, label = "Spread cards" }: CardSpreadProps) {
  return (
    <div className={cn("card-spread", className)}>
      <div className="flex justify-center">
        <label className="card-spread-open">
          <input type="checkbox" role="switch" className="card-spread-toggle sr-only" />
          <span>{label}</span>
        </label>
      </div>

      <div className="card-spread-stage">
        <ul className="card-spread-container" style={{ "--n": features.length } as React.CSSProperties}>
          {features.map((feature, i) => (
            <li key={feature.title} className="card-spread-item" style={{ "--i": i } as React.CSSProperties}>
              <div className="card-spread-item__internal">
                <div className="card-spread-item__hover">
                  {feature.href ? (
                    <Link href={feature.href} className={FEATURE_CARD_SHELL}>
                      <FeatureCardFace feature={feature} />
                    </Link>
                  ) : (
                    <div className={FEATURE_CARD_SHELL}>
                      <FeatureCardFace feature={feature} />
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}