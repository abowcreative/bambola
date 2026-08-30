/**
 * Durum -> renk tonu esleme.
 *
 * Panelde her durum bir rozetle gosteriliyor ve rozetin rengi anlam
 * tasiyor. Onceki halde butun tonlar marka yesilinin tonlariydi: "gelmedi"
 * ile "islendi" ayni koyu yesille, "gecikmis odeme" ile "kayit oldu" yine
 * ayni yesille cikiyordu. Bir tabloda goz once RENGE bakiyor; yanlis renk,
 * yazan metni okuyana kadar yanlis bilgi veriyor.
 *
 * Tonlarin gorsel karsiligi `components/kampus/ui.tsx` icinde. Esleme
 * BURADA, bilesenlerin disinda: hem sunucu sayfalari hem istemci
 * bilesenleri ayni haritaya bakiyor ve tek yerden degisiyor.
 */

export type Ton =
  | "notr"
  | "basari"
  | "uyari"
  | "tehlike"
  | "bilgi"
  | "vurgu"
  | "sessiz";

/** Basvuru: yeni olan islenmemis is demek, dikkat cekmeli. */
export const BASVURU_TONU: Record<string, Ton> = {
  yeni: "vurgu",
  arandi: "bilgi",
  ulasilamadi: "uyari",
  kayit_oldu: "basari",
  vazgecti: "sessiz",
};

/** Lead: basvurularla ayni mantik, ayni sozluk. */
export const LEAD_TONU: Record<string, Ton> = {
  yeni: "vurgu",
  gorusuldu: "bilgi",
  kayit_oldu: "basari",
  kayip: "sessiz",
};

export const OGRENCI_TONU: Record<string, Ton> = {
  aktif: "basari",
  aday: "bilgi",
  dondurdu: "uyari",
  ayrildi: "sessiz",
};

export const DERS_TONU: Record<string, Ton> = {
  planli: "bilgi",
  islendi: "basari",
  iptal: "sessiz",
};

/** Yoklama: gelmeyen cocuk aranacak bir is, kirmizi. */
export const YOKLAMA_TONU: Record<string, Ton> = {
  geldi: "basari",
  gelmedi: "tehlike",
  izinli: "bilgi",
  telafi: "uyari",
};

export const ODEME_TONU: Record<string, Ton> = {
  borc: "uyari",
  tahsilat: "basari",
};

export const HESAP_TONU: Record<string, Ton> = {
  admin: "bilgi",
  ogretmen: "basari",
  veli: "notr",
};
