"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Kutlama konfetisi. Talep gonderildikten sonra bir kez patlar.
 *
 * Konumlar Math.random ile degil, indisten turetilen deterministik bir
 * fonksiyonla uretiliyor. Sebep: sunucuda ve tarayicida ayni sonucu vermeli,
 * yoksa hidrasyon uyusmazligi cikar. Ayrica her yenilemede ayni gorunur,
 * bu da hata ayiklamayi kolaylastirir.
 */

const RENKLER = ["#bdf270", "#588f27", "#d8c09a", "#33025a", "#ffffff"];
const ADET = 44;

/** Deterministik sozde rastgele, 0 ile 1 arasi. */
function karistir(i: number, tohum: number): number {
  const v = Math.sin(i * 12.9898 + tohum * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

export function Konfeti() {
  const azHareket = useReducedMotion();

  // PLAN.md Bolum 11: prefers-reduced-motion aciksa suslu hareket calismaz.
  if (azHareket) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
    >
      {Array.from({ length: ADET }, (_, i) => {
        /*
          Degerler yuvarlanmis olmali. Yuvarlanmazsa React sunucuda
          "left: 27.2401%" yazip istemcide 27.240073720895452 hesapliyor ve
          hidrasyon uyusmazligi veriyor. Tam sayi ve iki basamak yeterli.
        */
        const sol = Math.round(karistir(i, 1) * 10000) / 100;
        const gecikme = Math.round(karistir(i, 2) * 50) / 100;
        const sure = Math.round((2.4 + karistir(i, 3) * 1.6) * 100) / 100;
        const donus = Math.round((karistir(i, 4) - 0.5) * 900);
        const kayma = Math.round((karistir(i, 5) - 0.5) * 220);
        const renk = RENKLER[i % RENKLER.length];
        const yuvarlakMi = i % 3 === 0;
        const en = Math.round(8 + karistir(i, 6) * 8);
        const boy = yuvarlakMi ? en : Math.round(en * 1.7);

        return (
          <motion.span
            key={i}
            initial={{ y: "-12vh", x: 0, rotate: 0, opacity: 1 }}
            animate={{
              y: "112vh",
              x: kayma,
              rotate: donus,
              opacity: [1, 1, 0.9, 0],
            }}
            transition={{
              duration: sure,
              delay: gecikme,
              ease: [0.2, 0.6, 0.5, 1],
            }}
            style={{
              position: "absolute",
              left: `${sol}%`,
              width: en,
              height: boy,
              backgroundColor: renk,
              borderRadius: yuvarlakMi ? "9999px" : "3px",
            }}
          />
        );
      })}
    </div>
  );
}
