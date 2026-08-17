"use client";

import { useState, useTransition } from "react";
import { dersDurumuDegistir } from "@/lib/kampus/yoklama-islemleri";
import {
  DERS_DURUM_ETIKET,
  type DersDurumu as Durum,
} from "@/lib/kampus/yoklama-tipleri";
import { Buton } from "@/components/ui/buton";

const SIRA: Durum[] = ["planli", "islendi", "iptal"];

/**
 * Ders islendi mi ve ne yapildi.
 *
 * Konu alani ayni kaydetme ile gidiyor: "islendi" isaretleyip konuyu
 * yazmadan cikmak en sik yapilan sey, tek dugme ikisini birlikte tutuyor.
 */
export function DersDurumu({
  dersId,
  durum,
  konu,
}: {
  dersId: string;
  durum: Durum;
  konu: string | null;
}) {
  const [secili, setSecili] = useState<Durum>(durum);
  const [metin, setMetin] = useState(konu ?? "");
  const [hata, setHata] = useState<string | null>(null);
  const [kaydedildi, setKaydedildi] = useState(false);
  const [bekliyor, basla] = useTransition();

  function kaydet(yeniDurum?: Durum) {
    const d = yeniDurum ?? secili;
    setSecili(d);
    setHata(null);
    setKaydedildi(false);

    basla(async () => {
      const sonuc = await dersDurumuDegistir(dersId, d, metin.trim());
      if (sonuc.ok) setKaydedildi(true);
      else {
        setSecili(durum);
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {SIRA.map((d) => {
          const aktif = secili === d;
          return (
            <button
              key={d}
              type="button"
              onClick={() => kaydet(d)}
              aria-pressed={aktif}
              disabled={bekliyor}
              className={`rounded-full px-3.5 py-1.5 font-baslik text-sm font-semibold transition-colors ${
                aktif
                  ? d === "islendi"
                    ? "bg-yesil-koyu text-white"
                    : d === "iptal"
                      ? "bg-cizgi text-murekkep-soluk"
                      : "bg-krem-koyu text-murekkep"
                  : "border-2 border-cizgi bg-white text-murekkep-soluk hover:border-yesil hover:text-murekkep"
              }`}
            >
              {DERS_DURUM_ETIKET[d]}
            </button>
          );
        })}
      </div>

      <div>
        <label
          htmlFor="konu"
          className="mb-1.5 block text-sm text-murekkep-soluk"
        >
          Ne yapıldı
        </label>
        <textarea
          id="konu"
          rows={3}
          value={metin}
          onChange={(e) => {
            setMetin(e.target.value);
            setKaydedildi(false);
          }}
          maxLength={500}
          placeholder="Duyusal oyun, parmak boyası, ritim çalışması"
          className="w-full resize-y rounded-yumusak border-2 border-cizgi bg-white px-3.5 py-2.5 text-sm text-murekkep outline-none transition-colors placeholder:text-murekkep-soluk/60 focus:border-yesil"
        />
      </div>

      <div className="flex items-center gap-3">
        <Buton
          type="button"
          olcu="sm"
          onClick={() => kaydet()}
          disabled={bekliyor}
        >
          {bekliyor ? "Kaydediliyor..." : "Kaydet"}
        </Buton>
        {kaydedildi && !bekliyor && (
          <span className="text-sm text-yesil-koyu">Kaydedildi</span>
        )}
      </div>

      {hata && (
        <p role="alert" className="text-sm text-murekkep">
          {hata}
        </p>
      )}
    </div>
  );
}
