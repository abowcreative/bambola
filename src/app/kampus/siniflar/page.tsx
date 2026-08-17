import Link from "next/link";
import { rolZorunlu } from "@/lib/kampus/oturum";
import { siniflariGetir } from "@/lib/kampus/ogrenciler";
import { Kabuk, SayfaBasi, Kutu, Sayac } from "@/components/kampus/kabuk";
import { SinifUretButonu } from "@/components/kampus/sinif-uret-butonu";
import { OgretmenSecici } from "@/components/kampus/ogretmen-secici";
import { atolyeBul } from "@/lib/data/atolyeler";
import { GUN_ADI, GUNLER } from "@/lib/data/types";
import type { Gun } from "@/lib/data/types";
import { EKIP } from "@/lib/data/ekip";
import { Ikon } from "@/components/ui/ikon";

export const metadata = { title: "Sınıflar", robots: { index: false } };
export const dynamic = "force-dynamic";

const DONEM = "2026-2027";

export default async function SiniflarSayfasi() {
  const oturum = await rolZorunlu("admin", "ogretmen");
  const siniflar = await siniflariGetir(DONEM);

  const toplamKontenjan = siniflar.reduce((t, s) => t + s.kontenjan, 0);
  const toplamOgrenci = siniflar.reduce((t, s) => t + s.ogrenciSayisi, 0);
  const ogretmensiz = siniflar.filter((s) => !s.ogretmen_ad).length;

  /* Gune gore grupla: takvim mantigi panelde de korunuyor. */
  const gunlere = GUNLER.map((g) => ({
    gun: g,
    liste: siniflar.filter((s) => s.gun === g),
  })).filter((x) => x.liste.length > 0);

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/siniflar">
      <SayfaBasi
        baslik="Sınıflar"
        aciklama={`${DONEM} dönemi. Öğretmen ataması ve doluluk.`}
        /* Sinif varken ustte duruyor; hic yokken asagidaki bos durum
           kutusunda aciklamasiyla birlikte gosteriliyor, iki kez degil. */
        cocuklar={
          oturum.rol === "admin" && siniflar.length > 0 ? (
            <SinifUretButonu donem={DONEM} />
          ) : undefined
        }
      />

      {siniflar.length === 0 ? (
        <Kutu>
          <p className="leading-relaxed text-murekkep">
            Bu dönem için henüz sınıf açılmamış.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-murekkep-soluk">
            Sınıflar haftalık programdan üretiliyor: her seans için bir sınıf
            açılır, öğretmeni programdaki öğretmen olur, kontenjan 12 olur.
            Sonrasında her biri tek tek değiştirilebilir.
          </p>
          {oturum.rol === "admin" && (
            <div className="mt-4">
              <SinifUretButonu donem={DONEM} />
            </div>
          )}
        </Kutu>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            <Sayac etiket="Sınıf" deger={siniflar.length} />
            <Sayac
              etiket="Kayıtlı öğrenci"
              deger={toplamOgrenci}
              alt={`${toplamKontenjan} kontenjan`}
            />
            <Sayac
              etiket="Doluluk"
              deger={
                toplamKontenjan > 0
                  ? `%${Math.round((toplamOgrenci / toplamKontenjan) * 100)}`
                  : "—"
              }
            />
            <Sayac
              etiket="Öğretmensiz"
              deger={ogretmensiz}
              vurgu={ogretmensiz > 0}
            />
          </div>

          <div className="mt-6 space-y-4">
            {gunlere.map(({ gun, liste }) => (
              <Kutu key={gun} baslik={GUN_ADI[gun as Gun]}>
                <ul className="space-y-2">
                  {liste.map((s) => {
                    const doluluk =
                      s.kontenjan > 0 ? s.ogrenciSayisi / s.kontenjan : 0;
                    return (
                      <li
                        key={s.id}
                        className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-kart border-2 border-cizgi px-4 py-3"
                      >
                        <span className="shrink-0 font-baslik text-sm font-bold tabular-nums text-yesil-koyu">
                          {s.bas}
                        </span>

                        <Link
                          href={`/kampus/siniflar/${s.id}`}
                          className="min-w-0 flex-1"
                        >
                          <span className="block font-baslik text-sm font-bold text-murekkep hover:underline">
                            {s.atolye_slug
                              ? (atolyeBul(
                                  s.atolye_slug as Parameters<
                                    typeof atolyeBul
                                  >[0],
                                )?.ad ?? s.ad)
                              : s.ad}
                          </span>
                          <span className="mt-0.5 block text-xs text-murekkep-soluk">
                            {s.bas} - {s.bit}
                          </span>
                        </Link>

                        {/* --- doluluk --- */}
                        <span className="flex w-32 shrink-0 items-center gap-2">
                          <span className="h-2 flex-1 overflow-hidden rounded-full bg-krem-koyu">
                            <span
                              className={`block h-full rounded-full ${
                                doluluk >= 1
                                  ? "bg-murekkep-soluk"
                                  : doluluk >= 0.75
                                    ? "bg-yesil-koyu"
                                    : "bg-yesil"
                              }`}
                              style={{
                                width: `${Math.min(100, doluluk * 100)}%`,
                              }}
                            />
                          </span>
                          <span className="shrink-0 text-xs tabular-nums text-murekkep-soluk">
                            {s.ogrenciSayisi}/{s.kontenjan}
                          </span>
                        </span>

                        {oturum.rol === "admin" ? (
                          <OgretmenSecici
                            sinifId={s.id}
                            secili={s.ogretmen_ad}
                            adaylar={EKIP.map((o) => o.ad)}
                          />
                        ) : (
                          <span className="w-32 shrink-0 text-sm text-murekkep-soluk">
                            {s.ogretmen_ad ?? "—"}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </Kutu>
            ))}
          </div>

          {ogretmensiz > 0 && (
            <p className="mt-4 flex items-center gap-2 text-sm text-murekkep-soluk">
              <Ikon.Ampul boyut={15} />
              {ogretmensiz} sınıfın öğretmeni atanmamış.
            </p>
          )}
        </>
      )}
    </Kabuk>
  );
}
