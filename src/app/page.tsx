import Link from "next/link";
import { MARKA, MEB_IFADESI } from "@/lib/site";
import { AILELER } from "@/lib/data/gruplar";
import { aileOgretmenleri } from "@/lib/data/ekip";
import { OgretmenRozetleri } from "@/components/site/ogretmen-rozetleri";
import { SORULAR } from "@/lib/data/sss";
import { PROGRAM_NOTLARI } from "@/lib/data/program";
import { KAMPANYA_PENCERESI, kampanyaAcikMi } from "@/lib/data/ucretler";
import { YAS_SAYFALARI } from "@/lib/yas";
import { kurumSemasi, sssSemasi, SemaEtiketi } from "@/lib/seo";
import { ButonLink } from "@/components/ui/buton";
import { MarkaLogosu } from "@/components/site/marka-logosu";
import { Ikon } from "@/components/ui/ikon";
import { Belir, Sirali, SiraliOge } from "@/components/site/bolum";
import { BolumBasligi } from "@/components/site/bolum-basligi";
import { SssAkordiyon } from "@/components/site/sss-akordiyon";
import { SonCagri } from "@/components/site/son-cagri";
import { MekanSeridi } from "@/components/site/mekan-seridi";
import { HeroFotograf } from "@/components/site/hero-fotograf";
import { HaftalikTakvim } from "@/components/takvim/haftalik-takvim";
import {
  Ayi,
  Kedi,
  Tavsan,
  Kule,
} from "@/components/site/karakterler";
import {
  Benekler,
  Dalga,
  Sayac,
  UcanKarakterler,
} from "@/components/site/dekor";

/**
 * Karakteri beyaz daire icine alip cikartma gibi gosterir.
 * Cizgi karakterler bos zeminde yuzer gibi duruyordu; daire onlari
 * sahneye oturtuyor ve logonun dairesel diliyle ayni dili konusuyor.
 */
function Cikartma({
  konum,
  gecikme,
  children,
}: {
  konum: string;
  gecikme?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      aria-hidden="true"
      className={`sallan absolute grid place-items-center rounded-full border-4 border-white bg-krem shadow-kart ${konum}`}
      style={gecikme ? { animationDelay: gecikme } : undefined}
    >
      {children}
    </span>
  );
}

/** Kampanya penceresi takvime bagli; bkz. /oyun-evi/ucretler icindeki not. */
export const revalidate = 3600;

