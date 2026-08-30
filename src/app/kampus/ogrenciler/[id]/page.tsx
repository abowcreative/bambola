import Link from "next/link";
import { notFound } from "next/navigation";
import { oturumZorunlu } from "@/lib/kampus/oturum";
import {
  ogrenciGetir,
  ogrencininVelileri,
  ogrencininKayitlari,
  velileriGetir,
  ogrenciAdi,
  OGRENCI_DURUM_ETIKET,
  YAKINLIK_ETIKET,
} from "@/lib/kampus/ogrenciler";
import { Kabuk, Kutu, GeriBaglantisi } from "@/components/kampus/kabuk";
import { Bildirim, BosDurum, Rozet, Satir } from "@/components/kampus/ui";
import { OgrenciDuzenle } from "@/components/kampus/ogrenci-formu";
import { VeliBagla, VeliBagiKaldir } from "@/components/kampus/veli-formu";
import { OGRENCI_TONU, YOKLAMA_TONU } from "@/lib/kampus/tonlar";
import { atolyeBul } from "@/lib/data/atolyeler";
import { GUN_ADI } from "@/lib/data/types";
import type { Gun } from "@/lib/data/types";
import { yasMetni, ayHesapla } from "@/lib/yas";
import { KURUM_ETIKET } from "@/lib/supabase/types";
import type { Kurum } from "@/lib/supabase/types";
import { telefonYaz } from "@/components/kampus/basvuru-satiri";
import { Ikon } from "@/components/ui/ikon";
import {
  ogrencininOdemeleri,
  ogrencininYoklamasi,
  YOKLAMA_ETIKET,
} from "@/lib/kampus/yoklama";
import type { YoklamaDurumu } from "@/lib/kampus/yoklama-tipleri";
import { OdemeKutusu } from "@/components/kampus/odeme-kutusu";

