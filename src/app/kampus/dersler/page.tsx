import Link from "next/link";
import { rolZorunlu } from "@/lib/kampus/oturum";
import { dersleriGetir, DERS_DURUM_ETIKET } from "@/lib/kampus/yoklama";
import type { DersDurumu } from "@/lib/kampus/yoklama-tipleri";
import { DERS_TONU } from "@/lib/kampus/tonlar";
import { Kabuk, SayfaBasi, Kutu } from "@/components/kampus/kabuk";
import {
  Bildirim,
  BosDurum,
  Rozet,
  Sayac,
  SekmeSeridi,
  TabloSarmal,
  Th,
  Td,
  Tr,
} from "@/components/kampus/ui";
import { atolyeBul } from "@/lib/data/atolyeler";
import { sinifGetir } from "@/lib/kampus/ogrenciler";
import { z } from "zod";

export const metadata = { title: "Ders kayıtları", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * Islenen derslerin gecmisi.
 *
 * Yoklama sayfasi BUGUNE bakiyor, burasi GECMISE: "gecen hafta carsamba
 * dersi islendi mi", "ne yapildi", "kim isledi".
 */
export default async function DerslerSayfasi({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const oturum = await rolZorunlu("admin", "ogretmen");
  const p = await searchParams;
  const tek = (a: string | string[] | undefined) =>
    Array.isArray(a) ? a[0] : a;

  const durum = (tek(p.durum) as DersDurumu | "hepsi") ?? "hepsi";
  /*
    `sinif` sinif sayfasindan gelen baglantidan geliyor: "Tum dersler".
    Gecerli bir uuid degilse suzgeci hic uygulamiyoruz -- adres cubugundan
    gelen serbest metnin sorguya gitmesine gerek yok.
  */
  const sinifId = z.uuid().safeParse(tek(p.sinif)).data;

  const [liste, hepsi, sinif] = await Promise.all([
    dersleriGetir({ durum, sinifId }),
    dersleriGetir({ sinifId }),
    sinifId ? sinifGetir(sinifId) : Promise.resolve(null),
  ]);

  const say = (d: DersDurumu) => hepsi.filter((x) => x.durum === d).length;

  /** Sekme adresi. Sinif suzgeci durum degisirken kaybolmuyor. */
  function yol(yeniDurum: string): string {
    const y = new URLSearchParams();
    if (sinifId) y.set("sinif", sinifId);
    if (yeniDurum !== "hepsi") y.set("durum", yeniDurum);
    const sorgu = y.toString();
    return sorgu ? `/kampus/dersler?${sorgu}` : "/kampus/dersler";
  }

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/dersler">
      <SayfaBasi
        baslik="Ders kayıtları"
        aciklama="İşlenen dersler, konuları ve işleyen öğretmen."
      />

      {sinif && (
        <Bildirim ton="bilgi" className="mb-4">
          <span className="flex flex-wrap items-center justify-between gap-3">
            <span>
              <strong className="font-baslik">{sinif.ad}</strong> sınıfının
              dersleri
            </span>
            <span className="flex gap-3 text-sm font-semibold">
              <Link
                href={`/kampus/siniflar/${sinif.id}`}
                className="text-yesil-derin hover:underline"
              >
                Sınıfa git
              </Link>
              <Link
                href="/kampus/dersler"
                className="text-panel-soluk hover:underline"
              >
                Süzgeci kaldır
              </Link>
            </span>
          </span>
        </Bildirim>
      )}

      {hepsi.length === 0 ? (
        <BosDurum
          baslik={sinif ? "Bu sınıfta ders kaydı yok" : "Henüz ders kaydı yok"}
          aciklama="Yoklama bölümünden bir gün seçip dersi açtığınızda burada görünür."
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Sayac etiket="İşlendi" deger={say("islendi")} ton="basari" />
            <Sayac etiket="Planlı" deger={say("planli")} ton="bilgi" />
            <Sayac etiket="İptal" deger={say("iptal")} />
          </div>

          <div className="mt-4">
            <SekmeSeridi
              sekmeler={(["hepsi", "islendi", "planli", "iptal"] as const).map(
                (d) => ({
                  anahtar: d,
                  etiket: d === "hepsi" ? "Hepsi" : DERS_DURUM_ETIKET[d],
                  yol: yol(d),
                  sayi: d === "hepsi" ? hepsi.length : say(d),
                  aktif: durum === d,
                }),
              )}
            />
          </div>

          <Kutu className="mt-4" dolgusuz>
            <TabloSarmal enAz="42rem">
              <thead>
                <tr>
                  <Th>Tarih</Th>
                  <Th>Sınıf</Th>
                  <Th>Konu</Th>
                  <Th sag>Yoklama</Th>
                  <Th sag>Durum</Th>
                </tr>
              </thead>
              <tbody>
                {liste.map((d) => (
                  <Tr key={d.id}>
                    <Td sayi className="text-panel-soluk">
                      <Link
                        href={`/kampus/yoklama/${d.id}`}
                        className="font-medium text-yesil-derin hover:underline"
                      >
                        {new Date(
                          `${d.tarih}T12:00:00+03:00`,
                        ).toLocaleDateString("tr-TR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                        })}
                      </Link>
                    </Td>
                    <Td>
                      <Link
                        href={`/kampus/yoklama/${d.id}`}
                        className="font-semibold text-murekkep hover:underline"
                      >
                        {d.sinif?.atolye_slug
                          ? (atolyeBul(
                              d.sinif.atolye_slug as Parameters<
                                typeof atolyeBul
                              >[0],
                            )?.ad ?? d.sinif.ad)
                          : (d.sinif?.ad ?? "—")}
                      </Link>
                      <span className="mt-0.5 block text-xs text-panel-silik">
                        {d.sinif?.bas} - {d.sinif?.bit}
                        {d.isleyen_ogretmen && ` · ${d.isleyen_ogretmen}`}
                      </span>
                    </Td>
                    <Td className="max-w-64 truncate text-panel-soluk">
                      {d.konu ?? <span className="text-panel-silik">—</span>}
                    </Td>
                    <Td sayi className="text-panel-soluk">
                      {d.yoklamaSayisi > 0
                        ? `${d.gelenSayisi}/${d.yoklamaSayisi}`
                        : "—"}
                    </Td>
                    <Td sag>
                      <Rozet ton={DERS_TONU[d.durum] ?? "notr"}>
                        {DERS_DURUM_ETIKET[d.durum]}
                      </Rozet>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </TabloSarmal>
          </Kutu>

          {liste.length === 0 && (
            <div className="mt-4">
              <BosDurum
                baslik="Bu filtrede ders yok"
                aciklama="Başka bir durum sekmesine bakabilirsiniz."
              />
            </div>
          )}
        </>
      )}
    </Kabuk>
  );
}
