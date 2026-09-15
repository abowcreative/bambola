"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  giderEkle,
  giderGuncelle,
  giderSil,
  suKartiKaydet,
} from "@/lib/kampus/defter-islemleri";
import type { Gider, SuKarti } from "@/lib/kampus/defter-tipleri";
import { Ikon } from "@/components/ui/ikon";
import { ALAN, AlanKutusu, Bildirim, Dugme } from "./ui";
import { Firildak, Kip, SilDugmesi } from "./ui-istemci";

/**
 * Gider (elden odeme) ve su karti formlari. Excel'deki "ELDEN VERDIGIMIZ
 * ODEMELER" sayfasinin uc sutunu: tarih, tutar, aciklama; bir de sagdaki
 * serbest not.
 */

const bugun = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });

type Alanlar = { tarih: string; tutar: string; aciklama: string; ekNot: string };

function GiderAlanlari({
  onek,
  d,
  setD,
  bekliyor,
}: {
  onek: string;
  d: Alanlar;
  setD: (f: (s: Alanlar) => Alanlar) => void;
  bekliyor: boolean;
}) {
  const yaz = (alan: keyof Alanlar) => (e: { target: { value: string } }) =>
    setD((s) => ({ ...s, [alan]: e.target.value }));
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <AlanKutusu etiket="Tarih" htmlFor={`${onek}-tarih`} gerekli>
          <input id={`${onek}-tarih`} type="date" required value={d.tarih} onChange={yaz("tarih")} disabled={bekliyor} className={ALAN} />
        </AlanKutusu>
        <AlanKutusu etiket="Tutar (TL)" htmlFor={`${onek}-tutar`} gerekli>
          <input id={`${onek}-tutar`} type="number" min={0} step={1} required value={d.tutar} onChange={yaz("tutar")} disabled={bekliyor} className={`${ALAN} tabular-nums`} />
        </AlanKutusu>
      </div>
      <AlanKutusu etiket="Açıklama" htmlFor={`${onek}-aciklama`} gerekli>
        <input id={`${onek}-aciklama`} required value={d.aciklama} onChange={yaz("aciklama")} disabled={bekliyor} className={ALAN} placeholder="SU PARASI KART YÜKLEME" />
      </AlanKutusu>
      <AlanKutusu etiket="Ek not" htmlFor={`${onek}-not`}>
        <input id={`${onek}-not`} value={d.ekNot} onChange={yaz("ekNot")} disabled={bekliyor} className={ALAN} />
      </AlanKutusu>
    </>
  );
}

