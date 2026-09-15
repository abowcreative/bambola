"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  paketSatisiEkle,
  paketSatisiGuncelle,
  paketSatisiSil,
  type PaketSatisiGirdisi,
} from "@/lib/kampus/defter-islemleri";
import {
  DEFTER_YONTEM_ETIKET,
  type PaketSatisi,
} from "@/lib/kampus/defter-tipleri";
import { Ikon } from "@/components/ui/ikon";
import { ALAN, AlanKutusu, Bildirim, Dugme } from "./ui";
import { Firildak, Kip, SilDugmesi } from "./ui-istemci";

/**
 * Odeme defteri satiri: ekleme ve duzeltme.
 *
 * Excel'de bir odeme almak iki sayfada sekiz hucreye dokunmakti. Burada tek
 * form: ogrenci, tarih, paket, program, tutar, odeme sekli, not ve
 * istenirse ogrencinin hak sayaclari. Kaydedince ogrencinin "son odeme"
 * ozeti kendiliginden tazeleniyor (defter-islemleri.ts).
 */

export type OgrenciSecenegi = {
  id: string;
  ad: string;
  soyad: string | null;
  durum: string;
  excel_adi: string | null;
  paket: string | null;
  program_metni: string | null;
  kalan_hak_saat: number | null;
  gelis_hakki: number | null;
  veli: string | null;
};

type Sozluk = { paketler: string[]; programlar: string[] };

type Alanlar = {
  ogrenciId: string;
  cocukAdi: string;
  veliAdi: string;
  tarih: string;
  paket: string;
  program: string;
  tutar: string;
  yontem: string;
  odemeTuru: string;
  aciklama: string;
  kalanHakSaat: string;
  gelisHakki: string;
};

const bugun = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });

const adYaz = (o: { ad: string; soyad: string | null }) =>
  o.soyad ? `${o.ad} ${o.soyad}` : o.ad;

