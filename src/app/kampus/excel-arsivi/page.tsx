import Link from "next/link";
import { adminZorunlu } from "@/lib/kampus/oturum";
import { excelSayfalariGetir } from "@/lib/kampus/defter";
import { Kabuk, SayfaBasi, Kutu } from "@/components/kampus/kabuk";
import { Bildirim, BosDurum, Rozet, TabloSarmal, Th, Td, Tr } from "@/components/kampus/ui";
import { Ikon } from "@/components/ui/ikon";

export const metadata = { title: "Excel arşivi", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * Excel arsivi: aktarilan dosyanin sayfalari. Her sayfa hucre hucre
 * saklaniyor; yapilandirilmis tablolarda bir sey eksik ya da yanlis
 * yorumlanmis gorunurse kaynak burada.
 */
export default async function ExcelArsiviSayfasi() {
  const oturum = await adminZorunlu();
  const sayfalar = await excelSayfalariGetir();
  const dosya = sayfalar[0]?.dosya;
  const tarih = sayfalar[0]?.ice_aktarim;

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/excel-arsivi">
      <SayfaBasi
        baslik="Excel arşivi"
        aciklama={dosya ? `${dosya} · ${tarih ? new Date(tarih).toLocaleString("tr-TR") : ""} tarihinde aktarıldı.` : "Aktarılan Excel dosyalarının ham kopyası."}
      />

      <Bildirim ton="notr" ikon={<Ikon.Not boyut={16} />} className="mb-4">
        Sayfalar salt okunur. Değişiklik panelin kendi bölümlerinde yapılır
        (Öğrenciler, Ödeme defteri, Giderler, Doğum günleri); burası
        “Excel&apos;de tam olarak ne yazıyordu” sorusunun cevabı.
      </Bildirim>

      {sayfalar.length === 0 ? (
        <BosDurum baslik="Arşiv boş" aciklama="npm run excel:ice-aktar çalıştırılmamış." />
      ) : (
        <Kutu dolgusuz>
          <TabloSarmal enAz="32rem">
            <thead>
              <tr>
                <Th>#</Th>
                <Th>Sayfa</Th>
                <Th>Boyut</Th>
                <Th sag>Sütun</Th>
                <Th sag>Hücre</Th>
                <Th sag> </Th>
              </tr>
            </thead>
            <tbody>
              {sayfalar.map((s) => (
                <Tr key={s.id}>
                  <Td sayi className="text-panel-silik">{s.sira}</Td>
                  <Td>
                    <Link href={`/kampus/excel-arsivi/${s.sira}`} className="font-semibold text-murekkep hover:text-yesil-derin hover:underline">
                      {s.sayfa_adi}
                    </Link>
                    {s.gizli && (
                      <span className="ml-2 align-middle">
                        <Rozet ton="sessiz">Excel&apos;de gizli</Rozet>
                      </span>
                    )}
                  </Td>
                  <Td className="text-panel-soluk">{s.boyut ?? "—"}</Td>
                  <Td sayi className="text-panel-soluk">{s.sutun_sayisi}</Td>
                  <Td sayi className="text-panel-soluk">{s.hucre_sayisi}</Td>
                  <Td sag>
                    <Link href={`/kampus/excel-arsivi/${s.sira}`} className="text-sm font-semibold text-yesil-derin hover:underline">
                      Aç
                    </Link>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TabloSarmal>
        </Kutu>
      )}
    </Kabuk>
  );
}
