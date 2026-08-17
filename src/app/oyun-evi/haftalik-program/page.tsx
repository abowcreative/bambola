import { MARKA } from "@/lib/site";
import { PROGRAM_NOTLARI } from "@/lib/data/program";
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
import { Ikon } from "@/components/ui/ikon";

export const metadata = sayfaMetadata({
  baslik: "Haftalık Program ve Saatler",
  aciklama: `${MARKA.ad} oyun evi haftalık programı. Hangi gün hangi saatte hangi yaş grubu var, öğretmeni kim. ${MARKA.ilce}, ${MARKA.sehir}.`,
  yol: "/oyun-evi/haftalik-program",
});

const KIRINTI = [
  { ad: "Ana sayfa", yol: "/" },
  { ad: "Oyun evi", yol: "/oyun-evi" },
  { ad: "Haftalık program", yol: "/oyun-evi/haftalik-program" },
];

export default function HaftalikProgramSayfasi() {
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
