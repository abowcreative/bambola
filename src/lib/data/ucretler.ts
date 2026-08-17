import type { PaketSecenegi, ProgramAilesiSlug } from "./types";

/**
 * Ucretler. PLAN.md Bolum 6.3'ten birebir.
 * Kaynak: kaynak/program-ABOW-v2.xlsx, FIYATLANDIRMA sayfasi.
 * On iki rakamin tamami Excel'e karsi dogrulandi, 10 Agustos 2026.
 *
 * KDV: Excel'de yazmiyor. Sitede "+ KDV" ibaresi kullanilmaz, tutarlar
 * ciplak yazilir. PLAN.md Bolum 14 madde 4.
 */

export const ERKEN_KAYIT_ORANI = 0.2;

/**
 * Kampanya penceresi. 10 Agustos 2026: musteri tarihin YAZILMASINI istedi.
 * Kurum zaten kendi afislerinde "Son gün: 1 Eylül" diyor, site ve belgelerin
 * ayni agizdan konusmasi icin tarih artik gorunur.
 * (Onceki karar "tarih yazilmaz" idi, bkz. PLAN.md Bolum 14 madde 1.)
 */
export const KAMPANYA_PENCERESI = {
  baslangic: "2026-08-10",
  /** Son gun DAHIL. Kampanya 2 Eylul 00:00'da (TR) kapanir. */
  bitis: "2026-09-01",
  siteyeYazilirMi: true,
  metin: "10 Ağustos - 1 Eylül",
  sonGun: "1 Eylül",
} as const;

/**
 * Turkiye sabit UTC+3, 2016'dan beri yaz saati uygulamiyor. Kampanya gunu
 * tarayicinin veya sunucunun saat diliminde degil, kurumun saat diliminde
 * baslayip biter; o yuzden ofset acikca yaziliyor.
 */
const trGunBasi = (isoGun: string) => Date.parse(`${isoGun}T00:00:00+03:00`);
const GUN_MS = 24 * 60 * 60 * 1000;

/**
 * Erken kayit kampanyasi SU AN acik mi.
 *
 * Bu kontrol olmadan site 1 Eylul'den sonra da indirimli fiyati gostermeye
 * ve "son gun 1 Eylul" demeye devam ediyordu: pencere verisi vardi ama
 * kimse okumuyordu. Ilan edilen fiyat parayla ilgili oldugu icin tarihin
 * elle kaldirilmasina birakilamaz.
 *
 * DIKKAT: sonuc sunucuda hesaplanir ve istemci bilesenlerine prop olarak
 * gecirilir. Istemcide ayrica hesaplanirsa, sayfa onbellekten gelirken
 * sunucu "acik" istemci "kapali" diyebilir ve hydration uyusmazligi cikar.
 */
export function kampanyaAcikMi(simdi: Date = new Date()): boolean {
  const t = simdi.getTime();
  return (
    t >= trGunBasi(KAMPANYA_PENCERESI.baslangic) &&
    t < trGunBasi(KAMPANYA_PENCERESI.bitis) + GUN_MS
  );
}

/**
 * Kampanyanin bitmesine kac GUN kaldi. Son gun dahil: 1 Eylul gunu 1 doner,
 * 31 Agustos gunu 2. Kampanya kapaliysa 0.
 *
 * "Son 3 gun" gibi bir aciliyet ifadesi buradan uretiliyor; elle yazilan
 * boyle bir sayi ertesi gun yanlis olur.
 *
 * `kampanyaAcikMi` ile ayni uyari gecerli: SUNUCUDA hesaplanip istemciye
 * prop olarak gecirilir.
 */
export function kampanyaKalanGun(simdi: Date = new Date()): number {
  if (!kampanyaAcikMi(simdi)) return 0;
  const kapanis = trGunBasi(KAMPANYA_PENCERESI.bitis) + GUN_MS;
  return Math.ceil((kapanis - simdi.getTime()) / GUN_MS);
}

/**
 * Kampanya kosullari. 10 Agustos 2026'da musteri metinlerini yeniledi,
 * asagidakiler onun verdigi son ifadelerdir.
 */
export const KAMPANYA_KOSULLARI = [
  "Kampanyadan peşin ödeme koşuluyla faydalanılır. Kredi kartı, havale ve nakit, üç ödeme yöntemi de kabul edilir.",
  "Kampanyadan en fazla 3 aylık faydalanılabilir.",
  // Firma sahibi bunun yerine su metni onerdi:
  // "4 haftalik paket alimlarinda kullanim suresi 1 aydir. Uyelerimiz
  //  haklarini 1 ay icerisinde tuketmelidir. Devamsizlik durumlarinda kayit
  //  olunan ay icerisinde telafi yapabileceklerdir."
  // Ajans tarafi asagidaki kisa halin daha iyi oldugunu soyledi, o kaldi.
  "Her programın, ödeme tarihinden itibaren 1 ay içinde tamamlanması gerekir.",
  "Hafta içi öğleden önce ve öğleden sonra iki grup açılır, uygunluk olması durumunda gruplar arasında telafi yapılabilir.",
  "Grupları küçük tutuyoruz: Okula Hazırlık Gruplarında 12, diğer bütün gruplarda 8 çocuk. Böylece her çocuk öğretmenin ilgisini görüyor.",
  "Her 12 katılımda bir çocuk değerlendirme raporu hazırlanır.",
];

