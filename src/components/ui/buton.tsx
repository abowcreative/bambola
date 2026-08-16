import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * Tek buton bileseni. PLAN.md Bolum 11:
 * - Yesil zemin uzerinde beyaz metin, lime zemin uzerinde SIYAH metin (1.30:1 kurali).
 * - Tiklamada bastirma hareketi, sadece transform, layout tetiklemez.
 * - data-kol="anaokulu" altinda palet kendiliginden mor'a doner.
 */

type Gorunum = "dolu" | "cizgili" | "yumusak";
type Olcu = "sm" | "md" | "lg";

const gorunumler: Record<Gorunum, string> = {
  dolu: "bg-[var(--kol-ana)] text-white shadow-kart hover:brightness-110",
  cizgili:
    "border-2 border-[var(--kol-ana)] bg-white text-[var(--kol-koyu)] hover:bg-[var(--kol-vurgu)] hover:text-[var(--kol-vurgu-metin)] hover:border-transparent",
  yumusak:
    "bg-[var(--kol-vurgu)] text-[var(--kol-vurgu-metin)] hover:brightness-105",
};

const olculer: Record<Olcu, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

const temel =
  "inline-flex items-center justify-center gap-2 rounded-full font-baslik font-semibold " +
  "transition-all duration-200 ease-yayli will-change-transform " +
  "hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] " +
  "disabled:pointer-events-none disabled:opacity-50";

export function Buton({
  gorunum = "dolu",
  olcu = "md",
  className = "",
  children,
  ...rest
}: ComponentProps<"button"> & {
  gorunum?: Gorunum;
  olcu?: Olcu;
  children: ReactNode;
}) {
  return (
    <button
      className={`${temel} ${gorunumler[gorunum]} ${olculer[olcu]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButonLink({
  gorunum = "dolu",
  olcu = "md",
  className = "",
  children,
  ...rest
}: ComponentProps<typeof Link> & {
  gorunum?: Gorunum;
  olcu?: Olcu;
  children: ReactNode;
}) {
  return (
    <Link
      className={`${temel} ${gorunumler[gorunum]} ${olculer[olcu]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}
