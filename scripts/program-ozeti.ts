/** Haftalik programi ekrana basar. Calistirma: npx tsx scripts/program-ozeti.ts */
import { gunSlotlari } from "../src/lib/data/program";
import { GUNLER, GUN_ADI } from "../src/lib/data/types";
import { atolyeBul } from "../src/lib/data/atolyeler";

for (const g of GUNLER) {
  const s = gunSlotlari(g);
  console.log(
    GUN_ADI[g].padEnd(11) + String(s.length).padStart(2) + " slot  " +
      s
        .map(
          (x) =>
            `${x.bas}-${x.bit} ${atolyeBul(x.atolyeSlug)?.kisaAd ?? x.atolyeSlug} (${x.yas.etiket})`,
        )
        .join("  |  "),
  );
}
