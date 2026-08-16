/**
 * Supabase kurulumu gercekten calisiyor mu?
 * Calistirma: npm run test:supabase
 *
 * NEDEN VAR: anahtarlar .env.local'e yazildiktan sonra "tamam mi" sorusunun
 * cevabi yoktu. Formu elle doldurup denemek tek yoldu ve bir sey bozuksa
 * veli tarafinda "Talebiniz kaydedilemedi" olarak gorunuyordu.
 *
 * Bu betik uctan uca sinar: anahtarlar var mi, tablo var mi, kodun yazdigi
 * her alan tabloda karsilik buluyor mu, ve RLS gercekten kapali mi.
 *
 * `npm test` icine ALINMADI: ag ve gercek anahtar istiyor, derleme makinesinde
 * calismaz. Kurulumdan sonra bir kez elle kosulur.
 */

import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

let gecen = 0;
const hatalar: string[] = [];

function dogru(kosul: boolean, ad: string) {
  if (kosul) {
    gecen++;
    console.log(`  + ${ad}`);
  } else {
    hatalar.push(ad);
    console.error(`  x ${ad}`);
  }
}

/*
  .env.local'i elle okuyoruz: bu betik Next uzerinden degil dogrudan tsx ile
  kosuyor, yani Next'in ortam yukleyicisi devrede degil.
*/
function ortamOku(dosya = ".env.local"): Record<string, string> {
  if (!existsSync(dosya)) return {};
  const cikti: Record<string, string> = {};
  for (const satir of readFileSync(dosya, "utf8").split(/\r?\n/)) {
    const kirp = satir.trim();
    if (!kirp || kirp.startsWith("#")) continue;
    const esit = kirp.indexOf("=");
    if (esit < 0) continue;
    const ad = kirp.slice(0, esit).trim();
    let deger = kirp.slice(esit + 1).trim();
    if (
      (deger.startsWith('"') && deger.endsWith('"')) ||
      (deger.startsWith("'") && deger.endsWith("'"))
    ) {
      deger = deger.slice(1, -1);
    }
    if (deger) cikti[ad] = deger;
  }
  return cikti;
}

/** Kodun `basvurular` tablosuna yazdigi alanlarin tamami. */
function ornekKayit() {
  return {
    kurum: "oyun-evi",
    cocuk_adi: "KURULUM TESTI",
    dogum_tarihi: "2024-01-15",
    yas_ay: 30,
    program_slug: "okula-hazirlik",
    paket_kod: "ayda-4",
    secilen_slotlar: [
      {
        id: "pzt-0930-okula-hazirlik",
        gun: "pzt",
        bas: "09.30",
        bit: "12.30",
        atolye: "Okula Hazırlık Grubu",
        ogretmenler: ["Emine", "Burcu"],
      },
    ],
    saat_uymuyor: false,
    saat_notu: null,
    fiyat_normal: 9000,
    fiyat_erken_kayit: 7200,
    erken_kayit_uygulandi: true,
    veli_adi: "KURULUM TESTI",
    telefon: "5000000000",
    eposta: null,
    iletisim_tercihi: "whatsapp",
    kaynak: "diger",
    not_metni: "Bu satiri kurulum betigi olusturdu ve hemen siliyor.",
    kvkk_onay: true,
    ticari_ileti_onay: false,
    utm: { kaynak: "kurulum-testi" },
    referrer: null,
    user_agent: "supabase-kontrol",
    ip_hash: "kurulum-testi",
  };
}

