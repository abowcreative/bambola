/**
 * Marka amblemini uretir: yesil logonun halka yazisi, musterinin verdigi
 * resmi amblemdeki yaziyla degistirilir.
 * Calistirma: npm run logo
 *
 * NEDEN VAR: Musteri 25 Agustos 2026'da `bambola-final-logo.pdf` gonderdi.
 * Istenen sey amblemin komple degismesi DEGIL: kurumsal renk (yesil) aynen
 * kalacak, yalniz ust halkadaki yazi degisecek. Eski yazi "KIDS ZONE &
 * PARTY HOUSE" idi ve 10 Agustos 2026'da o ifadenin kullanilmamasi
 * istenmisti (PLAN.md Bolum 14 madde 8); yerine resmi ad geliyor:
 * "KIBAR COCUK ETKINLIK VE OYUN MERKEZI".
 *
 * NEDEN KOPYALA-YAPISTIR DEGIL: Resmi amblemin PDF'i RASTER. Icinde tek bir
 * 1024x1024 CMYK JPEG (nesne 12) ve saydamlik maskesi (nesne 13, DeviceGray
 * + Flate + PNG ongorucu 15) var, tek bir vektor yol yok. Buna karsilik
 * elimizdeki yesil amblem gercek vektor (CorelDRAW ciktisi, LOGO
 * BAMBOLA.pdf'ten cikarilmisti). Dolayisiyla yol su: yesil vektorun her
 * seyini koru, yalniz halka yazisi yolunu resmi amblemden izlenmis
 * vektorle degistir.
 *
 * ISE YARAMASININ SEBEBI: iki amblemin halka geometrisi neredeyse birebir
 * ayni. 1000 birimlik tuvalde yesil halka 414.7 - 497.6, resmi amblemin
 * halkasi 415.5 - 500.3. Yani izlenen yazi hicbir esnetme olmadan, duz bir
 * olcek degisimiyle yesil amblemin bandina oturuyor.
 *
 * MASKENIN MANTIGI (ilk bakista ters gorunur): Maske halkayi ve ic diski
 * OPAK, yaziyi ve figuru SAYDAM birakiyor -- cizim, zeminin gorunmesi icin
 * OYULMUS. Yani halka bandindaki saydam pikseller tam olarak aradigimiz
 * yazinin kendisi.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import sharp from "sharp";
import { Potrace } from "potrace";

const PDF = "bambola-final-logo.pdf";
/** Yesil amblemin vektoru. Halka yazisi disinda her sey buradan geliyor. */
const TABAN = "src/assets/bambola-kids-zone.svg";
const SVG_HEDEF = "src/assets/bambola-logo.svg";
const PNG_HEDEF = "public/marka/bambola-logo.png";

const YENI_YAZI = "Kibar Çocuk Etkinlik ve Oyun Merkezi";

/** PDF icindeki goruntu nesnesi ve saydamlik maskesi. */
const MASKE_NESNE = 13;
const EN = 1024;
/** Izleme cozunurlugu. 1024'te yazi ~68 piksel; 2x buyutmek kenarlari
 *  yumusatiyor, 4x'in getirdigi ek kesinlik yol verisini iki katina
 *  cikarmaktan baska ise yaramiyor. */
const IZ_OLCU = 2048;
/** Yesil amblemin tuval olcusu. */
const TUVAL = 1000;

/** `<n> 0 obj` ile baslayan nesnenin ham akisini dondurur. */
function akis(pdf: Buffer, metin: string, no: number): Buffer {
  const bas = metin.indexOf(`\n${no} 0 obj`);
  if (bas < 0) throw new Error(`PDF nesnesi yok: ${no}`);
  const akisBas = metin.indexOf("stream", bas);
  const uzunluk = /\/Length (\d+)/.exec(metin.slice(bas, akisBas));
  if (!uzunluk) throw new Error(`Nesne ${no} icin /Length okunamadi`);
  // "stream" anahtar sozcugunden sonra CRLF ya da LF gelir, ikisi de atlanir.
  let p = akisBas + "stream".length;
  if (metin[p] === "\r") p++;
  if (metin[p] === "\n") p++;
  return pdf.subarray(p, p + Number(uzunluk[1]));
}

/**
 * PNG ongorucusunu (Predictor 15) geri alir. Tek kanal, 8 bit, `EN` sutun.
 * Tam bir PDF cozucusu bu isi kendi yapardi; depoda oyle bir sey yok ve
 * gereken tek sey bu.
 */
