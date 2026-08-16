import Link from "next/link";
import { AILELER } from "@/lib/data/gruplar";
import { ATOLYELER } from "@/lib/data/atolyeler";
import { PROGRAM_NOTLARI } from "@/lib/data/program";
import { SORULAR } from "@/lib/data/sss";
import { YAS_SAYFALARI } from "@/lib/yas";
import { MARKA } from "@/lib/site";
import { sayfaMetadata, ekmekKirintisiSemasi, SemaEtiketi } from "@/lib/seo";
import { ButonLink } from "@/components/ui/buton";
import { Ikon } from "@/components/ui/ikon";
import { Belir, Sirali, SiraliOge } from "@/components/site/bolum";
import {
  BolumBasligi,
  EkmekKirintisi,
  SayfaBasligi,
} from "@/components/site/bolum-basligi";
import { SssAkordiyon } from "@/components/site/sss-akordiyon";
import { SonCagri } from "@/components/site/son-cagri";
import { MekanSeridi } from "@/components/site/mekan-seridi";

export const metadata = sayfaMetadata({
  baslik: `${MARKA.ilce} Oyun Evi ve Oyun Grupları`,
  aciklama: `Millî Eğitim Bakanlığı'na bağlı oyun merkezi. ${MARKA.ilce}, ${MARKA.sehir}. 6 aydan 5 yaşa oyun grupları, atölyeler ve okula hazırlık. Okula hazırlıkta 12, diğer gruplarda 8 çocuk. İlk bir saat serbest oyun.`,
  yol: "/oyun-evi",
});

const KIRINTI = [
  { ad: "Ana sayfa", yol: "/" },
  { ad: "Oyun evi", yol: "/oyun-evi" },
];

