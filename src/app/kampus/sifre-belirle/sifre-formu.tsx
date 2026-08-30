"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { tarayiciIstemcisi } from "@/lib/supabase/client";
import { ALAN, AlanKutusu, Bildirim, Dugme } from "@/components/kampus/ui";
import { Firildak } from "@/components/kampus/ui-istemci";

/** Kisa sifre en sik guvenlik acigi. Sekiz karakter alt sinir. */
const EN_AZ = 8;

export function SifreFormu() {
  const yonlendirici = useRouter();
  const [hazir, setHazir] = useState<boolean | null>(null);
  /** Baglanti calismadiysa Supabase'in soyledigi sebep. Teshis icin. */
  const [sebep, setSebep] = useState<string | null>(null);
  const [sifre, setSifre] = useState("");
  const [tekrar, setTekrar] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [bitti, setBitti] = useState(false);
  const [bekliyor, basla] = useTransition();

  /*
    Belirtec adres SORGUSUNDAN aliniyor ve `verifyOtp` ile oturuma
    cevriliyor.

    Neden Supabase'in kendi baglantisi degil: o baglanti belirteci adres
    parcasinda (hash) birakiyor, @supabase/ssr ise varsayilan olarak PKCE
    akisinda ve tarayicida saklanmis bir dogrulayici ariyor. Baglantiyla
    gelen kiside oyle bir kayit yok, belirtec goz ardi ediliyordu.
    `verifyOtp` akistan bagimsiz calisiyor.
  */
  useEffect(() => {
    let iptal = false;

    (async () => {
      const belirtec = new URLSearchParams(window.location.search).get(
        "belirtec",
      );

      if (!belirtec) {
        // Zaten oturumu acik biri sifresini degistirmek icin gelmis olabilir.
        const {
          data: { session },
        } = await tarayiciIstemcisi().auth.getSession();
        if (!iptal) setHazir(Boolean(session));
        return;
      }

      const { error } = await tarayiciIstemcisi().auth.verifyOtp({
        token_hash: belirtec,
        type: "recovery",
      });

      if (iptal) return;
      if (error) {
        setHazir(false);
        setSebep(error.message);
        return;
      }

      /*
        Belirtec adres cubugundan siliniyor: sayfa yenilenirse ayni
        belirtec ikinci kez kullanilmaya calisilir ve "gecersiz" hatasi
        verir, oysa oturum aslinda acilmistir.
      */
      window.history.replaceState(null, "", window.location.pathname);
      setHazir(true);
    })();

    return () => {
      iptal = true;
    };
  }, []);

  async function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);

    if (sifre.length < EN_AZ) {
      setHata(`Şifre en az ${EN_AZ} karakter olmalı.`);
      return;
    }
    if (sifre !== tekrar) {
      setHata("İki şifre birbirini tutmuyor.");
      return;
    }

    const db = tarayiciIstemcisi();
    const { error } = await db.auth.updateUser({ password: sifre });

    if (error) {
      /*
        Sebep GIZLENMIYOR. Onceki hali her hatada "baglantinin suresi dolmus
        olabilir" diyordu; oysa en sik sebep bu degil: Supabase ayni sifreyi
        tekrar kabul etmiyor ("New password should be different from the old
        password") ve proje ayarindaki uzunluk/karmasiklik kurallarini da
        burada uyguluyor. Tek bir genel cumle, calisan bir baglantiyi bozuk
        sanmaya yol aciyordu.
      */
      setHata(
        error.message === "New password should be different from the old password."
          ? "Yeni şifre eskisiyle aynı olamaz."
          : `Şifre kaydedilemedi: ${error.message}`,
      );
      return;
    }

    setBitti(true);
    basla(() => {
      yonlendirici.refresh();
      yonlendirici.replace("/kampus");
    });
  }

  if (hazir === null) {
    return (
      <p className="flex items-center gap-2 text-sm text-panel-soluk">
        <Firildak />
        Bağlantı kontrol ediliyor…
      </p>
    );
  }

  if (!hazir) {
    return (
      <div className="space-y-3">
        <Bildirim ton="tehlike" baslik="Bu bağlantı geçersiz veya süresi dolmuş">
          Bağlantılar tek kullanımlıktır: bir kez açıldıktan sonra ikinci kez
          çalışmaz. Yeni bağlantı için kurum yöneticisine başvurun.
        </Bildirim>
        {/* Sebep gizlenmiyor: "gecersiz" demek sorunu teshis ettirmiyor. */}
        {sebep && (
          <p className="rounded-panel-sm border border-panel-cizgi bg-panel-yuzey-alt px-3 py-2 font-mono text-xs text-panel-soluk">
            {sebep}
          </p>
        )}
      </div>
    );
  }

  if (bitti) {
    return (
      <Bildirim ton="basari">
        Şifreniz kaydedildi, panele yönlendiriliyorsunuz.
      </Bildirim>
    );
  }

  return (
    <form onSubmit={gonder} className="space-y-3.5">
      <AlanKutusu
        etiket="Yeni şifre"
        htmlFor="sifre"
        gerekli
        ipucu={`En az ${EN_AZ} karakter.`}
      >
        <input
          id="sifre"
          type="password"
          autoComplete="new-password"
          required
          minLength={EN_AZ}
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
          disabled={bekliyor}
          className={`${ALAN} py-2.5`}
        />
      </AlanKutusu>

      <AlanKutusu etiket="Şifre tekrar" htmlFor="tekrar" gerekli>
        <input
          id="tekrar"
          type="password"
          autoComplete="new-password"
          required
          value={tekrar}
          onChange={(e) => setTekrar(e.target.value)}
          disabled={bekliyor}
          className={`${ALAN} py-2.5`}
        />
      </AlanKutusu>

      {hata && <Bildirim ton="tehlike">{hata}</Bildirim>}

      <Dugme
        type="submit"
        gorunum="birincil"
        disabled={bekliyor}
        className="h-10 w-full"
      >
        {bekliyor && <Firildak />}
        {bekliyor ? "Kaydediliyor…" : "Şifreyi kaydet"}
      </Dugme>
    </form>
  );
}
