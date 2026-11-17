import type { Metadata } from "next";

/** Title and description for a page, repeated into the share tags so links show the page's own name. The share image is repeated because a page that sets its own share tags would otherwise lose it. */
export function pageMeta(title: string, description: string): Metadata {
  return {
    title,
    description,
    openGraph: { title, description, images: ["/opengraph-image"] },
    twitter: { title, description, images: ["/twitter-image"] },
  };
}
