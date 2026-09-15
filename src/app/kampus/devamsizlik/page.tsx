import Link from "next/link";
import { rolZorunlu } from "@/lib/kampus/oturum";
import { devamsizlikCizelgesi } from "@/lib/kampus/defter";
import { Kabuk, SayfaBasi, Kutu } from "@/components/kampus/kabuk";
import { Bildirim, BosDurum, TabloSarmal, Th, Td, Tr } from "@/components/kampus/ui";
import { Ikon } from "@/components/ui/ikon";

export const metadata = { title: "Devamsızlık çizelgesi", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * Excel "DEVAMSIZLIK CIZELGESI": cocuk x ay tablosu, oldugu gibi.
 * Canli devam takibi Yoklama modulunde; bu sayfa Excel'in tasidigi
 * isaretleri gosteriyor.
 */
export default async function DevamsizlikSayfasi() {
  const oturum = await rolZorunlu("admin", "ogretmen");
  const satirlar = await devamsizlikCizelgesi();
  const sutunlar = satirlar[0]?.sutunlar.map((s) => s.baslik) ?? [];
  const isaretli = satirlar.filter((s) => s.sutunlar.some((x) => x.deger.trim())).length;

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/devamsizlik">
      <SayfaBasi
        baslik="Devamsızlık çizelgesi"
        aciklama="Excel'deki çizelge: hangi çocuk hangi ayda işaretlenmiş."
      />

      <Bildirim ton="bilgi" ikon={<Ikon.Tik boyut={16} />} className="mb-4">
        Seans seans devam takibi{" "}
        <Link href="/kampus/yoklama" className="font-semibold text-yesil-derin hover:underline">
          Yoklama
        </Link>{" "}
        bölümünde. Burası Excel&apos;den gelen {satirlar.length} çocuk ve {sutunlar.length} ay sütunu;
        {isaretli} satırda işaret var.
      </Bildirim>

      {satirlar.length === 0 ? (
        <BosDurum baslik="Çizelge boş" aciklama="Excel aktarımı yapılmamış." />
      ) : (
        <Kutu dolgusuz>
          <TabloSarmal enAz="36rem">
            <thead>
              <tr>
                <Th>Çocuk</Th>
                {sutunlar.map((b) => (
                  <Th key={b} sag>
                    {b}
                  </Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {satirlar.map((s) => (
                <Tr key={s.id}>
                  <Td className="whitespace-nowrap">
                    {s.ogrenci_id ? (
                      <Link href={`/kampus/ogrenciler/${s.ogrenci_id}`} className="font-semibold text-murekkep hover:text-yesil-derin hover:underline">
                        {s.cocuk_adi}
                      </Link>
                    ) : (
                      <span className="font-semibold text-murekkep">{s.cocuk_adi}</span>
                    )}
                  </Td>
                  {s.sutunlar.map((x) => (
                    <Td key={x.baslik} sag className={x.deger.trim() ? "font-bold text-tehlike" : "text-panel-silik"}>
                      {x.deger.trim() || "·"}
                    </Td>
                  ))}
                </Tr>
              ))}
            </tbody>
          </TabloSarmal>
        </Kutu>
      )}
    </Kabuk>
  );
}
