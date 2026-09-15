import Link from "next/link";
import { notFound } from "next/navigation";
import { oturumZorunlu } from "@/lib/kampus/oturum";
import {
  ogrenciGetir,
  ogrencininVelileri,
  ogrencininKayitlari,
  velileriGetir,
  ogrenciAdi,
  yasEtiketi,
  kisaTarih,
  OGRENCI_DURUM_ETIKET,
  YAKINLIK_ETIKET,
} from "@/lib/kampus/ogrenciler";
import {
  ogrencininDefteri,
  ogrenciSecenekleri,
  defterSozlugu,
  tl,
  tutarMetni,
  DEFTER_YONTEM_ETIKET,
  type PaketSatisi,
  type OgrenciSecenegi,
} from "@/lib/kampus/defter";
import { Kabuk, Kutu, GeriBaglantisi } from "@/components/kampus/kabuk";
import { Bildirim, BosDurum, Rozet, Satir } from "@/components/kampus/ui";
import { OgrenciDuzenle } from "@/components/kampus/ogrenci-formu";
import { VeliBagla, VeliBagiKaldir } from "@/components/kampus/veli-formu";
import { PaketSatisiFormu, PaketSatisiDuzelt } from "@/components/kampus/defter-formu";
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

  const [veliler, kayitlar, yoklama, odemeler, tumVeliler, defter, secenekler, sozluk] =
    await Promise.all([
      ogrencininVelileri(id),
      ogrencininKayitlari(id),
      ogrencininYoklamasi(id),
      // Para ve veli listesi yalniz yonetici.
      yonetici ? ogrencininOdemeleri(id) : Promise.resolve([]),
      yonetici ? velileriGetir() : Promise.resolve([]),
      yonetici ? ogrencininDefteri(id) : Promise.resolve([] as PaketSatisi[]),
      yonetici ? ogrenciSecenekleri() : Promise.resolve([] as OgrenciSecenegi[]),
      yonetici ? defterSozlugu() : Promise.resolve({ paketler: [], programlar: [] }),
    ]);

  const aktifKayitlar = kayitlar.filter((k) => k.durum === "aktif");
  const katilim = yoklama.filter(
    (y) => y.durum === "geldi" || y.durum === "telafi",
  ).length;
  const defterToplami = defter.reduce((t, s) => t + (s.tutar ?? 0), 0);
  const excelFarkli = ogrenci.toplam_odenen !== null && ogrenci.toplam_odenen !== defterToplami;

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
            {ogrenci.excel_no && <Rozet ton="sessiz">No {ogrenci.excel_no}</Rozet>}
          </div>
          <p className="mt-1 text-sm text-panel-soluk">
            {yasEtiketi(ogrenci, (d) => yasMetni(ayHesapla(d)))} ·{" "}
            {KURUM_ETIKET[ogrenci.kurum as Kurum] ?? ogrenci.kurum}
            {ogrenci.paket && ` · ${ogrenci.paket}`}
            {ogrenci.program_metni && ` · ${ogrenci.program_metni}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {yonetici && (
            <PaketSatisiFormu
              ogrenciler={secenekler}
              sozluk={sozluk}
              sabitOgrenciId={ogrenci.id}
              gorunum="ikincil"
            />
          )}
          {yonetici && <OgrenciDuzenle ogrenci={ogrenci} />}
        </div>
      </div>

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

      {/* Hak sayaclari EN USTTE: kurumun her gun baktigi iki sayi. */}
      {yonetici && (ogrenci.kalan_hak_saat !== null || ogrenci.gelis_hakki !== null || defter.length > 0) && (
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {(
            [
              ["Kalan hak (saat)", ogrenci.kalan_hak_saat ?? "—", ogrenci.kalan_hak_saat !== null && ogrenci.kalan_hak_saat < 0 ? "text-tehlike" : "text-murekkep"],
              ["Geliş hakkı", ogrenci.gelis_hakki ?? "—", ogrenci.gelis_hakki !== null && ogrenci.gelis_hakki < 0 ? "text-tehlike" : "text-murekkep"],
              ["Son ödeme", defter[0] ? `${tutarMetni(defter[0])} · ${kisaTarih(defter[0].tarih) || defter[0].tarih_ham || ""}` : (ogrenci.son_odenen ? `${ogrenci.son_odenen} · ${kisaTarih(ogrenci.son_odeme_tarihi)}` : "—"), "text-murekkep"],
              ["Defter toplamı", tl(defterToplami), "text-basari"],
            ] as const
          ).map(([etiket, deger, renk]) => (
            <div key={etiket} className="rounded-panel border border-panel-cizgi bg-panel-yuzey p-4 shadow-panel">
              <dt className="text-xs font-semibold text-panel-soluk">{etiket}</dt>
              <dd className={`mt-1.5 font-baslik text-xl font-bold tabular-nums leading-none ${renk}`}>{deger}</dd>
              {etiket === "Defter toplamı" && excelFarkli && (
                <p className="mt-1.5 text-xs text-panel-silik" title={ogrenci.toplam_odenen_formul ?? undefined}>
                  Excel toplamı {tl(ogrenci.toplam_odenen)}
                </p>
              )}
            </div>
          ))}
        </dl>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          {/* --- odeme defteri --- */}
          {yonetici && (
            <Kutu
              baslik="Ödeme defteri"
              aciklama="Excel'deki aylık sayfalardan gelen ve panelden girilen paket ödemeleri."
              yanCocuk={
                <PaketSatisiFormu
                  ogrenciler={secenekler}
                  sozluk={sozluk}
                  sabitOgrenciId={ogrenci.id}
                  gorunum="ikincil"
                  olcu="sm"
                />
              }
              dolgusuz
            >
              {defter.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-panel-soluk">
                  Henüz ödeme kaydı yok.
                </p>
              ) : (
                <ul className="divide-y divide-panel-cizgi">
                  {defter.map((s) => (
                    <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2">
                      <span className="w-20 shrink-0 text-xs tabular-nums text-panel-silik">
                        {kisaTarih(s.tarih) || s.tarih_ham || "—"}
                      </span>
                      <span className="min-w-0 flex-1 text-sm text-murekkep">
                        <span className="font-medium">{s.paket ?? "—"}</span>
                        {s.program && <span className="text-panel-soluk"> · {s.program}</span>}
                        {(s.odeme_turu || s.yontem) && (
                          <span className="text-panel-soluk"> · {s.odeme_turu ?? DEFTER_YONTEM_ETIKET[s.yontem!]}</span>
                        )}
                        {s.aciklama && (
                          <span className="mt-0.5 block truncate text-xs text-panel-silik" title={s.aciklama}>
                            {s.aciklama}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-xs text-panel-silik">
                        {s.kaynak === "excel" ? `${s.sayfa} · ${s.kaynak_satir}` : "panel"}
                      </span>
                      <span className={`shrink-0 text-sm font-semibold tabular-nums ${s.tutar === null ? "text-uyari" : "text-murekkep"}`}>
                        {tutarMetni(s)}
                      </span>
                      <PaketSatisiDuzelt satis={s} ogrenciler={secenekler} sozluk={sozluk} />
                    </li>
                  ))}
                </ul>
              )}
            </Kutu>
          )}

          <Kutu baslik="Sınıflar" dolgusuz>
            {aktifKayitlar.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-panel-soluk">
                Henüz bir sınıfa kayıtlı değil.
                {ogrenci.program_metni && ` Excel'deki program: ${ogrenci.program_metni}.`}
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
                            k.sinif.atolye_slug as Parameters<typeof atolyeBul>[0],
                          )?.ad ?? k.sinif.ad)
                        : (k.sinif?.ad ?? "—")}
                    </Link>
                    <p className="mt-0.5 text-xs text-panel-soluk">
                      {k.sinif?.gun && GUN_ADI[k.sinif.gun as Gun]}{" "}
                      {k.sinif?.bas} - {k.sinif?.bit}
                      {k.sinif?.ogretmen_ad && ` · ${k.sinif.ogretmen_ad}`}
                    </p>
                    <p className="mt-0.5 text-xs text-panel-silik">
                      {kisaTarih(k.baslangic)}&apos;den beri
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
                        {v.alternatif_telefon && ` · ${v.alternatif_telefon}`}
                      </span>
                    </span>
                    {v.telefon ? (
                      <a
                        href={`tel:0${v.telefon}`}
                        className="shrink-0 text-sm font-medium text-yesil-derin hover:underline"
                      >
                        {telefonYaz(v.telefon)}
                      </a>
                    ) : (
                      <span className="shrink-0 text-sm text-panel-silik">telefon yok</span>
                    )}
                    {yonetici && veliler.length > 1 && (
                      <VeliBagiKaldir ogrenciId={ogrenci.id} veliId={v.id} />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Kutu>

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
                        ? new Date(y.dersler.tarih).toLocaleDateString("tr-TR", {
                            day: "2-digit",
                            month: "2-digit",
                          })
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

          {yonetici && (
            <Kutu
              baslik="Cari hesap"
              aciklama="Borç / tahsilat muhasebesi. Paket ödemeleri yukarıdaki defterde."
            >
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
                {ogrenci.dogum_tarihi
                  ? new Date(ogrenci.dogum_tarihi).toLocaleDateString("tr-TR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : ""}
              </Satir>
              <Satir etiket="Yaş">{yasEtiketi(ogrenci, (d) => yasMetni(ayHesapla(d)))}</Satir>
              <Satir etiket="Kayıt tarihi">{kisaTarih(ogrenci.kayit_tarihi)}</Satir>
              <Satir etiket="Kurum">
                {KURUM_ETIKET[ogrenci.kurum as Kurum] ?? ogrenci.kurum}
              </Satir>
              <Satir etiket="Durum">{OGRENCI_DURUM_ETIKET[ogrenci.durum]}</Satir>
            </dl>
          </Kutu>

          {/* Excel GENEL LISTE'nin geri kalani; sutun adlari Excel'deki gibi. */}
          {yonetici && (
            <Kutu
              baslik="Kayıt bilgileri"
              aciklama={ogrenci.excel_kaynak ? `Excel ${ogrenci.excel_kaynak.replace("!", " · satır ")}` : "Excel genel listesindeki sütunlar."}
            >
              <dl>
                <Satir etiket="Excel'deki ad">{ogrenci.excel_adi ?? ""}</Satir>
                <Satir etiket="İlk kayıt yaş">{ogrenci.ilk_kayit_yas ?? ""}</Satir>
                <Satir etiket="Doğum günü (Excel)">{kisaTarih(ogrenci.dogum_gunu)}</Satir>
                <Satir etiket="Katılım durumu">{ogrenci.katilim_durumu ?? ""}</Satir>
                <Satir etiket="Paket">{ogrenci.paket ?? ""}</Satir>
                <Satir etiket="Program">{ogrenci.program_metni ?? ""}</Satir>
                <Satir etiket="İkametgâh">{ogrenci.ikametgah ?? ""}</Satir>
                <Satir etiket="Son ödeme (Excel)">
                  {ogrenci.son_odenen
                    ? `${ogrenci.son_odenen} · ${kisaTarih(ogrenci.son_odeme_tarihi)}${ogrenci.son_odeme_turu ? ` · ${ogrenci.son_odeme_turu}` : ""}`
                    : ""}
                </Satir>
                <Satir etiket="Toplam ödenen (Excel)">
                  {ogrenci.toplam_odenen !== null ? tl(ogrenci.toplam_odenen) : ""}
                </Satir>
                <Satir etiket="Güncellenme">{kisaTarih(ogrenci.guncellenme_tarihi)}</Satir>
                <Satir etiket="İlk derse katılım">{kisaTarih(ogrenci.ilk_ders_tarihi)}</Satir>
              </dl>
              {ogrenci.toplam_odenen_formul && (
                <p className="mt-2 break-all font-mono text-[0.7rem] leading-relaxed text-panel-silik">
                  {ogrenci.toplam_odenen_formul}
                </p>
              )}
              {ogrenci.excel_notu && (
                <p className="mt-3 rounded-panel-sm border border-uyari/25 bg-uyari-zemin px-3 py-2 text-sm leading-relaxed text-murekkep">
                  {ogrenci.excel_notu}
                </p>
              )}
            </Kutu>
          )}

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
