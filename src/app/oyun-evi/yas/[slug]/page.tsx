import { notFound } from "next/navigation";
import Link from "next/link";
import { MARKA } from "@/lib/site";
import {
  YAS_SAYFALARI,
  yasSayfasiBul,
  yasBandiAileleri,
  yasBandiSlotlari,
} from "@/lib/yas";
import { atolyeBul } from "@/lib/data/atolyeler";
import { GUN_ADI } from "@/lib/data/types";
import { SORULAR } from "@/lib/data/sss";
import { kampanyaAcikMi } from "@/lib/data/ucretler";
import {
  sayfaMetadata,
  ekmekKirintisiSemasi,
  sssSemasi,
  SemaEtiketi,
} from "@/lib/seo";
import { EkmekKirintisi, SayfaBasligi } from "@/components/site/bolum-basligi";
import { Belir, Sirali, SiraliOge } from "@/components/site/bolum";
import { UcretKarti } from "@/components/site/ucret-tablosu";
import { SlotKarti } from "@/components/takvim/haftalik-takvim";
import { SssAkordiyon } from "@/components/site/sss-akordiyon";
import { SonCagri } from "@/components/site/son-cagri";
import { MekanSeridi } from "@/components/site/mekan-seridi";
import { ButonLink } from "@/components/ui/buton";
import { DinamikIkon, Ikon } from "@/components/ui/ikon";

/**
 * Yas sayfalari programatik. Tek sablon, lib/data uzerinden dort sayfa.
 * PLAN.md Bolum 5: hem uzun kuyruk hem donusum icin en verimli yapi.
 */
/** Kampanya penceresi takvime bagli; bkz. ucretler sayfasindaki not. */
export const revalidate = 3600;

export function generateStaticParams() {
  return YAS_SAYFALARI.map((y) => ({ slug: y.slug }));
}

const ARAMA_METNI: Record<string, string> = {
  "6-12-ay": "6 aylık bebek etkinlikleri",
  "12-24-ay": "1 yaş oyun grubu",
  "24-36-ay": "2 yaş oyun grubu",
  "3-5-yas": "3 yaş etkinlikleri",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const y = yasSayfasiBul(slug);
  if (!y) return {};

  return sayfaMetadata({
    baslik: `${y.ad} Çocuklar İçin Oyun Grupları`,
    aciklama:
      `${y.ad} çocuklar için ${MARKA.ilce}, ${MARKA.sehir}'da oyun grupları ve atölyeler. Gün, saat ve ücretlerle birlikte. ${ARAMA_METNI[slug] ?? ""}`.trim(),
    yol: `/oyun-evi/yas/${y.slug}`,
  });
}

