import type { ProgramAilesi, ProgramAilesiSlug } from "./types";
import { PAKETLER } from "./ucretler";

/**
 * Program aileleri. PLAN.md Bolum 6.2.
 * Kayit formundaki ilk secim bu.
 *
 * Sabit kombinasyonlar Excel'in sag taraf blogundan (L-P sutunlari).
 * Hafta sonu secenekleri Excel M18/N18/O18 hucrelerinden geliyor;
 * planin ilk hali bunlari yanlislikla tek seferlik blogunda sanmisti,
 * 10 Agustos 2026'da duzeltildi.
 */

export const AILELER: ProgramAilesi[] = [
  {
    slug: "okula-hazirlik",
    ad: "Okula Hazırlık Grupları",
    kisaAd: "Okula Hazırlık",
    ozet: "Çocuk gruba ebeveynsiz katılır, güvenli ayrılma programıyla.",
    yasEtiket: "30+ ay",
    minAy: 30,
    maxAy: 71,
    maxKisi: 12,
    sure: "Haftada 3 gün · Günde 3 saat",
    ozellikler: [
      "Güvenli ayrılma programı, ebeveynsiz",
      "3 gün, 3 saat, bütünleştirilmiş etkinlikler",
      "Her gün 1 saat İngilizce",
      "Gelişim takibi",
      "1 ara öğün",
      "Hafta sonları 1 saat serbest oyun alanı kullanım zamanı",
    ],
    paketler: PAKETLER["okula-hazirlik"],
    sabitKombinasyonlar: [
      {
        etiket: "Pazartesi, Salı, Çarşamba · 09.30 - 12.30",
        slotIdler: [
          "pzt-0930-okula-hazirlik",
          "sali-0930-okula-hazirlik",
          "crs-0930-okula-hazirlik",
        ],
        haftaSonu: false,
      },
      {
        etiket: "Çarşamba, Perşembe, Cuma · 14.30 - 17.30",
        slotIdler: [
          "crs-1430-okula-hazirlik",
          "prs-1430-okula-hazirlik",
          "cuma-1430-okula-hazirlik",
        ],
        haftaSonu: false,
      },
    ],
    notlar: [
      "Tek seferlik katılım yoktur.",
      "1 katılım 3 saattir ve 1 saati İngilizce oyun grubu olacak şekilde programlanmıştır.",
      "Ara öğün verilir. Kayıtlı çocuklara hafta sonu belirlenen zaman diliminde 1 saat serbest oyun ücretsizdir.",
    ],
    ikon: "Ampul",
  },
  {
    slug: "gelisim-odakli-oyun",
    ad: "Gelişim Odaklı Oyun Grubu",
    kisaAd: "Gelişim Odaklı Oyun",
    ozet: "Ebeveyn eşlik eder, güvenli ayrılmaya geçiş burada başlar.",
    yasEtiket: "16-36 ay",
    minAy: 16,
    maxAy: 36,
    maxKisi: 8,
    sure: "Haftada 2 gün · Günde 2 saat",
    ozellikler: [
      "2 gün, 2 saat, bütünleştirilmiş etkinlikler",
      "Gelişim takibi",
      "Güvenli ayrılma programına geçiş",
      "Toplam 3 gün seçeneği",
      "Haftada 2 gün katılana haftada 1 İngilizce hediye",
      "Hafta sonu seçeneği",
    ],
    paketler: PAKETLER["gelisim-odakli-oyun"],
    sabitKombinasyonlar: [
      {
        etiket: "16-24 ay · Pazartesi + Çarşamba · 10.00 - 12.00",
        slotIdler: ["pzt-1000-gelisim", "crs-1000-gelisim"],
        haftaSonu: false,
      },
      {
        etiket: "16-24 ay · Salı + Perşembe · 15.00 - 17.00",
        slotIdler: ["sali-1500-gelisim", "prs-1500-gelisim"],
        haftaSonu: false,
      },
      {
        etiket: "24-36 ay · Salı + Perşembe · 10.00 - 12.00",
        slotIdler: ["sali-1000-gelisim", "prs-1000-gelisim"],
        haftaSonu: false,
      },
      {
        etiket: "24-36 ay · Pazartesi + Çarşamba · 16.00 - 18.00",
        slotIdler: ["pzt-1600-gelisim", "crs-1600-gelisim"],
        haftaSonu: false,
      },
      {
        etiket: "24-36 ay · Cumartesi · 14.00 - 16.00",
        slotIdler: ["cmt-1400-gelisim"],
        haftaSonu: true,
      },
    ],
    notlar: [
      "Gelişim Odaklı Oyun Grubuna haftada 2 gün katılan çocuklarımıza haftada 1 İngilizce oyun grubu hediyedir.",
    ],
    ikon: "Grup",
  },
  {
    slug: "bebek",
    ad: "Bebek Oyun Grubu",
    kisaAd: "Bebek Grubu",
    ozet: "Oyunlarla Büyüyorum. Ebeveyn çocuğa eşlik eder.",
    yasEtiket: "6-24 ay",
    minAy: 6,
    maxAy: 24,
    maxKisi: 8,
    sure: "Haftada 1-2 gün · Günde 2 saat",
    ozellikler: [
      "Etkinlik süresi 2 saat",
      "6-12 ay haftanın tek günü",
      "12-24 ay haftada 2 gün",
      "12-24 ay: haftada 2 gün katılana haftada 1 İngilizce hediye",
      "Hafta sonu seçeneği",
    ],
    paketler: PAKETLER.bebek,
    sabitKombinasyonlar: [
      {
        etiket: "12-24 ay · Pazartesi + Cuma · 15.00 - 17.00",
        slotIdler: ["pzt-1500-bebek", "cuma-1500-bebek"],
        haftaSonu: false,
      },
      {
        etiket: "6-12 ay · Salı · 16.00 - 18.00",
        slotIdler: ["sali-1600-bebek"],
        haftaSonu: false,
      },
      {
        etiket: "6-12 ay · Cuma · 10.00 - 12.00",
        slotIdler: ["cuma-1000-bebek"],
        haftaSonu: false,
      },
      {
        etiket: "6-12 ay · Cumartesi · 16.00 - 18.00",
        slotIdler: ["cmt-1600-bebek"],
        haftaSonu: true,
      },
    ],
    /*
     * 10 Agustos 2026, Miray Hanim: "12-24 ay grubu icinde Ingilizce grubu
     * hediye ekleyelim."
     *
     * Not "12-24 ay" ile nitelendi, cunku Ingilizce islenen en kucuk seans
     * 12 aydan basliyor (Sarkili Masal ve Sanat Atolyesi, Ingilizce).
     * 6-12 ay bebegin kullanabilecegi Ingilizce seans YOK; nitelemesiz
     * yazilirsa 6-12 ay blogunda tutulamayacak bir soz verilmis olurdu.
     * Bu haliyle cumle her yerde dogru: 6-12 ay velisi de hakkin 12. ayda
     * basladigini okuyor.
     */
    notlar: [
      "12-24 ay gruplarında haftada 2 gün katılan çocuklarımıza haftada 1 İngilizce oyun grubu hediyedir.",
    ],
    ikon: "Bebek",
  },
  {
    slug: "ingilizce",
    ad: "İngilizce Oyun Grubu",
    kisaAd: "İngilizce Grubu",
    ozet: "Seans tamamen İngilizce işlenir.",
    yasEtiket: "24-36 ay",
    minAy: 24,
    maxAy: 36,
    maxKisi: 8,
    sure: "Haftada 2 gün · Günde 2 saat",
    ozellikler: [
      "Etkinlik süresi 2 saat",
      "Hafta içi iki ayrı günde açılır",
      "Tek katılımla da girilebilir",
    ],
    paketler: PAKETLER.ingilizce,
    sabitKombinasyonlar: [
      {
        etiket: "Pazartesi · 14.00 - 16.00",
        slotIdler: ["pzt-1400-ingilizce"],
        haftaSonu: false,
      },
      {
        etiket: "Cuma · 14.00 - 16.00",
        slotIdler: ["cuma-1400-ingilizce"],
        haftaSonu: false,
      },
    ],
    notlar: [],
    ikon: "Yildiz",
  },
];

const indeks = new Map(AILELER.map((a) => [a.slug, a]));

export function aileBul(slug: string): ProgramAilesi | undefined {
  return indeks.get(slug as ProgramAilesiSlug);
}
