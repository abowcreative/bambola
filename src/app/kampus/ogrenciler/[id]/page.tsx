import Link from "next/link";
import { notFound } from "next/navigation";
import { oturumZorunlu } from "@/lib/kampus/oturum";
import {
  ogrenciGetir,
  ogrencininVelileri,
  ogrencininKayitlari,
  ogrenciAdi,
  OGRENCI_DURUM_ETIKET,
  YAKINLIK_ETIKET,
} from "@/lib/kampus/ogrenciler";
import { Kabuk, Kutu } from "@/components/kampus/kabuk";
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
  YOKLAMA_RENGI,
} from "@/lib/kampus/yoklama";
import type { YoklamaDurumu } from "@/lib/kampus/yoklama-tipleri";
import { OdemeKutusu } from "@/components/kampus/odeme-kutusu";

export const metadata = { title: "Öğrenci", robots: { index: false } };
export const dynamic = "force-dynamic";

function Satir({
  etiket,
  children,
}: {
  etiket: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap justify-between gap-3 border-b border-cizgi py-2.5 last:border-b-0">
      <dt className="text-sm text-murekkep-soluk">{etiket}</dt>
      <dd className="text-right text-sm font-medium text-murekkep">
        {children || <span className="text-murekkep-soluk">—</span>}
      </dd>
    </div>
  );
}

