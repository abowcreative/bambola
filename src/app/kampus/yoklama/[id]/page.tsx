import Link from "next/link";
import { notFound } from "next/navigation";
import { rolZorunlu } from "@/lib/kampus/oturum";
import { dersGetir, dersYoklamasi } from "@/lib/kampus/yoklama";
import { Kabuk, Kutu, Sayac } from "@/components/kampus/kabuk";
import { YoklamaListesi } from "@/components/kampus/yoklama-listesi";
import { DersDurumu } from "@/components/kampus/ders-durumu";
import { atolyeBul } from "@/lib/data/atolyeler";
import { GUN_ADI } from "@/lib/data/types";
import type { Gun } from "@/lib/data/types";
import { Ikon } from "@/components/ui/ikon";

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
      <Link
        href={`/kampus/yoklama?tarih=${ders.tarih}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-yesil-koyu hover:underline"
      >
        <Ikon.OkGeri boyut={16} />
        Yoklama
      </Link>

      <h1 className="mt-4 font-baslik text-2xl font-bold text-murekkep">
        {atolye?.ad ?? ders.sinif.ad}
      </h1>
      <p className="mt-1 text-murekkep-soluk">
        {new Date(`${ders.tarih}T12:00:00+03:00`).toLocaleDateString("tr-TR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}{" "}
        · {ders.sinif.bas} - {ders.sinif.bit}
        {ders.sinif.gun && ` · ${GUN_ADI[ders.sinif.gun as Gun]}`}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Sayac etiket="Sınıf mevcudu" deger={liste.length} />
        <Sayac
          etiket="İşaretlenen"
          deger={`${isaretli}/${liste.length}`}
          vurgu={isaretli < liste.length}
        />
        <Sayac etiket="Gelen" deger={gelen} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Kutu baslik="Öğrenciler">
          {liste.length === 0 ? (
            <p className="py-8 text-center text-murekkep-soluk">
              Bu sınıfta kayıtlı öğrenci yok. Sınıf sayfasından öğrenci
              ekleyebilirsiniz.
            </p>
          ) : (
            <YoklamaListesi dersId={ders.id} liste={liste} />
          )}
        </Kutu>

        <div className="space-y-5">
          <Kutu baslik="Ders durumu">
            <DersDurumu
              dersId={ders.id}
              durum={ders.durum}
              konu={ders.konu}
            />
          </Kutu>

          <Kutu baslik="Künye">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-murekkep-soluk">Sınıfın öğretmeni</dt>
                <dd className="font-medium text-murekkep">
                  {ders.sinif.ogretmen_ad ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-murekkep-soluk">Dersi işleyen</dt>
                <dd className="font-medium text-murekkep">
                  {ders.isleyen_ogretmen ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-murekkep-soluk">Kontenjan</dt>
                <dd className="font-medium text-murekkep">
                  {ders.sinif.kontenjan}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-murekkep-soluk">
              Dersi işleyen, sınıfın atanmış öğretmeninden farklı olabilir;
              yerine giren kişi kayda geçer.
            </p>
          </Kutu>
        </div>
      </div>
    </Kabuk>
  );
}
