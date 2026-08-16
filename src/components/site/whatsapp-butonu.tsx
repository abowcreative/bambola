"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { whatsappBaglantisi } from "@/lib/site";
import { KAMPANYA_PENCERESI, ERKEN_KAYIT_ORANI } from "@/lib/data/ucretler";
import { Ikon } from "@/components/ui/ikon";
import { MarkaLogosu } from "./marka-logosu";

/**
 * Sag altta duran WhatsApp butonu ve kampanya balonu.
 *
 * Numara yoksa HIC BASILMAZ (PLAN.md Bolum 3 madde 5: kap olmadan cagri
 * yapilmaz). `whatsappBaglantisi()` null donunce bilesen de yok oluyor.
 *
 * Renk sitenin kendi yesili, WhatsApp'in markasal yesili degil: sayfada
 * zaten yesil bir dil var ve ikinci bir yesil yamali duruyordu.
 *
 * DIKKAT: `kampanyaAcik` ve `kalanGun` PROP olarak geliyor, burada
 * hesaplanmiyor. Ucretler dosyasindaki uyari: sayfa onbellekten gelirken
 * sunucu "acik" istemci "kapali" derse hydration uyusmazligi cikar.
 */

/*
  Kayit formunun altinda `sticky bottom-0` fiyat paneli var: toplam tutar ve
  gonder butonu orada duruyor. Yuzen buton tam onlarin ustune gelir ve
  ozellikle telefonda gonder butonunu kapatir. Formda veli zaten donusum
  yolunda; ikinci bir kanal yardim etmiyor, engel oluyor.
*/
const GIZLI_YOLLAR = ["/kayit"];

/** Balon kapatilinca bu oturum boyunca bir daha acilmiyor. */
const KAPATMA_ANAHTARI = "bambola-wa-balon-kapali";

/*
  Balon ACIK BASLIYOR: kampanya mesajini gormek icin kaydirmayi beklemek onu
  gereksiz sakliyordu.

  Telefonda ise TAM KART acik baslamiyor, tek satirlik serit basliyor.
  Sebebi olculdu: 390px ekranda tam kart hero'daki "Çocuğuma uygun grubu bul"
  butonunun uzerine oturuyor, yani sayfanin asil cagrisini kapatiyor. Serit
  butonun cok altinda kaliyor ve dokununca tam karta aciliyor.
*/

/** Girisin animasyonlu gorunmesi icin kisa bekleme. Ilk boyamada hazir
    duruyorsa "beliriyor" hissi kayboluyor. */
const ACILMA_GECIKMESI = 900;

