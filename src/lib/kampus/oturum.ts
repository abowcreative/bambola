import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { sunucuIstemcisi } from "@/lib/supabase/server";

/**
 * Kampus oturum ve yetki katmani. PLAN.md Bolum 28.
 *
 * Next belgeleri (02-guides/authentication.md) iki katmanli kontrol
 * oneriyor:
 *   1. Iyimser: proxy'de, yalniz cerezden okuyup yonlendirme.
 *   2. Guvenli: burada, VERITABANINA bakarak.
 *
 * `src/proxy.ts` icinde yetki kontrolu YOK; proxy her istekte (prefetch
 * dahil) calisiyor ve tam yetkilendirme cozumu degil. Asil kontrol bu
 * dosyada ve veritabani RLS politikalarinda.
 *
 * `server-only`: bu modul yanlislikla bir istemci bilesenine import
 * edilirse DERLEME hatasi verir. Olmasaydi rol bilgisi ve sorgular
 * tarayici paketine sizabilirdi.
 */

export type Rol = "admin" | "ogretmen" | "veli";

export type Oturum = {
  kullaniciId: string;
  eposta: string;
  rol: Rol;
  adSoyad: string;
  /** Yalniz ogretmen rolunde dolu. Ekip verisindeki `ad` ile birebir. */
  ogretmenAd: string | null;
};

/**
 * Oturumu dogrular. Yoksa null doner, YONLENDIRMEZ.
 *
 * `cache()`: ayni istek icinde kac kez cagrilirsa cagrilsin Supabase'e bir
 * kez gidiyor. Layout, sayfa ve birkac bilesen ayni anda soruyor; onsuz her
 * biri ayri istek acardi.
 */
export const oturumuGetir = cache(async (): Promise<Oturum | null> => {
  const db = await sunucuIstemcisi();

  /*
    `getUser()` kullaniliyor, `getSession()` DEGIL. getSession cerezdeki
    veriyi oldugu gibi doner ve cerez istemci tarafindan uretilebilir;
    getUser belirteci Supabase'e dogrulatir. Sunucuda yetki karari
    verilirken tek guvenli olan bu.
  */
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) return null;

  const { data: profil } = await db
    .from("profiller")
    .select("rol, ad_soyad, ogretmen_ad, aktif")
    .eq("id", user.id)
    .single();

  /*
    Hesabi var ama profili yoksa yetkisi de yok. Bu bilerek boyle: kullanici
    olusturmak profil yazmaktan ayri bir adim, arada kalan bir hesap hicbir
    seye erisemesin. `aktif` false ise ayrildi/askiya alindi demek.
  */
  if (!profil || !profil.aktif) return null;

  return {
    kullaniciId: user.id,
    eposta: user.email ?? "",
    rol: profil.rol as Rol,
    adSoyad: profil.ad_soyad,
    ogretmenAd: profil.ogretmen_ad,
  };
});

/** Oturum zorunlu. Yoksa giris ekranina atar. */
export async function oturumZorunlu(): Promise<Oturum> {
  const oturum = await oturumuGetir();
  if (!oturum) redirect("/kampus/giris");
  return oturum;
}

/**
 * Belirli rolleri zorunlu kilar.
 *
 * Yetkisiz kullanici giris ekranina DEGIL, kendi ana sayfasina gonderiliyor:
 * oturumu acik, sorun yetkide. Giris ekranina atmak "tekrar dene" izlenimi
 * verirdi.
 */
export async function rolZorunlu(...roller: Rol[]): Promise<Oturum> {
  const oturum = await oturumZorunlu();
  if (!roller.includes(oturum.rol)) redirect("/kampus");
  return oturum;
}

export const adminZorunlu = () => rolZorunlu("admin");

/** Rolun ana sayfasi. Giristen sonra buraya gidiliyor. */
export function rolAnaSayfasi(rol: Rol): string {
  switch (rol) {
    case "admin":
      return "/kampus/basvurular";
    case "ogretmen":
      return "/kampus/programim";
    case "veli":
      return "/kampus/cocugum";
  }
}
