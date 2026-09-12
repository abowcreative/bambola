import { MARKA } from "@/lib/site";
import { PROGRAM_NOTLARI } from "@/lib/data/program";
import {
  yaklasanEtkinlikler,
  etkinlikGunu,
  etkinlikSaati,
} from "@/lib/data/etkinlikler";
import { DIL_ETIKET } from "@/lib/data/types";
import {
  sayfaMetadata,
  ekmekKirintisiSemasi,
  kurumSemasi,
  SemaEtiketi,
} from "@/lib/seo";
import { HaftalikTakvim } from "@/components/takvim/haftalik-takvim";
import { EkmekKirintisi, SayfaBasligi } from "@/components/site/bolum-basligi";
import { SonCagri } from "@/components/site/son-cagri";
import { Belir } from "@/components/site/bolum";
import { DinamikIkon, Ikon } from "@/components/ui/ikon";
import Link from "next/link";

export const metadata = sayfaMetadata({
  baslik: "Haftalık Program ve Saatler",
  aciklama: `${MARKA.ad} oyun evi haftalık programı. Hangi gün hangi saatte hangi yaş grubu var, öğretmeni kim. ${MARKA.ilce}, ${MARKA.sehir}.`,
  yol: "/oyun-evi/haftalik-program",
});

/*
  Tarihli etkinlikler gune bagli suzuluyor (bkz. data/etkinlikler.ts), o
  yuzden sayfa sinirsiz onbellekte tutulamaz: gecmis bir etkinlik "yaklasan"
  diye asili kalirdi.
*/
export const revalidate = 3600;

const KIRINTI = [
  { ad: "Ana sayfa", yol: "/" },
  { ad: "Oyun evi", yol: "/oyun-evi" },
  { ad: "Haftalık program", yol: "/oyun-evi/haftalik-program" },
];

export default function HaftalikProgramSayfasi() {
  const etkinlikler = yaklasanEtkinlikler();

  return (
    <>
      <SemaEtiketi sema={[ekmekKirintisiSemasi(KIRINTI), kurumSemasi()]} />
      <EkmekKirintisi ogeler={KIRINTI} />

      <SayfaBasligi
        ustBaslik="Haftalık program"
        baslik="Hangi gün, hangi saat"
        aciklama="Yaşa göre süzün, çocuğunuza uyan saatleri görün. Karta dokununca o programın sayfasına gidersiniz."
      />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <HaftalikTakvim />
      </section>

      {/*
        Haftalik tablonun disinda kalan, TARIHE bagli isler. Tabloya
        yazilsalardi her hafta tekrar ediyor gorunurlerdi.
      */}
      {etkinlikler.length > 0 && (
        <section className="border-t border-cizgi bg-krem">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <Belir>
              <h2 className="font-baslik text-2xl font-bold text-murekkep">
                Takvim dışı etkinlikler
              </h2>
              <p className="mt-2 text-murekkep-soluk">
                Haftalık programın parçası değil, tek seferlik. Kontenjan
                sınırlı, rezervasyonla katılınır.
              </p>

              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {etkinlikler.map((e) => (
                  <li
                    key={e.slug}
                    className="rounded-kart border-2 border-cizgi bg-white p-6"
                  >
                    <span className="grid size-11 place-items-center rounded-full bg-lime-rozet text-black">
                      <DinamikIkon ad={e.ikon} boyut={22} />
                    </span>
                    <h3 className="mt-4 font-baslik text-xl font-bold text-murekkep">
                      {e.ad}
                    </h3>
                    <p className="mt-1 font-baslik font-semibold text-yesil-koyu">
                      {etkinlikGunu(e)} · {etkinlikSaati(e)}
                    </p>
                    <p className="mt-2 leading-relaxed text-murekkep-soluk">
                      {e.ozet}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-krem-koyu px-3 py-1 text-sm font-medium text-murekkep-soluk">
                        {e.yasEtiket}
                      </span>
                      <span className="rounded-full bg-krem-koyu px-3 py-1 text-sm font-medium text-murekkep-soluk">
                        {DIL_ETIKET[e.dil]}
                      </span>
                    </div>
                    {e.atolyeSlug && (
                      <Link
                        href={`/oyun-evi/programlar/${e.atolyeSlug}`}
                        className="mt-4 inline-flex items-center gap-1.5 font-baslik font-semibold text-yesil-koyu hover:underline"
                      >
                        Atölyenin sayfası
                        <Ikon.Ok boyut={16} />
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </Belir>
          </div>
        </section>
      )}

      <section className="border-t border-cizgi bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <Belir>
            <h2 className="font-baslik text-2xl font-bold text-murekkep">
              Programın kuralları
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {PROGRAM_NOTLARI.map((n) => (
                <li
                  key={n}
                  className="flex gap-3 rounded-yumusak bg-krem p-4 leading-relaxed text-murekkep"
                >
                  <Ikon.Tik boyut={19} className="mt-0.5 shrink-0 text-yesil" />
                  {n}
                </li>
              ))}
            </ul>
          </Belir>
        </div>
      </section>

      <div className="pt-16">
        <SonCagri
          baslik="Uyan bir saat gördünüz mü?"
          aciklama="WhatsApp'tan yazın, o gruptaki yerinizi birlikte netleştirelim. Uyan saat yoksa onu da söyleyin."
        />
      </div>
    </>
  );
}
