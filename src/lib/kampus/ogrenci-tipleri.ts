/**
 * Ogrenci/veli/sinif TIPLERI ve ETIKETLERI.
 *
 * `server-only` DEGIL: istemci bilesenleri de bunlari kullaniyor (suzgec
 * sekmeleri, durum rozetleri). Ayni dosyada sorgularla birlikte dursaydi
 * bir istemci bileseninin etiket almasi butun veri erisim katmanini
 * tarayici paketine surukler ve derleme hata verirdi -- nitekim verdi.
 *
 * Sorgular `ogrenciler.ts` icinde ve orasi server-only.
 */

export type OgrenciDurumu = "aday" | "aktif" | "dondurdu" | "ayrildi";

export const OGRENCI_DURUM_ETIKET: Record<OgrenciDurumu, string> = {
  aday: "Aday",
  aktif: "Aktif",
  dondurdu: "Dondurdu",
  ayrildi: "Ayrıldı",
};

export const YAKINLIK_ETIKET: Record<string, string> = {
  anne: "Anne",
  baba: "Baba",
  vasi: "Vasi",
  veli: "Veli",
};

export type Ogrenci = {
  id: string;
  created_at: string;
  ad: string;
  soyad: string | null;
  dogum_tarihi: string;
  kurum: string;
  basvuru_id: string | null;
  kayit_tarihi: string;
  durum: OgrenciDurumu;
  alerji: string | null;
  saglik_notu: string | null;
  notlar: string | null;
};

export type Veli = {
  id: string;
  ad_soyad: string;
  telefon: string;
  eposta: string | null;
  profil_id: string | null;
  adres: string | null;
  notlar: string | null;
};

export type Sinif = {
  id: string;
  ad: string;
  slot_id: string | null;
  atolye_slug: string | null;
  program_slug: string | null;
  gun: string | null;
  bas: string | null;
  bit: string | null;
  kontenjan: number;
  ogretmen_ad: string | null;
  donem: string;
  aktif: boolean;
  notlar: string | null;
};

export type Kayit = {
  id: string;
  ogrenci_id: string;
  sinif_id: string;
  paket_kod: string | null;
  ucret: number | null;
  baslangic: string;
  bitis: string | null;
  durum: string;
};

export const ogrenciAdi = (o: { ad: string; soyad: string | null }) =>
  o.soyad ? `${o.ad} ${o.soyad}` : o.ad;
