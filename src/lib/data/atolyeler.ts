import type { Atolye, AtolyeSlug } from "./types";

/**
 * Atolye ve program tanimlari. PLAN.md Bolum 6.4.
 *
 * DIKKAT: "aciklama" alani bilerek null. Atolyelerin pedagojik aciklamalari
 * kurumdan alinacak, uydurma icerik yazilmaz (PLAN.md Bolum 14 madde 5).
 * "olgular" alani yalnizca Excel'den dogrudan cikan, dogrulanmis bilgileri
 * tasir. Aciklama geldiginde tek yerden doldurulur.
 */

export const ATOLYELER: Atolye[] = [
  {
    slug: "okula-hazirlik-grubu",
    ad: "Okula Hazırlık Grubu",
    kisaAd: "Okula Hazırlık",
    yasEtiket: "30+ ay, ebeveynsiz",
    dil: "karma",
    ailesi: "okula-hazirlik",
    aciklama: null,
    olgular: [
      "Haftada 3 gün, günde 3 saat, bütünleştirilmiş etkinlikler",
      "Her gün 1 saat İngilizce oyun grubu",
      "Çocuk gruba ebeveyni olmadan katılır",
      "Gelişim takibi yapılır",
      "1 ara öğün verilir",
      "Tek seferlik katılım yoktur",
    ],
    ikon: "Ampul",
  },
  {
    slug: "gelisim-odakli-oyun-grubu",
    ad: "Gelişim Odaklı Oyun Grubu",
    kisaAd: "Gelişim Odaklı Oyun",
    yasEtiket: "12-36 ay",
    // v2 Excel dili yazmiyor. PLAN.md Bolum 6.6 sonuc 2:
    // bu grupta "Ingilizce" iddiasi kullanilamaz, dil rozeti gosterilmez.
    dil: "tr",
    ailesi: "gelisim-odakli-oyun",
    aciklama: null,
    olgular: [
      "Haftada 2 gün, günde 2 saat, bütünleştirilmiş etkinlikler",
      "Gelişim takibi yapılır",
      "Güvenli ayrılma programına geçiş hazırlığı",
      "Gelişim Odaklı Oyun Grubuna haftada 2 gün katılan çocuklarımıza haftada 1 İngilizce oyun grubu hediyedir",
    ],
    ikon: "Grup",
  },
  {
    slug: "bebek-oyun-grubu",
    ad: "Bebek Oyun Grubu",
    kisaAd: "Bebek Oyun Grubu",
    yasEtiket: "6-24 ay",
    dil: "tr",
    ailesi: "bebek",
    aciklama: null,
    olgular: [
      "Etkinlik süresi 2 saat",
      "6-12 ay grubu haftanın tek günü, 12-24 ay grubu haftada 2 gün",
      "Bebek gruplarına ebeveyn eşlik eder",
    ],
    ikon: "Bebek",
  },
  {
    slug: "ingilizce-oyun-grubu",
    ad: "İngilizce Oyun Grubu",
    kisaAd: "İngilizce Oyun",
    yasEtiket: "24-36 ay",
    dil: "en",
    ailesi: "ingilizce",
    aciklama: null,
    olgular: [
      "Etkinlik süresi 2 saat",
      "Tek katılımla da girilebilir",
      "Hafta içi iki ayrı günde açılır",
    ],
    ikon: "Yildiz",
  },
  {
    slug: "sarkili-masal-ve-sanat-atolyesi",
    ad: "Şarkılı Masal ve Sanat Atölyesi",
    kisaAd: "Şarkılı Masal ve Sanat",
    yasEtiket: "6-36 ay",
    dil: "karma",
    ailesi: null,
    aciklama: null,
    olgular: [
      "Etkinlik süresi 2 saat",
      "Tek katılımla girilebilir",
      "6-12 ay seansı Türkçe, 12-36 ay seansları İngilizce",
    ],
    ikon: "Muzik",
  },
  {
    slug: "oyunlarla-matematik-atolyesi",
    ad: "Oyunlarla Matematik Atölyesi",
    kisaAd: "Oyunlarla Matematik",
    yasEtiket: "3-5 yaş",
    dil: "en",
    ailesi: null,
    aciklama: null,
    olgular: [
      "Etkinlik süresi 2 saat",
      "Tek katılımla girilebilir",
      "İngilizce işlenir",
      "Salı seansına çocuk ebeveynsiz katılır",
    ],
    ikon: "Sayilar",
  },
  {
    slug: "minik-beyinler-laboratuvari",
    ad: "Minik Beyinler Laboratuvarı",
    kisaAd: "Minik Beyinler",
    yasEtiket: "3-5 yaş",
    dil: "tr",
    ailesi: null,
    aciklama: null,
    olgular: [
      "Akıl ve zekâ oyunları",
      "Etkinlik süresi 2 saat",
      "Tek katılımla girilebilir",
    ],
    ikon: "Mercek",
  },
  {
    slug: "guvenli-ayrilma-programi",
    ad: "Güvenli Ayrılma Programı",
    kisaAd: "Güvenli Ayrılma",
    yasEtiket: "30+ ay",
    dil: "tr",
    ailesi: "okula-hazirlik",
    aciklama: null,
    olgular: [
      "Okula Hazırlık Gruplarının parçasıdır, çocuk gruba ebeveynsiz katılır",
      "Oyun gruplarından bu programa geçiş yapılır",
    ],
    ikon: "Kalp",
  },
  {
    slug: "serbest-oyun",
    ad: "Serbest Oyun Zamanı",
    kisaAd: "Serbest Oyun",
    yasEtiket: "Tüm yaşlar",
    dil: "tr",
    ailesi: null,
    aciklama: null,
    olgular: [
      "Her grup gününün ilk bir saati serbest oyundur",
      "Kayıtlı çocuklara hafta sonu belirlenen zaman diliminde 1 saat serbest oyun ücretsizdir",
    ],
    ikon: "Balon",
  },
];

const indeks = new Map(ATOLYELER.map((a) => [a.slug, a]));

export function atolyeBul(slug: string): Atolye | undefined {
  return indeks.get(slug as AtolyeSlug);
}

export const ATOLYE_SLUGLARI: AtolyeSlug[] = ATOLYELER.map((a) => a.slug);
