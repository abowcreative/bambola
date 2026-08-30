"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ogrenciEkle,
  ogrenciGuncelle,
  ogrenciSil,
  leaddenOgrenciOlustur,
  type YeniOgrenciGirdisi,
  type OgrenciGuncelGirdisi,
} from "@/lib/kampus/ogrenci-islemleri";
import {
  YAKINLIK_ETIKET,
  OGRENCI_DURUM_ETIKET,
  type OgrenciDurumu,
} from "@/lib/kampus/ogrenci-tipleri";
import { Ikon } from "@/components/ui/ikon";
import { ALAN, AlanKutusu, Bildirim, Dugme } from "./ui";
import { Firildak, Kip, SilDugmesi } from "./ui-istemci";

/**
 * Ogrenci ekleme ve duzenleme.
 *
 * Ikisi ayni dosyada ama AYRI bilesenler: ekleme formu cocuk + veli +
 * sinif + ucreti birlikte aliyor ("yeni cocuk geldi" isinin tamami tek
 * ekranda bitsin), duzenleme formu yalniz kunyeye dokunuyor. Duzenlemede
 * veli ve sinif alanlarinin da bulunmasi, bir alani duzeltirken baska bir
 * baglantiyi sessizce koparma riski demekti; onlarin kendi islemleri var.
 */

const KURUMLAR = [
  { deger: "oyun-evi", etiket: "Oyun evi" },
  { deger: "anaokulu", etiket: "Anaokulu" },
  { deger: "parti", etiket: "Parti" },
] as const;

const DURUMLAR: OgrenciDurumu[] = ["aday", "aktif", "dondurdu", "ayrildi"];

export type OgrenciFormuBaslangici = {
  ad?: string;
  dogumTarihi?: string;
  notlar?: string;
  veliAdSoyad?: string;
  veliTelefon?: string;
};

/* -------------------------------------------------------------- ekleme */

