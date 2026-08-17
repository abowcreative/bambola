import Link from "next/link";
import { rolZorunlu } from "@/lib/kampus/oturum";
import { dersleriGetir, DERS_DURUM_ETIKET } from "@/lib/kampus/yoklama";
import type { DersDurumu } from "@/lib/kampus/yoklama-tipleri";
import {
  Kabuk,
  SayfaBasi,
  Kutu,
  Sayac,
  BosDurum,
} from "@/components/kampus/kabuk";
import { atolyeBul } from "@/lib/data/atolyeler";
import { sinifGetir } from "@/lib/kampus/ogrenciler";
import { z } from "zod";

export const metadata = { title: "Ders kayıtları", robots: { index: false } };
export const dynamic = "force-dynamic";

const DURUM_RENGI: Record<DersDurumu, string> = {
  planli: "bg-krem-koyu text-murekkep",
  islendi: "bg-yesil-koyu text-white",
  iptal: "bg-cizgi text-murekkep-soluk",
};

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

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/dersler">
      <SayfaBasi
        baslik="Ders kayıtları"
        aciklama="İşlenen dersler, konuları ve işleyen öğretmen."
      />

      {sinif && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-blok border-2 border-yesil bg-lime-rozet/25 px-4 py-3">
          <span className="text-sm text-murekkep">
            <strong className="font-baslik">{sinif.ad}</strong> sınıfının
            dersleri
          </span>
          <span className="flex gap-3 text-sm font-semibold">
            <Link
              href={`/kampus/siniflar/${sinif.id}`}
              className="text-yesil-koyu hover:underline"
            >
              Sınıfa git
            </Link>
            <Link
              href="/kampus/dersler"
              className="text-murekkep-soluk hover:underline"
            >
              Süzgeci kaldır
            </Link>
          </span>
        </div>
      )}

      {hepsi.length === 0 ? (
        <BosDurum
          baslik={sinif ? "Bu sınıfta ders kaydı yok" : "Henüz ders kaydı yok"}
          aciklama="Yoklama bölümünden bir gün seçip dersi açtığınızda burada görünür."
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Sayac etiket="İşlendi" deger={say("islendi")} />
            <Sayac etiket="Planlı" deger={say("planli")} />
            <Sayac etiket="İptal" deger={say("iptal")} />
          </div>

          <form className="mt-5 flex flex-wrap gap-2">
            {/* Sinif suzgeci durum degistirilirken kaybolmasin. */}
            {sinifId && <input type="hidden" name="sinif" value={sinifId} />}
            {(["hepsi", "islendi", "planli", "iptal"] as const).map((d) => (
              <button
                key={d}
                type="submit"
                name="durum"
                value={d}
                className={`rounded-full border-2 px-4 py-1.5 font-baslik text-sm font-semibold transition-colors ${
                  durum === d
                    ? "border-yesil-koyu bg-yesil-koyu text-white"
                    : "border-cizgi bg-white text-murekkep-soluk hover:border-yesil hover:text-murekkep"
                }`}
              >
                {d === "hepsi" ? "Hepsi" : DERS_DURUM_ETIKET[d]}
              </button>
            ))}
          </form>

          <Kutu className="mt-5">
            <ul className="divide-y divide-cizgi">
              {liste.map((d) => (
                <li
                  key={d.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3"
                >
                  <span className="w-24 shrink-0 tabular-nums text-sm text-murekkep-soluk">
                    {new Date(`${d.tarih}T12:00:00+03:00`).toLocaleDateString(
                      "tr-TR",
                      { day: "2-digit", month: "2-digit", year: "2-digit" },
                    )}
                  </span>

                  <Link
                    href={`/kampus/yoklama/${d.id}`}
                    className="min-w-0 flex-1"
                  >
                    <span className="block font-baslik text-sm font-bold text-murekkep hover:underline">
                      {d.sinif?.atolye_slug
                        ? (atolyeBul(
                            d.sinif.atolye_slug as Parameters<
                              typeof atolyeBul
                            >[0],
                          )?.ad ?? d.sinif.ad)
                        : (d.sinif?.ad ?? "—")}
                    </span>
                    <span className="mt-0.5 block text-xs text-murekkep-soluk">
                      {d.sinif?.bas} - {d.sinif?.bit}
                      {d.isleyen_ogretmen && ` · ${d.isleyen_ogretmen}`}
                      {d.konu && ` · ${d.konu}`}
                    </span>
                  </Link>

                  <span className="shrink-0 text-sm text-murekkep-soluk">
                    {d.yoklamaSayisi > 0
                      ? `${d.gelenSayisi}/${d.yoklamaSayisi}`
                      : "—"}
                  </span>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${DURUM_RENGI[d.durum]}`}
                  >
                    {DERS_DURUM_ETIKET[d.durum]}
                  </span>
                </li>
              ))}
            </ul>
          </Kutu>
        </>
      )}
    </Kabuk>
  );
}
