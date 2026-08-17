import { adminZorunlu } from "@/lib/kampus/oturum";
import { velileriGetir } from "@/lib/kampus/ogrenciler";
import {
  Kabuk,
  SayfaBasi,
  Kutu,
  Sayac,
  BosDurum,
} from "@/components/kampus/kabuk";
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

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/veliler">
      <SayfaBasi
        baslik="Veliler"
        aciklama="Veli kayıtları ve çocuk bağlantıları."
      />

      {hepsi.length === 0 ? (
        <BosDurum
          baslik="Henüz veli kaydı yok"
          aciklama="Bir başvuruyu öğrenciye dönüştürdüğünüzde veli kaydı da otomatik oluşur."
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
            />
          </div>

          <form className="mt-5 max-w-xs" role="search">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-murekkep-soluk">
                <Ikon.Mercek boyut={17} />
              </span>
              <input
                type="search"
                name="ara"
                defaultValue={ara}
                placeholder="Ad veya telefon"
                aria-label="Velilerde ara"
                className="w-full rounded-full border-2 border-cizgi bg-white py-2 pl-10 pr-4 text-sm text-murekkep outline-none focus:border-yesil"
              />
            </div>
          </form>

          {liste.length === 0 ? (
            <div className="mt-5">
              <BosDurum
                baslik="Eşleşme yok"
                aciklama={`"${ara}" aramasıyla veli bulunamadı.`}
              />
            </div>
          ) : (
            <Kutu className="mt-5">
              <ul className="divide-y divide-cizgi">
                {liste.map((v) => (
                  <li
                    key={v.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-baslik text-sm font-bold text-murekkep">
                        {v.ad_soyad}
                      </span>
                      <span className="mt-0.5 block text-xs text-murekkep-soluk">
                        {v.cocukSayisi} çocuk
                        {v.eposta && ` · ${v.eposta}`}
                      </span>
                    </span>

                    {v.profil_id ? (
                      <span className="shrink-0 rounded-full bg-lime-rozet px-2.5 py-0.5 text-xs font-bold text-black">
                        Panel hesabı var
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs text-murekkep-soluk">
                        hesap yok
                      </span>
                    )}

                    <a
                      href={`tel:0${v.telefon}`}
                      className="shrink-0 font-medium text-yesil-koyu hover:underline"
                    >
                      {telefonYaz(v.telefon)}
                    </a>
                  </li>
                ))}
              </ul>
            </Kutu>
          )}
        </>
      )}

      <p className="mt-4 text-xs leading-relaxed text-murekkep-soluk">
        Veli panele girecekse hesabı `npm run kampus:kullanici` ile açılır ve
        veli kaydına bağlanır. Bağlantı olmadan veli kendi çocuğunu göremez.
      </p>
    </Kabuk>
  );
}
