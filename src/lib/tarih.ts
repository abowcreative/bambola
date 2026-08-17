/**
 * Tarih yardimcilari.
 *
 * Panelde "bugun" HER ZAMAN Istanbul saatine gore. Vercel fonksiyonu UTC
 * calisiyor: gece 00:00-03:00 arasi `new Date()` bir onceki gunu verir ve
 * o saatte acilan yoklama yanlis derse yazilir.
 */

/** ISO tarih (YYYY-MM-DD), Istanbul saatine gore bugun. */
export function bugununTarihi(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Istanbul",
  });
}

/** Verilen tarihi ISO gun bicimine cevirir (YYYY-MM-DD), Istanbul saatiyle. */
export function isoGun(tarih: Date): string {
  return tarih.toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
}
