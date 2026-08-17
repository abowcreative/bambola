/**
 * Veri modeli. PLAN.md Bolum 6.5'ten, gercek veriye gore genisletildi.
 *
 * Program, saatler ve ucretler kodda TypeScript sabiti olarak durur,
 * veritabaninda degil (PLAN.md Bolum 4, "Veri nerede durur").
 */

export type Gun =
  | "pazartesi"
  | "sali"
  | "carsamba"
  | "persembe"
  | "cuma"
  | "cumartesi"
  | "pazar";

export const GUNLER: Gun[] = [
  "pazartesi",
  "sali",
  "carsamba",
  "persembe",
  "cuma",
  "cumartesi",
  "pazar",
];

export const GUN_ADI: Record<Gun, string> = {
  pazartesi: "Pazartesi",
  sali: "Salı",
  carsamba: "Çarşamba",
  persembe: "Perşembe",
  cuma: "Cuma",
  cumartesi: "Cumartesi",
  pazar: "Pazar",
};

export const GUN_KISA: Record<Gun, string> = {
  pazartesi: "Pzt",
  sali: "Salı",
  carsamba: "Çrş",
  persembe: "Prş",
  cuma: "Cuma",
  cumartesi: "Cmt",
  pazar: "Pazar",
};

/** schema.org openingHoursSpecification icin. */
export const GUN_SCHEMA: Record<Gun, string> = {
  pazartesi: "Monday",
  sali: "Tuesday",
  carsamba: "Wednesday",
  persembe: "Thursday",
  cuma: "Friday",
  cumartesi: "Saturday",
  pazar: "Sunday",
};

/**
 * Dil.
 * "karma" = Okula Hazirlik gibi gunun bir saati Ingilizce olan programlar.
 *
 * DIKKAT (PLAN.md Bolum 6.6, sonuc 2): Gelisim Odakli Oyun Grubu'nun dili
 * v2 Excel'de yazmiyor. Bu gruba "en" veya "karma" atanmaz, "tr" kalir ve
 * sitede dil rozeti gosterilmez. Kullanilabilecek tek ifade
 * "haftada 1 gun Ingilizce hediye".
 */
export type Dil = "tr" | "en" | "karma";

export const DIL_ETIKET: Record<Dil, string> = {
  tr: "Türkçe",
  en: "İngilizce",
  karma: "Türkçe, günde 1 saat İngilizce",
};

export type YasAraligi = {
  /** Dahil, ay cinsinden. */
  minAy: number;
  /** Dahil, ay cinsinden. */
  maxAy: number;
  /**
   * Sitede gorunen etiket. AY DEGIL YAS yazilir: "1,5 - 2 yas", "3-5 yas".
   * Musteri karari, 17 Agustos 2026: "ay ve yas araligi vermeyelim" -->
   * ay ifadeleri kalkti, yas ifadeleri kaldi. Ay hesabi arkada duruyor.
   */
  etiket: string;
  /** Cocuk gruba ebeveyni olmadan katiliyor mu. */
  ebeveynsiz: boolean;
};

export type Slot = {
  /** "pzt-0930-okula-hazirlik" */
  id: string;
  gun: Gun;
  /** "09.30" */
  bas: string;
  /** "12.30" */
  bit: string;
  atolyeSlug: AtolyeSlug;
  yas: YasAraligi;
  dil: Dil;
  ogretmenler: string[];
  /** Bu slota tek katilimla girilebilir mi (PLAN.md Bolum 6.2 tablo C). */
  tekSeferMumkun: boolean;
};

export type AtolyeSlug =
  | "okula-hazirlik-grubu"
  | "gelisim-odakli-oyun-grubu"
  | "bebek-oyun-grubu"
  | "ingilizce-oyun-grubu"
  | "sarkili-masal-ve-sanat-atolyesi"
  | "oyunlarla-matematik-atolyesi"
  | "minik-beyinler-laboratuvari"
  | "guvenli-ayrilma-programi"
  | "serbest-oyun";

export type Atolye = {
  slug: AtolyeSlug;
  ad: string;
  /** Kisa ad, dar kartlarda ve takvimde. */
  kisaAd: string;
  yasEtiket: string;
  dil: Dil;
  /** Hangi ucret ailesine bagli. null = ucretlendirilmiyor (serbest oyun). */
  ailesi: ProgramAilesiSlug | null;
  /**
   * Kurumdan gelecek pedagojik aciklama.
   * PLAN.md Bolum 14 madde 5: uydurma icerik yazilmaz, o yuzden null.
   */
  aciklama: string | null;
  /** Excel'den dogrudan cikan, uydurulmamis olgular. */
  olgular: string[];
  ikon: string;
};

export type ProgramAilesiSlug =
  | "okula-hazirlik"
  | "gelisim-odakli-oyun"
  | "bebek"
  | "ingilizce";

export type PaketKodu = "tek-sefer" | "ayda-4" | "ayda-8" | "ayda-12";

export type PaketSecenegi = {
  kod: PaketKodu;
  etiket: string;
  normal: number;
  /** Indirim yoksa normal ile ayni. Ayni ise sitede indirim rozeti gosterilmez. */
  erkenKayit: number;
};

export type Kombinasyon = {
  /** "Pazartesi + Çarşamba, 10.00 - 12.00" */
  etiket: string;
  slotIdler: string[];
  /** Hafta sonu alternatifi mi (PLAN.md Bolum 6.2, Excel M18/N18/O18). */
  haftaSonu: boolean;
};

export type ProgramAilesi = {
  slug: ProgramAilesiSlug;
  ad: string;
  kisaAd: string;
  /** Kayit formunda kartta gorunen tek cumle. */
  ozet: string;
  yasEtiket: string;
  minAy: number;
  maxAy: number;
  /**
   * Gruptaki en fazla cocuk sayisi.
   * 10 Agustos 2026 musteri karari: Okula Hazirlik 12, diger butun gruplar 8.
   * Onceden hepsi 12 yaziliyordu, artik tek bir sayi kullanilmaz.
   */
  maxKisi: number;
  /**
   * Haftalik yuk, tek satirda: "Haftada 3 gun · Gunde 3 saat".
   * 10 Agustos 2026 musteri istegi: "Okula hazirlik gruplari icin 3 gun
   * 3 saat diye yazalim buyuk". Bilgi ozet ve ozellikler icinde dagilmis
   * duruyordu; belgede one cikarilabilmesi icin kendi alani var.
   */
  sure: string;
  ozellikler: string[];
  paketler: PaketSecenegi[];
  sabitKombinasyonlar: Kombinasyon[];
  notlar: string[];
  ikon: string;
};
