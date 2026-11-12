import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AlertDialogDemo } from "@/components/ui/alert-dialog-demo";

export const metadata = { title: "Alert dialog (dev only)", robots: { index: false } };

export default function AlertDialogDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="bg-navy-950 text-steel-100 mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-10 px-4 py-12 sm:px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-white">Alert dialog</h1>
        <Badge variant="outline">Sample copy</Badge>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Neutral</h2>
        <AlertDialogDemo
          triggerLabel="Submit mock test"
          title="Submit this mock test?"
          description="You have 12 questions left unanswered. Once you submit, your score is final and you cannot change your answers."
          cancelLabel="Keep working"
          actionLabel="Submit test"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Danger</h2>
        <AlertDialogDemo
          tone="danger"
          triggerLabel="Discard answers"
          title="Discard your answers?"
          description="All answers from this attempt will be removed. This cannot be undone."
          cancelLabel="Cancel"
          actionLabel="Discard"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Information only</h2>
        <AlertDialogDemo
          triggerLabel="Sign out"
          title="Signed out on this device"
          description="Your progress is saved. Sign in again any time to pick up where you stopped."
          actionLabel="Got it"
        />
      </section>
    </main>
  );
}