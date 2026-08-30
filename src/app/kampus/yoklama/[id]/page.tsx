import { notFound } from "next/navigation";
import { rolZorunlu } from "@/lib/kampus/oturum";
import { dersGetir, dersYoklamasi } from "@/lib/kampus/yoklama";
import { Kabuk, Kutu, GeriBaglantisi } from "@/components/kampus/kabuk";
import { Rozet, Sayac, Satir } from "@/components/kampus/ui";
import { YoklamaListesi } from "@/components/kampus/yoklama-listesi";
import { DersDurumu } from "@/components/kampus/ders-durumu";
import { DERS_DURUM_ETIKET } from "@/lib/kampus/yoklama-tipleri";
import { DERS_TONU } from "@/lib/kampus/tonlar";
import { atolyeBul } from "@/lib/data/atolyeler";
import { GUN_ADI } from "@/lib/data/types";
import type { Gun } from "@/lib/data/types";

export const metadata = { title: "Yoklama", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function YoklamaAlSayfasi({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const oturum = await rolZorunlu("admin", "ogretmen");
  const { id } = await params;

  const ders = await dersGetir(id);
  if (!ders || !ders.sinif) notFound();

  const liste = await dersYoklamasi(id, ders.sinif.id);
  const isaretli = liste.filter((x) => x.isaret).length;
  const gelen = liste.filter(
    (x) => x.isaret?.durum === "geldi" || x.isaret?.durum === "telafi",
  ).length;

  const atolye = ders.sinif.atolye_slug
    ? atolyeBul(ders.sinif.atolye_slug as Parameters<typeof atolyeBul>[0])
    : undefined;

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/yoklama">
      <GeriBaglantisi
        yol={`/kampus/yoklama?tarih=${ders.tarih}`}
        etiket="Yoklama"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <h1 className="font-baslik text-xl font-bold text-murekkep sm:text-2xl">
          {atolye?.ad ?? ders.sinif.ad}
        </h1>
        <Rozet ton={DERS_TONU[ders.durum] ?? "notr"}>
          {DERS_DURUM_ETIKET[ders.durum]}
        </Rozet>
      </div>
      <p className="mt-1 text-sm text-panel-soluk">
        {new Date(`${ders.tarih}T12:00:00+03:00`).toLocaleDateString("tr-TR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}{" "}
        · {ders.sinif.bas} - {ders.sinif.bit}
        {ders.sinif.gun && ` · ${GUN_ADI[ders.sinif.gun as Gun]}`}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Sayac etiket="Sınıf mevcudu" deger={liste.length} />
        <Sayac
          etiket="İşaretlenen"
          deger={`${isaretli}/${liste.length}`}
          ton={isaretli < liste.length ? "uyari" : "basari"}
          alt={
            isaretli < liste.length
              ? `${liste.length - isaretli} kişi bekliyor`
              : "tamamlandı"
          }
        />
        <Sayac etiket="Gelen" deger={gelen} ton="basari" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Kutu baslik="Öğrenciler">
          {liste.length === 0 ? (
            <p className="py-8 text-center text-sm text-panel-soluk">
              Bu sınıfta kayıtlı öğrenci yok. Sınıf sayfasından öğrenci
              ekleyebilirsiniz.
            </p>
          ) : (
            <YoklamaListesi dersId={ders.id} liste={liste} />
          )}
        </Kutu>

        <div className="space-y-4">
          <Kutu baslik="Ders durumu">
            <DersDurumu
              dersId={ders.id}
              durum={ders.durum}
              konu={ders.konu}
              /* Silme yalniz yoneticide ve yoklamasi hic alinmamis derste;
                 isaret varken sunucu da reddediyor. */
              silinebilir={oturum.rol === "admin" && isaretli === 0}
            />
          </Kutu>

          <Kutu
            baslik="Künye"
            aciklama="Dersi işleyen, sınıfın atanmış öğretmeninden farklı olabilir; yerine giren kişi kayda geçer."
          >
            <dl>
              <Satir etiket="Sınıfın öğretmeni">
                {ders.sinif.ogretmen_ad}
              </Satir>
              <Satir etiket="Dersi işleyen">{ders.isleyen_ogretmen}</Satir>
              <Satir etiket="Kontenjan">{ders.sinif.kontenjan}</Satir>
            </dl>
          </Kutu>
        </div>
      </div>
    </Kabuk>
  );
}
