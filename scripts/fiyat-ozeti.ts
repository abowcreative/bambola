/**
 * Fiyat listesi tasarimi icin ozet cikarir.
 * Calistirma: npx tsx scripts/fiyat-ozeti.ts
 *
 * Amac: hangi ailelerin fiyati ayni, yas araliklari nerede cakisiyor ve
 * katilim basina saat ucreti ne. Bunlar elle hesaplanmaz, veriden cikar.
 */

import { PAKETLER, indirimVarMi, indirimYuzdesi } from "../src/lib/data/ucretler";
import { AILELER } from "../src/lib/data/gruplar";
import type { ProgramAilesiSlug } from "../src/lib/data/types";

const KODLAR = ["tek-sefer", "ayda-4", "ayda-8", "ayda-12"] as const;
const tl = (n: number) => n.toLocaleString("tr-TR");

console.log("\n=== MATRIS (erken kayit / normal) ===\n");
console.log(
  "".padEnd(12) + AILELER.map((a) => a.kisaAd.slice(0, 18).padEnd(21)).join(""),
);
for (const kod of KODLAR) {
  const satir = AILELER.map((a) => {
    const p = a.paketler.find((x) => x.kod === kod);
    if (!p) return "-".padEnd(21);
    return (
      indirimVarMi(p)
        ? `${tl(p.erkenKayit)} (${tl(p.normal)})`
        : `${tl(p.normal)} (indirimsiz)`
    ).padEnd(21);
  });
  console.log(kod.padEnd(12) + satir.join(""));
}

console.log("\n=== FIYATI AYNI OLAN AILELER ===");
const imza = (s: ProgramAilesiSlug) =>
  PAKETLER[s].map((p) => `${p.kod}:${p.normal}/${p.erkenKayit}`).join(",");
const gruplar = new Map<string, string[]>();
for (const a of AILELER) {
  const k = imza(a.slug);
  gruplar.set(k, [...(gruplar.get(k) ?? []), a.ad]);
}
for (const [, adlar] of gruplar) {
  console.log(
    adlar.length > 1 ? "  AYNI  -> " + adlar.join("  =  ") : "  tekil -> " + adlar[0],
  );
}

console.log("\n=== YAS ARALIKLARI ===");
for (const a of AILELER) {
  console.log(`  ${a.ad.padEnd(28)} ${a.minAy}-${a.maxAy} ay`);
}

console.log("\n=== CAKISMA: bir yas birden fazla fiyata denk geliyor mu ===");
for (const ay of [8, 18, 24, 30, 34, 40]) {
  const uyan = AILELER.filter((a) => ay >= a.minAy && ay <= a.maxAy);
  const fiyatlar = new Set(
    uyan.map((a) => a.paketler.find((p) => p.kod === "ayda-4")?.erkenKayit),
  );
  console.log(
    `  ${String(ay).padStart(2)} aylik -> ${uyan.length} aile, ${fiyatlar.size} farkli "ayda 4" fiyati` +
      `  [${uyan.map((a) => a.kisaAd).join(", ")}]`,
  );
}

console.log("\n=== KATILIM BASINA SAAT VE SAAT UCRETI (turetilmis) ===");
for (const a of AILELER) {
  const saat = a.slug === "okula-hazirlik" ? 3 : 2;
  const p = a.paketler.find((x) => x.kod === "ayda-4");
  if (!p) continue;
  const toplamSaat = 4 * saat;
  console.log(
    `  ${a.ad.padEnd(28)} 1 katilim ${saat} saat | ayda 4 = ${toplamSaat} saat | ` +
      `saat basi ${Math.round(p.erkenKayit / toplamSaat)} TL`,
  );
}

console.log("\n=== INDIRIM ORANLARI ===");
for (const a of AILELER) {
  const satir = a.paketler
    .map((p) => `${p.kod} %${indirimYuzdesi(p)}`)
    .join("   ");
  console.log(`  ${a.kisaAd.padEnd(20)} ${satir}`);
}
console.log();
