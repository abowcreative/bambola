"use client";

import { useState, useTransition } from "react";
import { yoklamaIsaretle } from "@/lib/kampus/yoklama-islemleri";
import {
  YOKLAMA_ETIKET,
  YOKLAMA_RENGI,
  type YoklamaDurumu,
  type YoklamaKaydi,
} from "@/lib/kampus/yoklama-tipleri";
import { ogrenciAdi, type Ogrenci } from "@/lib/kampus/ogrenci-tipleri";
import { yasMetni, ayHesapla } from "@/lib/yas";
import { Ikon } from "@/components/ui/ikon";

const SIRA: YoklamaDurumu[] = ["geldi", "gelmedi", "izinli", "telafi"];

/**
 * Yoklama isaretleme.
 *
 * Isaret ANINDA gosteriliyor, sunucudan cevap beklenmeden: yoklama otuz
 * cocuk icin otuz tiklama demek ve her birinde yarim saniye beklemek isi
 * cekilmez hale getirir. Hata olursa o satir eski haline donuyor.
 */
export function YoklamaListesi({
  dersId,
  liste,
}: {
  dersId: string;
  liste: { ogrenci: Ogrenci; isaret: YoklamaKaydi | null }[];
}) {
  const [isaretler, setIsaretler] = useState<
    Record<string, YoklamaDurumu | null>
  >(
    Object.fromEntries(
      liste.map((x) => [x.ogrenci.id, x.isaret?.durum ?? null]),
    ),
  );
  const [hatalar, setHatalar] = useState<Record<string, string>>({});
  const [, basla] = useTransition();

  function isaretle(ogrenciId: string, durum: YoklamaDurumu) {
    const onceki = isaretler[ogrenciId] ?? null;
    setIsaretler((s) => ({ ...s, [ogrenciId]: durum }));
    setHatalar((h) => {
      const { [ogrenciId]: _, ...kalan } = h;
      void _;
      return kalan;
    });

    basla(async () => {
      const sonuc = await yoklamaIsaretle(dersId, ogrenciId, durum);
      if (!sonuc.ok) {
        setIsaretler((s) => ({ ...s, [ogrenciId]: onceki }));
        setHatalar((h) => ({ ...h, [ogrenciId]: sonuc.hata }));
      }
    });
  }

  /** Hepsini "geldi" isaretler. Cogu gun cogu cocuk geliyor. */
  function hepsiGeldi() {
    for (const x of liste) {
      if (!isaretler[x.ogrenci.id]) isaretle(x.ogrenci.id, "geldi");
    }
  }

  const isaretsiz = liste.filter((x) => !isaretler[x.ogrenci.id]).length;

  return (
    <div>
      {isaretsiz > 0 && (
        <button
          type="button"
          onClick={hepsiGeldi}
          className="mb-4 inline-flex items-center gap-1.5 rounded-full border-2 border-cizgi bg-white px-4 py-1.5 font-baslik text-sm font-semibold text-murekkep transition-colors hover:border-yesil"
        >
          <Ikon.Tik boyut={15} />
          İşaretlenmeyen {isaretsiz} kişiyi &quot;geldi&quot; yap
        </button>
      )}

      <ul className="space-y-2">
        {liste.map(({ ogrenci }) => {
          const secili = isaretler[ogrenci.id];
          return (
            <li
              key={ogrenci.id}
              className={`rounded-kart border-2 px-4 py-3 ${
                secili ? "border-cizgi" : "border-dashed border-cizgi"
              }`}
            >
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="min-w-0 flex-1">
                  <span className="block font-baslik text-sm font-bold text-murekkep">
                    {ogrenciAdi(ogrenci)}
                  </span>
                  <span className="mt-0.5 block text-xs text-murekkep-soluk">
                    {yasMetni(ayHesapla(ogrenci.dogum_tarihi))}
                    {ogrenci.alerji && ` · alerji: ${ogrenci.alerji}`}
                  </span>
                </span>

                <span className="flex shrink-0 flex-wrap gap-1.5">
                  {SIRA.map((d) => {
                    const aktif = secili === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => isaretle(ogrenci.id, d)}
                        aria-pressed={aktif}
                        className={`rounded-full px-3 py-1 font-baslik text-xs font-bold transition-colors ${
                          aktif
                            ? YOKLAMA_RENGI[d]
                            : "border-2 border-cizgi bg-white text-murekkep-soluk hover:border-yesil hover:text-murekkep"
                        }`}
                      >
                        {YOKLAMA_ETIKET[d]}
                      </button>
                    );
                  })}
                </span>
              </div>

              {hatalar[ogrenci.id] && (
                <p role="alert" className="mt-1.5 text-xs text-murekkep">
                  {hatalar[ogrenci.id]}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
