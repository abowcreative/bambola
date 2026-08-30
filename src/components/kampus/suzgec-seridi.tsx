"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useTransition } from "react";
import { DURUM_ETIKET, KURUM_ETIKET } from "@/lib/supabase/types";
import type { BasvuruDurumu } from "@/lib/supabase/types";
import { Ikon } from "@/components/ui/ikon";
import { ALAN, SekmeSeridi } from "./ui";
import { AramaKutusu } from "./ui-istemci";

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
  const [, basla] = useTransition();

  function adres(degisiklik: Record<string, string>): string {
    const y = new URLSearchParams(parametreler.toString());
    for (const [k, v] of Object.entries(degisiklik)) {
      // "yeni" durumun, "hepsi" kurumun varsayilani: adreste yer kaplamiyor.
      if (!v || v === "hepsi") y.delete(k);
      else y.set(k, v);
    }
    const sorgu = y.toString();
    return sorgu ? `/kampus/basvurular?${sorgu}` : "/kampus/basvurular";
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SekmeSeridi
        sekmeler={SEKMELER.map((s) => ({
          anahtar: s,
          etiket: SEKME_ETIKET[s],
          yol: adres({ durum: s }),
          sayi: sayilar[s] ?? 0,
          aktif: durum === s,
        }))}
      />

      <AramaKutusu
        yol="/kampus/basvurular"
        deger={ara}
        yerTutucu="Veli, çocuk veya telefon"
        etiket="Başvurularda ara"
        className="min-w-0 flex-1 sm:max-w-64"
      />

      <label className="flex shrink-0 items-center gap-2 text-sm text-panel-soluk">
        <Ikon.Suzgec boyut={15} className="text-panel-silik" />
        <select
          value={kurum}
          onChange={(e) =>
            basla(() => yonlendirici.push(adres({ kurum: e.target.value })))
          }
          aria-label="Kuruma göre süz"
          className={`${ALAN} h-9 w-auto py-0`}
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
  );
}
