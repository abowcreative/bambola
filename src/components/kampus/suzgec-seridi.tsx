"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { DURUM_ETIKET, KURUM_ETIKET } from "@/lib/supabase/types";
import type { BasvuruDurumu } from "@/lib/supabase/types";
import { Ikon } from "@/components/ui/ikon";

/**
 * Durum sekmeleri, kurum suzgeci ve arama.
 *
 * Suzgec durumu ADRES CUBUGUNDA tutuluyor, bilesende degil: bir basvuruya
 * girip geri donuldugunde ayni liste geliyor ve ekran baskasina baglanti
 * olarak gonderilebiliyor.
 */

const SEKMELER: (BasvuruDurumu | "hepsi")[] = [
  "yeni",
  "arandi",
  "ulasilamadi",
  "kayit_oldu",
  "vazgecti",
  "hepsi",
];

const SEKME_ETIKET: Record<BasvuruDurumu | "hepsi", string> = {
  ...DURUM_ETIKET,
  hepsi: "Hepsi",
};

const KURUMLAR = ["hepsi", "oyun-evi", "anaokulu", "parti"] as const;

export function SuzgecSeridi({
  durum,
  kurum,
  ara,
  sayilar,
}: {
  durum: BasvuruDurumu | "hepsi";
  kurum: string;
  ara: string;
  sayilar: Record<BasvuruDurumu | "hepsi", number>;
}) {
  const yonlendirici = useRouter();
  const parametreler = useSearchParams();
  const [metin, setMetin] = useState(ara);
  const [, basla] = useTransition();

  function gitParametreyle(degisiklik: Record<string, string>) {
    const y = new URLSearchParams(parametreler.toString());
    for (const [k, v] of Object.entries(degisiklik)) {
      if (!v || v === "hepsi") y.delete(k);
      else y.set(k, v);
    }
    // Durum degisince arama korunuyor: iki suzgec birbirini silmemeli.
    basla(() => yonlendirici.push(`/kampus/basvurular?${y.toString()}`));
  }

  /*
    Arama yazarken her tusa istek atmamak icin bekleme. 350 ms yazma
    hizindan uzun, kullaniciyi bekletecek kadar da degil.
  */
  useEffect(() => {
    if (metin === ara) return;
    const z = setTimeout(() => gitParametreyle({ ara: metin }), 350);
    return () => clearTimeout(z);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metin]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {SEKMELER.map((s) => {
          const aktif = durum === s;
          const sayi = sayilar[s] ?? 0;
          return (
            <button
              key={s}
              type="button"
              onClick={() => gitParametreyle({ durum: s })}
              className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-1.5 font-baslik text-sm font-semibold transition-colors ${
                aktif
                  ? "border-yesil-koyu bg-yesil-koyu text-white"
                  : "border-cizgi bg-white text-murekkep-soluk hover:border-yesil hover:text-murekkep"
              }`}
            >
              {SEKME_ETIKET[s]}
              <span
                className={`rounded-full px-1.5 text-xs tabular-nums ${
                  aktif ? "bg-white/20" : "bg-krem-koyu text-murekkep"
                }`}
              >
                {sayi}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-murekkep-soluk">
            <Ikon.Mercek boyut={17} />
          </span>
          <input
            type="search"
            value={metin}
            onChange={(e) => setMetin(e.target.value)}
            placeholder="Veli, çocuk veya telefon"
            aria-label="Başvurularda ara"
            className="w-full rounded-full border-2 border-cizgi bg-white py-2 pl-10 pr-4 text-sm text-murekkep outline-none transition-colors placeholder:text-murekkep-soluk/70 focus:border-yesil"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-murekkep-soluk">
          <Ikon.Suzgec boyut={16} />
          <select
            value={kurum}
            onChange={(e) => gitParametreyle({ kurum: e.target.value })}
            aria-label="Kuruma göre süz"
            className="rounded-full border-2 border-cizgi bg-white px-3 py-2 text-sm font-medium text-murekkep outline-none focus:border-yesil"
          >
            {KURUMLAR.map((k) => (
              <option key={k} value={k}>
                {k === "hepsi"
                  ? "Bütün kurumlar"
                  : KURUM_ETIKET[k as keyof typeof KURUM_ETIKET]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
