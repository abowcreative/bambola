/**
 * Marka amblemini kaynak PDF'ten cikarip sitenin kullandigi PNG'leri uretir.
 * Calistirma: npm run logo
 *
 * NEDEN VAR: Musteri 25 Agustos 2026'da resmi amblemi
 * `bambola-final-logo.pdf` olarak verdi ve sitedeki butun logolarin bu
 * olmasini istedi. Onceki yesil "Kids Zone & Party House" amblemi kalkti;
 * zaten 10 Agustos'ta o ifadenin kullanilmamasi istenmisti (PLAN.md Bolum 14
 * madde 8) ve ifade tam da o amblemin halkasinda yaziyordu.
 *
 * PDF'in ICI RASTER. Icinde tek bir 1024x1024 CMYK JPEG (nesne 12) ve onun
 * saydamlik maskesi (nesne 13, DeviceGray + Flate + PNG ongorucu 15) var.
 * Vektor yok, dolayisiyla SVG'ye cevrilemiyor; elde edilebilecek en iyi sey
 * 1024 pikselde temiz bir RGBA PNG.
 *
 * MASKENIN MANTIGI (ilk bakista ters gorunur):
 * Maske, halkayi ve ic diski OPAK; halka yazisini, figuru ve "BAMBOLA"
 * wordmark'ini SAYDAM birakiyor. Yani cizim, zeminin gorunmesi icin
 * OYULMUS. PDF sayfasi arkaya beyaz basiyor, amblem oyle tasarlanmis:
 * siyah halkada beyaz yazi, mor diskte beyaz figur.
 *
 * Bu yuzden dosyayi oldugu gibi disari yazmak olmuyor -- oyuklar sayfanin
 * zeminini gosterirdi ve amblem her bolumde baska renge burunurdu. Onun
 * yerine:
 *   1. Kenardan tasma-doldurma ile "disk disi" bolge bulunuyor.
 *   2. Disk disi saydam kaliyor (amblem yuvarlak kesiliyor).
 *   3. Disk icindeki oyuklar BEYAZA kapatiliyor.
 * Sonuc: her zeminde ayni gorunen, kenari yumusak gecisli yuvarlak amblem.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import sharp from "sharp";

const KAYNAK = "bambola-final-logo.pdf";
const SITE_HEDEF = "src/assets/bambola-logo.png";
const KAMU_HEDEF = "public/marka/bambola-logo.png";

/** PDF icindeki goruntu nesnesi ve saydamlik maskesi. */
const JPEG_NESNE = 12;
const MASKE_NESNE = 13;
const EN = 1024;
const BOY = 1024;

/** `<n> 0 obj` ile baslayan nesnenin ham akisini dondurur. */
function akis(pdf: Buffer, metin: string, no: number): Buffer {
  const bas = metin.indexOf(`\n${no} 0 obj`);
  if (bas < 0) throw new Error(`PDF nesnesi yok: ${no}`);
  const akisBas = metin.indexOf("stream", bas);
  const sozluk = metin.slice(bas, akisBas);
  const uzunluk = /\/Length (\d+)/.exec(sozluk);
  if (!uzunluk) throw new Error(`Nesne ${no} icin /Length okunamadi`);
  // "stream" anahtar sozcugunden sonra CRLF ya da LF gelir, ikisi de atlanir.
  let p = akisBas + "stream".length;
  if (metin[p] === "\r") p++;
  if (metin[p] === "\n") p++;
  return pdf.subarray(p, p + Number(uzunluk[1]));
}

/**
 * PNG ongorucusunu (Predictor 15) geri alir. Tek kanal, 8 bit, `EN` sutun.
 * PDF cozucusu bu isi kendi yapardi; burada elle yapiliyor cunku depoda tam
 * bir PDF cozucusu yok ve gereken tek sey bu.
 */
