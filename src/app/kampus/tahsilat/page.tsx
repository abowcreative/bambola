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
import { Ikon } from "@/components/ui/ikon";

export const metadata = { title: "Tahsilat takibi", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * Kimden ne kadar alinacak.
 *
 * Cari sayfasindan farki: burada YALNIZ acik bakiyesi olanlar var ve
 * gecikmisler ustte. Cari tam tabloyu gosteriyor, bu sayfa yapilacak isi.
 */
export default async function TahsilatSayfasi() {
  const oturum = await adminZorunlu();
  const liste = await cariListesi();

  const borclular = liste
    .filter((c) => c.bakiye > 0)
    // Gecikmisler once, sonra tutari buyuk olan.
    .sort((a, b) =>
      a.gecikmis === b.gecikmis ? b.bakiye - a.bakiye : a.gecikmis ? -1 : 1,
    );

  const gecikmisTutar = borclular
    .filter((c) => c.gecikmis)
    .reduce((t, c) => t + c.bakiye, 0);
  const toplam = borclular.reduce((t, c) => t + c.bakiye, 0);

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/tahsilat">
      <SayfaBasi
        baslik="Tahsilat takibi"
        aciklama="Açık bakiyesi olan öğrenciler. Gecikmişler üstte."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Sayac etiket="Tahsil edilecek" deger={tlYaz(toplam)} />
        <Sayac
          etiket="Vadesi geçmiş"
          deger={tlYaz(gecikmisTutar)}
          vurgu={gecikmisTutar > 0}
        />
        <Sayac etiket="Borçlu öğrenci" deger={borclular.length} />
      </div>

      {borclular.length === 0 ? (
        <div className="mt-6">
          <BosDurum
            baslik="Açık bakiye yok"
            aciklama="Tahsil edilecek borç bulunmuyor."
          />
        </div>
      ) : (
        <Kutu className="mt-6">
          <ul className="divide-y divide-cizgi">
            {borclular.map((c) => (
              <li
                key={c.ogrenci.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3"
              >
                <span className="min-w-0 flex-1">
                  <Link
                    href={`/kampus/ogrenciler/${c.ogrenci.id}`}
                    className="block font-baslik text-sm font-bold text-murekkep hover:underline"
                  >
                    {ogrenciAdi(c.ogrenci)}
                  </Link>
                  <span className="mt-0.5 block text-xs text-murekkep-soluk">
                    {tlYaz(c.borc)} tahakkuk · {tlYaz(c.tahsilat)} tahsilat
                  </span>
                </span>

                {c.gecikmis && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-yesil-koyu px-2.5 py-0.5 text-xs font-bold text-white">
                    <Ikon.Saat boyut={12} />
                    Vadesi geçti
                  </span>
                )}

                <span className="shrink-0 font-baslik text-base font-bold tabular-nums text-murekkep">
                  {tlYaz(c.bakiye)}
                </span>
              </li>
            ))}
          </ul>
        </Kutu>
      )}

      <p className="mt-4 text-xs leading-relaxed text-murekkep-soluk">
        Tahsilat kaydı öğrenci sayfasından giriliyor. Vadesi geçmiş işareti,
        vadesi dolmuş borcu olup bakiyesi kapanmamış öğrenciler için çıkar.
      </p>
    </Kabuk>
  );
}
