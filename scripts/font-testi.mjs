/**
 * Turkce glif testi.
 * Calistirma: npm run build && npm run test:font
 *
 * Uzantisi .mjs: proje package.json'inda `"type": "module"` yok, yani .js
 * dosyalari CommonJS sayiliyor ve `import` orada calismaz. Bagimlilik
 * istemedigi icin (tsx degil, dogrudan node) bu dosya TypeScript'e de
 * cevrilmedi.
 *
 * NEDEN VAR: Ilk surumde baslik fontu Fredoka secilmisti. Google Fonts
 * "latin-ext destekliyor" diyor, next/font da latin-ext altkumesini indiriyor,
 * ama Fredoka'nin latin-ext dosyasi yalnizca 22 glif tasiyor ve g-breve,
 * G-breve, I-nokta, s-cedilla, S-cedilla hicbiri icinde degil. Sonuc: sitede
 * "Cocugunuz" yazisindaki g harfi yedek fonta dusuyordu.
 *
 * Bu test uretilen woff2 dosyalarinin cmap tablosunu acar ve her yazi tipi
 * ailesinin on iki Turkce harfin tamamini tasidigini dogrular. Yazi tipi
 * degistirildiginde derleme sonrasi bu testi calistirmak yeterli.
 */

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const TURKCE = {
  "ç": 0x00e7, "Ç": 0x00c7,
  "ğ": 0x011f, "Ğ": 0x011e,
  "ı": 0x0131, "İ": 0x0130,
  "ö": 0x00f6, "Ö": 0x00d6,
  "ş": 0x015f, "Ş": 0x015e,
  "ü": 0x00fc, "Ü": 0x00dc,
};

// woff2 tablo etiketleri, kisa kodlamada kullanilan sira.
const ETIKETLER = ["cmap","head","hhea","hmtx","maxp","name","OS/2","post","cvt ","fpgm","glyf","loca","prep","CFF ","VORG","EBDT","EBLC","gasp","hdmx","kern","LTSH","PCLT","VDMX","vhea","vmtx","BASE","GDEF","GPOS","GSUB","EBSC","JSTF","MATH","CBDT","CBLC","COLR","CPAL","SVG ","sbix","acnt","avar","bdat","bloc","bsln","cvar","fdsc","feat","fmtx","fvar","gvar","hsty","just","lcar","mort","morx","opbd","prop","trak","Zapf","Silf","Glat","Gloc","Feat","Sill"];

function uintBase128(b, p) {
  let v = 0;
  for (let i = 0; i < 5; i++) {
    const c = b[p.o++];
    v = (v << 7) | (c & 0x7f);
    if (!(c & 0x80)) return v;
  }
  throw new Error("bozuk UIntBase128");
}

/** woff2 dosyasindaki karakter kodlarini doner. */
function kodNoktalari(dosya) {
  const b = fs.readFileSync(dosya);
  if (b.toString("latin1", 0, 4) !== "wOF2") return null;

  const tabloSayisi = b.readUInt16BE(12);
  const sikistirilmisBoyut = b.readUInt32BE(20);
  const p = { o: 48 };
  const tablolar = [];

  for (let i = 0; i < tabloSayisi; i++) {
    const bayrak = b[p.o++];
    const idx = bayrak & 0x3f;
    let etiket;
    if (idx === 0x3f) {
      etiket = b.toString("latin1", p.o, p.o + 4);
      p.o += 4;
    } else {
      etiket = ETIKETLER[idx];
    }
    const asilUzunluk = uintBase128(b, p);
    const donusum = (bayrak >> 6) & 3;
    const donusumluMu =
      etiket === "glyf" || etiket === "loca" ? donusum === 0 : donusum !== 0;
    const uzunluk = donusumluMu ? uintBase128(b, p) : asilUzunluk;
    tablolar.push({ etiket, uzunluk });
  }

  const veri = zlib.brotliDecompressSync(
    b.subarray(p.o, p.o + sikistirilmisBoyut),
  );

  let konum = 0;
  let cmapKonum = -1;
  let cmapUzunluk = 0;
  for (const t of tablolar) {
    if (t.etiket === "cmap") {
      cmapKonum = konum;
      cmapUzunluk = t.uzunluk;
    }
    konum += t.uzunluk;
  }
  if (cmapKonum < 0) return null;

  const c = veri.subarray(cmapKonum, cmapKonum + cmapUzunluk);
  const altTablo = c.readUInt16BE(2);
  const kodlar = new Set();

  for (let i = 0; i < altTablo; i++) {
    const so = c.readUInt32BE(4 + i * 8 + 4);
    const bicim = c.readUInt16BE(so);

    if (bicim === 4) {
      const segX2 = c.readUInt16BE(so + 6);
      const seg = segX2 / 2;
      const bitisB = so + 14;
      const baslaB = bitisB + segX2 + 2;
      for (let s = 0; s < seg; s++) {
        const bitis = c.readUInt16BE(bitisB + s * 2);
        const basla = c.readUInt16BE(baslaB + s * 2);
        if (basla === 0xffff) continue;
        for (let u = basla; u <= bitis && u < 0xffff; u++) kodlar.add(u);
      }
    } else if (bicim === 12) {
      const grup = c.readUInt32BE(so + 12);
      for (let g = 0; g < grup; g++) {
        const go = so + 16 + g * 12;
        const s = c.readUInt32BE(go);
        const e = c.readUInt32BE(go + 4);
        for (let u = s; u <= e && u - s < 10000; u++) kodlar.add(u);
      }
    }
  }
  return kodlar;
}