export const metadata = { title: "Öğrenci", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function OgrenciDetaySayfasi({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const oturum = await oturumZorunlu();
  const { id } = await params;

  const ogrenci = await ogrenciGetir(id);
  if (!ogrenci) notFound();

  const yonetici = oturum.rol === "admin";

  const [veliler, kayitlar, yoklama, odemeler, tumVeliler] = await Promise.all([
    ogrencininVelileri(id),
    ogrencininKayitlari(id),
    ogrencininYoklamasi(id),
    // Odemeleri ve veli listesini yalniz admin goruyor.
    yonetici ? ogrencininOdemeleri(id) : Promise.resolve([]),
    yonetici ? velileriGetir() : Promise.resolve([]),
  ]);

  const aktifKayitlar = kayitlar.filter((k) => k.durum === "aktif");
  const katilim = yoklama.filter(
    (y) => y.durum === "geldi" || y.durum === "telafi",
  ).length;

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/ogrenciler">
      <GeriBaglantisi yol="/kampus/ogrenciler" etiket="Öğrenciler" />

      <div className="mt-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-baslik text-xl font-bold text-murekkep sm:text-2xl">
              {ogrenciAdi(ogrenci)}
            </h1>
            <Rozet ton={OGRENCI_TONU[ogrenci.durum] ?? "notr"}>
              {OGRENCI_DURUM_ETIKET[ogrenci.durum]}
            </Rozet>
          </div>
          <p className="mt-1 text-sm text-panel-soluk">
            {yasMetni(ayHesapla(ogrenci.dogum_tarihi))} ·{" "}
            {KURUM_ETIKET[ogrenci.kurum as Kurum] ?? ogrenci.kurum}
          </p>
        </div>

        {yonetici && <OgrenciDuzenle ogrenci={ogrenci} />}
      </div>

      {/*
        Saglik bilgisi EN USTTE ve vurgulu: alerjisi olan bir cocuk icin bu
        bilginin sayfanin altinda kalmasi kabul edilemez.
      */}
      {(ogrenci.alerji || ogrenci.saglik_notu) && (
        <Bildirim
          ton="uyari"
          className="mt-4"
          baslik="Sağlık"
          ikon={<Ikon.Kalp boyut={16} />}
        >
          {ogrenci.alerji && (
            <p className="leading-relaxed text-murekkep">
              <strong>Alerji:</strong> {ogrenci.alerji}
            </p>
          )}
          {ogrenci.saglik_notu && (
            <p className="mt-1 leading-relaxed text-murekkep">
              {ogrenci.saglik_notu}
            </p>
          )}
        </Bildirim>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <Kutu baslik="Sınıflar" dolgusuz>
            {aktifKayitlar.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-panel-soluk">
                Henüz bir sınıfa kayıtlı değil.
              </p>
            ) : (
              <ul className="divide-y divide-panel-cizgi">
                {aktifKayitlar.map((k) => (
                  <li key={k.id} className="px-4 py-3">
                    <Link
                      href={`/kampus/siniflar/${k.sinif_id}`}
                      className="text-sm font-semibold text-murekkep hover:text-yesil-derin hover:underline"
                    >
                      {k.sinif?.atolye_slug
                        ? (atolyeBul(
                            k.sinif.atolye_slug as Parameters<
                              typeof atolyeBul
                            >[0],
                          )?.ad ?? k.sinif.ad)
                        : (k.sinif?.ad ?? "—")}
                    </Link>
                    <p className="mt-0.5 text-xs text-panel-soluk">
                      {k.sinif?.gun && GUN_ADI[k.sinif.gun as Gun]}{" "}
                      {k.sinif?.bas} - {k.sinif?.bit}
                      {k.sinif?.ogretmen_ad && ` · ${k.sinif.ogretmen_ad}`}
                    </p>
                    <p className="mt-0.5 text-xs text-panel-silik">
                      {new Date(k.baslangic).toLocaleDateString("tr-TR")}
                      &apos;den beri
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Kutu>

          <Kutu
            baslik="Veliler"
            yanCocuk={
              yonetici ? (
                <VeliBagla
                  ogrenciId={ogrenci.id}
                  veliler={tumVeliler}
                  bagliOlanlar={veliler.map((v) => v.id)}
                />
              ) : undefined
            }
            dolgusuz
          >
            {veliler.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-panel-soluk">
                Bağlı veli kaydı yok.
              </p>
            ) : (
              <ul className="divide-y divide-panel-cizgi">
                {veliler.map((v) => (
                  <li
                    key={v.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        {/* Veli sayfasi yalniz yoneticide var. */}
                        {yonetici ? (
                          <Link
                            href={`/kampus/veliler/${v.id}`}
                            className="text-sm font-semibold text-murekkep hover:text-yesil-derin hover:underline"
                          >
                            {v.ad_soyad}
                          </Link>
                        ) : (
                          <span className="text-sm font-semibold text-murekkep">
                            {v.ad_soyad}
                          </span>
                        )}
                        {v.birincil && <Rozet ton="bilgi">Birincil</Rozet>}
                      </span>
                      <span className="mt-0.5 block text-xs text-panel-soluk">
                        {YAKINLIK_ETIKET[v.yakinlik] ?? v.yakinlik}
                      </span>
                    </span>
                    <a
                      href={`tel:0${v.telefon}`}
                      className="shrink-0 text-sm font-medium text-yesil-derin hover:underline"
                    >
                      {telefonYaz(v.telefon)}
                    </a>
                    {yonetici && veliler.length > 1 && (
                      <VeliBagiKaldir ogrenciId={ogrenci.id} veliId={v.id} />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Kutu>

          {/* --- devam gecmisi --- */}
          <Kutu
            baslik="Devam"
            yanCocuk={
              yoklama.length > 0 ? (
                <span className="text-xs text-panel-soluk">
                  {katilim}/{yoklama.length} katılım
                </span>
              ) : undefined
            }
            dolgusuz
          >
            {yoklama.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-panel-soluk">
                Henüz yoklama kaydı yok.
              </p>
            ) : (
              <ul className="divide-y divide-panel-cizgi">
                {yoklama.slice(0, 15).map((y) => (
                  <li
                    key={y.id}
                    className="flex flex-wrap items-center gap-x-3 px-4 py-2"
                  >
                    <span className="w-14 shrink-0 text-xs tabular-nums text-panel-silik">
                      {y.dersler?.tarih
                        ? new Date(y.dersler.tarih).toLocaleDateString(
                            "tr-TR",
                            { day: "2-digit", month: "2-digit" },
                          )
                        : "—"}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-murekkep">
                      {y.dersler?.siniflar?.ad ?? "—"}
                    </span>
                    <Rozet ton={YOKLAMA_TONU[y.durum] ?? "notr"}>
                      {YOKLAMA_ETIKET[y.durum as YoklamaDurumu]}
                    </Rozet>
                  </li>
                ))}
              </ul>
            )}
          </Kutu>

          {/* Cari yalniz yoneticiye. Ogretmen para bilgisi gormuyor. */}
          {yonetici && (
            <Kutu baslik="Cari hesap">
              <OdemeKutusu ogrenciId={ogrenci.id} hareketler={odemeler} />
            </Kutu>
          )}

          {ogrenci.notlar && (
            <Kutu baslik="Notlar">
              <p className="whitespace-pre-line text-sm leading-relaxed text-panel-soluk">
                {ogrenci.notlar}
              </p>
            </Kutu>
          )}
        </div>

        <aside className="space-y-4">
          <Kutu baslik="Künye">
            <dl>
              <Satir etiket="Doğum tarihi">
                {new Date(ogrenci.dogum_tarihi).toLocaleDateString("tr-TR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </Satir>
              <Satir etiket="Yaş">
                {yasMetni(ayHesapla(ogrenci.dogum_tarihi))}
              </Satir>
              <Satir etiket="Kayıt tarihi">
                {new Date(ogrenci.kayit_tarihi).toLocaleDateString("tr-TR")}
              </Satir>
              <Satir etiket="Kurum">
                {KURUM_ETIKET[ogrenci.kurum as Kurum] ?? ogrenci.kurum}
              </Satir>
              <Satir etiket="Durum">
                {OGRENCI_DURUM_ETIKET[ogrenci.durum]}
              </Satir>
            </dl>
          </Kutu>

          {ogrenci.basvuru_id && yonetici && (
            <Kutu baslik="Nereden geldi">
              <Link
                href={`/kampus/basvurular/${ogrenci.basvuru_id}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-yesil-derin hover:underline"
              >
                Web sitesi başvurusu
                <Ikon.Ok boyut={14} />
              </Link>
              <p className="mt-1.5 text-xs leading-relaxed text-panel-soluk">
                İlk talep ve görüşme notları başvuru kaydında duruyor.
              </p>
            </Kutu>
          )}

          {!yonetici && aktifKayitlar.length === 0 && (
            <BosDurum
              baslik="Sınıf yok"
              aciklama="Bu çocuk henüz bir sınıfa atanmadı."
            />
          )}
        </aside>
      </div>
    </Kabuk>
  );
}
