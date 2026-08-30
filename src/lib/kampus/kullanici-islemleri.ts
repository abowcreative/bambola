"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { sunucuIstemcisi, yoneticiIstemcisi } from "@/lib/supabase/server";
import { adminZorunlu } from "./oturum";

/**
 * Kampus hesaplari: acma, rol degistirme, kapatma, silme.
 * PLAN.md Bolum 28.
 *
 * Hesap acmak Supabase YONETICI ANAHTARINI gerektiriyor. Anahtar burada
 * guvende: `"use server"` dosyasi hicbir zaman tarayici paketine girmiyor
 * ve `yoneticiIstemcisi()` yalniz sunucuda calisiyor. Ayni isi yapan
 * `npm run kampus:kullanici` betigi duruyor -- ilk yonetici hesabi hala
 * oradan aciliyor, cunku panele girmek icin once bir yonetici gerekiyor.
 *
 * Her islem kendi icinde YETKIYI ve GIRDIYI dogruluyor: server action'lar
 * tarayicidan dogrudan cagrilabilir.
 */

export type IslemSonucu =
  | { ok: true; id?: string; baglanti?: string }
  | { ok: false; hata: string };

const ROLLER = ["admin", "ogretmen", "veli"] as const;

const hesapSemasi = z
  .object({
    eposta: z.string().trim().toLowerCase().email("Geçersiz e-posta."),
    adSoyad: z.string().trim().min(2, "Ad soyad gerekli.").max(80),
    rol: z.enum(ROLLER),
    telefon: z.string().trim().max(20).optional(),
    /*
      Ogretmen icin ekip verisindeki `ad` ile BIREBIR ayni olmali ("Emine").
      Haftalik programdaki slot.ogretmenler[] ve siniflar.ogretmen_ad bu adla
      eslesiyor; soyad eklenirse eslesme kopar ve ogretmen kendi sinifini
      goremez.
    */
    ogretmenAd: z.string().trim().max(60).optional(),
  })
  .refine((v) => v.rol !== "ogretmen" || Boolean(v.ogretmenAd), {
    message: "Öğretmen rolü için program adı zorunlu.",
    path: ["ogretmenAd"],
  });

export type HesapGirdisi = z.input<typeof hesapSemasi>;

/**
 * Sifre belirleme sayfasinin tam adresi.
 *
 * Adres ISTEGIN KENDI HOST'UNDAN uretiliyor, `SITE_URL`'den degil. Sebep
 * `src/proxy.ts`: ana alan adinda `/kampus/...` ana sayfaya YONLENDIRILIYOR,
 * panel yalniz `kampus.` alt alan adinda aciliyor. SITE_URL'e dayanan bir
 * baglanti (https://bambola.com.tr/kampus/sifre-belirle) uretildigi anda
 * calisiyor gorunup tikladiginda ana sayfaya dusuyordu.
 *
 * Kampus alt alan adinda `/kampus` onekini proxy kendisi ekliyor; onek elle
 * yazilirsa `/kampus/kampus/...` olur. Yerelde (localhost) onek gerekiyor,
 * cunku orada alt alan adi yok.
 */
async function sifreSayfasi(): Promise<string> {
  // Elle ayarlanmissa o kazanir: `npm run kampus:kullanici` betigiyle ayni kural.
  const elle = process.env.KAMPUS_URL;
  if (elle) return `${elle.replace(/\/$/, "")}/sifre-belirle`;

  const b = await headers();
  const host = b.get("host");
  if (!host) throw new Error("İstek host başlığı okunamadı.");

  const protokol = b.get("x-forwarded-proto") ?? "https";
  const onek = host.startsWith("kampus.") ? "" : "/kampus";
  return `${protokol}://${host}${onek}/sifre-belirle`;
}

