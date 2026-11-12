import { notFound } from "next/navigation";
import { LoginCardDemo } from "@/components/ui/login-card-demo";

export const metadata = { title: "Login card (dev only)", robots: { index: false } };

export default function LoginCardDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="bg-navy-950 text-steel-100 flex min-h-screen items-center justify-center p-6">
      <LoginCardDemo />
    </main>
  );
}