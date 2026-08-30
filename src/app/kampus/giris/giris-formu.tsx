"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { tarayiciIstemcisi } from "@/lib/supabase/client";
import { Ikon } from "@/components/ui/ikon";
import { ALAN, AlanKutusu, Bildirim, Dugme } from "@/components/kampus/ui";
import { Firildak } from "@/components/kampus/ui-istemci";

/**
 * Giris formu. Supabase Auth ile e-posta + sifre.
 *
 * Giris ISTEMCIDE yapiliyor cunku `@supabase/ssr` tarayici istemcisi oturum
 * cerezlerini kendisi yaziyor; sunucu action'indan yapilsaydi cerezleri
 * elle tasimak gerekirdi. Yetki karari yine sunucuda (bkz. oturum.ts).
 */
export function GirisFormu() {
  const yonlendirici = useRouter();
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();
  const [gidiyor, setGidiyor] = useState(false);

  async function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);
    setGidiyor(true);

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
      setGidiyor(false);
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

  const mesgul = bekliyor || gidiyor;

  return (
    <form onSubmit={gonder} className="space-y-3.5">
      <AlanKutusu etiket="E-posta" htmlFor="eposta" gerekli>
        <input
          id="eposta"
          type="email"
          autoComplete="username"
          required
          value={eposta}
          onChange={(e) => setEposta(e.target.value)}
          disabled={mesgul}
          className={`${ALAN} py-2.5`}
          placeholder="ornek@bambola.com.tr"
        />
      </AlanKutusu>

      <AlanKutusu etiket="Şifre" htmlFor="sifre" gerekli>
        <input
          id="sifre"
          type="password"
          autoComplete="current-password"
          required
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
          disabled={mesgul}
          className={`${ALAN} py-2.5`}
        />
      </AlanKutusu>

      {hata && <Bildirim ton="tehlike">{hata}</Bildirim>}

      <Dugme
        type="submit"
        gorunum="birincil"
        disabled={mesgul}
        className="h-10 w-full"
      >
        {mesgul ? <Firildak /> : null}
        {mesgul ? "Giriliyor…" : "Giriş yap"}
        {!mesgul && <Ikon.Ok boyut={16} />}
      </Dugme>
    </form>
  );
}