/**
 * Tek kullanimlik sifre belirleme baglantisi uretir.
 *
 * Supabase'in kendi `action_link` adresi KULLANILMIYOR: o adres belirteci
 * adres parcasinda birakiyor ve @supabase/ssr'in PKCE akisinda tarayicida
 * saklanmis bir dogrulayici ariyor -- baglantiyla gelen kiside oyle bir
 * kayit yok, belirtec goz ardi ediliyor. Yerine ham `hashed_token`
 * sayfamiza veriliyor, sayfa `verifyOtp` ile oturumu kendisi kuruyor.
 */
async function belirtecUret(eposta: string): Promise<string | null> {
  const sayfa = await sifreSayfasi();
  const yonetici = yoneticiIstemcisi();
  const { data, error } = await yonetici.auth.admin.generateLink({
    type: "recovery",
    email: eposta,
    options: { redirectTo: sayfa },
  });

  if (error || !data.properties?.hashed_token) return null;

  const hedef = new URL(sayfa);
  hedef.searchParams.set("belirtec", data.properties.hashed_token);
  return hedef.toString();
}

/**
 * Hesap acar, rolunu atar ve sifre belirleme baglantisi doner.
 *
 * SIFRE BELIRLENMIYOR: baglanti kisiye elden veriliyor, sifreyi kendisi
 * koyuyor. Boylece sifre ne kayitlarda ne de bir ekranda goruniyor.
 *
 * E-POSTA GONDERILMIYOR: Supabase'in yerlesik gondericisi yapilandirilmadi.
 * Baglanti ekranda gosteriliyor, yonetici kime verdigini bilerek veriyor.
 */
export async function hesapAc(girdi: HesapGirdisi): Promise<IslemSonucu> {
  await adminZorunlu();

  const g = hesapSemasi.safeParse(girdi);
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };
  const v = g.data;

  let yonetici: ReturnType<typeof yoneticiIstemcisi>;
  try {
    yonetici = yoneticiIstemcisi();
  } catch {
    return {
      ok: false,
      hata: "SUPABASE_SERVICE_ROLE_KEY tanımlı değil; hesap açılamaz.",
    };
  }

  /* Var olan hesap yeniden acilmiyor: ayni adrese ikinci kez basmak
     Supabase tarafinda hata veriyor, kullaniciya sebebi anlasilmiyor. */
  const { data: liste, error: listeHatasi } =
    await yonetici.auth.admin.listUsers();
  if (listeHatasi) return { ok: false, hata: "Hesaplar okunamadı." };

  const varOlan = liste.users.find(
    (k) => k.email?.toLowerCase() === v.eposta,
  );

  let kullaniciId = varOlan?.id;
  if (!kullaniciId) {
    const { data, error } = await yonetici.auth.admin.createUser({
      email: v.eposta,
      // Dogrulanmis sayiliyor: baglanti zaten adresin sahibine elden veriliyor.
      email_confirm: true,
    });
    if (error || !data.user) {
      return { ok: false, hata: `Hesap açılamadı: ${error?.message ?? ""}` };
    }
    kullaniciId = data.user.id;
  }

  const { error: profilHatasi } = await yonetici.from("profiller").upsert(
    {
      id: kullaniciId,
      rol: v.rol,
      ad_soyad: v.adSoyad,
      telefon: v.telefon || null,
      ogretmen_ad: v.rol === "ogretmen" ? v.ogretmenAd : null,
      aktif: true,
    },
    { onConflict: "id" },
  );

  if (profilHatasi) {
    return { ok: false, hata: `Rol atanamadı: ${profilHatasi.message}` };
  }

  const baglanti = await belirtecUret(v.eposta);

  revalidatePath("/kampus/kullanicilar");
  return {
    ok: true,
    id: kullaniciId,
    baglanti: baglanti ?? undefined,
  };
}

