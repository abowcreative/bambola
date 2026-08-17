"use client";

import { useState, useTransition } from "react";
import { duyuruYayinDegistir } from "@/lib/kampus/yoklama-islemleri";

/** Duyuruyu yayina alir veya taslaga cevirir. */
export function YayinAnahtari({
  id,
  yayinda,
}: {
  id: string;
  yayinda: boolean;
}) {
  const [acik, setAcik] = useState(yayinda);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  function degistir() {
    const yeni = !acik;
    setAcik(yeni);
    setHata(null);
    basla(async () => {
      const sonuc = await duyuruYayinDegistir(id, yeni);
      if (!sonuc.ok) {
        setAcik(!yeni);
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <span className="shrink-0">
      <button
        type="button"
        onClick={degistir}
        disabled={bekliyor}
        aria-pressed={acik}
        className={`rounded-full px-3.5 py-1 font-baslik text-xs font-bold transition-colors disabled:opacity-60 ${
          acik
            ? "bg-yesil-koyu text-white"
            : "border-2 border-cizgi bg-white text-murekkep-soluk hover:border-yesil"
        }`}
      >
        {acik ? "Yayında" : "Yayına al"}
      </button>
      {hata && (
        <span role="alert" className="mt-1 block text-xs text-murekkep">
          {hata}
        </span>
      )}
    </span>
  );
}
