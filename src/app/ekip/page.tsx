import Image from "next/image";
import { MARKA, SITE_URL } from "@/lib/site";
import { EKIP, ogretmenAdi, ogretmenSlug } from "@/lib/data/ekip";
import { SLOTLAR } from "@/lib/data/program";
import { atolyeBul } from "@/lib/data/atolyeler";
import { sayfaMetadata, ekmekKirintisiSemasi, SemaEtiketi } from "@/lib/seo";
import { EkmekKirintisi, SayfaBasligi } from "@/components/site/bolum-basligi";
import { Belir } from "@/components/site/bolum";
import { Ikon } from "@/components/ui/ikon";
import { SonCagri } from "@/components/site/son-cagri";

export const metadata = sayfaMetadata({
  baslik: "Ekibimiz: Öğretmen Kadrosu",
  aciklama: `${MARKA.ad} oyun evi öğretmen kadrosu. Okul öncesi öğretmenliği, çocuk gelişimi ve İngilizce alanlarında eğitimli üç öğretmen. ${MARKA.ilce}, ${MARKA.sehir}.`,
  yol: "/ekip",
});

const KIRINTI = [
  { ad: "Ana sayfa", yol: "/" },
  { ad: "Ekip", yol: "/ekip" },
];

/**
 * PLAN.md Bolum 14 madde 6 COZULDU: ozgecmisler ve fotograflar 16 Agustos
 * 2026'da geldi. Metinler ogretmenlerin kendi kaleminden, yeniden yazilmadi.
 *
 * Bu sayfa E-E-A-T icin en degerli sayfa: kurumun iddiasini kim tasidigi
 * burada gorunuyor. Bu yuzden ozgecmisler kisaltilmadi ve her ogretmen icin
 * Person semasi basiliyor.
 */

function ekipSemasi(
  kadro: { ogretmen: (typeof EKIP)[number]; atolyeler: string[] }[],
) {
  return kadro
    .filter(({ ogretmen }) => ogretmen.soyad)
    .map(({ ogretmen, atolyeler }) => ({
      "@context": "https://schema.org",
      "@type": "Person",
      name: ogretmenAdi(ogretmen),
      /*
        Kurum icindeki gorev de bir jobTitle. schema.org bu alanda birden
        fazla deger kabul ediyor; gorev basa yaziliyor, arama sonucunda
        kurumu temsil eden unvan o.
      */
      jobTitle:
        [ogretmen.gorev, ogretmen.unvan].filter(Boolean).length > 1
          ? [ogretmen.gorev, ogretmen.unvan]
          : (ogretmen.gorev ?? ogretmen.unvan ?? undefined),
      description: ogretmen.ozet ?? undefined,
      image: ogretmen.fotograf
        ? `${SITE_URL}/ekip/${ogretmen.fotograf}.jpg`
        : undefined,
      alumniOf: ogretmen.egitim
        ? {
            "@type": "EducationalOrganization",
            name: ogretmen.egitim.split(",")[0].trim(),
          }
        : undefined,
      knowsAbout: ogretmen.yaklasimlar ?? undefined,
      worksFor: { "@id": `${SITE_URL}/#kurum` },
      url: `${SITE_URL}/ekip#${ogretmenSlug(ogretmen)}`,
      makesOffer: atolyeler.length
        ? atolyeler.map((a) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: a },
          }))
        : undefined,
    }));
}

