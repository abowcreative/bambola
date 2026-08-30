"use client";

import { useState, useTransition } from "react";
import { yoklamaIsaretle } from "@/lib/kampus/yoklama-islemleri";
import {
  YOKLAMA_ETIKET,
  type YoklamaDurumu,
  type YoklamaKaydi,
} from "@/lib/kampus/yoklama-tipleri";
import { ogrenciAdi, type Ogrenci } from "@/lib/kampus/ogrenci-tipleri";
import { yasMetni, ayHesapla } from "@/lib/yas";
import { Ikon } from "@/components/ui/ikon";
import { Dugme, Rozet } from "./ui";

const SIRA: YoklamaDurumu[] = ["geldi", "gelmedi", "izinli", "telafi"];

/** Secili durumun dolu hali. Rozet tonlariyla ayni anlam, daha guclu zemin. */
const SECILI: Record<YoklamaDurumu, string> = {
  geldi: "bg-basari text-white",
  gelmedi: "bg-tehlike text-white",
  izinli: "bg-bilgi text-white",
  telafi: "bg-uyari text-white",
};

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
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-panel-soluk">
          {liste.length - isaretsiz}/{liste.length} işaretlendi
        </p>
        {isaretsiz > 0 && (
          <Dugme type="button" olcu="sm" onClick={hepsiGeldi}>
            <Ikon.Tik boyut={14} />
            Kalan {isaretsiz} kişiyi “geldi” yap
          </Dugme>
        )}
      </div>

      <ul className="divide-y divide-panel-cizgi border-y border-panel-cizgi">
        {liste.map(({ ogrenci }) => {
          const secili = isaretler[ogrenci.id];
          return (
            <li
              key={ogrenci.id}
              className={`px-1 py-2.5 transition-colors ${
                secili ? "" : "bg-uyari-zemin/40"
              }`}
            >
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-murekkep">
                    {ogrenciAdi(ogrenci)}
                  </span>
                  <span className="mt-0.5 block text-xs text-panel-soluk">
                    {yasMetni(ayHesapla(ogrenci.dogum_tarihi))}
                    {ogrenci.alerji && (
                      <>
                        {" · "}
                        <Rozet ton="uyari" className="align-middle">
                          alerji: {ogrenci.alerji}
                        </Rozet>
                      </>
                    )}
                  </span>
                </span>

                {/* Dort secenek tek serit: yoklama otuz satirda otuz kez
                    tekrar ediyor, her satirda ayni yerde durmasi lazim. */}
                <span
                  role="group"
                  aria-label={`${ogrenciAdi(ogrenci)} yoklaması`}
                  className="flex shrink-0 overflow-hidden rounded-panel-sm border border-panel-cizgi-guclu"
                >
                  {SIRA.map((d) => {
                    const aktif = secili === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => isaretle(ogrenci.id, d)}
                        aria-pressed={aktif}
                        className={`border-r border-panel-cizgi px-2.5 py-1.5 font-baslik text-xs font-bold transition-colors last:border-r-0 ${
                          aktif
                            ? SECILI[d]
                            : "bg-panel-yuzey text-panel-soluk hover:bg-panel-yuzey-alt hover:text-murekkep"
                        }`}
                      >
                        {YOKLAMA_ETIKET[d]}
                      </button>
                    );
                  })}
                </span>
              </div>

              {hatalar[ogrenci.id] && (
                <p role="alert" className="mt-1.5 text-xs text-tehlike">
                  {hatalar[ogrenci.id]}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-xs text-panel-silik">
        İşaretler anında kaydedilir; ayrı bir kaydetme adımı yok.
      </p>
    </div>
  );
}
