/**
 * Musteriye gonderilecek fiyat listesini uretir.
 * Calistirma: npx tsx scripts/fiyat-pdf.ts
 *
 * Iki surum cikar:
 *   docs/fiyat-listesi-grup.html   gruba gore
 *   docs/fiyat-listesi-yas.html    yasa gore
 *
 * Rakamlar lib/data'dan okunur, elle yazilmaz. Fiyat degisirse
 * ucretler.ts guncellenir ve bu betik tekrar calistirilir.
 *
 * Tasarim dili kurumun kendi afislerinden alindi: krem zemin, yesil organik
 * bicimler, kehribar vurgu, yuvarlak agir baslik, altta yesil iletisim seridi.
 */

import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { AILELER } from "../src/lib/data/gruplar";
import { SLOTLAR } from "../src/lib/data/program";
import { atolyeBul } from "../src/lib/data/atolyeler";
import {
  KAMPANYA_KOSULLARI,
  KAMPANYA_PENCERESI,
  indirimVarMi,
  tekSeferUcreti,
} from "../src/lib/data/ucretler";
import { GUN_ADI } from "../src/lib/data/types";
import { ILETISIM, MARKA, MEB_IFADESI } from "../src/lib/site";
import type { Dil, ProgramAilesi } from "../src/lib/data/types";

const tl = (n: number) => n.toLocaleString("tr-TR");
const kacis = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Atolye ikonlari. Sitedeki monoline ikon setiyle ayni cizgi dili:
 * sabit kalinlik, yuvarlak uclar, kontursuz. Musteri "atolyelere gorsel
 * ekleyebiliriz" dedi; fotograf gelene kadar ikon kullaniyoruz.
 */
const IKON_YOL: Record<string, string> = {
  Muzik: "M9 18V6.5l10-2V16M6.5 20.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM16.5 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  Sayilar:
    "M3.5 3.5h17v17h-17zM8 9.5 9.6 8.3V16M13.4 9.6a2 2 0 0 1 3.4 1.4c0 1.9-3.5 2.9-3.5 5h3.6",
  Mercek: "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM15.3 15.3 20.5 20.5",
  Yildiz: "m12 3.8 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.6 9.9l5.8-.8L12 3.8Z",
  Firca: "M14.5 3.5 20.5 9.5 11 19H5v-6l9.5-9.5ZM12.5 5.5 18.5 11.5",
  Grup: "M9 11.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM3.5 19a5.5 5.5 0 0 1 11 0M16 6.2a3 3 0 0 1 0 5.6M17.5 19a5.4 5.4 0 0 0-2.2-4.3",
  Rozet:
    "M12 2.5 20 5.5v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10v-6zM8.6 11.8l2.4 2.4 4.6-4.6",
  Bebek:
    "M12 14.2a5.2 5.2 0 1 0 0-10.4 5.2 5.2 0 0 0 0 10.4ZM10.2 11.2c1.1.9 2.5.9 3.6 0M6.9 19.8a5.2 5.2 0 0 1 10.2 0",
};

