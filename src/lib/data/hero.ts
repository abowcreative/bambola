import { SLOTLAR } from "./program";

/**
 * Ana sayfa hero'sunda kendi kendine donen uc slayt.
 *
 * Kurum karari, 12 Eylul 2026: hero tek bir marka cumlesi yerine uc grubu
 * sirayla one cikarsin. Sira da kurumdan geldi:
 *   1. Cumartesi 13.30 bebek grubu (yeni grup)
 *   2. Okula Hazirlik Gruplari
 *   3. Ingilizce Oyun Gruplari
 *
 * SAATLER ELLE YAZILMIYOR. Program verisinden okunuyor; seans saati
 * degistiginde hero sessizce eskimesin. Slot bulunamazsa uretim aninda
 * patlar, cunku yanlis saat ilan eden bir hero, hic hero olmamasindan
 * kotudur.
 *
 * BASLIK UC PARCALI: ortadaki kelime hero'daki alti cizili vurguyu
 * aliyor. Tek dize olsaydi vurgunun nerede bitecegini bilemezdik.
 */

export type HeroSlayti = {
  slug: string;
  /** Basligin ustundeki kucuk rozet. */
  etiket: string;
  baslikOnce: string;
  /** Alti cizili kelime. */
  baslikVurgu: string;
  baslikSonra: string;
  aciklama: string;
  href: string;
  buton: string;
  ikon: string;
};

/** "13.30 - 15.30". Slot yoksa uretim durur. */
function saatAraligi(id: string): string {
  const s = SLOTLAR.find((x) => x.id === id);
  if (!s) throw new Error(`Hero slaytinda bulunamayan slot: ${id}`);
  return `${s.bas} - ${s.bit}`;
}

export const HERO_SLAYTLARI: HeroSlayti[] = [
  {
    slug: "cumartesi-bebek",
    etiket: "Yeni grup",
    baslikOnce: "Hafta sonu da",
    baslikVurgu: "bebek grubu",
    baslikSonra: "var",
    aciklama: `8-16 ay, ebeveyn eşliğinde iki saat. Cumartesi ${saatAraligi(
      "cmt-1330-bebek",
    )}, en fazla 8 bebek.`,
    href: "/oyun-evi/programlar/bebek-oyun-grubu",
    buton: "Bebek grubunu incele",
    ikon: "Bebek",
  },
  {
    slug: "okula-hazirlik",
    etiket: "2,5 yaş ve üzeri",
    /* Vurgu iki kelime: baslik virgulsuz kurulsun diye "Adim adim" one
       alindi. Sablon vurgudan sonra bosluk koyuyor, virgul araya girmiyor. */
    baslikOnce: "Adım adım",
    baslikVurgu: "okula hazırlık",
    baslikSonra: "",
    aciklama:
      "Haftada 3 gün, günde 3 saat. Güvenli ayrılma, her gün 1 saat İngilizce ve 1 saat Türkçe atölye, ara öğün.",
    href: "/oyun-evi/programlar/okula-hazirlik-grubu",
    buton: "Programı incele",
    ikon: "Ampul",
  },
  {
    slug: "ingilizce",
    etiket: "1 - 3 yaş",
    baslikOnce: "",
    baslikVurgu: "İngilizce",
    baslikSonra: "baştan sona oyunla",
    aciklama:
      "Seans tamamen İngilizce işlenir: şarkı, masal, sanat, hareket ve oyun. Tek katılımla da girilebilir.",
    href: "/oyun-evi/programlar/ingilizce-oyun-grubu",
    buton: "İngilizce grubunu incele",
    ikon: "Yildiz",
  },
];