export default async function YasSayfasi({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const yas = yasSayfasiBul(slug);
  if (!yas) notFound();

  const kampanyaAcik = kampanyaAcikMi();

  const aileler = yasBandiAileleri(yas);
  const slotlar = yasBandiSlotlari(yas).filter(
    (s) => s.atolyeSlug !== "serbest-oyun",
  );

  // Bu yas bandinda gorunen atolyeler, tekrarsiz.
  const atolyeSluglari = [...new Set(slotlar.map((s) => s.atolyeSlug))];

  const sorular = SORULAR.filter(
    (s) => s.kategori === "genel" || s.kategori === "kayit",
  ).slice(0, 5);

  const kirinti = [
    { ad: "Ana sayfa", yol: "/" },
    { ad: "Oyun evi", yol: "/oyun-evi" },
    { ad: yas.ad, yol: `/oyun-evi/yas/${yas.slug}` },
  ];

  return (
    <>
      <SemaEtiketi sema={[ekmekKirintisiSemasi(kirinti), sssSemasi(sorular)]} />
      <EkmekKirintisi ogeler={kirinti} />

      <SayfaBasligi
        ustBaslik={`${yas.ad} çocuklar`}
        baslik={`${yas.ad} çocuğunuz için neler var?`}
        aciklama={
          slotlar.length
            ? `Bu yaşa uygun ${aileler.length} grup ve haftada ${slotlar.length} seans açık. Hepsi aşağıda, saatleri ve ücretleriyle.`
            : "Bu yaş için şu an açık grup görünmüyor. Formu doldurun, size uygun bir çözüm arayalım."
        }
        cocuklar={
          <ButonLink href="/kayit" olcu="lg">
            {yas.ad} için kayıt formu
            <Ikon.Ok boyut={19} />
          </ButonLink>
        }
      />

      {/* --- uygun gruplar --- */}
      {aileler.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <Belir>
            <h2 className="font-baslik text-2xl font-bold text-murekkep sm:text-3xl">
              {yas.ad} için düzenli gruplar
            </h2>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-murekkep-soluk">
              Haftalık düzene oturan, gelişim takibi yapılan gruplar.
              {kampanyaAcik
                ? " Fiyatlar erken kayıt indirimi uygulanmış halde."
                : ""}
            </p>
          </Belir>

          <Sirali className="mt-8 grid gap-5 sm:grid-cols-2">
            {aileler.map((a) => (
              <UcretKarti key={a.slug} aile={a} kampanyaAcik={kampanyaAcik} />
            ))}
          </Sirali>
        </section>
      )}

      {/* --- atolyeler --- */}
      {atolyeSluglari.length > 0 && (
        <section className="border-y border-cizgi bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
            <Belir>
              <h2 className="font-baslik text-2xl font-bold text-murekkep sm:text-3xl">
                {yas.ad} için açık programlar
              </h2>
            </Belir>

            <Sirali className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {atolyeSluglari.map((s) => {
                const a = atolyeBul(s);
                if (!a) return null;
                return (
                  <SiraliOge key={s}>
                    <Link
                      href={`/oyun-evi/programlar/${s}`}
                      className="group flex h-full items-start gap-4 rounded-kart border-2 border-cizgi bg-krem p-5 transition-all duration-200 ease-yayli hover:-translate-y-1 hover:border-yesil hover:shadow-kart"
                    >
                      <span className="oyna grid size-11 shrink-0 place-items-center rounded-full bg-white text-yesil-koyu transition-colors group-hover:bg-lime-rozet group-hover:text-black">
                        <DinamikIkon ad={a.ikon} boyut={22} />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-baslik font-bold text-murekkep">
                          {a.ad}
                        </span>
                        <span className="mt-0.5 block text-sm text-murekkep-soluk">
                          {a.yasEtiket}
                        </span>
                      </span>
                    </Link>
                  </SiraliOge>
                );
              })}
            </Sirali>
          </div>
        </section>
      )}

      {/* --- saatler --- */}
      {slotlar.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <Belir>
            <h2 className="font-baslik text-2xl font-bold text-murekkep sm:text-3xl">
              {yas.ad} için haftalık saatler
            </h2>
            <p className="mt-3 text-murekkep-soluk">
              Yalnızca bu yaşa uygun olanlar listeleniyor.
            </p>
          </Belir>

          <Sirali className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {slotlar.map((s) => (
              <SiraliOge key={s.id}>
                <p className="mb-1.5 text-sm font-semibold text-murekkep-soluk">
                  {GUN_ADI[s.gun]}
                </p>
                <SlotKarti slot={s} />
              </SiraliOge>
            ))}
          </Sirali>
        </section>
      )}

      {/* --- diger yaslar --- */}
      <section className="border-t border-cizgi bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <Belir>
            <h2 className="font-baslik text-xl font-bold text-murekkep">
              Başka bir yaş
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {YAS_SAYFALARI.filter((y) => y.slug !== yas.slug).map((y) => (
                <Link
                  key={y.slug}
                  href={`/oyun-evi/yas/${y.slug}`}
                  className="rounded-full border-2 border-cizgi bg-krem px-4 py-2 font-medium text-murekkep-soluk transition-colors hover:border-yesil hover:text-yesil-koyu"
                >
                  {y.ad}
                </Link>
              ))}
            </div>
          </Belir>
        </div>
      </section>

      {/* --- sss --- */}
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <Belir>
          <h2 className="text-center font-baslik text-2xl font-bold text-murekkep sm:text-3xl">
            Sık sorulanlar
          </h2>
        </Belir>
        <div className="mt-8">
          <SssAkordiyon sorular={sorular} />
        </div>
      </section>

      <MekanSeridi />

      <div className="pt-16">
        <SonCagri
          baslik={`${yas.ad} çocuğunuz için başlayalım`}
          aciklama="Doğum tarihini girin, uygun grupları ve saatleri birlikte görelim."
        />
      </div>
    </>
  );
}
