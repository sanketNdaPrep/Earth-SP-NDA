import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-950 px-4 text-center text-steel-100">
      <div className="mb-4 inline-flex rounded-full border border-gold-400/30 bg-gold-400/10 p-4 text-gold-400">
        <Icons.warning className="size-10" />
      </div>
      <h1 className="font-mono text-4xl font-bold tracking-tight text-white sm:text-5xl">
        404 // ROUTE OUT OF BOUNDS
      </h1>
      <p className="mt-3 max-w-md text-sm text-steel-300">
        The requested tactical vector or page coordinate does not exist on the platform.
      </p>
      <div className="mt-6 flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Main Homepage</Button>
        </Link>
      </div>
    </div>
  );
}