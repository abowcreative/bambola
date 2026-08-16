import type { ReactNode } from "react";
import { Belir } from "./bolum";

/** Bolum basligi. Tum sayfalarda ayni ritim. */
export function BolumBasligi({
  ustBaslik,
  baslik,
  aciklama,
  ortala = false,
  seviye = 2,
}: {
  ustBaslik?: string;
  baslik: string;
  aciklama?: ReactNode;
  ortala?: boolean;
  seviye?: 2 | 3;
}) {
  const Baslik = seviye === 2 ? "h2" : "h3";

  return (
    <Belir className={ortala ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {ustBaslik && (
        <p className="mb-3 inline-flex items-center rounded-full bg-[var(--kol-vurgu)] px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--kol-vurgu-metin)]">
          {ustBaslik}
        </p>
      )}
      <Baslik
        className={`font-baslik font-bold text-murekkep ${
          seviye === 2 ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
        }`}
      >
        {baslik}
      </Baslik>
      {aciklama && (
        <div className="mt-4 text-lg leading-relaxed text-murekkep-soluk">
          {aciklama}
        </div>
      )}
    </Belir>
  );
}

/** Sayfa ust blogu. H1 burada. */
export function SayfaBasligi({
  ustBaslik,
  baslik,
  aciklama,
  cocuklar,
}: {
  ustBaslik?: string;
  baslik: string;
  aciklama?: ReactNode;
  cocuklar?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden border-b border-cizgi bg-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-24 -top-32 size-[24rem] rounded-full bg-[var(--kol-vurgu)]/35 blur-3xl" />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Belir className="max-w-3xl">
          {ustBaslik && (
            <p className="mb-3 inline-flex items-center rounded-full bg-[var(--kol-vurgu)] px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--kol-vurgu-metin)]">
              {ustBaslik}
            </p>
          )}
          <h1 className="font-baslik text-4xl font-bold text-murekkep sm:text-5xl">
            {baslik}
          </h1>
          {aciklama && (
            <div className="mt-5 text-lg leading-relaxed text-murekkep-soluk">
              {aciklama}
            </div>
          )}
          {cocuklar && <div className="mt-8">{cocuklar}</div>}
        </Belir>
      </div>
    </div>
  );
}

/** Gorsel ekmek kirintisi. Schema ayrica sayfada basilir. */
export function EkmekKirintisi({
  ogeler,
}: {
  ogeler: { ad: string; yol: string }[];
}) {
  return (
    <nav
      aria-label="Neredesiniz"
      className="mx-auto max-w-6xl px-4 pt-6 sm:px-6"
    >
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-murekkep-soluk">
        {ogeler.map((o, i) => (
          <li key={o.yol} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {i === ogeler.length - 1 ? (
              <span aria-current="page" className="font-medium text-murekkep">
                {o.ad}
              </span>
            ) : (
              <a href={o.yol} className="hover:text-[var(--kol-koyu)]">
                {o.ad}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