/**
 * Tek seferlik atolye ucreti dile gore belirlenir.
 * 10 Agustos 2026 musteri karari: Ingilizce atolye 2.500 TL, Turkce 2.000 TL.
 * Bu, ucret sayfasindaki aile fiyatlariyla da tutarli:
 * Ingilizce Grubu tek sefer 2.500, Gelisim ve Bebek tek sefer 2.000.
 *
 * Bu karardan once atolyelerin tek sefer fiyati yoktu ve belgelerde
 * "ucreti telefonda paylasiyoruz" yaziyordu. O ifade kaldirildi.
 */
export function tekSeferUcreti(dil: "tr" | "en" | "karma"): number {
  return dil === "en" ? 2500 : 2000;
}

export const PAKETLER: Record<ProgramAilesiSlug, PaketSecenegi[]> = {
  // Okula Hazirlik: tek sefer secenegi YOK (Excel: "tek seferlik katilim yoktur").
  "okula-hazirlik": [
    { kod: "ayda-4", etiket: "Ayda 4 katılım", normal: 9000, erkenKayit: 7200 },
    { kod: "ayda-8", etiket: "Ayda 8 katılım", normal: 12000, erkenKayit: 9600 },
    {
      kod: "ayda-12",
      etiket: "Ayda 12 katılım",
      normal: 15000,
      erkenKayit: 12000,
    },
  ],
  "gelisim-odakli-oyun": [
    { kod: "tek-sefer", etiket: "Tek sefer", normal: 2000, erkenKayit: 2000 },
    { kod: "ayda-4", etiket: "Ayda 4 katılım", normal: 7000, erkenKayit: 5600 },
    { kod: "ayda-8", etiket: "Ayda 8 katılım", normal: 10000, erkenKayit: 8000 },
  ],
  bebek: [
    { kod: "tek-sefer", etiket: "Tek sefer", normal: 2000, erkenKayit: 2000 },
    { kod: "ayda-4", etiket: "Ayda 4 katılım", normal: 7000, erkenKayit: 5600 },
    { kod: "ayda-8", etiket: "Ayda 8 katılım", normal: 10000, erkenKayit: 8000 },
  ],
  ingilizce: [
    { kod: "tek-sefer", etiket: "Tek sefer", normal: 2500, erkenKayit: 2500 },
    { kod: "ayda-4", etiket: "Ayda 4 katılım", normal: 8000, erkenKayit: 6400 },
    { kod: "ayda-8", etiket: "Ayda 8 katılım", normal: 11000, erkenKayit: 8800 },
  ],
};

/**
 * Tek sefer fiyatina indirim uygulanmiyor. Excel'de indirimli satir tek sefer
 * icin ayni rakami tasiyor. Sitede tek sefer satirinda indirim rozeti
 * gosterilmez. PLAN.md Bolum 6.3.
 */
export function indirimVarMi(paket: PaketSecenegi): boolean {
  return paket.erkenKayit < paket.normal;
}

/**
 * Bu paketin indirimli fiyati SU AN gosterilir mi.
 *
 * Iki ayri kosul: paketin indirimi olmasi (veri) ve kampanyanin acik olmasi
 * (takvim). `indirimVarMi` yalniz birincisini biliyor, ekranda fiyat basan
 * her yer bunu kullanmali.
 *
 * `kampanyaAcik` disaridan geliyor cunku sunucuda bir kez hesaplanip
 * istemciye tasiniyor; bkz. kampanyaAcikMi.
 */
export function erkenKayitGosterilirMi(
  paket: PaketSecenegi,
  kampanyaAcik: boolean,
): boolean {
  return kampanyaAcik && indirimVarMi(paket);
}

/** Bir paketin su an gecerli olan fiyati. */
export function gecerliFiyat(
  paket: PaketSecenegi,
  kampanyaAcik: boolean,
): number {
  return erkenKayitGosterilirMi(paket, kampanyaAcik)
    ? paket.erkenKayit
    : paket.normal;
}

export function indirimYuzdesi(paket: PaketSecenegi): number {
  if (!indirimVarMi(paket)) return 0;
  return Math.round((1 - paket.erkenKayit / paket.normal) * 100);
}

const TL = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

export function tlYaz(kurus: number): string {
  return TL.format(kurus);
}

/**
 * Sunucu tarafi fiyat hesabi. PLAN.md Bolum 9 madde 4:
 * fiyat istemciden gelmez, her zaman bu tablodan hesaplanir.
 */
export function paketBul(
  ailesi: ProgramAilesiSlug,
  kod: string,
): PaketSecenegi | undefined {
  return PAKETLER[ailesi]?.find((p) => p.kod === kod);
}
