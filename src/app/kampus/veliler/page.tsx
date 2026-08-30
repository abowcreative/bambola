import Link from "next/link";
import { adminZorunlu } from "@/lib/kampus/oturum";
import { velileriGetir } from "@/lib/kampus/ogrenciler";
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
import { AramaKutusu } from "@/components/kampus/ui-istemci";
import { VeliFormu } from "@/components/kampus/veli-formu";
import { telefonYaz } from "@/components/kampus/basvuru-satiri";
import { Ikon } from "@/components/ui/ikon";

export const metadata = { title: "Veliler", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function VelilerSayfasi({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const oturum = await adminZorunlu();
  const p = await searchParams;
  const ara = Array.isArray(p.ara) ? p.ara[0] : (p.ara ?? "");

  const [liste, hepsi] = await Promise.all([
    velileriGetir(ara),
    velileriGetir(),
  ]);

  const hesapli = hepsi.filter((v) => v.profil_id).length;
  const cocuksuz = hepsi.filter((v) => v.cocukSayisi === 0).length;

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/veliler">
      <SayfaBasi
        baslik="Veliler"
        aciklama="Veli kayıtları ve çocuk bağlantıları."
        cocuklar={<VeliFormu gorunum="birincil" />}
      />

      {hepsi.length === 0 ? (
        <BosDurum
          baslik="Henüz veli kaydı yok"
          ikon={<Ikon.Grup boyut={22} />}
          aciklama="Bir başvuruyu öğrenciye dönüştürdüğünüzde veli kaydı da otomatik oluşur; yukarıdan elle de ekleyebilirsiniz."
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Sayac etiket="Veli" deger={hepsi.length} />
            <Sayac
              etiket="Panel hesabı olan"
              deger={hesapli}
              alt={`${hepsi.length - hesapli} hesapsız`}
            />
            <Sayac
              etiket="Toplam çocuk bağlantısı"
              deger={hepsi.reduce((t, v) => t + v.cocukSayisi, 0)}
              alt={cocuksuz > 0 ? `${cocuksuz} veli çocuksuz` : undefined}
              ton={cocuksuz > 0 ? "uyari" : "notr"}
            />
          </div>

          <div className="mt-4 max-w-xs">
            <AramaKutusu
              yol="/kampus/veliler"
              deger={ara}
              yerTutucu="Ad veya telefon"
              etiket="Velilerde ara"
            />
          </div>

          {liste.length === 0 ? (
            <div className="mt-4">
              <BosDurum
                baslik="Eşleşme yok"
                aciklama={`"${ara}" aramasıyla veli bulunamadı.`}
              />
            </div>
          ) : (
            <Kutu className="mt-4" dolgusuz>
              <TabloSarmal enAz="38rem">
                <thead>
                  <tr>
                    <Th>Veli</Th>
                    <Th>Telefon</Th>
                    <Th sag>Çocuk</Th>
                    <Th sag>Panel hesabı</Th>
                  </tr>
                </thead>
                <tbody>
                  {liste.map((v) => (
                    <Tr key={v.id}>
                      <Td>
                        <Link
                          href={`/kampus/veliler/${v.id}`}
                          className="font-semibold text-murekkep hover:text-yesil-derin hover:underline"
                        >
                          {v.ad_soyad}
                        </Link>
                        {v.eposta && (
                          <span className="mt-0.5 block truncate text-xs text-panel-silik">
                            {v.eposta}
                          </span>
                        )}
                      </Td>
                      <Td>
                        <a
                          href={`tel:0${v.telefon}`}
                          className="font-medium text-yesil-derin hover:underline"
                        >
                          {telefonYaz(v.telefon)}
                        </a>
                      </Td>
                      <Td sayi className="text-panel-soluk">
                        {v.cocukSayisi}
                      </Td>
                      <Td sag>
                        {v.profil_id ? (
                          <Rozet ton="basari">Var</Rozet>
                        ) : (
                          <Rozet ton="sessiz">Yok</Rozet>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </TabloSarmal>
            </Kutu>
          )}
        </>
      )}

      <p className="mt-3 text-xs leading-relaxed text-panel-silik">
        Veli panele girecekse önce Kullanıcılar bölümünden hesabı açılır,
        sonra veli kartından o hesaba bağlanır. Bağlantı olmadan veli kendi
        çocuğunu göremez.
      </p>
    </Kabuk>
  );
}