export function OgrenciFormu({
  siniflar,
  baslangic,
  leadId,
  acikBaslasin = false,
}: {
  siniflar: { id: string; ad: string; bosYer: number }[];
  baslangic?: OgrenciFormuBaslangici;
  leadId?: string;
  acikBaslasin?: boolean;
}) {
  const yonlendirici = useRouter();
  const [acik, setAcik] = useState(acikBaslasin);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  const [d, setD] = useState({
    ad: baslangic?.ad ?? "",
    soyad: "",
    dogumTarihi: baslangic?.dogumTarihi ?? "",
    kurum: "oyun-evi",
    alerji: "",
    saglikNotu: "",
    notlar: baslangic?.notlar ?? "",
    veliAdSoyad: baslangic?.veliAdSoyad ?? "",
    veliTelefon: baslangic?.veliTelefon ?? "",
    veliEposta: "",
    yakinlik: "anne",
    sinifId: "",
    paketKod: "",
    ucret: "",
  });

  const yaz = (alan: keyof typeof d) => (e: { target: { value: string } }) =>
    setD((s) => ({ ...s, [alan]: e.target.value }));

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);
    basla(async () => {
      /*
        Kurum ve yakinlik alanlari state'te duz metin: select'ler yalniz
        gecerli degerleri uretiyor, sunucu tarafi da zod ile yeniden
        dogruluyor. Bu yuzden burada tur donusumu guvenli.
      */
      const girdi: YeniOgrenciGirdisi = {
        ...d,
        kurum: d.kurum as YeniOgrenciGirdisi["kurum"],
        yakinlik: d.yakinlik as YeniOgrenciGirdisi["yakinlik"],
        ucret: d.ucret ? Number(d.ucret) : undefined,
      };
      const sonuc = leadId
        ? await leaddenOgrenciOlustur(leadId, girdi)
        : await ogrenciEkle(girdi);
      if (sonuc.ok && sonuc.id) {
        yonlendirici.push(`/kampus/ogrenciler/${sonuc.id}`);
      } else if (!sonuc.ok) {
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <>
      <Dugme type="button" gorunum="birincil" onClick={() => setAcik(true)}>
        <Ikon.Bebek boyut={16} />
        Öğrenci ekle
      </Dugme>

      <Kip
        acik={acik}
        kapat={() => setAcik(false)}
        genislik="46rem"
        baslik={leadId ? "Lead'i öğrenciye dönüştür" : "Yeni öğrenci"}
        aciklama={
          leadId
            ? "Lead kaydı silinmez; kayıt tamamlanınca “Kayıt oldu” işaretlenip bu öğrenciye bağlanır."
            : "Çocuk ve veli bilgisi zorunlu. Sınıf ile ücret isteğe bağlı, sonradan da eklenebilir."
        }
      >
        <form onSubmit={gonder} className="space-y-5">
          <fieldset>
            <legend className="font-baslik text-sm font-bold text-murekkep">
              Çocuk
            </legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <AlanKutusu etiket="Ad" htmlFor="o-ad" gerekli>
                <input
                  id="o-ad"
                  required
                  value={d.ad}
                  onChange={yaz("ad")}
                  disabled={bekliyor}
                  className={ALAN}
                  placeholder="Deniz"
                />
              </AlanKutusu>
              <AlanKutusu etiket="Soyad" htmlFor="o-soyad">
                <input
                  id="o-soyad"
                  value={d.soyad}
                  onChange={yaz("soyad")}
                  disabled={bekliyor}
                  className={ALAN}
                />
              </AlanKutusu>
              <AlanKutusu etiket="Doğum tarihi" htmlFor="o-dogum" gerekli>
                <input
                  id="o-dogum"
                  type="date"
                  required
                  value={d.dogumTarihi}
                  onChange={yaz("dogumTarihi")}
                  disabled={bekliyor}
                  className={ALAN}
                />
              </AlanKutusu>
              <AlanKutusu etiket="Kurum" htmlFor="o-kurum">
                <select
                  id="o-kurum"
                  value={d.kurum}
                  onChange={yaz("kurum")}
                  disabled={bekliyor}
                  className={ALAN}
                >
                  {KURUMLAR.map((k) => (
                    <option key={k.deger} value={k.deger}>
                      {k.etiket}
                    </option>
                  ))}
                </select>
              </AlanKutusu>
              <AlanKutusu
                etiket="Alerji"
                htmlFor="o-alerji"
                className="sm:col-span-2"
                ipucu="Girilirse öğrenci kartında, yoklama listesinde ve yemek sayfasında vurgulu görünür."
              >
                <input
                  id="o-alerji"
                  value={d.alerji}
                  onChange={yaz("alerji")}
                  disabled={bekliyor}
                  className={ALAN}
                  placeholder="Fıstık, süt"
                />
              </AlanKutusu>
              <AlanKutusu
                etiket="Sağlık notu"
                htmlFor="o-saglik"
                className="sm:col-span-2"
              >
                <input
                  id="o-saglik"
                  value={d.saglikNotu}
                  onChange={yaz("saglikNotu")}
                  disabled={bekliyor}
                  className={ALAN}
                />
              </AlanKutusu>
              {/*
                Not alani GORUNUR duruyor: lead'den donusturmede lead'in notu
                buraya tasiniyor. Gorunmeden kaydedilen bir metin, sonra kimin
                yazdigi anlasilmayan bir nota donusur.
              */}
              <AlanKutusu
                etiket="Not"
                htmlFor="o-not"
                className="sm:col-span-2"
              >
                <textarea
                  id="o-not"
                  rows={2}
                  value={d.notlar}
                  onChange={yaz("notlar")}
                  disabled={bekliyor}
                  className={`${ALAN} resize-y`}
                  placeholder="Eylülde başlayacak, ablası da bizde."
                />
              </AlanKutusu>
            </div>
          </fieldset>

          <fieldset className="border-t border-panel-cizgi pt-4">
            <legend className="font-baslik text-sm font-bold text-murekkep">
              Veli
            </legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <AlanKutusu etiket="Ad soyad" htmlFor="o-veli" gerekli>
                <input
                  id="o-veli"
                  required
                  value={d.veliAdSoyad}
                  onChange={yaz("veliAdSoyad")}
                  disabled={bekliyor}
                  className={ALAN}
                  placeholder="Ayşe Yılmaz"
                />
              </AlanKutusu>
              <AlanKutusu etiket="Yakınlık" htmlFor="o-yakinlik">
                <select
                  id="o-yakinlik"
                  value={d.yakinlik}
                  onChange={yaz("yakinlik")}
                  disabled={bekliyor}
                  className={ALAN}
                >
                  {(["anne", "baba", "vasi", "veli"] as const).map((y) => (
                    <option key={y} value={y}>
                      {YAKINLIK_ETIKET[y]}
                    </option>
                  ))}
                </select>
              </AlanKutusu>
              <AlanKutusu
                etiket="Telefon"
                htmlFor="o-tel"
                gerekli
                ipucu="Aynı numarayla kayıtlı veli varsa yeni kayıt açılmaz, mevcut veliye bağlanır."
              >
                <input
                  id="o-tel"
                  required
                  value={d.veliTelefon}
                  onChange={yaz("veliTelefon")}
                  disabled={bekliyor}
                  className={ALAN}
                  placeholder="0532 111 22 33"
                />
              </AlanKutusu>
              <AlanKutusu etiket="E-posta" htmlFor="o-eposta">
                <input
                  id="o-eposta"
                  type="email"
                  value={d.veliEposta}
                  onChange={yaz("veliEposta")}
                  disabled={bekliyor}
                  className={ALAN}
                />
              </AlanKutusu>
            </div>
          </fieldset>

          <fieldset className="border-t border-panel-cizgi pt-4">
            <legend className="font-baslik text-sm font-bold text-murekkep">
              Sınıf ve ücret
              <span className="ml-2 text-xs font-normal text-panel-silik">
                isteğe bağlı
              </span>
            </legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              <AlanKutusu
                etiket="Sınıf"
                htmlFor="o-sinif"
                className="sm:col-span-3"
              >
                <select
                  id="o-sinif"
                  value={d.sinifId}
                  onChange={yaz("sinifId")}
                  disabled={bekliyor}
                  className={ALAN}
                >
                  <option value="">Sonra atanacak</option>
                  {siniflar.map((s) => (
                    <option key={s.id} value={s.id} disabled={s.bosYer <= 0}>
                      {s.ad}
                      {s.bosYer > 0 ? ` · ${s.bosYer} boş yer` : " · DOLU"}
                    </option>
                  ))}
                </select>
              </AlanKutusu>
              <AlanKutusu etiket="Paket" htmlFor="o-paket">
                <input
                  id="o-paket"
                  value={d.paketKod}
                  onChange={yaz("paketKod")}
                  disabled={bekliyor}
                  className={ALAN}
                  placeholder="ayda-8"
                />
              </AlanKutusu>
              <AlanKutusu
                etiket="Ücret (TL)"
                htmlFor="o-ucret"
                className="sm:col-span-2"
                ipucu="Girilirse cari hesaba borç kaydı olarak işlenir."
              >
                <input
                  id="o-ucret"
                  type="number"
                  min={0}
                  step={1}
                  value={d.ucret}
                  onChange={yaz("ucret")}
                  disabled={bekliyor}
                  className={ALAN}
                  placeholder="8000"
                />
              </AlanKutusu>
            </div>
          </fieldset>

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
              {bekliyor ? "Kaydediliyor…" : "Öğrenciyi kaydet"}
            </Dugme>
          </div>
        </form>
      </Kip>
    </>
  );
}

/* ----------------------------------------------------------- duzenleme */

export type OgrenciKunyesi = {
  id: string;
  ad: string;
  soyad: string | null;
  dogum_tarihi: string;
  kurum: string;
  durum: OgrenciDurumu;
  kayit_tarihi: string;
  alerji: string | null;
  saglik_notu: string | null;
  notlar: string | null;
};

/**
 * Ogrenci kunyesini duzenler; ayni kipin altinda silme de var.
 *
 * Silme, kaydetmeden UZAK duruyor ve ayri bir bolumde: yan yana iki dugme
 * konsaydi "kaydet" niyetiyle "sil"e basmak an meselesi olurdu.
 */
export function OgrenciDuzenle({ ogrenci }: { ogrenci: OgrenciKunyesi }) {
  const yonlendirici = useRouter();
  const [acik, setAcik] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  const [d, setD] = useState({
    ad: ogrenci.ad,
    soyad: ogrenci.soyad ?? "",
    dogumTarihi: ogrenci.dogum_tarihi,
    kurum: ogrenci.kurum,
    durum: ogrenci.durum as string,
    kayitTarihi: ogrenci.kayit_tarihi,
    alerji: ogrenci.alerji ?? "",
    saglikNotu: ogrenci.saglik_notu ?? "",
    notlar: ogrenci.notlar ?? "",
  });

  const yaz = (alan: keyof typeof d) => (e: { target: { value: string } }) =>
    setD((s) => ({ ...s, [alan]: e.target.value }));

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);
    basla(async () => {
      const girdi = {
        id: ogrenci.id,
        ...d,
        kurum: d.kurum as OgrenciGuncelGirdisi["kurum"],
        durum: d.durum as OgrenciGuncelGirdisi["durum"],
      };
      const sonuc = await ogrenciGuncelle(girdi);
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
      <Dugme type="button" onClick={() => setAcik(true)}>
        <Ikon.Not boyut={15} />
        Düzenle
      </Dugme>

      <Kip
        acik={acik}
        kapat={() => setAcik(false)}
        genislik="42rem"
        baslik="Öğrenci künyesi"
        aciklama="Veli bağlantısı ve sınıf kaydı kendi bölümlerinden yönetiliyor."
      >
        <form onSubmit={gonder} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <AlanKutusu etiket="Ad" htmlFor="od-ad" gerekli>
              <input
                id="od-ad"
                required
                value={d.ad}
                onChange={yaz("ad")}
                disabled={bekliyor}
                className={ALAN}
              />
            </AlanKutusu>
            <AlanKutusu etiket="Soyad" htmlFor="od-soyad">
              <input
                id="od-soyad"
                value={d.soyad}
                onChange={yaz("soyad")}
                disabled={bekliyor}
                className={ALAN}
              />
            </AlanKutusu>
            <AlanKutusu etiket="Doğum tarihi" htmlFor="od-dogum" gerekli>
              <input
                id="od-dogum"
                type="date"
                required
                value={d.dogumTarihi}
                onChange={yaz("dogumTarihi")}
                disabled={bekliyor}
                className={ALAN}
              />
            </AlanKutusu>
            <AlanKutusu etiket="Kayıt tarihi" htmlFor="od-kayit">
              <input
                id="od-kayit"
                type="date"
                value={d.kayitTarihi}
                onChange={yaz("kayitTarihi")}
                disabled={bekliyor}
                className={ALAN}
              />
            </AlanKutusu>
            <AlanKutusu etiket="Kurum" htmlFor="od-kurum">
              <select
                id="od-kurum"
                value={d.kurum}
                onChange={yaz("kurum")}
                disabled={bekliyor}
                className={ALAN}
              >
                {KURUMLAR.map((k) => (
                  <option key={k.deger} value={k.deger}>
                    {k.etiket}
                  </option>
                ))}
              </select>
            </AlanKutusu>
            <AlanKutusu
              etiket="Durum"
              htmlFor="od-durum"
              ipucu='"Ayrıldı" veya "dondurdu" seçilirse aktif sınıf kayıtları da kapanır.'
            >
              <select
                id="od-durum"
                value={d.durum}
                onChange={yaz("durum")}
                disabled={bekliyor}
                className={ALAN}
              >
                {DURUMLAR.map((x) => (
                  <option key={x} value={x}>
                    {OGRENCI_DURUM_ETIKET[x]}
                  </option>
                ))}
              </select>
            </AlanKutusu>
            <AlanKutusu
              etiket="Alerji"
              htmlFor="od-alerji"
              className="sm:col-span-2"
            >
              <input
                id="od-alerji"
                value={d.alerji}
                onChange={yaz("alerji")}
                disabled={bekliyor}
                className={ALAN}
              />
            </AlanKutusu>
            <AlanKutusu
              etiket="Sağlık notu"
              htmlFor="od-saglik"
              className="sm:col-span-2"
            >
              <input
                id="od-saglik"
                value={d.saglikNotu}
                onChange={yaz("saglikNotu")}
                disabled={bekliyor}
                className={ALAN}
              />
            </AlanKutusu>
            <AlanKutusu etiket="Not" htmlFor="od-not" className="sm:col-span-2">
              <textarea
                id="od-not"
                rows={3}
                value={d.notlar}
                onChange={yaz("notlar")}
                disabled={bekliyor}
                className={`${ALAN} resize-y`}
              />
            </AlanKutusu>
          </div>

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

        <div className="mt-5 rounded-panel border border-tehlike/20 bg-tehlike-zemin/50 px-4 py-3">
          <p className="font-baslik text-sm font-bold text-murekkep">
            Kaydı sil
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-panel-soluk">
            Ayrılan çocuk için silme değil <strong>durum değişikliği</strong>{" "}
            kullanılır; geçmiş yoklama ve ödemeler kalsın. Silme yalnız yanlış
            açılmış kayıt için ve cari hareketi olan öğrencide çalışmaz.
          </p>
          <div className="mt-2 flex justify-end">
            <SilDugmesi
              etiket="Öğrenciyi sil"
              onayEtiketi="Kalıcı olarak sil"
              islem={() => ogrenciSil(ogrenci.id)}
              tamamlandi={() => yonlendirici.push("/kampus/ogrenciler")}
            />
          </div>
        </div>
      </Kip>
    </>
  );
}
