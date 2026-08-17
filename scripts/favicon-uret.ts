/**
 * Favicon ve uygulama ikonlarini marka logosundan uretir.
 * Calistirma: npm run favicon
 *
 * NEDEN VAR: `src/app/favicon.ico` create-next-app'in varsayilan dosyasiydi
 * (25.931 bayt, Next.js ikonu). Iki sitede de markanin ikonu gorunmuyordu.
 *
 * Logo oldugu gibi kullanilmiyor. Iki sebep:
 *  1. Halkadaki "KIDS ZONE & PARTY HOUSE" yazisi 16 pikselde okunmuyor,
 *     bulanik bir seride donusuyor.
 *  2. Musteri o ifadenin kullanilmamasini istedi (PLAN.md Bolum 14 madde 8);
 *     favicon her sekmede gorunen bir yer ve orada durmasi dogru degil.
 *
 * Uretilen: yesil daire + ince lime cerceve + ortalanmis piktogram.
 * 16 piksel icin cerceveSIZ ve figuru daha buyuk ayri bir surum var; o
 * boyutta cerceve capin ucte birini yiyip figure yer birakmiyor.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].find((y) => existsSync(y));

const KAYNAK = "marka/bambola-kids-zone.svg";
const APP = "src/app";
const PUBLIC_MARKA = "public/marka";

/** Marka renkleri. src/app/globals.css ile ayni degerler. */
const LIME = "#bdf270";
const YESIL = "#588f27";

type Yol = { d: string };

function yollariOku(): Yol[] {
  const kaynak = readFileSync(KAYNAK, "utf8");
  return [...kaynak.matchAll(/<path\b[^>]*\sd="([^"]*)"[^>]*>/g)].map((m) => ({
    d: m[1],
  }));
}

