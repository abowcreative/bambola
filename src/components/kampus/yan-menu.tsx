"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MarkaLogosu } from "@/components/site/marka-logosu";
import { DinamikIkon, Ikon } from "@/components/ui/ikon";
import { MARKA } from "@/lib/site";
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
    <nav className="space-y-5 px-3 py-4">
      {gruplar.map((g) => (
        <div key={g.baslik}>
          <p className="px-3 pb-1.5 text-[0.66rem] font-bold uppercase tracking-[0.1em] text-panel-silik">
            {g.baslik}
          </p>
          <ul className="space-y-px">
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
                    className={`group relative flex items-center gap-2.5 rounded-panel-sm py-2 pl-3 pr-2.5 text-sm transition-colors ${
                      aktif
                        ? "bg-yesil-koyu/10 font-semibold text-yesil-derin"
                        : "text-panel-soluk hover:bg-panel-yuzey-alt hover:text-murekkep"
                    }`}
                  >
                    {/* Aktif satirin sol kenar cizgisi: dolu zemin yerine
                        ince bir isaret, uzun menude goz yormuyor. */}
                    {aktif && (
                      <span
                        aria-hidden
                        className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-yesil-koyu"
                      />
                    )}
                    <DinamikIkon
                      ad={m.ikon}
                      boyut={17}
                      className={`shrink-0 ${
                        aktif
                          ? "text-yesil-koyu"
                          : "text-panel-silik group-hover:text-panel-soluk"
                      }`}
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
                        className="size-1.5 shrink-0 rounded-full bg-uyari/60"
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

/** Menunun tepesindeki marka satiri. Cekmecede ve sutunda ayni. */
function MarkaSatiri({ kapat }: { kapat?: () => void }) {
  return (
    <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-panel-cizgi px-4">
      <Link
        href="/kampus"
        onClick={kapat}
        className="flex min-w-0 items-center gap-2.5"
      >
        <MarkaLogosu boyut={28} />
        <span className="min-w-0 leading-none">
          <span className="block truncate font-baslik text-sm font-bold text-yesil-derin">
            {MARKA.ad}
          </span>
          <span className="mt-0.5 block text-[0.62rem] font-bold uppercase tracking-[0.14em] text-panel-silik">
            Kampüs
          </span>
        </span>
      </Link>
      {kapat && (
        <button
          type="button"
          onClick={kapat}
          aria-label="Menüyü kapat"
          className="ml-auto grid size-8 shrink-0 place-items-center rounded-panel-sm text-panel-soluk transition-colors hover:bg-panel-yuzey-alt"
        >
          <Ikon.Kapat boyut={17} />
        </button>
      )}
    </div>
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

  /* Cekmece acikken arkadaki sayfa kaymasin ve Escape kapatsin. */
  useEffect(() => {
    if (!acik) return;
    const onceki = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function tus(e: KeyboardEvent) {
      if (e.key === "Escape") setAcik(false);
    }
    document.addEventListener("keydown", tus);
    return () => {
      document.body.style.overflow = onceki;
      document.removeEventListener("keydown", tus);
    };
  }, [acik]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAcik(true)}
        aria-label="Menüyü aç"
        aria-expanded={acik}
        className="grid size-9 shrink-0 place-items-center rounded-panel-sm border border-panel-cizgi-guclu bg-panel-yuzey text-panel-soluk transition-colors hover:bg-panel-yuzey-alt lg:hidden"
      >
        <Ikon.Menu boyut={18} />
      </button>

      {acik && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Menüyü kapat"
            onClick={() => setAcik(false)}
            className="absolute inset-0 bg-murekkep/45 backdrop-blur-[2px]"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[86vw] flex-col border-r border-panel-cizgi bg-panel-yuzey shadow-panel-yuksek">
            <MarkaSatiri kapat={() => setAcik(false)} />
            <div className="min-h-0 flex-1 overflow-y-auto">
              <Liste
                gruplar={gruplar}
                aktifYol={aktifYol}
                kapat={() => setAcik(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Genis ekran: sabit sol sutun.
 *
 * Kendi icinde kayiyor ve marka satiri tepede sabit duruyor; uzun modul
 * listesinde kaydirinca "buradayim" bilgisi kaybolmuyor.
 */
export function YanMenuSutunu({
  gruplar,
  aktifYol,
  altCocuk,
}: {
  gruplar: ModulGrubu[];
  aktifYol: string;
  /** Sutunun en altina sabitlenen alan: kullanici kutusu. */
  altCocuk?: React.ReactNode;
}) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-panel-cizgi bg-panel-yuzey lg:flex xl:w-64">
      <MarkaSatiri />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Liste gruplar={gruplar} aktifYol={aktifYol} />
      </div>
      {altCocuk && (
        <div className="shrink-0 border-t border-panel-cizgi p-3">
          {altCocuk}
        </div>
      )}
    </aside>
  );
}
