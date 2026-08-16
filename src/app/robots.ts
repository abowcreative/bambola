import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * PLAN.md Bolum 5: yalniz /api/ ve /admin kapali. Baska Disallow eklenmez.
 * /kayit indekslenir, hedefi donusum ama arama sonucunda gorunmeli.
 */

/**
 * Site kendi alan adinda mi, yoksa gecici bir adreste mi.
 *
 * `*.vercel.app` adresleri gecicidir: alan adi baglanana kadar site orada
 * durur. O adres indekslenirse gercek alan adi yayina girdiginde ikisi ayni
 * icerikle arama sonuclarinda yarisir ve eski adres kolay kolay dusmez.
 * Bu yuzden gecici adreste HICBIR SEY indekslenmiyor.
 *
 * Alan adi belli olunca `NEXT_PUBLIC_SITE_URL` tanimlanir ve burasi
 * kendiliginden normale doner; kodda degisiklik gerekmiyor.
 */
const geciciAdres = /\.vercel\.app$|^http:\/\/localhost/i.test(SITE_URL);

export default function robots(): MetadataRoute.Robots {
  if (geciciAdres) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

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
