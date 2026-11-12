import { notFound } from "next/navigation";
import { FeatureCardsDemo } from "@/components/ui/feature-cards-demo";

export const metadata = { title: "Feature cards (dev only)", robots: { index: false } };

export default function FeatureCardsDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="bg-navy-950 text-steel-100 min-h-screen overflow-x-hidden">
      <FeatureCardsDemo />
    </main>
  );
}