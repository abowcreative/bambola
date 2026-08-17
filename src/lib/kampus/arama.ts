/**
 * Arama girdisi temizleme.
 *
 * NEDEN VAR: Supabase istemcisinin `.or()` cagrisi PostgREST suzgec
 * SOZDIZIMI aliyor, deger degil:
 *
 *   .or(`ad.ilike.%${girdi}%,soyad.ilike.%${girdi}%`)
 *
 * Burada virgul, nokta ve parantez YAPISAL karakterler. Kullanici
 * "x,id.not.is.null" yazarsa OR agacina kendi kosulunu ekliyor; denendi ve
 * filtre gercekten kirildi. RLS satirlari korumaya devam ettigi icin veri
 * sizmiyordu ama arama bozuluyor, 500 uretilebiliyor ve savunma tek katmana
 * iniyordu.
 *
 * Supabase JS'te `.or()` icin parametreli bir yol yok, o yuzden girdi
 * BEYAZ LISTEYLE temizleniyor: ad ve telefon aramasinda gereken karakterler
 * disinda hicbir sey gecmiyor.
 */

/**
 * Ad aramasi icin guvenli metin. Harf (Turkce dahil), rakam, bosluk,
 * kisa cizgi ve kesme isareti kaliyor; gerisi atiliyor.
 *
 * `%` ve `_` de atiliyor: ikisi de LIKE joker karakteri ve kullanici
 * "%" yazinca butun kayitlar donuyordu.
 */
export function aramaTemizle(ham: string | undefined | null): string {
  if (!ham) return "";
  return ham
    .replace(/[^\p{L}\p{N} \-']/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

/**
 * Telefon aramasi icin rakamlar. Basindaki 0 veya 90 kirpiliyor cunku
 * veritabaninda 5XXXXXXXXX bicimi saklaniyor.
 */
export function telefonAramasi(ham: string | undefined | null): string {
  if (!ham) return "";
  return ham.replace(/\D/g, "").replace(/^(90|0)/, "").slice(0, 10);
}

/**
 * Verilen alanlarda arama yapan PostgREST `or` kalibini kurar.
 * Girdi temizlenmemisse kalip da uretilmiyor.
 *
 * @returns kalip dizgesi, arama bos veya tumu temizlendiyse null
 */
export function aramaKalibi(
  ham: string | undefined | null,
  metinAlanlari: string[],
  telefonAlani?: string,
): string | null {
  const metin = aramaTemizle(ham);
  const rakamlar = telefonAlani ? telefonAramasi(ham) : "";

  const parcalar: string[] = [];
  if (metin.length >= 1) {
    for (const alan of metinAlanlari) {
      parcalar.push(`${alan}.ilike.%${metin}%`);
    }
  }
  // Uc rakamdan kisa arama butun listeyi dondurur, anlamsiz.
  if (telefonAlani && rakamlar.length >= 3) {
    parcalar.push(`${telefonAlani}.ilike.%${rakamlar}%`);
  }

  return parcalar.length > 0 ? parcalar.join(",") : null;
}
