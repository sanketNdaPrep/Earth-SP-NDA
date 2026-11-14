import type { Metadata } from "next";
import { LandingProviders } from "@/components/landing-data";
import { Vault } from "@/components/vault";

export const metadata: Metadata = { title: "Study Materials" };

/** Student page for the PDFs and images that admins upload. */
export default function StudyMaterialsPage() {
  return (
    <LandingProviders>
      <Vault />
    </LandingProviders>
  );
}