export default function OyunEviSayfasi() {
  const atolyeler = ATOLYELER.filter(
    (a) => a.slug !== "serbest-oyun" && a.slug !== "guvenli-ayrilma-programi",
  );

  return (
    <>
      <SemaEtiketi sema={ekmekKirintisiSemasi(KIRINTI)} />
      <EkmekKirintisi ogeler={KIRINTI} />

      <SayfaBasligi
        ustBaslik="Oyun evi"
        baslik={`${MARKA.ilce}'da oyun evi ve oyun grupları`}
        aciklama={
          <>
            6 aylıktan 5 yaşa kadar, çocuğun yaşına göre kurulmuş gruplar. Her
            grupta okula hazırlıkta 12, diğerlerinde 8 çocuk. Günün ilk saati serbest oyun.
          </>
        }
        cocuklar={
          <div className="flex flex-wrap gap-3">
            <ButonLink href="/kayit" olcu="lg">
              Çocuğuma uygun grubu bul
              <Ikon.Ok boyut={19} />
            </ButonLink>
            <ButonLink
              href="/oyun-evi/haftalik-program"
              gorunum="cizgili"
              olcu="lg"
            >
              <Ikon.Takvim boyut={19} />
              Haftalık program
            </ButonLink>
          </div>
        }
      />

      {/* --- program aileleri --- */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <BolumBasligi
          ustBaslik="Programlar"
          baslik="Dört ana grup"
          aciklama="Çocuğun yaşı ve sizin haftalık düzeniniz hangisine uyuyorsa oradan başlıyoruz. Gruplar arasında geçiş mümkün."
        />

        <Sirali className="mt-10 grid gap-5 sm:grid-cols-2">
          {AILELER.map((a) => {
            const IkonBileseni = Ikon[a.ikon as keyof typeof Ikon] ?? Ikon.Grup;
            return (
              <SiraliOge key={a.slug}>
                <Link
                  href={`/kayit?program=${a.slug}`}
                  className="group flex h-full flex-col rounded-kart border-2 border-cizgi bg-white p-6 transition-all duration-200 ease-yayli hover:-translate-y-1 hover:border-yesil hover:shadow-kart-hover"
                >
                  <span className="oyna grid size-12 place-items-center rounded-full bg-lime-rozet text-black transition-transform duration-200 group-hover:scale-110">
                    <IkonBileseni boyut={24} />
                  </span>
                  <h3 className="mt-4 font-baslik text-xl font-bold text-murekkep">
                    {a.ad}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-yesil-koyu">
                    {a.yasEtiket}
                  </p>
                  <p className="mt-2 inline-flex self-start rounded-full bg-yesil-koyu px-3 py-1 text-xs font-bold text-white">
                    {a.sure}
                  </p>
                  <p className="mt-3 flex-1 leading-relaxed text-murekkep-soluk">
                    {a.ozet}
                  </p>
                  <ul className="mt-4 space-y-1.5">
                    {a.ozellikler.slice(0, 3).map((o) => (
                      <li
                        key={o}
                        className="flex gap-2 text-sm text-murekkep-soluk"
                      >
                        <Ikon.Tik
                          boyut={16}
                          className="mt-0.5 shrink-0 text-yesil"
                        />
                        {o}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-5 inline-flex items-center gap-2 font-baslik font-semibold text-yesil-koyu">
                    Kayıt formuna git
                    <Ikon.Ok boyut={17} />
                  </span>
                </Link>
              </SiraliOge>
            );
          })}
        </Sirali>
      </section>

      {/* --- atolyeler --- */}
      <section className="border-y border-cizgi bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <BolumBasligi
            ustBaslik="Atölyeler"
            baslik="Haftaya renk katan atölyeler"
            aciklama="Bazılarına tek katılımla da girilebiliyor. Önce deneyip sonra karar vermek isteyen veliler için."
          />

          <Sirali className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {atolyeler.map((a) => {
              const IkonBileseni =
                Ikon[a.ikon as keyof typeof Ikon] ?? Ikon.Firca;
              return (
                <SiraliOge key={a.slug}>
                  <Link
                    href={`/oyun-evi/programlar/${a.slug}`}
                    className="group flex h-full items-start gap-4 rounded-kart border-2 border-cizgi bg-krem p-5 transition-all duration-200 ease-yayli hover:-translate-y-1 hover:border-yesil hover:shadow-kart"
                  >
                    <span className="oyna grid size-11 shrink-0 place-items-center rounded-full bg-white text-yesil-koyu transition-colors group-hover:bg-lime-rozet group-hover:text-black">
                      <IkonBileseni boyut={22} />
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

      <MekanSeridi />

      {/* --- yas kapilari --- */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <BolumBasligi
          ustBaslik="Yaşa göre"
          baslik="Çocuğunuz kaç yaşında?"
          aciklama="Yaşını seçin, o yaşa uygun bütün gruplar, saatler ve ücretler tek sayfada."
        />

        <Sirali className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {YAS_SAYFALARI.map((y) => (
            <SiraliOge key={y.slug}>
              <Link
                href={`/oyun-evi/yas/${y.slug}`}
                className="group flex items-center justify-between gap-3 rounded-kart border-2 border-cizgi bg-white p-5 transition-all duration-200 ease-yayli hover:-translate-y-1 hover:border-yesil hover:shadow-kart"
              >
                <span className="font-baslik text-lg font-bold text-murekkep">
                  {y.ad}
                </span>
                <span className="grid size-9 place-items-center rounded-full bg-krem-koyu text-yesil-koyu transition-colors group-hover:bg-lime-rozet group-hover:text-black">
                  <Ikon.Ok boyut={18} />
                </span>
              </Link>
            </SiraliOge>
          ))}
        </Sirali>
      </section>

      {/* --- isleyis --- */}
      <section className="border-t border-cizgi bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <BolumBasligi
              ustBaslik="İşleyiş"
              baslik="Bir gün nasıl geçiyor?"
              aciklama="Programın kuralları herkes için aynı, sürpriz yok."
            />

            <Belir>
              <ul className="space-y-3">
                {PROGRAM_NOTLARI.map((n) => (
                  <li
                    key={n}
                    className="flex gap-3 rounded-yumusak bg-krem p-4 leading-relaxed text-murekkep"
                  >
                    <Ikon.Tik
                      boyut={19}
                      className="mt-0.5 shrink-0 text-yesil"
                    />
                    {n}
                  </li>
                ))}
              </ul>
            </Belir>
          </div>
        </div>
      </section>

      {/* --- sss --- */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <BolumBasligi
          ustBaslik="Sık sorulanlar"
          baslik="Velilerin en çok sorduğu"
          ortala
        />
        <div className="mt-8">
          <SssAkordiyon sorular={SORULAR.slice(0, 6)} />
        </div>
        <div className="mt-6 text-center">
          <ButonLink href="/sss" gorunum="cizgili">
            Bütün soruları gör
            <Ikon.Ok boyut={17} />
          </ButonLink>
        </div>
      </section>

      <SonCagri />
    </>
  );
}
