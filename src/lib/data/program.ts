import type { Slot, YasAraligi, Gun } from "./types";

/**
 * Haftalik program. PLAN.md Bolum 6.1'den birebir.
 * Kaynak: kaynak/program-ABOW-v2.xlsx, PROGRAM sayfasi.
 * Excel'e karsi hucre hucre dogrulandi, 10 Agustos 2026.
 *
 * Genel kurallar (Excel'den):
 * - Ilk bir saat serbest oyundur.
 * - Ogle arasi her gun 12.30 - 13.30.
 * - Grup mevcudu en fazla 12 kisi.
 * - Ara ogun verilir.
 * - Cumartesi grup programi yoktur.
 */

/** Yas bantlari tek yerden gelir, boylece filtre her sayfada ayni davranir. */
export const YAS: Record<string, YasAraligi> = {
  bebek6_12: { minAy: 6, maxAy: 12, etiket: "6-12 ay", ebeveynsiz: false },
  bebek12_24: { minAy: 12, maxAy: 24, etiket: "12-24 ay", ebeveynsiz: false },
  yuruyen16_24: { minAy: 16, maxAy: 24, etiket: "16-24 ay", ebeveynsiz: false },
  yuruyen24_36: { minAy: 24, maxAy: 36, etiket: "24-36 ay", ebeveynsiz: false },
  okulOncesi30: {
    minAy: 30,
    maxAy: 72,
    etiket: "30+ ay",
    ebeveynsiz: true,
  },
  okulOncesi30Ebeveynli: {
    minAy: 30,
    maxAy: 72,
    etiket: "30+ ay",
    ebeveynsiz: false,
  },
  buyuk3_5: { minAy: 36, maxAy: 71, etiket: "3-5 yaş", ebeveynsiz: false },
  buyuk3_5Ebeveynsiz: {
    minAy: 36,
    maxAy: 71,
    etiket: "3-5 yaş",
    ebeveynsiz: true,
  },
};

export const OGLE_ARASI = { bas: "12.30", bit: "13.30" } as const;

