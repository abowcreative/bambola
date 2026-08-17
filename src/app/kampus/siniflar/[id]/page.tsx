import Link from "next/link";
import { notFound } from "next/navigation";
import { rolZorunlu } from "@/lib/kampus/oturum";
import {
  sinifGetir,
  sinifinOgrencileri,
  ogrencileriGetir,
  ogrenciAdi,
  OGRENCI_DURUM_ETIKET,
} from "@/lib/kampus/ogrenciler";
import { Kabuk, Kutu, Sayac } from "@/components/kampus/kabuk";
import { OgretmenSecici } from "@/components/kampus/ogretmen-secici";
import { KontenjanAlani } from "@/components/kampus/kontenjan-alani";
import { SinifaEkle } from "@/components/kampus/sinifa-ekle";
import { EKIP } from "@/lib/data/ekip";
import { atolyeBul } from "@/lib/data/atolyeler";
import { GUN_ADI } from "@/lib/data/types";
import type { Gun } from "@/lib/data/types";
import { yasMetni, ayHesapla } from "@/lib/yas";
import { dersleriGetir, DERS_DURUM_ETIKET } from "@/lib/kampus/yoklama";
import { bugununTarihi } from "@/lib/tarih";
import { DersAcButonu } from "@/components/kampus/ders-ac-butonu";
import { Ikon } from "@/components/ui/ikon";

