import type { AtolyeSlug, ProgramAilesiSlug } from "./types";

/**
 * /bilgi sayfasindaki DONEM tablosu. Musteri revizesi, 18 Agustos 2026.
 *
 * NEDEN AILELER'DEN OKUNMUYOR: /bilgi sayfasi bugune kadar gruplari
 * `AILELER` sabitinden basiyordu ve dogru olan da buydu -- ikinci bir metin
 * yazilsaydi biri eskirdi. Ama bu revize `AILELER`in tasidigi seyden BASKA
 * bir sey istiyor:
 *
 *   - Gruplarin bir kismi artik SAAT YAZMIYOR, yerine iletisim cagrisi var.
 *   - Bebek grubu ikiye bolunuyor (12-24 ve 16-24), ucret ailesi bolunmuyor.
 *   - Kartlarda doneme bagli durum rozetleri var ("Grubumuz basladi",
 *     "Son kontenjanlar", "Eylul donemi kayitlari basladi").
 *
 * `AILELER` ucretin, kayit formunun, haftalik takvimin ve schema.org
 * ciktisinin kaynagi; Excel'e karsi hucre hucre dogrulanmis durumda. Doneme
 * bagli bu sunumu oraya yazmak dort sayfayi birden bozardi. Bu yuzden
 * /bilgi'nin grup bolumu ayri duruyor, UCRETLER BOLUMU HALA `AILELER`DEN
 * OKUYOR: fiyat tek kaynaktan gelmeye devam ediyor.
 *
 * SITEDE KULLANILMAYACAK IC BILGILER (musteri notu, 18 Agustos 2026):
 * "grupta yalnizca bir cocuk var" ve "Ekim'de baslayacak" bilgileri yalnizca
 * ic planlamaya aittir. Ne bu dosyaya ne baska bir yuzeye yazilir, sosyal
 * medyada da kullanilmaz. Buraya not dusuluyor ki ileride "kontenjan bos"
 * diye bir metin eklenmeye kalkilmasin.
 */

/**
 * Yas etiketleri AY olarak yaziliyor (12-24 ay, 24-36 ay, 36+ ay).
 *
 * DIKKAT: 17 Agustos 2026 karari "ay ve yas araligi vermeyelim" idi ve
 * `types.ts` icindeki `YasAraligi.etiket` hala yas yaziyor. 18 Agustos
 * revizesi bu sayfa icin ay ifadelerini geri getirdi; grup ADLARI zaten
 * ayla anilir hale geldi ("12-24 Ay Bebek Oyun Grubu"). Karar yalniz
 * /bilgi sayfasi icin degisti, sitenin geri kalani yas yazmaya devam ediyor.
 */

/** Kartin ustundeki durum rozeti. */
export type DonemDurumu = {
  etiket: string;
  /** "vurgu" dolu yesil rozet, "sakin" krem rozet. */
  ton: "vurgu" | "sakin";
};

export type DonemGrubu = {
  /** Sayac ve WhatsApp mesaji icin kart kimligi. */
  slug: string;
  ad: string;
  /** Kart basligi altindaki yas satiri. */
  yasEtiket: string;
  /**
   * Birden fazla yas bandi olan gruplar icin (Ingilizce). Bos dizi = tek
   * bant, `yasEtiket` yeterli.
   */
  yasBantlari: string[];
  /** "Salı ve Perşembe". null = gun bilgisi verilmiyor. */
  gunler: string | null;
  /**
   * Saat satirlari. BOS DIZI = saat bilgisi VERILMIYOR, kartta yerine
   * iletisim cagrisi cikiyor. Revizede yalniz Okula Hazirlik saat tasiyor.
   */
  saatler: string[];
  /** "3, 4 veya 5 gün katılım seçenekleri" gibi ek secim satiri. */
  secenek: string | null;
  durum: DonemDurumu | null;
  /** Kartta "Eylul donemi kayitlari basladi" kutusu cikacak mi. */
  donemDuyurusu: boolean;
  /**
   * Kart iki sutunlu izgarada TAM GENISLIK kaplasin mi.
   *
   * Okula Hazirlik dort satir ayrinti tasiyor (5 gun, iki saat araligi, gun
   * sayisi secenegi); dar sutunda bunlar alt alta yigiliyor ve kart yanindaki
   * kartin iki katina cikiyordu. Genis kartta ayrintilar iki alt sutuna
   * bolunuyor, satir yuksekligi diger kartlarla ayni kaliyor.
   */
  genis: boolean;
  /**
   * Tiklama sayacinin hangi ucret ailesine yazilacagi. Kart aileden daha
   * ince bolunmus olabilir (iki bebek karti da "bebek" ailesine yaziyor).
   */
  sayacAilesi: ProgramAilesiSlug | null;
  /** Bir aileye bagli olmayan atolyeler icin. */
  sayacAtolyesi: AtolyeSlug | null;
  /** Programin ayrintisi hangi atolye sayfasinda. null = sayfa yok. */
  programSayfasi: AtolyeSlug | null;
  ikon: string;
};

/**
 * Eylul donemi duyurusu. Son kayit gunu DAHIL; 26 Agustos 00:00'da (TR)
 * kendiliginden dusuyor.
 *
 * Kampanya penceresiyle (bkz. ucretler.ts KAMPANYA_PENCERESI, son gun
 * 1 Eylul) AYNI SEY DEGIL: o fiyat indirimi, bu donem kaydi. Ikisinin
 * tarihi de birbirinden bagimsiz.
 */
