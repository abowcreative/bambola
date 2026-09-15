"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  dogumGunuEkle,
  dogumGunuGuncelle,
  dogumGunuSil,
  type PartiGirdisi,
} from "@/lib/kampus/defter-islemleri";
import type { DogumGunuPartisi } from "@/lib/kampus/defter-tipleri";
import { Ikon } from "@/components/ui/ikon";
import { ALAN, AlanKutusu, Bildirim, Dugme } from "./ui";
import { Firildak, Kip, SilDugmesi } from "./ui-istemci";

/**
 * Dogum gunu organizasyonu formu. Excel "DOGUM GUNU" sayfasinin on alti
 * sutunu, ayni sirayla: cocuk, veli, telefon, yas, dogum gunu, kapora,
 * organizasyon gunu, saat, anlasilan fiyat, kalan odeme, cocuk sayisi,
 * yetiskin sayisi, yemek, susleme, mahalle, aciklama.
 */

type Alanlar = Record<
  | "cocukAdi"
  | "veliAdi"
  | "telefon"
  | "cocukYas"
  | "dogumGunu"
  | "kapora"
  | "organizasyonTarihi"
  | "saat"
  | "anlasilanFiyat"
  | "kalanOdeme"
  | "cocukSayisi"
  | "yetiskinSayisi"
  | "yemek"
  | "susleme"
  | "mahalle"
  | "aciklama"
  | "ekNot",
  string
>;

const s = (v: string | number | null | undefined) =>
  v === null || v === undefined ? "" : String(v);

function bosAlanlar(p?: DogumGunuPartisi): Alanlar {
  return {
    cocukAdi: s(p?.cocuk_adi),
    veliAdi: s(p?.veli_adi),
    telefon: s(p?.telefon),
    cocukYas: s(p?.cocuk_yas),
    dogumGunu: s(p?.dogum_gunu),
    kapora: s(p?.kapora),
    organizasyonTarihi: s(p?.organizasyon_tarihi),
    saat: s(p?.saat),
    anlasilanFiyat: s(p?.anlasilan_fiyat),
    kalanOdeme: s(p?.kalan_odeme),
    cocukSayisi: s(p?.cocuk_sayisi),
    yetiskinSayisi: s(p?.yetiskin_sayisi),
    yemek: s(p?.yemek),
    susleme: s(p?.susleme),
    mahalle: s(p?.mahalle),
    aciklama: s(p?.aciklama),
    ekNot: s(p?.ek_not),
  };
}

function girdiyeCevir(d: Alanlar): PartiGirdisi {
  const sayi = (v: string) => (v === "" ? "" : Number(v));
  return {
    ...d,
    kapora: sayi(d.kapora),
    anlasilanFiyat: sayi(d.anlasilanFiyat),
    kalanOdeme: sayi(d.kalanOdeme),
    cocukSayisi: sayi(d.cocukSayisi),
    yetiskinSayisi: sayi(d.yetiskinSayisi),
  };
}

