/**
 * Ogrenci ve Veli Bilgi Formu'nu (Excel) panele aktarir.
 * PLAN.md Bolum 36.
 *
 * Calistirma:
 *   npm run ogrenci:ice-aktar -- "yol/form.xlsx"        deneme, yazmaz
 *   npm run ogrenci:ice-aktar -- "yol/form.xlsx" yaz     gercekten yazar
 *
 * Kurallar:
 * - Ayni cocuk (ad + soyad + dogum tarihi) varsa ATLANIR. Betik iki kez
 *   kosarsa kayit ikilenmez; ilk surumde bu ozellik olculdu.
 * - Veli TELEFONA gore tekillenir: kardes kaydinda ikinci veli karti olmaz.
 * - SINIF ATAMASI YAPILMAZ. Excel'de yalniz grup adi var ("16-24 ay",
 *   "okula hazirlik 30+ ay"); gun ve saat yok, yani hangi sinif oldugu
 *   belirsiz. Grup metni ogrencinin notuna yazilir, atamayi panelden
 *   yonetici yapar. Tahminle sinifa yazmak yanlis yoklama listesi demek.
 * - Alerji "yok" ise bos gecilir.
 * - Telefon 5XXXXXXXXX bicimine normalize edilir. EKSIK HANELI NUMARA
 *   UYDURULMAZ: oldugu gibi yazilir, veli notuna uyari dusulur ve ozet
 *   listesinde gorunur.
 * - Veli yazilamazsa ogrenci GERI ALINIR: yarim kayit birakilmaz.
 *
 * Excel'i kendisi acar, xlsx bagimliligi yok: dosya bir zip ve iceriden
 * sharedStrings + sheet1 XML'i okunuyor.
 */