export function GiderFormu({ gider }: { gider?: Gider }) {
  const yonlendirici = useRouter();
  const [acik, setAcik] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();
  const bos = (): Alanlar => ({
    tarih: gider?.tarih ?? bugun(),
    tutar: gider ? String(gider.tutar) : "",
    aciklama: gider?.aciklama ?? "",
    ekNot: gider?.ek_not ?? "",
  });
  const [d, setD] = useState<Alanlar>(bos);

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);
    basla(async () => {
      const girdi = { ...d, tutar: Number(d.tutar) };
      const sonuc = gider ? await giderGuncelle(gider.id, girdi) : await giderEkle(girdi);
      if (sonuc.ok) {
        setAcik(false);
        if (!gider) setD(bos());
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <>
      {gider ? (
        <button
          type="button"
          onClick={() => setAcik(true)}
          title="Gideri düzelt"
          aria-label="Gideri düzelt"
          className="grid size-7 place-items-center rounded-panel-sm text-panel-silik transition-colors hover:bg-panel-yuzey-alt hover:text-murekkep"
        >
          <Ikon.Not boyut={14} />
        </button>
      ) : (
        <Dugme type="button" gorunum="birincil" onClick={() => setAcik(true)}>
          <Ikon.Rozet boyut={16} />
          Gider ekle
        </Dugme>
      )}

      <Kip
        acik={acik}
        kapat={() => setAcik(false)}
        genislik="34rem"
        baslik={gider ? "Gideri düzelt" : "Yeni gider"}
        aciklama={gider?.kaynak === "excel" ? `Excel “ELDEN VERDİĞİMİZ ÖDEMELER” ${gider.kaynak_satir}. satır.` : "Elden verilen ödeme, market, su, süsleme, prim."}
      >
        <form onSubmit={gonder} className="space-y-4">
          <GiderAlanlari onek={gider ? `gd-${gider.id}` : "ge"} d={d} setD={setD} bekliyor={bekliyor} />
          {hata && <Bildirim ton="tehlike">{hata}</Bildirim>}
          <div className="flex items-center justify-between gap-2 border-t border-panel-cizgi pt-4">
            {gider ? (
              <SilDugmesi etiket="Sil" onayEtiketi="Kalıcı olarak sil" islem={() => giderSil(gider.id)} tamamlandi={() => setAcik(false)} />
            ) : (
              <span />
            )}
            <span className="flex gap-2">
              <Dugme type="button" onClick={() => setAcik(false)} disabled={bekliyor}>
                Vazgeç
              </Dugme>
              <Dugme type="submit" gorunum="birincil" disabled={bekliyor}>
                {bekliyor && <Firildak />}
                Kaydet
              </Dugme>
            </span>
          </div>
        </form>
      </Kip>
    </>
  );
}

/* --------------------------------------------------------------- su karti */

export function SuKartiFormu({ satir }: { satir?: SuKarti }) {
  const yonlendirici = useRouter();
  const [acik, setAcik] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();
  const [d, setD] = useState({
    etiket: satir?.etiket ?? "",
    tarih: satir?.tarih ?? "",
    tl: satir?.tl === null || satir?.tl === undefined ? "" : String(satir.tl),
    stok: satir?.stok === null || satir?.stok === undefined ? "" : String(satir.stok),
  });
  const yaz = (alan: keyof typeof d) => (e: { target: { value: string } }) =>
    setD((s) => ({ ...s, [alan]: e.target.value }));

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);
    basla(async () => {
      const sonuc = await suKartiKaydet(satir?.id ?? null, {
        etiket: d.etiket,
        tarih: d.tarih,
        tl: d.tl === "" ? "" : Number(d.tl),
        stok: d.stok === "" ? "" : Number(d.stok),
      });
      if (sonuc.ok) {
        setAcik(false);
        yonlendirici.refresh();
      } else setHata(sonuc.hata);
    });
  }

  return (
    <>
      <Dugme type="button" olcu="sm" gorunum={satir ? "sessiz" : "ikincil"} onClick={() => setAcik(true)}>
        <Ikon.Not boyut={13} />
        {satir ? "Düzelt" : "Satır ekle"}
      </Dugme>
      <Kip acik={acik} kapat={() => setAcik(false)} genislik="30rem" baslik="Su kartı">
        <form onSubmit={gonder} className="space-y-4">
          <AlanKutusu etiket="Etiket" htmlFor="su-etiket" gerekli>
            <input id="su-etiket" required value={d.etiket} onChange={yaz("etiket")} disabled={bekliyor} className={ALAN} placeholder="En son su yükleme tarihi" />
          </AlanKutusu>
          <div className="grid gap-3 sm:grid-cols-3">
            <AlanKutusu etiket="Tarih" htmlFor="su-tarih">
              <input id="su-tarih" type="date" value={d.tarih} onChange={yaz("tarih")} disabled={bekliyor} className={ALAN} />
            </AlanKutusu>
            <AlanKutusu etiket="TL" htmlFor="su-tl">
              <input id="su-tl" type="number" step={1} value={d.tl} onChange={yaz("tl")} disabled={bekliyor} className={`${ALAN} tabular-nums`} />
            </AlanKutusu>
            <AlanKutusu etiket="Stok" htmlFor="su-stok">
              <input id="su-stok" type="number" step={1} value={d.stok} onChange={yaz("stok")} disabled={bekliyor} className={`${ALAN} tabular-nums`} />
            </AlanKutusu>
          </div>
          {hata && <Bildirim ton="tehlike">{hata}</Bildirim>}
          <div className="flex justify-end gap-2 border-t border-panel-cizgi pt-4">
            <Dugme type="button" onClick={() => setAcik(false)} disabled={bekliyor}>
              Vazgeç
            </Dugme>
            <Dugme type="submit" gorunum="birincil" disabled={bekliyor}>
              {bekliyor && <Firildak />}
              Kaydet
            </Dugme>
          </div>
        </form>
      </Kip>
    </>
  );
}