function ongorucuyuCoz(ham: Buffer): Buffer {
  const cikti = Buffer.alloc(EN * EN);
  let oku = 0;
  let onceki = Buffer.alloc(EN);
  for (let y = 0; y < EN; y++) {
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
 * Halka bandinin ic ve dis yaricapi. Elle yazilmiyor: dis yaricap maskenin
 * opak kaldigi en uzak nokta, ic yaricap ise halkanin (siyah) bittigi yer.
 * Amblem degisip oranlari kayarsa bu olcum kendini duzeltir.
 */
async function halkaBandi(pdf: Buffer, metin: string, maske: Buffer) {
  const { data: rgb } = await sharp(akis(pdf, metin, 12))
    .toColourspace("srgb")
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const merkez = EN / 2;
  let dis = 0;
  let icDolgu = 0;
  for (let y = 0; y < EN; y++) {
    for (let x = 0; x < EN; x++) {
      const i = y * EN + x;
      if (maske[i] < 128) continue;
      const r = Math.hypot(x + 0.5 - merkez, y + 0.5 - merkez);
      if (r > dis) dis = r;
      const k = i * 3;
      // Halka siyah, ic disk mor. Parlaklik ikisini ayirmaya yetiyor.
      const parlaklik = rgb[k] + rgb[k + 1] + rgb[k + 2];
      if (parlaklik >= 120 && r > icDolgu) icDolgu = r;
    }
  }
  return { dis, ic: icDolgu };
}

/** Halka bandindaki oyuklari (yaziyi) beyaz, gerisini siyah bir maskeye alir. */
function yaziMaskesi(maske: Buffer, ic: number, dis: number): Buffer {
  const merkez = EN / 2;
  const g = Buffer.alloc(EN * EN);
  for (let y = 0; y < EN; y++) {
    for (let x = 0; x < EN; x++) {
      const i = y * EN + x;
      const r = Math.hypot(x + 0.5 - merkez, y + 0.5 - merkez);
      // Iki kenardan da 3 birim pay: disk sinirindaki ve dis kenardaki
      // yumusak gecis pikselleri yaziya karismasin.
      g[i] = r > ic + 3 && r < dis - 3 ? 255 - maske[i] : 0;
    }
  }
  return g;
}

async function izle(png: Buffer): Promise<string> {
  const p = new Potrace({
    threshold: 128,
    // Yazi, siyah zemin uzerinde beyaz duruyor.
    blackOnWhite: false,
    // "I" harflerinin noktalari IZ_OLCU'de ~30 piksel; 4 onlari elemez.
    turdSize: 4,
    alphaMax: 1.0,
    optCurve: true,
    optTolerance: 0.6,
  });
  await new Promise<void>((coz, at) =>
    p.loadImage(png, (e) => (e ? at(e) : coz())),
  );
  const svg = p.getSVG();
  const d = / d="([^"]*)"/.exec(svg);
  if (!d) throw new Error("Potrace yol uretmedi");
  // Izleme tuvalinden amblem tuvaline: duz olcek, esnetme yok.
  const k = TUVAL / IZ_OLCU;
  return d[1].replace(/-?\d+\.?\d*/g, (s) =>
    String(Math.round(Number(s) * k * 100) / 100),
  );
}

async function main() {
  for (const y of [PDF, TABAN]) {
    if (!existsSync(y)) {
      console.error(`\nKaynak yok: ${y}\n`);
      process.exit(1);
    }
  }

  const pdf = readFileSync(PDF);
  // latin1: bayt <-> karakter birebir, arama yaparken hicbir bayt bozulmuyor.
  const metin = pdf.toString("latin1");
  const maske = ongorucuyuCoz(inflateSync(akis(pdf, metin, MASKE_NESNE)));

  const { ic, dis } = await halkaBandi(pdf, metin, maske);
  console.log(
    `  halka bandi: ${ic.toFixed(1)} - ${dis.toFixed(1)} (${EN} birimlik tuvalde)`,
  );

  const png = await sharp(yaziMaskesi(maske, ic, dis), {
    raw: { width: EN, height: EN, channels: 1 },
  })
    .resize(IZ_OLCU, IZ_OLCU, { kernel: "lanczos3" })
    .png()
    .toBuffer();

  const yaziYolu = await izle(png);

  /*
    Taban SVG'deki yol sirasi: 0 lime halka, 1 ic yesil daire, 2 piktogram,
    3 HALKA YAZISI, 4-10 alt wordmark harfleri. Yalniz 3 degisiyor.
    Sira degisirse asagidaki kontrol uyarir.
  */
  const taban = readFileSync(TABAN, "utf8");
  const yollar = [...taban.matchAll(/<path\b[^>]*\sd="([^"]*)"[^>]*>/g)];
  if (yollar.length !== 11) {
    console.error(`\nTaban logo beklenen yapida degil: ${yollar.length} yol\n`);
    process.exit(1);
  }

  let svg = taban.replace(
    yollar[3][0],
    // fill-rule: Potrace deligi (harflerin gozunu) dis konturla ayni yonde
    // ciziyor; evenodd olmadan "O" ve "C" dolu birer leke olarak cikiyor.
    `<path fill="#ffffff" fill-rule="evenodd" d="${yaziYolu}"/>`,
  );
  svg = svg.replace(
    /aria-label="[^"]*"/,
    `aria-label="Bambola, ${YENI_YAZI}"`,
  );

  mkdirSync("public/marka", { recursive: true });
  writeFileSync(SVG_HEDEF, svg);
  console.log(`  + ${SVG_HEDEF} (${svg.length} bayt)`);

  // schema.org `logo` ve sosyal paylasim icin: mutlak URL'den servis edilir,
  // 512 piksel her tuketici icin fazlasiyla yeter.
  const kamu = await sharp(Buffer.from(svg), { density: 300 })
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toBuffer();
  writeFileSync(PNG_HEDEF, kamu);
  console.log(`  + ${PNG_HEDEF} (512x512 · ${kamu.length} bayt)`);
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
