"use client";

import Link from "next/link";
import { useState } from "react";
import { MarkaLogosu } from "@/components/site/marka-logosu";
import { DinamikIkon, Ikon } from "@/components/ui/ikon";
import type { ModulGrubu } from "@/lib/kampus/moduller";

/**
 * Sol menu. Modul listesi `lib/kampus/moduller.ts` icinden geliyor.
 *
 * Iki sunumu var ve AYRI bilesenler olarak disari veriliyor: telefonda ust
 * cubuktaki dugmeyle acilan cekmece, genis ekranda sabit sutun. Tek bilesen
 * ikisini birden basardi ve ust cubuga konulunca sutun da orada cikardi.
 *
 * Hazir olmayan moduller GIZLENMIYOR, isaretli gosteriliyor: panelin neyi
 * kapsadigini gormek, neyin henuz olmadigini gormek kadar onemli.
 */

function Liste({
  gruplar,
  aktifYol,
  kapat,
}: {
  gruplar: ModulGrubu[];
  aktifYol: string;
  kapat?: () => void;
}) {
  return (
    <nav className="space-y-6 px-3 py-4">
      {gruplar.map((g) => (
        <div key={g.baslik}>
          <p className="px-3 pb-2 font-baslik text-[0.68rem] font-bold uppercase tracking-[0.14em] text-murekkep-soluk">
            {g.baslik}
          </p>
          <ul className="space-y-0.5">
            {g.moduller.map((m) => {
              const aktif =
                aktifYol === m.yol || aktifYol.startsWith(`${m.yol}/`);
              const hazir = m.durum === "hazir";
              return (
                <li key={m.slug}>
                  <Link
                    href={m.yol}
                    onClick={kapat}
                    aria-current={aktif ? "page" : undefined}
                    title={m.ozet}
                    className={`flex items-center gap-2.5 rounded-yumusak px-3 py-2 text-sm transition-colors ${
                      aktif
                        ? "bg-yesil-koyu font-semibold text-white"
                        : hazir
                          ? "text-murekkep hover:bg-krem-koyu"
                          : "text-murekkep-soluk hover:bg-krem-koyu"
                    }`}
                  >
                    <DinamikIkon
                      ad={m.ikon}
                      boyut={17}
                      className="shrink-0 opacity-90"
                    />
                    <span className="min-w-0 flex-1 truncate">{m.ad}</span>
                    {/*
                      Nokta: bu modul henuz calismiyor. Metin yerine isaret,
                      cunku "hazirlaniyor" yazisi her satiri sisiriyordu.
                    */}
                    {!hazir && (
                      <span
                        aria-label="hazırlanıyor"
                        title="Hazırlanıyor"
                        className={`size-1.5 shrink-0 rounded-full ${
                          aktif ? "bg-white/60" : "bg-murekkep-soluk/40"
                        }`}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Telefon: ust cubuktaki dugme ve acilan cekmece. */
export function MenuCekmecesi({
  gruplar,
  aktifYol,
}: {
  gruplar: ModulGrubu[];
  aktifYol: string;
}) {
  const [acik, setAcik] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAcik(true)}
        aria-label="Menüyü aç"
        aria-expanded={acik}
        className="grid size-10 place-items-center rounded-full border-2 border-cizgi text-murekkep lg:hidden"
      >
        <Ikon.Menu boyut={19} />
      </button>

      {acik && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Menüyü kapat"
            onClick={() => setAcik(false)}
            className="absolute inset-0 bg-murekkep/40"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto border-r-2 border-cizgi bg-white">
            <div className="flex items-center justify-between px-4 py-3">
              <MarkaLogosu boyut={32} />
              <button
                type="button"
                onClick={() => setAcik(false)}
                aria-label="Kapat"
                className="grid size-9 place-items-center rounded-full text-murekkep-soluk hover:bg-krem-koyu"
              >
                <Ikon.Kapat boyut={18} />
              </button>
            </div>
            <Liste
              gruplar={gruplar}
              aktifYol={aktifYol}
              kapat={() => setAcik(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

/** Genis ekran: sabit sol sutun. */
export function YanMenuSutunu({
  gruplar,
  aktifYol,
}: {
  gruplar: ModulGrubu[];
  aktifYol: string;
}) {
  return (
    <aside className="hidden w-60 shrink-0 border-r-2 border-cizgi bg-white lg:block">
      {/* Ust cubuk 57px; sutun onun altinda kalip kendi icinde kayiyor. */}
      <div className="sticky top-[57px] max-h-[calc(100dvh-57px)] overflow-y-auto">
        <Liste gruplar={gruplar} aktifYol={aktifYol} />
      </div>
    </aside>
  );
}
