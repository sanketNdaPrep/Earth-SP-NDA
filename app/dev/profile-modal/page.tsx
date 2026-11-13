import { notFound } from "next/navigation";
import { ProfileModalDemo } from "@/components/profile/profile-modal-demo";

export const metadata = { title: "Profile modal (dev only)", robots: { index: false } };

export default function ProfileModalDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="bg-navy-950 text-steel-100 flex min-h-screen items-start justify-end px-6 py-4">
      <ProfileModalDemo />
    </main>
  );
}
