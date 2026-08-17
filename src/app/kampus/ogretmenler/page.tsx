import Image from "next/image";
import Link from "next/link";
import { adminZorunlu } from "@/lib/kampus/oturum";
import { siniflariGetir } from "@/lib/kampus/ogrenciler";
import { Kabuk, SayfaBasi, Kutu, Sayac } from "@/components/kampus/kabuk";
import { EKIP, ogretmenAdi, atolyeOgretmenleri } from "@/lib/data/ekip";
import { SLOTLAR } from "@/lib/data/program";
import { ATOLYELER, atolyeBul } from "@/lib/data/atolyeler";
import { GUN_ADI } from "@/lib/data/types";

export const metadata = { title: "Öğretmenler", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * Kadro ve haftalik yuk.
 *
 * Kimin hangi programi verdigi ELLE TUTULMUYOR, haftalik programdan
 * cikariliyor (bkz. lib/data/ekip.ts). Program degistiginde burasi
 * kendiliginden dogru kaliyor.
 */
export default async function OgretmenlerSayfasi() {
  const oturum = await adminZorunlu();

  /*
    Program verisi (kim neyi verir) STATIK, sinif atamalari VERITABANINDA.
    Ikisi ayri: program yil boyu ayni, atama degisebilir. Burada yan yana
    gosteriliyor ki "Excel'de var ama sinifi atanmamis" durumu gorunsun.
  */
  const siniflar = await siniflariGetir("2026-2027");

  const kadro = EKIP.map((o) => {
    const slotlar = SLOTLAR.filter((s) => s.ogretmenler.includes(o.ad));
    const atolyeler = ATOLYELER.filter((a) =>
      atolyeOgretmenleri(a.slug).some((x) => x.ad === o.ad),
    );
    const gunler = [...new Set(slotlar.map((s) => s.gun))];
    const atanan = siniflar.filter((s) => s.ogretmen_ad === o.ad && s.aktif);
    /*
      Bir seansta iki ogretmen olabiliyor ama sinifin SORUMLUSU bir kisi:
      `siniflar.ogretmen_ad` tek deger. Seans sayisi ile atanmis sinif
      sayisi bu yuzden ayrisiyor; fark aciklanmadan birakilirsa hata gibi
      okunur.
    */
    const ikinciligi = slotlar.filter((s) => s.ogretmenler[0] !== o.ad).length;
    return { ogretmen: o, slotlar, atolyeler, gunler, atanan, ikinciligi };
  });

  const atanmamis = siniflar.filter((s) => s.aktif && !s.ogretmen_ad).length;

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/ogretmenler">
      <SayfaBasi
        baslik="Öğretmenler"
        aciklama="Kadro, haftalık yük ve verdikleri programlar."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Sayac etiket="Öğretmen" deger={EKIP.length} />
        <Sayac etiket="Haftalık seans" deger={SLOTLAR.length} />
        <Sayac
          etiket="Ortalama yük"
          deger={Math.round(
            kadro.reduce((t, k) => t + k.slotlar.length, 0) / kadro.length,
          )}
          alt="seans / öğretmen"
        />
      </div>

      <div className="mt-6 space-y-4">
        {kadro.map(({
          ogretmen,
          slotlar,
          atolyeler,
          gunler,
          atanan,
          ikinciligi,
        }) => (
          <Kutu key={ogretmen.ad}>
            <div className="flex flex-wrap gap-5">
              {ogretmen.fotograf && (
                <Image
                  src={`/ekip/${ogretmen.fotograf}.jpg`}
                  alt={ogretmenAdi(ogretmen)}
                  width={160}
                  height={160}
                  sizes="80px"
                  className="size-20 shrink-0 rounded-full bg-krem-koyu object-cover"
                />
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-baslik text-lg font-bold text-murekkep">
                    {ogretmenAdi(ogretmen)}
                  </h2>
                  {ogretmen.gorev && (
                    <span className="rounded-full bg-yesil-koyu px-2.5 py-0.5 text-xs font-bold text-white">
                      {ogretmen.gorev}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm font-medium text-yesil-koyu">
                  {ogretmen.unvan}
                </p>
                {ogretmen.egitim && (
                  <p className="mt-1 text-sm text-murekkep-soluk">
                    {ogretmen.egitim}
                  </p>
                )}

                <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-murekkep-soluk">
                      Haftalık seans
                    </dt>
                    <dd className="font-baslik text-lg font-bold text-murekkep">
                      {slotlar.length}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-murekkep-soluk">
                      Çalıştığı gün
                    </dt>
                    <dd className="mt-0.5 font-medium text-murekkep">
                      {gunler.map((g) => GUN_ADI[g].slice(0, 3)).join(", ") ||
                        "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-murekkep-soluk">
                      Atanmış sınıf
                    </dt>
                    <dd className="mt-0.5 font-medium text-murekkep">
                      {atanan.length}
                      <span className="ml-1.5 text-murekkep-soluk">
                        · {atanan.reduce((t, s) => t + s.ogrenciSayisi, 0)} çocuk
                      </span>
                    </dd>
                  </div>
                </dl>

                {/* Atanan siniflar: buradan sinifa, sinifta ogrencilere. */}
                {atanan.length > 0 && (
                  <>
                    <p className="mt-4 text-xs uppercase tracking-wide text-murekkep-soluk">
                      Atanmış sınıflar
                    </p>
                    <ul className="mt-1.5 flex flex-wrap gap-1.5">
                      {atanan.map((s) => (
                        <li key={s.id}>
                          <Link
                            href={`/kampus/siniflar/${s.id}`}
                            className="inline-block rounded-full border-2 border-cizgi px-2.5 py-1 text-xs font-medium text-murekkep transition-colors hover:border-yesil"
                          >
                            {s.ad}
                            <span className="ml-1.5 text-murekkep-soluk">
                              {s.ogrenciSayisi}/{s.kontenjan}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {ikinciligi > 0 && (
                  <p className="mt-2 text-xs leading-relaxed text-murekkep-soluk">
                    {ikinciligi} seansta ikinci öğretmen olarak programda:
                    sınıfın sorumlusu tek kişi olduğu için o sınıflar burada
                    listelenmiyor.
                  </p>
                )}

                {atolyeler.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {atolyeler.map((a) => (
                      <li
                        key={a.slug}
                        className="rounded-full bg-krem-koyu px-2.5 py-1 text-xs font-medium text-murekkep"
                      >
                        {a.kisaAd}
                      </li>
                    ))}
                  </ul>
                )}

                {slotlar.length > 0 && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-semibold text-yesil-koyu">
                      Seans listesi
                    </summary>
                    <ul className="mt-2 space-y-1">
                      {slotlar.map((s) => (
                        <li
                          key={s.id}
                          className="flex flex-wrap gap-x-3 text-sm text-murekkep-soluk"
                        >
                          <span className="w-24 shrink-0 font-medium text-murekkep">
                            {GUN_ADI[s.gun]}
                          </span>
                          <span className="w-28 shrink-0 tabular-nums">
                            {s.bas} - {s.bit}
                          </span>
                          <span className="min-w-0">
                            {atolyeBul(s.atolyeSlug)?.kisaAd}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          </Kutu>
        ))}
      </div>

      {atanmamis > 0 && (
        <p className="mt-5 rounded-blok border-2 border-dashed border-cizgi bg-white px-4 py-3 text-sm text-murekkep">
          <strong>{atanmamis} aktif sınıfın öğretmeni atanmamış.</strong>{" "}
          <Link
            href="/kampus/siniflar"
            className="font-semibold text-yesil-koyu hover:underline"
          >
            Sınıflar
          </Link>{" "}
          sayfasından atayabilirsiniz. Yoklama, öğretmenin kendi sınıfını
          görmesi bu atamaya bağlı.
        </p>
      )}

      <p className="mt-4 text-xs leading-relaxed text-murekkep-soluk">
        Kimin hangi programı verdiği haftalık programdan çıkarılıyor, ayrı bir
        listede tutulmuyor. Sınıf ataması ise veritabanında: program aynı kalsa
        da atama değişebilir. Öğretmen hesabı açmak için Kullanıcılar bölümüne
        bakın.
      </p>
    </Kabuk>
  );
}
