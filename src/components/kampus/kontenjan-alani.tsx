"use client";

import { useState, useTransition } from "react";
import { kontenjanDegistir } from "@/lib/kampus/ogrenci-islemleri";
import { ALAN } from "./ui";

/**
 * Sinif kontenjani.
 *
 * `enAz` su anki kayitli ogrenci sayisi: kontenjani onun altina cekmek
 * tabloda tutarsizlik birakir (12 kisilik sinifta 15 kayit). Sunucu bunu
 * engellemiyor cunku kati bir kural degil, ama arayuz uyariyor.
 */
export function KontenjanAlani({
  sinifId,
  deger,
  enAz,
}: {
  sinifId: string;
  deger: number;
  enAz: number;
}) {
  const [sayi, setSayi] = useState(String(deger));
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  function kaydet() {
    const n = Number(sayi);
    if (!Number.isInteger(n) || n < 1) {
      setSayi(String(deger));
      setHata("Kontenjan en az 1 olmalı.");
      return;
    }
    if (n === deger) return;
    setHata(null);

    basla(async () => {
      const sonuc = await kontenjanDegistir(sinifId, n);
      if (!sonuc.ok) {
        setSayi(String(deger));
        setHata(sonuc.hata);
      }
    });
  }

  const altinda = Number(sayi) < enAz;

  return (
    <div>
      <input
        type="number"
        min={1}
        max={40}
        value={sayi}
        onChange={(e) => setSayi(e.target.value)}
        onBlur={kaydet}
        disabled={bekliyor}
        aria-label="Kontenjan"
        className={`${ALAN} w-24 tabular-nums`}
      />
      {altinda && (
        <p className="mt-1.5 text-xs text-uyari">
          Şu an {enAz} kayıtlı öğrenci var, kontenjan bunun altında kalıyor.
        </p>
      )}
      {hata && (
        <p role="alert" className="mt-1.5 text-xs text-tehlike">
          {hata}
        </p>
      )}
    </div>
  );
}
