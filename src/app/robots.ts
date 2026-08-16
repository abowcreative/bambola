import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * PLAN.md Bolum 5: yalniz /api/ ve /admin kapali. Baska Disallow eklenmez.
 * /kayit indekslenir, hedefi donusum ama arama sonucunda gorunmeli.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