export default function EkipSayfasi() {
  const kadro = EKIP.map((o) => {
    const slotlar = SLOTLAR.filter((s) => s.ogretmenler.includes(o.ad));
    const atolyeler = [
      ...new Set(slotlar.map((s) => atolyeBul(s.atolyeSlug)?.kisaAd ?? "")),
    ].filter(Boolean);
    return { ogretmen: o, seansSayisi: slotlar.length, atolyeler };
  });

  return (
    <>
      <SemaEtiketi
        sema={[ekmekKirintisiSemasi(KIRINTI), ...ekipSemasi(kadro)]}
      />
      <EkmekKirintisi ogeler={KIRINTI} />

      <SayfaBasligi
        ustBaslik="Ekip"
        baslik="Çocuğunuzu kim karşılayacak?"
        aciklama="Kadro sabit: çocuk her hafta aynı öğretmeni görüyor. Aşağıdaki metinler öğretmenlerimizin kendi kalemlerinden."
      />

      {kadro.map(({ ogretmen, seansSayisi, atolyeler }, i) => (
        <section
          key={ogretmen.ad}
          id={ogretmenSlug(ogretmen)}
          className={`scroll-mt-24 ${i > 0 ? "border-t border-cizgi" : ""} ${
            i % 2 === 1 ? "bg-white" : ""
          }`}
        >
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
              {/* --- portre ve kunye --- */}
              <Belir>
                {ogretmen.fotograf && (
                  <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-blok bg-krem-koyu shadow-kart lg:mx-0">
                    <Image
                      src={`/ekip/${ogretmen.fotograf}.jpg`}
                      alt={`${ogretmenAdi(ogretmen)}, ${ogretmen.unvan}`}
                      fill
                      sizes="(min-width: 1024px) 320px, (min-width: 640px) 320px, 100vw"
                      priority={i === 0}
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Kurum icindeki gorev unvanin USTUNDE duruyor: rozet
                    olarak, cunku mesleki unvanla ayni turden bilgi degil. */}
                {ogretmen.gorev && (
                  <p className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-yesil-koyu px-3.5 py-1 text-xs font-bold uppercase tracking-[0.08em] text-white">
                    <Ikon.Rozet boyut={13} />
                    {ogretmen.gorev}
                  </p>
                )}

                <h2
                  className={`font-baslik text-2xl font-bold text-murekkep sm:text-3xl ${
                    ogretmen.gorev ? "mt-2" : "mt-6"
                  }`}
                >
                  {ogretmenAdi(ogretmen)}
                </h2>
                {ogretmen.unvan && (
                  <p className="mt-1 font-baslik font-semibold text-yesil-koyu">
                    {ogretmen.unvan}
                  </p>
                )}
                {ogretmen.egitim && (
                  <p className="mt-3 flex gap-2 text-sm leading-snug text-murekkep-soluk">
                    <Ikon.Ampul boyut={16} className="mt-0.5 shrink-0" />
                    {ogretmen.egitim}
                  </p>
                )}

                {/* Haftalik yuk ve hangi programlar: Excel'den cikan gercek
                    veri, ogretmenin metninden degil. */}
                <dl className="mt-6 space-y-3 border-t border-cizgi pt-6">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-murekkep-soluk">
                      Haftalık program
                    </dt>
                    <dd className="mt-1 font-baslik font-bold text-murekkep">
                      {seansSayisi} seans
                    </dd>
                  </div>
                  {atolyeler.length > 0 && (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-murekkep-soluk">
                        Yürüttüğü programlar
                      </dt>
                      <dd>
                        <ul className="mt-2 space-y-1.5">
                          {atolyeler.map((a) => (
                            <li
                              key={a}
                              className="flex gap-2 text-sm leading-snug text-murekkep"
                            >
                              <Ikon.Tik
                                boyut={15}
                                className="mt-0.5 shrink-0 text-yesil"
                              />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  )}
                </dl>
              </Belir>

              {/* --- ozgecmis --- */}
              <Belir gecikme={0.08}>
                {ogretmen.yaklasimlar && (
                  <ul className="mb-7 flex flex-wrap gap-2">
                    {ogretmen.yaklasimlar.map((y) => (
                      <li
                        key={y}
                        className="rounded-full bg-lime-rozet px-3.5 py-1.5 text-sm font-semibold text-black"
                      >
                        {y}
                      </li>
                    ))}
                  </ul>
                )}

                {ogretmen.ozgecmis && (
                  <div className="space-y-4 text-lg leading-relaxed text-murekkep-soluk">
                    {ogretmen.ozgecmis.map((p, n) => (
                      <p key={n}>{p}</p>
                    ))}
                  </div>
                )}
              </Belir>
            </div>
          </div>
        </section>
      ))}

      <div className="pt-16">
        <SonCagri
          baslik="Ekibimizle tanışın"
          aciklama="Formu doldurun, uygun bir gün ayarlayıp sizi bekleyelim."
        />
      </div>
    </>
  );
}
