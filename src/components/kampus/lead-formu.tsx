"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  leadEkle,
  leadGuncelle,
  leadSil,
} from "@/lib/kampus/yoklama-islemleri";
import { LEAD_KAYNAK_ETIKET } from "@/lib/kampus/yoklama-tipleri";
import { Ikon } from "@/components/ui/ikon";
import { ALAN, AlanKutusu, Bildirim, Dugme, IkonDugme } from "./ui";
import { Firildak, Kip, SilDugmesi } from "./ui-istemci";

/**
 * Lead girisi ve duzenlemesi.
 *
 * Yalniz ad zorunlu: Instagram'dan gelen bir mesajda cogu zaman elde bir
 * isim oluyor. Zorunlu alan sayisini artirmak, kaydin hic girilmemesine
 * yol acar.
 */

const KAYNAKLAR = [
  "instagram",
  "whatsapp",
  "telefon",
  "tavsiye",
  "tabela",
  "diger",
] as const;

export type LeadKunyesi = {
  id: string;
  ad_soyad: string;
  telefon: string | null;
  kaynak: string;
  cocuk_adi: string | null;
  ilgilendigi_program: string | null;
  notlar: string | null;
  ogrenci_id: string | null;
};

type Alanlar = {
  adSoyad: string;
  telefon: string;
  kaynak: string;
  cocukAdi: string;
  ilgilendigiProgram: string;
  notlar: string;
};

const BOS: Alanlar = {
  adSoyad: "",
  telefon: "",
  kaynak: "instagram",
  cocukAdi: "",
  ilgilendigiProgram: "",
  notlar: "",
};

/** Ekleme ve duzenleme formunun ortak alanlari. */
function LeadAlanlari({
  onek,
  d,
  yaz,
  bekliyor,
}: {
  onek: string;
  d: Alanlar;
  yaz: (alan: keyof Alanlar) => (e: { target: { value: string } }) => void;
  bekliyor: boolean;
}) {
  return (
    <>
      <AlanKutusu etiket="Ad soyad" htmlFor={`${onek}-ad`} gerekli>
        <input
          id={`${onek}-ad`}
          required
          value={d.adSoyad}
          onChange={yaz("adSoyad")}
          disabled={bekliyor}
          className={ALAN}
          placeholder="Ayşe Yılmaz"
        />
      </AlanKutusu>

      <div className="grid gap-3 sm:grid-cols-2">
        <AlanKutusu etiket="Telefon" htmlFor={`${onek}-tel`}>
          <input
            id={`${onek}-tel`}
            value={d.telefon}
            onChange={yaz("telefon")}
            disabled={bekliyor}
            className={ALAN}
            placeholder="0532 …"
          />
        </AlanKutusu>
        <AlanKutusu etiket="Nereden" htmlFor={`${onek}-kaynak`}>
          <select
            id={`${onek}-kaynak`}
            value={d.kaynak}
            onChange={yaz("kaynak")}
            disabled={bekliyor}
            className={ALAN}
          >
            {KAYNAKLAR.map((k) => (
              <option key={k} value={k}>
                {LEAD_KAYNAK_ETIKET[k]}
              </option>
            ))}
          </select>
        </AlanKutusu>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <AlanKutusu etiket="Çocuğun adı" htmlFor={`${onek}-cocuk`}>
          <input
            id={`${onek}-cocuk`}
            value={d.cocukAdi}
            onChange={yaz("cocukAdi")}
            disabled={bekliyor}
            className={ALAN}
          />
        </AlanKutusu>
        <AlanKutusu etiket="İlgilendiği" htmlFor={`${onek}-program`}>
          <input
            id={`${onek}-program`}
            value={d.ilgilendigiProgram}
            onChange={yaz("ilgilendigiProgram")}
            disabled={bekliyor}
            className={ALAN}
            placeholder="Okula hazırlık"
          />
        </AlanKutusu>
      </div>

      <AlanKutusu etiket="Not" htmlFor={`${onek}-not`}>
        <textarea
          id={`${onek}-not`}
          rows={2}
          value={d.notlar}
          onChange={yaz("notlar")}
          disabled={bekliyor}
          className={`${ALAN} resize-y`}
          placeholder="Instagram'dan yazdı, eylülde başlamak istiyor."
        />
      </AlanKutusu>
    </>
  );
}

/* --------------------------------------------------------------- ekleme */

export function LeadFormu() {
  const yonlendirici = useRouter();
  const [d, setD] = useState<Alanlar>(BOS);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  const yaz =
    (alan: keyof Alanlar) => (e: { target: { value: string } }) =>
      setD((s) => ({ ...s, [alan]: e.target.value }));

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);
    basla(async () => {
      const sonuc = await leadEkle(d);
      if (sonuc.ok) {
        setD(BOS);
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <form onSubmit={gonder} className="space-y-3">
      <LeadAlanlari onek="lead" d={d} yaz={yaz} bekliyor={bekliyor} />

      {hata && <Bildirim ton="tehlike">{hata}</Bildirim>}

      <Dugme
        type="submit"
        gorunum="birincil"
        disabled={bekliyor || !d.adSoyad.trim()}
        className="w-full"
      >
        {bekliyor && <Firildak />}
        {bekliyor ? "Kaydediliyor…" : "Lead ekle"}
      </Dugme>
    </form>
  );
}

/* ------------------------------------------------------------ duzenleme */

/**
 * Lead duzenleme.
 *
 * Ogrenciye DONUSMUS lead icin dugme hic cikmiyor: o kayit artik bir
 * donusum belgesi ("bu ogrenci Instagram'dan geldi") ve raporlar ona
 * dayaniyor; bilgileri ogrenci kartindan duzeltiliyor.
 */
export function LeadDuzenle({ lead }: { lead: LeadKunyesi }) {
  const yonlendirici = useRouter();
  const [acik, setAcik] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  const [d, setD] = useState<Alanlar>({
    adSoyad: lead.ad_soyad,
    telefon: lead.telefon ?? "",
    kaynak: lead.kaynak,
    cocukAdi: lead.cocuk_adi ?? "",
    ilgilendigiProgram: lead.ilgilendigi_program ?? "",
    notlar: lead.notlar ?? "",
  });

  const yaz =
    (alan: keyof Alanlar) => (e: { target: { value: string } }) =>
      setD((s) => ({ ...s, [alan]: e.target.value }));

  if (lead.ogrenci_id) return null;

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);
    basla(async () => {
      const sonuc = await leadGuncelle(lead.id, d);
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
      <IkonDugme baslik="Lead'i düzenle" onClick={() => setAcik(true)}>
        <Ikon.Not boyut={15} />
      </IkonDugme>

      <Kip
        acik={acik}
        kapat={() => setAcik(false)}
        genislik="34rem"
        baslik="Lead'i düzenle"
      >
        <form onSubmit={gonder} className="space-y-3">
          <LeadAlanlari onek="ld" d={d} yaz={yaz} bekliyor={bekliyor} />

          {hata && <Bildirim ton="tehlike">{hata}</Bildirim>}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-panel-cizgi pt-4">
            <SilDugmesi
              etiket="Sil"
              onayEtiketi="Kalıcı olarak sil"
              islem={() => leadSil(lead.id)}
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
