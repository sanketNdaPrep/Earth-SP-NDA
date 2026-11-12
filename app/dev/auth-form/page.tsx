import { notFound } from "next/navigation";
import { AuthFormDemo } from "@/components/ui/auth-form-demo";

export const metadata = { title: "Auth form (dev only)", robots: { index: false } };

export default function AuthFormDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="bg-navy-950 text-steel-100 flex min-h-screen items-center justify-center px-6 py-12">
      <AuthFormDemo />
    </main>
  );
}