"use client";

import { useState, useTransition } from "react";
import { durumDegistir } from "@/lib/kampus/basvuru-islemleri";
import { DURUM_ETIKET } from "@/lib/supabase/types";
import type { BasvuruDurumu } from "@/lib/supabase/types";
import { Etiket } from "./ui";

const SIRA: BasvuruDurumu[] = [
  "yeni",
  "arandi",
  "ulasilamadi",
  "kayit_oldu",
  "vazgecti",
];

/** Secili durumun dolu zemini. Rozet tonuyla ayni anlam, daha guclu. */
const SECILI: Record<BasvuruDurumu, string> = {
  yeni: "bg-lime-rozet text-black",
  arandi: "bg-bilgi text-white",
  ulasilamadi: "bg-uyari text-white",
  kayit_oldu: "bg-basari text-white",
  vazgecti: "bg-panel-soluk text-white",
};

/**
 * Durum degistirici.
 *
 * Yeni durum ANINDA gosteriliyor, sunucudan cevap beklenmeden: tek tikla
 * yapilan bir isin yarim saniye donmesi paneli agir hissettiriyor. Sunucu
 * hata dondururse eski deger geri aliniyor ve sebep yaziliyor.
 */
export function DurumSecici({
  id,
  durum,
}: {
  id: string;
  durum: BasvuruDurumu;
}) {
  const [gosterilen, setGosterilen] = useState<BasvuruDurumu>(durum);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  function degistir(yeni: BasvuruDurumu) {
    if (yeni === gosterilen) return;
    const onceki = gosterilen;
    setGosterilen(yeni);
    setHata(null);

    basla(async () => {
      const sonuc = await durumDegistir(id, yeni);
      if (!sonuc.ok) {
        setGosterilen(onceki);
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <div>
      <Etiket>Durum</Etiket>
      <div
        role="group"
        aria-label="Başvuru durumu"
        className={`flex flex-wrap overflow-hidden rounded-panel-sm border border-panel-cizgi-guclu ${
          bekliyor ? "opacity-70" : ""
        }`}
      >
        {SIRA.map((d) => {
          const aktif = gosterilen === d;
          return (
            <button
              key={d}
              type="button"
              onClick={() => degistir(d)}
              aria-pressed={aktif}
              className={`flex-1 border-r border-panel-cizgi px-3 py-1.5 font-baslik text-sm font-semibold transition-colors last:border-r-0 ${
                aktif
                  ? SECILI[d]
                  : "bg-panel-yuzey text-panel-soluk hover:bg-panel-yuzey-alt hover:text-murekkep"
              }`}
            >
              {DURUM_ETIKET[d]}
            </button>
          );
        })}
      </div>
      {hata && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-tehlike">
          {hata}
        </p>
      )}
    </div>
  );
}
