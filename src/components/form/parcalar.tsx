"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useId } from "react";
import { Ikon } from "@/components/ui/ikon";

/** Form icin ortak parcalar. PLAN.md Bolum 7, Tasarim ilkeleri. */

export function IlerlemeCubugu({
  adim,
  toplam,
  adimAdlari,
}: {
  adim: number;
  toplam: number;
  adimAdlari: string[];
}) {
  const azHareket = useReducedMotion();
  const oran = (adim / toplam) * 100;

  return (
    <div className="sticky top-[4.5rem] z-20 -mx-4 mb-8 border-b border-cizgi bg-krem/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-baslik text-sm font-semibold text-murekkep">
          {adimAdlari[adim - 1]}
        </p>
        <p className="text-xs tabular-nums text-murekkep-soluk">
          Adım {adim} / {toplam}
        </p>
      </div>

      <div
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-krem-koyu"
        role="progressbar"
        aria-valuenow={adim}
        aria-valuemin={1}
        aria-valuemax={toplam}
        aria-label="Form ilerlemesi"
      >
        <motion.div
          className="h-full rounded-full bg-[var(--kol-ana)]"
          initial={false}
          animate={{ width: `${oran}%` }}
          transition={
            azHareket
              ? { duration: 0.01 }
              : { type: "spring", stiffness: 180, damping: 24 }
          }
        />
      </div>
    </div>
  );
}

export function Alan({
  etiket,
  ipucu,
  hata,
  zorunlu,
  children,
}: {
  etiket: string;
  ipucu?: string;
  hata?: string;
  zorunlu?: boolean;
  children: (props: { id: string; "aria-describedby"?: string }) => ReactNode;
}) {
  const id = useId();
  const ipucuId = `${id}-ipucu`;
  const hataId = `${id}-hata`;
  const tanim = [ipucu ? ipucuId : null, hata ? hataId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block font-baslik font-medium text-murekkep"
      >
        {etiket}
        {zorunlu && (
          <span className="ml-1 text-yesil-koyu" aria-hidden="true">
            *
          </span>
        )}
        {!zorunlu && (
          <span className="ml-2 text-xs font-normal text-murekkep-soluk">
            isteğe bağlı
          </span>
        )}
      </label>

      {ipucu && (
        <p id={ipucuId} className="text-sm text-murekkep-soluk">
          {ipucu}
        </p>
      )}

      {children({ id, "aria-describedby": tanim || undefined })}

      {hata && (
        <p
          id={hataId}
          role="alert"
          className="text-sm font-medium text-red-700"
        >
          {hata}
        </p>
      )}
    </div>
  );
}

export const girdiSinifi =
  "w-full rounded-yumusak border-2 border-cizgi bg-white px-4 py-3 text-base " +
  "transition-colors placeholder:text-murekkep-soluk/60 " +
  "focus:border-[var(--kol-ana)] focus:outline-none";

/**
 * Secilebilir kart. Radyo dugmesi gibi calisir ama tum kart tiklanabilir.
 * Klavye ile gezilebilir, secim durumu ekran okuyucuya bildirilir.
 */
export function SecimKarti({
  secili,
  onSec,
  baslik,
  altBaslik,
  rozetler,
  sag,
  ikon,
  ad,
}: {
  secili: boolean;
  onSec: () => void;
  baslik: string;
  altBaslik?: string;
  rozetler?: string[];
  sag?: ReactNode;
  ikon?: ReactNode;
  /** Ayni gruptaki kartlar icin radyo adi. */
  ad: string;
}) {
  return (
    <label
      className={`group relative flex cursor-pointer items-start gap-4 rounded-kart border-2 p-4 transition-all duration-200 ease-yayli hover:-translate-y-0.5 ${
        secili
          ? "border-[var(--kol-ana)] bg-[var(--kol-vurgu)]/25 shadow-kart"
          : "border-cizgi bg-white hover:border-[var(--kol-ana)]/50"
      }`}
    >
      <input
        type="radio"
        name={ad}
        checked={secili}
        onChange={onSec}
        className="sr-only"
      />

      {ikon && (
        <span
          className={`mt-0.5 grid size-11 shrink-0 place-items-center rounded-full transition-colors ${
            secili
              ? "bg-[var(--kol-ana)] text-white"
              : "bg-krem-koyu text-[var(--kol-koyu)]"
          }`}
          aria-hidden="true"
        >
          {ikon}
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="block font-baslik font-semibold text-murekkep">
          {baslik}
        </span>
        {altBaslik && (
          <span className="mt-0.5 block text-sm text-murekkep-soluk">
            {altBaslik}
          </span>
        )}
        {rozetler && rozetler.length > 0 && (
          <span className="mt-2 flex flex-wrap gap-1.5">
            {rozetler.map((r) => (
              <span
                key={r}
                className="rounded-full bg-krem-koyu px-2.5 py-0.5 text-xs font-medium text-murekkep-soluk"
              >
                {r}
              </span>
            ))}
          </span>
        )}
      </span>

      {sag && <span className="shrink-0 text-right">{sag}</span>}

      <span
        className={`absolute right-3 top-3 grid size-6 place-items-center rounded-full transition-all ${
          secili
            ? "scale-100 bg-[var(--kol-ana)] text-white"
            : "scale-0 bg-transparent"
        }`}
        aria-hidden="true"
      >
        <Ikon.Tik boyut={15} />
      </span>
    </label>
  );
}

/** Adimlar arasi yatay kayma. PLAN.md Bolum 11, Hareket tablosu. */
export function AdimGecisi({
  yon,
  children,
}: {
  yon: 1 | -1;
  children: ReactNode;
}) {
  const azHareket = useReducedMotion();

  return (
    <motion.div
      initial={azHareket ? { opacity: 0 } : { opacity: 0, x: 40 * yon }}
      animate={{ opacity: 1, x: 0 }}
      exit={azHareket ? { opacity: 0 } : { opacity: 0, x: -40 * yon }}
      transition={
        azHareket
          ? { duration: 0.01 }
          : { type: "spring", stiffness: 260, damping: 30 }
      }
    >
      {children}
    </motion.div>
  );
}
