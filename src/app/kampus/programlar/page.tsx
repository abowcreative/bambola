import { rolZorunlu } from "@/lib/kampus/oturum";
import { Kabuk, SayfaBasi, Kutu, Sayac } from "@/components/kampus/kabuk";
import { ATOLYELER } from "@/lib/data/atolyeler";
import { AILELER } from "@/lib/data/gruplar";
import { SLOTLAR } from "@/lib/data/program";
import { atolyeOgretmenleri } from "@/lib/data/ekip";
import { DIL_ETIKET, GUN_ADI } from "@/lib/data/types";
import { DinamikIkon } from "@/components/ui/ikon";

export const metadata = { title: "Programlar", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * Atolyeler ve program aileleri.
 *
 * Ayni veri hem sitede hem burada. Panelde fazladan gorunen sey: her
 * atolyenin haftalik seans sayisi, hangi gunlerde ve kimin verdigi.
 */
export default async function ProgramlarSayfasi() {
  const oturum = await rolZorunlu("admin", "ogretmen");

  const liste = ATOLYELER.map((a) => {
    const slotlar = SLOTLAR.filter((s) => s.atolyeSlug === a.slug);
    return {
      atolye: a,
      slotlar,
      gunler: [...new Set(slotlar.map((s) => s.gun))],
      ogretmenler: atolyeOgretmenleri(a.slug),
      aile: AILELER.find((f) => f.slug === a.ailesi),
    };
  });

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/programlar">
      <SayfaBasi
        baslik="Programlar"
        aciklama="Atölyeler, yaş aralıkları ve haftalık dağılımları."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Sayac etiket="Atölye" deger={ATOLYELER.length} />
        <Sayac etiket="Program ailesi" deger={AILELER.length} />
        <Sayac etiket="Haftalık seans" deger={SLOTLAR.length} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {liste.map(({ atolye, slotlar, gunler, ogretmenler, aile }) => (
          <Kutu key={atolye.slug}>
            <div className="flex gap-3">
              <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-lime-rozet text-black">
                <DinamikIkon ad={atolye.ikon} boyut={20} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-baslik text-base font-bold leading-snug text-murekkep">
                  {atolye.ad}
                </h2>
                <p className="mt-0.5 text-sm text-murekkep-soluk">
                  {atolye.yasEtiket}
                  {atolye.dil !== "tr" && ` · ${DIL_ETIKET[atolye.dil]}`}
                  {aile && ` · ${aile.kisaAd}`}
                </p>
              </div>
              <span className="shrink-0 text-right">
                <span className="block font-baslik text-lg font-bold tabular-nums text-yesil-koyu">
                  {slotlar.length}
                </span>
                <span className="block text-xs text-murekkep-soluk">seans</span>
              </span>
            </div>

            {atolye.olgular.length > 0 && (
              <ul className="mt-3 space-y-1">
                {atolye.olgular.slice(0, 3).map((o) => (
                  <li
                    key={o}
                    className="text-sm leading-snug text-murekkep-soluk"
                  >
                    · {o}
                  </li>
                ))}
              </ul>
            )}

            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-cizgi pt-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-murekkep-soluk">
                  Günler
                </dt>
                <dd className="mt-0.5 font-medium text-murekkep">
                  {gunler.length > 0
                    ? gunler.map((g) => GUN_ADI[g].slice(0, 3)).join(", ")
                    : "Program içinde"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-murekkep-soluk">
                  Öğretmen
                </dt>
                <dd className="mt-0.5 font-medium text-murekkep">
                  {ogretmenler.length > 0
                    ? ogretmenler.map((o) => o.ad).join(", ")
                    : "—"}
                </dd>
              </div>
            </dl>
          </Kutu>
        ))}
      </div>
    </Kabuk>
  );
}
