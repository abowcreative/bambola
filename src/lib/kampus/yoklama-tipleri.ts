/**
 * Yoklama, ders, odeme, lead, menu ve duyuru TIPLERI ve ETIKETLERI.
 *
 * `server-only` DEGIL: istemci bilesenleri de kullaniyor. Sorgular ayri
 * dosyada (`yoklama.ts`) ve orasi server-only. Bu ayrimin sebebi Bolum
 * 30'da: bir istemci bileseni buradan etiket alinca butun veri erisim
 * katmani tarayici paketine surukleniyordu.
 */

export type DersDurumu = "planli" | "islendi" | "iptal";
export type YoklamaDurumu = "geldi" | "gelmedi" | "izinli" | "telafi";
export type OdemeTuru = "borc" | "tahsilat";
export type LeadDurumu = "yeni" | "gorusuldu" | "kayit_oldu" | "kayip";

export const DERS_DURUM_ETIKET: Record<DersDurumu, string> = {
  planli: "Planlı",
  islendi: "İşlendi",
  iptal: "İptal",
};

export const YOKLAMA_ETIKET: Record<YoklamaDurumu, string> = {
  geldi: "Geldi",
  gelmedi: "Gelmedi",
  izinli: "İzinli",
  telafi: "Telafi",
};

/** Yoklama rozet renkleri. Gelmedi dikkat cekmeli. */
export const YOKLAMA_RENGI: Record<YoklamaDurumu, string> = {
  geldi: "bg-lime-rozet text-black",
  gelmedi: "bg-yesil-koyu text-white",
  izinli: "bg-krem-koyu text-murekkep",
  telafi: "bg-cizgi text-murekkep",
};

export const LEAD_DURUM_ETIKET: Record<LeadDurumu, string> = {
  yeni: "Yeni",
  gorusuldu: "Görüşüldü",
  kayit_oldu: "Kayıt oldu",
  kayip: "Kayıp",
};

export const LEAD_KAYNAK_ETIKET: Record<string, string> = {
  instagram: "Instagram",
  telefon: "Telefon",
  tavsiye: "Tavsiye",
  tabela: "Tabela",
  whatsapp: "WhatsApp",
  diger: "Diğer",
};

export const YONTEM_ETIKET: Record<string, string> = {
  nakit: "Nakit",
  kart: "Kart",
  havale: "Havale",
  diger: "Diğer",
};

export type Ders = {
  id: string;
  sinif_id: string;
  tarih: string;
  durum: DersDurumu;
  isleyen_ogretmen: string | null;
  konu: string | null;
  notlar: string | null;
};

export type YoklamaKaydi = {
  id: string;
  ders_id: string;
  ogrenci_id: string;
  durum: YoklamaDurumu;
  not_metni: string | null;
  isaretleyen: string | null;
};

export type Odeme = {
  id: string;
  created_at: string;
  ogrenci_id: string;
  kayit_id: string | null;
  tur: OdemeTuru;
  tutar: number;
  tarih: string;
  vade: string | null;
  yontem: string | null;
  aciklama: string | null;
  olusturan: string | null;
};

export type Lead = {
  id: string;
  created_at: string;
  ad_soyad: string;
  telefon: string | null;
  kaynak: string;
  cocuk_adi: string | null;
  cocuk_dogum: string | null;
  ilgilendigi_program: string | null;
  durum: LeadDurumu;
  notlar: string | null;
  olusturan: string | null;
  ogrenci_id: string | null;
};

export type Menu = {
  id: string;
  tarih: string;
  kahvalti: string | null;
  ogle: string | null;
  ara_ogun: string | null;
  notlar: string | null;
};

export type Duyuru = {
  id: string;
  created_at: string;
  baslik: string;
  metin: string;
  hedef: "hepsi" | "ogretmen" | "veli";
  yayinda: boolean;
  olusturan: string | null;
};

export const HEDEF_ETIKET: Record<string, string> = {
  hepsi: "Herkes",
  ogretmen: "Öğretmenler",
  veli: "Veliler",
};

/** Bakiye: borc - tahsilat. Pozitif = borclu. */
export function bakiyeHesapla(hareketler: Pick<Odeme, "tur" | "tutar">[]) {
  let borc = 0;
  let tahsilat = 0;
  for (const h of hareketler) {
    if (h.tur === "borc") borc += h.tutar;
    else tahsilat += h.tutar;
  }
  return { borc, tahsilat, bakiye: borc - tahsilat };
}
