import { rolZorunlu } from "@/lib/kampus/oturum";
import { menuleriGetir } from "@/lib/kampus/yoklama";
import { Kabuk, SayfaBasi, Kutu } from "@/components/kampus/kabuk";
import { Bildirim, DugmeLink, Satir } from "@/components/kampus/ui";
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
          <>
            <DugmeLink href={`/kampus/yemek?hafta=${iso(oncekiHafta)}`}>
              <Ikon.OkGeri boyut={15} />
              Önceki
            </DugmeLink>
            <DugmeLink href="/kampus/yemek">Bu hafta</DugmeLink>
            <DugmeLink href={`/kampus/yemek?hafta=${iso(sonrakiHafta)}`}>
              Sonraki
              <Ikon.Ok boyut={15} />
            </DugmeLink>
          </>
        }
      />

      {alerjililer.length > 0 && (
        <Bildirim
          ton="uyari"
          className="mb-4"
          baslik="Alerjisi olan öğrenciler"
          ikon={<Ikon.Kalp boyut={16} />}
        >
          <ul className="mt-1 space-y-0.5">
            {alerjililer.map((o) => (
              <li key={o.id} className="text-sm text-murekkep">
                <strong>{ogrenciAdi(o)}:</strong> {o.alerji}
              </li>
            ))}
          </ul>
        </Bildirim>
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
                <dl>
                  <Satir etiket="Kahvaltı">{menu.kahvalti}</Satir>
                  <Satir etiket="Öğle">{menu.ogle}</Satir>
                  <Satir etiket="Ara öğün">{menu.ara_ogun}</Satir>
                </dl>
              ) : (
                <p className="text-sm text-panel-soluk">Menü girilmemiş.</p>
              )}
            </Kutu>
          );
        })}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-panel-silik">
        Ara öğün yalnızca Okula Hazırlık Gruplarında verilir (müşteri düzeltmesi, 17 Ağustos 2026).
        Cumartesi programı ayrıdır, pazar grup programı yoktur.
      </p>
    </Kabuk>
  );
}
