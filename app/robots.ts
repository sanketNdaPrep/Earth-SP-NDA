import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/api", "/login", "/register", "/signup", "/profile", "/callback"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
