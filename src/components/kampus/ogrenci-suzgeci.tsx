"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
/* Tipler `ogrenci-tipleri` icinden: `ogrenciler` server-only ve buradan
   import edilse butun veri erisim katmani tarayici paketine girerdi. */
import { OGRENCI_DURUM_ETIKET } from "@/lib/kampus/ogrenci-tipleri";
import type { OgrenciDurumu } from "@/lib/kampus/ogrenci-tipleri";
import { Ikon } from "@/components/ui/ikon";

const SEKMELER: (OgrenciDurumu | "hepsi")[] = [
  "aktif",
  "aday",
  "dondurdu",
  "ayrildi",
  "hepsi",
];

const ETIKET: Record<OgrenciDurumu | "hepsi", string> = {
  ...OGRENCI_DURUM_ETIKET,
  hepsi: "Hepsi",
};

/** Durum sekmeleri ve arama. Basvurulardaki suzgecle ayni davranis. */
export function OgrenciSuzgeci({
  durum,
  ara,
}: {
  durum: OgrenciDurumu | "hepsi";
  ara: string;
}) {
  const yonlendirici = useRouter();
  const parametreler = useSearchParams();
  const [metin, setMetin] = useState(ara);
  const [, basla] = useTransition();

  function git(degisiklik: Record<string, string>) {
    const y = new URLSearchParams(parametreler.toString());
    for (const [k, v] of Object.entries(degisiklik)) {
      if (!v || v === "aktif") y.delete(k);
      else y.set(k, v);
    }
    basla(() => yonlendirici.push(`/kampus/ogrenciler?${y.toString()}`));
  }

  useEffect(() => {
    if (metin === ara) return;
    const z = setTimeout(() => git({ ara: metin }), 350);
    return () => clearTimeout(z);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metin]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {SEKMELER.map((s) => {
          const aktif = durum === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => git({ durum: s })}
              className={`rounded-full border-2 px-4 py-1.5 font-baslik text-sm font-semibold transition-colors ${
                aktif
                  ? "border-yesil-koyu bg-yesil-koyu text-white"
                  : "border-cizgi bg-white text-murekkep-soluk hover:border-yesil hover:text-murekkep"
              }`}
            >
              {ETIKET[s]}
            </button>
          );
        })}
      </div>

      <div className="relative max-w-xs">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-murekkep-soluk">
          <Ikon.Mercek boyut={17} />
        </span>
        <input
          type="search"
          value={metin}
          onChange={(e) => setMetin(e.target.value)}
          placeholder="Ad veya soyad"
          aria-label="Öğrencilerde ara"
          className="w-full rounded-full border-2 border-cizgi bg-white py-2 pl-10 pr-4 text-sm text-murekkep outline-none focus:border-yesil"
        />
      </div>
    </div>
  );
}
