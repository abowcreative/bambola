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
    yasEtiket: "2,5 yaş ve üzeri, ebeveynsiz",
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
    yasEtiket: "1 - 3 yaş",
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
    yasEtiket: "6 aylık - 2 yaş",
    dil: "tr",
    ailesi: "bebek",
    aciklama: null,
    olgular: [
      "Etkinlik süresi 2 saat: 1 saat atölye, 1 saat serbest oyun",
      "6-12 ay grubu haftanın tek günü",
      "Bebek gruplarına ebeveyn eşlik eder",
    ],
    ikon: "Bebek",
  },
  {
    /*
      12 Eylul 2026'da kurumun bildirdigi yeni marka dili:
        6-12 ay  -> Bebek Grubu
        12-16 ay -> Gelisim Odakli Bebek Oyun Grubu
      Reklamda gorulen baslik sitede de birebir gorunsun diye ayri bir
      program sayfasi acildi.

      ADI "Gelisim Odakli Oyun Grubu" ILE KARISTIRMAYIN: o 16-36 ay icin
      ayri bir program. Ikisini ayirt eden kelime "Bebek"; bu yuzden ad
      hicbir yerde kisaltilarak yazilmaz.

      Ucret ailesi "bebek" kaldi: fiyat degismedi, yalniz ad ve yas bandi
      ayrildi.
    */
    slug: "gelisim-odakli-bebek-oyun-grubu",
    ad: "Gelişim Odaklı Bebek Oyun Grubu",
    kisaAd: "Gelişim Odaklı Bebek Oyun",
    yasEtiket: "12-16 ay",
    dil: "tr",
    ailesi: "bebek",
    aciklama: null,
    olgular: [
      "Etkinlik süresi 2 saat: 1 saat atölye, 1 saat serbest oyun",
      "Çarşamba günleri 15.00 - 17.00",
      "Bebeğe ebeveyni eşlik eder",
      "En fazla 8 bebek",
    ],
    ikon: "Bebek",
  },
  {
    /*
      SARKILI MASAL VE SANAT BURAYA TASINDI (kurum karari, 12 Eylul 2026).
      Ayri bir atolye karti olarak durmuyor; sarki, masal, sanat, hareket ve
      oyun bu grubun icerigi olarak anlatiliyor.
    */
    slug: "ingilizce-oyun-grubu",
    ad: "İngilizce Oyun Grubu",
    kisaAd: "İngilizce Oyun",
    yasEtiket: "1 - 3 yaş",
    dil: "en",
    ailesi: "ingilizce",
    aciklama: null,
    olgular: [
      "Seans tamamen İngilizce işlenir",
      "Şarkı, masal, sanat, hareket ve oyun bir arada",
      "Etkinlik süresi 2 saat",
      "Tek katılımla da girilebilir",
      "Hafta içi ve hafta sonu ayrı günlerde açılır",
    ],
    ikon: "Yildiz",
  },
  {
    /*
      12 Eylul 2026'da TAMAMEN DEGISTI. Onceki hali haftalik programda Sali
      ve Cumartesi seanslari olan, INGILIZCE islenen 2 saatlik bir atolyeydi;
      o seanslar 9 Eylul listesiyle zaten takvimden cikmisti.

      Yeni hali tarihli, tek seferlik bir workshop: 27 Eylul 2026 Pazar,
      17.00 - 18.30, TURKCE. Tarih ve saat etkinlikler.ts'de duruyor, tarih
      gecince kendiliginden dusuyor; buraya YAZILMAZ, yoksa iki yerde iki
      tarih olur.
    */
    slug: "oyunlarla-matematik-atolyesi",
    ad: "Oyunlarla Matematik Atölyesi",
    kisaAd: "Oyunlarla Matematik",
    yasEtiket: "3-5 yaş",
    dil: "tr",
    ailesi: null,
    aciklama: null,
    olgular: [
      "Tek seferlik workshop, haftalık programın parçası değil",
      "Türkçe işlenir",
      "Kontenjan sınırlıdır, rezervasyonla katılınır",
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
    yasEtiket: "2,5 yaş ve üzeri",
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
      "İki saatlik oyun gruplarında bir saat atölye, bir saat serbest oyun yapılır",
      "Sıralama gruba göre değişir, her grup için sabit değildir",
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

/**
 * Bir program AILESININ program sayfasi.
 *
 * DIKKAT, IKI AYRI SLUG VAR: aile slug'i ("okula-hazirlik") ile atolye
 * slug'i ("okula-hazirlik-grubu") ayni sey degil. `/oyun-evi/programlar/[slug]`
 * rotasi ATOLYE slug'lariyla uretiliyor; aile slug'i verilirse sayfa 404
 * doner. /bilgi sayfasi tam bu yuzden 404 veriyordu.
 *
 * Okula hazirlik ailesine iki atolye bagli (grup ve guvenli ayrilma
 * programi); dizideki ilki grubun kendisi, o donuyor.
 */
export function aileninAtolyesi(aileSlug: string): Atolye | undefined {
  return ATOLYELER.find((a) => a.ailesi === aileSlug);
}