export default function AnaSayfa() {
  const sssKisa = SORULAR.slice(0, 5);
  const kampanyaAcik = kampanyaAcikMi();

  return (
    <>
      <SemaEtiketi sema={[kurumSemasi(), sssSemasi(sssKisa)]} />

      {/* ------------------------------------------------------------ hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-24 -top-24 size-[26rem] rounded-full bg-lime-rozet/40 blur-3xl" />
          <div className="absolute -right-20 top-40 size-[20rem] rounded-full bg-lime-rozet/30 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.05fr_0.95fr]">
          <Belir>
            <div className="flex flex-wrap items-center gap-2">
              {/* Kurumun en guclu ayirt edici ozelligi. Musteri: "MEB'e
                  baglilik en onemli noktamiz, dikkat cekici olmali." */}
              {MEB_IFADESI && (
                <p className="inline-flex items-center gap-2 rounded-full bg-yesil-koyu px-4 py-2 text-sm font-bold text-white shadow-kart">
                  <span className="grid size-6 place-items-center rounded-full bg-lime-rozet text-yesil-derin">
                    <Ikon.Rozet boyut={15} />
                  </span>
                  {MEB_IFADESI} oyun merkezi
                </p>
              )}
              {/* Tarih artik veriden geliyor ve kampanya kapaninca rozet
                  kendiliginden kalkiyor. Onceden duz yaziydi: 1 Eylul'den
                  sonra site gecmis bir tarihi "son gun" diye ilan edecekti. */}
              {kampanyaAcik && (
                <p className="cikartma inline-flex items-center gap-2 rounded-full bg-lime-rozet px-4 py-1.5 text-sm font-semibold text-black shadow-kart">
                  <Ikon.Yildiz boyut={16} />
                  {KAMPANYA_PENCERESI.siteyeYazilirMi
                    ? `Erken kayıt, son gün ${KAMPANYA_PENCERESI.sonGun}`
                    : "Erken kayıt dönemi"}
                </p>
              )}
            </div>

            <h1 className="mt-5 font-baslik text-[2.5rem] font-bold leading-[1.05] text-murekkep sm:text-6xl">
              Çocuğunuz burada{" "}
              <span className="relative inline-block text-yesil-koyu">
                oynayarak
                <svg
                  viewBox="0 0 200 12"
                  className="absolute -bottom-1 left-0 w-full text-lime-rozet"
                  aria-hidden="true"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 8c40-5 90-7 196-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              büyüyor
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-murekkep-soluk">
              {MARKA.ilce}, {MARKA.sehir}. 6 aydan 5 yaşa oyun grupları,
              atölyeler ve okula hazırlık. Gruplar küçük, böylece her çocuk
              görülüyor.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
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
                Haftalık programı gör
              </ButonLink>
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-murekkep-soluk">
              <li className="flex items-center gap-2">
                <Ikon.Grup boyut={18} className="text-yesil" />
                Küçük gruplar: 8, okula hazırlıkta 12
              </li>
              <li className="flex items-center gap-2">
                <Ikon.Saat boyut={18} className="text-yesil" />
                İlk bir saat serbest oyun
              </li>
              <li className="flex items-center gap-2">
                <Ikon.Kalp boyut={18} className="text-yesil" />
                Güvenli ayrılma programı
              </li>
            </ul>
          </Belir>

          <Belir gecikme={0.12} className="relative">
            <div className="relative mx-auto aspect-square w-full max-w-md">
              {/* Kurumun kendi mekani, maskeli ve donen halde. Logo header'da
                  zaten duruyor; hero'da yerini gercek fotograf aliyor,
                  marka amblemi kucuk bir rozet olarak kaliyor. */}
              <HeroFotograf />

              <span
                aria-hidden="true"
                className="absolute -left-3 top-6 grid size-20 place-items-center rounded-full border-4 border-white bg-white shadow-kart sm:-left-6 sm:size-24"
              >
                <MarkaLogosu
                  boyut={120}
                  alt={`${MARKA.ad} ${MARKA.altBaslik}`}
                  className="size-full"
                />
              </span>

              {/* Sahnedeki karakterler, cikartma gibi maskenin uzerinde
                  oturuyorlar. Hepsi aria-hidden. */}
              <Cikartma konum="-right-5 top-4 sm:-right-9">
                <Ayi boyut={78} className="text-yesil-koyu" />
              </Cikartma>
              <Cikartma konum="-left-4 bottom-16 sm:-left-8" gecikme="-2.2s">
                <Tavsan boyut={72} className="text-yesil-derin" dolgu="#ffffff" />
              </Cikartma>
              <Cikartma konum="-bottom-3 right-8" gecikme="-0.6s">
                <Kedi boyut={70} className="text-yesil-derin" dolgu="#bdf270" />
              </Cikartma>
            </div>
          </Belir>
        </div>
      </section>

      {/* -------------------------------------------------- sayilarla bambola */}
      <section className="bg-lime-rozet">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 text-center sm:grid-cols-3 sm:px-6">
          {[
            { sayi: 12, sonEk: "", etiket: "kişilik gruplar, en fazla" },
            { sayi: 6, sonEk: " ay", etiket: "en küçük katılımcımız" },
            { sayi: 9, sonEk: "", etiket: "farklı program ve atölye" },
          ].map((s) => (
            <div key={s.etiket}>
              <p className="font-baslik text-5xl font-bold text-yesil-derin">
                <Sayac deger={s.sayi} sonEk={s.sonEk} />
              </p>
              <p className="mt-1 font-medium text-black/70">{s.etiket}</p>
            </div>
          ))}
        </div>
      </section>

      <Dalga ust="#bdf270" alt="#fdfcf7" />

      {/* -------------------------------------------------------- programlar */}
      <section className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <UcanKarakterler
          karakterler={[
            {
              ad: "Bulut",
              sol: 84,
              ust: 4,
              boyut: 120,
              derinlik: 70,
              gizliMobil: true,
            },
            {
              ad: "Yildiz",
              sol: 2,
              ust: 62,
              boyut: 76,
              derinlik: -50,
              gizliMobil: true,
            },
          ]}
        />

        <BolumBasligi
          ustBaslik="Programlar"
          baslik="Yaşına göre bir grup var"
          aciklama="Altı aylık bebekten okula hazırlanan çocuğa kadar. Hangisinin size uyduğuna doğum tarihine bakarak birlikte karar veriyoruz."
        />

        <Sirali className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {AILELER.map((a) => {
            const IkonBileseni = Ikon[a.ikon as keyof typeof Ikon] ?? Ikon.Grup;
            return (
              <SiraliOge key={a.slug}>
                {/*
                  Kart bir <Link> DEGIL: icinde ogretmen rozetleri var ve
                  baglanti icine baglanti konmaz. Yerine baslikta duran
                  baglanti `after:inset-0` ile kartin tamamini kapliyor;
                  rozetler de `z-10` ile onun ustunde duruyor. Kartin her
                  yeri yine tiklanabilir, rozetler kendi hedefine gidiyor.
                */}
                <div className="group relative flex h-full flex-col rounded-kart border-2 border-cizgi bg-white p-5 transition-all duration-200 ease-yayli hover:-translate-y-1.5 hover:border-yesil hover:shadow-kart-hover">
                  <span className="oyna grid size-12 place-items-center rounded-full bg-lime-rozet text-black transition-transform duration-200 ease-yayli group-hover:scale-110 group-hover:rotate-6">
                    <IkonBileseni boyut={24} />
                  </span>
                  <h3 className="mt-4 font-baslik text-lg font-bold leading-snug text-murekkep">
                    <Link
                      href={`/kayit?program=${a.slug}`}
                      className="after:absolute after:inset-0 after:rounded-kart"
                    >
                      {a.ad}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm font-medium text-yesil-koyu">
                    {a.yasEtiket}
                  </p>
                  <p className="mt-2 inline-flex self-start rounded-full bg-yesil-koyu px-3 py-1 text-xs font-bold text-white">
                    {a.sure}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-murekkep-soluk">
                    {a.ozet}
                  </p>

                  <OgretmenRozetleri
                    ogretmenler={aileOgretmenleri(a.slug)}
                    className="mt-4 border-t border-cizgi pt-4"
                  />

                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-yesil-koyu">
                    Kaydol
                    <Ikon.Ok boyut={15} />
                  </span>
                </div>
              </SiraliOge>
            );
          })}
        </Sirali>

        <Belir className="mt-8 text-center">
          <ButonLink href="/oyun-evi" gorunum="cizgili">
            Oyun evini tanıyın
            <Ikon.Ok boyut={17} />
          </ButonLink>
        </Belir>
      </section>

      {/* ------------------------------------------------------------- yaslar */}
      <Dalga ust="#fdfcf7" alt="#ffffff" />
      <section className="relative bg-white">
        <Benekler />
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-4 sm:px-6 sm:pb-20">
          <div className="mb-8 flex justify-center gap-6">
            <Kule boyut={92} className="text-yesil-koyu" />
            <Ayi boyut={92} className="text-yesil-koyu sm:size-28" />
            <Tavsan boyut={92} className="hidden text-yesil-derin sm:block" />
          </div>

          <BolumBasligi
            ustBaslik="Yaşa göre"
            baslik="Çocuğunuz kaç aylık?"
            aciklama="Yaşını seçin, ona uygun bütün gruplar, saatler ve ücretler tek sayfada."
            ortala
          />

          <Sirali className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {YAS_SAYFALARI.map((y) => (
              <SiraliOge key={y.slug}>
                <Link
                  href={`/oyun-evi/yas/${y.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-kart border-2 border-cizgi bg-krem p-5 transition-all duration-200 ease-yayli hover:-translate-y-1 hover:border-yesil hover:shadow-kart"
                >
                  <span className="font-baslik text-lg font-bold text-murekkep">
                    {y.ad}
                  </span>
                  <span className="grid size-9 place-items-center rounded-full bg-white text-yesil-koyu transition-colors group-hover:bg-lime-rozet group-hover:text-black">
                    <Ikon.Ok boyut={18} />
                  </span>
                </Link>
              </SiraliOge>
            ))}
          </Sirali>
        </div>
      </section>

      {/* ------------------------------------------------------------- takvim */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <BolumBasligi
          ustBaslik="Haftalık program"
          baslik="Bu hafta neler var?"
          aciklama="Yaşa göre süzün, çocuğunuza uyan saatleri görün."
        />
        <div className="mt-10">
          <HaftalikTakvim />
        </div>
      </section>

      <MekanSeridi />

      {/* -------------------------------------------------------- neden burasi */}
      <Dalga ust="#f5f1e6" alt="#ffffff" />
      <section className="relative bg-white">
        <UcanKarakterler
          karakterler={[
            {
              ad: "Balonlar",
              sol: 88,
              ust: 10,
              boyut: 110,
              derinlik: 90,
              gizliMobil: true,
            },
            {
              ad: "Kedi",
              sol: 3,
              ust: 55,
              boyut: 96,
              derinlik: -60,
              gizliMobil: true,
            },
          ]}
        />
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-4 sm:px-6 sm:pb-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <BolumBasligi
              ustBaslik="İşleyiş"
              baslik="Bir gün nasıl geçiyor?"
              aciklama="Kurallar herkes için aynı. Ne olacağını önceden bilirsiniz."
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

      {/* ---------------------------------------------------- diger iki kurum */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <Sirali className="grid gap-5 md:grid-cols-2">
          <SiraliOge>
            <Link
              href="/parti"
              className="group flex h-full flex-col rounded-blok border-2 border-cizgi bg-white p-8 transition-all duration-200 ease-yayli hover:-translate-y-1 hover:border-yesil hover:shadow-kart-hover"
            >
              <span className="grid size-14 place-items-center rounded-full bg-lime-rozet text-black transition-transform duration-200 group-hover:scale-110">
                <Ikon.Balon boyut={28} />
              </span>
              <h2 className="mt-5 font-baslik text-2xl font-bold text-murekkep">
                Doğum günü ve parti
              </h2>
              <p className="mt-3 flex-1 leading-relaxed text-murekkep-soluk">
                Parti evimiz oyun evinin bir parçası. Çocuğunuzun doğum gününü
                tanıdığı bir yerde kutlayın.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 font-baslik font-semibold text-yesil-koyu">
                Parti evini görün
                <Ikon.Ok boyut={17} />
              </span>
            </Link>
          </SiraliOge>

          <SiraliOge>
            <Link
              href="/anaokulu"
              data-kol="anaokulu"
              className="group flex h-full flex-col rounded-blok border-2 border-cizgi bg-yesil-derin p-8 transition-all duration-200 ease-yayli hover:-translate-y-1 hover:shadow-kart-hover"
            >
              <span className="grid size-14 place-items-center rounded-full bg-lime-rozet text-black transition-transform duration-200 group-hover:scale-110">
                <Ikon.Ampul boyut={28} />
              </span>
              <h2 className="mt-5 font-baslik text-2xl font-bold text-white">
                Anaokulu
              </h2>
              <p className="mt-3 flex-1 leading-relaxed text-lime-rozet">
                Bu sene açılıyor. Oyun evinde başlayan çocuk, yaşı gelince aynı
                çatının altında devam ediyor.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 font-baslik font-semibold text-lime-rozet">
                Ön kayıt ve bilgi
                <Ikon.Ok boyut={17} />
              </span>
            </Link>
          </SiraliOge>
        </Sirali>
      </section>

      {/* ---------------------------------------------------------------- sss */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <BolumBasligi
          ustBaslik="Sık sorulanlar"
          baslik="Velilerin en çok sorduğu"
          ortala
        />
        <div className="mt-8">
          <SssAkordiyon sorular={sssKisa} />
        </div>
        <Belir className="mt-6 text-center">
          <ButonLink href="/sss" gorunum="cizgili">
            Bütün soruları gör
            <Ikon.Ok boyut={17} />
          </ButonLink>
        </Belir>
      </section>

      <SonCagri />
    </>
  );
}
