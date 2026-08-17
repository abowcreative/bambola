"use client";

import { useState, useTransition } from "react";
import { durumDegistir } from "@/lib/kampus/basvuru-islemleri";
import { DURUM_ETIKET } from "@/lib/supabase/types";
import type { BasvuruDurumu } from "@/lib/supabase/types";
import { DURUM_RENGI } from "./basvuru-satiri";

const SIRA: BasvuruDurumu[] = [
  "yeni",
  "arandi",
  "ulasilamadi",
  "kayit_oldu",
  "vazgecti",
];

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
    <div className="text-right">
      <div
        role="group"
        aria-label="Başvuru durumu"
        className={`flex flex-wrap gap-1.5 ${bekliyor ? "opacity-70" : ""}`}
      >
        {SIRA.map((d) => {
          const aktif = gosterilen === d;
          return (
            <button
              key={d}
              type="button"
              onClick={() => degistir(d)}
              aria-pressed={aktif}
              className={`rounded-full px-3.5 py-1.5 font-baslik text-sm font-semibold transition-colors ${
                aktif
                  ? DURUM_RENGI[d]
                  : "border-2 border-cizgi bg-white text-murekkep-soluk hover:border-yesil hover:text-murekkep"
              }`}
            >
              {DURUM_ETIKET[d]}
            </button>
          );
        })}
      </div>
      {hata && (
        <p role="alert" className="mt-2 text-sm text-murekkep">
          {hata}
        </p>
      )}
    </div>
  );
}