export const DONEM_DUYURUSU = {
  baslik: "Eylül dönemi kayıtları başladı",
  /** Son gun DAHIL. */
  sonKayit: "2026-08-25",
  sonKayitMetin: "25 Ağustos",
} as const;

/**
 * Turkiye sabit UTC+3. Duyuru kurumun gunune gore kapanir, sunucunun veya
 * tarayicinin saat dilimine gore degil. Bkz. ucretler.ts icindeki ayni not.
 */
const trGunBasi = (isoGun: string) => Date.parse(`${isoGun}T00:00:00+03:00`);
const GUN_MS = 24 * 60 * 60 * 1000;

/**
 * Eylul donemi kaydi SU AN acik mi.
 *
 * SUNUCUDA hesaplanip istemciye prop olarak gecirilir. Istemcide ayrica
 * hesaplanirsa sayfa onbellekten gelirken sunucu "acik" istemci "kapali"
 * diyebilir ve hydration uyusmazligi cikar.
 */
export function donemKaydiAcikMi(simdi: Date = new Date()): boolean {
  return simdi.getTime() < trGunBasi(DONEM_DUYURUSU.sonKayit) + GUN_MS;
}

/**
 * /bilgi sayfasinda gorunen gruplar, musterinin verdigi sirayla.
 *
 * Ucret bolumu bu listeden DEGIL `AILELER`den uretiliyor; oradaki dort
 * ucret ailesi (okula hazirlik, gelisim odakli oyun, bebek, Ingilizce)
 * degismedi.
 */
export const DONEM_GRUPLARI: DonemGrubu[] = [
  {
    slug: "okula-hazirlik",
    ad: "Okula Hazırlık Grupları",
    yasEtiket: "2,5 yaş ve üzeri",
    yasBantlari: [],
    gunler: "Haftanın 5 günü",
    saatler: ["Sabah 09.30 - 12.30", "Öğleden sonra 14.30 - 17.30"],
    secenek: "3, 4 veya 5 gün katılım seçenekleri",
    durum: null,
    donemDuyurusu: false,
    genis: true,
    sayacAilesi: "okula-hazirlik",
    sayacAtolyesi: null,
    programSayfasi: "okula-hazirlik-grubu",
    ikon: "Ampul",
  },
  {
    slug: "bebek-12-24",
    ad: "12–24 Ay Bebek Oyun Grubu",
    yasEtiket: "12–24 ay",
    yasBantlari: [],
    gunler: "Pazartesi ve Cuma",
    saatler: [],
    secenek: null,
    durum: { etiket: "Grubumuz başladı", ton: "vurgu" },
    donemDuyurusu: false,
    genis: false,
    sayacAilesi: "bebek",
    sayacAtolyesi: null,
    programSayfasi: "bebek-oyun-grubu",
    ikon: "Bebek",
  },
  {
    slug: "bebek-16-24",
    ad: "16–24 Ay Bebek Oyun Grubu",
    yasEtiket: "16–24 ay",
    yasBantlari: [],
    gunler: "Salı ve Perşembe",
    saatler: [],
    secenek: null,
    durum: { etiket: "Son kontenjanlar", ton: "vurgu" },
    donemDuyurusu: false,
    genis: false,
    sayacAilesi: "bebek",
    sayacAtolyesi: null,
    programSayfasi: "bebek-oyun-grubu",
    ikon: "Bebek",
  },
  {
    slug: "ingilizce",
    ad: "İngilizce Oyun Grupları",
    yasEtiket: "12 ay ve üzeri",
    yasBantlari: ["12–24 ay", "24–36 ay", "36+ ay"],
    gunler: "Hafta içi ve hafta sonu seçenekleri · Cumartesi 24–36 ay grubu",
    saatler: [],
    secenek: null,
    durum: null,
    donemDuyurusu: true,
    genis: false,
    sayacAilesi: "ingilizce",
    sayacAtolyesi: null,
    programSayfasi: "ingilizce-oyun-grubu",
    ikon: "Yildiz",
  },
  {
    /*
      Programlara AYRI BIR KART olarak eklendi (revize, 18 Agustos 2026).
      Kendi ucret ailesi yok; tek seferlik atolye fiyatiyla yuruyor, o yuzden
      sayac atolye slug'ina yaziliyor.
    */
    slug: "sarkili-masal-6-12",
    ad: "6–12 Ay Şarkılı Masal ve Sanat Atölyesi",
    yasEtiket: "6–12 ay",
    yasBantlari: [],
    gunler: null,
    saatler: [],
    secenek: null,
    durum: null,
    donemDuyurusu: false,
    genis: false,
    sayacAilesi: null,
    sayacAtolyesi: "sarkili-masal-ve-sanat-atolyesi",
    programSayfasi: "sarkili-masal-ve-sanat-atolyesi",
    ikon: "Muzik",
  },
];

const indeks = new Map(DONEM_GRUPLARI.map((g) => [g.slug, g]));

export function donemGrubuBul(slug: string): DonemGrubu | undefined {
  return indeks.get(slug);
}
