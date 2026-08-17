import "server-only";

import { headers } from "next/headers";

/**
 * Bu istek kampus alan adindan mi geldi.
 *
 * Basligi `src/proxy.ts` koyuyor. Kok layout site header/footer'ini ve
 * WhatsApp balonunu bu bilgiye gore basiyor: panelde sitenin kabugu
 * gorunmemeli.
 *
 * Baslik ISTEMCIDEN GELEMEZ: proxy her istekte kendi degerini yaziyor,
 * disaridan gonderilen ayni adli baslik uzerine yaziliyor. Zaten yalniz
 * gorunum kararini etkiliyor, yetkiyle ilgisi yok.
 */
export const KAMPUS_BASLIGI = "x-bambola-kampus";

export async function kampusIstegiMi(): Promise<boolean> {
  const b = await headers();
  return b.get(KAMPUS_BASLIGI) === "1";
}