import { readFileSync, mkdtempSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const DOSYA = process.argv[2];
const YAZ = process.argv[3] === "yaz";

if (!DOSYA) {
  console.error(
    "\nKullanim: npm run ogrenci:ice-aktar -- <form.xlsx> [yaz]\n" +
      '  "yaz" verilmezse hicbir sey yazilmaz, yalniz ne olacagini gosterir.\n',
  );
  process.exit(1);
}

// ------------------------------------------------------------------ ortam
const ortam: Record<string, string> = {};
for (const s of readFileSync(".env.local", "utf8").split(
  /\r?\n/,
)) {
  const k = s.trim();
  if (!k || k.startsWith("#")) continue;
  const e = k.indexOf("=");
  if (e > 0)
    ortam[k.slice(0, e).trim()] = k
      .slice(e + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
}
const db = createClient(
  ortam.NEXT_PUBLIC_SUPABASE_URL,
  ortam.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

// ------------------------------------------------------------------ excel
function excelOku(): string[][] {
  /*
    xlsx bir zip. Bagimlilik eklemek yerine sistemdeki unzip ile gecici bir
    klasore aciliyor; betik tek seferlik bir kurulum araci.
  */
  const gecici = mkdtempSync(join(tmpdir(), "bambola-xlsx-"));
  execFileSync("unzip", ["-o", "-q", resolve(DOSYA), "-d", gecici]);

  const ss = readFileSync(join(gecici, "xl/sharedStrings.xml"), "utf8");
  const metinler = [...ss.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
    [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)]
      .map((x) => x[1])
      .join("")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#10;/g, " "),
  );

  const sheet = readFileSync(join(gecici, "xl/worksheets/sheet1.xml"), "utf8");
  const satirlar: string[][] = [];
  for (const s of sheet.matchAll(/<row[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
    const no = Number(s[1]);
    if (no < 7) continue; // 1-5 baslik, 6 ORNEK satiri
    const hucreler: Record<string, string> = {};
    for (const h of s[2].matchAll(
      /<c r="([A-Z]+)\d+"([^>]*)>(?:<v>([^<]*)<\/v>)?/g,
    )) {
      if (h[3] === undefined) continue;
      hucreler[h[1]] = /t="s"/.test(h[2]) ? metinler[Number(h[3])] : h[3];
    }
    const sutunlar = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
    const satir = sutunlar.map((c) => (hucreler[c] ?? "").trim());
    if (satir.slice(1).some((x) => x !== "")) satirlar.push(satir);
  }
  return satirlar;
}

// --------------------------------------------------------------- donusumler
const buyukHarf = (m: string) =>
  m
    .toLocaleLowerCase("tr-TR")
    .split(/\s+/)
    .filter(Boolean)
    .map((k) => k.charAt(0).toLocaleUpperCase("tr-TR") + k.slice(1))
    .join(" ");

/** "12.05.2025" -> "2025-05-12". Excel seri numarasi da olabilir. */
function tariheCevir(ham: string): string | null {
  const nokta = ham.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/);
  if (nokta) {
    const [, g, a, y] = nokta;
    return `${y}-${a.padStart(2, "0")}-${g.padStart(2, "0")}`;
  }
  // Excel tarih serisi: 1899-12-30 baslangicli gun sayisi
  if (/^\d+(\.\d+)?$/.test(ham)) {
    const gun = Math.floor(Number(ham));
    const t = new Date(Date.UTC(1899, 11, 30) + gun * 86400000);
    return t.toISOString().slice(0, 10);
  }
  return null;
}

const telefonNormalle = (ham: string) =>
  ham.replace(/\D/g, "").replace(/^(90|0)/, "");

const yakinlikCevir = (ham: string): "anne" | "baba" | "vasi" | "veli" => {
  const k = ham.toLocaleLowerCase("tr-TR").trim();
  if (k.startsWith("anne")) return "anne";
  if (k.startsWith("baba")) return "baba";
  if (k.startsWith("vasi") || k.startsWith("vâsi")) return "vasi";
  return "veli";
};

const alerjiCevir = (ham: string) => {
  const k = ham.toLocaleLowerCase("tr-TR").trim();
  return k === "" || k === "yok" || k === "-" ? null : ham.trim();
};

// -------------------------------------------------------------------- akis
type Satir = {
  sira: string;
  ad: string;
  soyad: string;
  dogum: string | null;
  grup: string;
  veliAd: string;
  veliSoyad: string;
  yakinlik: "anne" | "baba" | "vasi" | "veli";
  telefonHam: string;
  telefon: string;
  eposta: string;
  alerji: string | null;
};

async function main() {
  const ham = excelOku();
  const satirlar: Satir[] = ham.map((r) => ({
    sira: r[0],
    ad: buyukHarf(r[1]),
    soyad: buyukHarf(r[2]),
    dogum: tariheCevir(r[3]),
    grup: r[4],
    veliAd: buyukHarf(r[5]),
    veliSoyad: buyukHarf(r[6]),
    yakinlik: yakinlikCevir(r[7]),
    telefonHam: r[8],
    telefon: telefonNormalle(r[8]),
    eposta: r[9],
    alerji: alerjiCevir(r[10]),
  }));

  console.log("");
  console.log(`  ${satirlar.length} satir okundu. ${YAZ ? "YAZILIYOR" : "DENEME (hicbir sey yazilmiyor)"}`);
  console.log("");

  const uyarilar: string[] = [];
  let eklenen = 0;
  let atlanan = 0;
  let yeniVeli = 0;
  let mevcutVeli = 0;

  for (const s of satirlar) {
    const etiket = `${s.sira}. ${s.ad} ${s.soyad}`.padEnd(28);

    if (!s.ad || !s.dogum) {
      uyarilar.push(`${s.sira}. satir: ad veya dogum tarihi okunamadi, ATLANDI`);
      continue;
    }
    if (s.telefon.length !== 10) {
      uyarilar.push(
        `${s.ad} ${s.soyad}: veli telefonu ${s.telefon.length} haneli ("${s.telefonHam}") -- oldugu gibi yazildi, teyit gerekiyor`,
      );
    }

    // Ayni cocuk var mi
    const { data: mevcut } = await db
      .from("ogrenciler")
      .select("id")
      .eq("ad", s.ad)
      .eq("soyad", s.soyad)
      .eq("dogum_tarihi", s.dogum)
      .maybeSingle();

    if (mevcut) {
      console.log(`  = ${etiket} zaten kayitli, atlandi`);
      atlanan++;
      continue;
    }

    const notlar = `Excel kayit formundan aktarildi. Excel'de yazan grup: "${s.grup}". Sinif atamasi panelden yapilacak.`;

    if (!YAZ) {
      console.log(
        `  + ${etiket} ${s.dogum} | ${s.grup} | ${s.veliAd} ${s.veliSoyad} (${s.yakinlik}, ${s.telefon})${s.alerji ? " | alerji: " + s.alerji : ""}`,
      );
      eklenen++;
      continue;
    }

    const { data: ogrenci, error: oHata } = await db
      .from("ogrenciler")
      .insert({
        ad: s.ad,
        soyad: s.soyad || null,
        dogum_tarihi: s.dogum,
        kurum: "oyun-evi",
        durum: "aktif",
        alerji: s.alerji,
        notlar,
      })
      .select("id")
      .single();

    if (oHata || !ogrenci) {
      uyarilar.push(`${s.ad} ${s.soyad}: ogrenci yazilamadi (${oHata?.message})`);
      continue;
    }

    // Veli: telefona gore tekille
    let veliId: string | undefined;
    if (s.telefon) {
      const { data: v } = await db
        .from("veliler")
        .select("id")
        .eq("telefon", s.telefon)
        .maybeSingle();
      veliId = (v as { id: string } | null)?.id;
      if (veliId) mevcutVeli++;
    }

    if (!veliId) {
      const veliNotu =
        s.telefon.length !== 10
          ? `Excel'den aktarildi. DIKKAT: telefon eksik haneli geldi ("${s.telefonHam}"), teyit edilmeli.`
          : "Excel kayit formundan aktarildi.";
      const { data: yeni, error: vHata } = await db
        .from("veliler")
        .insert({
          ad_soyad: `${s.veliAd} ${s.veliSoyad}`.trim(),
          telefon: s.telefon,
          eposta: s.eposta || null,
          notlar: veliNotu,
        })
        .select("id")
        .single();
      if (vHata || !yeni) {
        // Veli olusmadiysa ogrenciyi geri al: yarim kayit birakma
        await db.from("ogrenciler").delete().eq("id", ogrenci.id);
        uyarilar.push(`${s.ad} ${s.soyad}: veli yazilamadi (${vHata?.message}), ogrenci geri alindi`);
        continue;
      }
      veliId = (yeni as { id: string }).id;
      yeniVeli++;
    }

    await db.from("ogrenci_veli").insert({
      ogrenci_id: ogrenci.id,
      veli_id: veliId,
      yakinlik: s.yakinlik,
      birincil: true,
    });

    console.log(`  + ${etiket} eklendi`);
    eklenen++;
  }

  console.log("");
  console.log(`  eklenen: ${eklenen}, atlanan: ${atlanan}`);
  if (YAZ) console.log(`  yeni veli: ${yeniVeli}, mevcut veliye baglanan: ${mevcutVeli}`);
  if (uyarilar.length) {
    console.log("");
    console.log("  UYARILAR:");
    for (const u of uyarilar) console.log(`    ! ${u}`);
  }
  console.log("");
}

main().catch((h) => {
  console.error("Hata:", h instanceof Error ? h.stack : h);
  process.exitCode = 1;
});