export default async function OgrenciDetaySayfasi({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const oturum = await oturumZorunlu();
  const { id } = await params;

  const ogrenci = await ogrenciGetir(id);
  if (!ogrenci) notFound();

  const [veliler, kayitlar, yoklama, odemeler] = await Promise.all([
    ogrencininVelileri(id),
    ogrencininKayitlari(id),
    ogrencininYoklamasi(id),
    // Odemeleri yalniz admin goruyor; ogretmen icin bos dizi.
    oturum.rol === "admin" ? ogrencininOdemeleri(id) : Promise.resolve([]),
  ]);

  const aktifKayitlar = kayitlar.filter((k) => k.durum === "aktif");

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/ogrenciler">
      <Link
        href="/kampus/ogrenciler"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-yesil-koyu hover:underline"
      >
        <Ikon.OkGeri boyut={16} />
        Öğrenciler
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-baslik text-2xl font-bold text-murekkep">
          {ogrenciAdi(ogrenci)}
        </h1>
        <span className="rounded-full bg-lime-rozet px-3 py-1 text-xs font-bold text-black">
          {OGRENCI_DURUM_ETIKET[ogrenci.durum]}
        </span>
      </div>
      <p className="mt-1 text-murekkep-soluk">
        {yasMetni(ayHesapla(ogrenci.dogum_tarihi))} ·{" "}
        {KURUM_ETIKET[ogrenci.kurum as Kurum] ?? ogrenci.kurum}
      </p>

      {/*
        Saglik bilgisi EN USTTE ve vurgulu: alerjisi olan bir cocuk icin bu
        bilginin sayfanin altinda kalmasi kabul edilemez.
      */}
      {(ogrenci.alerji || ogrenci.saglik_notu) && (
        <div className="mt-5 rounded-blok border-2 border-yesil bg-lime-rozet/25 p-5">
          <h2 className="flex items-center gap-2 font-baslik text-base font-bold text-murekkep">
            <Ikon.Kalp boyut={18} />
            Sağlık
          </h2>
          {ogrenci.alerji && (
            <p className="mt-2 leading-relaxed text-murekkep">
              <strong>Alerji:</strong> {ogrenci.alerji}
            </p>
          )}
          {ogrenci.saglik_notu && (
            <p className="mt-1.5 leading-relaxed text-murekkep">
              {ogrenci.saglik_notu}
            </p>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5">
          <Kutu baslik="Sınıflar">
            {aktifKayitlar.length === 0 ? (
              <p className="py-6 text-center text-murekkep-soluk">
                Henüz bir sınıfa kayıtlı değil.
              </p>
            ) : (
              <ul className="space-y-2">
                {aktifKayitlar.map((k) => (
                  <li
                    key={k.id}
                    className="rounded-kart border-2 border-cizgi px-4 py-3"
                  >
                    <Link
                      href={`/kampus/siniflar/${k.sinif_id}`}
                      className="font-baslik text-sm font-bold text-murekkep hover:underline"
                    >
                      {k.sinif?.atolye_slug
                        ? (atolyeBul(
                            k.sinif.atolye_slug as Parameters<
                              typeof atolyeBul
                            >[0],
                          )?.ad ?? k.sinif.ad)
                        : (k.sinif?.ad ?? "—")}
                    </Link>
                    <p className="mt-0.5 text-xs text-murekkep-soluk">
                      {k.sinif?.gun && GUN_ADI[k.sinif.gun as Gun]}{" "}
                      {k.sinif?.bas} - {k.sinif?.bit}
                      {k.sinif?.ogretmen_ad && ` · ${k.sinif.ogretmen_ad}`}
                    </p>
                    <p className="mt-1 text-xs text-murekkep-soluk">
                      {new Date(k.baslangic).toLocaleDateString("tr-TR")}
                      &apos;den beri
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Kutu>

          <Kutu baslik="Veliler">
            {veliler.length === 0 ? (
              <p className="py-6 text-center text-murekkep-soluk">
                Bağlı veli kaydı yok.
              </p>
            ) : (
              <ul className="space-y-2">
                {veliler.map((v) => (
                  <li
                    key={v.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-kart border-2 border-cizgi px-4 py-3"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-baslik text-sm font-bold text-murekkep">
                        {/* Veli sayfasi yalniz yoneticide var. */}
                        {oturum.rol === "admin" ? (
                          <Link
                            href={`/kampus/veliler/${v.id}`}
                            className="hover:underline"
                          >
                            {v.ad_soyad}
                          </Link>
                        ) : (
                          v.ad_soyad
                        )}
                        {v.birincil && (
                          <span className="ml-2 rounded-full bg-krem-koyu px-2 py-0.5 text-xs font-semibold text-murekkep">
                            Birincil
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs text-murekkep-soluk">
                        {YAKINLIK_ETIKET[v.yakinlik] ?? v.yakinlik}
                      </span>
                    </span>
                    <a
                      href={`tel:0${v.telefon}`}
                      className="shrink-0 font-medium text-yesil-koyu hover:underline"
                    >
                      {telefonYaz(v.telefon)}
                    </a>
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
                <span className="text-sm text-murekkep-soluk">
                  {
                    yoklama.filter(
                      (y) => y.durum === "geldi" || y.durum === "telafi",
                    ).length
                  }
                  /{yoklama.length} katılım
                </span>
              ) : undefined
            }
          >
            {yoklama.length === 0 ? (
              <p className="py-4 text-sm text-murekkep-soluk">
                Henüz yoklama kaydı yok.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {yoklama.slice(0, 15).map((y) => (
                  <li
                    key={y.id}
                    className="flex flex-wrap items-center gap-x-3 text-sm"
                  >
                    <span className="w-20 shrink-0 tabular-nums text-murekkep-soluk">
                      {y.dersler?.tarih
                        ? new Date(y.dersler.tarih).toLocaleDateString("tr-TR", {
                            day: "2-digit",
                            month: "2-digit",
                          })
                        : "—"}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-murekkep">
                      {y.dersler?.siniflar?.ad ?? "—"}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${YOKLAMA_RENGI[y.durum as YoklamaDurumu]}`}
                    >
                      {YOKLAMA_ETIKET[y.durum as YoklamaDurumu]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Kutu>

          {/* Cari yalniz yoneticiye. Ogretmen para bilgisi gormuyor. */}
          {oturum.rol === "admin" && (
            <Kutu baslik="Cari hesap">
              <OdemeKutusu ogrenciId={ogrenci.id} hareketler={odemeler} />
            </Kutu>
          )}

          {ogrenci.notlar && (
            <Kutu baslik="Notlar">
              <p className="whitespace-pre-line leading-relaxed text-murekkep-soluk">
                {ogrenci.notlar}
              </p>
            </Kutu>
          )}
        </div>

        <aside className="space-y-5">
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

          {ogrenci.basvuru_id && oturum.rol === "admin" && (
            <Kutu baslik="Nereden geldi">
              <Link
                href={`/kampus/basvurular/${ogrenci.basvuru_id}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-yesil-koyu hover:underline"
              >
                Web sitesi başvurusu
                <Ikon.Ok boyut={14} />
              </Link>
              <p className="mt-2 text-xs leading-relaxed text-murekkep-soluk">
                İlk talep ve görüşme notları başvuru kaydında duruyor.
              </p>
            </Kutu>
          )}
        </aside>
      </div>
    </Kabuk>
  );
}
