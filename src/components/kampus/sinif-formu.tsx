"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  sinifEkle,
  sinifGuncelle,
  sinifSil,
  sinifAktifligiDegistir,
  type SinifGirdisi,
} from "@/lib/kampus/ogrenci-islemleri";
import { GUNLER, GUN_ADI } from "@/lib/data/types";
import { Ikon } from "@/components/ui/ikon";
import { ALAN, AlanKutusu, Bildirim, Dugme } from "./ui";
import { Firildak, Kip, SilDugmesi } from "./ui-istemci";

/**
 * Sinif ekleme ve duzenleme.
 *
 * Donem siniflarinin normal yolu `SinifUretButonu`: kurumun haftalik
 * programi zaten kodda ve dogrulanmis durumda, otuz sinifi elle acmanin
 * anlami yok. Bu form o programda KARSILIGI OLMAYAN gruplar icin: telafi
 * grubu, yaz donemi, ozel istek uzerine acilan seans.
 */

export type SinifKunyesi = {
  id: string;
  ad: string;
  gun: string | null;
  bas: string | null;
  bit: string | null;
  atolye_slug: string | null;
  kontenjan: number;
  ogretmen_ad: string | null;
  donem: string;
  aktif: boolean;
  notlar: string | null;
  slot_id?: string | null;
};

