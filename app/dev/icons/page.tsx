import { notFound } from "next/navigation";
import IconsDemo from "@/components/ui/icons-demo";

export const metadata = { title: "Icons (dev only)", robots: { index: false } };

export default function IconsDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <IconsDemo />;
}