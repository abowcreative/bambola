import type { Slot, YasAraligi, Gun } from "./types";

/**
 * Haftalik program.
 *
 * Kaynak: kurumdan gelen haftalik kontenjan listesi, 9 Eylul 2026.
 * Bu liste kaynak/program-ABOW-v2.xlsx'in yerini ALDI; Excel'den gelen
 * onceki slot tablosu tamamen kaldirildi. Excel yenilenirse once bu not
 * okunmali, iki kaynak artik ayni seyi soylemiyor.
 *
 * Listeyle gelen yenilikler:
 * - Her slotun bir kontenjan durumu var (acik / son1 / dolu).
 * - Cumartesi artik grup programi tasiyor.
 * - Yas etiketleri listedeki gibi AY olarak yaziliyor (musteri karari,
 *   9 Eylul 2026). 17 Agustos 2026'nin "yas yazalim" karari bu tablo
 *   icin geride birakildi; aile ve atolye sayfalarindaki yas ifadeleri
 *   degismedi.
 *
 * Listede olmayan atolyeler (Oyunlarla Matematik, Minik Beyinler
 * Laboratuvari, Cumartesi serbest oyun saati) takvimden cikti; tanitim
 * sayfalari duruyor (musteri karari, 9 Eylul 2026). Sarkili Masal ve Sanat
 * Atolyesi 12 Eylul 2026'da bir program olmaktan tamamen cikti, icerigi
 * Ingilizce Oyun Grubuna girdi.
 *
 * 12 EYLUL 2026 EKLERI (kurum bildirimi, 9 Eylul listesinin USTUNE):
 * - Carsamba 15.00 seansi 12-16 Ay Gelisim Odakli Bebek Oyun Grubu oldu.
 * - Cuma 13.30 - 15.30 / 24-36 ay Ingilizce Oyun Grubu eklendi.
 *
 * Ogretmen adlari listede yok. Gunu, saati VE atolyesi eski bir slotla
 * birebir tutan slotlarda eski ogretmen korundu; kalanlar ogretmensiz.
 * Ogretmen, calisan bir insanin takvimi hakkinda bir iddia oldugu icin
 * yalnizca ayni seans oldugu kesin olan yerlere tasindi.
 *
 * Genel kurallar:
 * - Atolye ve serbest oyun sirasi GRUBA GORE degisir. "Ilk bir saat serbest
 *   oyundur" ifadesi 12 Eylul 2026'da kaldirildi: 6-12 ay ve 12-16 ay
 *   icerikleri gunu "1 saat atolye + 1 saat serbest oyun" diye anlatiyor,
 *   yani sira sabit degil. Site genelinde tek dogru ifade asagidaki
 *   PROGRAM_NOTLARI[0] cumlesidir.
 * - Ogle arasi her gun 12.30 - 13.30.
 * - Ara ogun yalniz Okula Hazirlik Gruplarinda verilir.
 * - Ayni saatte iki grup gorunmesi HATA DEGIL: bir grup atolyedeyken oteki
 *   serbest oyun alanini kullanir (kurum aciklamasi, 12 Eylul 2026).
 */

