import Link from "next/link";
import { rolZorunlu } from "@/lib/kampus/oturum";
import { cocuklarim, ogrencininYoklamasi } from "@/lib/kampus/yoklama";
import {
  YOKLAMA_ETIKET,
  type YoklamaDurumu,
} from "@/lib/kampus/yoklama-tipleri";
import { YOKLAMA_TONU } from "@/lib/kampus/tonlar";
import { ogrencininKayitlari } from "@/lib/kampus/ogrenciler";
import { ogrenciAdi } from "@/lib/kampus/ogrenci-tipleri";
import { Kabuk, SayfaBasi, Kutu } from "@/components/kampus/kabuk";
import { Bildirim, BosDurum, Rozet, Sayac } from "@/components/kampus/ui";
import { atolyeBul } from "@/lib/data/atolyeler";
import { GUN_ADI } from "@/lib/data/types";
import type { Gun } from "@/lib/data/types";
import { yasMetni, ayHesapla } from "@/lib/yas";
import { Ikon } from "@/components/ui/ikon";

export const metadata = { title: "Çocuğum", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * Veli gorunumu.
 *
 * Veli YALNIZ kendi cocugunu goruyor; sinirlamayi RLS yapiyor (0003 ve 0004
 * politikalari). Bu sayfa ayri bir filtre uygulamiyor, cunku veritabani
 * baska satir dondurmuyor.
 *
 * Odeme bilgisi BU SAYFADA GOSTERILMIYOR. RLS veliye kendi borcunu
 * okutuyor ama para konusunu panele koymak once kurumla konusulmali:
 * yanlis gorunen bir bakiye telefon trafigi yaratir.
 */
export default async function CocugumSayfasi() {
  const oturum = await rolZorunlu("veli");
  const cocuklar = await cocuklarim();

  if (cocuklar.length === 0) {
    return (
      <Kabuk oturum={oturum} aktifYol="/kampus/cocugum">
        <SayfaBasi baslik="Çocuğum" />
        <BosDurum
          baslik="Bağlı çocuk kaydı yok"
          ikon={<Ikon.Bebek boyut={22} />}
          aciklama="Hesabınız henüz bir öğrenci kaydına bağlanmamış. Kurum yöneticisine başvurun."
        />
      </Kabuk>
    );
  }

  const veriler = await Promise.all(
    cocuklar.map(async (c) => ({
      cocuk: c,
      kayitlar: await ogrencininKayitlari(c.id),
      yoklama: await ogrencininYoklamasi(c.id),
    })),
  );

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/cocugum">
      <SayfaBasi
        baslik={cocuklar.length === 1 ? "Çocuğum" : "Çocuklarım"}
        aciklama="Programı ve devam durumu."
      />

      <div className="space-y-6">
        {veriler.map(({ cocuk, kayitlar, yoklama }) => {
          const aktif = kayitlar.filter((k) => k.durum === "aktif");
          const gelen = yoklama.filter(
            (y) => y.durum === "geldi" || y.durum === "telafi",
          ).length;

          return (
            <div key={cocuk.id} className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-baslik text-lg font-bold text-murekkep">
                  {ogrenciAdi(cocuk)}
                </h2>
                <span className="text-sm text-panel-soluk">
                  {yasMetni(ayHesapla(cocuk.dogum_tarihi))}
                </span>
              </div>

              {cocuk.alerji && (
                <Bildirim ton="uyari" ikon={<Ikon.Kalp boyut={15} />}>
                  <strong>Kayıtlı alerji:</strong> {cocuk.alerji}
                </Bildirim>
              )}

              <div className="grid gap-3 sm:grid-cols-3">
                <Sayac etiket="Aktif grup" deger={aktif.length} />
                <Sayac
                  etiket="Katılım"
                  deger={
                    yoklama.length > 0 ? `${gelen}/${yoklama.length}` : "—"
                  }
                  ton={yoklama.length > 0 ? "basari" : "notr"}
                />
                <Sayac
                  etiket="Devamsızlık"
                  deger={yoklama.filter((y) => y.durum === "gelmedi").length}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Kutu baslik="Programı" dolgusuz>
                  {aktif.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-panel-soluk">
                      Henüz bir gruba kayıtlı değil.
                    </p>
                  ) : (
                    <ul className="divide-y divide-panel-cizgi">
                      {aktif.map((k) => (
                        <li key={k.id} className="px-4 py-2.5">
                          <p className="text-sm font-semibold text-murekkep">
                            {k.sinif?.atolye_slug
                              ? (atolyeBul(
                                  k.sinif.atolye_slug as Parameters<
                                    typeof atolyeBul
                                  >[0],
                                )?.ad ?? k.sinif.ad)
                              : (k.sinif?.ad ?? "—")}
                          </p>
                          <p className="mt-0.5 text-xs text-panel-soluk">
                            {k.sinif?.gun && GUN_ADI[k.sinif.gun as Gun]}{" "}
                            {k.sinif?.bas} - {k.sinif?.bit}
                            {k.sinif?.ogretmen_ad &&
                              ` · ${k.sinif.ogretmen_ad}`}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </Kutu>

                <Kutu
                  baslik="Devam durumu"
                  yanCocuk={
                    yoklama.length > 0 ? (
                      <span className="text-xs text-panel-silik">
                        {gelen}/{yoklama.length} katılım
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
                      {yoklama.slice(0, 12).map((y) => (
                        <li
                          key={y.id}
                          className="flex flex-wrap items-center gap-x-3 px-4 py-2 text-sm"
                        >
                          <span className="w-14 shrink-0 text-xs tabular-nums text-panel-silik">
                            {y.dersler?.tarih
                              ? new Date(y.dersler.tarih).toLocaleDateString(
                                  "tr-TR",
                                  { day: "2-digit", month: "2-digit" },
                                )
                              : "—"}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-murekkep">
                            {y.dersler?.siniflar?.atolye_slug
                              ? (atolyeBul(
                                  y.dersler.siniflar.atolye_slug as Parameters<
                                    typeof atolyeBul
                                  >[0],
                                )?.kisaAd ?? "—")
                              : "—"}
                          </span>
                          <Rozet ton={YOKLAMA_TONU[y.durum] ?? "notr"}>
                            {YOKLAMA_ETIKET[y.durum as YoklamaDurumu]}
                          </Rozet>
                        </li>
                      ))}
                    </ul>
                  )}
                </Kutu>
              </div>
            </div>
          );
        })}
      </div>

      <Kutu className="mt-5">
        <p className="text-sm leading-relaxed text-panel-soluk">
          Duyuruları{" "}
          <Link
            href="/kampus/duyurular"
            className="font-semibold text-yesil-derin hover:underline"
          >
            Duyurular
          </Link>{" "}
          bölümünden takip edebilirsiniz. Ödeme bilgisi şu an panelde
          gösterilmiyor; kurumla iletişime geçebilirsiniz.
        </p>
      </Kutu>
    </Kabuk>
  );
}