/** Var olan hesap icin yeni sifre belirleme baglantisi uretir. */
export async function sifreBaglantisiUret(id: string): Promise<IslemSonucu> {
  await adminZorunlu();

  const g = z.uuid().safeParse(id);
  if (!g.success) return { ok: false, hata: "Geçersiz hesap." };

  let yonetici: ReturnType<typeof yoneticiIstemcisi>;
  try {
    yonetici = yoneticiIstemcisi();
  } catch {
    return { ok: false, hata: "SUPABASE_SERVICE_ROLE_KEY tanımlı değil." };
  }

  const { data, error } = await yonetici.auth.admin.getUserById(g.data);
  if (error || !data.user?.email) {
    return { ok: false, hata: "Hesap bulunamadı." };
  }

  const baglanti = await belirtecUret(data.user.email);
  if (!baglanti) return { ok: false, hata: "Bağlantı üretilemedi." };

  return { ok: true, baglanti };
}

const profilSemasi = z
  .object({
    id: z.uuid("Geçersiz hesap."),
    adSoyad: z.string().trim().min(2, "Ad soyad gerekli.").max(80),
    rol: z.enum(ROLLER),
    telefon: z.string().trim().max(20).optional(),
    ogretmenAd: z.string().trim().max(60).optional(),
  })
  .refine((v) => v.rol !== "ogretmen" || Boolean(v.ogretmenAd), {
    message: "Öğretmen rolü için program adı zorunlu.",
    path: ["ogretmenAd"],
  });

export type ProfilGirdisi = z.input<typeof profilSemasi>;

/**
 * Hesabin adini, telefonunu ve rolunu gunceller.
 *
 * Kendi rolunu dusuremiyorsunuz: son yonetici kendini ogretmene cevirirse
 * panele girebilen hicbir yonetici kalmiyor ve geri donusu yalniz
 * terminalden oluyor.
 */
export async function profilGuncelle(
  girdi: ProfilGirdisi,
): Promise<IslemSonucu> {
  const oturum = await adminZorunlu();

  const g = profilSemasi.safeParse(girdi);
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };
  const v = g.data;

  if (v.id === oturum.kullaniciId && v.rol !== "admin") {
    return {
      ok: false,
      hata: "Kendi yöneticiliğinizi kaldıramazsınız. Başka bir yönetici yapsın.",
    };
  }

  const db = await sunucuIstemcisi();
  const { error } = await db
    .from("profiller")
    .update({
      ad_soyad: v.adSoyad,
      rol: v.rol,
      telefon: v.telefon || null,
      // Veritabani kisiti: ogretmen disindaki rollerde bos olmali.
      ogretmen_ad: v.rol === "ogretmen" ? v.ogretmenAd : null,
    })
    .eq("id", v.id);

  if (error) return { ok: false, hata: `Kaydedilemedi: ${error.message}` };

  revalidatePath("/kampus/kullanicilar");
  return { ok: true, id: v.id };
}

/**
 * Hesabi acar veya kapatir.
 *
 * Kapali hesap oturum acsa bile hicbir seye erisemiyor: `oturumuGetir`
 * profil `aktif` degilse null donuyor. Silmek yerine kapatmak, ayrilan
 * calisanin gecmis kayitlarindaki adini koruyor.
 */
export async function aktiflikDegistir(
  id: string,
  aktif: boolean,
): Promise<IslemSonucu> {
  const oturum = await adminZorunlu();

  const g = z.uuid().safeParse(id);
  if (!g.success) return { ok: false, hata: "Geçersiz hesap." };

  if (g.data === oturum.kullaniciId && !aktif) {
    return { ok: false, hata: "Kendi hesabınızı kapatamazsınız." };
  }

  const db = await sunucuIstemcisi();

  /* Son aktif yonetici kapatilamiyor: panele girebilen kimse kalmaz. */
  if (!aktif) {
    const { count } = await db
      .from("profiller")
      .select("id", { count: "exact", head: true })
      .eq("rol", "admin")
      .eq("aktif", true);
    if ((count ?? 0) <= 1) {
      return { ok: false, hata: "Son aktif yönetici hesabı kapatılamaz." };
    }
  }

  const { error } = await db
    .from("profiller")
    .update({ aktif })
    .eq("id", g.data);

  if (error) return { ok: false, hata: "Kaydedilemedi." };

  revalidatePath("/kampus/kullanicilar");
  return { ok: true };
}