export function SinifFormu({
  sinif,
  donem,
  atolyeler,
  ogretmenler,
  gorunum = "ikincil",
  olcu = "md",
}: {
  /** Verilirse duzenleme, verilmezse yeni sinif. */
  sinif?: SinifKunyesi;
  donem: string;
  atolyeler: { slug: string; ad: string }[];
  ogretmenler: string[];
  gorunum?: "birincil" | "ikincil";
  olcu?: "sm" | "md";
}) {
  const yonlendirici = useRouter();
  const [acik, setAcik] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  const [d, setD] = useState({
    ad: sinif?.ad ?? "",
    gun: sinif?.gun ?? "pazartesi",
    bas: sinif?.bas ?? "10:00",
    bit: sinif?.bit ?? "12:00",
    atolyeSlug: sinif?.atolye_slug ?? "",
    kontenjan: String(sinif?.kontenjan ?? 12),
    ogretmenAd: sinif?.ogretmen_ad ?? "",
    aktif: sinif?.aktif ?? true,
    notlar: sinif?.notlar ?? "",
  });

  const yaz = (alan: keyof typeof d) => (e: { target: { value: string } }) =>
    setD((s) => ({ ...s, [alan]: e.target.value }));

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);
    basla(async () => {
      const girdi: SinifGirdisi = {
        ad: d.ad,
        gun: d.gun as SinifGirdisi["gun"],
        bas: d.bas,
        bit: d.bit,
        atolyeSlug: d.atolyeSlug || undefined,
        kontenjan: Number(d.kontenjan),
        ogretmenAd: d.ogretmenAd || undefined,
        donem,
        aktif: d.aktif,
        notlar: d.notlar || undefined,
      };
      const sonuc = sinif
        ? await sinifGuncelle(sinif.id, girdi)
        : await sinifEkle(girdi);
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
      <Dugme
        type="button"
        gorunum={gorunum}
        olcu={olcu}
        onClick={() => setAcik(true)}
      >
        {sinif ? <Ikon.Not boyut={15} /> : <Ikon.Ayi boyut={15} />}
        {sinif ? "Düzenle" : "Sınıf ekle"}
      </Dugme>

      <Kip
        acik={acik}
        kapat={() => setAcik(false)}
        genislik="38rem"
        baslik={sinif ? "Sınıfı düzenle" : "Yeni sınıf"}
        aciklama={
          sinif?.slot_id
            ? "Bu sınıf haftalık programdan üretildi. Burada değiştirdiğiniz gün ve saat sitedeki programı değiştirmez."
            : `${donem} dönemi · programda karşılığı olmayan gruplar için`
        }
      >
        <form onSubmit={gonder} className="space-y-4">
          <AlanKutusu
            etiket="Sınıf adı"
            htmlFor="s-ad"
            gerekli
            ipucu="Listelerde bu ad görünür: “Salı 10:00 · Okula Hazırlık” gibi."
          >
            <input
              id="s-ad"
              required
              value={d.ad}
              onChange={yaz("ad")}
              disabled={bekliyor}
              className={ALAN}
              placeholder="Cumartesi 11:00 · Telafi"
            />
          </AlanKutusu>

          <div className="grid gap-3 sm:grid-cols-3">
            <AlanKutusu etiket="Gün" htmlFor="s-gun">
              <select
                id="s-gun"
                value={d.gun}
                onChange={yaz("gun")}
                disabled={bekliyor}
                className={ALAN}
              >
                {GUNLER.map((g) => (
                  <option key={g} value={g}>
                    {GUN_ADI[g]}
                  </option>
                ))}
              </select>
            </AlanKutusu>
            <AlanKutusu etiket="Başlangıç" htmlFor="s-bas" gerekli>
              <input
                id="s-bas"
                type="time"
                required
                value={d.bas}
                onChange={yaz("bas")}
                disabled={bekliyor}
                className={ALAN}
              />
            </AlanKutusu>
            <AlanKutusu etiket="Bitiş" htmlFor="s-bit" gerekli>
              <input
                id="s-bit"
                type="time"
                required
                value={d.bit}
                onChange={yaz("bit")}
                disabled={bekliyor}
                className={ALAN}
              />
            </AlanKutusu>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <AlanKutusu
              etiket="Atölye"
              htmlFor="s-atolye"
              className="sm:col-span-2"
            >
              <select
                id="s-atolye"
                value={d.atolyeSlug}
                onChange={yaz("atolyeSlug")}
                disabled={bekliyor}
                className={ALAN}
              >
                <option value="">Seçilmedi</option>
                {atolyeler.map((a) => (
                  <option key={a.slug} value={a.slug}>
                    {a.ad}
                  </option>
                ))}
              </select>
            </AlanKutusu>
            <AlanKutusu etiket="Kontenjan" htmlFor="s-kontenjan" gerekli>
              <input
                id="s-kontenjan"
                type="number"
                min={1}
                max={40}
                required
                value={d.kontenjan}
                onChange={yaz("kontenjan")}
                disabled={bekliyor}
                className={ALAN}
              />
            </AlanKutusu>
          </div>

          <AlanKutusu
            etiket="Öğretmen"
            htmlFor="s-ogretmen"
            ipucu="Öğretmen kendi sınıfını ancak buradan atandığında görebilir."
          >
            <select
              id="s-ogretmen"
              value={d.ogretmenAd}
              onChange={yaz("ogretmenAd")}
              disabled={bekliyor}
              className={ALAN}
            >
              <option value="">Atanmadı</option>
              {ogretmenler.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </AlanKutusu>

          <AlanKutusu etiket="Not" htmlFor="s-not">
            <textarea
              id="s-not"
              rows={2}
              value={d.notlar}
              onChange={yaz("notlar")}
              disabled={bekliyor}
              className={`${ALAN} resize-y`}
            />
          </AlanKutusu>

          <label className="flex items-center gap-2 text-sm text-murekkep">
            <input
              type="checkbox"
              checked={d.aktif}
              onChange={(e) =>
                setD((s) => ({ ...s, aktif: e.target.checked }))
              }
              disabled={bekliyor}
              className="size-4 accent-[var(--color-yesil-koyu)]"
            />
            Sınıf açık (kapalı sınıf yoklamada ve kayıt listesinde çıkmaz)
          </label>

          {hata && <Bildirim ton="tehlike">{hata}</Bildirim>}

          <div className="flex flex-wrap justify-end gap-2 border-t border-panel-cizgi pt-4">
            <Dugme
              type="button"
              onClick={() => setAcik(false)}
              disabled={bekliyor}
            >
              Vazgeç
            </Dugme>
            <Dugme type="submit" gorunum="birincil" disabled={bekliyor}>
              {bekliyor && <Firildak />}
              {bekliyor ? "Kaydediliyor…" : "Kaydet"}
            </Dugme>
          </div>
        </form>

        {sinif && (
          <div className="mt-5 rounded-panel border border-tehlike/20 bg-tehlike-zemin/50 px-4 py-3">
            <p className="font-baslik text-sm font-bold text-murekkep">
              Sınıfı sil
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-panel-soluk">
              Öğrenci kaydı ya da ders kaydı olan sınıf silinmez; geçmiş
              yoklamalar ona bağlı. Öyle bir sınıfı yukarıdaki kutucuktan
              kapatın.
            </p>
            <div className="mt-2 flex justify-end">
              <SilDugmesi
                etiket="Sınıfı sil"
                onayEtiketi="Kalıcı olarak sil"
                islem={() => sinifSil(sinif.id)}
                tamamlandi={() => yonlendirici.push("/kampus/siniflar")}
              />
            </div>
          </div>
        )}
      </Kip>
    </>
  );
}

/** Sinifi tek tikla acar/kapatir. Liste satirinda kullanilir. */
export function SinifAnahtari({
  sinifId,
  aktif,
}: {
  sinifId: string;
  aktif: boolean;
}) {
  const [acikMi, setAcikMi] = useState(aktif);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  function degistir() {
    const yeni = !acikMi;
    setAcikMi(yeni);
    setHata(null);
    basla(async () => {
      const sonuc = await sinifAktifligiDegistir(sinifId, yeni);
      if (!sonuc.ok) {
        setAcikMi(!yeni);
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <span className="shrink-0">
      <Dugme
        type="button"
        olcu="sm"
        gorunum={acikMi ? "sessiz" : "ikincil"}
        onClick={degistir}
        disabled={bekliyor}
        aria-pressed={acikMi}
      >
        {bekliyor ? <Firildak /> : null}
        {acikMi ? "Kapat" : "Aç"}
      </Dugme>
      {hata && (
        <span role="alert" className="mt-1 block text-xs text-tehlike">
          {hata}
        </span>
      )}
    </span>
  );
}
