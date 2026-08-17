"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ogrenciEkle,
  leaddenOgrenciOlustur,
  type YeniOgrenciGirdisi,
} from "@/lib/kampus/ogrenci-islemleri";
import { YAKINLIK_ETIKET } from "@/lib/kampus/ogrenci-tipleri";
import { Buton } from "@/components/ui/buton";
import { Ikon } from "@/components/ui/ikon";

const ALAN =
  "w-full rounded-yumusak border-2 border-cizgi bg-white px-3.5 py-2 text-sm " +
  "text-murekkep outline-none transition-colors placeholder:text-murekkep-soluk/60 " +
  "focus:border-yesil disabled:opacity-60";

const ETIKET = "mb-1 block text-xs font-medium text-murekkep-soluk";

export type OgrenciFormuBaslangici = {
  ad?: string;
  dogumTarihi?: string;
  notlar?: string;
  veliAdSoyad?: string;
  veliTelefon?: string;
};

/**
 * Yeni ogrenci formu.
 *
 * Cocuk ve VELI bilgisi ayni formda, ikisi de zorunlu: velisi olmayan bir
 * ogrenci kaydi kime ulasilacagini bilmediginiz bir kayittir.
 *
 * Sinif ve ucret istege bagli ama ayni formda: "yeni cocuk geldi" isinin
 * tamami tek ekranda bitiyor, dort ayri sayfada degil.
 *
 * `leadId` verilirse kayit lead'e baglanir ve lead "kayit_oldu" olur:
 * Instagram'dan gelen talep ile ogrenci kaydi arasindaki zincir kopmaz.
 */
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

  if (!acik) {
    return (
      <Buton type="button" olcu="sm" onClick={() => setAcik(true)}>
        <Ikon.Bebek boyut={16} />
        Öğrenci ekle
      </Buton>
    );
  }

  return (
    <form
      onSubmit={gonder}
      className="rounded-blok border-2 border-yesil bg-white p-5"
    >
      <h2 className="font-baslik text-lg font-bold text-murekkep">
        {leadId ? "Lead'i öğrenciye dönüştür" : "Yeni öğrenci"}
      </h2>
      {leadId && (
        <p className="mt-1 text-sm text-murekkep-soluk">
          Lead kaydı silinmez; kayıt tamamlandığında &quot;Kayıt oldu&quot;
          işaretlenip bu öğrenciye bağlanır.
        </p>
      )}

      {/* --------------------------------------------------------- cocuk */}
      <fieldset className="mt-4">
        <legend className="font-baslik text-sm font-bold text-murekkep">
          Çocuk
        </legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <label>
            <span className={ETIKET}>Ad *</span>
            <input
              required
              value={d.ad}
              onChange={yaz("ad")}
              disabled={bekliyor}
              className={ALAN}
              placeholder="Deniz"
            />
          </label>
          <label>
            <span className={ETIKET}>Soyad</span>
            <input
              value={d.soyad}
              onChange={yaz("soyad")}
              disabled={bekliyor}
              className={ALAN}
            />
          </label>
          <label>
            <span className={ETIKET}>Doğum tarihi *</span>
            <input
              type="date"
              required
              value={d.dogumTarihi}
              onChange={yaz("dogumTarihi")}
              disabled={bekliyor}
              className={ALAN}
            />
          </label>
          <label>
            <span className={ETIKET}>Kurum</span>
            <select
              value={d.kurum}
              onChange={yaz("kurum")}
              disabled={bekliyor}
              className={ALAN}
            >
              <option value="oyun-evi">Oyun evi</option>
              <option value="anaokulu">Anaokulu</option>
              <option value="parti">Parti</option>
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className={ETIKET}>Alerji</span>
            <input
              value={d.alerji}
              onChange={yaz("alerji")}
              disabled={bekliyor}
              className={ALAN}
              placeholder="Fıstık, süt"
            />
            <span className="mt-1 block text-xs text-murekkep-soluk">
              Girilirse öğrenci kartında, yoklama listesinde ve yemek
              sayfasında vurgulu görünür.
            </span>
          </label>
          <label className="sm:col-span-2">
            <span className={ETIKET}>Sağlık notu</span>
            <input
              value={d.saglikNotu}
              onChange={yaz("saglikNotu")}
              disabled={bekliyor}
              className={ALAN}
            />
          </label>
          {/*
            Not alani GORUNUR duruyor: lead'den donusturmede lead'in notu
            buraya tasiniyor. Gorunmeden kaydedilen bir metin, sonra kimin
            yazdigi anlasilmayan bir nota donusur.
          */}
          <label className="sm:col-span-2">
            <span className={ETIKET}>Not</span>
            <textarea
              rows={2}
              value={d.notlar}
              onChange={yaz("notlar")}
              disabled={bekliyor}
              className={`${ALAN} resize-y`}
              placeholder="Eylülde başlayacak, ablası da bizde."
            />
          </label>
        </div>
      </fieldset>

      {/* ---------------------------------------------------------- veli */}
      <fieldset className="mt-5 border-t border-cizgi pt-4">
        <legend className="font-baslik text-sm font-bold text-murekkep">
          Veli
        </legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <label>
            <span className={ETIKET}>Ad soyad *</span>
            <input
              required
              value={d.veliAdSoyad}
              onChange={yaz("veliAdSoyad")}
              disabled={bekliyor}
              className={ALAN}
              placeholder="Ayşe Yılmaz"
            />
          </label>
          <label>
            <span className={ETIKET}>Yakınlık</span>
            <select
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
          </label>
          <label>
            <span className={ETIKET}>Telefon *</span>
            <input
              required
              value={d.veliTelefon}
              onChange={yaz("veliTelefon")}
              disabled={bekliyor}
              className={ALAN}
              placeholder="0532 111 22 33"
            />
            <span className="mt-1 block text-xs text-murekkep-soluk">
              Aynı numarayla kayıtlı veli varsa yeni kayıt açılmaz, mevcut
              veliye bağlanır.
            </span>
          </label>
          <label>
            <span className={ETIKET}>E-posta</span>
            <input
              type="email"
              value={d.veliEposta}
              onChange={yaz("veliEposta")}
              disabled={bekliyor}
              className={ALAN}
            />
          </label>
        </div>
      </fieldset>

      {/* ------------------------------------------------ sinif ve ucret */}
      <fieldset className="mt-5 border-t border-cizgi pt-4">
        <legend className="font-baslik text-sm font-bold text-murekkep">
          Sınıf ve ücret
          <span className="ml-2 font-normal text-murekkep-soluk">
            isteğe bağlı
          </span>
        </legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          <label className="sm:col-span-3">
            <span className={ETIKET}>Sınıf</span>
            <select
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
          </label>
          <label>
            <span className={ETIKET}>Paket</span>
            <input
              value={d.paketKod}
              onChange={yaz("paketKod")}
              disabled={bekliyor}
              className={ALAN}
              placeholder="ayda-8"
            />
          </label>
          <label className="sm:col-span-2">
            <span className={ETIKET}>Ücret (TL)</span>
            <input
              type="number"
              min={0}
              step={1}
              value={d.ucret}
              onChange={yaz("ucret")}
              disabled={bekliyor}
              className={ALAN}
              placeholder="8000"
            />
            <span className="mt-1 block text-xs text-murekkep-soluk">
              Girilirse cari hesaba borç kaydı olarak işlenir.
            </span>
          </label>
        </div>
      </fieldset>

      {hata && (
        <p
          role="alert"
          className="mt-4 rounded-yumusak border-2 border-dashed border-cizgi bg-krem px-4 py-3 text-sm text-murekkep"
        >
          {hata}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <Buton type="submit" disabled={bekliyor}>
          {bekliyor ? "Kaydediliyor..." : "Öğrenciyi kaydet"}
        </Buton>
        <Buton
          type="button"
          gorunum="cizgili"
          onClick={() => setAcik(false)}
          disabled={bekliyor}
        >
          Vazgeç
        </Buton>
      </div>
    </form>
  );
}
