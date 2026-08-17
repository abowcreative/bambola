import Link from "next/link";
import { adminZorunlu } from "@/lib/kampus/oturum";
import { cariListesi } from "@/lib/kampus/yoklama";
import {
  Kabuk,
  SayfaBasi,
  Kutu,
  Sayac,
  BosDurum,
} from "@/components/kampus/kabuk";
import { ogrenciAdi } from "@/lib/kampus/ogrenci-tipleri";
import { tlYaz } from "@/lib/data/ucretler";

export const metadata = { title: "Cari hesap", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * Ogrenci bazinda borc, tahsilat ve bakiye.
 *
 * Ogretmen bu sayfayi HIC gormuyor: menude yok ve RLS odemeler tablosunu
 * ona hic acmiyor.
 */
export default async function CariSayfasi() {
  const oturum = await adminZorunlu();
  const liste = await cariListesi();

  const hareketliler = liste.filter((c) => c.borc > 0 || c.tahsilat > 0);
  const toplamBorc = liste.reduce((t, c) => t + c.borc, 0);
  const toplamTahsilat = liste.reduce((t, c) => t + c.tahsilat, 0);
  const acikBakiye = liste.reduce((t, c) => t + Math.max(0, c.bakiye), 0);

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/cari">
      <SayfaBasi
        baslik="Cari hesap"
        aciklama="Öğrenci bazında borç, tahsilat ve bakiye."
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <Sayac etiket="Tahakkuk" deger={tlYaz(toplamBorc)} />
        <Sayac etiket="Tahsilat" deger={tlYaz(toplamTahsilat)} />
        <Sayac
          etiket="Açık bakiye"
          deger={tlYaz(acikBakiye)}
          vurgu={acikBakiye > 0}
        />
        <Sayac
          etiket="Gecikmiş"
          deger={liste.filter((c) => c.gecikmis).length}
          alt="öğrenci"
          vurgu={liste.some((c) => c.gecikmis)}
        />
      </div>

      {hareketliler.length === 0 ? (
        <div className="mt-6">
          <BosDurum
            baslik="Henüz cari hareket yok"
            aciklama="Öğrenci sayfasından borç veya tahsilat kaydı ekleyerek başlayabilirsiniz."
          />
        </div>
      ) : (
        <Kutu className="mt-6">
          <div className="-mx-5 overflow-x-auto px-5">
            <table className="w-full min-w-[34rem] text-sm">
              <thead>
                <tr className="border-b-2 border-cizgi text-left">
                  <th className="pb-2 font-baslik text-xs uppercase tracking-wide text-murekkep-soluk">
                    Öğrenci
                  </th>
                  <th className="pb-2 text-right font-baslik text-xs uppercase tracking-wide text-murekkep-soluk">
                    Tahakkuk
                  </th>
                  <th className="pb-2 text-right font-baslik text-xs uppercase tracking-wide text-murekkep-soluk">
                    Tahsilat
                  </th>
                  <th className="pb-2 text-right font-baslik text-xs uppercase tracking-wide text-murekkep-soluk">
                    Bakiye
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cizgi">
                {hareketliler.map((c) => (
                  <tr key={c.ogrenci.id}>
                    <td className="py-2.5">
                      <Link
                        href={`/kampus/ogrenciler/${c.ogrenci.id}`}
                        className="font-medium text-murekkep hover:underline"
                      >
                        {ogrenciAdi(c.ogrenci)}
                      </Link>
                      {c.gecikmis && (
                        <span className="ml-2 rounded-full bg-yesil-koyu px-2 py-0.5 text-xs font-bold text-white">
                          Gecikmiş
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-murekkep-soluk">
                      {tlYaz(c.borc)}
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-murekkep-soluk">
                      {tlYaz(c.tahsilat)}
                    </td>
                    <td
                      className={`py-2.5 text-right font-baslik font-bold tabular-nums ${
                        c.bakiye > 0
                          ? "text-murekkep"
                          : c.bakiye < 0
                            ? "text-yesil-koyu"
                            : "text-murekkep-soluk"
                      }`}
                    >
                      {tlYaz(c.bakiye)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Kutu>
      )}

      <p className="mt-4 text-xs leading-relaxed text-murekkep-soluk">
        Bakiye = tahakkuk eden borç eksi tahsilat. Pozitif bakiye borçlu,
        negatif bakiye fazla ödeme demektir. Tutarlar tam TL olarak tutulur.
      </p>
    </Kabuk>
  );
}
