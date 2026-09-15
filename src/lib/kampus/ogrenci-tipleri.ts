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

/*
  "dondurdu" kodu duruyor, etiketi "Pasif": kurumun Excel'i ve gunluk dili
  "AKTİF / PASİF / AYRILDI" diyor. Kod degistirilseydi veritabani kisiti ve
  eski kayitlar da degisecekti; etiket degismesi yeterli.
*/
export const OGRENCI_DURUM_ETIKET: Record<OgrenciDurumu, string> = {
  aday: "Aday",
  aktif: "Aktif",
  dondurdu: "Pasif",
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
  /** Bos olabilir: Excel'den gelen cocuklarin cogunda yalniz dogum gunu var. */
  dogum_tarihi: string | null;
  kurum: string;
  basvuru_id: string | null;
  kayit_tarihi: string;
  durum: OgrenciDurumu;
  alerji: string | null;
  saglik_notu: string | null;
  notlar: string | null;

  /* --- Excel GENEL LISTE sutunlari (0007 gocu) --- */
  excel_no: string | null;
  excel_adi: string | null;
  excel_kaynak: string | null;
  ilk_kayit_yas: string | null;
  dogum_gunu: string | null;
  katilim_durumu: string | null;
  paket: string | null;
  program_metni: string | null;
  son_odeme_tarihi: string | null;
  son_odenen: string | null;
  son_odeme_turu: string | null;
  ikametgah: string | null;
  kalan_hak_saat: number | null;
  gelis_hakki: number | null;
  toplam_odenen: number | null;
  toplam_odenen_formul: string | null;
  guncellenme_tarihi: string | null;
  excel_notu: string | null;
  ilk_ders_tarihi: string | null;
};

export type Veli = {
  id: string;
  ad_soyad: string;
  /** Bos olabilir: Excel'de uc velinin numarasi yok. */
  telefon: string | null;
  eposta: string | null;
  profil_id: string | null;
  adres: string | null;
  notlar: string | null;
  telefon_ham: string | null;
  alternatif_telefon: string | null;
  excel_adi: string | null;
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

/**
 * Yas metni. Dogum tarihi varsa ondan hesaplanir; yoksa Excel'in "ILK
 * KAYIT YAS" hucresi gosterilir ("38 ay · ilk kayıtta"). Ikisi de yoksa
 * tire. Hesap `lib/yas.ts` icinde; burada yalniz secim var.
 */
export function yasEtiketi(
  o: { dogum_tarihi: string | null; ilk_kayit_yas?: string | null },
  hesapla: (dogum: string) => string,
): string {
  if (o.dogum_tarihi) return hesapla(o.dogum_tarihi);
  if (o.ilk_kayit_yas) return `${o.ilk_kayit_yas.trim()} · ilk kayıtta`;
  return "—";
}

/** "2026-04-15" -> "15.04.2026". Excel tarihleri panelde bu bicimde. */
export function kisaTarih(t: string | null | undefined): string {
  if (!t) return "";
  const [y, a, g] = t.slice(0, 10).split("-");
  return y && a && g ? `${g}.${a}.${y}` : t;
}