// --- derlenmis CSS'ten aile -> dosya eslemesi cikar ---

function cssDosyalari(kok) {
  const cikti = [];
  (function tara(dizin) {
    let girisler;
    try {
      girisler = fs.readdirSync(dizin, { withFileTypes: true });
    } catch {
      return;
    }
    for (const g of girisler) {
      const tam = path.join(dizin, g.name);
      if (g.isDirectory()) tara(tam);
      else if (g.name.endsWith(".css")) cikti.push(tam);
    }
  })(kok);
  return cikti;
}

const KOK = path.join(process.cwd(), ".next");
if (!fs.existsSync(KOK)) {
  console.error("\n.next klasoru yok. Once `npm run build` calistirin.\n");
  process.exit(1);
}

const medyaDizini = path.join(KOK, "static", "media");
const aileler = new Map();

for (const cssYolu of cssDosyalari(path.join(KOK, "static"))) {
  const css = fs.readFileSync(cssYolu, "utf8");
  for (const blok of css.match(/@font-face\s*\{[^}]*\}/g) ?? []) {
    const aile = (blok.match(/font-family:\s*['"]?([^;'"]+)/) ?? [])[1];
    if (!aile || /Fallback/i.test(aile)) continue;
    const src = (blok.match(/url\(([^)]+)\)/) ?? [])[1];
    if (!src) continue;
    const dosya = src.replace(/['"]/g, "").split("/").pop();
    if (!dosya.endsWith(".woff2")) continue;
    if (!aileler.has(aile)) aileler.set(aile, new Set());
    aileler.get(aile).add(dosya);
  }
}

if (aileler.size === 0) {
  console.error("\nDerlenmis CSS icinde hic @font-face bulunamadi.\n");
  process.exit(1);
}

let hata = 0;
console.log("");

for (const [aile, dosyalar] of aileler) {
  const kapsam = new Set();
  let okunan = 0;

  for (const dosya of dosyalar) {
    const tam = path.join(medyaDizini, dosya);
    if (!fs.existsSync(tam)) continue;
    const kodlar = kodNoktalari(tam);
    if (!kodlar) continue;
    okunan++;
    for (const [harf, kod] of Object.entries(TURKCE)) {
      if (kodlar.has(kod)) kapsam.add(harf);
    }
  }

  const eksik = Object.keys(TURKCE).filter((h) => !kapsam.has(h));

  if (okunan === 0) {
    console.error(`  x ${aile}: hic woff2 dosyasi okunamadi`);
    hata++;
  } else if (eksik.length) {
    console.error(
      `  x ${aile}: ${eksik.length} Turkce harf EKSIK -> ${eksik.join("")}` +
        `  (${okunan} dosya tarandi)`,
    );
    hata++;
  } else {
    console.log(`  + ${aile}: on iki Turkce harfin tamami var (${okunan} dosya)`);
  }
}

console.log("");

if (hata) {
  console.error(
    `${hata} yazi tipi Turkce karakterleri tasimiyor. Baska bir aile secin\n` +
      "ve bu testi tekrar calistirin. Google Fonts'un altkume listesine\n" +
      "guvenmeyin, glif kapsami ayri bir sey.\n",
  );
  process.exit(1);
}

console.log("Yazi tipi Turkce testi gecti.\n");
