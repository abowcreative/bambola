import Link from "next/link";
import { rolZorunlu } from "@/lib/kampus/oturum";
import { siniflariGetir } from "@/lib/kampus/ogrenciler";
import { Kabuk, SayfaBasi, Kutu } from "@/components/kampus/kabuk";
import {
  Bildirim,
  BosDurum,
  Ilerleme,
  Rozet,
  Sayac,
} from "@/components/kampus/ui";
import { SinifUretButonu } from "@/components/kampus/sinif-uret-butonu";
import { SinifFormu } from "@/components/kampus/sinif-formu";
import { OgretmenSecici } from "@/components/kampus/ogretmen-secici";
import { atolyeBul, ATOLYELER } from "@/lib/data/atolyeler";
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
  const yonetici = oturum.rol === "admin";

  const acikOlanlar = siniflar.filter((s) => s.aktif);
  const toplamKontenjan = acikOlanlar.reduce((t, s) => t + s.kontenjan, 0);
  const toplamOgrenci = acikOlanlar.reduce((t, s) => t + s.ogrenciSayisi, 0);
  const ogretmensiz = acikOlanlar.filter((s) => !s.ogretmen_ad).length;

  /* Gune gore grupla: takvim mantigi panelde de korunuyor. */
  const gunlere = GUNLER.map((g) => ({
    gun: g,
    liste: siniflar.filter((s) => s.gun === g),
  })).filter((x) => x.liste.length > 0);

  const atolyeSecenekleri = ATOLYELER.map((a) => ({
    slug: a.slug,
    ad: a.ad,
  }));
  const ogretmenAdlari = EKIP.map((o) => o.ad);

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/siniflar">
      <SayfaBasi
        baslik="Sınıflar"
        aciklama={`${DONEM} dönemi · öğretmen ataması ve doluluk`}
        cocuklar={
          yonetici && siniflar.length > 0 ? (
            <>
              <SinifUretButonu donem={DONEM} />
              <SinifFormu
                donem={DONEM}
                atolyeler={atolyeSecenekleri}
                ogretmenler={ogretmenAdlari}
                gorunum="birincil"
              />
            </>
          ) : undefined
        }
      />

      {siniflar.length === 0 ? (
        <BosDurum
          baslik="Bu dönem için sınıf açılmamış"
          ikon={<Ikon.Ayi boyut={22} />}
          aciklama="Sınıflar haftalık programdan üretiliyor: her seans için bir sınıf açılır, öğretmeni programdaki öğretmen olur, kontenjan 12 olur. Sonrasında her biri tek tek değiştirilebilir."
          cocuklar={
            yonetici ? (
              <div className="flex flex-wrap gap-2">
                <SinifUretButonu donem={DONEM} />
                <SinifFormu
                  donem={DONEM}
                  atolyeler={atolyeSecenekleri}
                  ogretmenler={ogretmenAdlari}
                />
              </div>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Sayac
              etiket="Açık sınıf"
              deger={acikOlanlar.length}
              alt={
                siniflar.length > acikOlanlar.length
                  ? `${siniflar.length - acikOlanlar.length} kapalı`
                  : undefined
              }
            />
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
              ton={ogretmensiz > 0 ? "uyari" : "basari"}
              alt={ogretmensiz > 0 ? "atama bekliyor" : "hepsi atandı"}
            />
          </div>

          {ogretmensiz > 0 && (
            <Bildirim
              ton="uyari"
              className="mt-3"
              ikon={<Ikon.Ampul boyut={15} />}
            >
              {ogretmensiz} sınıfın öğretmeni atanmamış. Öğretmen kendi
              sınıfını ancak atandığında görebiliyor.
            </Bildirim>
          )}

          <div className="mt-4 space-y-3">
            {gunlere.map(({ gun, liste }) => (
              <Kutu
                key={gun}
                baslik={GUN_ADI[gun as Gun]}
                yanCocuk={
                  <span className="text-xs text-panel-silik">
                    {liste.length} sınıf
                  </span>
                }
                dolgusuz
              >
                <ul className="divide-y divide-panel-cizgi">
                  {liste.map((s) => (
                    <li
                      key={s.id}
                      className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 transition-colors hover:bg-panel-yuzey-alt ${
                        s.aktif ? "" : "opacity-60"
                      }`}
                    >
                      <span className="w-11 shrink-0 font-baslik text-sm font-bold tabular-nums text-yesil-derin">
                        {s.bas}
                      </span>

                      <Link
                        href={`/kampus/siniflar/${s.id}`}
                        className="min-w-0 flex-1"
                      >
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-murekkep hover:underline">
                            {s.atolye_slug
                              ? (atolyeBul(
                                  s.atolye_slug as Parameters<
                                    typeof atolyeBul
                                  >[0],
                                )?.ad ?? s.ad)
                              : s.ad}
                          </span>
                          {!s.aktif && <Rozet ton="sessiz">Kapalı</Rozet>}
                        </span>
                        <span className="mt-0.5 block text-xs text-panel-silik">
                          {s.bas} - {s.bit}
                        </span>
                      </Link>

                      {/* --- doluluk --- */}
                      <span className="flex w-28 shrink-0 items-center gap-2">
                        <Ilerleme
                          deger={s.ogrenciSayisi}
                          toplam={s.kontenjan}
                          className="flex-1"
                        />
                        <span className="shrink-0 text-xs tabular-nums text-panel-soluk">
                          {s.ogrenciSayisi}/{s.kontenjan}
                        </span>
                      </span>

                      {yonetici ? (
                        <OgretmenSecici
                          sinifId={s.id}
                          secili={s.ogretmen_ad}
                          adaylar={ogretmenAdlari}
                        />
                      ) : (
                        <span className="w-32 shrink-0 text-sm text-panel-soluk">
                          {s.ogretmen_ad ?? "—"}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </Kutu>
            ))}
          </div>
        </>
      )}
    </Kabuk>
  );
}
