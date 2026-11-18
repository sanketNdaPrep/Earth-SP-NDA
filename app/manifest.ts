import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EARTH SP NDA",
    short_name: "EARTH SP NDA",
    description: "Free study material, flashcards, mock tests and mentor guidance for NDA, CDS and AFCAT aspirants.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0c0d",
    theme_color: "#0b0c0d",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