/**
 * Hesabi tamamen siler.
 *
 * `profiller` satiri auth kaydina bagli (`on delete cascade`), veli
 * kaydindaki `profil_id` ise bosaltiliyor (`on delete set null`) -- yani
 * veli kaydinin kendisi ve cocuk baglantilari duruyor, yalniz panel girisi
 * kalkiyor.
 *
 * Normal yol KAPATMAK. Silme yalniz yanlis acilmis hesap icin: yanlis
 * adrese acilmis, hic kullanilmamis kayit.
 */
export async function hesapSil(id: string): Promise<IslemSonucu> {
  const oturum = await adminZorunlu();

  const g = z.uuid().safeParse(id);
  if (!g.success) return { ok: false, hata: "Geçersiz hesap." };

  if (g.data === oturum.kullaniciId) {
    return { ok: false, hata: "Kendi hesabınızı silemezsiniz." };
  }

  let yonetici: ReturnType<typeof yoneticiIstemcisi>;
  try {
    yonetici = yoneticiIstemcisi();
  } catch {
    return { ok: false, hata: "SUPABASE_SERVICE_ROLE_KEY tanımlı değil." };
  }

  const { data: profil } = await yonetici
    .from("profiller")
    .select("rol")
    .eq("id", g.data)
    .maybeSingle();

  if ((profil as { rol: string } | null)?.rol === "admin") {
    const { count } = await yonetici
      .from("profiller")
      .select("id", { count: "exact", head: true })
      .eq("rol", "admin");
    if ((count ?? 0) <= 1) {
      return { ok: false, hata: "Son yönetici hesabı silinemez." };
    }
  }

  const { error } = await yonetici.auth.admin.deleteUser(g.data);
  if (error) return { ok: false, hata: `Hesap silinemedi: ${error.message}` };

  revalidatePath("/kampus/kullanicilar");
  revalidatePath("/kampus/veliler");
  return { ok: true };
}

/**
 * Panel hesabini bir veli kaydina baglar.
 *
 * Baglanti olmadan veli oturum acsa bile kendi cocugunu goremiyor: RLS
 * `veli_kaydim()` fonksiyonu `veliler.profil_id` uzerinden bakiyor.
 */
export async function veliyeHesapBagla(
  veliId: string,
  profilId: string | null,
): Promise<IslemSonucu> {
  await adminZorunlu();

  const v = z.uuid().safeParse(veliId);
  if (!v.success) return { ok: false, hata: "Geçersiz veli." };

  const p = profilId ? z.uuid().safeParse(profilId) : null;
  if (profilId && !p?.success) return { ok: false, hata: "Geçersiz hesap." };

  const db = await sunucuIstemcisi();

  /* Bir panel hesabi tek veli kaydina baglanabilir: iki kayda baglanirsa
     `veli_kaydim()` hangisini donecegini bilemez ve veli baska bir ailenin
     cocugunu gorebilir. */
  if (profilId) {
    const { data: cakisan } = await db
      .from("veliler")
      .select("id")
      .eq("profil_id", profilId)
      .neq("id", v.data)
      .maybeSingle();
    if (cakisan) {
      return { ok: false, hata: "Bu hesap başka bir veli kaydına bağlı." };
    }
  }

  const { error } = await db
    .from("veliler")
    .update({ profil_id: profilId || null })
    .eq("id", v.data);

  if (error) return { ok: false, hata: "Bağlantı kaydedilemedi." };

  revalidatePath("/kampus/veliler");
  revalidatePath(`/kampus/veliler/${v.data}`);
  revalidatePath("/kampus/kullanicilar");
  return { ok: true };
}
