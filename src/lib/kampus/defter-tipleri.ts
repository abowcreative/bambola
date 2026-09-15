/**
 * Odeme defteri, giderler, dogum gunu partileri, su karti, devamsizlik
 * cizelgesi ve Excel arsivi TIPLERI. PLAN.md Bolum 42.
 *
 * `server-only` DEGIL: formlar (istemci) de bu tipleri kullaniyor.
 * Sorgular `defter.ts`, islemler `defter-islemleri.ts` icinde.
 */

export type DefterYontemi = "nakit" | "kart" | "havale" | "karisik" | "diger";

export const DEFTER_YONTEM_ETIKET: Record<DefterYontemi, string> = {
  nakit: "Nakit",
  kart: "Kredi kartı",
  havale: "Havale",
  karisik: "Karışık",
  diger: "Diğer",
};

/** Excel'deki aylik sayfanin bir satiri = bir paket satisi / odeme. */
export type PaketSatisi = {
  id: string;
  created_at: string;
  ogrenci_id: string | null;
  cocuk_adi: string;
  veli_adi: string | null;
  tarih: string | null;
  tarih_ham: string | null;
  paket: string | null;
  program: string | null;
  tutar: number | null;
  tutar_ham: string | null;
  odeme_turu: string | null;
  yontem: DefterYontemi | null;
  aciklama: string | null;
  ay: string;
  sayfa: string | null;
  bolum: string | null;
  kaynak: "excel" | "panel";
  kaynak_satir: number | null;
  ek_alanlar: Record<string, string> | null;
  olusturan: string | null;
};

export type DogumGunuPartisi = {
  id: string;
  created_at: string;
  cocuk_adi: string | null;
  veli_adi: string | null;
  telefon: string | null;
  cocuk_yas: string | null;
  dogum_gunu: string | null;
  kapora: number | null;
  kapora_ham: string | null;
  organizasyon_tarihi: string | null;
  saat: string | null;
  anlasilan_fiyat: number | null;
  kalan_odeme: number | null;
  cocuk_sayisi: number | null;
  yetiskin_sayisi: number | null;
  yemek: string | null;
  susleme: string | null;
  mahalle: string | null;
  aciklama: string | null;
  ek_not: string | null;
  ogrenci_id: string | null;
  kaynak: "excel" | "panel";
  kaynak_satir: number | null;
  olusturan: string | null;
};

export type Gider = {
  id: string;
  created_at: string;
  tarih: string;
  tutar: number;
  aciklama: string;
  ek_not: string | null;
  kaynak: "excel" | "panel";
  kaynak_satir: number | null;
  olusturan: string | null;
};

export type SuKarti = {
  id: string;
  etiket: string;
  tarih: string | null;
  tl: number | null;
  stok: number | null;
  stok_formul: string | null;
  kaynak: "excel" | "panel";
  kaynak_satir: number | null;
};

export type DevamsizlikSatiri = {
  id: string;
  cocuk_adi: string;
  ogrenci_id: string | null;
  sutunlar: { baslik: string; deger: string }[];
  kaynak: "excel" | "panel";
  kaynak_satir: number | null;
};

/** Ham arsivdeki bir hucre: deger, formul, tarih, yorum. */
export type ArsivHucresi = {
  v: string | number | boolean;
  f?: string;
  t?: string;
  y?: string;
};

export type ExcelSayfasi = {
  id: string;
  dosya: string;
  sayfa_adi: string;
  sira: number;
  gizli: boolean;
  boyut: string | null;
  sutun_sayisi: number;
  satirlar: { r: number; h: Record<string, ArsivHucresi> }[];
  hucre_sayisi: number;
  ice_aktarim: string;
};

/** "2026-09" -> "Eylül 2026" */
export function ayEtiketi(ay: string): string {
  const [y, a] = ay.split("-");
  const AYLAR = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];
  const ad = AYLAR[Number(a) - 1];
  return ad ? `${ad} ${y}` : ay;
}

/** Tam TL bicimi: 12.500 ₺ yerine ₺12.500 (panelin geri kalaniyla ayni). */
export const tl = (n: number | null | undefined) =>
  n === null || n === undefined
    ? "—"
    : `₺${n.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}`;

/** Defter satirinin gosterilecek tutari: sayi varsa sayi, yoksa ham metin. */
export function tutarMetni(s: { tutar: number | null; tutar_ham: string | null }) {
  if (s.tutar !== null) return tl(s.tutar);
  return s.tutar_ham ?? "—";
}
