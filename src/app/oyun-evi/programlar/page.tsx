import Link from "next/link";
import { MARKA } from "@/lib/site";
import { ATOLYELER } from "@/lib/data/atolyeler";
import { atolyeOgretmenleri } from "@/lib/data/ekip";
import { OgretmenRozetleri } from "@/components/site/ogretmen-rozetleri";
import { SLOTLAR } from "@/lib/data/program";
import { sayfaMetadata, ekmekKirintisiSemasi, SemaEtiketi } from "@/lib/seo";
import { EkmekKirintisi, SayfaBasligi } from "@/components/site/bolum-basligi";
import { Sirali, SiraliOge } from "@/components/site/bolum";
import { DinamikIkon, Ikon } from "@/components/ui/ikon";
import { SonCagri } from "@/components/site/son-cagri";
import { DIL_ETIKET } from "@/lib/data/types";

export const metadata = sayfaMetadata({
  baslik: "Oyun Grubu Programları ve Atölyeler",
  aciklama: `${MARKA.ad} oyun evindeki bütün programlar. Okula hazırlık, gelişim odaklı oyun, bebek grubu, İngilizce ve atölyeler. Yaş, gün ve saat bilgisiyle.`,
  yol: "/oyun-evi/programlar",
});

const KIRINTI = [
  { ad: "Ana sayfa", yol: "/" },
  { ad: "Oyun evi", yol: "/oyun-evi" },
  { ad: "Programlar", yol: "/oyun-evi/programlar" },
];

export default function ProgramlarSayfasi() {
  return (
    <>
      <SemaEtiketi sema={ekmekKirintisiSemasi(KIRINTI)} />
      <EkmekKirintisi ogeler={KIRINTI} />

      <SayfaBasligi
        ustBaslik="Programlar"
        baslik="Bütün programlar ve atölyeler"
        aciklama="Her birinin kendi sayfası var: hangi yaşa uygun, hangi gün ve saatte, kaç kişilik grup, ücreti ne."
      />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <Sirali className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ATOLYELER.map((a) => {
            const slotSayisi = SLOTLAR.filter(
              (s) => s.atolyeSlug === a.slug,
            ).length;

            return (
              <SiraliOge key={a.slug}>
                {/*
                  Kart <Link> degil: icindeki ogretmen rozetleri kendi
                  hedefine gidiyor ve baglanti icine baglanti konmaz.
                  Baslikta duran baglanti `after:inset-0` ile kartin tamamini
                  kapliyor. Bkz. ana sayfadaki ayni yapi.
                */}
                <div className="group relative flex h-full flex-col rounded-kart border-2 border-cizgi bg-white p-6 transition-all duration-200 ease-yayli hover:-translate-y-1.5 hover:border-yesil hover:shadow-kart-hover">
                  <span className="oyna grid size-12 place-items-center rounded-full bg-lime-rozet text-black transition-transform duration-200 ease-yayli group-hover:scale-110 group-hover:-rotate-6">
                    <DinamikIkon ad={a.ikon} boyut={24} />
                  </span>

                  <h2 className="mt-4 font-baslik text-lg font-bold leading-snug text-murekkep">
                    <Link
                      href={`/oyun-evi/programlar/${a.slug}`}
                      className="after:absolute after:inset-0 after:rounded-kart"
                    >
                      {a.ad}
                    </Link>
                  </h2>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-krem-koyu px-2.5 py-0.5 text-xs font-medium text-murekkep-soluk">
                      {a.yasEtiket}
                    </span>
                    {a.dil !== "tr" && (
                      <span className="rounded-full bg-lime-rozet px-2.5 py-0.5 text-xs font-medium text-black">
                        {DIL_ETIKET[a.dil]}
                      </span>
                    )}
                  </div>

                  <ul className="mt-4 flex-1 space-y-1.5">
                    {a.olgular.slice(0, 3).map((o) => (
                      <li
                        key={o}
                        className="flex gap-2 text-sm leading-snug text-murekkep-soluk"
                      >
                        <Ikon.Tik
                          boyut={15}
                          className="mt-0.5 shrink-0 text-yesil"
                        />
                        {o}
                      </li>
                    ))}
                  </ul>

                  <OgretmenRozetleri
                    ogretmenler={atolyeOgretmenleri(a.slug)}
                    className="mt-4 border-t border-cizgi pt-4"
                  />

                  <span className="mt-5 flex items-center justify-between border-t border-cizgi pt-4">
                    <span className="text-xs text-murekkep-soluk">
                      {slotSayisi > 0
                        ? `Haftada ${slotSayisi} seans`
                        : "Program içinde"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-baslik text-sm font-semibold text-yesil-koyu">
                      Ayrıntılar
                      <Ikon.Ok boyut={15} />
                    </span>
                  </span>
                </div>
              </SiraliOge>
            );
          })}
        </Sirali>
      </section>

      <SonCagri />
    </>
  );
}
