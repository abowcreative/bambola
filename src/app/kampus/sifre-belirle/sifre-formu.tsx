"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { tarayiciIstemcisi } from "@/lib/supabase/client";
import { Buton } from "@/components/ui/buton";

const ALAN =
  "w-full rounded-yumusak border-2 border-cizgi bg-white px-4 py-3 text-murekkep " +
  "outline-none transition-colors focus:border-yesil disabled:opacity-60";

/** Kisa sifre en sik guvenlik acigi. Sekiz karakter alt sinir. */
const EN_AZ = 8;

export function SifreFormu() {
  const yonlendirici = useRouter();
  const [hazir, setHazir] = useState<boolean | null>(null);
  const [sifre, setSifre] = useState("");
  const [tekrar, setTekrar] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [bitti, setBitti] = useState(false);
  const [bekliyor, basla] = useTransition();

  /*
    Baglantidaki belirtec tarayici istemcisi tarafindan adres parcasindan
    okunup gecici oturuma cevriliyor. Bu bir an suruyor, o yuzden once
    oturumun gerceklesip gerceklesmedigine bakiliyor: gecersiz veya suresi
    dolmus baglantiyla gelen kisi bos bir form doldurup hata almasin.
  */
  useEffect(() => {
    const db = tarayiciIstemcisi();
    let iptal = false;

    const bak = async () => {
      const {
        data: { session },
      } = await db.auth.getSession();
      if (!iptal) setHazir(Boolean(session));
    };

    // Belirtec islenince olay tetikleniyor; ilk bakis kaciran durumu kapatiyor.
    const { data: abone } = db.auth.onAuthStateChange((_olay, oturum) => {
      if (!iptal && oturum) setHazir(true);
    });

    const zamanlayici = setTimeout(bak, 600);

    return () => {
      iptal = true;
      clearTimeout(zamanlayici);
      abone.subscription.unsubscribe();
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
      setHata("Şifre kaydedilemedi. Bağlantının süresi dolmuş olabilir.");
      return;
    }

    setBitti(true);
    basla(() => {
      yonlendirici.refresh();
      yonlendirici.replace("/kampus");
    });
  }

  if (hazir === null) {
    return <p className="text-murekkep-soluk">Bağlantı kontrol ediliyor...</p>;
  }

  if (!hazir) {
    return (
      <div className="space-y-3">
        <p className="leading-relaxed text-murekkep">
          Bu bağlantı geçersiz veya süresi dolmuş.
        </p>
        <p className="text-sm leading-relaxed text-murekkep-soluk">
          Kurum yöneticisinden yeni bir bağlantı isteyin.
        </p>
      </div>
    );
  }

  if (bitti) {
    return (
      <p className="leading-relaxed text-murekkep">
        Şifreniz kaydedildi, panele yönlendiriliyorsunuz.
      </p>
    );
  }

  return (
    <form onSubmit={gonder} className="space-y-4">
      <div>
        <label
          htmlFor="sifre"
          className="mb-1.5 block font-baslik text-sm font-semibold text-murekkep"
        >
          Yeni şifre
        </label>
        <input
          id="sifre"
          type="password"
          autoComplete="new-password"
          required
          minLength={EN_AZ}
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
          disabled={bekliyor}
          className={ALAN}
        />
        <p className="mt-1.5 text-xs text-murekkep-soluk">
          En az {EN_AZ} karakter.
        </p>
      </div>

      <div>
        <label
          htmlFor="tekrar"
          className="mb-1.5 block font-baslik text-sm font-semibold text-murekkep"
        >
          Şifre tekrar
        </label>
        <input
          id="tekrar"
          type="password"
          autoComplete="new-password"
          required
          value={tekrar}
          onChange={(e) => setTekrar(e.target.value)}
          disabled={bekliyor}
          className={ALAN}
        />
      </div>

      {hata && (
        <p
          role="alert"
          className="rounded-yumusak border-2 border-dashed border-cizgi bg-krem px-4 py-3 text-sm text-murekkep"
        >
          {hata}
        </p>
      )}

      <Buton type="submit" disabled={bekliyor} className="w-full">
        {bekliyor ? "Kaydediliyor..." : "Şifreyi kaydet"}
      </Buton>
    </form>
  );
}
