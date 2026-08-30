"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  hesapAc,
  profilGuncelle,
  aktiflikDegistir,
  hesapSil,
  sifreBaglantisiUret,
  type HesapGirdisi,
} from "@/lib/kampus/kullanici-islemleri";
import { Ikon } from "@/components/ui/ikon";
import { ALAN, AlanKutusu, Bildirim, Dugme, IkonDugme } from "./ui";
import { Firildak, Kip, SilDugmesi } from "./ui-istemci";

/**
 * Kampus hesaplari.
 *
 * Hesap acmak Supabase yonetici anahtarini gerektiriyor; anahtar sunucuda
 * kaliyor, tarayiciya hicbir sey gecmiyor (bkz. lib/kampus/kullanici-
 * islemleri.ts).
 *
 * SIFRE BURADA BELIRLENMIYOR. Islem tek kullanimlik bir baglanti uretiyor,
 * kisi kendi sifresini kendisi koyuyor. Baglanti ekranda gosteriliyor ve
 * e-posta GONDERILMIYOR: Supabase'in yerlesik gondericisi yapilandirilmadi
 * ve baglantiyi kime verdigini bilerek elden vermek daha temiz.
 */

const ROLLER = [
  { deger: "admin", etiket: "Yönetici" },
  { deger: "ogretmen", etiket: "Öğretmen" },
  { deger: "veli", etiket: "Veli" },
] as const;

export type HesapKunyesi = {
  id: string;
  rol: string;
  ad_soyad: string;
  telefon: string | null;
  ogretmen_ad: string | null;
  aktif: boolean;
};

/** Uretilen sifre baglantisini gosteren kutu. Kopyalama dugmesiyle. */
function BaglantiKutusu({ baglanti }: { baglanti: string }) {
  const [kopyalandi, setKopyalandi] = useState(false);

  async function kopyala() {
    try {
      await navigator.clipboard.writeText(baglanti);
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2500);
    } catch {
      /* Pano izni yoksa metin zaten ekranda ve elle secilebiliyor. */
    }
  }

  return (
    <Bildirim ton="basari" baslik="Şifre belirleme bağlantısı hazır">
      <p className="text-xs leading-relaxed">
        Yalnız hesap sahibine verilir; tek kullanımlık ve süresi sınırlı.
        E-posta gönderilmedi.
      </p>
      <p className="mt-2 break-all rounded-panel-sm border border-panel-cizgi bg-panel-yuzey px-3 py-2 font-mono text-xs text-murekkep">
        {baglanti}
      </p>
      <div className="mt-2">
        <Dugme type="button" olcu="sm" onClick={kopyala}>
          {kopyalandi ? <Ikon.Tik boyut={14} /> : <Ikon.Not boyut={14} />}
          {kopyalandi ? "Kopyalandı" : "Bağlantıyı kopyala"}
        </Dugme>
      </div>
    </Bildirim>
  );
}

/* -------------------------------------------------------------- hesap ac */