export function PartiFormu({ parti }: { parti?: DogumGunuPartisi }) {
  const yonlendirici = useRouter();
  const [acik, setAcik] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();
  const [d, setD] = useState<Alanlar>(() => bosAlanlar(parti));
  const onek = parti ? `pt-${parti.id}` : "pt";

  const yaz = (alan: keyof Alanlar) => (e: { target: { value: string } }) =>
    setD((x) => ({ ...x, [alan]: e.target.value }));

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);
    basla(async () => {
      const girdi = girdiyeCevir(d);
      const sonuc = parti ? await dogumGunuGuncelle(parti.id, girdi) : await dogumGunuEkle(girdi);
      if (sonuc.ok) {
        setAcik(false);
        if (!parti) setD(bosAlanlar());
        yonlendirici.refresh();
      } else setHata(sonuc.hata);
    });
  }

  const metin = (alan: keyof Alanlar, etiket: string, ek?: { tur?: string; sinif?: string; ipucu?: string; yer?: string }) => (
    <AlanKutusu etiket={etiket} htmlFor={`${onek}-${alan}`} className={ek?.sinif} ipucu={ek?.ipucu}>
      <input
        id={`${onek}-${alan}`}
        type={ek?.tur ?? "text"}
        step={ek?.tur === "number" ? 1 : undefined}
        value={d[alan]}
        onChange={yaz(alan)}
        disabled={bekliyor}
        className={`${ALAN} ${ek?.tur === "number" ? "tabular-nums" : ""}`}
        placeholder={ek?.yer}
      />
    </AlanKutusu>
  );

  const secim = (alan: keyof Alanlar, etiket: string) => (
    <AlanKutusu etiket={etiket} htmlFor={`${onek}-${alan}`}>
      <select id={`${onek}-${alan}`} value={d[alan]} onChange={yaz(alan)} disabled={bekliyor} className={ALAN}>
        <option value="">—</option>
        {["VAR", "YOK", "BELKİ"].map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
        {d[alan] && !["VAR", "YOK", "BELKİ"].includes(d[alan]) && <option value={d[alan]}>{d[alan]}</option>}
      </select>
    </AlanKutusu>
  );

  return (
    <>
      {parti ? (
        <button
          type="button"
          onClick={() => setAcik(true)}
          title="Organizasyonu düzelt"
          aria-label="Organizasyonu düzelt"
          className="grid size-7 place-items-center rounded-panel-sm text-panel-silik transition-colors hover:bg-panel-yuzey-alt hover:text-murekkep"
        >
          <Ikon.Not boyut={14} />
        </button>
      ) : (
        <Dugme type="button" gorunum="birincil" onClick={() => setAcik(true)}>
          <Ikon.Balon boyut={16} />
          Organizasyon ekle
        </Dugme>
      )}

      <Kip
        acik={acik}
        kapat={() => setAcik(false)}
        genislik="46rem"
        baslik={parti ? "Doğum günü organizasyonu" : "Yeni doğum günü"}
        aciklama={parti?.kaynak === "excel" ? `Excel “DOĞUM GÜNÜ” sayfası ${parti.kaynak_satir}. satır.` : undefined}
      >
        <form onSubmit={gonder} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {metin("cocukAdi", "Çocuk")}
            {metin("veliAdi", "Veli")}
            {metin("telefon", "Telefon", { yer: "0532 111 22 33" })}
            {metin("cocukYas", "Çocuk yaşı", { yer: "5 YAŞ" })}
            {metin("dogumGunu", "Doğum günü", { tur: "date" })}
            {metin("mahalle", "Mahalle / kurum")}
          </div>
          <fieldset className="border-t border-panel-cizgi pt-3">
            <legend className="font-baslik text-sm font-bold text-murekkep">Organizasyon</legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {metin("organizasyonTarihi", "Organizasyon günü", { tur: "date" })}
              {metin("saat", "Saat", { yer: "15:30" })}
              {metin("kapora", "Kapora (TL)", { tur: "number" })}
              {metin("anlasilanFiyat", "Anlaşılan fiyat (TL)", { tur: "number" })}
              {metin("kalanOdeme", "Kalan ödeme (TL)", { tur: "number" })}
              <div />
              {metin("cocukSayisi", "Çocuk sayısı", { tur: "number" })}
              {metin("yetiskinSayisi", "Yetişkin sayısı", { tur: "number" })}
              <div />
              {secim("yemek", "Yemek")}
              {secim("susleme", "Süsleme")}
            </div>
          </fieldset>
          <AlanKutusu etiket="Açıklama" htmlFor={`${onek}-aciklama`}>
            <textarea id={`${onek}-aciklama`} rows={2} value={d.aciklama} onChange={yaz("aciklama")} disabled={bekliyor} className={`${ALAN} resize-y`} placeholder="Kahvaltı konsepti, 4500 mekân kirası, kişi başı 450 TL" />
          </AlanKutusu>
          {metin("ekNot", "Ek not")}
          {hata && <Bildirim ton="tehlike">{hata}</Bildirim>}
          <div className="flex items-center justify-between gap-2 border-t border-panel-cizgi pt-4">
            {parti ? (
              <SilDugmesi etiket="Sil" onayEtiketi="Kalıcı olarak sil" islem={() => dogumGunuSil(parti.id)} tamamlandi={() => setAcik(false)} />
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
