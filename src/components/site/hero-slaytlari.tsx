"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ButonLink } from "@/components/ui/buton";
import { DinamikIkon, Ikon } from "@/components/ui/ikon";
import type { HeroSlayti } from "@/lib/data/hero";

/**
 * Hero'nun kendi kendine donen metin blogu. Veri: lib/data/hero.ts.
 *
 * NEDEN ISTEMCI BILESENI: donme tarayicida oluyor. Slaytlarin KENDISI
 * sunucudan geliyor, yani ilk kare sunucu ciktisinda tam metniyle var;
 * arama motoru bos bir kutu gormuyor.
 *
 * H1 BURADA. Sayfada tek h1 var ve slayt degisince metni degisiyor.
 * Sunucu ilk slayti basiyor, o da gercek bir gruptan bahsediyor.
 *
 * prefers-reduced-motion aciksa: gecis de otomatik donme de kapanir, ilk
 * slayt sabit durur. Noktalar yine tiklanabilir, yani hareketi kapatmis
 * biri de oteki slaytlara ulasabiliyor. PLAN.md Bolum 11, Hareket.
 */

const GECIS_SN = 6.5;

export function HeroSlaytlari({ slaytlar }: { slaytlar: HeroSlayti[] }) {
  const azHareket = useReducedMotion();
  const [i, setI] = useState(0);
  /*
    Fare uzerindeyken ya da blok icinde klavye odagi varken donme durur.
    Durmayan bir karusel, okunurken cumleyi altindan cekiyor.
  */
  const [duraklat, setDuraklat] = useState(false);

  useEffect(() => {
    if (azHareket || duraklat) return;
    const zaman = setInterval(
      () => setI((o) => (o + 1) % slaytlar.length),
      GECIS_SN * 1000,
    );
    return () => clearInterval(zaman);
  }, [azHareket, duraklat, slaytlar.length]);

  const s = slaytlar[i] ?? slaytlar[0];

  return (
    <div
      aria-roledescription="carousel"
      aria-label="Öne çıkan gruplar"
      onMouseEnter={() => setDuraklat(true)}
      onMouseLeave={() => setDuraklat(false)}
      onFocusCapture={() => setDuraklat(true)}
      onBlurCapture={() => setDuraklat(false)}
    >
      {/*
        Sabit yukseklik: slaytlarin metin uzunlugu esit degil ve kutu her
        gecISte buyuyup kuculurse altindaki her sey ziplar.
      */}
      <div className="min-h-[21rem] sm:min-h-[19rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={s.slug}
            initial={azHareket ? { opacity: 1 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={azHareket ? { opacity: 0 } : { opacity: 0, y: -14 }}
            transition={{ duration: azHareket ? 0.01 : 0.4 }}
          >
            <p className="inline-flex items-center gap-2 rounded-full bg-lime-rozet px-4 py-1.5 text-sm font-semibold text-black shadow-kart">
              <DinamikIkon ad={s.ikon} boyut={16} />
              {s.etiket}
            </p>

            <h1 className="mt-4 font-baslik text-[2.4rem] font-bold leading-[1.05] text-murekkep sm:text-6xl">
              {s.baslikOnce && <>{s.baslikOnce} </>}
              <span className="relative inline-block text-yesil-koyu">
                {s.baslikVurgu}
                <svg
                  viewBox="0 0 200 12"
                  /*
                    Alti cizgi yaziyla birlikte buyumeli. Tek bir -bottom-1
                    degeriyle 60 punto baslikta "g" ve "y" kuyruklari cizgiye
                    giriyor ve satir USTU CIZILI gibi okunuyordu.
                  */
                  className="absolute -bottom-2 left-0 w-full text-lime-rozet sm:-bottom-4"
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
              {s.baslikSonra}
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-murekkep-soluk">
              {s.aciklama}
            </p>

            <ButonLink
              href={s.href}
              gorunum="cizgili"
              olcu="lg"
              className="mt-7"
            >
              {s.buton}
              <Ikon.Ok boyut={19} />
            </ButonLink>
          </motion.div>
        </AnimatePresence>
      </div>

      {/*
        Noktalar TIKLANABILIR. Hero fotografindaki noktalar salt bilgi,
        cunku orada gorulecek tek sey fotograf; burada her nokta baska bir
        grubun tanitimi, yani veli geri donebilmeli.
      */}
      <div className="mt-6 flex gap-2">
        {slaytlar.map((k, n) => (
          <button
            key={k.slug}
            type="button"
            onClick={() => setI(n)}
            aria-current={n === i ? "true" : undefined}
            className={`h-2 rounded-full transition-all duration-300 ${
              n === i ? "w-8 bg-yesil" : "w-2 bg-cizgi hover:bg-yesil/50"
            }`}
          >
            <span className="sr-only">{`${k.etiket}: ${k.baslikVurgu}`}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