export const SLOTLAR: Slot[] = [
  // ---------------------------------------------------------------- Pazartesi
  {
    id: "pzt-0930-okula-hazirlik",
    gun: "pazartesi",
    bas: "09.30",
    bit: "12.30",
    atolyeSlug: "okula-hazirlik-grubu",
    yas: YAS.okulOncesi30,
    dil: "karma",
    ogretmenler: ["Emine", "Burcu"],
    tekSeferMumkun: false,
  },
  {
    id: "pzt-1000-gelisim",
    gun: "pazartesi",
    bas: "10.00",
    bit: "12.00",
    atolyeSlug: "gelisim-odakli-oyun-grubu",
    yas: YAS.yuruyen16_24,
    dil: "tr",
    ogretmenler: ["Dilara"],
    tekSeferMumkun: false,
  },
  {
    id: "pzt-1400-ingilizce",
    gun: "pazartesi",
    bas: "14.00",
    bit: "16.00",
    atolyeSlug: "ingilizce-oyun-grubu",
    yas: YAS.yuruyen24_36,
    dil: "en",
    ogretmenler: ["Burcu", "Emine"],
    tekSeferMumkun: true,
  },
  {
    id: "pzt-1500-bebek",
    gun: "pazartesi",
    bas: "15.00",
    bit: "17.00",
    atolyeSlug: "bebek-oyun-grubu",
    yas: YAS.bebek12_24,
    dil: "tr",
    ogretmenler: ["Dilara"],
    tekSeferMumkun: false,
  },
  {
    id: "pzt-1600-gelisim",
    gun: "pazartesi",
    bas: "16.00",
    bit: "18.00",
    atolyeSlug: "gelisim-odakli-oyun-grubu",
    yas: YAS.yuruyen24_36,
    dil: "tr",
    ogretmenler: ["Dilara"],
    tekSeferMumkun: false,
  },

  // --------------------------------------------------------------------- Sali
  {
    id: "sali-0930-okula-hazirlik",
    gun: "sali",
    bas: "09.30",
    bit: "12.30",
    atolyeSlug: "okula-hazirlik-grubu",
    yas: YAS.okulOncesi30,
    dil: "karma",
    ogretmenler: ["Dilara", "Burcu"],
    tekSeferMumkun: false,
  },
  {
    id: "sali-1000-gelisim",
    gun: "sali",
    bas: "10.00",
    bit: "12.00",
    atolyeSlug: "gelisim-odakli-oyun-grubu",
    yas: YAS.yuruyen24_36,
    dil: "tr",
    ogretmenler: ["Emine"],
    tekSeferMumkun: false,
  },
  {
    id: "sali-1400-matematik",
    gun: "sali",
    bas: "14.00",
    bit: "16.00",
    atolyeSlug: "oyunlarla-matematik-atolyesi",
    yas: YAS.buyuk3_5Ebeveynsiz,
    dil: "en",
    ogretmenler: ["Emine", "Burcu"],
    tekSeferMumkun: true,
  },
  {
    id: "sali-1500-gelisim",
    gun: "sali",
    bas: "15.00",
    bit: "17.00",
    atolyeSlug: "gelisim-odakli-oyun-grubu",
    yas: YAS.yuruyen16_24,
    dil: "tr",
    ogretmenler: ["Dilara"],
    tekSeferMumkun: false,
  },
  {
    id: "sali-1600-bebek",
    gun: "sali",
    bas: "16.00",
    bit: "18.00",
    atolyeSlug: "bebek-oyun-grubu",
    yas: YAS.bebek6_12,
    dil: "tr",
    ogretmenler: ["Emine"],
    tekSeferMumkun: false,
  },

  // ----------------------------------------------------------------- Carsamba
  {
    id: "crs-0930-okula-hazirlik",
    gun: "carsamba",
    bas: "09.30",
    bit: "12.30",
    atolyeSlug: "okula-hazirlik-grubu",
    yas: YAS.okulOncesi30,
    dil: "karma",
    ogretmenler: ["Dilara", "Burcu"],
    tekSeferMumkun: false,
  },
  {
    id: "crs-1000-gelisim",
    gun: "carsamba",
    bas: "10.00",
    bit: "12.00",
    atolyeSlug: "gelisim-odakli-oyun-grubu",
    yas: YAS.yuruyen16_24,
    dil: "tr",
    ogretmenler: ["Emine"],
    tekSeferMumkun: false,
  },
  {
    id: "crs-1400-sarkili-masal",
    gun: "carsamba",
    bas: "14.00",
    bit: "16.00",
    atolyeSlug: "sarkili-masal-ve-sanat-atolyesi",
    yas: YAS.bebek12_24,
    dil: "en",
    ogretmenler: ["Emine", "Burcu"],
    tekSeferMumkun: true,
  },
  {
    id: "crs-1430-okula-hazirlik",
    gun: "carsamba",
    bas: "14.30",
    bit: "17.30",
    atolyeSlug: "okula-hazirlik-grubu",
    yas: YAS.okulOncesi30,
    dil: "karma",
    ogretmenler: ["Dilara", "Burcu"],
    tekSeferMumkun: false,
  },
  {
    id: "crs-1600-gelisim",
    gun: "carsamba",
    bas: "16.00",
    bit: "18.00",
    atolyeSlug: "gelisim-odakli-oyun-grubu",
    yas: YAS.yuruyen24_36,
    dil: "tr",
    ogretmenler: ["Emine"],
    tekSeferMumkun: false,
  },

  // ----------------------------------------------------------------- Persembe
  {
    id: "prs-1000-gelisim",
    gun: "persembe",
    bas: "10.00",
    bit: "12.00",
    atolyeSlug: "gelisim-odakli-oyun-grubu",
    yas: YAS.yuruyen24_36,
    dil: "tr",
    ogretmenler: ["Dilara"],
    tekSeferMumkun: false,
  },
  {
    id: "prs-1000-sarkili-masal",
    gun: "persembe",
    bas: "10.00",
    bit: "12.00",
    atolyeSlug: "sarkili-masal-ve-sanat-atolyesi",
    yas: YAS.bebek6_12,
    dil: "tr",
    ogretmenler: ["Emine"],
    tekSeferMumkun: true,
  },
  {
    id: "prs-1400-sarkili-masal",
    gun: "persembe",
    bas: "14.00",
    bit: "16.00",
    atolyeSlug: "sarkili-masal-ve-sanat-atolyesi",
    yas: YAS.yuruyen24_36,
    dil: "en",
    ogretmenler: ["Emine", "Burcu"],
    tekSeferMumkun: true,
  },
  {
    id: "prs-1430-okula-hazirlik",
    gun: "persembe",
    bas: "14.30",
    bit: "17.30",
    atolyeSlug: "okula-hazirlik-grubu",
    yas: YAS.okulOncesi30,
    dil: "karma",
    ogretmenler: ["Dilara", "Burcu"],
    tekSeferMumkun: false,
  },
  {
    id: "prs-1500-gelisim",
    gun: "persembe",
    bas: "15.00",
    bit: "17.00",
    atolyeSlug: "gelisim-odakli-oyun-grubu",
    yas: YAS.yuruyen16_24,
    dil: "tr",
    ogretmenler: ["Emine"],
    tekSeferMumkun: false,
  },

  // --------------------------------------------------------------------- Cuma
  {
    id: "cuma-1000-bebek",
    gun: "cuma",
    bas: "10.00",
    bit: "12.00",
    atolyeSlug: "bebek-oyun-grubu",
    yas: YAS.bebek6_12,
    dil: "tr",
    ogretmenler: ["Dilara"],
    tekSeferMumkun: false,
  },
  {
    id: "cuma-1000-minik-beyinler",
    gun: "cuma",
    bas: "10.00",
    bit: "12.00",
    atolyeSlug: "minik-beyinler-laboratuvari",
    yas: YAS.buyuk3_5,
    dil: "tr",
    ogretmenler: ["Emine"],
    tekSeferMumkun: true,
  },
  {
    id: "cuma-1400-ingilizce",
    gun: "cuma",
    bas: "14.00",
    bit: "16.00",
    atolyeSlug: "ingilizce-oyun-grubu",
    yas: YAS.yuruyen24_36,
    dil: "en",
    ogretmenler: ["Emine", "Burcu"],
    tekSeferMumkun: true,
  },
  {
    id: "cuma-1430-okula-hazirlik",
    gun: "cuma",
    bas: "14.30",
    bit: "17.30",
    atolyeSlug: "okula-hazirlik-grubu",
    yas: YAS.okulOncesi30,
    dil: "karma",
    ogretmenler: ["Emine", "Burcu"],
    tekSeferMumkun: false,
  },
  {
    id: "cuma-1500-bebek",
    gun: "cuma",
    bas: "15.00",
    bit: "17.00",
    atolyeSlug: "bebek-oyun-grubu",
    yas: YAS.bebek12_24,
    dil: "tr",
    ogretmenler: ["Dilara"],
    tekSeferMumkun: false,
  },

  // --------------------------------------------------------------- Cumartesi
  // 10 Agustos 2026 patron karari: Pazar grubu kaldirildi, butun Pazar
  // slotlari ayni saatlerle Cumartesi.ye tasindi.
  {
    id: "cmt-1000-sarkili-masal",
    gun: "cumartesi",
    bas: "10.00",
    bit: "12.00",
    atolyeSlug: "sarkili-masal-ve-sanat-atolyesi",
    yas: YAS.bebek12_24,
    dil: "en",
    ogretmenler: ["Emine", "Burcu"],
    tekSeferMumkun: true,
  },
  {
    id: "cmt-1200-matematik",
    gun: "cumartesi",
    bas: "12.00",
    bit: "14.00",
    atolyeSlug: "oyunlarla-matematik-atolyesi",
    yas: YAS.buyuk3_5,
    dil: "en",
    ogretmenler: ["Emine", "Burcu"],
    tekSeferMumkun: true,
  },
  {
    // Excel N18: 24-36 ay sabit oyun grubunun hafta sonu secenegi.
    id: "cmt-1400-gelisim",
    gun: "cumartesi",
    bas: "14.00",
    bit: "16.00",
    atolyeSlug: "gelisim-odakli-oyun-grubu",
    yas: YAS.yuruyen24_36,
    dil: "tr",
    ogretmenler: ["Dilara"],
    tekSeferMumkun: false,
  },
  {
    // Excel O18: 6-12 ay grubunun hafta sonu secenegi.
    id: "cmt-1600-bebek",
    gun: "cumartesi",
    bas: "16.00",
    bit: "18.00",
    atolyeSlug: "bebek-oyun-grubu",
    yas: YAS.bebek6_12,
    dil: "tr",
    ogretmenler: ["Dilara"],
    tekSeferMumkun: false,
  },
  {
    id: "cmt-1800-serbest-oyun",
    gun: "cumartesi",
    bas: "18.00",
    bit: "19.00",
    atolyeSlug: "serbest-oyun",
    yas: YAS.okulOncesi30Ebeveynli,
    dil: "tr",
    ogretmenler: [],
    tekSeferMumkun: true,
  },
];

