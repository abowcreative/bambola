"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Logo } from "./logo";
import { ANA_MENU } from "@/lib/nav";
import { Ikon } from "@/components/ui/ikon";
import { BilgiCagrisi } from "@/components/site/bilgi-cagrisi";

export function SiteHeader() {
  const yol = usePathname();
  const [acik, setAcik] = useState(false);
  /*
    Masaustunde acik olan alt menu. 12 Eylul 2026'ya kadar alt menuler
    YALNIZCA mobil cekmecede cikiyordu; masaustunde `alt` dizisi hic
    basilmiyordu. "Gruplarimiz" menusu eklenince bu eksik gorunur oldu,
    cunku o menunun butun degeri alt maddelerinde.
  */
  const [acikAlt, setAcikAlt] = useState<string | null>(null);
  const azHareket = useReducedMotion();

  // Menu, baglantiya tiklandiginda kapanir. Effect icinde setState yapmiyoruz;
  // React 19 bunu kaskad render olarak isaretliyor.
  const kapat = () => {
    setAcik(false);
    setAcikAlt(null);
  };

  // Menu aciksa arka plan kaymasin.
  useEffect(() => {
    document.body.style.overflow = acik ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [acik]);

  /*
    Escape ve disari tiklama paneli kapatir.

    SAYFA DEGISIMINDE KAPATAN BIR EFEKT YOK: menudeki her baglanti zaten
    kendi onClick'inde kapatiyor. Efekt icinde setState React 19'da kaskad
    render sayiliyor (react-hooks/set-state-in-effect), bkz. yukaridaki not.
  */
  useEffect(() => {
    if (!acikAlt) return;
    const tus = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAcikAlt(null);
    };
    const disari = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest("nav[aria-label='Ana menü']")) {
        setAcikAlt(null);
      }
    };
    document.addEventListener("keydown", tus);
    document.addEventListener("pointerdown", disari);
    return () => {
      document.removeEventListener("keydown", tus);
      document.removeEventListener("pointerdown", disari);
    };
  }, [acikAlt]);

  const aktifMi = (href: string) =>
    href === "/" ? yol === "/" : yol.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-cizgi/70 bg-krem/85 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Ana menü" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {ANA_MENU.map((oge) => (
              <li
                key={oge.href}
                className="relative"
                /*
                  Fareyle uzerine gelince aciliyor, ayrilinca kapaniyor.
                  Klavye ve dokunmatik icin ayrica bir dugme var: yalniz
                  hover'a baglanan bir menu o iki girdiyle hic acilmaz.
                */
                onMouseEnter={oge.alt ? () => setAcikAlt(oge.href) : undefined}
                onMouseLeave={oge.alt ? () => setAcikAlt(null) : undefined}
              >
                <span className="flex items-center">
                  <Link
                    href={oge.href}
                    aria-current={aktifMi(oge.href) ? "page" : undefined}
                    className={`relative block whitespace-nowrap rounded-full px-3 py-2 text-[0.95rem] font-medium transition-colors xl:px-3.5 ${
                      aktifMi(oge.href)
                        ? "text-yesil-koyu"
                        : "text-murekkep-soluk hover:text-yesil-koyu"
                    }`}
                  >
                    {oge.ad}
                    {aktifMi(oge.href) && (
                      <motion.span
                        layoutId="menu-aktif"
                        className="absolute inset-0 -z-10 rounded-full bg-lime-rozet/55"
                        transition={
                          azHareket
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 420, damping: 34 }
                        }
                      />
                    )}
                  </Link>

                  {oge.alt && (
                    <button
                      type="button"
                      aria-expanded={acikAlt === oge.href}
                      aria-controls={`alt-menu-${oge.ad}`}
                      onClick={() =>
                        setAcikAlt((o) => (o === oge.href ? null : oge.href))
                      }
                      className="-ml-1.5 grid size-7 place-items-center rounded-full text-murekkep-soluk transition-colors hover:text-yesil-koyu"
                    >
                      <span className="sr-only">{oge.ad} alt menüsü</span>
                      <Ikon.OkAsagi
                        boyut={15}
                        className={`transition-transform duration-200 ${
                          acikAlt === oge.href ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}
                </span>

                <AnimatePresence>
                  {oge.alt && acikAlt === oge.href && (
                    <motion.div
                      id={`alt-menu-${oge.ad}`}
                      initial={
                        azHareket ? { opacity: 0 } : { opacity: 0, y: -8 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      exit={azHareket ? { opacity: 0 } : { opacity: 0, y: -8 }}
                      transition={{ duration: azHareket ? 0.01 : 0.16 }}
                      className="absolute left-0 top-full z-50 w-[19rem] pt-2"
                    >
                      <ul className="rounded-kart border-2 border-cizgi bg-white p-2 shadow-kart">
                        {oge.alt.map((a) => (
                          <li key={a.href}>
                            <Link
                              href={a.href}
                              onClick={() => setAcikAlt(null)}
                              className="block rounded-yumusak px-3 py-2.5 transition-colors hover:bg-krem"
                            >
                              <span className="block font-baslik font-semibold leading-snug text-murekkep">
                                {a.ad}
                              </span>
                              {a.aciklama && (
                                <span className="mt-0.5 block text-sm text-murekkep-soluk">
                                  {a.aciklama}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          {/*
            Kayit formu yayinda degil (lib/site.ts KAYIT_FORMU_ACIK):
            ust cubuktaki cagri da WhatsApp'a gidiyor.
          */}
          {/*
            1024-1279 arasinda gizli. "Gruplarimiz" menusu eklenince ust
            cubukta yedi madde oldu; bu genislikte hem menu hem dugme
            sigmiyor ve ikisi de iki satira kiriliyordu. Sag alttaki yuzen
            WhatsApp dugmesi o araligi zaten karsiliyor.
          */}
          <BilgiCagrisi
            metin="Detaylı bilgi al"
            olcu="sm"
            className="hidden sm:inline-flex lg:hidden xl:inline-flex"
          />

          <button
            type="button"
            onClick={() => setAcik((v) => !v)}
            aria-expanded={acik}
            aria-controls="mobil-menu"
            className="grid size-11 place-items-center rounded-full border-2 border-cizgi text-yesil-koyu transition-colors hover:bg-lime-rozet/40 lg:hidden"
          >
            <span className="sr-only">
              {acik ? "Menüyü kapat" : "Menüyü aç"}
            </span>
            {acik ? <Ikon.Kapat /> : <Ikon.Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {acik && (
          <motion.div
            id="mobil-menu"
            initial={azHareket ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={azHareket ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: azHareket ? 0.01 : 0.22 }}
            className="border-t border-cizgi bg-krem lg:hidden"
          >
            <nav
              aria-label="Mobil menü"
              className="mx-auto max-w-6xl px-4 py-4"
            >
              <ul className="flex flex-col gap-1">
                {ANA_MENU.map((oge) => (
                  <li key={oge.href}>
                    <Link
                      href={oge.href}
                      onClick={kapat}
                      aria-current={aktifMi(oge.href) ? "page" : undefined}
                      className={`flex items-center justify-between rounded-yumusak px-4 py-3 font-baslik text-lg font-medium transition-colors ${
                        aktifMi(oge.href)
                          ? "bg-lime-rozet text-black"
                          : "text-murekkep hover:bg-krem-koyu"
                      }`}
                    >
                      {oge.ad}
                      <Ikon.Ok boyut={18} />
                    </Link>
                    {oge.alt && (
                      <ul className="mb-1 ml-4 border-l-2 border-cizgi pl-3">
                        {oge.alt.map((a) => (
                          <li key={a.href}>
                            <Link
                              href={a.href}
                              onClick={kapat}
                              className="block rounded-yumusak px-3 py-2 hover:bg-krem-koyu"
                            >
                              <span className="block text-[0.95rem] font-medium text-murekkep">
                                {a.ad}
                              </span>
                              {a.aciklama && (
                                <span className="block text-sm text-murekkep-soluk">
                                  {a.aciklama}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
              {/* Cekmecedeki cagri da WhatsApp'a; form yayinda degil. */}
              <BilgiCagrisi metin="Detaylı bilgi al" className="mt-3 w-full" />
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
