import { rolZorunlu } from "@/lib/kampus/oturum";
import { Kabuk, SayfaBasi, Kutu, Sayac } from "@/components/kampus/kabuk";
import { SLOTLAR, gunSlotlari, PAZAR_NOTU } from "@/lib/data/program";
import { atolyeBul } from "@/lib/data/atolyeler";
import { GUNLER, GUN_ADI, DIL_ETIKET } from "@/lib/data/types";
import { EKIP } from "@/lib/data/ekip";

export const metadata = { title: "Haftalık takvim", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * Kurumun haftalik programi. Veri `src/lib/data/program.ts` icinden geliyor,
 * yani sitedekiyle AYNI kaynak. Ayri bir kopya tutulsaydi biri degisip
 * digeri kalirdi.
 *
 * Ogretmen de goruyor: kendi seanslarini bulabilmesi icin. Kendi adi
 * vurgulaniyor.
 */
export default async function TakvimSayfasi() {
  const oturum = await rolZorunlu("admin", "ogretmen");

  const gunler = GUNLER.map((g) => ({ gun: g, slotlar: gunSlotlari(g) }));
  const acikGun = gunler.filter((g) => g.slotlar.length > 0).length;

  /* Ogretmen basina haftalik yuk: kadro dengesini gosteren tek sayi. */
  const yuk = EKIP.map((o) => ({
    ad: o.ad,
    sayi: SLOTLAR.filter((s) => s.ogretmenler.includes(o.ad)).length,
  })).sort((a, b) => b.sayi - a.sayi);

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/takvim">
      <SayfaBasi
        baslik="Haftalık takvim"
        aciklama="Kurumun ders programı. Web sitesindekiyle aynı kaynaktan gelir."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Sayac etiket="Haftalık seans" deger={SLOTLAR.length} />
        <Sayac etiket="Açık gün" deger={acikGun} alt="haftada" />
        <Sayac
          etiket="En yoğun"
          deger={yuk[0]?.ad ?? "—"}
          alt={yuk[0] ? `${yuk[0].sayi} seans` : undefined}
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {gunler.map(({ gun, slotlar }) => (
          <Kutu
            key={gun}
            baslik={GUN_ADI[gun]}
            yanCocuk={
              <span className="text-sm text-murekkep-soluk">
                {slotlar.length > 0 ? `${slotlar.length} seans` : "kapalı"}
              </span>
            }
          >
            {slotlar.length === 0 ? (
              <p className="py-4 text-sm text-murekkep-soluk">
                Grup programı yok.
              </p>
            ) : (
              <ul className="space-y-2">
                {slotlar.map((s) => {
                  const benim =
                    oturum.ogretmenAd != null &&
                    s.ogretmenler.includes(oturum.ogretmenAd);
                  return (
                    <li
                      key={s.id}
                      className={`flex flex-wrap items-start gap-x-4 gap-y-1 rounded-kart border-2 px-4 py-3 ${
                        benim ? "border-yesil bg-lime-rozet/20" : "border-cizgi"
                      }`}
                    >
                      <span className="shrink-0 font-baslik text-sm font-bold tabular-nums text-yesil-koyu">
                        {s.bas} - {s.bit}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-baslik text-sm font-bold text-murekkep">
                          {atolyeBul(s.atolyeSlug)?.ad ?? s.atolyeSlug}
                        </span>
                        <span className="mt-0.5 block text-xs text-murekkep-soluk">
                          {s.yas.etiket}
                          {s.yas.ebeveynsiz && " · ebeveynsiz"}
                          {s.dil !== "tr" && ` · ${DIL_ETIKET[s.dil]}`}
                          {s.tekSeferMumkun && " · tek katılım açık"}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-murekkep-soluk">
                        {s.ogretmenler.length > 0
                          ? s.ogretmenler.join(", ")
                          : "—"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Kutu>
        ))}
      </div>

      <Kutu baslik="Öğretmen yükü" className="mt-4">
        <ul className="space-y-2">
          {yuk.map((o) => (
            <li key={o.ad} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-sm font-medium text-murekkep">
                {o.ad}
              </span>
              {/* Cubuk en yogun ogretmene gore olceklendi. */}
              <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-krem-koyu">
                <span
                  className="block h-full rounded-full bg-yesil"
                  style={{ width: `${(o.sayi / (yuk[0]?.sayi || 1)) * 100}%` }}
                />
              </span>
              <span className="w-16 shrink-0 text-right text-sm tabular-nums text-murekkep-soluk">
                {o.sayi} seans
              </span>
            </li>
          ))}
        </ul>
      </Kutu>

      <p className="mt-4 text-sm leading-relaxed text-murekkep-soluk">
        {PAZAR_NOTU} Öğle arası her gün 12.30 - 13.30 arasındadır.
      </p>
    </Kabuk>
  );
}
