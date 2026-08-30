import Link from "next/link";
import { rolZorunlu } from "@/lib/kampus/oturum";
import { siniflariGetir } from "@/lib/kampus/ogrenciler";
import { dersleriGetir, DERS_DURUM_ETIKET } from "@/lib/kampus/yoklama";
import { DERS_TONU } from "@/lib/kampus/tonlar";
import { Kabuk, SayfaBasi, Kutu } from "@/components/kampus/kabuk";
import {
  ALAN,
  BosDurum,
  Dugme,
  DugmeLink,
  Rozet,
  Sayac,
} from "@/components/kampus/ui";
import { DersAcButonu } from "@/components/kampus/ders-ac-butonu";
import { bugununTarihi } from "@/lib/tarih";
import { atolyeBul } from "@/lib/data/atolyeler";
import { GUN_ADI, GUNLER } from "@/lib/data/types";
import { Ikon } from "@/components/ui/ikon";

export const metadata = { title: "Yoklama", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Tarihi gun sayisi kadar kaydirir. Gun gecisi icin. */
function tarihKaydir(iso: string, gun: number): string {
  const d = new Date(`${iso}T12:00:00+03:00`);
  d.setDate(d.getDate() + gun);
  return d.toLocaleDateString("en-CA");
}

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

  const gununSiniflari = siniflar.filter(
    (s) => s.gun === secilenGun && s.aktif,
  );
  const dersHaritasi = new Map(dersler.map((d) => [d.sinif_id, d]));

  const islenen = dersler.filter((d) => d.durum === "islendi").length;
  const bekleyen = gununSiniflari.length - islenen;

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/yoklama">
      <SayfaBasi
        baslik="Yoklama"
        aciklama={new Date(`${tarih}T12:00:00+03:00`).toLocaleDateString(
          "tr-TR",
          { weekday: "long", day: "numeric", month: "long", year: "numeric" },
        )}
        cocuklar={
          <div className="flex flex-wrap items-center gap-2">
            <DugmeLink
              href={`/kampus/yoklama?tarih=${tarihKaydir(tarih, -1)}`}
              aria-label="Önceki gün"
            >
              <Ikon.OkGeri boyut={15} />
            </DugmeLink>
            {tarih !== bugun && (
              <DugmeLink href="/kampus/yoklama">Bugün</DugmeLink>
            )}
            <DugmeLink
              href={`/kampus/yoklama?tarih=${tarihKaydir(tarih, 1)}`}
              aria-label="Sonraki gün"
            >
              <Ikon.Ok boyut={15} />
            </DugmeLink>
            <form className="flex items-center gap-2">
              <input
                id="tarih"
                type="date"
                name="tarih"
                defaultValue={tarih}
                aria-label="Tarih seç"
                className={`${ALAN} h-9 w-auto py-0`}
              />
              <Dugme type="submit">Git</Dugme>
            </form>
          </div>
        }
      />

      {gununSiniflari.length === 0 ? (
        <BosDurum
          baslik="Bu gün için sınıf yok"
          ikon={<Ikon.Takvim boyut={22} />}
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
            <Sayac etiket="İşlendi" deger={islenen} ton="basari" />
            <Sayac
              etiket="Bekleyen"
              deger={Math.max(0, bekleyen)}
              ton={bekleyen > 0 ? "uyari" : "notr"}
            />
          </div>

          <Kutu className="mt-4" dolgusuz>
            <ul className="divide-y divide-panel-cizgi">
              {gununSiniflari.map((s) => {
                const ders = dersHaritasi.get(s.id);
                const islendi = ders?.durum === "islendi";
                return (
                  <li
                    key={s.id}
                    className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 transition-colors ${
                      islendi ? "bg-basari-zemin/40" : "hover:bg-panel-yuzey-alt"
                    }`}
                  >
                    <span className="w-11 shrink-0 font-baslik text-sm font-bold tabular-nums text-yesil-derin">
                      {s.bas}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-murekkep">
                        {s.atolye_slug
                          ? (atolyeBul(
                              s.atolye_slug as Parameters<typeof atolyeBul>[0],
                            )?.ad ?? s.ad)
                          : s.ad}
                      </span>
                      <span className="mt-0.5 block text-xs text-panel-soluk">
                        {s.ogretmen_ad ?? "öğretmen atanmadı"} ·{" "}
                        {s.ogrenciSayisi} öğrenci
                      </span>
                    </span>

                    {ders ? (
                      <>
                        <span className="shrink-0 text-xs text-panel-soluk">
                          {ders.yoklamaSayisi > 0
                            ? `${ders.gelenSayisi}/${ders.yoklamaSayisi} geldi`
                            : "yoklama alınmadı"}
                        </span>
                        <Rozet ton={DERS_TONU[ders.durum] ?? "notr"}>
                          {DERS_DURUM_ETIKET[ders.durum]}
                        </Rozet>
                        <DugmeLink
                          href={`/kampus/yoklama/${ders.id}`}
                          gorunum={islendi ? "ikincil" : "birincil"}
                          olcu="sm"
                        >
                          {islendi ? "Görüntüle" : "Yoklama al"}
                        </DugmeLink>
                      </>
                    ) : (
                      <DersAcButonu sinifId={s.id} tarih={tarih} />
                    )}
                  </li>
                );
              })}
            </ul>
          </Kutu>

          <p className="mt-3 text-xs leading-relaxed text-panel-silik">
            Ders açıldığında o günün seansı kayda geçer. Yoklama, sınıfın
            aktif öğrenci listesi üzerinden alınır. Kapalı sınıflar burada
            çıkmaz —{" "}
            <Link
              href="/kampus/siniflar"
              className="font-semibold text-yesil-derin hover:underline"
            >
              Sınıflar
            </Link>{" "}
            bölümünden açılabilir.
          </p>
        </>
      )}
    </Kabuk>
  );
}