export function WhatsappButonu({
  kampanyaAcik,
  kalanGun,
}: {
  kampanyaAcik: boolean;
  kalanGun: number;
}) {
  const yol = usePathname();
  const azHareket = useReducedMotion();
  const [balonAcik, setBalonAcik] = useState(false);
  /** Telefonda serit yerine tam kart gosteriliyor mu. */
  const [genisletildi, setGenisletildi] = useState(false);

  const gizli = GIZLI_YOLLAR.some((g) => yol === g || yol.startsWith(`${g}/`));
  const balonGosterilir = kampanyaAcik && !gizli;

  /*
    Kapatma bilgisi sessionStorage'da: veli balonu kapatinca sitede gezerken
    her sayfada yeniden acilmasi bunaltici olurdu. localStorage degil, cunku
    bir sonraki ziyarette kampanya hatirlatmasi yeniden gorunmeli.

    sessionStorage okumasi ZAMANLAYICININ ICINDE: efektin govdesinde
    setState cagirmak zincirleme render tetikliyor (react-hooks kurali).
  */
  useEffect(() => {
    if (!balonGosterilir) return;
    const z = setTimeout(() => {
      if (!sessionStorage.getItem(KAPATMA_ANAHTARI)) setBalonAcik(true);
    }, ACILMA_GECIKMESI);
    return () => clearTimeout(z);
  }, [balonGosterilir]);

  function kapat() {
    setBalonAcik(false);
    setGenisletildi(false);
    sessionStorage.setItem(KAPATMA_ANAHTARI, "1");
  }

  /*
    Hazir mesaj kampanyaya gore degisiyor: veli WhatsApp'i actiginda ne
    sordugunu yazmak zorunda kalmiyor, kurum da talebin nereden geldigini
    goruyor.
  */
  const wa = whatsappBaglantisi(
    kampanyaAcik
      ? `Merhaba, ${KAMPANYA_PENCERESI.sonGun}'e kadar süren erken kayıt indirimi için bilgi almak istiyorum.`
      : "Merhaba, Bambola hakkında bilgi almak istiyorum.",
  );

  if (!wa || gizli) return null;

  const yuzde = Math.round(ERKEN_KAYIT_ORANI * 100);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {/*
          Telefonun varsayilan hali: tek satirlik serit. Tam kart hero'daki
          asil butonun ustune otururdu, serit onun cok altinda kaliyor.
          Genisletilince asagidaki tam kart devreye giriyor.
        */}
        {balonAcik && !genisletildi && (
          <motion.button
            key="serit"
            type="button"
            onClick={() => setGenisletildi(true)}
            initial={azHareket ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={
              azHareket
                ? { duration: 0.01 }
                : { type: "spring", stiffness: 300, damping: 24 }
            }
            className="flex max-w-[calc(100vw-2.5rem)] items-center gap-2 rounded-full border-2 border-cizgi bg-white py-2 pl-2.5 pr-4 shadow-kart sm:hidden"
          >
            <MarkaLogosu boyut={26} />
            <span className="truncate font-baslik text-xs font-bold text-murekkep">
              Erken kayıt · son gün {KAMPANYA_PENCERESI.sonGun}
            </span>
            <Ikon.Ok boyut={14} className="shrink-0 text-yesil-koyu" />
          </motion.button>
        )}

        {balonAcik && (
          <motion.div
            key="kart"
            initial={azHareket ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={azHareket ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
            transition={
              azHareket
                ? { duration: 0.01 }
                : { type: "spring", stiffness: 260, damping: 22 }
            }
            className={`w-[17.5rem] origin-bottom-right rounded-blok border-2 border-cizgi bg-white p-4 shadow-kart-hover sm:block sm:w-80 ${
              genisletildi ? "block" : "hidden"
            }`}
          >
            <div className="flex items-start gap-3">
              <MarkaLogosu boyut={38} />
              <div className="min-w-0 flex-1">
                <p className="font-baslik text-sm font-bold leading-snug text-murekkep">
                  Erken kayıt indirimi
                </p>
                <p className="text-xs font-medium text-yesil-koyu">
                  Son gün {KAMPANYA_PENCERESI.sonGun}
                  {kalanGun > 0 && kalanGun <= 21 && (
                    <> · {kalanGun} gün kaldı</>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={kapat}
                aria-label="Kapat"
                className="-mr-1 -mt-1 grid size-7 shrink-0 place-items-center rounded-full text-murekkep-soluk transition-colors hover:bg-krem-koyu hover:text-murekkep"
              >
                <Ikon.Kapat boyut={16} />
              </button>
            </div>

            {/*
              Yuzde ve kapsam veriden geliyor. Tek seferlik katilimda indirim
              YOK (Bolum 6.3), o yuzden "aylik paketlerde" diye yaziyor --
              "her seyde %20" demek yanlis olurdu.
            */}
            <p className="mt-3 text-sm leading-relaxed text-murekkep-soluk">
              Aylık paketlerde %{yuzde} indirim. Çocuğunuza uygun grupları ve
              ücretleri WhatsApp&apos;tan konuşalım.
            </p>

            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-[var(--kol-ana)] px-4 py-2.5 font-baslik text-sm font-semibold text-white shadow-kart transition-transform duration-200 ease-yayli hover:-translate-y-0.5"
            >
              <Ikon.Whatsapp boyut={18} />
              Detaylı bilgi al
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={
          kampanyaAcik
            ? "WhatsApp'tan erken kayıt indirimi için bilgi alın"
            : "WhatsApp'tan yazın"
        }
        /* Footer'da da WhatsApp baglantisi var; testler ikisini bu
           isaretle ayiriyor. */
        data-wa-yuzen=""
        className="group relative flex items-center gap-3"
      >
        {/* Etiket yalniz genis ekranda ve yalniz uzerine gelince aciliyor.
            Telefonda surekli duran bir etiket ekranin altini kaplardi. */}
        <span className="pointer-events-none hidden max-w-0 overflow-hidden whitespace-nowrap rounded-full bg-white px-0 py-2 font-baslik text-sm font-semibold text-murekkep opacity-0 shadow-kart transition-all duration-300 ease-yayli group-hover:max-w-[14rem] group-hover:px-4 group-hover:opacity-100 group-focus-visible:max-w-[14rem] group-focus-visible:px-4 group-focus-visible:opacity-100 sm:block">
          {kampanyaAcik ? "Erken kayıt için yazın" : "WhatsApp'tan yazın"}
        </span>

        <span className="relative grid size-14 shrink-0 place-items-center rounded-full bg-[var(--kol-ana)] text-white shadow-kart transition-transform duration-200 ease-yayli group-hover:scale-110 group-active:scale-95 group-focus-visible:ring-4 group-focus-visible:ring-lime-rozet">
          {/* Kampanya acikken tek bir nabiz halkasi. Kapaliyken buton
              sessiz duruyor: hatirlatacak bir sey yok. */}
          {kampanyaAcik && !azHareket && (
            <span className="absolute inset-0 animate-ping rounded-full bg-[var(--kol-ana)] opacity-30 [animation-duration:2.4s]" />
          )}
          <Ikon.Whatsapp boyut={28} className="relative" />
        </span>
      </a>
    </div>
  );
}
