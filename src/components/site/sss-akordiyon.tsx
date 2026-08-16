"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Soru } from "@/lib/data/sss";
import { Ikon } from "@/components/ui/ikon";

/**
 * Sik sorulanlar. FAQPage schema ayrica sayfada basilir; buradaki gorsel
 * katman acilip kapanabiliyor ama icerik DOM'da her zaman var, boylece
 * arama motoru gizli metin gormez.
 */
export function SssAkordiyon({ sorular }: { sorular: Soru[] }) {
  const [acik, setAcik] = useState<number | null>(0);
  const azHareket = useReducedMotion();

  return (
    <ul className="divide-y divide-cizgi overflow-hidden rounded-kart border-2 border-cizgi bg-white">
      {sorular.map((s, i) => {
        const aciktir = acik === i;
        return (
          <li key={s.soru}>
            <h3>
              <button
                type="button"
                onClick={() => setAcik(aciktir ? null : i)}
                aria-expanded={aciktir}
                className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-krem-koyu/50"
              >
                <span className="flex-1 font-baslik font-semibold text-murekkep">
                  {s.soru}
                </span>
                <span
                  className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-krem-koyu text-[var(--kol-koyu)] transition-transform duration-200 ${
                    aciktir ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                >
                  <Ikon.OkAsagi boyut={16} />
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {aciktir && (
                <motion.div
                  initial={
                    azHareket ? { opacity: 0 } : { height: 0, opacity: 0 }
                  }
                  animate={
                    azHareket ? { opacity: 1 } : { height: "auto", opacity: 1 }
                  }
                  exit={azHareket ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: azHareket ? 0.01 : 0.24 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 leading-relaxed text-murekkep-soluk">
                    {s.cevap}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