export function HesapAcFormu({ ogretmenler }: { ogretmenler: string[] }) {
  const yonlendirici = useRouter();
  const [acik, setAcik] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [baglanti, setBaglanti] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  const [d, setD] = useState({
    eposta: "",
    adSoyad: "",
    rol: "ogretmen",
    telefon: "",
    ogretmenAd: "",
  });

  const yaz = (alan: keyof typeof d) => (e: { target: { value: string } }) =>
    setD((s) => ({ ...s, [alan]: e.target.value }));

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);
    setBaglanti(null);
    basla(async () => {
      /* Rol alani state'te duz metin; select yalniz gecerli degerleri
         uretiyor ve sunucu tarafi zod ile yeniden dogruluyor. */
      const sonuc = await hesapAc({ ...d, rol: d.rol as HesapGirdisi["rol"] });
      if (sonuc.ok) {
        setBaglanti(sonuc.baglanti ?? null);
        setD({
          eposta: "",
          adSoyad: "",
          rol: "ogretmen",
          telefon: "",
          ogretmenAd: "",
        });
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <>
      <Dugme type="button" gorunum="birincil" onClick={() => setAcik(true)}>
        <Ikon.Grup boyut={16} />
        Hesap aç
      </Dugme>

      <Kip
        acik={acik}
        kapat={() => {
          setAcik(false);
          setBaglanti(null);
        }}
        genislik="34rem"
        baslik="Yeni hesap"
        aciklama="Şifre belirlenmez; işlem tek kullanımlık bir bağlantı üretir."
      >
        <form onSubmit={gonder} className="space-y-3">
          <AlanKutusu etiket="E-posta" htmlFor="h-eposta" gerekli>
            <input
              id="h-eposta"
              type="email"
              required
              value={d.eposta}
              onChange={yaz("eposta")}
              disabled={bekliyor}
              className={ALAN}
              placeholder="emine@bambola.com.tr"
            />
          </AlanKutusu>

          <div className="grid gap-3 sm:grid-cols-2">
            <AlanKutusu etiket="Ad soyad" htmlFor="h-ad" gerekli>
              <input
                id="h-ad"
                required
                value={d.adSoyad}
                onChange={yaz("adSoyad")}
                disabled={bekliyor}
                className={ALAN}
              />
            </AlanKutusu>
            <AlanKutusu etiket="Telefon" htmlFor="h-tel">
              <input
                id="h-tel"
                value={d.telefon}
                onChange={yaz("telefon")}
                disabled={bekliyor}
                className={ALAN}
              />
            </AlanKutusu>
          </div>

          <AlanKutusu etiket="Rol" htmlFor="h-rol">
            <select
              id="h-rol"
              value={d.rol}
              onChange={yaz("rol")}
              disabled={bekliyor}
              className={ALAN}
            >
              {ROLLER.map((r) => (
                <option key={r.deger} value={r.deger}>
                  {r.etiket}
                </option>
              ))}
            </select>
          </AlanKutusu>

          {d.rol === "ogretmen" && (
            <AlanKutusu
              etiket="Program adı"
              htmlFor="h-ogretmen"
              gerekli
              ipucu="Haftalık programdaki adla birebir aynı olmalı; soyad eklenirse öğretmen kendi sınıfını göremez."
            >
              <select
                id="h-ogretmen"
                required
                value={d.ogretmenAd}
                onChange={yaz("ogretmenAd")}
                disabled={bekliyor}
                className={ALAN}
              >
                <option value="">Seçin…</option>
                {ogretmenler.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </AlanKutusu>
          )}

          {hata && <Bildirim ton="tehlike">{hata}</Bildirim>}
          {baglanti && <BaglantiKutusu baglanti={baglanti} />}

          <div className="flex flex-wrap justify-end gap-2 border-t border-panel-cizgi pt-4">
            <Dugme
              type="button"
              onClick={() => {
                setAcik(false);
                setBaglanti(null);
              }}
              disabled={bekliyor}
            >
              Kapat
            </Dugme>
            <Dugme type="submit" gorunum="birincil" disabled={bekliyor}>
              {bekliyor && <Firildak />}
              {bekliyor ? "Açılıyor…" : "Hesabı aç"}
            </Dugme>
          </div>
        </form>
      </Kip>
    </>
  );
}

/* ------------------------------------------------------------- duzenleme */

export function HesapDuzenle({
  hesap,
  ogretmenler,
  kendisi,
}: {
  hesap: HesapKunyesi;
  ogretmenler: string[];
  /** Oturumu acan kisinin kendi hesabi mi. */
  kendisi: boolean;
}) {
  const yonlendirici = useRouter();
  const [acik, setAcik] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [baglanti, setBaglanti] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  const [d, setD] = useState({
    adSoyad: hesap.ad_soyad,
    rol: hesap.rol,
    telefon: hesap.telefon ?? "",
    ogretmenAd: hesap.ogretmen_ad ?? "",
  });

  const yaz = (alan: keyof typeof d) => (e: { target: { value: string } }) =>
    setD((s) => ({ ...s, [alan]: e.target.value }));

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);
    basla(async () => {
      const sonuc = await profilGuncelle({
        id: hesap.id,
        ...d,
        rol: d.rol as HesapGirdisi["rol"],
      });
      if (sonuc.ok) {
        setAcik(false);
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  function sifreUret() {
    setHata(null);
    basla(async () => {
      const sonuc = await sifreBaglantisiUret(hesap.id);
      if (sonuc.ok) setBaglanti(sonuc.baglanti ?? null);
      else setHata(sonuc.hata);
    });
  }

  function aktifligiCevir() {
    setHata(null);
    basla(async () => {
      const sonuc = await aktiflikDegistir(hesap.id, !hesap.aktif);
      if (sonuc.ok) yonlendirici.refresh();
      else setHata(sonuc.hata);
    });
  }

  return (
    <>
      <IkonDugme baslik="Hesabı düzenle" onClick={() => setAcik(true)}>
        <Ikon.Not boyut={15} />
      </IkonDugme>

      <Kip
        acik={acik}
        kapat={() => setAcik(false)}
        genislik="34rem"
        baslik={hesap.ad_soyad}
        aciklama={kendisi ? "Kendi hesabınız." : undefined}
      >
        <form onSubmit={gonder} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <AlanKutusu etiket="Ad soyad" htmlFor="hd-ad" gerekli>
              <input
                id="hd-ad"
                required
                value={d.adSoyad}
                onChange={yaz("adSoyad")}
                disabled={bekliyor}
                className={ALAN}
              />
            </AlanKutusu>
            <AlanKutusu etiket="Telefon" htmlFor="hd-tel">
              <input
                id="hd-tel"
                value={d.telefon}
                onChange={yaz("telefon")}
                disabled={bekliyor}
                className={ALAN}
              />
            </AlanKutusu>
          </div>

          <AlanKutusu
            etiket="Rol"
            htmlFor="hd-rol"
            ipucu={
              kendisi
                ? "Kendi yöneticiliğinizi kaldıramazsınız; başka bir yönetici yapmalı."
                : undefined
            }
          >
            <select
              id="hd-rol"
              value={d.rol}
              onChange={yaz("rol")}
              disabled={bekliyor}
              className={ALAN}
            >
              {ROLLER.map((r) => (
                <option key={r.deger} value={r.deger}>
                  {r.etiket}
                </option>
              ))}
            </select>
          </AlanKutusu>

          {d.rol === "ogretmen" && (
            <AlanKutusu etiket="Program adı" htmlFor="hd-ogretmen" gerekli>
              <select
                id="hd-ogretmen"
                required
                value={d.ogretmenAd}
                onChange={yaz("ogretmenAd")}
                disabled={bekliyor}
                className={ALAN}
              >
                <option value="">Seçin…</option>
                {ogretmenler.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </AlanKutusu>
          )}

          {hata && <Bildirim ton="tehlike">{hata}</Bildirim>}
          {baglanti && <BaglantiKutusu baglanti={baglanti} />}

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
              Kaydet
            </Dugme>
          </div>
        </form>

        <div className="mt-5 space-y-2 border-t border-panel-cizgi pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-panel-soluk">
              Şifresini unuttuysa yeni bağlantı üretin.
            </span>
            <Dugme
              type="button"
              olcu="sm"
              onClick={sifreUret}
              disabled={bekliyor}
            >
              Şifre bağlantısı üret
            </Dugme>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-panel-soluk">
              {hesap.aktif
                ? "Kapalı hesap oturum açsa bile hiçbir şeye erişemez."
                : "Hesap şu an kapalı."}
            </span>
            <Dugme
              type="button"
              olcu="sm"
              onClick={aktifligiCevir}
              disabled={bekliyor || kendisi}
            >
              {hesap.aktif ? "Hesabı kapat" : "Hesabı aç"}
            </Dugme>
          </div>
        </div>

        {!kendisi && (
          <div className="mt-4 rounded-panel border border-tehlike/20 bg-tehlike-zemin/50 px-4 py-3">
            <p className="font-baslik text-sm font-bold text-murekkep">
              Hesabı sil
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-panel-soluk">
              Normal yol <strong>kapatmak</strong>: kapalı hesap geçmiş
              kayıtlardaki adı korur. Silme yalnız yanlış açılmış hesap için.
            </p>
            <div className="mt-2 flex justify-end">
              <SilDugmesi
                etiket="Hesabı sil"
                onayEtiketi="Kalıcı olarak sil"
                islem={() => hesapSil(hesap.id)}
                tamamlandi={() => setAcik(false)}
              />
            </div>
          </div>
        )}
      </Kip>
    </>
  );
}