function ongorucuyuCoz(ham: Buffer): Buffer {
  const cikti = Buffer.alloc(EN * BOY);
  let oku = 0;
  let onceki = Buffer.alloc(EN);
  for (let y = 0; y < BOY; y++) {
    const tur = ham[oku++];
    const satir = Buffer.from(ham.subarray(oku, oku + EN));
    oku += EN;
    for (let i = 0; i < EN; i++) {
      const sol = i >= 1 ? satir[i - 1] : 0;
      const ust = onceki[i];
      const ustSol = i >= 1 ? onceki[i - 1] : 0;
      const v = satir[i];
      switch (tur) {
        case 0:
          break;
        case 1:
          satir[i] = (v + sol) & 255;
          break;
        case 2:
          satir[i] = (v + ust) & 255;
          break;
        case 3:
          satir[i] = (v + ((sol + ust) >> 1)) & 255;
          break;
        case 4: {
          const t = sol + ust - ustSol;
          const ds = Math.abs(t - sol);
          const du = Math.abs(t - ust);
          const dus = Math.abs(t - ustSol);
          const tahmin = ds <= du && ds <= dus ? sol : du <= dus ? ust : ustSol;
          satir[i] = (v + tahmin) & 255;
          break;
        }
        default:
          throw new Error(`Bilinmeyen PNG ongorucu filtresi: ${tur}`);
      }
    }
    satir.copy(cikti, y * EN);
    onceki = satir;
  }
  return cikti;
}

/**
 * Kenarlardan iceri dogru tasma-doldurma. Yalniz maskesi `esik`in altinda
 * kalan pikseller geziliyor, boylece disk disi bolge (ve kenarindaki
 * yumusak gecis) isaretleniyor. Diskin ICINDEKI oyuklar kenara bagli
 * olmadigi icin isaretlenmiyor -- ayrimi yapan sey bu.
 */
function diskDisi(maske: Buffer, esik = 250): Uint8Array {
  const disi = new Uint8Array(EN * BOY);
  const yigin: number[] = [];
  const bak = (i: number) => {
    if (!disi[i] && maske[i] < esik) {
      disi[i] = 1;
      yigin.push(i);
    }
  };
  for (let x = 0; x < EN; x++) {
    bak(x);
    bak((BOY - 1) * EN + x);
  }
  for (let y = 0; y < BOY; y++) {
    bak(y * EN);
    bak(y * EN + EN - 1);
  }
  while (yigin.length) {
    const i = yigin.pop() as number;
    const x = i % EN;
    const y = (i / EN) | 0;
    if (x > 0) bak(i - 1);
    if (x < EN - 1) bak(i + 1);
    if (y > 0) bak(i - EN);
    if (y < BOY - 1) bak(i + EN);
  }
  return disi;
}

async function main() {
  if (!existsSync(KAYNAK)) {
    console.error(`\nKaynak amblem yok: ${KAYNAK}\n`);
    process.exit(1);
  }

  const pdf = readFileSync(KAYNAK);
  // latin1: bayt <-> karakter birebir, arama yaparken hicbir bayt bozulmuyor.
  const metin = pdf.toString("latin1");

  const maske = ongorucuyuCoz(inflateSync(akis(pdf, metin, MASKE_NESNE)));
  const disi = diskDisi(maske);

  // sharp CMYK JPEG'i cozup sRGB'ye ceviriyor; PDF'teki profil GRACoL 2013.
  const { data: rgb } = await sharp(akis(pdf, metin, JPEG_NESNE))
    .toColourspace("srgb")
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgba = Buffer.alloc(EN * BOY * 4);
  for (let i = 0; i < EN * BOY; i++) {
    const a = maske[i];
    const k = i * 3;
    const h = i * 4;
    // Oyuklari beyazla kapatmak = ambleme beyaz zemin uzerinde bakmak.
    // Kenardaki ara degerler de dogru karisiyor, testere disi olusmuyor.
    rgba[h] = Math.round((rgb[k] * a + 255 * (255 - a)) / 255);
    rgba[h + 1] = Math.round((rgb[k + 1] * a + 255 * (255 - a)) / 255);
    rgba[h + 2] = Math.round((rgb[k + 2] * a + 255 * (255 - a)) / 255);
    rgba[h + 3] = disi[i] ? a : 255;
  }

  const kaynak = () =>
    sharp(rgba, { raw: { width: EN, height: BOY, channels: 4 } });

  mkdirSync("src/assets", { recursive: true });
  mkdirSync("public/marka", { recursive: true });

  const site = await kaynak().png({ compressionLevel: 9 }).toBuffer();
  writeFileSync(SITE_HEDEF, site);
  console.log(`  + ${SITE_HEDEF} (${EN}x${BOY} · ${site.length} bayt)`);

  // schema.org `logo` ve sosyal paylasim icin: mutlak URL'den servis edilir,
  // 512 piksel her tuketici icin fazlasiyla yeter.
  const kamu = await kaynak()
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toBuffer();
  writeFileSync(KAMU_HEDEF, kamu);
  console.log(`  + ${KAMU_HEDEF} (512x512 · ${kamu.length} bayt)`);
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
