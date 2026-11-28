import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { SITE_URL } from "@/lib/site";

const PUBLIC_PAGES = ["/", "/exams/nda", "/exams/cds", "/exams/afcat", "/study-material", "/flashcards", "/quizzes", "/support"];

/** Public flashcard deck ids. If the database cannot be reached the sitemap still lists the fixed pages. */
async function deckIds(): Promise<string[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const client = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await client.from("flashcard_decks").select("id");
    if (error || !data) return [];
    return data.map((row) => String(row.id));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const decks = await deckIds();
  return [
    ...PUBLIC_PAGES.map((path) => ({ url: `${SITE_URL}${path === "/" ? "" : path}`, changeFrequency: "weekly" as const })),
    ...decks.map((id) => ({ url: `${SITE_URL}/flashcards/${id}`, changeFrequency: "weekly" as const })),
  ];
}
