/**
 * Mekan fotograflarini kaynak paketten alip `public/foto/` altina hazirlar.
 * Calistirma: npm run foto
 *
 * Kaynak paket depoda durmuyor (yuzlerce MB PNG). Yol FOTO_KAYNAK ortam
 * degiskeninden veya asagidaki varsayilandan okunur.
 *
 * Paketin yapisi:
 *   01_Duzenlenmis_Ana_Fotograflar/   20 kare, 1086x1448 dikey PNG
 *   02_Web_Olculeri/01_Galeri_1600x1200/  10 karenin 4:3 yatay hali
 *   02_Web_Olculeri/02_Kapak_1920x1080/    5 karenin 16:9 genis hali
 *
 * Uretilen:
 *   public/foto/<slug>.jpg        her kare icin tek asil dosya.
 *                                 Yatay hali varsa 1600x1200, yoksa dikey PNG.
 *   public/foto/<slug>-genis.jpg  16:9 hali olan bes kare icin.
 *   public/foto/og-kapak.png      OG karti icin 1200x630.
 *   public/ekip/<slug>.jpg        ogretmen portreleri, 1080x1350 (4:5).
 *
 * Ogretmen portreleri `kaynak/ekip-fotograflari/` altindaki PNG'lerden gelir.
 * Ham dosyalar bilerek `public/` disinda: uc portre 5,6 MB ve olduklari gibi
 * yayina cikmalarinin anlami yok.
 *
 * Kirpma yapilmaz: her yerlesim kendi oranini `object-cover` ile aliyor.
 * next/image gerisini (WebP, olcekler) kendi hallediyor.
 */

import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const KAYNAK =
  process.env.FOTO_KAYNAK ??
  "D:/Abow Creative/Bambola/Bambola_Web_Fotograf_Paketi";

const ANA = path.join(KAYNAK, "01_Duzenlenmis_Ana_Fotograflar");
const YATAY = path.join(KAYNAK, "02_Web_Olculeri/01_Galeri_1600x1200");
const GENIS = path.join(KAYNAK, "02_Web_Olculeri/02_Kapak_1920x1080");
const HEDEF = "public/foto";
const EKIP_KAYNAK = "kaynak/ekip-fotograflari";
const EKIP_HEDEF = "public/ekip";

/** OG kartinda kullanilan kare. src/app/opengraph-image.tsx bunu okur. */
const OG_KARE = "bambola-top-havuzu-01";

/** Dosya adindan olcu ekini ve uzantiyi atip slug birakir. */
const slugla = (dosya: string) =>
  dosya.replace(/-\d+x\d+(?=\.)/, "").replace(/\.(png|jpg|jpeg)$/i, "");

function dizin(yol: string) {
  if (!existsSync(yol)) {
    throw new Error(
      `Kaynak klasor yok: ${yol}\nFOTO_KAYNAK ortam degiskeniyle paketin yolunu verin.`,
    );
  }
  return Object.fromEntries(
    readdirSync(yol)
      .filter((d) => /\.(png|jpg|jpeg)$/i.test(d))
      .map((d) => [slugla(d), path.join(yol, d)]),
  );
}

async function yaz(kaynak: string, hedef: string) {
  const bilgi = await sharp(kaynak)
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(hedef);
  return bilgi;
}

async function main() {
  const ana = dizin(ANA);
  const yatay = dizin(YATAY);
  const genis = dizin(GENIS);

  // Her calistirmada temiz baslasin ki silinen kare artik dosya birakmasin.
  rmSync(HEDEF, { recursive: true, force: true });
  mkdirSync(HEDEF, { recursive: true });

  const satirlar: string[] = [];

  for (const slug of Object.keys(ana).sort()) {
    // Yatay hali varsa onu tercih ediyoruz: hem daha genis kadraj hem daha
    // yuksek cozunurluk (1600x1200 > 1086x1448 dikey kirpim).
    const kaynak = yatay[slug] ?? ana[slug];
    const b = await yaz(kaynak, `${HEDEF}/${slug}.jpg`);
    satirlar.push(
      `${slug.padEnd(42)} ${String(b.width).padStart(4)}x${String(b.height).padEnd(4)} ${String(Math.round(b.size / 1024)).padStart(4)}KB${yatay[slug] ? "" : "  (dikey)"}`,
    );

    if (genis[slug]) {
      const g = await yaz(genis[slug], `${HEDEF}/${slug}-genis.jpg`);
      satirlar.push(
        `${(slug + "-genis").padEnd(42)} ${String(g.width).padStart(4)}x${String(g.height).padEnd(4)} ${String(Math.round(g.size / 1024)).padStart(4)}KB`,
      );
    }
  }

  /*
    OG karti icin ayri bir kare.
    `progressive: false` SART: next/og (Satori + resvg) progressive JPEG'i
    cozemiyor, "Input buffer contains unsupported image format" ile 500
    donuyor. Sitedeki diger kareler progressive kalabilir, cunku onlari
    next/image zaten WebP'ye ceviriyor.
  */
  const ogKaynak = genis[OG_KARE] ?? yatay[OG_KARE] ?? ana[OG_KARE];
  if (!ogKaynak) throw new Error(`OG karesi bulunamadi: ${OG_KARE}`);
  const og = await sharp(ogKaynak)
    .resize(1200, 630, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toFile(`${HEDEF}/og-kapak.png`);
  satirlar.push(
    `${"og-kapak".padEnd(42)} ${String(og.width).padStart(4)}x${String(og.height).padEnd(4)} ${String(Math.round(og.size / 1024)).padStart(4)}KB  (PNG)`,
  );

  // --- ogretmen portreleri ---
  rmSync(EKIP_HEDEF, { recursive: true, force: true });
  mkdirSync(EKIP_HEDEF, { recursive: true });
  const portreler = dizin(EKIP_KAYNAK);
  for (const slug of Object.keys(portreler).sort()) {
    const p = await sharp(portreler[slug])
      .resize(1080, 1350, { fit: "cover" })
      .jpeg({ quality: 84, progressive: true, mozjpeg: true })
      .toFile(`${EKIP_HEDEF}/${slug}.jpg`);
    satirlar.push(
      `${("ekip/" + slug).padEnd(42)} ${String(p.width).padStart(4)}x${String(p.height).padEnd(4)} ${String(Math.round(p.size / 1024)).padStart(4)}KB`,
    );
  }

  for (const s of satirlar) console.log(s);
  console.log(`\n${satirlar.length} dosya yazildi.`);
}

main();
