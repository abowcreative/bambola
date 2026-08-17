/**
 * Kampus kullanicisi olusturur ve rolunu atar.
 * Calistirma: npm run kampus:kullanici -- <eposta> <ad soyad> [rol] [ogretmen-ad]
 *
 * Ornek:
 *   npm run kampus:kullanici -- veli@ornek.com "Ayse Yilmaz" veli
 *   npm run kampus:kullanici -- emine@ornek.com "Emine Yildiz Keles" ogretmen Emine
 *
 * SIFRE BURADA BELIRLENMIYOR. Betik hesabi acip bir "sifre belirleme"
 * baglantisi uretiyor; kullanici kendi sifresini kendisi koyuyor. Boylece
 * sifre ne bu dosyada, ne kabuk gecmisinde, ne de kayitlarda goruniyor.
 *
 * E-posta da GONDERMIYOR: Supabase'in yerlesik e-posta gondericisi
 * yapilandirilmadi ve gonderilse bile baglantiyi kime verdigimizi bilerek
 * elden vermek daha temiz.
 */

import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const ROLLER = ["admin", "ogretmen", "veli"] as const;
type Rol = (typeof ROLLER)[number];

function ortamOku(dosya = ".env.local"): Record<string, string> {
  if (!existsSync(dosya)) return {};
  const cikti: Record<string, string> = {};
  for (const satir of readFileSync(dosya, "utf8").split(/\r?\n/)) {
    const k = satir.trim();
    if (!k || k.startsWith("#")) continue;
    const e = k.indexOf("=");
    if (e < 0) continue;
    cikti[k.slice(0, e).trim()] = k
      .slice(e + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
  }
  return cikti;
}

const [eposta, adSoyad, rolArg = "admin", ogretmenAd] = process.argv.slice(2);

if (!eposta || !adSoyad) {
  console.error(
    "\nKullanim: npm run kampus:kullanici -- <eposta> <ad soyad> [rol] [ogretmen-ad]\n" +
      `Roller: ${ROLLER.join(", ")}\n`,
  );
  process.exit(1);
}

if (!ROLLER.includes(rolArg as Rol)) {
  console.error(`\nGecersiz rol: ${rolArg}. Roller: ${ROLLER.join(", ")}\n`);
  process.exit(1);
}
const rol = rolArg as Rol;

/*
  Ogretmen rolunde `ogretmen_ad` zorunlu ve Excel'deki adla birebir ayni
  olmali: haftalik programdaki slot.ogretmenler[] bununla eslesiyor.
  Veritabaninda da kisit var, burada erken yakaliyoruz ki hata mesaji
  anlasilir olsun.
*/
if (rol === "ogretmen" && !ogretmenAd) {
  console.error(
    "\nOgretmen rolu icin dorduncu arguman zorunlu: ekip verisindeki ad\n" +
      '(ornek: "Emine"). Soyad EKLENMEZ, program eslesmesi kopar.\n',
  );
  process.exit(1);
}

const ortam = { ...ortamOku(), ...process.env };
const url = ortam.NEXT_PUBLIC_SUPABASE_URL;
const servis = ortam.SUPABASE_SERVICE_ROLE_KEY;
const site = ortam.KAMPUS_URL ?? "https://kampus.bambola.com.tr";

if (!url || !servis) {
  console.error("\nSupabase anahtarlari eksik. Bkz. supabase/KURULUM.md\n");
  process.exit(1);
}

const db = createClient(url, servis, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log("");

  // 1. Kullanici zaten var mi.
  const { data: liste, error: listeHatasi } = await db.auth.admin.listUsers();
  if (listeHatasi) {
    console.error("Kullanicilar okunamadi:", listeHatasi.message);
    process.exit(1);
  }

  let kullanici = liste.users.find(
    (k) => k.email?.toLowerCase() === eposta.toLowerCase(),
  );

  if (kullanici) {
    console.log(`  - hesap zaten var: ${eposta}`);
  } else {
    const { data, error } = await db.auth.admin.createUser({
      email: eposta,
      // Dogrulanmis sayiliyor: sifreyi belirleme baglantisi zaten
      // adresin sahibine elden veriliyor.
      email_confirm: true,
    });
    if (error || !data.user) {
      console.error("Hesap acilamadi:", error?.message);
      process.exit(1);
    }
    kullanici = data.user;
    console.log(`  + hesap acildi: ${eposta}`);
  }

  // 2. Profil ve rol.
  const { error: profilHatasi } = await db.from("profiller").upsert(
    {
      id: kullanici.id,
      rol,
      ad_soyad: adSoyad,
      ogretmen_ad: rol === "ogretmen" ? ogretmenAd : null,
      aktif: true,
    },
    { onConflict: "id" },
  );

  if (profilHatasi) {
    console.error("Profil yazilamadi:", profilHatasi.message);
    process.exit(1);
  }
  console.log(`  + rol atandi: ${rol}${ogretmenAd ? ` (${ogretmenAd})` : ""}`);

  // 3. Sifre belirleme baglantisi.
  const { data: baglanti, error: baglantiHatasi } =
    await db.auth.admin.generateLink({
      type: "recovery",
      email: eposta,
      /*
        Yol `/kampus` oneki OLMADAN veriliyor: kampus alan adinda proxy
        oneki kendisi ekliyor (bkz. src/proxy.ts). Onek elle eklenirse
        `/kampus/kampus/...` olur.
        Yerelde denemek icin: KAMPUS_URL="http://localhost:3939" ve
        acilan adrese `?kampus=1` eklenir.
      */
      options: { redirectTo: `${site}/sifre-belirle` },
    });

  if (baglantiHatasi || !baglanti.properties?.action_link) {
    console.error(
      "\nBaglanti uretilemedi:",
      baglantiHatasi?.message ?? "bilinmeyen hata",
    );
    console.error(
      "Hesap ve rol yerinde. Kullanici giris ekranindan 'sifremi unuttum'\n" +
        "ile de sifre belirleyebilir.\n",
    );
    process.exit(1);
  }

  console.log(
    "\n--- SIFRE BELIRLEME BAGLANTISI ---\n" +
      "Yalniz hesap sahibine verilir, tek kullanimlik ve suresi sinirli.\n\n" +
      baglanti.properties.action_link +
      "\n",
  );
}

main().catch((h) => {
  console.error("\nBeklenmeyen hata:", h instanceof Error ? h.message : h);
  process.exit(1);
});
