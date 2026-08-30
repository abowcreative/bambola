"use client";

import { useState, useTransition } from "react";
import { dersDurumuDegistir, dersSil } from "@/lib/kampus/yoklama-islemleri";
import {
  DERS_DURUM_ETIKET,
  type DersDurumu as Durum,
} from "@/lib/kampus/yoklama-tipleri";
import { Ikon } from "@/components/ui/ikon";
import { ALAN, Etiket, Dugme } from "./ui";
import { Firildak, SilDugmesi } from "./ui-istemci";

const SIRA: Durum[] = ["planli", "islendi", "iptal"];

const SECILI: Record<Durum, string> = {
  planli: "bg-bilgi text-white",
  islendi: "bg-basari text-white",
  iptal: "bg-panel-soluk text-white",
};

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
  silinebilir = false,
}: {
  dersId: string;
  durum: Durum;
  konu: string | null;
  /** Yalniz yoneticide ve yoklamasi alinmamis derste. */
  silinebilir?: boolean;
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
      <div>
        <Etiket>Durum</Etiket>
        <div className="flex overflow-hidden rounded-panel-sm border border-panel-cizgi-guclu">
          {SIRA.map((d) => {
            const aktif = secili === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => kaydet(d)}
                aria-pressed={aktif}
                disabled={bekliyor}
                className={`flex-1 border-r border-panel-cizgi px-3 py-1.5 font-baslik text-sm font-semibold transition-colors last:border-r-0 disabled:opacity-60 ${
                  aktif
                    ? SECILI[d]
                    : "bg-panel-yuzey text-panel-soluk hover:bg-panel-yuzey-alt hover:text-murekkep"
                }`}
              >
                {DERS_DURUM_ETIKET[d]}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Etiket htmlFor="konu">Ne yapıldı</Etiket>
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
          className={`${ALAN} resize-y`}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <Dugme
            type="button"
            gorunum="birincil"
            olcu="sm"
            onClick={() => kaydet()}
            disabled={bekliyor}
          >
            {bekliyor && <Firildak />}
            {bekliyor ? "Kaydediliyor…" : "Kaydet"}
          </Dugme>
          {kaydedildi && !bekliyor && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-basari">
              <Ikon.Tik boyut={13} />
              Kaydedildi
            </span>
          )}
        </span>

        {silinebilir && (
          <SilDugmesi
            etiket="Dersi sil"
            onayEtiketi="Kalıcı olarak sil"
            islem={() => dersSil(dersId)}
          />
        )}
      </div>

      {hata && (
        <p role="alert" className="text-xs font-medium text-tehlike">
          {hata}
        </p>
      )}
    </div>
  );
}
