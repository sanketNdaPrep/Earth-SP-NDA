import { notFound } from "next/navigation";
import { CardSpreadDemo } from "@/components/ui/card-spread-demo";

export const metadata = { title: "Card spread (dev only)", robots: { index: false } };

export default function CardSpreadDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="bg-navy-950 text-steel-100 min-h-screen overflow-x-hidden">
      <CardSpreadDemo />
    </main>
  );
}