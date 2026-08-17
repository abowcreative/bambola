import { notFound } from "next/navigation";
import { oturumZorunlu } from "@/lib/kampus/oturum";
import { modulBul } from "@/lib/kampus/moduller";
import { Kabuk } from "@/components/kampus/kabuk";
import { Hazirlaniyor } from "@/components/kampus/hazirlaniyor";

/**
 * Henuz yazilmamis moduller icin ortak rota.
 *
 * Neden tek dosya: on iki modul icin on iki bos sayfa yazmak, hangisinin
 * gercekten calistigini goremez hale getirirdi. Burasi `moduller.ts`
 * listesine bakiyor; bir modulun kendi sayfasi olusturuldugu anda Next o
 * ozel rotayi kullaniyor ve burasi devreden cikiyor.
 *
 * Listede olmayan bir slug 404 doner: /kampus/rastgele adresini
 * "hazirlaniyor" diye karsilamak yanlis olurdu.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ modul: string }>;
}) {
  const { modul } = await params;
  return {
    title: modulBul(modul)?.ad ?? "Kampüs",
    robots: { index: false, follow: false },
  };
}

export default async function ModulSayfasi({
  params,
}: {
  params: Promise<{ modul: string }>;
}) {
  const oturum = await oturumZorunlu();
  const { modul: slug } = await params;

  const modul = modulBul(slug);
  if (!modul) notFound();

  // Menude gormedigi bir modulu adres cubugundan acmasin.
  if (!modul.roller.includes(oturum.rol)) notFound();

  return (
    <Kabuk oturum={oturum} aktifYol={modul.yol}>
      <Hazirlaniyor
        modul={modul}
        suAn={
          modul.slug === "ogrenciler" || modul.slug === "veliler" ? (
            <>
              Kayıt olan çocuklar şimdilik <strong>Başvurular</strong>{" "}
              bölümünde &quot;Kayıt oldu&quot; durumuyla işaretleniyor.
            </>
          ) : modul.slug === "leadler" ? (
            <>
              Instagram ve telefonla gelen talepler elle takip ediliyor. Web
              formundan gelenler <strong>Başvurular</strong> bölümünde.
            </>
          ) : modul.slug === "cari" || modul.slug === "tahsilat" ? (
            <>
              Başvuru kayıtlarında paket ve ücret bilgisi duruyor; tahsilat
              takibi henüz sistemde değil.
            </>
          ) : undefined
        }
      />
    </Kabuk>
  );
}
