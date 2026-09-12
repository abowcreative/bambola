import type { AtolyeSlug, Dil } from "./types";

/**
 * TARIHLI, TEK SEFERLIK ETKINLIKLER.
 *
 * Haftalik programin (program.ts SLOTLAR) disindaki isler burada durur:
 * belirli bir gune bagli workshop'lar ve kuruma ozel gunler. Ikisini
 * ayirmanin sebebi, haftalik programin HER HAFTA tekrarlayan bir tablo
 * olmasi; tarihli bir etkinlik oraya yazilirsa 28 Eylul'de de gorunur.
 *
 * TARIH GECINCE KENDILIGINDEN DUSER. Elle silinmesine birakilmaz: gecmis
 * bir etkinligi "yaklasan" diye gostermek, ilan edilen fiyat kadar somut
 * bir yanlistir. Bkz. ucretler.ts icindeki kampanya penceresi, ayni desen.
 *
 * PAZAR: kurum pazar gunleri grup programi yurutmuyor ama ozel etkinlik ve
 * parti aliyor (kurum aciklamasi, 12 Eylul 2026). Bu yuzden pazara dusen bir
 * etkinlik calisma saatleriyle CELISMEZ; bkz. site.ts PAZAR_ISTISNASI.
 */

export type Etkinlik = {
  slug: string;
  ad: string;
  /** ISO gun, "2026-09-27". */
  tarih: string;
  /** "17.00" */
  bas: string;
  /** "18.30" */
  bit: string;
  yasEtiket: string;
  dil: Dil;
  /** Tanitim sayfasi olan atolye. null = kendi sayfasi yok. */
  atolyeSlug: AtolyeSlug | null;
  /** Kartta gorunen tek cumle. Kurumdan gelmeyen hicbir sey yazilmaz. */
  ozet: string;
  ikon: string;
};

export const ETKINLIKLER: Etkinlik[] = [
  {
    /*
      Kurum bildirimi, 12 Eylul 2026: "3-5 yas, 27 Eylul, 17.00-18.30,
      Turkce Oyunlarla Matematik workshop".

      TEYIT BEKLIYOR: bunun haftalik programdaki Sali/Cumartesi
      seanslarinin YERINE mi gectigi sorulmus durumda. Su an tek seferlik
      workshop olarak duruyor, cunku o seanslar 9 Eylul listesiyle zaten
      takvimden cikmisti; yani ortada degistirilen bir seans yok.
    */
    slug: "oyunlarla-matematik-27-eylul",
    ad: "Oyunlarla Matematik Workshop",
    tarih: "2026-09-27",
    bas: "17.00",
    bit: "18.30",
    yasEtiket: "3-5 yaş",
    dil: "tr",
    atolyeSlug: "oyunlarla-matematik-atolyesi",
    ozet: "Tek seferlik matematik atölyesi, Türkçe işlenir.",
    ikon: "Sayilar",
  },
  /*
    80'LER PARTISI BURAYA GELECEK. Kesin tarih ve saat gelmeden
    YAZILMAZ: "haftaya pazar" bir reklam gorseline de bir site kartina da
    yetmez. Parti yalnizca kayitli ailelere acik olacagi icin karta
    "Bambola'ya kayitli ailelerimize ozel" satiri da dusmeli.
  */
];

/**
 * Turkiye sabit UTC+3. Etkinlik kurumun gunune gore gecer, sunucunun veya
 * tarayicinin saat dilimine gore degil.
 */
const trGunBasi = (isoGun: string) => Date.parse(`${isoGun}T00:00:00+03:00`);
const GUN_MS = 24 * 60 * 60 * 1000;

/**
 * Bugun dahil, henuz gecmemis etkinlikler. Tarihe gore sirali.
 *
 * SUNUCUDA hesaplanip istemciye prop olarak gecirilir; istemcide ayrica
 * hesaplanirsa onbellekten gelen sayfada sunucu ile istemci ayni gun icin
 * farkli sey soyleyebilir (hydration uyusmazligi).
 */
export function yaklasanEtkinlikler(simdi: Date = new Date()): Etkinlik[] {
  const t = simdi.getTime();
  return ETKINLIKLER.filter((e) => t < trGunBasi(e.tarih) + GUN_MS).sort((a, b) =>
    a.tarih.localeCompare(b.tarih),
  );
}

/** Bir atolyenin yaklasan etkinlikleri. Program sayfasi bunu basiyor. */
export function atolyeEtkinlikleri(
  slug: AtolyeSlug,
  simdi: Date = new Date(),
): Etkinlik[] {
  return yaklasanEtkinlikler(simdi).filter((e) => e.atolyeSlug === slug);
}

const UZUN_TARIH = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  weekday: "long",
  timeZone: "Europe/Istanbul",
});

/** "27 Eylül Pazar". Yil yazilmaz, etkinlikler hep yakin tarihli. */
export function etkinlikGunu(e: Etkinlik): string {
  const parcalar = UZUN_TARIH.formatToParts(new Date(`${e.tarih}T12:00:00+03:00`));
  const al = (tur: string) => parcalar.find((p) => p.type === tur)?.value ?? "";
  return `${al("day")} ${al("month")} ${al("weekday")}`;
}

/** "17.00 - 18.30" */
export function etkinlikSaati(e: Etkinlik): string {
  return `${e.bas} - ${e.bit}`;
}
