/** basvurular tablosunun TypeScript karsiligi. 0001_basvurular.sql ile birebir. */

export type BasvuruDurumu =
  | "yeni"
  | "arandi"
  | "ulasilamadi"
  | "kayit_oldu"
  | "vazgecti";

export type Kurum = "oyun-evi" | "anaokulu" | "parti";

export const DURUM_ETIKET: Record<BasvuruDurumu, string> = {
  yeni: "Yeni",
  arandi: "Arandı",
  ulasilamadi: "Ulaşılamadı",
  kayit_oldu: "Kayıt oldu",
  vazgecti: "Vazgeçti",
};

export const KURUM_ETIKET: Record<Kurum, string> = {
  "oyun-evi": "Oyun evi",
  anaokulu: "Anaokulu",
  parti: "Parti",
};

export type SecilenSlot = {
  id: string;
  gun: string;
  bas: string;
  bit: string;
  atolye: string;
  ogretmenler: string[];
};

export type Basvuru = {
  id: string;
  created_at: string;
  kurum: Kurum;
  cocuk_adi: string | null;
  dogum_tarihi: string;
  yas_ay: number;
  program_slug: string | null;
  paket_kod: string | null;
  secilen_slotlar: SecilenSlot[];
  saat_uymuyor: boolean;
  saat_notu: string | null;
  fiyat_normal: number | null;
  fiyat_erken_kayit: number | null;
  erken_kayit_uygulandi: boolean;
  veli_adi: string;
  telefon: string;
  eposta: string | null;
  iletisim_tercihi: string | null;
  kaynak: string | null;
  not_metni: string | null;
  kvkk_onay: boolean;
  ticari_ileti_onay: boolean;
  durum: BasvuruDurumu;
  admin_notu: string | null;
  guncelleyen: string | null;
  updated_at: string | null;
  utm: Record<string, string> | null;
  referrer: string | null;
  user_agent: string | null;
  ip_hash: string | null;
};

export type BasvuruEkle = Omit<
  Basvuru,
  "id" | "created_at" | "updated_at" | "durum" | "admin_notu" | "guncelleyen"
>;
