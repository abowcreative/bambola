"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  tlYaz,
  indirimYuzdesi,
  gecerliFiyat,
  erkenKayitGosterilirMi,
} from "@/lib/data/ucretler";
import type { PaketSecenegi } from "@/lib/data/types";

/**
 * Fiyat adim 3'ten sonra ekranda sabit kalir, secim degistikce guncellenir.
 * PLAN.md Bolum 7: "Surpriz olmaz."
 *
 * Fiyat bilinmiyorsa uydurulmaz; boyle bir durumda panel ne oldugunu acikca
 * soyler ve veliyi telefona yonlendirir.
 */
export function FiyatPaneli({
  paket,
  programAdi,
  fiyatYok,
  kampanyaAcik,
}: {
  paket?: PaketSecenegi;
  programAdi?: string;
  /** Bu secim icin yayinlanmis bir ucret yok. */
  fiyatYok?: boolean;
  /** Erken kayit penceresi acik mi. Formdan gelir. */
  kampanyaAcik: boolean;
}) {
  const azHareket = useReducedMotion();

  if (!paket && !fiyatYok) return null;

  return (
    <motion.aside
      initial={azHareket ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        azHareket
          ? { duration: 0.01 }
          : { type: "spring", stiffness: 200, damping: 26 }
      }
      aria-live="polite"
      className="sticky bottom-0 z-20 -mx-4 border-t-2 border-[var(--kol-ana)] bg-white px-4 py-4 shadow-[0_-8px_24px_-16px_rgba(0,0,0,0.25)] sm:-mx-6 sm:px-6"
    >
      {fiyatYok ? (
        <div className="mx-auto max-w-2xl">
          <p className="font-baslik font-semibold text-murekkep">
            Bu atölye için ücret bilgisini telefonda paylaşıyoruz
          </p>
          <p className="mt-1 text-sm text-murekkep-soluk">
            Formu gönderin, sizi arayıp netleştirelim.
          </p>
        </div>
      ) : (
        paket && (
          <div className="mx-auto flex max-w-2xl flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.12em] text-murekkep-soluk">
                {programAdi}
              </p>
              <p className="font-baslik font-medium text-murekkep">
                {paket.etiket}
              </p>
            </div>

            <div className="text-right">
              {erkenKayitGosterilirMi(paket, kampanyaAcik) && (
                <p className="text-sm text-murekkep-soluk">
                  <s>{tlYaz(paket.normal)}</s>
                  <span className="ml-2 rounded-full bg-[var(--kol-vurgu)] px-2 py-0.5 text-xs font-semibold text-[var(--kol-vurgu-metin)]">
                    yüzde {indirimYuzdesi(paket)} indirim
                  </span>
                </p>
              )}
              <p className="font-baslik text-2xl font-bold tabular-nums text-[var(--kol-koyu)]">
                {tlYaz(gecerliFiyat(paket, kampanyaAcik))}
              </p>
            </div>
          </div>
        )
      )}
    </motion.aside>
  );
}
