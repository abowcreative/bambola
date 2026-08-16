/**
 * .env.local icindeki degiskenleri Vercel'e tasir.
 * Calistirma: npm run env:vercel
 *
 * NEDEN VAR: anahtarlarin degeri hicbir yerde EKRANA BASILMIYOR. Sadece
 * degisken adlari ve sonuc goruluyor. Panelden tek tek kopyala-yapistir
 * yapmak hem sikici hem de anahtari ekranda/panoda dolastiriyor.
 *
 * Zaten tanimli olan degiskenler ATLANIR; ustune yazmak icin once
 * `vercel env rm <ad> <ortam>` calistirin.
 */

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

/** Hangi degisken hangi ortamlara gider. */
const TASINACAK = [
  { ad: "NEXT_PUBLIC_SITE_URL", ortamlar: ["production", "preview", "development"] },
  { ad: "NEXT_PUBLIC_SUPABASE_URL", ortamlar: ["production", "preview", "development"] },
  { ad: "NEXT_PUBLIC_SUPABASE_ANON_KEY", ortamlar: ["production", "preview", "development"] },
  // Service role anahtari yalniz sunucuda kullaniliyor ve RLS'i atliyor.
  // development ortamina gonderilmiyor: yerelde zaten .env.local'den okunuyor.
  { ad: "SUPABASE_SERVICE_ROLE_KEY", ortamlar: ["production", "preview"] },
  { ad: "RESEND_API_KEY", ortamlar: ["production", "preview"] },
  { ad: "BILDIRIM_ALICI", ortamlar: ["production", "preview"] },
  { ad: "BILDIRIM_GONDEREN", ortamlar: ["production", "preview"] },
  { ad: "NEXT_PUBLIC_META_PIXEL_ID", ortamlar: ["production", "preview"] },
];

/* Vercel'in kendi yazdigi degiskenler tasinmaz: OIDC belirteci her
   `vercel link` calismasinda yenileniyor, panele elle konmaz. */
const ATLANACAK = new Set(["VERCEL_OIDC_TOKEN"]);

/**
 * Yerel gelistirme degeri yayina gonderilmemeli.
 *
 * Bu kontrol bir hatanin ardindan eklendi: betigin ilk hali
 * `.env.local` icindeki `NEXT_PUBLIC_SITE_URL=http://localhost:3939`
 * degerini oldugu gibi production'a yazdi. Fark edilmeseydi sitenin butun
 * kanonik URL'leri, sitemap'i ve OG kartlari localhost gosterecekti --
 * hicbir yerde hata vermeden.
 */
const YEREL_IZLERI = /localhost|127\.0\.0\.1|0\.0\.0\.0|\.local(?::|\/|$)/i;
const YAYIN_ORTAMLARI = new Set(["production", "preview"]);

function ortamOku(dosya = ".env.local") {
  if (!existsSync(dosya)) return {};
  const cikti = {};
  for (const satir of readFileSync(dosya, "utf8").split(/\r?\n/)) {
    const kirp = satir.trim();
    if (!kirp || kirp.startsWith("#")) continue;
    const esit = kirp.indexOf("=");
    if (esit < 0) continue;
    const ad = kirp.slice(0, esit).trim();
    let deger = kirp.slice(esit + 1).trim();
    if (
      (deger.startsWith('"') && deger.endsWith('"')) ||
      (deger.startsWith("'") && deger.endsWith("'"))
    ) {
      deger = deger.slice(1, -1);
    }
    if (deger) cikti[ad] = deger;
  }
  return cikti;
}

const ortam = ortamOku();
if (!Object.keys(ortam).length) {
  console.error("\n.env.local bulunamadi veya bos.\n");
  process.exit(1);
}

/** Vercel'de hali hazirda tanimli olanlar. Degerleri okunmuyor, yalniz adlar. */
function mevcutlar() {
  const s = spawnSync("vercel", ["env", "ls"], {
    encoding: "utf8",
    shell: true,
  });
  const metin = `${s.stdout ?? ""}`;
  const set = new Set();
  for (const ad of TASINACAK.map((t) => t.ad)) {
    if (new RegExp(`^\\s*${ad}\\s`, "m").test(metin)) set.add(ad);
  }
  return set;
}

const tanimli = mevcutlar();
let eklenen = 0;
let atlanan = 0;
console.log("");

for (const { ad, ortamlar } of TASINACAK) {
  if (ATLANACAK.has(ad)) continue;

  const deger = ortam[ad];
  if (!deger) {
    console.log(`  - ${ad.padEnd(30)} .env.local icinde bos, atlandi`);
    atlanan++;
    continue;
  }
  if (tanimli.has(ad)) {
    console.log(`  - ${ad.padEnd(30)} Vercel'de zaten var, atlandi`);
    atlanan++;
    continue;
  }

  let hepsiTamam = true;
  const gonderilen = [];
  const yerelKaldi = [];

  for (const o of ortamlar) {
    // Yerel deger yayin ortamina gitmez ama development'ta DOGRU degerdir.
    if (YAYIN_ORTAMLARI.has(o) && YEREL_IZLERI.test(deger)) {
      yerelKaldi.push(o);
      continue;
    }

    // Deger STDIN ile gidiyor: komut satirinda gorunmuyor, kabuk
    // gecmisine de dusmuyor.
    const s = spawnSync("vercel", ["env", "add", ad, o], {
      input: `${deger}\n`,
      encoding: "utf8",
      shell: true,
    });
    if (s.status === 0) {
      gonderilen.push(o);
    } else {
      hepsiTamam = false;
      const hata = `${s.stderr ?? ""}`.trim().split("\n").pop();
      console.error(`  x ${ad.padEnd(30)} ${o}: ${hata}`);
    }
  }

  if (gonderilen.length) {
    console.log(`  + ${ad.padEnd(30)} ${gonderilen.join(", ")}`);
    eklenen++;
  }
  if (yerelKaldi.length) {
    console.log(
      `  ! ${"".padEnd(30)} ${yerelKaldi.join(", ")} ATLANDI: deger yerel (${deger})`,
    );
    if (!gonderilen.length) atlanan++;
  }
  if (!hepsiTamam && !gonderilen.length && !yerelKaldi.length) atlanan++;
}

console.log(`\n${eklenen} degisken tasindi, ${atlanan} atlandi.`);
console.log("Yayin adresi belli olunca: vercel env add NEXT_PUBLIC_SITE_URL production\n");