async function main() {
  if (!existsSync(KAYNAK)) {
    console.error(`\nKaynak logo yok: ${KAYNAK}\n`);
    process.exit(1);
  }

  const yollar = yollariOku();
  /*
    Logodaki yol sirasi: 0 lime halka, 1 ic yesil daire, 2 piktogram,
    3 halka yazisi, 4-10 alt wordmark. Yalniz ilk uc kullaniliyor.
    Logo degisirse bu sira dogrulanmali; asagidaki kontrol en azindan
    dosyanin beklenen yapida oldugunu sinar.
  */
  if (yollar.length < 3) {
    console.error("\nLogo beklenen yapida degil: en az uc yol gerekiyor.\n");
    process.exit(1);
  }
  const figur = yollar[2];

  const tarayici = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
  });
  const sayfa = await tarayici.newPage();

  // Figurun sinir kutusu: ortalama ve olcekleme icin gerekli.
  await sayfa.setContent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
       <path id="f" d="${figur.d}" fill="#fff"/>
     </svg>`,
  );
  const kutu = (await sayfa.evaluate(`(() => {
    const b = document.getElementById("f").getBBox();
    return { x: b.x, y: b.y, w: b.width, h: b.height };
  })()`)) as { x: number; y: number; w: number; h: number };

  /** Figuru 1000 birimlik tuvale ortalayip verilen uzun kenara olcekler. */
  function figurKatmani(hedefUzunKenar: number): string {
    const olcek = hedefUzunKenar / Math.max(kutu.w, kutu.h);
    const dx = (1000 - kutu.w * olcek) / 2 - kutu.x * olcek;
    const dy = (1000 - kutu.h * olcek) / 2 - kutu.y * olcek;
    return `<g transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)}) scale(${olcek.toFixed(4)})"><path d="${figur.d}" fill="#ffffff"/></g>`;
  }

  /**
   * @param cerceve lime cercevenin kalinligi (1000 birimlik tuvalde).
   *   0 = cerceve yok, kucuk boyutlar icin.
   * @param figurBoy figurun uzun kenari.
   */
  function ikon(cerceve: number, figurBoy: number): string {
    const r = 498;
    const icR = r - cerceve;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
  <title>Bambola</title>
${cerceve > 0 ? `  <circle cx="500" cy="500" r="${r}" fill="${LIME}"/>\n` : ""}  <circle cx="500" cy="500" r="${icR}" fill="${YESIL}"/>
${figurKatmani(figurBoy)}
</svg>
`;
  }

  /*
    Iki surum:
    - genis: 32 piksel ve ustu. Ince lime cerceve markayi hatirlatiyor.
    - kucuk: 16 piksel. Cerceve yok, figur daha buyuk; o boyutta cerceve
      capin ucte birini yiyip figure yer birakmiyor.
  */
  const genis = ikon(30, 620);
  const kucuk = ikon(0, 760);

  mkdirSync(APP, { recursive: true });
  mkdirSync(PUBLIC_MARKA, { recursive: true });

  /*
    `src/app/icon.svg`: Next bunu otomatik olarak <link rel="icon"> yapiyor.
    Vektor oldugu icin her boyutta keskin.
  */
  writeFileSync(`${APP}/icon.svg`, genis);
  console.log("  + src/app/icon.svg");

  /** Verilen SVG'yi istenen boyutta PNG'ye cevirir. */
  async function png(svg: string, boyut: number): Promise<Buffer> {
    const veri =
      "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
    await sayfa.setViewport({ width: boyut, height: boyut, deviceScaleFactor: 1 });
    await sayfa.setContent(
      `<body style="margin:0;width:${boyut}px;height:${boyut}px">
         <img src="${veri}" width="${boyut}" height="${boyut}" style="display:block">
       </body>`,
    );
    await new Promise((r) => setTimeout(r, 200));
    return Buffer.from(
      await sayfa.screenshot({
        omitBackground: true,
        clip: { x: 0, y: 0, width: boyut, height: boyut },
      }),
    );
  }

  /*
    apple-icon: iOS ana ekran ikonu. Saydam degil, DOLU olmali; iOS
    saydamligi siyaha ceviriyor. Bu yuzden zemin lime dolduruluyor.
  */
  const elmaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
  <rect width="1000" height="1000" fill="${LIME}"/>
  <circle cx="500" cy="500" r="440" fill="${YESIL}"/>
${figurKatmani(560)}
</svg>
`;
  writeFileSync(`${APP}/apple-icon.png`, await png(elmaSvg, 180));
  console.log("  + src/app/apple-icon.png (180x180)");

  // Sosyal medya ve schema.org icin duz PNG.
  writeFileSync(`${PUBLIC_MARKA}/ikon-512.png`, await png(genis, 512));
  console.log("  + public/marka/ikon-512.png");

  /*
    favicon.ico: ICO kabina PNG gomuluyor (Vista+ ve butun modern
    tarayicilar destekliyor). Iki boyut var ve 16 piksel CERCEVESIZ
    surumden geliyor.
  */
  const parcalar = [
    { boyut: 16, veri: await png(kucuk, 16) },
    { boyut: 32, veri: await png(genis, 32) },
    { boyut: 48, veri: await png(genis, 48) },
  ];
  writeFileSync(`${APP}/favicon.ico`, icoKur(parcalar));
  console.log(
    `  + src/app/favicon.ico (16 cercevesiz, 32, 48 · ${parcalar.reduce((t, p) => t + p.veri.length, 0)} bayt yuk)`,
  );

  await tarayici.close();
  console.log("");
}

/**
 * PNG'lerden ICO dosyasi kurar.
 *
 * Bicim: 6 baytlik dizin basligi, her goruntu icin 16 baytlik giris,
 * sonra PNG yukleri. Genislik/yukseklik 1 bayt; 256 icin 0 yazilir.
 */
function icoKur(parcalar: { boyut: number; veri: Buffer }[]): Buffer {
  const baslik = Buffer.alloc(6);
  baslik.writeUInt16LE(0, 0); // ayrilmis
  baslik.writeUInt16LE(1, 2); // tur: ikon
  baslik.writeUInt16LE(parcalar.length, 4);

  const girisler: Buffer[] = [];
  let konum = 6 + parcalar.length * 16;

  for (const p of parcalar) {
    const g = Buffer.alloc(16);
    g.writeUInt8(p.boyut >= 256 ? 0 : p.boyut, 0);
    g.writeUInt8(p.boyut >= 256 ? 0 : p.boyut, 1);
    g.writeUInt8(0, 2); // palet yok
    g.writeUInt8(0, 3); // ayrilmis
    g.writeUInt16LE(1, 4); // duzlem
    g.writeUInt16LE(32, 6); // bit derinligi
    g.writeUInt32LE(p.veri.length, 8);
    g.writeUInt32LE(konum, 12);
    girisler.push(g);
    konum += p.veri.length;
  }

  return Buffer.concat([
    baslik,
    ...girisler,
    ...parcalar.map((p) => p.veri),
  ]);
}

main().catch((h) => {
  console.error("\nHata:", h instanceof Error ? h.message : h);
  process.exit(1);
});
