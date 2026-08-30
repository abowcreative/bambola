"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  veliEkle,
  veliGuncelle,
  veliSil,
  ogrenciyeVeliBagla,
  veliBagiKaldir,
  type VeliGirdisi,
} from "@/lib/kampus/ogrenci-islemleri";
import { veliyeHesapBagla } from "@/lib/kampus/kullanici-islemleri";
import { YAKINLIK_ETIKET } from "@/lib/kampus/ogrenci-tipleri";
import { Ikon } from "@/components/ui/ikon";
import { ALAN, AlanKutusu, Bildirim, Dugme } from "./ui";
import { Firildak, Kip, SilDugmesi } from "./ui-istemci";

/**
 * Veli kaydi: ekleme, duzenleme, silme ve ogrenciye baglama.
 *
 * Veli kaydi ONCEDEN yalniz `ogrenciEkle` icinden dogabiliyordu; velisi
 * degisen, ikinci velisi eklenen ya da telefonu yanlis girilmis bir aile
 * icin panelde yapilacak hicbir sey yoktu. Buradaki islemler o bosluğu
 * kapatiyor.
 */

const YAKINLIKLAR = ["anne", "baba", "vasi", "veli"] as const;

export type VeliKunyesi = {
  id: string;
  ad_soyad: string;
  telefon: string;
  eposta: string | null;
  adres: string | null;
  notlar: string | null;
};

/* ------------------------------------------------------ ekle / duzenle */

