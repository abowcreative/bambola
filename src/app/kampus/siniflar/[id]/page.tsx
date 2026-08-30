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
import { Kabuk, Kutu, GeriBaglantisi } from "@/components/kampus/kabuk";
import { Rozet, Sayac, Satir } from "@/components/kampus/ui";
import { SinifFormu, SinifAnahtari } from "@/components/kampus/sinif-formu";
import { OgretmenSecici } from "@/components/kampus/ogretmen-secici";
import { KontenjanAlani } from "@/components/kampus/kontenjan-alani";
import { SinifaEkle } from "@/components/kampus/sinifa-ekle";
import { EKIP } from "@/lib/data/ekip";
import { atolyeBul, ATOLYELER } from "@/lib/data/atolyeler";
import { GUN_ADI } from "@/lib/data/types";
import type { Gun } from "@/lib/data/types";
import { yasMetni, ayHesapla } from "@/lib/yas";
import { dersleriGetir, DERS_DURUM_ETIKET } from "@/lib/kampus/yoklama";
import { DERS_TONU } from "@/lib/kampus/tonlar";
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

  const yonetici = oturum.rol === "admin";

  const [kayitlar, dersler] = await Promise.all([
    sinifinOgrencileri(id),
    dersleriGetir({ sinifId: id }),
  ]);
  const aktif = kayitlar.filter((k) => k.durum === "aktif");

  /*
    Sinifa eklenebilecekler: aktif ogrenciler icinden bu sinifta OLMAYANLAR.
    Yalniz admin gorur; ogretmen kayit ekleyemez.
  */
  const eklenebilir = yonetici
    ? (await ogrencileriGetir({ durum: "aktif" })).filter(
        (o) => !aktif.some((k) => k.ogrenci_id === o.id),
      )
    : [];

  const atolye = sinif.atolye_slug
    ? atolyeBul(sinif.atolye_slug as Parameters<typeof atolyeBul>[0])
    : undefined;

  const bosYer = Math.max(0, sinif.kontenjan - aktif.length);

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/siniflar">
      <GeriBaglantisi yol="/kampus/siniflar" etiket="Sınıflar" />

      <div className="mt-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-baslik text-xl font-bold text-murekkep sm:text-2xl">
              {atolye?.ad ?? sinif.ad}
            </h1>
            {!sinif.aktif && <Rozet ton="sessiz">Kapalı</Rozet>}
          </div>
          <p className="mt-1 text-sm text-panel-soluk">
            {sinif.gun && GUN_ADI[sinif.gun as Gun]} · {sinif.bas} -{" "}
            {sinif.bit} · {sinif.donem}
          </p>
        </div>

        {yonetici && (
          <div className="flex flex-wrap items-center gap-2">
            <SinifAnahtari sinifId={sinif.id} aktif={sinif.aktif} />
            <SinifFormu
              sinif={sinif}
              donem={sinif.donem}
              atolyeler={ATOLYELER.map((a) => ({ slug: a.slug, ad: a.ad }))}
              ogretmenler={EKIP.map((o) => o.ad)}
            />
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Sayac
          etiket="Kayıtlı"
          deger={aktif.length}
          alt={`${sinif.kontenjan} kontenjan`}
        />
        <Sayac
          etiket="Boş yer"
          deger={bosYer}
          ton={bosYer === 0 ? "uyari" : bosYer <= 2 ? "bilgi" : "notr"}
          alt={bosYer === 0 ? "sınıf dolu" : undefined}
        />
        <Sayac etiket="Yaş aralığı" deger={atolye?.yasEtiket ?? "—"} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Kutu
          baslik="Öğrenciler"
          yanCocuk={
            <span className="text-xs text-panel-silik">
              {aktif.length} kişi
            </span>
          }
          dolgusuz
        >
          {aktif.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-panel-soluk">
              Bu sınıfta kayıtlı öğrenci yok.
            </p>
          ) : (
            <ul className="divide-y divide-panel-cizgi">
              {aktif.map((k) => (
                <li
                  key={k.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 transition-colors hover:bg-panel-yuzey-alt"
                >
                  <Link
                    href={`/kampus/ogrenciler/${k.ogrenci_id}`}
                    className="min-w-0 flex-1 text-sm font-semibold text-murekkep hover:text-yesil-derin hover:underline"
                  >
                    {k.ogrenci ? ogrenciAdi(k.ogrenci) : "—"}
                  </Link>
                  <span className="shrink-0 text-xs text-panel-soluk">
                    {k.ogrenci && yasMetni(ayHesapla(k.ogrenci.dogum_tarihi))}
                  </span>
                  {k.ogrenci?.alerji && (
                    <Rozet ton="uyari" ikon={<Ikon.Kalp boyut={11} />}>
                      {k.ogrenci.alerji}
                    </Rozet>
                  )}
                  <span className="shrink-0 text-xs tabular-nums text-panel-silik">
                    {new Date(k.baslangic).toLocaleDateString("tr-TR")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Kutu>

        <div className="space-y-4">
          <Kutu baslik="Sınıf ayarları">
            {yonetici ? (
              <div className="space-y-3">
                <div>
                  <p className="mb-1 text-xs font-semibold text-panel-soluk">
                    Öğretmen
                  </p>
                  <OgretmenSecici
                    sinifId={sinif.id}
                    secili={sinif.ogretmen_ad}
                    adaylar={EKIP.map((o) => o.ad)}
                  />
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold text-panel-soluk">
                    Kontenjan
                  </p>
                  <KontenjanAlani
                    sinifId={sinif.id}
                    deger={sinif.kontenjan}
                    enAz={aktif.length}
                  />
                </div>
                <p className="text-xs leading-relaxed text-panel-silik">
                  Gün, saat ve atölye “Düzenle” penceresinden değişir.
                </p>
              </div>
            ) : (
              <dl>
                <Satir etiket="Öğretmen">{sinif.ogretmen_ad}</Satir>
                <Satir etiket="Kontenjan">{sinif.kontenjan}</Satir>
                <Satir etiket="Dönem">{sinif.donem}</Satir>
              </dl>
            )}
          </Kutu>

          {yonetici && (
            <Kutu baslik="Öğrenci ekle">
              {eklenebilir.length === 0 ? (
                <p className="text-sm leading-relaxed text-panel-soluk">
                  Eklenebilecek öğrenci yok.{" "}
                  <Link
                    href="/kampus/ogrenciler"
                    className="font-semibold text-yesil-derin hover:underline"
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

          {sinif.notlar && (
            <Kutu baslik="Not">
              <p className="whitespace-pre-line text-sm leading-relaxed text-panel-soluk">
                {sinif.notlar}
              </p>
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
        className="mt-4"
        yanCocuk={
          <div className="flex items-center gap-3">
            <span className="text-xs text-panel-silik">
              {dersler.filter((d) => d.durum === "islendi").length} işlendi /{" "}
              {dersler.length}
            </span>
            <DersAcButonu sinifId={sinif.id} tarih={bugununTarihi()} />
          </div>
        }
        dolgusuz
      >
        {dersler.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-panel-soluk">
            Bu sınıfta henüz ders açılmadı. “Dersi aç” bugünün yoklamasını
            başlatır.
          </p>
        ) : (
          <ul className="divide-y divide-panel-cizgi">
            {dersler.slice(0, 20).map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 transition-colors hover:bg-panel-yuzey-alt"
              >
                <Link
                  href={`/kampus/yoklama/${d.id}`}
                  className="w-20 shrink-0 text-sm font-medium tabular-nums text-yesil-derin hover:underline"
                >
                  {new Date(d.tarih).toLocaleDateString("tr-TR")}
                </Link>
                <span className="min-w-0 flex-1 truncate text-sm text-murekkep">
                  {d.konu ?? <span className="text-panel-silik">—</span>}
                </span>
                <span className="shrink-0 text-xs text-panel-soluk">
                  {d.yoklamaSayisi > 0
                    ? `${d.gelenSayisi}/${d.yoklamaSayisi} geldi`
                    : "yoklama yok"}
                </span>
                <Rozet ton={DERS_TONU[d.durum] ?? "notr"}>
                  {DERS_DURUM_ETIKET[d.durum]}
                </Rozet>
              </li>
            ))}
          </ul>
        )}
        {dersler.length > 20 && (
          <div className="border-t border-panel-cizgi px-4 py-2.5">
            <Link
              href={`/kampus/dersler?sinif=${sinif.id}`}
              className="text-sm font-semibold text-yesil-derin hover:underline"
            >
              Tüm dersler ({dersler.length})
            </Link>
          </div>
        )}
      </Kutu>

      {/* Gecmis kayitlar: ayrilanlar ve donduranlar. */}
      {kayitlar.length > aktif.length && (
        <Kutu baslik="Geçmiş kayıtlar" className="mt-4" dolgusuz>
          <ul className="divide-y divide-panel-cizgi">
            {kayitlar
              .filter((k) => k.durum !== "aktif")
              .map((k) => (
                <li
                  key={k.id}
                  className="flex flex-wrap items-center gap-x-4 px-4 py-2 text-sm"
                >
                  <span className="min-w-0 flex-1 text-murekkep">
                    {k.ogrenci ? ogrenciAdi(k.ogrenci) : "—"}
                  </span>
                  <span className="text-panel-soluk">
                    {OGRENCI_DURUM_ETIKET[
                      k.durum as keyof typeof OGRENCI_DURUM_ETIKET
                    ] ?? k.durum}
                  </span>
                  <span className="text-xs tabular-nums text-panel-silik">
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
