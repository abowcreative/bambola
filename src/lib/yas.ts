import { SLOTLAR } from "./data/program";
import { AILELER } from "./data/gruplar";
import type { ProgramAilesi, Slot } from "./data/types";

/**
 * Yas ve uygunluk mantigi. PLAN.md Bolum 6.5.
 *
 * Bu dosya formun ve tum filtrelerin cekirdegi. Istemci ve sunucu ayni
 * fonksiyonlari kullanir; PLAN.md Bolum 7'ye gore secilen slot ile cocugun
 * yasi sunucuda TEKRAR kontrol edilir, istemci filtresine guvenilmez.
 */

/** Yas sayfalari icin sabit bantlar. PLAN.md Bolum 5, sayfa agaci. */
export const YAS_SAYFALARI = [
  { slug: "6-12-ay", ad: "6 aylık - 1 yaş", minAy: 6, maxAy: 12 },
  { slug: "12-24-ay", ad: "1 - 2 yaş", minAy: 12, maxAy: 24 },
  { slug: "24-36-ay", ad: "2 - 3 yaş", minAy: 24, maxAy: 36 },
  { slug: "3-5-yas", ad: "3-5 yaş", minAy: 36, maxAy: 71 },
] as const;

export type YasSayfasi = (typeof YAS_SAYFALARI)[number];

export function yasSayfasiBul(slug: string): YasSayfasi | undefined {
  return YAS_SAYFALARI.find((y) => y.slug === slug);
}

/**
 * Dogum tarihinden tam ay sayisi. Gun henuz gelmediyse ay sayilmaz.
 * Ornek: 2025-01-20 dogumlu cocuk 2025-03-19'da 1 aylik, 2025-03-20'de 2 aylik.
 */
export function ayHesapla(
  dogumTarihi: string | Date,
  referans: Date = new Date(),
): number {
  const d = typeof dogumTarihi === "string" ? new Date(dogumTarihi) : dogumTarihi;
  if (Number.isNaN(d.getTime())) return Number.NaN;

  let ay =
    (referans.getFullYear() - d.getFullYear()) * 12 +
    (referans.getMonth() - d.getMonth());
  if (referans.getDate() < d.getDate()) ay -= 1;
  return ay;
}

/** "19 aylık", "3 yaş 2 aylık", "2 yaşında". Ekranda velinin gordugu metin. */
export function yasMetni(ay: number): string {
  if (!Number.isFinite(ay) || ay < 0) return "";
  if (ay < 24) return `${ay} aylık`;
  const yil = Math.floor(ay / 12);
  const kalan = ay % 12;
  return kalan === 0 ? `${yil} yaşında` : `${yil} yaş ${kalan} aylık`;
}

export function slotUygunMu(slot: Slot, ay: number): boolean {
  return ay >= slot.yas.minAy && ay <= slot.yas.maxAy;
}

export function aileUygunMu(aile: ProgramAilesi, ay: number): boolean {
  return ay >= aile.minAy && ay <= aile.maxAy;
}

export function uygunSlotlar(ay: number): Slot[] {
  return SLOTLAR.filter((s) => slotUygunMu(s, ay));
}

/**
 * Cocugun yasina uygun program aileleri.
 * PLAN.md Bolum 7: uygun olmayanlar formda hic gosterilmez.
 */
export function uygunAileler(ay: number): ProgramAilesi[] {
  return AILELER.filter((a) => aileUygunMu(a, ay));
}

/** Ailenin, cocugun yasina uyan sabit kombinasyonlari. */
export function uygunKombinasyonlar(aile: ProgramAilesi, ay: number) {
  return aile.sabitKombinasyonlar.filter((k) =>
    k.slotIdler.every((id) => {
      const s = SLOTLAR.find((x) => x.id === id);
      return s ? slotUygunMu(s, ay) : false;
    }),
  );
}

/**
 * Cocuk icin tek katilimla girilebilen slotlar.
 * Serbest oyun ayri gosterildigi icin disarida birakilir.
 */
export function uygunTekSeferlikSlotlar(ay: number): Slot[] {
  return SLOTLAR.filter(
    (s) =>
      s.tekSeferMumkun &&
      s.atolyeSlug !== "serbest-oyun" &&
      slotUygunMu(s, ay),
  );
}

/**
 * Yas sayfasi bandina denk gelen slotlar ve aileler.
 *
 * DIKKAT, siniri disliyoruz: bantlar iki ucundan da kapali oldugu icin
 * komsu bantlar tek bir ayda ortusuyor (16-24 ile 24-36 hep 24'te bulusuyor).
 * Basit ortusme testi kullanilirsa /oyun-evi/yas/3-5-yas sayfasi yalniz
 * 36. ay yuzunden Gelisim Odakli Oyun Grubunu ve Ingilizce Grubunu da
 * listeler. PLAN.md Bolum 6.6 sonuc 1 bunu acikca yasakliyor:
 * 3-5 yasa yalniz uc kapi acik. O yuzden ust sinir haric tutulur.
 */
function bantKesisiyorMu(
  a: { minAy: number; maxAy: number },
  sayfa: { minAy: number; maxAy: number },
): boolean {
  return a.minAy < sayfa.maxAy && a.maxAy > sayfa.minAy;
}

export function yasBandiSlotlari(sayfa: {
  minAy: number;
  maxAy: number;
}): Slot[] {
  return SLOTLAR.filter((s) => bantKesisiyorMu(s.yas, sayfa));
}

export function yasBandiAileleri(sayfa: {
  minAy: number;
  maxAy: number;
}): ProgramAilesi[] {
  return AILELER.filter((a) => bantKesisiyorMu(a, sayfa));
}

/**
 * Dogum tarihi gecerli mi. PLAN.md Bolum 7, Dogrulama:
 * bugunden ileri olamaz, 8 yildan eski olamaz.
 */
export function dogumTarihiGecerliMi(
  tarih: string,
  referans: Date = new Date(),
): { gecerli: boolean; hata?: string } {
  const d = new Date(tarih);
  if (Number.isNaN(d.getTime())) {
    return { gecerli: false, hata: "Geçerli bir tarih girin." };
  }
  if (d.getTime() > referans.getTime()) {
    return { gecerli: false, hata: "Doğum tarihi bugünden ileri olamaz." };
  }
  const ay = ayHesapla(d, referans);
  if (ay > 96) {
    return { gecerli: false, hata: "Doğum tarihi 8 yıldan eski olamaz." };
  }
  return { gecerli: true };
}

/**
 * Cocuk hicbir gruba uymuyorsa sitede ne denecegini tek yerden belirler.
 * PLAN.md Bolum 6.6 sonuc 1: 36+ ay ve 2-4 yas bantlari kalkti, 3-5 yas
 * cocuga yalniz uc kapi aciliyor.
 */
export function uygunlukOzeti(ay: number): {
  aileSayisi: number;
  tekSeferlikSayisi: number;
  bosMu: boolean;
} {
  const aileSayisi = uygunAileler(ay).length;
  const tekSeferlikSayisi = uygunTekSeferlikSlotlar(ay).length;
  return {
    aileSayisi,
    tekSeferlikSayisi,
    bosMu: aileSayisi === 0 && tekSeferlikSayisi === 0,
  };
}