/** Yas bantlari tek yerden gelir, boylece filtre her sayfada ayni davranir. */
export const YAS: Record<string, YasAraligi> = {
  bebek6_12: { minAy: 6, maxAy: 12, etiket: "6-12 ay", ebeveynsiz: false },
  bebek8_16: { minAy: 8, maxAy: 16, etiket: "8-16 ay", ebeveynsiz: false },
  bebek12_16: { minAy: 12, maxAy: 16, etiket: "12-16 ay", ebeveynsiz: false },
  bebek12_24: { minAy: 12, maxAy: 24, etiket: "12-24 ay", ebeveynsiz: false },
  yuruyen16_24: { minAy: 16, maxAy: 24, etiket: "16-24 ay", ebeveynsiz: false },
  yuruyen24_36: { minAy: 24, maxAy: 36, etiket: "24-36 ay", ebeveynsiz: false },
  /** Okula Hazirlik, ebeveynsiz. Ust sinir 71 ay: okula baslayana kadar. */
  okulOncesi30: { minAy: 30, maxAy: 71, etiket: "30+ ay", ebeveynsiz: true },
  okulOncesi40: { minAy: 40, maxAy: 71, etiket: "40+ ay", ebeveynsiz: true },
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
    durum: "acik",
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
    durum: "dolu",
  },
  {
    id: "pzt-1430-okula-hazirlik",
    gun: "pazartesi",
    bas: "14.30",
    bit: "17.30",
    atolyeSlug: "okula-hazirlik-grubu",
    yas: YAS.okulOncesi30,
    dil: "karma",
    ogretmenler: [],
    tekSeferMumkun: false,
    durum: "acik",
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
    durum: "son1",
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
    durum: "acik",
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
    durum: "acik",
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
    durum: "dolu",
  },
  {
    /* 12 Eylul 2026: 6-12 ay kendi sayfasina ayrildi, seans oraya bagli. */
    id: "sali-1400-bebek",
    gun: "sali",
    bas: "14.00",
    bit: "16.00",
    atolyeSlug: "bebek-grubu-6-12",
    yas: YAS.bebek6_12,
    dil: "tr",
    ogretmenler: [],
    tekSeferMumkun: false,
    durum: "acik",
  },
  {
    id: "sali-1430-okula-hazirlik",
    gun: "sali",
    bas: "14.30",
    bit: "17.30",
    atolyeSlug: "okula-hazirlik-grubu",
    yas: YAS.okulOncesi30,
    dil: "karma",
    ogretmenler: [],
    tekSeferMumkun: false,
    durum: "acik",
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
    durum: "dolu",
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
    durum: "acik",
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
    durum: "dolu",
  },
  {
    // Yas bandi 30+ aydan 40+ aya cikti (9 Eylul 2026 listesi).
    id: "crs-1430-okula-hazirlik",
    gun: "carsamba",
    bas: "14.30",
    bit: "17.30",
    atolyeSlug: "okula-hazirlik-grubu",
    yas: YAS.okulOncesi40,
    dil: "karma",
    ogretmenler: ["Dilara", "Burcu"],
    tekSeferMumkun: false,
    durum: "acik",
  },
  {
    /*
      12 Eylul 2026: bu seans "12-24 Ay Bebek Oyun Grubu" iken
      "12-16 Ay Gelisim Odakli Bebek Oyun Grubu" oldu (kurum bildirimi).
      Yas bandi da 12-24'ten 12-16'ya daraldi.

      ID DEGISMEDI. "bebek" eki artik atolye adini degil, kimligi tasiyor;
      id kayit kayitlarinda ve sosyal post betiginde gecmis veri olarak
      duruyor, yeniden adlandirilirsa eski basvurular eslesmez.

      10 Eylul postu bu saati 12-24 ay diye duyurmustu (bkz.
      scripts/sosyal-post.ts). Yeni bildirim onun yerine gecti; o post
      yeniden uretilirse yas satiri buradan gelir.
    */
    id: "crs-1500-bebek",
    gun: "carsamba",
    bas: "15.00",
    bit: "17.00",
    atolyeSlug: "gelisim-odakli-bebek-oyun-grubu",
    yas: YAS.bebek12_16,
    dil: "tr",
    ogretmenler: [],
    tekSeferMumkun: false,
    durum: "acik",
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
    durum: "acik",
  },

  // ----------------------------------------------------------------- Persembe
  {
    id: "prs-0930-okula-hazirlik",
    gun: "persembe",
    bas: "09.30",
    bit: "12.30",
    atolyeSlug: "okula-hazirlik-grubu",
    yas: YAS.okulOncesi30,
    dil: "karma",
    ogretmenler: [],
    tekSeferMumkun: false,
    durum: "acik",
  },
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
    durum: "dolu",
  },
  {
    /*
      Ayni gun, ayni saat, ayni atolye ama baska yas bandi. Id'de yas var,
      cunku "prs-1000-gelisim" yukaridaki 24-36 grubunun kimligi ve kayit
      formundaki sabit kombinasyon ona bagli.
    */
    id: "prs-1000-gelisim-16-24",
    gun: "persembe",
    bas: "10.00",
    bit: "12.00",
    atolyeSlug: "gelisim-odakli-oyun-grubu",
    yas: YAS.yuruyen16_24,
    dil: "tr",
    ogretmenler: [],
    tekSeferMumkun: false,
    durum: "acik",
  },
  {
    id: "prs-1400-ingilizce",
    gun: "persembe",
    bas: "14.00",
    bit: "16.00",
    atolyeSlug: "ingilizce-oyun-grubu",
    yas: YAS.bebek12_24,
    dil: "en",
    ogretmenler: [],
    tekSeferMumkun: true,
    durum: "acik",
  },
  {
    // Yas bandi 30+ aydan 40+ aya cikti (9 Eylul 2026 listesi).
    id: "prs-1430-okula-hazirlik",
    gun: "persembe",
    bas: "14.30",
    bit: "17.30",
    atolyeSlug: "okula-hazirlik-grubu",
    yas: YAS.okulOncesi40,
    dil: "karma",
    ogretmenler: ["Dilara", "Burcu"],
    tekSeferMumkun: false,
    durum: "acik",
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
    durum: "dolu",
  },

  // --------------------------------------------------------------------- Cuma
  {
    id: "cuma-0930-okula-hazirlik",
    gun: "cuma",
    bas: "09.30",
    bit: "12.30",
    atolyeSlug: "okula-hazirlik-grubu",
    yas: YAS.okulOncesi30,
    dil: "karma",
    ogretmenler: [],
    tekSeferMumkun: false,
    durum: "acik",
  },
  {
    id: "cuma-1000-ingilizce",
    gun: "cuma",
    bas: "10.00",
    bit: "12.00",
    atolyeSlug: "ingilizce-oyun-grubu",
    yas: YAS.yuruyen16_24,
    dil: "en",
    ogretmenler: [],
    tekSeferMumkun: true,
    durum: "dolu",
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
    durum: "acik",
  },
  {
    /*
      12 Eylul 2026 kurum bildirimiyle EKLENDI; 9 Eylul listesinde yoktu.
      Ayni saat araliginda Cuma 14.30 Okula Hazirlik seansi da var; bu bir
      cakisma degil, bkz. dosya basindaki not.
    */
    id: "cuma-1330-ingilizce",
    gun: "cuma",
    bas: "13.30",
    bit: "15.30",
    atolyeSlug: "ingilizce-oyun-grubu",
    yas: YAS.yuruyen24_36,
    dil: "en",
    ogretmenler: [],
    tekSeferMumkun: true,
    durum: "acik",
  },
  {
    /*
      Tek 2 saatlik Okula Hazirlik seansi; digerlerinin hepsi 3 saat.
      Kurum listesi boyle verdi, oldugu gibi duruyor.
    */
    id: "cuma-1500-okula-hazirlik",
    gun: "cuma",
    bas: "15.00",
    bit: "17.00",
    atolyeSlug: "okula-hazirlik-grubu",
    yas: YAS.okulOncesi40,
    dil: "karma",
    ogretmenler: [],
    tekSeferMumkun: false,
    durum: "son1",
  },

  // ---------------------------------------------------------------- Cumartesi
  {
    id: "cmt-0930-ingilizce",
    gun: "cumartesi",
    bas: "09.30",
    bit: "11.30",
    atolyeSlug: "ingilizce-oyun-grubu",
    yas: YAS.yuruyen24_36,
    dil: "en",
    ogretmenler: [],
    tekSeferMumkun: true,
    durum: "acik",
  },
  {
    id: "cmt-1000-ingilizce",
    gun: "cumartesi",
    bas: "10.00",
    bit: "12.00",
    atolyeSlug: "ingilizce-oyun-grubu",
    yas: YAS.yuruyen16_24,
    dil: "en",
    ogretmenler: [],
    tekSeferMumkun: true,
    durum: "dolu",
  },
  {
    id: "cmt-1030-gelisim",
    gun: "cumartesi",
    bas: "10.30",
    bit: "12.30",
    atolyeSlug: "gelisim-odakli-oyun-grubu",
    yas: YAS.yuruyen24_36,
    dil: "tr",
    ogretmenler: [],
    tekSeferMumkun: false,
    durum: "acik",
  },
  {
    id: "cmt-1330-bebek",
    gun: "cumartesi",
    bas: "13.30",
    bit: "15.30",
    atolyeSlug: "bebek-oyun-grubu",
    yas: YAS.bebek8_16,
    dil: "tr",
    ogretmenler: [],
    tekSeferMumkun: false,
    durum: "acik",
  },
  {
    id: "cmt-1500-bebek",
    gun: "cumartesi",
    bas: "15.00",
    bit: "17.00",
    atolyeSlug: "bebek-oyun-grubu",
    yas: YAS.bebek12_24,
    dil: "tr",
    ogretmenler: [],
    tekSeferMumkun: false,
    durum: "acik",
  },
];

