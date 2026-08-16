"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { fotolar, fotoYolu } from "@/lib/data/fotograflar";

/**
 * Hero'daki donen fotograf. PLAN.md Bolum 11, Hareket.
 *
 * Bicim: logonun dairesel dilini surduren, yavasca sekil degistiren organik
 * bir maske. Kurumun kendi afislerindeki "yesil organik bicim" ayni dil.
 * Cember icinde durdugu icin kesikli halka ile hizasi bozulmuyor.
 *
 * prefers-reduced-motion aciksa: gecis de, sekil morfu da, otomatik gecis de
 * kapanir; tek kare sabit durur. Bolum 11, Hareket sinirlari.
 */

const KARELER = fotolar(
  "bambola-top-havuzu-01",
  "bambola-deniz-temali-oyun-alani-01",
  "bambola-oyun-merkezi-tirmanma-duvari-01",
  "bambola-etkinlik-salonu-dinozor-duvari-01",
  "bambola-bahce-kum-havuzu-01",
);

/** Maskenin gectigi dort sekil. Daireye yakin, ama hicbiri tam daire degil. */
const MASKELER = [
  "60% 40% 42% 58% / 55% 48% 52% 45%",
  "44% 56% 62% 38% / 47% 60% 40% 53%",
  "58% 42% 38% 62% / 62% 44% 56% 38%",
  "40% 60% 55% 45% / 42% 52% 48% 58%",
];

const GECIS_SN = 4.5;

export function HeroFotograf() {
  const azHareket = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (azHareket) return;
    const zaman = setInterval(
      () => setI((o) => (o + 1) % KARELER.length),
      GECIS_SN * 1000,
    );
    return () => clearInterval(zaman);
  }, [azHareket]);

  const kare = KARELER[i];

  // Uc katman da bu ikisini paylasiyor, bkz. asagidaki yorum.
  const sekil = azHareket
    ? { borderRadius: MASKELER[0] }
    : { borderRadius: MASKELER };
  const sekilGecisi = azHareket
    ? undefined
    : { duration: 26, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <div className="relative size-full">
      {/*
        Kesikli halka ve kum serit, fotograf maskesiyle AYNI sekil dizisini
        ayni surede geziyor. Daire birakilsalardi organik maske halkanin
        disina tasardi; ucu birlikte morflaninca aralarindaki bosluk her an
        esit kaliyor.
      */}
      <motion.div
        aria-hidden="true"
        className="absolute -inset-6 border-4 border-dashed border-lime-rozet"
        animate={sekil}
        transition={sekilGecisi}
      />
      <motion.div
        aria-hidden="true"
        className="absolute -inset-2 bg-kum/45"
        animate={sekil}
        transition={sekilGecisi}
      />

      {/* Fotograf maskesi. */}
      <motion.div
        className="absolute inset-0 overflow-hidden bg-krem-koyu shadow-kart"
        animate={sekil}
        transition={sekilGecisi}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={kare.slug}
            className="absolute inset-0"
            initial={azHareket ? { opacity: 1 } : { opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={
              azHareket
                ? { duration: 0.01 }
                : { opacity: { duration: 1.1 }, scale: { duration: 6, ease: "easeOut" } }
            }
          >
            <Image
              src={fotoYolu(kare)}
              alt={kare.alt}
              fill
              // Hero'nun ilk karesi LCP adayi: onceliklendiriliyor.
              priority={i === 0}
              sizes="(min-width: 1024px) 460px, (min-width: 640px) 60vw, 90vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Hangi karede oldugumuzu gosteren noktalar. Salt bilgi, tiklanmaz;
          hero'da ikinci bir etkilesim hedefi kayit butonunu zayiflatirdi. */}
      {!azHareket && (
        <div
          aria-hidden="true"
          className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-white/90 px-3 py-2 shadow-kart backdrop-blur-sm"
        >
          {KARELER.map((k, n) => (
            <span
              key={k.slug}
              className={`size-1.5 rounded-full transition-colors duration-500 ${
                n === i ? "bg-yesil" : "bg-cizgi"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
