import Link from "next/link";
import { rolZorunlu } from "@/lib/kampus/oturum";
import { siniflariGetir } from "@/lib/kampus/ogrenciler";
import { dersleriGetir, DERS_DURUM_ETIKET } from "@/lib/kampus/yoklama";
import {
  Kabuk,
  SayfaBasi,
  Kutu,
  Sayac,
  BosDurum,
} from "@/components/kampus/kabuk";
import { DersAcButonu } from "@/components/kampus/ders-ac-butonu";
import { bugununTarihi } from "@/lib/tarih";
import { atolyeBul } from "@/lib/data/atolyeler";
import { GUN_ADI, GUNLER } from "@/lib/data/types";

export const metadata = { title: "Yoklama", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function YoklamaSayfasi({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const oturum = await rolZorunlu("admin", "ogretmen");
  const p = await searchParams;
  const tek = (a: string | string[] | undefined) =>
    Array.isArray(a) ? a[0] : a;

  const bugun = bugununTarihi();
  const tarih = tek(p.tarih) ?? bugun;

  const [siniflar, dersler] = await Promise.all([
    siniflariGetir("2026-2027"),
    dersleriGetir({ baslangic: tarih, bitis: tarih }),
  ]);

  /*
    O gunun gunune denk gelen siniflar. Yoklama gunun programina gore
    aliniyor: butun siniflari listelemek her gun otuz satir demek olurdu.
  */
  const secilenGun = GUNLER.find(
    (g) =>
      GUN_ADI[g] ===
      new Date(`${tarih}T12:00:00+03:00`).toLocaleDateString("tr-TR", {
        weekday: "long",
      }),
  );

  const gununSiniflari = siniflar.filter((s) => s.gun === secilenGun);
  const dersHaritasi = new Map(dersler.map((d) => [d.sinif_id, d]));

  const islenen = dersler.filter((d) => d.durum === "islendi").length;
  const bekleyen = gununSiniflari.length - islenen;

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/yoklama">
      <SayfaBasi
        baslik="Yoklama"
        aciklama={`${new Date(`${tarih}T12:00:00+03:00`).toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}`}
        cocuklar={
          <form className="flex items-center gap-2">
            <label htmlFor="tarih" className="text-sm text-murekkep-soluk">
              Tarih
            </label>
            <input
              id="tarih"
              type="date"
              name="tarih"
              defaultValue={tarih}
              className="rounded-full border-2 border-cizgi bg-white px-3.5 py-1.5 text-sm text-murekkep outline-none focus:border-yesil"
            />
            <button
              type="submit"
              className="rounded-full border-2 border-cizgi bg-white px-3.5 py-1.5 font-baslik text-sm font-semibold text-murekkep transition-colors hover:border-yesil"
            >
              Git
            </button>
          </form>
        }
      />

      {gununSiniflari.length === 0 ? (
        <BosDurum
          baslik="Bu gün için sınıf yok"
          aciklama={
            siniflar.length === 0
              ? "Önce Sınıflar bölümünden dönem sınıflarını açmanız gerekiyor."
              : "Seçilen günde grup programı bulunmuyor. Başka bir tarih seçin."
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Sayac etiket="Bugünkü ders" deger={gununSiniflari.length} />
            <Sayac etiket="İşlendi" deger={islenen} />
            <Sayac
              etiket="Bekleyen"
              deger={Math.max(0, bekleyen)}
              vurgu={bekleyen > 0}
            />
          </div>

          <Kutu className="mt-6">
            <ul className="space-y-2">
              {gununSiniflari.map((s) => {
                const ders = dersHaritasi.get(s.id);
                return (
                  <li
                    key={s.id}
                    className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-kart border-2 px-4 py-3 ${
                      ders?.durum === "islendi"
                        ? "border-yesil bg-lime-rozet/20"
                        : "border-cizgi"
                    }`}
                  >
                    <span className="shrink-0 font-baslik text-sm font-bold tabular-nums text-yesil-koyu">
                      {s.bas}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block font-baslik text-sm font-bold text-murekkep">
                        {s.atolye_slug
                          ? (atolyeBul(
                              s.atolye_slug as Parameters<typeof atolyeBul>[0],
                            )?.ad ?? s.ad)
                          : s.ad}
                      </span>
                      <span className="mt-0.5 block text-xs text-murekkep-soluk">
                        {s.ogretmen_ad ?? "öğretmen atanmadı"} ·{" "}
                        {s.ogrenciSayisi} öğrenci
                      </span>
                    </span>

                    {ders ? (
                      <>
                        <span className="shrink-0 text-sm text-murekkep-soluk">
                          {ders.yoklamaSayisi > 0
                            ? `${ders.gelenSayisi}/${ders.yoklamaSayisi} geldi`
                            : "yoklama alınmadı"}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            ders.durum === "islendi"
                              ? "bg-yesil-koyu text-white"
                              : ders.durum === "iptal"
                                ? "bg-cizgi text-murekkep-soluk"
                                : "bg-krem-koyu text-murekkep"
                          }`}
                        >
                          {DERS_DURUM_ETIKET[ders.durum]}
                        </span>
                        <Link
                          href={`/kampus/yoklama/${ders.id}`}
                          className="shrink-0 rounded-full bg-[var(--kol-ana)] px-4 py-1.5 font-baslik text-sm font-semibold text-white"
                        >
                          Yoklama al
                        </Link>
                      </>
                    ) : (
                      <DersAcButonu sinifId={s.id} tarih={tarih} />
                    )}
                  </li>
                );
              })}
            </ul>
          </Kutu>

          <p className="mt-4 text-xs leading-relaxed text-murekkep-soluk">
            Ders açıldığında o günün seansı kayda geçer. Yoklama, sınıfın
            aktif öğrenci listesi üzerinden alınır.
          </p>
        </>
      )}
    </Kabuk>
  );
}