/** Ogrenci secici: filtre kutusu + liste. Uc yuz ogrencide duz select yetmiyor. */
function OgrenciSecici({
  onek,
  ogrenciler,
  deger,
  sec,
  bekliyor,
  sabit,
}: {
  onek: string;
  ogrenciler: OgrenciSecenegi[];
  deger: string;
  sec: (id: string) => void;
  bekliyor: boolean;
  sabit: boolean;
}) {
  const [filtre, setFiltre] = useState("");
  const secili = ogrenciler.find((o) => o.id === deger);

  const liste = useMemo(() => {
    const k = filtre.trim().toLocaleLowerCase("tr-TR");
    const uygun = k
      ? ogrenciler.filter((o) =>
          `${adYaz(o)} ${o.excel_adi ?? ""} ${o.veli ?? ""}`
            .toLocaleLowerCase("tr-TR")
            .includes(k),
        )
      : ogrenciler;
    /* Aktifler once: bu ay odeme alinacak cocuklar buyuk ihtimalle onlar. */
    return [...uygun].sort(
      (a, b) =>
        Number(b.durum === "aktif") - Number(a.durum === "aktif") ||
        adYaz(a).localeCompare(adYaz(b), "tr"),
    );
  }, [ogrenciler, filtre]);

  if (sabit && secili) {
    return (
      <AlanKutusu etiket="Öğrenci" htmlFor={`${onek}-ogr`}>
        <input id={`${onek}-ogr`} value={adYaz(secili)} disabled className={ALAN} />
      </AlanKutusu>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <AlanKutusu etiket="Öğrenci ara" htmlFor={`${onek}-ara`}>
        <input
          id={`${onek}-ara`}
          value={filtre}
          onChange={(e) => setFiltre(e.target.value)}
          disabled={bekliyor}
          className={ALAN}
          placeholder="Ad, veli adı"
        />
      </AlanKutusu>
      <AlanKutusu
        etiket="Öğrenci"
        htmlFor={`${onek}-ogr`}
        ipucu={secili?.veli ? `Veli: ${secili.veli}` : "Kayıtlı değilse boş bırakıp adı aşağıya yazın."}
      >
        <select
          id={`${onek}-ogr`}
          value={deger}
          onChange={(e) => sec(e.target.value)}
          disabled={bekliyor}
          className={ALAN}
        >
          <option value="">— Öğrenci seçilmedi —</option>
          {liste.slice(0, 400).map((o) => (
            <option key={o.id} value={o.id}>
              {adYaz(o)}
              {o.veli ? ` · ${o.veli}` : ""}
              {o.durum !== "aktif" ? ` (${o.durum === "dondurdu" ? "pasif" : o.durum})` : ""}
            </option>
          ))}
        </select>
      </AlanKutusu>
    </div>
  );
}

function SatisAlanlari({
  onek,
  d,
  setD,
  bekliyor,
  ogrenciler,
  sozluk,
  sabitOgrenci,
}: {
  onek: string;
  d: Alanlar;
  setD: (f: (s: Alanlar) => Alanlar) => void;
  bekliyor: boolean;
  ogrenciler: OgrenciSecenegi[];
  sozluk: Sozluk;
  sabitOgrenci: boolean;
}) {
  const yaz = (alan: keyof Alanlar) => (e: { target: { value: string } }) =>
    setD((s) => ({ ...s, [alan]: e.target.value }));

  function ogrenciSec(id: string) {
    const o = ogrenciler.find((x) => x.id === id);
    setD((s) => ({
      ...s,
      ogrenciId: id,
      /* Secilen cocugun mevcut paketi, programi ve sayaclari forma dolsun:
         cogu zaman ayni paket yenileniyor. */
      paket: o?.paket ?? s.paket,
      program: o?.program_metni ?? s.program,
      kalanHakSaat: o?.kalan_hak_saat === null || o?.kalan_hak_saat === undefined ? s.kalanHakSaat : String(o.kalan_hak_saat),
      gelisHakki: o?.gelis_hakki === null || o?.gelis_hakki === undefined ? s.gelisHakki : String(o.gelis_hakki),
    }));
  }

  return (
    <>
      <OgrenciSecici
        onek={onek}
        ogrenciler={ogrenciler}
        deger={d.ogrenciId}
        sec={ogrenciSec}
        bekliyor={bekliyor}
        sabit={sabitOgrenci}
      />

      {!d.ogrenciId && (
        <div className="grid gap-3 sm:grid-cols-2">
          <AlanKutusu etiket="Çocuk adı" htmlFor={`${onek}-cocuk`} gerekli>
            <input id={`${onek}-cocuk`} value={d.cocukAdi} onChange={yaz("cocukAdi")} disabled={bekliyor} className={ALAN} />
          </AlanKutusu>
          <AlanKutusu etiket="Veli adı" htmlFor={`${onek}-veli`}>
            <input id={`${onek}-veli`} value={d.veliAdi} onChange={yaz("veliAdi")} disabled={bekliyor} className={ALAN} />
          </AlanKutusu>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <AlanKutusu etiket="Tarih" htmlFor={`${onek}-tarih`} gerekli>
          <input id={`${onek}-tarih`} type="date" required value={d.tarih} onChange={yaz("tarih")} disabled={bekliyor} className={ALAN} />
        </AlanKutusu>
        <AlanKutusu etiket="Paket" htmlFor={`${onek}-paket`}>
          <input id={`${onek}-paket`} list={`${onek}-paketler`} value={d.paket} onChange={yaz("paket")} disabled={bekliyor} className={ALAN} placeholder="16 SAAT" />
          <datalist id={`${onek}-paketler`}>
            {sozluk.paketler.slice(0, 40).map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </AlanKutusu>
        <AlanKutusu etiket="Program" htmlFor={`${onek}-program`}>
          <input id={`${onek}-program`} list={`${onek}-programlar`} value={d.program} onChange={yaz("program")} disabled={bekliyor} className={ALAN} placeholder="2 GÜN 2 SAAT" />
          <datalist id={`${onek}-programlar`}>
            {sozluk.programlar.slice(0, 60).map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </AlanKutusu>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <AlanKutusu etiket="Tutar (TL)" htmlFor={`${onek}-tutar`} ipucu="Ödeme alınmadıysa boş bırakın, notu yazın.">
          <input id={`${onek}-tutar`} type="number" min={0} step={1} value={d.tutar} onChange={yaz("tutar")} disabled={bekliyor} className={`${ALAN} tabular-nums`} placeholder="8000" />
        </AlanKutusu>
        <AlanKutusu etiket="Ödeme şekli" htmlFor={`${onek}-yontem`}>
          <select id={`${onek}-yontem`} value={d.yontem} onChange={yaz("yontem")} disabled={bekliyor} className={ALAN}>
            <option value="">—</option>
            {Object.entries(DEFTER_YONTEM_ETIKET).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </AlanKutusu>
        <AlanKutusu etiket="Şekil notu" htmlFor={`${onek}-tur`} ipucu="Karışıksa: 3000 nakit 1500 kart">
          <input id={`${onek}-tur`} value={d.odemeTuru} onChange={yaz("odemeTuru")} disabled={bekliyor} className={ALAN} />
        </AlanKutusu>
      </div>

      <AlanKutusu etiket="Açıklama" htmlFor={`${onek}-aciklama`}>
        <input id={`${onek}-aciklama`} value={d.aciklama} onChange={yaz("aciklama")} disabled={bekliyor} className={ALAN} placeholder="3 aylık ödeme, fatura kesildi" />
      </AlanKutusu>

      {d.ogrenciId && (
        <div className="grid gap-3 rounded-panel-sm border border-panel-cizgi bg-panel-yuzey-alt p-3 sm:grid-cols-2">
          <AlanKutusu etiket="Kalan hak (saat)" htmlFor={`${onek}-kalan`} ipucu="Öğrencinin sayacı; boş bırakılırsa değişmez.">
            <input id={`${onek}-kalan`} type="number" step={1} value={d.kalanHakSaat} onChange={yaz("kalanHakSaat")} disabled={bekliyor} className={`${ALAN} tabular-nums`} />
          </AlanKutusu>
          <AlanKutusu etiket="Geliş hakkı" htmlFor={`${onek}-gelis`}>
            <input id={`${onek}-gelis`} type="number" step={1} value={d.gelisHakki} onChange={yaz("gelisHakki")} disabled={bekliyor} className={`${ALAN} tabular-nums`} />
          </AlanKutusu>
        </div>
      )}
    </>
  );
}

function girdiyeCevir(d: Alanlar): PaketSatisiGirdisi {
  return {
    ogrenciId: d.ogrenciId,
    cocukAdi: d.cocukAdi,
    veliAdi: d.veliAdi,
    tarih: d.tarih,
    paket: d.paket,
    program: d.program,
    tutar: d.tutar === "" ? "" : Number(d.tutar),
    yontem: d.yontem as PaketSatisiGirdisi["yontem"],
    odemeTuru: d.odemeTuru,
    aciklama: d.aciklama,
    kalanHakSaat: d.kalanHakSaat === "" ? "" : Number(d.kalanHakSaat),
    gelisHakki: d.gelisHakki === "" ? "" : Number(d.gelisHakki),
  };
}

/* ---------------------------------------------------------------- ekleme */

export function PaketSatisiFormu({
  ogrenciler,
  sozluk,
  sabitOgrenciId,
  varsayilanTarih,
  gorunum = "birincil",
  olcu = "md",
}: {
  ogrenciler: OgrenciSecenegi[];
  sozluk: Sozluk;
  /** Ogrenci sayfasindan acildiysa secim kilitli. */
  sabitOgrenciId?: string;
  varsayilanTarih?: string;
  gorunum?: "birincil" | "ikincil";
  olcu?: "sm" | "md";
}) {
  const yonlendirici = useRouter();
  const [acik, setAcik] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  const sabit = sabitOgrenciId ? ogrenciler.find((o) => o.id === sabitOgrenciId) : undefined;
  const bos = (): Alanlar => ({
    ogrenciId: sabitOgrenciId ?? "",
    cocukAdi: "",
    veliAdi: "",
    tarih: varsayilanTarih ?? bugun(),
    paket: sabit?.paket ?? "",
    program: sabit?.program_metni ?? "",
    tutar: "",
    yontem: "",
    odemeTuru: "",
    aciklama: "",
    kalanHakSaat: sabit?.kalan_hak_saat === null || sabit?.kalan_hak_saat === undefined ? "" : String(sabit.kalan_hak_saat),
    gelisHakki: sabit?.gelis_hakki === null || sabit?.gelis_hakki === undefined ? "" : String(sabit.gelis_hakki),
  });
  const [d, setD] = useState<Alanlar>(bos);

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);
    basla(async () => {
      const sonuc = await paketSatisiEkle(girdiyeCevir(d));
      if (sonuc.ok) {
        setAcik(false);
        setD(bos());
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <>
      <Dugme type="button" gorunum={gorunum} olcu={olcu} onClick={() => setAcik(true)}>
        <Ikon.Sayilar boyut={olcu === "sm" ? 14 : 16} />
        Ödeme ekle
      </Dugme>

      <Kip
        acik={acik}
        kapat={() => setAcik(false)}
        genislik="44rem"
        baslik="Ödeme / paket satışı"
        aciklama="Defterin o ayına yazılır; öğrencinin son ödeme bilgisi ve sayaçları güncellenir."
      >
        <form onSubmit={gonder} className="space-y-4">
          <SatisAlanlari
            onek="pe"
            d={d}
            setD={setD}
            bekliyor={bekliyor}
            ogrenciler={ogrenciler}
            sozluk={sozluk}
            sabitOgrenci={Boolean(sabitOgrenciId)}
          />
          {hata && <Bildirim ton="tehlike">{hata}</Bildirim>}
          <div className="flex flex-wrap justify-end gap-2 border-t border-panel-cizgi pt-4">
            <Dugme type="button" onClick={() => setAcik(false)} disabled={bekliyor}>
              Vazgeç
            </Dugme>
            <Dugme type="submit" gorunum="birincil" disabled={bekliyor}>
              {bekliyor && <Firildak />}
              {bekliyor ? "Kaydediliyor…" : "Kaydet"}
            </Dugme>
          </div>
        </form>
      </Kip>
    </>
  );
}

/* -------------------------------------------------------------- duzeltme */

export function PaketSatisiDuzelt({
  satis,
  ogrenciler,
  sozluk,
}: {
  satis: PaketSatisi;
  ogrenciler: OgrenciSecenegi[];
  sozluk: Sozluk;
}) {
  const yonlendirici = useRouter();
  const [acik, setAcik] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  const [d, setD] = useState<Alanlar>({
    ogrenciId: satis.ogrenci_id ?? "",
    cocukAdi: satis.cocuk_adi,
    veliAdi: satis.veli_adi ?? "",
    tarih: satis.tarih ?? bugun(),
    paket: satis.paket ?? "",
    program: satis.program ?? "",
    tutar: satis.tutar === null ? "" : String(satis.tutar),
    yontem: satis.yontem ?? "",
    odemeTuru: satis.odeme_turu ?? "",
    aciklama: satis.aciklama ?? "",
    kalanHakSaat: "",
    gelisHakki: "",
  });

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);
    basla(async () => {
      const sonuc = await paketSatisiGuncelle(satis.id, girdiyeCevir(d));
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
      <button
        type="button"
        onClick={() => setAcik(true)}
        title="Satırı düzelt"
        aria-label="Satırı düzelt"
        className="grid size-7 place-items-center rounded-panel-sm text-panel-silik transition-colors hover:bg-panel-yuzey-alt hover:text-murekkep"
      >
        <Ikon.Not boyut={14} />
      </button>

      <Kip
        acik={acik}
        kapat={() => setAcik(false)}
        genislik="44rem"
        baslik="Defter satırını düzelt"
        aciklama={
          satis.kaynak === "excel"
            ? `Excel ${satis.sayfa} sayfası ${satis.kaynak_satir}. satırdan geldi.${satis.tarih_ham ? ` Tarih hücresi: “${satis.tarih_ham}”.` : ""}${satis.tutar_ham ? ` Tutar hücresi: “${satis.tutar_ham}”.` : ""}`
            : undefined
        }
      >
        <form onSubmit={gonder} className="space-y-4">
          <SatisAlanlari
            onek={`pd-${satis.id}`}
            d={d}
            setD={setD}
            bekliyor={bekliyor}
            ogrenciler={ogrenciler}
            sozluk={sozluk}
            sabitOgrenci={false}
          />
          {satis.ek_alanlar && Object.keys(satis.ek_alanlar).length > 0 && (
            <div className="rounded-panel-sm border border-panel-cizgi bg-panel-yuzey-alt px-3 py-2 text-xs text-panel-soluk">
              <p className="mb-1 font-semibold text-murekkep">Excel&apos;deki diğer hücreler</p>
              <dl className="grid gap-x-4 gap-y-0.5 sm:grid-cols-2">
                {Object.entries(satis.ek_alanlar).map(([k, v]) => (
                  <div key={k} className="flex gap-1.5">
                    <dt className="shrink-0 text-panel-silik">{k}:</dt>
                    <dd className="min-w-0 break-words text-murekkep">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {hata && <Bildirim ton="tehlike">{hata}</Bildirim>}
          <div className="flex items-center justify-between gap-2 border-t border-panel-cizgi pt-4">
            <SilDugmesi
              etiket="Sil"
              onayEtiketi="Kalıcı olarak sil"
              islem={() => paketSatisiSil(satis.id)}
              tamamlandi={() => setAcik(false)}
            />
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
