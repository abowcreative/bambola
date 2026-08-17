"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { tarayiciIstemcisi } from "@/lib/supabase/client";
import { Buton } from "@/components/ui/buton";
import { Ikon } from "@/components/ui/ikon";

/**
 * Giris formu. Supabase Auth ile e-posta + sifre.
 *
 * Giris ISTEMCIDE yapiliyor cunku `@supabase/ssr` tarayici istemcisi oturum
 * cerezlerini kendisi yaziyor; sunucu action'indan yapilsaydi cerezleri
 * elle tasimak gerekirdi. Yetki karari yine sunucuda (bkz. oturum.ts).
 */

const ALAN =
  "w-full rounded-yumusak border-2 border-cizgi bg-white px-4 py-3 text-murekkep " +
  "outline-none transition-colors placeholder:text-murekkep-soluk/60 " +
  "focus:border-yesil disabled:opacity-60";

export function GirisFormu() {
  const yonlendirici = useRouter();
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  async function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);

    const db = tarayiciIstemcisi();
    const { error } = await db.auth.signInWithPassword({
      email: eposta.trim(),
      password: sifre,
    });

    if (error) {
      /*
        Hata mesaji BILEREK genel: "bu e-posta kayitli degil" demek, hangi
        adreslerin sistemde oldugunu disariya soyler. Kurum calisanlarinin
        ve velilerin adresleri bu sekilde sizmasin.
      */
      setHata("E-posta veya şifre hatalı.");
      return;
    }

    /*
      `refresh()` sart: oturum cerezi yeni yazildi, sunucu bilesenleri hala
      eski (oturumsuz) haliyle onbellekte. Yenilenmeden yonlendirilirse
      giris ekranina geri atilir.
    */
    basla(() => {
      yonlendirici.refresh();
      yonlendirici.replace("/kampus");
    });
  }

  return (
    <form onSubmit={gonder} className="space-y-4">
      <div>
        <label
          htmlFor="eposta"
          className="mb-1.5 block font-baslik text-sm font-semibold text-murekkep"
        >
          E-posta
        </label>
        <input
          id="eposta"
          type="email"
          autoComplete="username"
          required
          value={eposta}
          onChange={(e) => setEposta(e.target.value)}
          disabled={bekliyor}
          className={ALAN}
          placeholder="ornek@bambola.com.tr"
        />
      </div>

      <div>
        <label
          htmlFor="sifre"
          className="mb-1.5 block font-baslik text-sm font-semibold text-murekkep"
        >
          Şifre
        </label>
        <input
          id="sifre"
          type="password"
          autoComplete="current-password"
          required
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
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
        {bekliyor ? "Giriliyor..." : "Giriş yap"}
        {!bekliyor && <Ikon.Ok boyut={17} />}
      </Buton>
    </form>
  );
}
