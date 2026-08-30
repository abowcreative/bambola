"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  duyuruEkle,
  duyuruGuncelle,
  duyuruSil,
} from "@/lib/kampus/yoklama-islemleri";
import { HEDEF_ETIKET } from "@/lib/kampus/yoklama-tipleri";
import { Ikon } from "@/components/ui/ikon";
import { ALAN, AlanKutusu, Bildirim, Dugme, IkonDugme } from "./ui";
import { Firildak, Kip, SilDugmesi } from "./ui-istemci";

/**
 * Duyuru yazma ve duzenleme.
 *
 * Yeni duyuru TASLAK olarak aciliyor; yayina almak ayri bir adim
 * (`YayinAnahtari`). Yazilmakta olan bir metnin veliye dusmesi geri
 * alinamaz.
 */

const HEDEFLER = ["hepsi", "ogretmen", "veli"] as const;

export type DuyuruKunyesi = {
  id: string;
  baslik: string;
  metin: string;
  hedef: string;
};

export function DuyuruFormu() {
  const yonlendirici = useRouter();
  const [baslik, setBaslik] = useState("");
  const [metin, setMetin] = useState("");
  const [hedef, setHedef] = useState<string>("hepsi");
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);
    basla(async () => {
      const sonuc = await duyuruEkle({ baslik, metin, hedef });
      if (sonuc.ok) {
        setBaslik("");
        setMetin("");
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <form onSubmit={gonder} className="space-y-3">
      <AlanKutusu etiket="Başlık" htmlFor="d-baslik" gerekli>
        <input
          id="d-baslik"
          required
          value={baslik}
          onChange={(e) => setBaslik(e.target.value)}
          disabled={bekliyor}
          className={ALAN}
          placeholder="Cumartesi atölyesi iptal"
        />
      </AlanKutusu>

      <AlanKutusu etiket="Kimler görecek" htmlFor="d-hedef">
        <select
          id="d-hedef"
          value={hedef}
          onChange={(e) => setHedef(e.target.value)}
          disabled={bekliyor}
          className={ALAN}
        >
          {HEDEFLER.map((h) => (
            <option key={h} value={h}>
              {HEDEF_ETIKET[h]}
            </option>
          ))}
        </select>
      </AlanKutusu>

      <AlanKutusu etiket="Metin" htmlFor="d-metin" gerekli>
        <textarea
          id="d-metin"
          required
          rows={5}
          value={metin}
          onChange={(e) => setMetin(e.target.value)}
          disabled={bekliyor}
          className={`${ALAN} resize-y`}
        />
      </AlanKutusu>

      {hata && <Bildirim ton="tehlike">{hata}</Bildirim>}

      <Dugme
        type="submit"
        gorunum="birincil"
        disabled={bekliyor || !baslik.trim() || !metin.trim()}
        className="w-full"
      >
        {bekliyor && <Firildak />}
        {bekliyor ? "Kaydediliyor…" : "Taslak olarak kaydet"}
      </Dugme>

      <p className="text-xs leading-relaxed text-panel-silik">
        Duyuru taslak olarak kaydedilir. Yayına almak ayrı bir adım.
      </p>
    </form>
  );
}

/** Var olan duyuruyu duzenler; ayni kipte silme de var. */
export function DuyuruDuzenle({ duyuru }: { duyuru: DuyuruKunyesi }) {
  const yonlendirici = useRouter();
  const [acik, setAcik] = useState(false);
  const [baslik, setBaslik] = useState(duyuru.baslik);
  const [metin, setMetin] = useState(duyuru.metin);
  const [hedef, setHedef] = useState(duyuru.hedef);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);
    basla(async () => {
      const sonuc = await duyuruGuncelle(duyuru.id, { baslik, metin, hedef });
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
      <IkonDugme baslik="Duyuruyu düzenle" onClick={() => setAcik(true)}>
        <Ikon.Not boyut={15} />
      </IkonDugme>

      <Kip
        acik={acik}
        kapat={() => setAcik(false)}
        genislik="34rem"
        baslik="Duyuruyu düzenle"
        aciklama="Yayındaki bir duyuruyu düzenlerseniz değişiklik anında görünür."
      >
        <form onSubmit={gonder} className="space-y-3">
          <AlanKutusu etiket="Başlık" htmlFor="dd-baslik" gerekli>
            <input
              id="dd-baslik"
              required
              value={baslik}
              onChange={(e) => setBaslik(e.target.value)}
              disabled={bekliyor}
              className={ALAN}
            />
          </AlanKutusu>

          <AlanKutusu etiket="Kimler görecek" htmlFor="dd-hedef">
            <select
              id="dd-hedef"
              value={hedef}
              onChange={(e) => setHedef(e.target.value)}
              disabled={bekliyor}
              className={ALAN}
            >
              {HEDEFLER.map((h) => (
                <option key={h} value={h}>
                  {HEDEF_ETIKET[h]}
                </option>
              ))}
            </select>
          </AlanKutusu>

          <AlanKutusu etiket="Metin" htmlFor="dd-metin" gerekli>
            <textarea
              id="dd-metin"
              required
              rows={6}
              value={metin}
              onChange={(e) => setMetin(e.target.value)}
              disabled={bekliyor}
              className={`${ALAN} resize-y`}
            />
          </AlanKutusu>

          {hata && <Bildirim ton="tehlike">{hata}</Bildirim>}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-panel-cizgi pt-4">
            <SilDugmesi
              etiket="Sil"
              onayEtiketi="Kalıcı olarak sil"
              islem={() => duyuruSil(duyuru.id)}
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
