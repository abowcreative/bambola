import { rolZorunlu } from "@/lib/kampus/oturum";
import { menuleriGetir } from "@/lib/kampus/yoklama";
import { Kabuk, SayfaBasi, Kutu } from "@/components/kampus/kabuk";
import { MenuAlani } from "@/components/kampus/menu-alani";
import { ogrencileriGetir } from "@/lib/kampus/ogrenciler";
import { ogrenciAdi } from "@/lib/kampus/ogrenci-tipleri";
import { Ikon } from "@/components/ui/ikon";

export const metadata = { title: "Yemek ve menü", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Verilen tarihin haftasindaki pazartesi. */
function haftaninBasi(tarih: Date): Date {
  const g = new Date(tarih);
  const gun = (g.getDay() + 6) % 7; // pazartesi = 0
  g.setDate(g.getDate() - gun);
  return g;
}

const iso = (d: Date) => d.toLocaleDateString("en-CA");

export default async function YemekSayfasi({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const oturum = await rolZorunlu("admin", "ogretmen");
  const p = await searchParams;
  const tek = (a: string | string[] | undefined) =>
    Array.isArray(a) ? a[0] : a;

  const referans = tek(p.hafta)
    ? new Date(`${tek(p.hafta)}T12:00:00+03:00`)
    : new Date();
  const pazartesi = haftaninBasi(referans);

  const gunler = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(pazartesi);
    d.setDate(d.getDate() + i);
    return d;
  });

  const [menuler, ogrenciler] = await Promise.all([
    menuleriGetir(iso(gunler[0]), iso(gunler[5])),
    ogrencileriGetir({ durum: "aktif" }),
  ]);

  const menuHaritasi = new Map(menuler.map((m) => [m.tarih, m]));

  /*
    Alerjisi olan cocuklar menunun yaninda duruyor: mutfaga giden bilgi
    burada birlesiyor ve iki ayri ekrana bakmak gerekmiyor.
  */
  const alerjililer = ogrenciler.filter((o) => o.alerji);

  const oncekiHafta = new Date(pazartesi);
  oncekiHafta.setDate(oncekiHafta.getDate() - 7);
  const sonrakiHafta = new Date(pazartesi);
  sonrakiHafta.setDate(sonrakiHafta.getDate() + 7);

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/yemek">
      <SayfaBasi
        baslik="Yemek ve menü"
        aciklama={`${gunler[0].toLocaleDateString("tr-TR", { day: "numeric", month: "long" })} - ${gunler[5].toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}`}
        cocuklar={
          <div className="flex gap-2">
            <a
              href={`/kampus/yemek?hafta=${iso(oncekiHafta)}`}
              className="rounded-full border-2 border-cizgi bg-white px-3.5 py-1.5 text-sm font-semibold text-murekkep transition-colors hover:border-yesil"
            >
              Önceki
            </a>
            <a
              href={`/kampus/yemek?hafta=${iso(sonrakiHafta)}`}
              className="rounded-full border-2 border-cizgi bg-white px-3.5 py-1.5 text-sm font-semibold text-murekkep transition-colors hover:border-yesil"
            >
              Sonraki
            </a>
          </div>
        }
      />

      {alerjililer.length > 0 && (
        <div className="mb-5 rounded-blok border-2 border-yesil bg-lime-rozet/25 p-5">
          <h2 className="flex items-center gap-2 font-baslik text-base font-bold text-murekkep">
            <Ikon.Kalp boyut={18} />
            Alerjisi olan öğrenciler
          </h2>
          <ul className="mt-2 space-y-1">
            {alerjililer.map((o) => (
              <li key={o.id} className="text-sm text-murekkep">
                <strong>{ogrenciAdi(o)}:</strong> {o.alerji}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {gunler.map((g) => {
          const t = iso(g);
          const menu = menuHaritasi.get(t) ?? null;
          return (
            <Kutu
              key={t}
              baslik={g.toLocaleDateString("tr-TR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            >
              {oturum.rol === "admin" ? (
                <MenuAlani tarih={t} menu={menu} />
              ) : menu ? (
                <dl className="space-y-2 text-sm">
                  {menu.kahvalti && (
                    <div>
                      <dt className="text-murekkep-soluk">Kahvaltı</dt>
                      <dd className="text-murekkep">{menu.kahvalti}</dd>
                    </div>
                  )}
                  {menu.ogle && (
                    <div>
                      <dt className="text-murekkep-soluk">Öğle</dt>
                      <dd className="text-murekkep">{menu.ogle}</dd>
                    </div>
                  )}
                  {menu.ara_ogun && (
                    <div>
                      <dt className="text-murekkep-soluk">Ara öğün</dt>
                      <dd className="text-murekkep">{menu.ara_ogun}</dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className="text-sm text-murekkep-soluk">
                  Menü girilmemiş.
                </p>
              )}
            </Kutu>
          );
        })}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-murekkep-soluk">
        Excel&apos;deki kurala göre her grup gününde ara öğün verilir.
        Cumartesi programı ayrıdır, pazar grup programı yoktur.
      </p>
    </Kabuk>
  );
}