/**
 * Pazar. 10 Agustos 2026 patron karari: Pazar grubu yok. Excel'de Pazar'a
 * yazilmis olan bes slotun tamami ayni saatlerle Cumartesi'ye tasindi.
 * Kurum Pazar gunu kapali.
 *
 * Excel bu degisikligi tasimiyor, kaynak dosya guncellenmeden once burasi
 * degistirildi. Excel yenilenirse once bu not okunmali.
 */
export const PAZAR_NOTU = "Pazar günü grup programı yoktur.";

export const PROGRAM_NOTLARI = [
  "İlk bir saat serbest oyundur.",
  "Öğle arası her gün 12.30 - 13.30.",
  "Okula Hazırlık Gruplarında en fazla 12 çocuk, diğer gruplarda en fazla 8 çocuk bulunur.",
  "Ara öğün verilir.",
  "Hafta içi öğleden önce ve öğleden sonra iki grup açılır, uygunluk olması durumunda gruplar arasında telafi yapılabilir.",
  "Hafta sonu belirlenen zaman diliminde 1 saat serbest oyun ücretsizdir.",
];

// --------------------------------------------------------------- yardimcilar

const slotIndeksi = new Map(SLOTLAR.map((s) => [s.id, s]));

export function slotBul(id: string): Slot | undefined {
  return slotIndeksi.get(id);
}

export function gunSlotlari(gun: Gun): Slot[] {
  return SLOTLAR.filter((s) => s.gun === gun).sort((a, b) =>
    a.bas.localeCompare(b.bas),
  );
}

/** Tek katilimla girilebilen slotlar (PLAN.md Bolum 6.2 tablo C). */
export function tekSeferlikSlotlar(): Slot[] {
  return SLOTLAR.filter(
    (s) => s.tekSeferMumkun && s.atolyeSlug !== "serbest-oyun",
  );
}

/** "09.30" -> 570 (dakika). Siralama ve schema uretimi icin. */
export function saatiDakikaya(saat: string): number {
  const [s, d] = saat.split(".").map(Number);
  return s * 60 + d;
}

/** "09.30" -> "09:30". schema.org ve <time> icin. */
export function saatIso(saat: string): string {
  return saat.replace(".", ":");
}