async function main() {
  const ortam = { ...ortamOku(), ...process.env };
  const url = ortam.NEXT_PUBLIC_SUPABASE_URL;
  const anon = ortam.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const servis = ortam.SUPABASE_SERVICE_ROLE_KEY;

  console.log("\n--- anahtarlar ---");
  dogru(Boolean(url), "NEXT_PUBLIC_SUPABASE_URL dolu");
  dogru(Boolean(anon), "NEXT_PUBLIC_SUPABASE_ANON_KEY dolu");
  dogru(Boolean(servis), "SUPABASE_SERVICE_ROLE_KEY dolu");

  if (!url || !anon || !servis) {
    console.error(
      "\nAnahtarlar eksik. Supabase panelinde Project Settings > API altindan\n" +
        "alinip .env.local dosyasina yazilir. Kurulum adimlari:\n" +
        "supabase/KURULUM.md\n",
    );
    process.exit(1);
  }

  const db = createClient(url, servis, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("\n--- tablo ---");
  const { error: okumaHatasi } = await db
    .from("basvurular")
    .select("id")
    .limit(1);
  dogru(
    !okumaHatasi,
    `basvurular tablosu okunabiliyor${okumaHatasi ? ` (${okumaHatasi.message})` : ""}`,
  );

  if (okumaHatasi) {
    /*
      Uc ayri ariza ayni yerden dusuyor ve cozumleri bambaska. Hepsine
      "tablo yok" demek insani yanlis yere gonderiyor.
    */
    const m = `${okumaHatasi.message} ${okumaHatasi.code ?? ""}`.toLowerCase();
    if (m.includes("fetch failed") || m.includes("enotfound")) {
      console.error(
        "\nSupabase'e ULASILAMIYOR. Proje adresi yanlis olabilir, proje\n" +
          "duraklatilmis olabilir (ucretsiz planda hareketsiz projeler\n" +
          "duraklatilir) ya da ag engelliyordur.\n" +
          `Denenen adres: ${url}\n`,
      );
    } else if (m.includes("api key") || m.includes("jwt") || m.includes("401")) {
      console.error(
        "\nANAHTAR gecersiz. Project Settings > API altindaki degerlerle\n" +
          ".env.local icindekiler ayni mi bakin; satir sonunda bosluk veya\n" +
          "eksik karakter olmasin.\n",
      );
    } else {
      console.error(
        "\nTABLO yok gibi gorunuyor. supabase/migrations/0001_basvurular.sql\n" +
          "dosyasinin icerigi Supabase SQL Editor'e yapistirilip calistirilir.\n",
      );
    }
    process.exit(1);
  }

  console.log("\n--- yazma (kodun yazdigi butun alanlarla) ---");
  const { data: eklenen, error: yazmaHatasi } = await db
    .from("basvurular")
    .insert(ornekKayit())
    .select("id, durum, created_at, updated_at")
    .single();

  dogru(
    !yazmaHatasi,
    `ornek kayit yazildi${yazmaHatasi ? ` (${yazmaHatasi.message})` : ""}`,
  );

  if (eklenen) {
    dogru(eklenen.durum === "yeni", "durum varsayilani 'yeni'");
    dogru(Boolean(eklenen.created_at), "created_at kendiliginden doldu");

    // Guncelleme tetikleyicisi: updated_at elle yazilmadan dolmali.
    const { data: guncel, error: guncelHatasi } = await db
      .from("basvurular")
      .update({ durum: "arandi" })
      .eq("id", eklenen.id)
      .select("updated_at")
      .single();
    dogru(
      !guncelHatasi && Boolean(guncel?.updated_at),
      "guncellemede updated_at tetikleyicisi calisiyor",
    );
  }

  /*
    RLS asil guvenlik siniri: anon anahtar tarayiciya gidiyor. Basvurular
    veli adi, telefon ve cocuk dogum tarihi tasiyor; anon okuyabiliyorsa
    butun basvuru listesi disariya acik demektir.
  */
  console.log("\n--- RLS (anon anahtarla) ---");
  const anonDb = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: anonSatirlar, error: anonOkumaHatasi } = await anonDb
    .from("basvurular")
    .select("id, veli_adi, telefon");
  dogru(
    Boolean(anonOkumaHatasi) || (anonSatirlar?.length ?? 0) === 0,
    "anon anahtarla basvurular OKUNAMIYOR",
  );

  const { error: anonYazmaHatasi } = await anonDb
    .from("basvurular")
    .insert(ornekKayit());
  dogru(
    Boolean(anonYazmaHatasi),
    "anon anahtarla basvurulara YAZILAMIYOR (form /api/kayit uzerinden gecer)",
  );

  // Temizlik: test satiri her durumda silinir.
  if (eklenen) {
    console.log("\n--- temizlik ---");
    const { error: silmeHatasi } = await db
      .from("basvurular")
      .delete()
      .eq("id", eklenen.id);
    dogru(!silmeHatasi, "test kaydi silindi");
    if (silmeHatasi) {
      console.error(`\n  ELLE SILINECEK KAYIT: ${eklenen.id}\n`);
    }
  }

  console.log("");
  if (hatalar.length) {
    console.error(`${hatalar.length} kontrol BASARISIZ, ${gecen} gecti.\n`);
    process.exit(1);
  }
  console.log(`Supabase kurulumu hazir: ${gecen} kontrol gecti.\n`);
}

main().catch((h) => {
  console.error("\nBeklenmeyen hata:", h instanceof Error ? h.message : h);
  process.exit(1);
});