/**
 * Pazar. 10 Agustos 2026 patron karari: Pazar grubu yok, kurum kapali.
 * 9 Eylul 2026 listesi de Pazar'a hicbir seans yazmiyor.
 */
export const PAZAR_NOTU =
  "Pazar günü grup programı yoktur. Özel etkinlikler ve doğum günü partileri rezervasyonla yapılır.";

export const PROGRAM_NOTLARI = [
  /*
    ESKI CUMLE: "Ilk bir saat serbest oyundur." 12 Eylul 2026'da kaldirildi.
    Kurumdan gelen 6-12 ay ve 12-16 ay icerikleri gunu "1 saat atolye +
    1 saat serbest oyun" diye anlatiyor; sira gruba gore degisiyor, sabit
    degil. Site genelinde "ilk saat mutlaka serbest oyun" denemez.
  */
  "İki saatlik oyun gruplarında atölye ve serbest oyun akışı, grubun programına ve eş zamanlı grupların alan kullanımına göre planlanır.",
  /*
    Takvimde birbirine yakin saatlerde iki grup gorunuyor. Veli bunu bir
    tablo hatasi sanmasin diye aciklama takvimin yaninda duruyor.
  */
  "Aynı saatlerde birden fazla grup görebilirsiniz: bir grup atölyedeyken diğeri serbest oyun alanını kullanır, gruplar karışmaz.",
  "Öğle arası her gün 12.30 - 13.30.",
  "Grupları küçük tutuyoruz: Okula Hazırlık Gruplarında 12, diğer gruplarda 8 çocuk.",
  "Ara öğün yalnızca Okula Hazırlık Gruplarında verilir.",
  "Hafta içi öğleden önce ve öğleden sonra iki grup açılır, uygunluk olması durumunda gruplar arasında telafi yapılabilir.",
  "Kayıtlı çocuklara hafta sonu belirlenen zaman diliminde 1 saat serbest oyun ücretsizdir.",
  /*
    MUSTERI ISTEGI, 17 Agustos 2026: "hafta sonu programini opsiyonel bir
    yorum yazalim degisebilir". Hafta sonu seanslari kesin bir taahhut
    olarak okunmasin.
  */
  "Hafta sonu grupları opsiyoneldir; talebe göre değişebilir.",
  "Kontenjan bilgisi haftalık güncellenir. Dolu görünen bir grup için de yazın, sıraya alalım.",
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

/**
 * Slot kayida kapali mi. Tek karar noktasi: takvimdeki kayit dugmesi, kayit
 * formundaki secim kartlari ve sunucu dogrulamasi ayni cevabi kullanir.
 */
export function slotDoluMu(slot: Slot): boolean {
  return slot.durum === "dolu";
}

/** Icindeki bir slot bile doluysa o kombinasyon secilemez. */
export function kombinasyonDoluMu(slotIdler: string[]): boolean {
  return slotIdler.some((id) => {
    const s = slotBul(id);
    return s ? slotDoluMu(s) : false;
  });
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
