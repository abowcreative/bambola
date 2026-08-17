"use client";

import { useState, useTransition } from "react";
import { leadDurumuDegistir } from "@/lib/kampus/yoklama-islemleri";
import {
  LEAD_DURUM_ETIKET,
  type LeadDurumu,
} from "@/lib/kampus/yoklama-tipleri";

/** Lead durumunu degistirir. Secim aninda kaydediliyor. */
export function LeadDurumSecici({
  id,
  durum,
}: {
  id: string;
  durum: LeadDurumu;
}) {
  const [deger, setDeger] = useState<LeadDurumu>(durum);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  function degistir(yeni: LeadDurumu) {
    const onceki = deger;
    setDeger(yeni);
    setHata(null);
    basla(async () => {
      const sonuc = await leadDurumuDegistir(id, yeni);
      if (!sonuc.ok) {
        setDeger(onceki);
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <span className="shrink-0">
      <select
        value={deger}
        onChange={(e) => degistir(e.target.value as LeadDurumu)}
        disabled={bekliyor}
        aria-label="Lead durumu"
        className="rounded-full border-2 border-cizgi bg-white px-3 py-1 text-xs font-semibold text-murekkep outline-none focus:border-yesil disabled:opacity-60"
      >
        {(Object.keys(LEAD_DURUM_ETIKET) as LeadDurumu[]).map((d) => (
          <option key={d} value={d}>
            {LEAD_DURUM_ETIKET[d]}
          </option>
        ))}
      </select>
      {hata && (
        <span role="alert" className="mt-1 block text-xs text-murekkep">
          {hata}
        </span>
      )}
    </span>
  );
}
