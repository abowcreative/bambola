import Link from "next/link";
import { adminZorunlu } from "@/lib/kampus/oturum";
import { cariListesi } from "@/lib/kampus/yoklama";
import { Kabuk, SayfaBasi, Kutu } from "@/components/kampus/kabuk";
import {
  BosDurum,
  Rozet,
  Sayac,
  TabloSarmal,
  Th,
  Td,
  Tr,
} from "@/components/kampus/ui";
import { ogrenciAdi } from "@/lib/kampus/ogrenci-tipleri";
import { tlYaz } from "@/lib/data/ucretler";
import { Ikon } from "@/components/ui/ikon";

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
  const gecikmisSayisi = liste.filter((c) => c.gecikmis).length;

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/cari">
      <SayfaBasi
        baslik="Cari hesap"
        aciklama="Öğrenci bazında borç, tahsilat ve bakiye."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Sayac etiket="Tahakkuk" deger={tlYaz(toplamBorc)} />
        <Sayac
          etiket="Tahsilat"
          deger={tlYaz(toplamTahsilat)}
          ton="basari"
          alt={
            toplamBorc > 0
              ? `tahakkukun %${Math.round((toplamTahsilat / toplamBorc) * 100)}'i`
              : undefined
          }
        />
        <Sayac
          etiket="Açık bakiye"
          deger={tlYaz(acikBakiye)}
          ton={acikBakiye > 0 ? "uyari" : "notr"}
        />
        <Sayac
          etiket="Gecikmiş"
          deger={gecikmisSayisi}
          alt="öğrenci"
          ton={gecikmisSayisi > 0 ? "tehlike" : "notr"}
        />
      </div>

      {hareketliler.length === 0 ? (
        <div className="mt-4">
          <BosDurum
            baslik="Henüz cari hareket yok"
            ikon={<Ikon.Rozet boyut={22} />}
            aciklama="Öğrenci sayfasından borç veya tahsilat kaydı ekleyerek başlayabilirsiniz."
          />
        </div>
      ) : (
        <Kutu className="mt-4" dolgusuz>
          <TabloSarmal enAz="36rem">
            <thead>
              <tr>
                <Th>Öğrenci</Th>
                <Th sag>Tahakkuk</Th>
                <Th sag>Tahsilat</Th>
                <Th sag>Bakiye</Th>
              </tr>
            </thead>
            <tbody>
              {hareketliler.map((c) => (
                <Tr key={c.ogrenci.id}>
                  <Td>
                    <Link
                      href={`/kampus/ogrenciler/${c.ogrenci.id}`}
                      className="font-semibold text-murekkep hover:text-yesil-derin hover:underline"
                    >
                      {ogrenciAdi(c.ogrenci)}
                    </Link>
                    {c.gecikmis && (
                      <span className="ml-2 align-middle">
                        <Rozet ton="tehlike" ikon={<Ikon.Saat boyut={11} />}>
                          Gecikmiş
                        </Rozet>
                      </span>
                    )}
                  </Td>
                  <Td sayi className="text-panel-soluk">
                    {tlYaz(c.borc)}
                  </Td>
                  <Td sayi className="text-panel-soluk">
                    {tlYaz(c.tahsilat)}
                  </Td>
                  <Td
                    sayi
                    className={`font-baslik font-bold ${
                      c.bakiye > 0
                        ? c.gecikmis
                          ? "text-tehlike"
                          : "text-uyari"
                        : c.bakiye < 0
                          ? "text-basari"
                          : "text-panel-silik"
                    }`}
                  >
                    {tlYaz(c.bakiye)}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TabloSarmal>
        </Kutu>
      )}

      <p className="mt-3 text-xs leading-relaxed text-panel-silik">
        Bakiye = tahakkuk eden borç eksi tahsilat. Pozitif bakiye borçlu,
        negatif bakiye fazla ödeme demektir. Tutarlar tam TL olarak tutulur.
      </p>
    </Kabuk>
  );
}
