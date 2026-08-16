"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";
import { KARAKTERLER, type KarakterAdi } from "./karakterler";

/**
 * Dekor katmani: bolum aralarindaki dalgalar, ucusan karakterler ve
 * benekli zeminler. Hepsi `aria-hidden`, ekran okuyucu bunlari okumaz.
 */

/** Iki bolum arasindaki dalgali gecis. Duz cizgi yerine yumusak kenar. */
export function Dalga({
  ust = "transparent",
  alt = "#ffffff",
  ters = false,
}: {
  /** Ustteki bolumun zemini. */
  ust?: string;
  /** Alttaki bolumun zemini. */
  alt?: string;
  ters?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className="-mb-px w-full"
      style={{ background: ust }}
    >
      <svg
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        className={`block h-[52px] w-full sm:h-[72px] ${ters ? "rotate-180" : ""}`}
      >
        <path
          fill={alt}
          d="M0 44c120-26 240-38 360-30s240 34 360 42 240-2 360-22 240-30 360-24v60H0z"
        />
      </svg>
    </div>
  );
}

/** Benekli zemin. Cok hafif, metnin okunmasini engellemez. */
export function Benekler({ renk = "#588f27" }: { renk?: string }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
      style={{
        backgroundImage: `radial-gradient(${renk} 2px, transparent 2px)`,
        backgroundSize: "26px 26px",
      }}
    />
  );
}

type UcanKarakter = {
  ad: KarakterAdi;
  /** Yuzde cinsinden konum. */
  sol: number;
  ust: number;
  boyut: number;
  /** Kaydirmada ne kadar farkli hizda hareket etsin. */
  derinlik: number;
  dolgu?: string;
  gizliMobil?: boolean;
};

/**
 * Bolum arkasinda suzulen karakterler. Kaydirdikca farkli hizlarda
 * hareket ederler, sayfaya derinlik verir.
 */
export function UcanKarakterler({
  karakterler,
  className = "",
}: {
  karakterler: UcanKarakter[];
  className?: string;
}) {
  const azHareket = useReducedMotion();
  const kutu = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: kutu,
    offset: ["start end", "end start"],
  });

  return (
    <div
      ref={kutu}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      {karakterler.map((k, i) => (
        <TekUcan
          key={`${k.ad}-${i}`}
          k={k}
          ilerleme={scrollYProgress}
          azHareket={Boolean(azHareket)}
        />
      ))}
    </div>
  );
}

function TekUcan({
  k,
  ilerleme,
  azHareket,
}: {
  k: UcanKarakter;
  ilerleme: ReturnType<typeof useScroll>["scrollYProgress"];
  azHareket: boolean;
}) {
  const y = useTransform(ilerleme, [0, 1], [0, azHareket ? 0 : -k.derinlik]);
  const Bilesen = KARAKTERLER[k.ad];

  return (
    <motion.div
      style={{ y, left: `${k.sol}%`, top: `${k.ust}%` }}
      className={`absolute text-yesil-koyu/25 ${k.gizliMobil ? "hidden lg:block" : ""}`}
    >
      <Bilesen boyut={k.boyut} dolgu={k.dolgu ?? "#bdf270"} />
    </motion.div>
  );
}

/**
 * Gorunur olunca sayarak artan rakam.
 * PLAN.md Bolum 11, Hareket tablosu: "Fiyat ve yas sayilari sayarak artar".
 * Teyit edilmemis rakam BURAYA GIRMEZ, yalniz dogrulanmis sayilar.
 */
export function Sayac({
  deger,
  sonEk = "",
  sure = 1.2,
}: {
  deger: number;
  sonEk?: string;
  sure?: number;
}) {
  const azHareket = useReducedMotion();
  const kutu = useRef<HTMLSpanElement>(null);
  const gorunur = useInView(kutu, { once: true, amount: 0.6 });
  const sayi = useMotionValue(0);
  const yuvarlak = useTransform(sayi, (v) => Math.round(v));

  useEffect(() => {
    if (!gorunur) return;
    // sayi.set ve animate React durumu degil, effect icinde guvenli.
    if (azHareket) {
      sayi.set(deger);
      return;
    }
    const kontrol = animate(sayi, deger, { duration: sure, ease: "easeOut" });
    return () => kontrol.stop();
  }, [gorunur, deger, sure, azHareket, sayi]);

  return (
    <span ref={kutu} className="tabular-nums">
      <motion.span>{yuvarlak}</motion.span>
      {sonEk}
    </span>
  );
}