export const metadata = { title: "Sınıf", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function SinifDetaySayfasi({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const oturum = await rolZorunlu("admin", "ogretmen");
  const { id } = await params;

  const sinif = await sinifGetir(id);
  if (!sinif) notFound();

  const [kayitlar, dersler] = await Promise.all([
    sinifinOgrencileri(id),
    dersleriGetir({ sinifId: id }),
  ]);
  const aktif = kayitlar.filter((k) => k.durum === "aktif");

  /*
    Sinifa eklenebilecekler: aktif ogrenciler icinden bu sinifta OLMAYANLAR.
    Yalniz admin gorur; ogretmen kayit ekleyemez.
  */
  const eklenebilir =
    oturum.rol === "admin"
      ? (await ogrencileriGetir({ durum: "aktif" })).filter(
          (o) => !aktif.some((k) => k.ogrenci_id === o.id),
        )
      : [];

  const atolye = sinif.atolye_slug
    ? atolyeBul(sinif.atolye_slug as Parameters<typeof atolyeBul>[0])
    : undefined;

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/siniflar">
      <Link
        href="/kampus/siniflar"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-yesil-koyu hover:underline"
      >
        <Ikon.OkGeri boyut={16} />
        Sınıflar
      </Link>

      <h1 className="mt-4 font-baslik text-2xl font-bold text-murekkep">
        {atolye?.ad ?? sinif.ad}
      </h1>
      <p className="mt-1 text-murekkep-soluk">
        {sinif.gun && GUN_ADI[sinif.gun as Gun]} · {sinif.bas} - {sinif.bit} ·{" "}
        {sinif.donem}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Sayac
          etiket="Kayıtlı"
          deger={aktif.length}
          alt={`${sinif.kontenjan} kontenjan`}
        />
        <Sayac
          etiket="Boş yer"
          deger={Math.max(0, sinif.kontenjan - aktif.length)}
          vurgu={sinif.kontenjan - aktif.length <= 2}
        />
        <Sayac
          etiket="Yaş aralığı"
          deger={atolye?.yasEtiket ?? "—"}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Kutu
          baslik="Öğrenciler"
          yanCocuk={
            <span className="text-sm text-murekkep-soluk">
              {aktif.length} kişi
            </span>
          }
        >
          {aktif.length === 0 ? (
            <p className="py-8 text-center text-murekkep-soluk">
              Bu sınıfta kayıtlı öğrenci yok.
            </p>
          ) : (
            <ul className="space-y-2">
              {aktif.map((k) => (
                <li
                  key={k.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-kart border-2 border-cizgi px-4 py-3"
                >
                  <Link
                    href={`/kampus/ogrenciler/${k.ogrenci_id}`}
                    className="min-w-0 flex-1 font-baslik text-sm font-bold text-murekkep hover:underline"
                  >
                    {k.ogrenci ? ogrenciAdi(k.ogrenci) : "—"}
                  </Link>
                  <span className="shrink-0 text-sm text-murekkep-soluk">
                    {k.ogrenci && yasMetni(ayHesapla(k.ogrenci.dogum_tarihi))}
                  </span>
                  {k.ogrenci?.alerji && (
                    <span
                      title={k.ogrenci.alerji}
                      className="shrink-0 rounded-full bg-krem-koyu px-2.5 py-0.5 text-xs font-semibold text-murekkep"
                    >
                      Alerji
                    </span>
                  )}
                  <span className="shrink-0 text-xs text-murekkep-soluk">
                    {new Date(k.baslangic).toLocaleDateString("tr-TR")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Kutu>

        <div className="space-y-5">
          <Kutu baslik="Sınıf ayarları">
            {oturum.rol === "admin" ? (
              <div className="space-y-4">
                <div>
                  <p className="mb-1.5 text-sm text-murekkep-soluk">Öğretmen</p>
                  <OgretmenSecici
                    sinifId={sinif.id}
                    secili={sinif.ogretmen_ad}
                    adaylar={EKIP.map((o) => o.ad)}
                  />
                </div>
                <div>
                  <p className="mb-1.5 text-sm text-murekkep-soluk">
                    Kontenjan
                  </p>
                  <KontenjanAlani
                    sinifId={sinif.id}
                    deger={sinif.kontenjan}
                    enAz={aktif.length}
                  />
                </div>
              </div>
            ) : (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-murekkep-soluk">Öğretmen</dt>
                  <dd className="font-medium text-murekkep">
                    {sinif.ogretmen_ad ?? "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-murekkep-soluk">Kontenjan</dt>
                  <dd className="font-medium text-murekkep">
                    {sinif.kontenjan}
                  </dd>
                </div>
              </dl>
            )}
          </Kutu>

          {oturum.rol === "admin" && (
            <Kutu baslik="Öğrenci ekle">
              {eklenebilir.length === 0 ? (
                <p className="text-sm leading-relaxed text-murekkep-soluk">
                  Eklenebilecek öğrenci yok.{" "}
                  <Link
                    href="/kampus/ogrenciler"
                    className="font-semibold text-yesil-koyu hover:underline"
                  >
                    Öğrenciler
                  </Link>{" "}
                  sayfasından yeni çocuk ekleyebilir ya da bir başvuruyu
                  öğrenciye dönüştürebilirsiniz.
                </p>
              ) : (
                <SinifaEkle
                  sinifId={sinif.id}
                  adaylar={eklenebilir.map((o) => ({
                    id: o.id,
                    ad: `${ogrenciAdi(o)} (${yasMetni(ayHesapla(o.dogum_tarihi))})`,
                  }))}
                  dolu={aktif.length >= sinif.kontenjan}
                />
              )}
            </Kutu>
          )}
        </div>
      </div>

      {/*
        Dersler: sinif sayfasindan yoklamaya gecis. Ogretmen sinifi acinca
        "bu hafta ne oldu" sorusunun cevabini burada goruyor, ayri bir
        yoklama sayfasina gidip sinifi tekrar aramasi gerekmiyor.
      */}
      <Kutu
        baslik="Dersler"
        className="mt-5"
        yanCocuk={
          <div className="flex items-center gap-3">
            <span className="text-sm text-murekkep-soluk">
              {dersler.filter((d) => d.durum === "islendi").length} işlendi /{" "}
              {dersler.length}
            </span>
            <DersAcButonu sinifId={sinif.id} tarih={bugununTarihi()} />
          </div>
        }
      >
        {dersler.length === 0 ? (
          <p className="py-6 text-center text-murekkep-soluk">
            Bu sınıfta henüz ders açılmadı. &quot;Dersi aç&quot; bugünün
            yoklamasını başlatır.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {dersler.slice(0, 20).map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-cizgi py-2 last:border-b-0"
              >
                <Link
                  href={`/kampus/yoklama/${d.id}`}
                  className="w-24 shrink-0 font-medium tabular-nums text-yesil-koyu hover:underline"
                >
                  {new Date(d.tarih).toLocaleDateString("tr-TR")}
                </Link>
                <span className="min-w-0 flex-1 truncate text-sm text-murekkep">
                  {d.konu ?? "—"}
                </span>
                <span className="shrink-0 text-xs text-murekkep-soluk">
                  {d.yoklamaSayisi > 0
                    ? `${d.gelenSayisi}/${d.yoklamaSayisi} geldi`
                    : "yoklama yok"}
                </span>
                <span className="shrink-0 rounded-full bg-krem-koyu px-2.5 py-0.5 text-xs font-bold text-murekkep">
                  {DERS_DURUM_ETIKET[d.durum]}
                </span>
              </li>
            ))}
          </ul>
        )}
        {dersler.length > 20 && (
          <Link
            href={`/kampus/dersler?sinif=${sinif.id}`}
            className="mt-3 inline-block text-sm font-semibold text-yesil-koyu hover:underline"
          >
            Tüm dersler ({dersler.length})
          </Link>
        )}
      </Kutu>

      {/* Gecmis kayitlar: ayrilanlar ve donduranlar. */}
      {kayitlar.length > aktif.length && (
        <Kutu baslik="Geçmiş kayıtlar" className="mt-5">
          <ul className="space-y-1.5">
            {kayitlar
              .filter((k) => k.durum !== "aktif")
              .map((k) => (
                <li
                  key={k.id}
                  className="flex flex-wrap gap-x-4 text-sm text-murekkep-soluk"
                >
                  <span className="min-w-0 flex-1 text-murekkep">
                    {k.ogrenci ? ogrenciAdi(k.ogrenci) : "—"}
                  </span>
                  <span>
                    {OGRENCI_DURUM_ETIKET[
                      k.durum as keyof typeof OGRENCI_DURUM_ETIKET
                    ] ?? k.durum}
                  </span>
                  <span>
                    {k.bitis
                      ? new Date(k.bitis).toLocaleDateString("tr-TR")
                      : "—"}
                  </span>
                </li>
              ))}
          </ul>
        </Kutu>
      )}
    </Kabuk>
  );
}
