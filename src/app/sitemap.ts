import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { ATOLYELER } from "@/lib/data/atolyeler";
import { YAS_SAYFALARI } from "@/lib/yas";

/**
 * Sitemap. PLAN.md Bolum 5: tum rotalari uretir, /admin ve /api haric.
 * Yeni bir program veya yas sayfasi eklendiginde burasi kendiliginden buyur,
 * elle guncelleme gerekmez.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const guncelleme = new Date();

  const sabit: { yol: string; oncelik: number; siklik: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { yol: "/", oncelik: 1, siklik: "weekly" },
    { yol: "/oyun-evi", oncelik: 0.9, siklik: "weekly" },
    { yol: "/oyun-evi/programlar", oncelik: 0.8, siklik: "monthly" },
    { yol: "/oyun-evi/haftalik-program", oncelik: 0.8, siklik: "weekly" },
    { yol: "/oyun-evi/ucretler", oncelik: 0.8, siklik: "monthly" },
    { yol: "/mekan", oncelik: 0.8, siklik: "monthly" },
    { yol: "/anaokulu", oncelik: 0.9, siklik: "weekly" },
    { yol: "/parti", oncelik: 0.7, siklik: "monthly" },
    { yol: "/kayit", oncelik: 0.9, siklik: "monthly" },
    { yol: "/hakkimizda", oncelik: 0.6, siklik: "monthly" },
    { yol: "/ekip", oncelik: 0.5, siklik: "monthly" },
    { yol: "/sss", oncelik: 0.7, siklik: "monthly" },
    { yol: "/iletisim", oncelik: 0.7, siklik: "monthly" },
  ];

  return [
    ...sabit.map((s) => ({
      url: `${SITE_URL}${s.yol}`,
      lastModified: guncelleme,
      changeFrequency: s.siklik,
      priority: s.oncelik,
    })),
    ...ATOLYELER.map((a) => ({
      url: `${SITE_URL}/oyun-evi/programlar/${a.slug}`,
      lastModified: guncelleme,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...YAS_SAYFALARI.map((y) => ({
      url: `${SITE_URL}/oyun-evi/yas/${y.slug}`,
      lastModified: guncelleme,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
