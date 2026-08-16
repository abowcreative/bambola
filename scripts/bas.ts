/**
 * HTML belgeleri ciktiya cevirir. Calistirma: npm run bas
 *
 *   docs/*.html         -> A4 PDF
 *   docs/sosyal/*.html  -> 1080x1350 PNG
 *
 * Sosyal postlarda ayrica tasma kontrolu yapilir: son icerik blogunun alti
 * alttaki iletisim seridinin ustunu geciyorsa hata verir. Bu kontrol elle
 * bakmakla bulunmayan uc hatayi yakaladi, o yuzden duruyor.
 */

import { readdirSync, existsSync } from "node:fs";
import puppeteer, { type Browser } from "puppeteer-core";

const CHROME_ADAYLARI = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
];

function chromeYolu() {
  const yol = CHROME_ADAYLARI.find((y) => existsSync(y));
  if (!yol) {
    throw new Error(
      "Chrome bulunamadi. CHROME_ADAYLARI listesine kendi yolunuzu ekleyin.",
    );
  }
  return yol;
}

const dosyalar = (klasor: string) =>
  existsSync(klasor)
    ? readdirSync(klasor)
        .filter((d) => d.endsWith(".html"))
        .map((d) => d.replace(/\.html$/, ""))
    : [];

/**
 * A4 yuksekligi. Bir `.sayfa` kutusu bunu asarsa Chrome kutuyu iki kagida
 * boler: blok ortadan ikiye ayrilir. Ekran goruntusu bunu GOSTERMEZ, cunku
 * eleman fotografi kutuyu butun haliyle cekiyor. Bu yuzden olcum sart.
 */
const A4_MM = 297;
const MM = 96 / 25.4;

async function pdfBas(t: Browser, ad: string) {
  const s = await t.newPage();
  await s.goto(`file:///${process.cwd().replace(/\\/g, "/")}/docs/${ad}.html`, {
    waitUntil: "networkidle0",
  });

  const kutular: number[] = await s.evaluate(
    (mm) =>
      [...document.querySelectorAll(".sayfa")].map(
        (e) => Math.round((e.getBoundingClientRect().height / mm) * 10) / 10,
      ),
    MM,
  );

  await s.pdf({
    path: `docs/${ad}.pdf`,
    format: "A4",
    printBackground: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });
  await s.close();

  const tasan = kutular
    .map((h, i) => ({ no: i + 1, h }))
    .filter((x) => x.h > A4_MM + 0.5);

  console.log(`  docs/${ad}.pdf  ${kutular.length} sayfa`);
  for (const x of tasan) {
    console.log(`     ! sayfa ${x.no}: ${x.h}mm, A4'u ${Math.round(x.h - A4_MM)}mm asiyor`);
  }
  return tasan.length > 0;
}

async function pngBas(t: Browser, ad: string) {
  const s = await t.newPage();
  await s.setViewport({ width: 1080, height: 1350 });
  await s.goto(
    `file:///${process.cwd().replace(/\\/g, "/")}/docs/sosyal/${ad}.html`,
    { waitUntil: "networkidle0" },
  );

  const tasma = await s.evaluate(() => {
    const son = document.querySelector(".kartlar, .akis");
    const serit = document.querySelector(".serit");
    if (!son || !serit) return -1;
    return Math.round(
      son.getBoundingClientRect().bottom - serit.getBoundingClientRect().top,
    );
  });

  const kare = await s.$(".kare");
  if (!kare) throw new Error(`${ad}: .kare bulunamadi`);
  await kare.screenshot({ path: `docs/sosyal/${ad}.png` });
  await s.close();

  console.log(`  docs/sosyal/${ad}.png${tasma > 2 ? `  TASMA +${tasma}px` : ""}`);
  return tasma > 2;
}

// tsx cjs cikardigi icin ust duzey await yok, hepsi bu sarmalda.
async function calis() {
  const t = await puppeteer.launch({
    executablePath: chromeYolu(),
    headless: true,
    args: ["--no-sandbox"],
  });

  console.log("basiliyor:");

  let tasanPdf = 0;
  for (const ad of dosyalar("docs")) {
    if (await pdfBas(t, ad)) tasanPdf++;
  }

  let tasanPost = 0;
  for (const ad of dosyalar("docs/sosyal")) {
    if (await pngBas(t, ad)) tasanPost++;
  }

  await t.close();

  if (tasanPdf > 0) {
    console.error(
      `\n${tasanPdf} belgede sayfa kutusu A4'u asiyor, baskida bloklar bolunur.`,
    );
  }
  if (tasanPost > 0) {
    console.error(`\n${tasanPost} postta icerik seridin altina tasiyor.`);
  }
  if (tasanPdf > 0 || tasanPost > 0) process.exit(1);
}

calis();
