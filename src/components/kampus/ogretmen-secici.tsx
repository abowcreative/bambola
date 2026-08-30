"use client";

import { useState, useTransition } from "react";
import { sinifaOgretmenAta } from "@/lib/kampus/ogrenci-islemleri";
import { ALAN } from "./ui";

/**
 * Sinifa ogretmen atar.
 *
 * Secim aninda kaydediliyor, ayri bir "kaydet" dugmesi yok: tek alanli bir
 * form icin fazladan tiklama. Hata olursa eski deger geri aliniyor.
 */
export function OgretmenSecici({
  sinifId,
  secili,
  adaylar,
}: {
  sinifId: string;
  secili: string | null;
  adaylar: string[];
}) {
  const [deger, setDeger] = useState(secili ?? "");
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  function degistir(yeni: string) {
    const onceki = deger;
    setDeger(yeni);
    setHata(null);

    basla(async () => {
      const sonuc = await sinifaOgretmenAta(sinifId, yeni);
      if (!sonuc.ok) {
        setDeger(onceki);
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <span className="w-32 shrink-0">
      <select
        value={deger}
        onChange={(e) => degistir(e.target.value)}
        disabled={bekliyor}
        aria-label="Öğretmen ata"
        className={`${ALAN} h-8 py-0 text-xs ${
          deger ? "" : "border-dashed text-panel-silik"
        }`}
      >
        <option value="">Atanmadı</option>
        {adaylar.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
      {hata && (
        <span role="alert" className="mt-1 block text-xs text-tehlike">
          {hata}
        </span>
      )}
    </span>
  );
}