/** Ikonu veri URI'sine cevirir. PDF disaridan dosya cekemez. */
function ikonVeri(ad: string, renk = "#2f5e1c"): string {
  const yol = IKON_YOL[ad] ?? IKON_YOL.Firca;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ` +
    `stroke="${renk}" stroke-width="1.9" stroke-linecap="round" ` +
    `stroke-linejoin="round"><path d="${yol}"/></svg>`;
  return "data:image/svg+xml;base64," + Buffer.from(svg, "utf8").toString("base64");
}

/**
 * Gun adlarini kisaltir ve bitis saatini atar.
 * "16-24 ay · Pazartesi + Çarşamba · 10.00 - 12.00" -> "16-24 ay: Pzt+Çrş 10.00"
 * Sebep: A4'te her kombinasyon ayri satir olunca sayfa iki katina cikiyordu.
 */
const GUN_KISALT: [RegExp, string][] = [
  [/Pazartesi/g, "Pzt"],
  [/Çarşamba/g, "Çrş"],
  [/Perşembe/g, "Prş"],
  [/Cumartesi/g, "Cmt"],
  [/Salı/g, "Salı"],
  [/Cuma/g, "Cuma"],
];

function kisaKombinasyon(etiket: string): string {
  let s = etiket;
  for (const [ara, yaz] of GUN_KISALT) s = s.replace(ara, yaz);
  s = s.replace(/(\d{2}\.\d{2}) - \d{2}\.\d{2}/, "$1");
  s = s.replace(/ · /g, ": ").replace(/: (?=.*: )/, ": ");
  // "yas: gunler: saat" -> "yas: gunler saat"
  const p = s.split(": ");
  return p.length === 3 ? `${p[0]}: ${p[1]} ${p[2]}` : s.replace(": ", " ");
}

/** Bir ailenin haftalik gun ve saatleri, tek satirda birlestirilmis. */
function kombinasyonSatirlari(a: ProgramAilesi): string[] {
  return a.sabitKombinasyonlar.map((k) => kisaKombinasyon(k.etiket));
}

/* ---------------------------------------------------------------------------
 * Yas surumunun bant mantigi.
 *
 * 10 Agustos 2026, Miray Hanim: "16-24 ayi da ayri yer verebilirsiniz,
 * 12-24 ay ile ayni sayfada."
 *
 * Istegi karsilarken belgede duran bir karisiklik da duzeldi: onceki halde
 * "12-24 ay" blogundaki Gelisim Odakli karti, grubun 24-36 ay saatlerini de
 * listeliyordu. Veli 13 aylik cocugu icin uygun olmayan saati okuyordu.
 *
 * Cozum: kombinasyon etiketleri zaten kendi yasini tasiyor ("16-24 ay · Pzt
 * + Crs · 10.00"). Blok, YALNIZ kendi etiketini tasiyan saatleri gosteriyor.
 * Yassiz kombinasyonu olan aileler (Okula Hazirlik, Ingilizce) eskisi gibi
 * ay araligi kesisimiyle yerlesiyor.
 * ------------------------------------------------------------------------ */

/*
 * Belgeye ozel bantlar. Site rotalarini suren YAS_SAYFALARI'na dokunulmuyor.
 *
 * 10 Agustos 2026, Miray Hanim: "Okula hazirlik grubu 30+ ay olarak
 * degisebilir miyiz." Onceki halde "3-5 yas" bandi vardi ve Okula Hazirlik
 * (30-72 ay) hem 24-36 ay hem 3-5 yas blogunda, ayni kart iki kez cikiyordu.
 * "3-5 yas" bandi "30+ ay" ile degistirildi; grup surumundeki rozetle de
 * (yasEtiket: "30+ ay") artik ayni.
 */
const YAS_BANTLARI = [
  { ad: "6-12 ay", etiket: "6-12 ay", minAy: 6, maxAy: 12 },
  { ad: "12-24 ay", etiket: "12-24 ay", minAy: 12, maxAy: 24 },
  { ad: "16-24 ay", etiket: "16-24 ay", minAy: 16, maxAy: 24 },
  { ad: "24-36 ay", etiket: "24-36 ay", minAy: 24, maxAy: 36 },
  { ad: "30+ ay", etiket: "30+ ay", minAy: 30, maxAy: 72 },
] as const;

type YasBandi = (typeof YAS_BANTLARI)[number];

/** Kombinasyon etiketinin basindaki yas on eki. Yoksa null. */
function kombinasyonYasi(etiket: string): string | null {
  const e = etiket.split(" · ")[0].trim();
  return YAS_BANTLARI.some((b) => b.etiket === e) ? e : null;
}

/** Bandin gosterecegi saat satirlari. Bos donerse aile o banda girmez. */
function bantSaatleri(a: ProgramAilesi, bant: YasBandi): string[] {
  const yasli = a.sabitKombinasyonlar.filter(
    (k) => kombinasyonYasi(k.etiket) !== null,
  );

  // Butun saatleri yas etiketli olan aile: yalniz kendi bandinda gorunur.
  if (yasli.length === a.sabitKombinasyonlar.length && yasli.length > 0) {
    return a.sabitKombinasyonlar
      .filter((k) => kombinasyonYasi(k.etiket) === bant.etiket)
      .map((k) => kisaKombinasyon(k.etiket));
  }

  /*
   * Saatleri yas on eki tasimayan aile (Okula Hazirlik, Ingilizce): ailenin
   * KENDI yas etiketi bir banda birebir uyuyorsa yalniz o banda girer.
   * Okula Hazirlik "30+ ay", Ingilizce "24-36 ay" -> ikisi de bir bant adi.
   * Ay kesisimi kullanilsaydi Okula Hazirlik (30-72 ay) hem 24-36 ay hem
   * 30+ ay blogunda tekrarlanirdi; musteri tam bunu duzeltmemizi istedi.
   */
  const kendiBandi = YAS_BANTLARI.find((b) => b.etiket === a.yasEtiket);
  if (kendiBandi) {
    return kendiBandi.etiket === bant.etiket ? kombinasyonSatirlari(a) : [];
  }

  // Hicbir banda birebir uymayan aile: ay kesisimi.
  const kesisiyor = a.minAy < bant.maxAy && a.maxAy > bant.minAy;
  return kesisiyor ? kombinasyonSatirlari(a) : [];
}

/**
 * Bandin gosterecegi notlar.
 *
 * Bir not yas on ekiyle basliyorsa ("12-24 ay gruplarinda iki katilimda
 * Ingilizce hediye") YALNIZ o bantta gorunur. Onek yoksa her bantta gorunur.
 * Sebep: hediye 12 aydan once teslim edilemiyor, cunku Ingilizce islenen en
 * kucuk seans 12 ayda basliyor. Not, 6-12 ay blogunda tutulamayacak bir soz
 * gibi durmasin diye orada gizleniyor. Ayni cumle grup surumunde Bebek Oyun
 * Grubu kartinda (6-24 ay) yas nitelemesiyle birlikte duruyor.
 */
function bantNotlari(a: ProgramAilesi, bant: YasBandi): string[] {
  return a.notlar.filter((n) => {
    const onek = YAS_BANTLARI.find((b) => b.etiket && n.startsWith(b.etiket));
    return !onek || onek.etiket === bant.etiket;
  });
}

/** Banda giren aileler, her biri kendi saat satirlariyla. */
function bantAileleri(bant: YasBandi): { aile: ProgramAilesi; saatler: string[] }[] {
  return AILELER.map((aile) => ({ aile, saatler: bantSaatleri(aile, bant) })).filter(
    (x) => x.saatler.length > 0,
  );
}

/*
 * Koruma. Bir ailenin saatlerinden BAZILARI yas etiketli, bazilari degilse
 * bantSaatleri ay kesisimine duser ve butun saatleri her banda basar; belge
 * sessizce eski karisik haline doner. Etiketin YAS_BANTLARI'nda karsiligi
 * yoksa da ayni sey olur. Ikisini de burada yakaliyoruz.
 */
for (const a of AILELER) {
  const etiketli = a.sabitKombinasyonlar.filter(
    (k) => kombinasyonYasi(k.etiket) !== null,
  ).length;

  if (etiketli !== 0 && etiketli !== a.sabitKombinasyonlar.length) {
    const eksik = a.sabitKombinasyonlar
      .filter((k) => kombinasyonYasi(k.etiket) === null)
      .map((k) => k.etiket);
    throw new Error(
      `${a.ad}: saatlerin bir kismi yas etiketli, bir kismi degil. ` +
        `Ya hepsine yas on eki verin ya da hicbirine. Etiketsizler: ${eksik.join(", ")}`,
    );
  }
}

// Her bant en az bir grup gostermeli; bos bant, veri degisiminde bir grubun
// belgeden dusmus olmasi demektir.
for (const bant of YAS_BANTLARI) {
  if (bantAileleri(bant).length === 0) {
    throw new Error(`"${bant.ad}" bandi bos kaldi. Yas etiketlerini kontrol edin.`);
  }
}

/** Bir ailenin fiyat satirlari. */
function fiyatSatirlari(a: ProgramAilesi): string {
  return a.paketler
    .map((p) => {
      const sag = indirimVarMi(p)
        ? `<s>${tl(p.normal)}</s><b>${tl(p.erkenKayit)} TL</b>`
        : `<b class="duz">${tl(p.normal)} TL</b>`;
      // 10 Agustos 2026: "indirim yok" ibaresi kaldirildi. Tek seferlik
      // fiyat neyse odur, aciklama gerekmiyor.
      return `<li><span>${kacis(p.etiket)}</span><em>${sag}</em></li>`;
    })
    .join("\n");
}

function aileBlogu(a: ProgramAilesi, koyuMu = false): string {
  return `
  <article class="blok${koyuMu ? " koyu" : ""}">
    <header class="blok-ust">
      <p class="yas-rozet">${kacis(a.yasEtiket)}</p>
      <h3>${kacis(a.ad)}</h3>
      <p class="blok-ozet">${kacis(a.ozet)}</p>
      <p class="sure buyuk">${kacis(a.sure)}</p>
      <p class="mevcut">En fazla ${a.maxKisi} çocuk</p>
    </header>
    <ul class="fiyat">
${fiyatSatirlari(a)}
    </ul>
    <div class="saatler">
      <p class="saat-baslik">Gün ve saatler</p>
      <p class="saat-metin">${kombinasyonSatirlari(a).map(kacis).join("  ·  ")}</p>
    </div>
${a.notlar.length ? `    <p class="blok-not">${a.notlar.map(kacis).join(" ")}</p>` : ""}
  </article>`;
}

/**
 * Bir yas bandi: o yasa acik duzenli gruplar.
 *
 * Tek seferlik atolyeler burada TEKRARLANMAZ. Ayni atolye birden fazla yas
 * bandinda gectigi icin her blogun altina koymak hem sayfayi sisiriyor hem de
 * ayni bilgiyi uc kez yazdiriyordu. Atolyeler son sayfada tek bir tam genislik
 * bolumde toplaniyor (bkz. atolyeBlok).
 */
function yasBlogu(bant: YasBandi): string {
  const kayitlar = bantAileleri(bant);

  return `
  <article class="blok yas-blok">
    <header class="blok-ust">
      <p class="yas-rozet buyuk">${kacis(bant.ad)}</p>
      <p class="blok-ozet">${kayitlar.length} düzenli grup</p>
    </header>

    <div class="yas-gruplar">
${kayitlar
  .map(
    ({ aile: a, saatler }) => {
      const notlar = bantNotlari(a, bant);
      return `    <div class="yas-grup">
      <p class="yas-grup-ad">${kacis(a.ad)}</p>
      <p class="sure">${kacis(a.sure)}</p>
      <ul class="fiyat kucuk">
${fiyatSatirlari(a)}
      </ul>
      <p class="yas-saat">${kacis(saatler.join("  ·  "))}</p>
      ${notlar.length ? `<p class="yas-not">${notlar.map(kacis).join(" ")}</p>` : ""}
    </div>`;
    },
  )
  .join("\n")}

  </article>`;
}

/*
 * Amblem: YESIL vektor logo. Marka rengi yesil, kurumun kendi afisleri de
 * yesil; mor amblem sayfayi markadan kopariyordu.
 *
 * Musterinin "Kids Zone & Party House kalksin" istegi, en ustteki YAZILI
 * satir icindi. O satir kaldirildi, yerine resmi ad yaziliyor:
 * "Kibar Cocuk Etkinlik ve Oyun Merkezi". Ifade yalnizca amblemin kendi
 * halkasinda, kurumun kendi logosunun parcasi olarak kaliyor.
 */
const AMBLEM_SRC =
  "data:image/svg+xml;base64," +
  readFileSync("src/assets/bambola-kids-zone.svg").toString("base64");

/**
 * Ust blok. 10 Agustos 2026 musteri karari:
 * - "Kids Zone & Party House" ifadesi KULLANILMAZ. Yerine amblem ve resmi ad.
 * - Erken kayit rozetine kampanya tarihi eklenir.
 */
function ustBlok(baslik: string, altBaslik: string) {
  return `  <header class="ust">
    <div class="amblem">
      <img src="${AMBLEM_SRC}" alt="${kacis(MARKA.ad)}">
    </div>
    <div class="ust-sol">
      <p class="kurum">${kacis(MARKA.tuzelAdOyunEvi)}</p>
      <h1>${kacis(baslik)}</h1>
      <p class="alt-baslik">${kacis(altBaslik)}</p>
      ${
        MEB_IFADESI
          ? `<p class="meb"><span class="meb-ikon"><img src="${ikonVeri("Rozet", "#ffffff")}" alt=""></span>${kacis(MEB_IFADESI)} oyun merkezi</p>`
          : ""
      }
    </div>
    <div class="indirim">
      <p class="indirim-ust">Erken kayıt</p>
      <p class="indirim-oran">%20</p>
      <p class="indirim-alt">indirim</p>
      <p class="indirim-tarih">${kacis(KAMPANYA_PENCERESI.metin)}</p>
      <p class="indirim-songun">Son gün ${kacis(KAMPANYA_PENCERESI.sonGun)}</p>
    </div>
  </header>`;
}

/**
 * Devam sayfalarinin ince basligi.
 *
 * Ilk sayfadaki buyuk ust blok her sayfada tekrarlanmaz, sayfa basina 43mm
 * yiyor. Ama basliksiz sayfa, yazicidan cikinca hangi belgeye ait oldugu
 * belirsiz kaliyor. Bu serit 14mm ve sayfa numarasi tasiyor.
 */
function devamBasligi(no: number, toplam: number, altBaslik: string) {
  return `  <header class="ust-devam">
    <div class="ud-amblem"><img src="${AMBLEM_SRC}" alt=""></div>
    <p class="ud-ad">${kacis(MARKA.tuzelAdOyunEvi)}</p>
    <p class="ud-sayfa">${kacis(altBaslik)} · Sayfa ${no} / ${toplam}</p>
  </header>`;
}

/**
 * Tek katilimla girilebilen atolyeler, tam genislik.
 * 10 Agustos 2026 musteri karari: bu atolyelerin ucreti artik belli.
 * Ingilizce seans 2.500 TL, Turkce seans 2.000 TL. "Ucreti telefonda
 * paylasiyoruz" ifadesi kaldirildi.
 */
function atolyeBlok(): string {
  // Tek seferlik slotlari atolye ve dile gore grupla.
  const anahtar = (slug: string, dil: string) => `${slug}|${dil}`;
  const gruplar = new Map<
    string,
    { slug: string; dil: Dil; slotlar: typeof SLOTLAR }
  >();

  for (const s of SLOTLAR) {
    if (!s.tekSeferMumkun || s.atolyeSlug === "serbest-oyun") continue;
    const k = anahtar(s.atolyeSlug, s.dil);
    const mevcut = gruplar.get(k);
    if (mevcut) mevcut.slotlar.push(s);
    else gruplar.set(k, { slug: s.atolyeSlug, dil: s.dil, slotlar: [s] });
  }

  const satirlar = [...gruplar.values()]
    .map((g) => {
      const at = atolyeBul(g.slug);
      const rozet = g.dil === "en" ? "İngilizce" : "Türkçe";
      const yaslar = [...new Set(g.slotlar.map((s) => s.yas.etiket))].join(", ");
      const saatler = g.slotlar
        .map((s) => `${GUN_ADI[s.gun]} ${s.bas}-${s.bit}`)
        .join(" · ");
      return `      <li>
        <span class="a-ikon"><img src="${ikonVeri(at?.ikon ?? "Firca")}" alt=""></span>
        <span class="a-govde">
          <span class="a-ad">${kacis(at?.ad ?? g.slug)}</span>
          <span class="a-etiketler"><i class="dil dil-${g.dil}">${rozet}</i><i class="yas">${kacis(yaslar)}</i></span>
          <span class="a-saat">${kacis(saatler)}</span>
        </span>
        <span class="a-fiyat">${tl(tekSeferUcreti(g.dil))} TL</span>
      </li>`;
    })
    .join("\n");

  return `  <section class="atolyeler">
    <div class="atolye-ust">
      <h2>Tek katılımla girilebilen atölyeler</h2>
      <p>Paket almadan, tek seferlik katılım. Ücret seansın diline göre belirlenir.</p>
    </div>
    <ul>
${satirlar}
    </ul>
  </section>`;
}

const KOSUL_BLOK = `  <section class="kosullar">
    <h2>Koşullar</h2>
    <ol>
${KAMPANYA_KOSULLARI.map((k) => `      <li>${kacis(k)}</li>`).join("\n")}
    </ol>
    <p class="kosul-ek">Her grup gününün ilk bir saati serbest oyundur. Öğle arası
      her gün 12.30 - 13.30. Ara öğün verilir. Hafta sonu belirlenen zaman diliminde
      1 saat serbest oyun ücretsizdir. Pazar günü grup programı yoktur.</p>
  </section>`;

const SERIT = `  <footer class="serit">
    <div class="serit-logo">
      <img src="${AMBLEM_SRC}" alt="">
    </div>
    <div class="serit-bilgi">
      <p><span class="ikon">IG</span>${kacis((ILETISIM.instagram ?? "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, ""))}</p>
      <p><span class="ikon">T</span>${kacis(ILETISIM.telefon ?? "")}</p>
    </div>
    <div class="serit-adres">
      <p>${kacis(ILETISIM.adres ?? "")}</p>
    </div>
  </footer>`;

const BEZEK = `  <div class="bezek bezek-ust" aria-hidden="true"></div>
  <div class="bezek bezek-alt" aria-hidden="true"></div>`;

/**
 * Her sayfa kendi `.sayfa` kutusu. Cok sayfali surumde bu sart:
 * tek uzun kutu birakilirsa ikinci sayfanin ustunde kenar boslugu kalmiyor
 * ve icerik kagidin tepesine yapisiyor.
 */
function belge(sinif: string, baslik: string, sayfalar: string[]) {
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<title>${kacis(baslik)} · ${MARKA.ad}</title>
<style>
${readFileSync(new URL("./pdf-fontlar.css", import.meta.url), "utf8")}
${readFileSync(new URL("./pdf-stil.css", import.meta.url), "utf8")}
</style>
</head>
<body class="${sinif}">
${sayfalar
  .map(
    (s, i) =>
      `<div class="sayfa${i < sayfalar.length - 1 ? " kir" : ""}">\n${BEZEK}\n${s}\n</div>`,
  )
  .join("\n")}
</body>
</html>`;
}

// ---------------------------------------------------------------- uretim

mkdirSync("docs", { recursive: true });

// --- A surumu: gruba gore. Iki A4 sayfa. ---
// Sayfa 1 dort duzenli grup, sayfa 2 tek seferlik atolyeler ve kosullar.
writeFileSync(
  "docs/fiyat-listesi-grup.html",
  belge("surum-grup", "Fiyat Listesi", [
    [
      ustBlok("Fiyat Listesi", "Programa göre. Çocuğunuzun yaşına uyan grubu seçin."),
      `  <section class="bloklar dort">\n${AILELER.map((a, i) => aileBlogu(a, i === 0)).join("\n")}\n  </section>`,
    ].join("\n\n"),
    [
      devamBasligi(2, 2, "Fiyat Listesi · Programa göre"),
      atolyeBlok(),
      KOSUL_BLOK,
      SERIT,
    ].join("\n\n"),
  ]),
  "utf8",
);

/* --- B surumu: yasa gore. UC A4 sayfa. ---
 *
 * 16-24 ay bandi eklenince icerik iki sayfaya sigmiyor. Olculen yukseklikler
 * (kullanilabilir alan sayfa basina 287mm):
 *
 *   ust 43 · 6-12 63 · 12-24 63 · 16-24 68 · 24-36 87
 *   atolyeler 83 · 3-5 yas 71 · kosullar 48 · serit 20
 *
 * Dorduncu bandi birinci sayfaya sikistirmak 346mm'lik bir kutu uretiyordu;
 * kutu ekran goruntusunde butun gorunuyor ama BASKIDA ortadan bolunuyordu.
 * Uc sayfa, dengeli dagilim:
 *
 *   1. ust + 6-12 + 12-24 + 16-24        246mm
 *   2. 24-36 + 3-5 yas                   161mm + baslik
 *   3. atolyeler + kosullar + serit      151mm + baslik
 *
 * Musteri 16-24 ayin 12-24 ile AYNI SAYFADA durmasini istedi; bolme
 * degistirilirken bu kural bozulmamali. Sayfa tasmasini scripts/bas.ts
 * her basimda olcuyor.
 */
const YAS_ALT_BASLIK = "Yaşa göre. Çocuğunuzun yaşını bulun, açık grupları görün.";

const yasSayfa1 = [
  ustBlok("Fiyat Listesi", YAS_ALT_BASLIK),
  `  <section class="bloklar ikili">\n${YAS_BANTLARI.slice(0, 3).map(yasBlogu).join("\n")}\n  </section>`,
].join("\n\n");

const yasSayfa2 = [
  devamBasligi(2, 3, "Fiyat Listesi · Yaşa göre"),
  `  <section class="bloklar ikili">\n${YAS_BANTLARI.slice(3).map(yasBlogu).join("\n")}\n  </section>`,
].join("\n\n");

const yasSayfa3 = [
  devamBasligi(3, 3, "Fiyat Listesi · Yaşa göre"),
  atolyeBlok(),
  KOSUL_BLOK,
  SERIT,
].join("\n\n");

writeFileSync(
  "docs/fiyat-listesi-yas.html",
  belge("surum-yas", "Fiyat Listesi", [yasSayfa1, yasSayfa2, yasSayfa3]),
  "utf8",
);

console.log("uretildi:");
console.log("  docs/fiyat-listesi-grup.html");
console.log("  docs/fiyat-listesi-yas.html");
