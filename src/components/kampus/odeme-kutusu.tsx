"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  odemeEkle,
  odemeGuncelle,
  odemeSil,
} from "@/lib/kampus/yoklama-islemleri";
import {
  YONTEM_ETIKET,
  bakiyeHesapla,
  type Odeme,
} from "@/lib/kampus/yoklama-tipleri";
import { Ikon } from "@/components/ui/ikon";
import { ALAN, AlanKutusu, Bildirim, Dugme, IkonDugme, Rozet } from "./ui";
import { Firildak, Kip, SilDugmesi } from "./ui-istemci";

/** Basit TL bicimi. Sunucu tarafiyla ayni gorunum. */
const tl = (n: number) =>
  `₺${n.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}`;

const kisaTarih = (t: string) =>
  new Date(t).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
  });

type Alanlar = {
  tur: "borc" | "tahsilat";
  tutar: string;
  tarih: string;
  vade: string;
  yontem: string;
  aciklama: string;
};

/**
 * Borc/tahsilat alanlari. Ekleme formu ve duzeltme kipi ayni alanlari
 * kullaniyor; iki ayri kopya tutmak, birinde yapilan degisikligin otekine
 * gecmemesi demekti.
 */
function HareketAlanlari({
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
  return (
    <>
      <div className="flex overflow-hidden rounded-panel-sm border border-panel-cizgi-guclu">
        {(["tahsilat", "borc"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setD((s) => ({ ...s, tur: t }))}
            aria-pressed={d.tur === t}
            disabled={bekliyor}
            className={`flex-1 border-r border-panel-cizgi px-3 py-1.5 font-baslik text-sm font-semibold transition-colors last:border-r-0 ${
              d.tur === t
                ? t === "tahsilat"
                  ? "bg-basari text-white"
                  : "bg-uyari text-white"
                : "bg-panel-yuzey text-panel-soluk hover:bg-panel-yuzey-alt hover:text-murekkep"
            }`}
          >
            {t === "tahsilat" ? "Tahsilat" : "Borç"}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <AlanKutusu etiket="Tutar (TL)" htmlFor={`${onek}-tutar`} gerekli>
          <input
            id={`${onek}-tutar`}
            type="number"
            min={1}
            step={1}
            required
            value={d.tutar}
            onChange={(e) => setD((s) => ({ ...s, tutar: e.target.value }))}
            disabled={bekliyor}
            className={`${ALAN} tabular-nums`}
          />
        </AlanKutusu>
        <AlanKutusu etiket="Tarih" htmlFor={`${onek}-tarih`} gerekli>
          <input
            id={`${onek}-tarih`}
            type="date"
            required
            value={d.tarih}
            onChange={(e) => setD((s) => ({ ...s, tarih: e.target.value }))}
            disabled={bekliyor}
            className={ALAN}
          />
        </AlanKutusu>
      </div>

      {d.tur === "borc" ? (
        <AlanKutusu
          etiket="Vade"
          htmlFor={`${onek}-vade`}
          ipucu="Vadesi geçen borç tahsilat listesinde kırmızı çıkar."
        >
          <input
            id={`${onek}-vade`}
            type="date"
            value={d.vade}
            onChange={(e) => setD((s) => ({ ...s, vade: e.target.value }))}
            disabled={bekliyor}
            className={ALAN}
          />
        </AlanKutusu>
      ) : (
        <AlanKutusu etiket="Yöntem" htmlFor={`${onek}-yontem`}>
          <select
            id={`${onek}-yontem`}
            value={d.yontem}
            onChange={(e) => setD((s) => ({ ...s, yontem: e.target.value }))}
            disabled={bekliyor}
            className={ALAN}
          >
            {Object.entries(YONTEM_ETIKET).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </AlanKutusu>
      )}

      <AlanKutusu etiket="Açıklama" htmlFor={`${onek}-aciklama`}>
        <input
          id={`${onek}-aciklama`}
          value={d.aciklama}
          onChange={(e) => setD((s) => ({ ...s, aciklama: e.target.value }))}
          disabled={bekliyor}
          className={ALAN}
          placeholder={
            d.tur === "borc" ? "Eylül ayda 8 katılım" : "Eylül tahsilatı"
          }
        />
      </AlanKutusu>
    </>
  );
}

/** Tek bir hareketi duzeltir. Yanlis girilmis tutar geri alinabilsin. */
function HareketDuzelt({
  ogrenciId,
  hareket,
}: {
  ogrenciId: string;
  hareket: Odeme;
}) {
  const yonlendirici = useRouter();
  const [acik, setAcik] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  const [d, setD] = useState<Alanlar>({
    tur: hareket.tur as "borc" | "tahsilat",
    tutar: String(hareket.tutar),
    tarih: hareket.tarih,
    vade: hareket.vade ?? "",
    yontem: hareket.yontem ?? "nakit",
    aciklama: hareket.aciklama ?? "",
  });

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);
    basla(async () => {
      const sonuc = await odemeGuncelle(hareket.id, { ogrenciId, ...d });
      if (sonuc.ok) {
        setAcik(false);
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <>
      <IkonDugme baslik="Hareketi düzelt" onClick={() => setAcik(true)}>
        <Ikon.Not boyut={14} />
      </IkonDugme>

      <Kip
        acik={acik}
        kapat={() => setAcik(false)}
        genislik="30rem"
        baslik="Cari hareketi düzelt"
      >
        <form onSubmit={gonder} className="space-y-3">
          <HareketAlanlari
            onek={`hd-${hareket.id}`}
            d={d}
            setD={setD}
            bekliyor={bekliyor}
          />

          {hata && <Bildirim ton="tehlike">{hata}</Bildirim>}

          <div className="flex items-center justify-between gap-2 border-t border-panel-cizgi pt-4">
            <SilDugmesi
              etiket="Sil"
              onayEtiketi="Kalıcı olarak sil"
              islem={() => odemeSil(hareket.id)}
              tamamlandi={() => setAcik(false)}
            />
            <span className="flex gap-2">
              <Dugme
                type="button"
                onClick={() => setAcik(false)}
                disabled={bekliyor}
              >
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

/**
 * Ogrencinin cari hareketleri ve yeni kayit.
 *
 * Borc ve tahsilat AYNI FORMLA giriliyor, `tur` secimiyle: iki ayri form
 * ekrani ikiye boluyor ve alanlarin cogu ayni.
 */
export function OdemeKutusu({
  ogrenciId,
  hareketler,
}: {
  ogrenciId: string;
  hareketler: Odeme[];
}) {
  const yonlendirici = useRouter();
  const bugun = new Date().toLocaleDateString("en-CA");

  const [d, setD] = useState<Alanlar>({
    tur: "tahsilat",
    tutar: "",
    tarih: bugun,
    vade: "",
    yontem: "nakit",
    aciklama: "",
  });
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  const { borc, tahsilat, bakiye } = bakiyeHesapla(hareketler);

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);
    basla(async () => {
      const sonuc = await odemeEkle({ ogrenciId, ...d });
      if (sonuc.ok) {
        setD((s) => ({ ...s, tutar: "", aciklama: "", vade: "" }));
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-3 gap-3">
        {(
          [
            ["Tahakkuk", tl(borc), "text-murekkep"],
            ["Tahsilat", tl(tahsilat), "text-basari"],
            [
              "Bakiye",
              tl(bakiye),
              bakiye > 0 ? "text-uyari" : "text-panel-soluk",
            ],
          ] as const
        ).map(([etiket, deger, renk]) => (
          <div
            key={etiket}
            className="rounded-panel-sm border border-panel-cizgi bg-panel-yuzey-alt px-3 py-2"
          >
            <dt className="text-xs font-medium text-panel-soluk">{etiket}</dt>
            <dd
              className={`mt-0.5 font-baslik text-base font-bold tabular-nums ${renk}`}
            >
              {deger}
            </dd>
          </div>
        ))}
      </dl>

      {hareketler.length > 0 && (
        <ul className="divide-y divide-panel-cizgi border-y border-panel-cizgi">
          {hareketler.map((h) => (
            <li
              key={h.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2"
            >
              <span className="w-12 shrink-0 tabular-nums text-xs text-panel-silik">
                {kisaTarih(h.tarih)}
              </span>
              <Rozet ton={h.tur === "borc" ? "uyari" : "basari"}>
                {h.tur === "borc" ? "Borç" : "Tahsilat"}
              </Rozet>
              <span className="min-w-0 flex-1 truncate text-xs text-panel-soluk">
                {h.aciklama ?? (h.yontem ? YONTEM_ETIKET[h.yontem] : "") ?? ""}
                {h.vade && ` · vade ${kisaTarih(h.vade)}`}
              </span>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-murekkep">
                {tl(h.tutar)}
              </span>
              <HareketDuzelt ogrenciId={ogrenciId} hareket={h} />
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={gonder} className="space-y-3">
        <HareketAlanlari onek="oe" d={d} setD={setD} bekliyor={bekliyor} />

        {hata && <Bildirim ton="tehlike">{hata}</Bildirim>}

        <Dugme
          type="submit"
          gorunum="birincil"
          disabled={bekliyor || !d.tutar}
          className="w-full"
        >
          {bekliyor && <Firildak />}
          {bekliyor ? "Kaydediliyor…" : "Hareket ekle"}
        </Dugme>
      </form>
    </div>
  );
}