export function VeliFormu({
  veli,
  dugmeEtiketi,
  gorunum = "ikincil",
}: {
  /** Verilirse duzenleme, verilmezse yeni kayit. */
  veli?: VeliKunyesi;
  dugmeEtiketi?: string;
  gorunum?: "birincil" | "ikincil";
}) {
  const yonlendirici = useRouter();
  const [acik, setAcik] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  const [d, setD] = useState({
    adSoyad: veli?.ad_soyad ?? "",
    telefon: veli?.telefon ?? "",
    eposta: veli?.eposta ?? "",
    adres: veli?.adres ?? "",
    notlar: veli?.notlar ?? "",
  });

  const yaz = (alan: keyof typeof d) => (e: { target: { value: string } }) =>
    setD((s) => ({ ...s, [alan]: e.target.value }));

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);
    basla(async () => {
      const girdi: VeliGirdisi = d;
      const sonuc = veli
        ? await veliGuncelle(veli.id, girdi)
        : await veliEkle(girdi);
      if (sonuc.ok) {
        setAcik(false);
        if (!veli) {
          setD({ adSoyad: "", telefon: "", eposta: "", adres: "", notlar: "" });
          if (sonuc.id) yonlendirici.push(`/kampus/veliler/${sonuc.id}`);
        }
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <>
      <Dugme type="button" gorunum={gorunum} onClick={() => setAcik(true)}>
        {veli ? <Ikon.Not boyut={15} /> : <Ikon.Grup boyut={15} />}
        {dugmeEtiketi ?? (veli ? "Düzenle" : "Veli ekle")}
      </Dugme>

      <Kip
        acik={acik}
        kapat={() => setAcik(false)}
        genislik="36rem"
        baslik={veli ? "Veli bilgileri" : "Yeni veli"}
        aciklama={
          veli
            ? undefined
            : "Aynı telefonla kayıtlı veli varsa yeni kayıt açılmaz, var olan açılır."
        }
      >
        <form onSubmit={gonder} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <AlanKutusu etiket="Ad soyad" htmlFor="v-ad" gerekli>
              <input
                id="v-ad"
                required
                value={d.adSoyad}
                onChange={yaz("adSoyad")}
                disabled={bekliyor}
                className={ALAN}
                placeholder="Ayşe Yılmaz"
              />
            </AlanKutusu>
            <AlanKutusu
              etiket="Telefon"
              htmlFor="v-tel"
              gerekli
              ipucu="0532 111 22 33 · aramada kullanılan numara"
            >
              <input
                id="v-tel"
                required
                value={d.telefon}
                onChange={yaz("telefon")}
                disabled={bekliyor}
                className={ALAN}
              />
            </AlanKutusu>
            <AlanKutusu
              etiket="E-posta"
              htmlFor="v-eposta"
              className="sm:col-span-2"
            >
              <input
                id="v-eposta"
                type="email"
                value={d.eposta}
                onChange={yaz("eposta")}
                disabled={bekliyor}
                className={ALAN}
              />
            </AlanKutusu>
            <AlanKutusu
              etiket="Adres"
              htmlFor="v-adres"
              className="sm:col-span-2"
            >
              <input
                id="v-adres"
                value={d.adres}
                onChange={yaz("adres")}
                disabled={bekliyor}
                className={ALAN}
              />
            </AlanKutusu>
            <AlanKutusu etiket="Not" htmlFor="v-not" className="sm:col-span-2">
              <textarea
                id="v-not"
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

        {veli && (
          <div className="mt-5 rounded-panel border border-tehlike/20 bg-tehlike-zemin/50 px-4 py-3">
            <p className="font-baslik text-sm font-bold text-murekkep">
              Kaydı sil
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-panel-soluk">
              Bağlı çocuğu olan veli silinmez. Önce çocuk bağlantıları
              kaldırılmalı.
            </p>
            <div className="mt-2 flex justify-end">
              <SilDugmesi
                etiket="Veliyi sil"
                onayEtiketi="Kalıcı olarak sil"
                islem={() => veliSil(veli.id)}
                tamamlandi={() => yonlendirici.push("/kampus/veliler")}
              />
            </div>
          </div>
        )}
      </Kip>
    </>
  );
}

/* -------------------------------------------------------------- baglama */

/**
 * Ogrenciye veli baglar.
 *
 * Iki yol var ve ikisi de ayni kipte: var olan bir veliyi secmek (kardes
 * kaydinda ayni anne), ya da yeni bir veli girmek (bosanmis ailede ikinci
 * ev, bakici, vasi). Ayri ekranlara bolunseydi "once veliyi ac, sonra
 * ogrenciye don" gibi iki adimli bir is cikardi.
 */
export function VeliBagla({
  ogrenciId,
  veliler,
  bagliOlanlar,
}: {
  ogrenciId: string;
  veliler: { id: string; ad_soyad: string; telefon: string }[];
  bagliOlanlar: string[];
}) {
  const yonlendirici = useRouter();
  const [acik, setAcik] = useState(false);
  const [kip, setKip] = useState<"mevcut" | "yeni">("mevcut");
  const [veliId, setVeliId] = useState("");
  const [yakinlik, setYakinlik] = useState<string>("anne");
  const [birincil, setBirincil] = useState(false);
  const [yeni, setYeni] = useState({ adSoyad: "", telefon: "", eposta: "" });
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  const secilebilir = veliler.filter((v) => !bagliOlanlar.includes(v.id));

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);

    basla(async () => {
      let hedefId = veliId;

      if (kip === "yeni") {
        const olustur = await veliEkle(yeni);
        if (!olustur.ok) {
          setHata(olustur.hata);
          return;
        }
        hedefId = olustur.id!;
      }

      if (!hedefId) {
        setHata("Bir veli seçin.");
        return;
      }

      const sonuc = await ogrenciyeVeliBagla({
        ogrenciId,
        veliId: hedefId,
        yakinlik,
        birincil,
      });
      if (sonuc.ok) {
        setAcik(false);
        setVeliId("");
        setYeni({ adSoyad: "", telefon: "", eposta: "" });
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <>
      <Dugme type="button" olcu="sm" onClick={() => setAcik(true)}>
        <Ikon.Grup boyut={14} />
        Veli bağla
      </Dugme>

      <Kip
        acik={acik}
        kapat={() => setAcik(false)}
        genislik="34rem"
        baslik="Veli bağla"
        aciklama="Var olan bir veliyi seçin ya da yeni kayıt açın."
      >
        <form onSubmit={gonder} className="space-y-4">
          <div className="flex gap-1 rounded-panel-sm bg-panel-zemin p-1">
            {(
              [
                ["mevcut", "Kayıtlı veli"],
                ["yeni", "Yeni veli"],
              ] as const
            ).map(([k, e]) => (
              <button
                key={k}
                type="button"
                onClick={() => setKip(k)}
                aria-pressed={kip === k}
                className={`flex-1 rounded-panel-sm px-3 py-1.5 font-baslik text-sm font-semibold transition-colors ${
                  kip === k
                    ? "bg-panel-yuzey text-murekkep shadow-panel"
                    : "text-panel-soluk hover:text-murekkep"
                }`}
              >
                {e}
              </button>
            ))}
          </div>

          {kip === "mevcut" ? (
            <AlanKutusu
              etiket="Veli"
              htmlFor="vb-secim"
              ipucu={
                secilebilir.length === 0
                  ? "Bağlanabilecek başka veli kaydı yok."
                  : undefined
              }
            >
              <select
                id="vb-secim"
                value={veliId}
                onChange={(e) => setVeliId(e.target.value)}
                disabled={bekliyor || secilebilir.length === 0}
                className={ALAN}
              >
                <option value="">Seçin…</option>
                {secilebilir.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.ad_soyad} · 0{v.telefon}
                  </option>
                ))}
              </select>
            </AlanKutusu>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <AlanKutusu
                etiket="Ad soyad"
                htmlFor="vb-ad"
                gerekli
                className="sm:col-span-2"
              >
                <input
                  id="vb-ad"
                  required={kip === "yeni"}
                  value={yeni.adSoyad}
                  onChange={(e) =>
                    setYeni((s) => ({ ...s, adSoyad: e.target.value }))
                  }
                  disabled={bekliyor}
                  className={ALAN}
                />
              </AlanKutusu>
              <AlanKutusu etiket="Telefon" htmlFor="vb-tel" gerekli>
                <input
                  id="vb-tel"
                  required={kip === "yeni"}
                  value={yeni.telefon}
                  onChange={(e) =>
                    setYeni((s) => ({ ...s, telefon: e.target.value }))
                  }
                  disabled={bekliyor}
                  className={ALAN}
                />
              </AlanKutusu>
              <AlanKutusu etiket="E-posta" htmlFor="vb-eposta">
                <input
                  id="vb-eposta"
                  type="email"
                  value={yeni.eposta}
                  onChange={(e) =>
                    setYeni((s) => ({ ...s, eposta: e.target.value }))
                  }
                  disabled={bekliyor}
                  className={ALAN}
                />
              </AlanKutusu>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <AlanKutusu etiket="Yakınlık" htmlFor="vb-yakinlik">
              <select
                id="vb-yakinlik"
                value={yakinlik}
                onChange={(e) => setYakinlik(e.target.value)}
                disabled={bekliyor}
                className={ALAN}
              >
                {YAKINLIKLAR.map((y) => (
                  <option key={y} value={y}>
                    {YAKINLIK_ETIKET[y]}
                  </option>
                ))}
              </select>
            </AlanKutusu>
            <label className="flex items-end gap-2 pb-2 text-sm text-murekkep">
              <input
                type="checkbox"
                checked={birincil}
                onChange={(e) => setBirincil(e.target.checked)}
                disabled={bekliyor}
                className="size-4 accent-[var(--color-yesil-koyu)]"
              />
              Birincil veli (önce bu numara aranır)
            </label>
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
              Bağla
            </Dugme>
          </div>
        </form>
      </Kip>
    </>
  );
}

/** Ogrenci-veli baglantisini koparir. Son veli koparilamiyor. */
export function VeliBagiKaldir({
  ogrenciId,
  veliId,
}: {
  ogrenciId: string;
  veliId: string;
}) {
  return (
    <SilDugmesi
      etiket="Bağı kaldır"
      onayEtiketi="Onayla"
      islem={() => veliBagiKaldir(ogrenciId, veliId)}
    />
  );
}

/* ------------------------------------------------------------ panel hesabi */

/**
 * Veli kaydini bir panel hesabina baglar.
 *
 * Baglanti olmadan veli oturum acsa bile kendi cocugunu goremiyor: RLS
 * `veli_kaydim()` fonksiyonu `veliler.profil_id` uzerinden bakiyor. Hesap
 * acma isi Kullanicilar bolumunde; burada yalniz eslestirme yapiliyor.
 */
export function VeliHesapBagla({
  veliId,
  seciliProfilId,
  hesaplar,
}: {
  veliId: string;
  seciliProfilId: string | null;
  hesaplar: { id: string; ad_soyad: string }[];
}) {
  const yonlendirici = useRouter();
  const [deger, setDeger] = useState(seciliProfilId ?? "");
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  function degistir(yeni: string) {
    const onceki = deger;
    setDeger(yeni);
    setHata(null);
    basla(async () => {
      const sonuc = await veliyeHesapBagla(veliId, yeni || null);
      if (sonuc.ok) yonlendirici.refresh();
      else {
        setDeger(onceki);
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <div>
      <select
        value={deger}
        onChange={(e) => degistir(e.target.value)}
        disabled={bekliyor}
        aria-label="Panel hesabı"
        className={ALAN}
      >
        <option value="">Bağlı hesap yok</option>
        {hesaplar.map((h) => (
          <option key={h.id} value={h.id}>
            {h.ad_soyad}
          </option>
        ))}
      </select>
      {hata ? (
        <p role="alert" className="mt-1 text-xs font-medium text-tehlike">
          {hata}
        </p>
      ) : (
        <p className="mt-1 text-xs text-panel-silik">
          Listede yalnız “veli” rolündeki hesaplar var. Yeni hesap Kullanıcılar
          bölümünden açılır.
        </p>
      )}
    </div>
  );
}
