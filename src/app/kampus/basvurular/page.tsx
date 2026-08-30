import Link from "next/link";
import { adminZorunlu } from "@/lib/kampus/oturum";
import {
  basvurulariGetir,
  basvuruSayilari,
  type BasvuruSuzgeci,
} from "@/lib/kampus/basvurular";
import { Kabuk, SayfaBasi } from "@/components/kampus/kabuk";
import { BosDurum } from "@/components/kampus/ui";
import { BasvuruSatiri } from "@/components/kampus/basvuru-satiri";
import { SuzgecSeridi } from "@/components/kampus/suzgec-seridi";
import type { BasvuruDurumu } from "@/lib/supabase/types";

export const metadata = {
  title: "Başvurular",
  robots: { index: false, follow: false },
};

/* Panel her zaman taze veri gostermeli: onbellege alinmis basvuru listesi
   "yeni talep yok" der ve talep bekler. */
export const dynamic = "force-dynamic";

export default async function BasvurularSayfasi({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const oturum = await adminZorunlu();
  const p = await searchParams;

  const tek = (a: string | string[] | undefined) =>
    Array.isArray(a) ? a[0] : a;

  const suzgec: BasvuruSuzgeci = {
    durum: (tek(p.durum) as BasvuruDurumu | "hepsi") ?? "yeni",
    kurum: tek(p.kurum) ?? "hepsi",
    ara: tek(p.ara) ?? "",
  };

  const [basvurular, sayilar] = await Promise.all([
    basvurulariGetir(suzgec),
    basvuruSayilari(),
  ]);

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/basvurular">
      <SayfaBasi
        baslik="Başvurular"
        aciklama="Web sitesindeki kayıt formundan gelen talepler."
      />

      <SuzgecSeridi
        durum={suzgec.durum ?? "yeni"}
        kurum={suzgec.kurum ?? "hepsi"}
        ara={suzgec.ara ?? ""}
        sayilar={sayilar}
      />

      {basvurular.length === 0 ? (
        <div className="mt-4">
          <BosDurum
            baslik="Bu filtrede başvuru yok"
            aciklama={
              suzgec.ara
                ? `"${suzgec.ara}" aramasıyla eşleşen kayıt bulunamadı.`
                : "Durum filtresini değiştirerek diğer başvurulara bakabilirsiniz."
            }
          />
        </div>
      ) : (
        <>
          <p className="mt-4 text-xs text-panel-silik">
            {basvurular.length} kayıt
            {basvurular.length === 500 && " (ilk 500 gösteriliyor)"}
          </p>

          <ul className="mt-2 space-y-2.5">
            {basvurular.map((b) => (
              <li key={b.id}>
                <Link href={`/kampus/basvurular/${b.id}`} className="block">
                  <BasvuruSatiri basvuru={b} />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </Kabuk>
  );
}
