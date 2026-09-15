/**
 * "KAYITLI COCUK LISTESI" Excel'ini panele EKSIKSIZ aktarir.
 * PLAN.md Bolum 42. Gocu: supabase/migrations/0007_excel_defteri.sql
 *
 * Calistirma:
 *   npm run excel:ice-aktar -- "yol/liste.xlsx"        deneme, yazmaz
 *   npm run excel:ice-aktar -- "yol/liste.xlsx" yaz     gercekten yazar
 *
 * Ne yapiyor:
 *   1. Her sayfayi hucre hucre okuyup `excel_sayfalari` tablosuna HAM
 *      olarak yazar (deger, formul, yorum, tarih). Hicbir hucre disarida
 *      kalmaz; asagidaki yapilandirilmis aktarim bir seyi yanlis
 *      yorumlasa bile kaynak burada durur.
 *   2. GENEL LISTE -> ogrenciler + veliler (+ baglanti). Excel'in on dokuz
 *      sutunu ogrencinin kendi alanlarina gidiyor.
 *   3. Aylik sayfalar (Ocak 2025 - Eylul 2026) -> paket_satislari.
 *      Satirlar once GENEL LISTE'deki TOPLAM ODENEN formullerinin
 *      isaret ettigi hucrelerle (kesin), sonra ad + veli benzerligiyle
 *      ogrenciye baglaniyor. Eslesmeyen cocuk icin ogrenci kaydi ACILIYOR:
 *      Excel'in bildigi bir cocugu panel de bilmeli.
 *   4. DOGUM GUNU -> dogum_gunu_partileri, ELDEN VERDIGIMIZ ODEMELER ->
 *      giderler, SU YUKLEME -> su_karti, DEVAMSIZLIK -> devamsizlik_cizelgesi.
 *
 * Kurallar:
 *   - Uydurma yok. Dogum tarihi yalniz Excel'in verdigi tarih, cocugun ilk
 *     kayit yasiyla tutarliysa yaziliyor; degilse alan bos kaliyor ve
 *     "DOGUM GUNU" hucresi kendi sutununda oldugu gibi duruyor.
 *   - Telefon 5XXXXXXXXX'e indirgeniyor; ikinci numara ve hucre yorumundaki
 *     numara `alternatif_telefon` alanina gidiyor. Bos telefon bos kaliyor.
 *   - Tekrar calistirmak guvenli: ogrenciler `excel_kaynak` ile, veliler
 *     telefonla bulunup GUNCELLENIYOR; Excel kaynakli defter, gider, parti
 *     ve cizelge satirlari silinip yeniden yaziliyor (panelden girilenler
 *     duruyor).
 *   - Daha once bilgi formundan gelmis on ogrenci telefon ya da ad + veli
 *     soyadi ile GENEL LISTE satirina baglanip guncelleniyor; ikinci kayit
 *     acilmiyor.
 *
 * xlsx bagimliligi yok: zip merkez dizini elle okunup girdiler zlib ile
 * aciliyor, sonra sharedStrings / styles / sheet XML'leri regex ile
 * cozuluyor. Dosya tek bir kurumun tek bir Excel'i; genel bir okuyucu
 * yazmaya gerek yok.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { inflateRawSync } from "node:zlib";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DOSYA = process.argv[2];
const YAZ = process.argv[3] === "yaz";
const BUGUN = new Date().toLocaleDateString("en-CA", {
  timeZone: "Europe/Istanbul",
});

if (!DOSYA) {
  console.error(
    '\nKullanim: npm run excel:ice-aktar -- <liste.xlsx> [yaz]\n  "yaz" verilmezse hicbir sey yazilmaz, yalniz ne olacagini gosterir.\n',
  );
  process.exit(1);
}

// ------------------------------------------------------------------ ortam
const ortam: Record<string, string> = {};
for (const s of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const k = s.trim();
  if (!k || k.startsWith("#")) continue;
  const e = k.indexOf("=");
  if (e > 0)
    ortam[k.slice(0, e).trim()] = k
      .slice(e + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
}
const db: SupabaseClient = createClient(
  ortam.NEXT_PUBLIC_SUPABASE_URL,
  ortam.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

// -------------------------------------------------------------------- zip
function zipOku(yol: string): Map<string, Buffer> {
  const b = readFileSync(yol);
  let i = b.length - 22;
  while (i >= 0 && b.readUInt32LE(i) !== 0x06054b50) i--;
  if (i < 0) throw new Error("Zip merkez dizini bulunamadi.");
  const adet = b.readUInt16LE(i + 10);
  let p = b.readUInt32LE(i + 16);
  const cikti = new Map<string, Buffer>();
  for (let k = 0; k < adet; k++) {
    if (b.readUInt32LE(p) !== 0x02014b50) throw new Error("Bozuk zip girdisi.");
    const yontem = b.readUInt16LE(p + 10);
    const sikismis = b.readUInt32LE(p + 20);
    const adUz = b.readUInt16LE(p + 28);
    const ekUz = b.readUInt16LE(p + 30);
    const yorumUz = b.readUInt16LE(p + 32);
    const yerel = b.readUInt32LE(p + 42);
    const ad = b.toString("utf8", p + 46, p + 46 + adUz);
    const bas = yerel + 30 + b.readUInt16LE(yerel + 26) + b.readUInt16LE(yerel + 28);
    const veri = b.subarray(bas, bas + sikismis);
    cikti.set(ad, yontem === 8 ? inflateRawSync(veri) : Buffer.from(veri));
    p += 46 + adUz + ekUz + yorumUz;
  }
  return cikti;
}

// ------------------------------------------------------------------- xlsx
type Hucre = {
  v: string | number | boolean;
  f?: string;
  /** ISO tarih; hucre tarih bicimindeyse. */
  t?: string;
  /** Hucre yorumu. */
  y?: string;
};
type Satir = { r: number; h: Record<string, Hucre> };
type Sayfa = {
  ad: string;
  sira: number;
  gizli: boolean;
  boyut: string;
  sutunSayisi: number;
  satirlar: Satir[];
};

const xmlCoz = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));

const sutunNo = (c: string) => {
  let n = 0;
  for (const ch of c) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
};

/** Excel gun serisi -> ISO. Saat kismi varsa "YYYY-MM-DD HH:MM". */
function seriToIso(v: number): string {
  const ms = Date.UTC(1899, 11, 30) + Math.round(v * 86400000);
  const d = new Date(ms);
  const gun = d.toISOString().slice(0, 10);
  return v % 1 ? `${gun} ${d.toISOString().slice(11, 16)}` : gun;
}

function xlsxOku(yol: string): Sayfa[] {
  const zip = zipOku(yol);
  const oku = (p: string) => {
    const b = zip.get(p);
    if (!b) throw new Error(`Zip icinde yok: ${p}`);
    return b.toString("utf8");
  };

  const rels: Record<string, string> = {};
  for (const m of oku("xl/_rels/workbook.xml.rels").matchAll(
    /<Relationship\b([^>]*)\/?>/g,
  )) {
    const id = /\bId="([^"]+)"/.exec(m[1])?.[1];
    const hedef = /\bTarget="([^"]+)"/.exec(m[1])?.[1];
    if (id && hedef) rels[id] = hedef.replace(/^\/?xl\//, "");
  }

  const sayfaTanimlari = [
    ...oku("xl/workbook.xml").matchAll(/<sheet\b([^>]*)\/>/g),
  ].map((m, i) => ({
    ad: xmlCoz(/\bname="([^"]+)"/.exec(m[1])?.[1] ?? `Sayfa${i + 1}`),
    gizli: /\bstate="hidden"/.test(m[1]),
    dosya: rels[/\br:id="([^"]+)"/.exec(m[1])?.[1] ?? ""],
    sira: i + 1,
  }));

  const metinler = zip.has("xl/sharedStrings.xml")
    ? [...oku("xl/sharedStrings.xml").matchAll(/<si>([\s\S]*?)<\/si>/g)].map(
        (m) =>
          xmlCoz(
            [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)]
              .map((x) => x[1])
              .join(""),
          ),
      )
    : [];

  // Stil -> tarih mi? numFmtId 14-22 ve 45-47 yerlesik tarih bicimleri.
  const stiller = oku("xl/styles.xml");
  const ozelBicimler: Record<string, string> = {};
  for (const m of stiller.matchAll(
    /<numFmt\b[^>]*numFmtId="(\d+)"[^>]*formatCode="([^"]*)"/g,
  ))
    ozelBicimler[m[1]] = xmlCoz(m[2]);
  const xfs = (
    /<cellXfs[^>]*>([\s\S]*?)<\/cellXfs>/.exec(stiller)?.[1] ?? ""
  ).match(/<xf\b[^>]*>/g) ?? [];
  const tarihMi = xfs.map((xf) => {
    const id = /numFmtId="(\d+)"/.exec(xf)?.[1] ?? "0";
    const n = Number(id);
    if ((n >= 14 && n <= 22) || (n >= 45 && n <= 47)) return true;
    const b = ozelBicimler[id];
    if (!b) return false;
    const temiz = b.replace(/\[[^\]]*\]/g, "").replace(/"[^"]*"/g, "");
    return /[dmyhs]/i.test(temiz) && !/0\.0|#,##/.test(temiz);
  });

  return sayfaTanimlari.map((t) => {
    const xml = oku(`xl/${t.dosya}`);
    // Yorumlar: worksheets/_rels/sheetN.xml.rels -> ../commentsN.xml
    const yorumlar: Record<string, string> = {};
    const relYolu = `xl/worksheets/_rels/${basename(t.dosya)}.rels`;
    if (zip.has(relYolu)) {
      const c = /Target="\.\.\/(comments\d+\.xml)"/.exec(oku(relYolu))?.[1];
      if (c)
        for (const m of oku(`xl/${c}`).matchAll(
          /<comment ref="([A-Z]+\d+)"[^>]*>([\s\S]*?)<\/comment>/g,
        ))
          /*
            Yorum govdesi <text><r><rPr>..</rPr><t>..</t></r></text>. Yalniz
            <t> etiketleri aliniyor; "<t[^>]*>" kalibi <text>'i de yakalayip
            bicim XML'ini metne katiyordu.
          */
          yorumlar[m[1]] = xmlCoz(
            [...m[2].matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)]
              .map((x) => x[1])
              .join(""),
          )
            .replace(/^[A-Z]+:\s*/, "")
            .trim();
    }

    const satirlar: Satir[] = [];
    let sutunSayisi = 0;
    for (const rm of xml.matchAll(
      /<row\b[^>]*\br="(\d+)"[^>]*?(?:\/>|>([\s\S]*?)<\/row>)/g,
    )) {
      const r = Number(rm[1]);
      const h: Record<string, Hucre> = {};
      for (const cm of (rm[2] ?? "").matchAll(
        /<c r="([A-Z]+)(\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g,
      )) {
        const sutun = cm[1];
        const oz = cm[3];
        const ic = cm[4] ?? "";
        const tur = /\bt="([^"]+)"/.exec(oz)?.[1];
        const stil = Number(/\bs="(\d+)"/.exec(oz)?.[1] ?? 0);
        const f = /<f[^>]*>([\s\S]*?)<\/f>/.exec(ic)?.[1];
        const v = /<v>([\s\S]*?)<\/v>/.exec(ic)?.[1];
        let deger: Hucre["v"] | undefined;
        if (tur === "s") deger = metinler[Number(v)];
        else if (tur === "inlineStr")
          deger = xmlCoz(
            [...ic.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1]).join(""),
          );
        else if (tur === "str" || tur === "e") deger = v === undefined ? undefined : xmlCoz(v);
        else if (tur === "b") deger = v === "1";
        else if (v !== undefined) deger = Number(v);
        if (deger === undefined) continue;
        if (typeof deger === "string") deger = deger.replace(/ /g, " ");
        const hucre: Hucre = { v: deger };
        if (typeof deger === "number" && tarihMi[stil]) hucre.t = seriToIso(deger);
        if (f) hucre.f = xmlCoz(f);
        const y = yorumlar[`${sutun}${r}`];
        if (y) hucre.y = y;
        h[sutun] = hucre;
        sutunSayisi = Math.max(sutunSayisi, sutunNo(sutun));
      }
      if (Object.keys(h).length) satirlar.push({ r, h });
    }
    return {
      ad: t.ad,
      sira: t.sira,
      gizli: t.gizli,
      boyut: /<dimension ref="([^"]+)"/.exec(xml)?.[1] ?? "",
      sutunSayisi,
      satirlar,
    };
  });
}

// ------------------------------------------------------------- yardimcilar
const kucult = (s: string) => s.toLocaleLowerCase("tr-TR");
/** Eslestirme anahtari: kucuk harf, noktalama yok, tek bosluk. */
const normalle = (s: string | undefined | null) =>
  kucult(String(s ?? ""))
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
const parcalar = (s: string | undefined | null) =>
  normalle(s)
    .split(" ")
    .filter((p) => p.length >= 2);

/** "ALİ  ÇELEBİ" -> "Ali Çelebi", "ASYA/İPEKSU" -> "Asya/İpeksu". */
const basHarf = (m: string) =>
  kucult(m.trim())
    .replace(/\s+/g, " ")
    .replace(/(^|[\s/\-(])(\p{L})/gu, (_, on, h) => on + h.toLocaleUpperCase("tr-TR"));

const metin = (h?: Hucre): string => {
  if (!h) return "";
  if (h.t) return h.t.slice(0, 10);
  if (typeof h.v === "number") return Number.isInteger(h.v) ? String(h.v) : String(h.v);
  return String(h.v).trim();
};
const sayi = (h?: Hucre): number | null =>
  h && typeof h.v === "number" ? h.v : null;
const tamSayi = (h?: Hucre): number | null => {
  const n = sayi(h);
  return n === null ? null : Math.round(n);
};

/** Hucreden tarih: bicimli tarih, "12.05.2025" metni ya da ISO metin. */
function tarihAl(h?: Hucre): string | null {
  if (!h) return null;
  if (h.t) return h.t.slice(0, 10);
  const s = String(h.v).trim();
  const m = /^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/.exec(s);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return null;
}

const telefonNormalle = (ham: string) =>
  ham.replace(/\D/g, "").replace(/^(90|0)/, "");

/** "5396561893-5546961893BABA" -> { telefon, alternatif, ham } */
function telefonCoz(ham: string, yorum?: string) {
  const temiz = ham.trim();
  const adaylar = [...temiz.matchAll(/\d[\d\s]{8,}\d/g)].map((m) =>
    telefonNormalle(m[0]),
  );
  const telefon = adaylar[0] ?? "";
  const ek: string[] = [];
  if (adaylar.length > 1) {
    const etiket = temiz.replace(/[\d\s\-\/]+/g, " ").trim();
    ek.push(adaylar.slice(1).join(", ") + (etiket ? ` (${basHarf(etiket)})` : ""));
  }
  if (yorum) {
    const y = /(\d[\d\s]{8,}\d)/.exec(yorum);
    ek.push(
      y ? `${telefonNormalle(y[1])} (${basHarf(yorum.replace(y[1], "").trim() || "yorum")})` : yorum,
    );
  }
  return {
    telefon,
    alternatif: ek.length ? ek.join(" · ") : null,
    ham: temiz && temiz !== telefon ? temiz : null,
  };
}

/** "38 AY" -> 38, "4.5 YAŞ" -> 54, "16,5 AY" -> 16.5 */
function yasAy(ham: string): number | null {
  const m = /([\d]+(?:[.,]\d+)?)\s*(ay|yaş|yas)?/i.exec(ham.replace(/\s+/g, " "));
  if (!m) return null;
  const n = Number(m[1].replace(",", "."));
  if (!Number.isFinite(n)) return null;
  return /ya[şs]/i.test(m[2] ?? "") ? n * 12 : n;
}

function ayFarki(dogum: string, referans: string): number {
  const d = new Date(dogum);
  const r = new Date(referans);
  let ay = (r.getFullYear() - d.getFullYear()) * 12 + (r.getMonth() - d.getMonth());
  if (r.getDate() < d.getDate()) ay -= 1;
  return ay;
}

/** Odeme sekli metnini panel sozlugune indirger; ham metin ayrica saklaniyor. */
function yontemCoz(ham: string): string | null {
  const k = normalle(ham);
  if (!k) return null;
  const nakit = /nakit/.test(k);
  const kart = /kart|kk|k kart|kkart/.test(k);
  const havale = /havale|banka|eft/.test(k);
  const sayisi = [nakit, kart, havale].filter(Boolean).length;
  if (sayisi > 1) return "karisik";
  if (nakit) return "nakit";
  if (kart) return "kart";
  if (havale) return "havale";
  return "diger";
}

/** "9000(havale)+1000(nakit)" -> 10000; "5000 getirecek" -> null (odenmedi). */
function tutarCoz(h?: Hucre): { tutar: number | null; ham: string | null } {
  if (!h) return { tutar: null, ham: null };
  if (typeof h.v === "number") return { tutar: Math.round(h.v), ham: null };
  const s = String(h.v).trim();
  if (!s) return { tutar: null, ham: null };
  const odenmedi = /getirecek|ödeyecek|odeyecek|ödenmedi/i.test(s);
  const sayilar = [...s.matchAll(/\d[\d.]*/g)]
    .map((m) => Number(m[0].replace(/\.(?=\d{3}\b)/g, "")))
    .filter((n) => Number.isFinite(n) && n >= 100);
  const toplam = sayilar.reduce((t, n) => t + n, 0);
  return { tutar: odenmedi || toplam === 0 ? null : toplam, ham: s };
}

const AY_ADLARI = [
  "ocak",
  "şubat",
  "mart",
  "nisan",
  "mayıs",
  "haziran",
  "temmuz",
  "ağustos",
  "eylül",
  "ekim",
  "kasım",
  "aralık",
];
/** "EYLÜL'26" -> "2026-09", "Şubat " -> "2025-02" */
function sayfaAyi(ad: string): string | null {
  const k = kucult(ad.trim());
  const yil = /'(\d\d)/.test(k) ? 2000 + Number(/'(\d\d)/.exec(k)![1]) : 2025;
  const i = AY_ADLARI.findIndex((a) => k.startsWith(a));
  return i < 0 ? null : `${yil}-${String(i + 1).padStart(2, "0")}`;
}

/** ='OCAK''26'!F44+HAZİRAN!G2 -> [{sayfa:"OCAK'26", sutun:"F", satir:44}, ...] */
function formulReferanslari(f: string) {
  const cikti: { sayfa: string; sutun: string; satir: number }[] = [];
  for (const m of f.matchAll(/(?:'((?:[^']|'')+)'|([^\s+\-*\/!'()=,]+))!\$?([A-Z]+)\$?(\d+)/g)) {
    cikti.push({
      sayfa: (m[1] ?? m[2]).replace(/''/g, "'"),
      sutun: m[3],
      satir: Number(m[4]),
    });
  }
  return cikti;
}

// -------------------------------------------------------------------- tipler
type GenelSatir = {
  satir: number;
  kaynak: string;
  no: string;
  ad: string;
  veliAd: string;
  telefon: string;
  telefonHam: string | null;
  alternatif: string | null;
  ilkKayitYas: string;
  dogumGunu: string | null;
  dogumGunuHam: string;
  katilim: string;
  paket: string;
  program: string;
  sonOdeme: string | null;
  odenen: string;
  odemeTuru: string;
  ikametgah: string;
  kalanHak: number | null;
  gelisHakki: number | null;
  toplam: number | null;
  toplamFormul: string | null;
  guncellenme: string | null;
  not: string;
  ilkDers: string | null;
  yorumlar: string[];
  referanslar: string[];
};

type DefterSatiri = {
  sayfa: string;
  satir: number;
  ay: string;
  bolum: string | null;
  cocukAdi: string;
  veliAdi: string;
  tarih: string | null;
  tarihHam: string | null;
  paket: string | null;
  program: string | null;
  tutar: number | null;
  tutarHam: string | null;
  odemeTuru: string | null;
  yontem: string | null;
  aciklama: string | null;
  ek: Record<string, string> | null;
  // 2025 sablonundan gelen kimlik bilgileri
  telefonlar: string[];
  dogum: string | null;
  adres: string | null;
  /** Eslesen ogrencinin anahtari (genel:<satir> | db:<id> | yeni:<key>) */
  hedef?: string;
  eslesme?: string;
};

type DbOgrenci = {
  id: string;
  ad: string;
  soyad: string | null;
  dogum_tarihi: string | null;
  kayit_tarihi: string;
  notlar: string | null;
  excel_kaynak: string | null;
};
type DbVeli = { id: string; ad_soyad: string; telefon: string | null; excel_adi: string | null };

// ---------------------------------------------------------------- GENEL LISTE
function genelListeOku(s: Sayfa): GenelSatir[] {
  const cikti: GenelSatir[] = [];
  for (const r of s.satirlar) {
    if (r.r < 2) continue;
    const h = r.h;
    const ad = metin(h.B);
    if (!ad) continue;
    const tel = telefonCoz(metin(h.D), h.D?.y);
    const yorumlar: string[] = [];
    for (const [sutun, hucre] of Object.entries(h)) {
      if (hucre.y && sutun !== "D") yorumlar.push(`[${sutun} yorumu] ${hucre.y}`);
    }
    const p = h.P;
    cikti.push({
      satir: r.r,
      kaynak: `${s.ad}!${r.r}`,
      no: metin(h.A),
      ad,
      veliAd: metin(h.C),
      telefon: tel.telefon,
      telefonHam: tel.ham,
      alternatif: tel.alternatif,
      ilkKayitYas: metin(h.E),
      dogumGunu: tarihAl(h.F),
      dogumGunuHam: metin(h.F),
      katilim: metin(h.G),
      paket: metin(h.H),
      program: metin(h.I),
      sonOdeme: tarihAl(h.J),
      odenen: metin(h.K),
      odemeTuru: metin(h.L),
      ikametgah: metin(h.M),
      kalanHak: tamSayi(h.N),
      gelisHakki: tamSayi(h.O),
      toplam: tamSayi(p),
      toplamFormul: p?.f ? `=${p.f}` : null,
      guncellenme: tarihAl(h.Q),
      not: metin(h.R),
      ilkDers: tarihAl(h.S),
      yorumlar,
      referanslar: p?.f
        ? formulReferanslari(p.f).map((x) => `${x.sayfa}!${x.satir}`)
        : [],
    });
  }
  return cikti;
}

// ------------------------------------------------------------ aylik sayfalar
/** Baslik metni -> hangi cekirdek alan. */
function alanTuru(baslik: string): string | null {
  const k = normalle(baslik);
  if (/çocuk (isim|ad)/.test(k)) return "cocuk";
  if (/veli (isim|ad)/.test(k)) return "veli";
  if (/ödeme tarihi/.test(k)) return "tarih";
  if (/^ödenen( tutar)?$/.test(k)) return "tutar";
  if (/ödeme (şekli|türü)/.test(k)) return "odemeTuru";
  if (/^paket$/.test(k)) return "paket";
  if (/^program$/.test(k)) return "program";
  if (/^not$/.test(k)) return "not";
  if (/telefon/.test(k)) return "telefon";
  if (/doğum tarihi/.test(k)) return "dogum";
  if (/^adres$/.test(k)) return "adres";
  if (/^sayı$/.test(k)) return "sira";
  return null;
}

/** Eski (Ocak-Mayis 2025) sablonun standart sutun dizilimi. */
const ESKI_SABLON: Record<string, string> = {
  B: "Sayı",
  C: "Çocuk İsim",
  D: "Veli İsim",
  E: "Çocuk Doğum Tarihi",
  F: "Çocuk Yaş",
  G: "Veli Telefon Numarası",
  H: "Alternatif Telefon no",
  I: "Adres",
  J: "Ücret Ödeme tarihi",
  K: "Ödenen Tutar",
  L: "Ücret Ödeme Şekli",
  M: "Kalan Hak",
  N: "Borç Durumu",
  O: "Kayıt Yenileme Durumu",
  P: "Not",
};

function aylikSayfaOku(s: Sayfa): DefterSatiri[] {
  const ay = sayfaAyi(s.ad);
  if (!ay) return [];
  const cikti: DefterSatiri[] = [];
  let basliklar: Record<string, string> = {};
  let bolum: string | null = null;

  const satirMap = new Map(s.satirlar.map((r) => [r.r, r]));
  const sonSatir = Math.max(...s.satirlar.map((r) => r.r));

  for (let no = 1; no <= sonSatir; no++) {
    const r = satirMap.get(no);
    if (!r) continue;
    const h = r.h;
    const degerler = Object.values(h).map((x) => normalle(String(x.v)));
    const baslikMi =
      degerler.some((d) => /çocuk (ad|isim)/.test(d)) &&
      degerler.some((d) => /veli (ad|isim)/.test(d));
    if (baslikMi) {
      basliklar = {};
      for (const [sutun, hucre] of Object.entries(h)) {
        const b = String(hucre.v).trim();
        if (b && alanTuru(b)) basliklar[sutun] = b;
        else if (b) basliklar[sutun] = b;
      }
      // "1 GÜN GELENLER" gibi bolum etiketi ayni satirda (Mayis) ya da bir altta.
      const etiket = metin(h.A);
      if (/gelenler/i.test(etiket)) bolum = etiket.trim();
      continue;
    }
    const bolumEtiketi = metin(h.A);
    if (/gelenler/i.test(bolumEtiketi)) bolum = bolumEtiketi.trim();

    /*
      Subat 2025'in sasmis satirlari (60-63): veli, dogum tarihi ve
      telefonlar D-G sutunlarina yazilmis, basliklari yok. Eski sablonun
      dizilimi o dort sutuna uygulaniyor; H'deki ikinci veli adi duruyor.
    */
    let etkinBasliklar = basliklar;
    if (h.D && basliklar.D === undefined && basliklar.H) {
      etkinBasliklar = {
        ...basliklar,
        D: ESKI_SABLON.D,
        E: ESKI_SABLON.E,
        F: ESKI_SABLON.F,
        G: ESKI_SABLON.G,
      };
    }

    let cocuk = "";
    let veli = "";
    let tarih: string | null = null;
    let tarihHam: string | null = null;
    let tutar: { tutar: number | null; ham: string | null } = { tutar: null, ham: null };
    let tutarBulundu = false;
    let odemeTuru: string | null = null;
    let paket: string | null = null;
    let program: string | null = null;
    const notlar: string[] = [];
    const ek: Record<string, string> = {};
    const telefonlar: string[] = [];
    let dogum: string | null = null;
    let adres: string | null = null;

    for (const [sutun, hucre] of Object.entries(h)) {
      const deger = metin(hucre);
      if (deger === "" && !hucre.f) continue;
      const baslik = etkinBasliklar[sutun];
      const tur = baslik ? alanTuru(baslik) : null;
      switch (tur) {
        case "cocuk":
          cocuk = deger;
          break;
        case "veli":
          veli = veli ? `${veli} / ${deger}` : deger;
          break;
        case "tarih": {
          const t = tarihAl(hucre);
          if (t && !tarih) tarih = t;
          else if (!t && deger) tarihHam = tarihHam ? `${tarihHam} · ${deger}` : deger;
          break;
        }
        case "tutar": {
          const c = tutarCoz(hucre);
          if (!tutarBulundu || (c.tutar !== null && tutar.tutar === null)) {
            tutar = c;
            tutarBulundu = true;
          }
          break;
        }
        case "odemeTuru":
          odemeTuru = deger;
          break;
        case "paket":
          paket = deger;
          break;
        case "program":
          program = deger;
          break;
        case "not":
          notlar.push(deger);
          break;
        case "telefon": {
          const t = telefonNormalle(deger);
          if (t.length >= 9) telefonlar.push(t);
          ek[baslik!] = deger;
          break;
        }
        case "dogum":
          dogum = tarihAl(hucre);
          ek[baslik!] = deger;
          break;
        case "adres":
          adres = deger;
          ek[baslik!] = deger;
          break;
        case "sira":
          ek[baslik!] = deger;
          break;
        default:
          if (baslik) ek[baslik] = deger;
          else if (sutun === "A" && /gelenler/i.test(deger)) {
            /* bolum etiketi, ayrica saklamaya gerek yok */
          } else if (typeof hucre.v === "string" && sutunNo(sutun) > 3) {
            // Basliksiz serbest not sutunu (Agustos'26 G gibi).
            notlar.push(deger);
          } else {
            ek[sutun] = deger + (hucre.f ? ` {=${hucre.f}}` : "");
          }
      }
    }

    // Veri satiri mi: en az iki harfli bir cocuk adi ya da bir tutar.
    const harfli = /\p{L}{2,}/u.test(cocuk);
    if (!harfli && tutar.tutar === null) continue;
    if (!harfli && !cocuk) continue;

    cikti.push({
      sayfa: s.ad.trim(),
      satir: no,
      ay,
      bolum,
      cocukAdi: cocuk.trim(),
      veliAdi: veli.trim(),
      tarih,
      tarihHam,
      paket,
      program,
      tutar: tutar.tutar,
      tutarHam: tutar.ham,
      odemeTuru,
      yontem: odemeTuru ? yontemCoz(odemeTuru) : tutar.ham ? yontemCoz(tutar.ham) : null,
      aciklama: notlar.length ? notlar.join(" · ") : null,
      ek: Object.keys(ek).length ? ek : null,
      telefonlar,
      dogum,
      adres,
    });
  }
  return cikti;
}

// ---------------------------------------------------------------- eslestirme
/**
 * Defter satirini GENEL LISTE cocuguna adla baglar.
 * Kural: cocugun ilk kelimesi ayni + veli adinda en az bir ortak kelime.
 * Tek aday olmali; iki aday ayni puandaysa baglanmiyor (yanlis birlestirme
 * eksik birlestirmeden kotu).
 */
function adlaEslestir(
  satir: DefterSatiri,
  genel: GenelSatir[],
): { hedef: GenelSatir; neden: string } | null {
  const c = parcalar(satir.cocukAdi);
  const v = parcalar(satir.veliAdi);
  if (!c.length) return null;
  const cTam = normalle(satir.cocukAdi);
  const vTam = normalle(satir.veliAdi);
  const uzun = (p: string) => p.length >= 3;

  /*
    Velisi yazilmamis satir ("LİYA"): cocugun ilk kelimesi GENEL LISTE'de
    TEK cocuga aitse o cocuk. Iki adaysa baglanmiyor.
  */
  if (!v.length) {
    const tekil = genel.filter((g) => parcalar(g.ad)[0] === c[0]);
    if (tekil.length === 1) return { hedef: tekil[0], neden: "ad (velisiz)" };
    const tam = tekil.filter((g) => normalle(g.ad) === cTam && !parcalar(g.veliAd).length);
    return tam.length === 1 ? { hedef: tam[0], neden: "ad (velisiz)" } : null;
  }

  const adaylar = genel
    .map((g) => {
      const gc = parcalar(g.ad);
      const gv = parcalar(g.veliAd);
      if (!gv.length) return null;
      let puan = 0;
      if (normalle(g.ad) === cTam) puan += 3;
      else if (gc[0] === c[0]) puan += 2;
      else if (gc.some((p) => uzun(p) && c.includes(p))) puan += 1;
      else return null;
      if (normalle(g.veliAd) === vTam) puan += 3;
      else {
        /* "BUSE" ile "BUSENUR" ayni kisi sayiliyor: dort harften uzun bir
           on ek yeterli. Uc harfli "ALİ" gibi kisa adlar es sayilmiyor. */
        const es = (a: string, b: string) =>
          a === b || (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a)));
        const ortak = gv.filter((p) => uzun(p) && v.some((q) => es(p, q))).length;
        if (ortak === 0) return null;
        puan += ortak;
      }
      return { g, puan };
    })
    .filter((x): x is { g: GenelSatir; puan: number } => x !== null)
    .sort((a, b) => b.puan - a.puan || a.g.satir - b.g.satir);

  if (!adaylar.length) return null;
  if (adaylar.length > 1 && adaylar[0].puan === adaylar[1].puan) {
    /*
      Esit puanli adaylar AYNI VELIYE aitse (MELİS iki kez kayitli, ikisi de
      PINAR BALDEMİR) ilk satir aliniyor: cocuk ayni cocuk. Farkli veliyse
      baglanmiyor.
    */
    const ayniVeli = adaylar
      .filter((a) => a.puan === adaylar[0].puan)
      .every((a) => normalle(a.g.veliAd) === normalle(adaylar[0].g.veliAd));
    if (!ayniVeli) return null;
    return { hedef: adaylar[0].g, neden: `ad benzerligi (${adaylar[0].puan}, ilk kayit)` };
  }
  return {
    hedef: adaylar[0].g,
    neden: `ad benzerligi (${adaylar[0].puan})`,
  };
}

// ------------------------------------------------------------------- rapor
const rapor: string[] = [];
const uyarilar: string[] = [];
const log = (s = "") => {
  console.log(s);
  rapor.push(s);
};
const uyar = (s: string) => {
  uyarilar.push(s);
};

// ---------------------------------------------------------------------- akis
async function main() {
  const yol = resolve(DOSYA);
  const dosyaAdi = basename(yol);
  const sayfalar = xlsxOku(yol);
  log("");
  log(`  ${dosyaAdi}: ${sayfalar.length} sayfa okundu. ${YAZ ? "YAZILIYOR" : "DENEME (hicbir sey yazilmiyor)"}`);
  log("");

  const genelSayfa = sayfalar.find((s) => normalle(s.ad) === "genel liste");
  if (!genelSayfa) throw new Error("GENEL LİSTE sayfasi bulunamadi.");
  const genel = genelListeOku(genelSayfa);
  log(`  GENEL LİSTE: ${genel.length} cocuk`);

  // Aylik sayfalar: adi ay olan her sayfa.
  const aylikSayfalar = sayfalar.filter((s) => sayfaAyi(s.ad));
  const defter: DefterSatiri[] = aylikSayfalar.flatMap(aylikSayfaOku);
  log(`  Aylik sayfalar: ${aylikSayfalar.length} sayfa, ${defter.length} defter satiri`);

  // ---- 1. Formul referanslari: kesin eslesme
  const refHaritasi = new Map<string, GenelSatir>();
  for (const g of genel) for (const r of g.referanslar) refHaritasi.set(r, g);

  // ---- 2. Mevcut veritabani
  const { data: dbOgrencilerHam } = await db
    .from("ogrenciler")
    .select("*");
  const { data: dbVelilerHam } = await db
    .from("veliler")
    .select("*");
  const { data: dbBaglar } = await db.from("ogrenci_veli").select("ogrenci_id, veli_id, birincil");
  const dbOgrenciler = (dbOgrencilerHam ?? []) as DbOgrenci[];
  const dbVeliler = (dbVelilerHam ?? []) as DbVeli[];
  const baglar = (dbBaglar ?? []) as { ogrenci_id: string; veli_id: string; birincil: boolean }[];
  const veliTelefonu = new Map(dbVeliler.filter((v) => v.telefon).map((v) => [v.telefon!, v]));
  const veliAdiyla = new Map(dbVeliler.map((v) => [normalle(v.ad_soyad), v]));

  // GENEL satiri -> DB ogrenci (varsa)
  const genelDb = new Map<number, DbOgrenci>();
  for (const g of genel) {
    const kaynakla = dbOgrenciler.find((o) => o.excel_kaynak === g.kaynak);
    if (kaynakla) {
      genelDb.set(g.satir, kaynakla);
      continue;
    }
    // Onceki aktarimdan gelen ogrenciler: telefon ya da ad + veli soyadi.
    const adaylar = dbOgrenciler.filter((o) => {
      if (o.excel_kaynak) return false;
      const veliler = baglar.filter((b) => b.ogrenci_id === o.id).map((b) => dbVeliler.find((v) => v.id === b.veli_id)).filter(Boolean) as DbVeli[];
      if (g.telefon && veliler.some((v) => v.telefon === g.telefon)) return true;
      const oc = parcalar(`${o.ad} ${o.soyad ?? ""}`);
      const gc = parcalar(g.ad);
      if (!oc.length || !gc.length || oc[0] !== gc[0]) return false;
      const gvSoy = parcalar(g.veliAd).at(-1);
      return veliler.some((v) => parcalar(v.ad_soyad).at(-1) === gvSoy && gvSoy);
    });
    if (adaylar.length === 1) {
      genelDb.set(g.satir, adaylar[0]);
      log(`  = ${g.ad.padEnd(22)} paneldeki "${adaylar[0].ad} ${adaylar[0].soyad ?? ""}" kaydina baglandi`);
    } else if (adaylar.length > 1) {
      uyar(`${g.kaynak} ${g.ad}: panelde ${adaylar.length} aday var, baglanmadi`);
    }
  }

  // ---- 3. Defter satirlarini ogrenciye bagla
  const yeniCocuklar = new Map<string, { ad: string; veli: string; satirlar: DefterSatiri[] }>();
  let refIle = 0;
  let adIle = 0;
  let telIle = 0;
  const genelTelefonu = new Map<string, GenelSatir>();
  for (const g of genel) if (g.telefon.length === 10 && !genelTelefonu.has(g.telefon)) genelTelefonu.set(g.telefon, g);

  /*
    Takma ad ogrenme: bir satir formul ya da telefonla baglaninca
    "cocuk|veli" yazimi o ogrenciye ait sayiliyor. Subat 2025'te telefonla
    baglanan "ALPTUĞ / AYŞE", Mart'ta telefonsuz ayni yaziyla gelince
    yeniden aranmiyor. Sayfalar Excel sirasiyla (kronolojik) isleniyor.
  */
  const takmaAdlar = new Map<string, string>();
  const takmaAnahtari = (d: DefterSatiri) => `${normalle(d.cocukAdi)}|${normalle(d.veliAdi)}`;
  let takmaIle = 0;

  for (const d of defter) {
    const ref = refHaritasi.get(`${d.sayfa}!${d.satir}`);
    if (ref) {
      d.hedef = `genel:${ref.satir}`;
      d.eslesme = "formul";
      refIle++;
      takmaAdlar.set(takmaAnahtari(d), d.hedef);
      continue;
    }
    const telG = d.telefonlar.map((t) => genelTelefonu.get(t)).find(Boolean);
    if (telG) {
      d.hedef = `genel:${telG.satir}`;
      d.eslesme = "telefon";
      telIle++;
      takmaAdlar.set(takmaAnahtari(d), d.hedef);
      continue;
    }
    const takma = takmaAdlar.get(takmaAnahtari(d));
    if (takma) {
      d.hedef = takma;
      d.eslesme = "onceki sayfadaki yazim";
      takmaIle++;
      continue;
    }
    const ad = adlaEslestir(d, genel);
    if (ad) {
      d.hedef = `genel:${ad.hedef.satir}`;
      d.eslesme = ad.neden;
      adIle++;
      takmaAdlar.set(takmaAnahtari(d), d.hedef);
      continue;
    }
    const anahtar = takmaAnahtari(d);
    if (!yeniCocuklar.has(anahtar)) yeniCocuklar.set(anahtar, { ad: d.cocukAdi, veli: d.veliAdi, satirlar: [] });
    yeniCocuklar.get(anahtar)!.satirlar.push(d);
    d.hedef = `yeni:${anahtar}`;
    d.eslesme = "yeni kayit";
  }
  log(`  Defter eslesmesi: ${refIle} formulle, ${telIle} telefonla, ${takmaIle} onceki yazimla, ${adIle} adla, ${yeniCocuklar.size} yeni cocuk (${defter.length - refIle - telIle - takmaIle - adIle} satir)`);

  // ---- 4. Cocuk basina defter ozeti (ilk tarih, son satir)
  const cocukDefteri = new Map<string, DefterSatiri[]>();
  for (const d of defter) {
    const l = cocukDefteri.get(d.hedef!) ?? [];
    l.push(d);
    cocukDefteri.set(d.hedef!, l);
  }
  const ilkTarih = (anahtar: string) =>
    (cocukDefteri.get(anahtar) ?? []).map((d) => d.tarih).filter((t): t is string => Boolean(t)).sort()[0] ?? null;

  // ---- 5. GENEL LISTE -> ogrenci kayitlari
  type OgrenciYazimi = {
    anahtar: string;
    mevcut: DbOgrenci | null;
    veri: Record<string, unknown>;
    veliAd: string;
    telefon: string;
    telefonHam: string | null;
    alternatif: string | null;
    adres: string | null;
    etiket: string;
  };
  const yazimlar: OgrenciYazimi[] = [];
  const dogumKararlari: string[] = [];
  let dogumKabul = 0;
  let dogumRed = 0;
  let dogum2025 = 0;
  const KATILIM: Record<string, string> = {
    aktif: "aktif",
    pasif: "dondurdu",
    ayrildi: "ayrildi",
    "ayrıldı": "ayrildi",
    "tek sefer": "ayrildi",
  };

  for (const g of genel) {
    const mevcut = genelDb.get(g.satir) ?? null;
    const anahtar = `genel:${g.satir}`;
    const satirlari = cocukDefteri.get(anahtar) ?? [];
    const referans = ilkTarih(anahtar) ?? g.ilkDers ?? g.sonOdeme ?? g.guncellenme ?? BUGUN;

    // Dogum tarihi karari
    let dogumTarihi: string | null = mevcut?.dogum_tarihi ?? null;
    const notParcalari: string[] = [];
    if (!dogumTarihi && g.dogumGunu) {
      const yil = Number(g.dogumGunu.slice(0, 4));
      const yas = yasAy(g.ilkKayitYas);
      const gecmiste = g.dogumGunu <= BUGUN;
      /*
        "DOGUM GUNU" hucresi cogu satirda dogum gununun yil yer tutuculu
        halidir (2025-01-02 yazip cocuk 2024 dogumlu). Yil dogru mu diye
        tek olcut var: hucredeki tarihten ilk kayit tarihine kadar gecen ay
        sayisi, "ILK KAYIT YAS" ile tutuyor mu. Bes ay pay birakiliyor
        (kayit tarihi kabaca biliniyor); yil sasmissa fark on iki ay olur
        ve reddedilir. Yas yazilmamissa dogrulanamiyor, tarih alinmiyor.
      */
      if (yil >= 2017 && gecmiste && yas !== null) {
        const fark = Math.abs(ayFarki(g.dogumGunu, referans) - yas);
        if (fark <= 5) {
          dogumTarihi = g.dogumGunu;
          dogumKabul++;
        } else {
          dogumRed++;
          notParcalari.push(`Excel "DOĞUM GÜNÜ" hücresi (${g.dogumGunuHam}) ilk kayıt yaşıyla (${g.ilkKayitYas}) tutmuyor; doğum tarihi boş bırakıldı.`);
        }
      }
    }
    if (!dogumTarihi) {
      const d2025 = satirlari.map((d) => d.dogum).find((d) => d && Number(d.slice(0, 4)) >= 2017 && d <= BUGUN);
      if (d2025) {
        dogumTarihi = d2025;
        dogum2025++;
        const kaynakSatir = satirlari.find((d) => d.dogum === d2025)!;
        notParcalari.push(`Doğum tarihi ${kaynakSatir.sayfa} sayfası ${kaynakSatir.satir}. satırdan alındı.`);
      }
    }

    dogumKararlari.push(
      `    ${g.satir.toString().padStart(3)} ${g.ad.padEnd(22)} yaş=${g.ilkKayitYas.padEnd(8)} doğum günü=${(g.dogumGunuHam || "-").padEnd(11)} ref=${referans} -> ${dogumTarihi ?? "BOŞ"}${notParcalari.length ? " (" + notParcalari.join(" ") + ")" : ""}`,
    );

    const durum = KATILIM[normalle(g.katilim)] ?? (mevcut ? undefined : "ayrildi");
    if (!KATILIM[normalle(g.katilim)] && g.katilim) uyar(`${g.kaynak} ${g.ad}: bilinmeyen katilim durumu "${g.katilim}"`);

    const kayitTarihi =
      mevcut?.kayit_tarihi ??
      [ilkTarih(anahtar), g.ilkDers, g.sonOdeme, g.guncellenme].filter((t): t is string => Boolean(t)).sort()[0] ??
      BUGUN;

    const excelNotu = [g.not, ...g.yorumlar].filter(Boolean).join(" · ") || null;
    const aktarimNotu = `GENEL LİSTE ${g.satir}. satırdan aktarıldı (${BUGUN}).${notParcalari.length ? " " + notParcalari.join(" ") : ""}`;
    const notlar = mevcut?.notlar
      ? mevcut.notlar.includes("GENEL LİSTE") ? mevcut.notlar : `${mevcut.notlar}\n${aktarimNotu}`
      : aktarimNotu;

    const veri: Record<string, unknown> = {
      ...(mevcut ? {} : { ad: basHarf(g.ad), soyad: null, kurum: "oyun-evi", kayit_tarihi: kayitTarihi }),
      ...(durum ? { durum } : {}),
      dogum_tarihi: dogumTarihi,
      excel_no: g.no || null,
      excel_adi: g.ad,
      excel_kaynak: g.kaynak,
      ilk_kayit_yas: g.ilkKayitYas || null,
      dogum_gunu: g.dogumGunu,
      katilim_durumu: g.katilim || null,
      paket: g.paket || null,
      program_metni: g.program || null,
      son_odeme_tarihi: g.sonOdeme,
      son_odenen: g.odenen || null,
      son_odeme_turu: g.odemeTuru || null,
      ikametgah: g.ikametgah || null,
      kalan_hak_saat: g.kalanHak,
      gelis_hakki: g.gelisHakki,
      toplam_odenen: g.toplam,
      toplam_odenen_formul: g.toplamFormul,
      guncellenme_tarihi: g.guncellenme,
      excel_notu: excelNotu,
      ilk_ders_tarihi: g.ilkDers,
      notlar,
    };
    yazimlar.push({
      anahtar,
      mevcut,
      veri,
      veliAd: g.veliAd,
      telefon: g.telefon,
      telefonHam: g.telefonHam,
      alternatif: g.alternatif,
      adres: g.ikametgah || null,
      etiket: `${g.satir}. ${g.ad}`,
    });
    if (g.telefon && g.telefon.length !== 10) uyar(`${g.kaynak} ${g.ad}: veli telefonu ${g.telefon.length} haneli ("${metin({ v: g.telefonHam ?? g.telefon })}")`);
  }
  log(`  Dogum tarihi: ${dogumKabul} kabul, ${dogumRed} red (yasla tutmuyor), ${dogum2025} tanesi 2025 sayfalarindan`);

  // ---- 6. Yalniz defterde gecen cocuklar -> yeni ogrenci
  for (const [anahtar, y] of yeniCocuklar) {
    const satirlari = y.satirlar.sort((a, b) => (a.tarih ?? a.ay).localeCompare(b.tarih ?? b.ay));
    const son = satirlari.at(-1)!;
    const sonAy = son.ay;
    const durum = sonAy >= "2026-08" ? "aktif" : "ayrildi";
    const telefon = satirlari.flatMap((d) => d.telefonlar).find((t) => t.length === 10) ?? "";
    const dogum = satirlari.map((d) => d.dogum).find((d) => d && Number(d.slice(0, 4)) >= 2017 && d <= BUGUN) ?? null;
    const kaynak = `${satirlari[0].sayfa}!${satirlari[0].satir}`;
    const mevcut = dbOgrenciler.find((o) => o.excel_kaynak === kaynak) ?? null;
    const adres = satirlari.map((d) => d.adres).find(Boolean) ?? null;
    yazimlar.push({
      anahtar: `yeni:${anahtar}`,
      mevcut,
      veri: {
        ...(mevcut ? {} : { ad: basHarf(y.ad), soyad: null, kurum: "oyun-evi", kayit_tarihi: satirlari[0].tarih ?? `${satirlari[0].ay}-01` }),
        durum,
        dogum_tarihi: mevcut?.dogum_tarihi ?? dogum,
        excel_adi: y.ad,
        excel_kaynak: kaynak,
        katilim_durumu: null,
        paket: son.paket,
        program_metni: son.program,
        son_odeme_tarihi: son.tarih,
        son_odenen: son.tutar !== null ? String(son.tutar) : son.tutarHam,
        son_odeme_turu: son.odemeTuru,
        ikametgah: adres,
        notlar: `GENEL LİSTE'de kaydı yok; yalnız ${satirlari.map((d) => `${d.sayfa} ${d.satir}. satır`).join(", ")} ödeme kaydında geçiyor (${BUGUN}).`,
      },
      veliAd: y.veli,
      telefon,
      telefonHam: null,
      alternatif: satirlari.flatMap((d) => d.telefonlar).filter((t) => t !== telefon)[0] ?? null,
      adres,
      etiket: `${satirlari[0].sayfa} ${satirlari[0].satir}. ${y.ad}${y.veli ? " / " + y.veli : ""}`,
    });
  }

  // ---- 7. Yaz: ogrenciler ve veliler
  const ogrenciIdleri = new Map<string, string>(); // anahtar -> id
  let eklenen = 0;
  let guncellenen = 0;
  let yeniVeli = 0;
  let mevcutVeli = 0;
  let velisiz = 0;

  for (const y of yazimlar) {
    if (!YAZ) {
      ogrenciIdleri.set(y.anahtar, y.mevcut?.id ?? `(yeni)`);
      if (y.mevcut) guncellenen++;
      else eklenen++;
      if (!y.veliAd && !y.telefon) velisiz++;
      continue;
    }
    let id = y.mevcut?.id;
    if (id) {
      const { error } = await db.from("ogrenciler").update(y.veri).eq("id", id);
      if (error) {
        uyar(`${y.etiket}: guncellenemedi (${error.message})`);
        continue;
      }
      guncellenen++;
    } else {
      const { data, error } = await db.from("ogrenciler").insert(y.veri).select("id").single();
      if (error || !data) {
        uyar(`${y.etiket}: ogrenci yazilamadi (${error?.message})`);
        continue;
      }
      id = (data as { id: string }).id;
      eklenen++;
    }
    ogrenciIdleri.set(y.anahtar, id);

    // Veli
    if (!y.veliAd && !y.telefon) {
      velisiz++;
      continue;
    }
    let veli: DbVeli | undefined;
    if (y.telefon.length === 10) veli = veliTelefonu.get(y.telefon);
    if (!veli && !y.telefon) veli = veliAdiyla.get(normalle(y.veliAd));
    /*
      Onceki aktarimda eksik haneli yazilmis telefon: ayni ogrencinin tek
      velisi varsa ve numarasi 10 hane degilse Excel'deki numarayla
      duzeltiliyor.
    */
    if (!veli && y.mevcut && y.telefon.length === 10) {
      const bagli = baglar.filter((b) => b.ogrenci_id === y.mevcut!.id).map((b) => dbVeliler.find((v) => v.id === b.veli_id)).filter(Boolean) as DbVeli[];
      const eksik = bagli.find((v) => (v.telefon ?? "").length !== 10 && parcalar(v.ad_soyad).at(-1) === parcalar(y.veliAd).at(-1));
      if (eksik) {
        await db.from("veliler").update({ telefon: y.telefon, telefon_ham: eksik.telefon, notlar: `Telefon GENEL LİSTE'den düzeltildi (${BUGUN}); önceki: ${eksik.telefon}` }).eq("id", eksik.id);
        eksik.telefon = y.telefon;
        veliTelefonu.set(y.telefon, eksik);
        veli = eksik;
        log(`    ~ ${eksik.ad_soyad}: telefon ${y.telefon} olarak duzeltildi`);
      }
    }
    if (veli) {
      const guncel: Record<string, unknown> = { excel_adi: y.veliAd || null };
      if (y.alternatif) guncel.alternatif_telefon = y.alternatif;
      if (y.telefonHam) guncel.telefon_ham = y.telefonHam;
      if (y.adres) guncel.adres = y.adres;
      await db.from("veliler").update(guncel).eq("id", veli.id);
      mevcutVeli++;
    } else {
      const { data, error } = await db
        .from("veliler")
        .insert({
          ad_soyad: basHarf(y.veliAd) || "Veli",
          telefon: y.telefon.length === 10 ? y.telefon : null,
          telefon_ham: y.telefonHam ?? (y.telefon && y.telefon.length !== 10 ? y.telefon : null),
          alternatif_telefon: y.alternatif,
          excel_adi: y.veliAd || null,
          adres: y.adres,
          notlar: `Excel GENEL LİSTE'den aktarıldı (${BUGUN}).${y.telefon && y.telefon.length !== 10 ? ` DİKKAT: telefon eksik haneli geldi ("${y.telefon}").` : ""}`,
        })
        .select("id, ad_soyad, telefon, excel_adi")
        .single();
      if (error || !data) {
        uyar(`${y.etiket}: veli yazilamadi (${error?.message})`);
        continue;
      }
      veli = data as DbVeli;
      dbVeliler.push(veli);
      if (veli.telefon) veliTelefonu.set(veli.telefon, veli);
      veliAdiyla.set(normalle(veli.ad_soyad), veli);
      yeniVeli++;
    }
    const zatenBagli = baglar.some((b) => b.ogrenci_id === id && b.veli_id === veli!.id);
    if (!zatenBagli) {
      const birincil = !baglar.some((b) => b.ogrenci_id === id && b.birincil);
      const { error } = await db.from("ogrenci_veli").insert({ ogrenci_id: id, veli_id: veli.id, yakinlik: "veli", birincil });
      if (error) uyar(`${y.etiket}: veli baglanamadi (${error.message})`);
      else baglar.push({ ogrenci_id: id, veli_id: veli.id, birincil });
    }
  }
  log(`  Ogrenci: ${eklenen} yeni, ${guncellenen} guncellendi, ${velisiz} velisiz`);
  if (YAZ) log(`  Veli: ${yeniVeli} yeni, ${mevcutVeli} mevcut`);

  // ---- 8. Defter satirlarini yaz
  const defterSatirlari = defter.map((d) => ({
    ogrenci_id: YAZ ? (ogrenciIdleri.get(d.hedef!) ?? null) : null,
    cocuk_adi: d.cocukAdi || "(adsız)",
    veli_adi: d.veliAdi || null,
    tarih: d.tarih,
    tarih_ham: d.tarihHam,
    paket: d.paket,
    program: d.program,
    tutar: d.tutar,
    tutar_ham: d.tutarHam,
    odeme_turu: d.odemeTuru,
    yontem: d.yontem,
    aciklama: d.aciklama,
    ay: d.ay,
    sayfa: d.sayfa,
    bolum: d.bolum,
    kaynak: "excel",
    kaynak_satir: d.satir,
    ek_alanlar: d.ek,
    olusturan: "excel-ice-aktar",
  }));
  const toplamCiro = defterSatirlari.reduce((t, d) => t + (d.tutar ?? 0), 0);
  log(`  Defter: ${defterSatirlari.length} satir, toplam ${toplamCiro.toLocaleString("tr-TR")} TL, tutarsiz ${defterSatirlari.filter((d) => d.tutar === null).length}`);

  // ---- 9. Dogum gunu
  const dogumSayfa = sayfalar.find((s) => normalle(s.ad) === "doğum günü");
  const partiler = (dogumSayfa?.satirlar ?? [])
    .filter((r) => r.r >= 2)
    .map((r) => {
      const h = r.h;
      const kapora = sayi(h.F);
      const saatH = h.H;
      const saat = saatH ? (saatH.t ? saatH.t.slice(11) || metin(saatH) : metin(saatH)) : null;
      const tel = telefonNormalle(metin(h.C));
      return {
        cocuk_adi: metin(h.A) || null,
        veli_adi: metin(h.B) || null,
        telefon: tel || null,
        cocuk_yas: metin(h.D).trim() || null,
        dogum_gunu: tarihAl(h.E),
        kapora: kapora === null ? null : Math.round(kapora),
        kapora_ham: kapora === null && metin(h.F) ? metin(h.F) : null,
        organizasyon_tarihi: tarihAl(h.G),
        saat: saat || null,
        anlasilan_fiyat: tamSayi(h.I),
        kalan_odeme: tamSayi(h.J),
        cocuk_sayisi: tamSayi(h.K),
        yetiskin_sayisi: tamSayi(h.L),
        yemek: metin(h.M) || null,
        susleme: metin(h.N) || null,
        mahalle: metin(h.O) || null,
        aciklama: metin(h.P) || null,
        ek_not: metin(h.Q) || null,
        ogrenci_id: null as string | null,
        kaynak: "excel",
        kaynak_satir: r.r,
        olusturan: "excel-ice-aktar",
      };
    })
    .filter((p) => p.cocuk_adi || p.veli_adi || p.organizasyon_tarihi);
  log(`  Dogum gunu: ${partiler.length} organizasyon`);

  // ---- 10. Giderler
  const giderSayfa = sayfalar.find((s) => normalle(s.ad).startsWith("elden"));
  const giderler = (giderSayfa?.satirlar ?? [])
    .filter((r) => r.r >= 2 && (r.h.B || r.h.C || r.h.D))
    .map((r) => ({
      tarih: tarihAl(r.h.B),
      tutar: tamSayi(r.h.C),
      aciklama: metin(r.h.D) || "(açıklamasız)",
      ek_not: metin(r.h.E) || null,
      kaynak: "excel",
      kaynak_satir: r.r,
      olusturan: "excel-ice-aktar",
    }));
  for (const g of giderler) if (!g.tarih || g.tutar === null) uyar(`ELDEN ${g.kaynak_satir}. satir: tarih veya tutar okunamadi (${g.aciklama})`);
  const gecerliGiderler = giderler.filter((g): g is typeof g & { tarih: string; tutar: number } => Boolean(g.tarih) && g.tutar !== null);
  log(`  Giderler: ${gecerliGiderler.length} satir, toplam ${gecerliGiderler.reduce((t, g) => t + g.tutar, 0).toLocaleString("tr-TR")} TL`);

  // ---- 11. Su karti
  const suSayfa = sayfalar.find((s) => normalle(s.ad).startsWith("su"));
  const suSatirlari = (suSayfa?.satirlar ?? [])
    .filter((r) => r.r >= 2 && r.h.B)
    .map((r) => ({
      etiket: metin(r.h.B),
      tarih: tarihAl(r.h.C),
      tl: tamSayi(r.h.D),
      stok: tamSayi(r.h.E),
      stok_formul: r.h.E?.f ? `=${r.h.E.f}` : null,
      kaynak: "excel",
      kaynak_satir: r.r,
    }));
  log(`  Su karti: ${suSatirlari.length} satir`);

  // ---- 12. Devamsizlik cizelgesi
  const devamSayfa = sayfalar.find((s) => normalle(s.ad).startsWith("devamsızlık"));
  const devamBaslik = devamSayfa?.satirlar.find((r) => r.r === 1)?.h ?? {};
  const devamSutunlari = Object.entries(devamBaslik)
    .filter(([s]) => s !== "A")
    .map(([s, h]) => ({ sutun: s, baslik: metin(h) }));
  const genelAdiyla = new Map<string, GenelSatir[]>();
  for (const g of genel) {
    const k = normalle(g.ad);
    genelAdiyla.set(k, [...(genelAdiyla.get(k) ?? []), g]);
  }
  const cizelge = (devamSayfa?.satirlar ?? [])
    .filter((r) => r.r >= 2 && metin(r.h.A))
    .map((r) => {
      const ad = metin(r.h.A);
      const adaylar = genelAdiyla.get(normalle(ad)) ?? [];
      return {
        cocuk_adi: ad,
        hedef: adaylar.length === 1 ? `genel:${adaylar[0].satir}` : null,
        sutunlar: devamSutunlari.map((s) => ({ baslik: s.baslik, deger: metin(r.h[s.sutun]) })),
        kaynak: "excel",
        kaynak_satir: r.r,
      };
    });
  log(`  Devamsizlik cizelgesi: ${cizelge.length} cocuk, ${cizelge.filter((c) => c.hedef).length} tanesi ogrenciye baglandi`);

  // ---- 13. Ham arsiv
  const arsiv = sayfalar.map((s) => ({
    dosya: dosyaAdi,
    sayfa_adi: s.ad,
    sira: s.sira,
    gizli: s.gizli,
    boyut: s.boyut,
    sutun_sayisi: s.sutunSayisi,
    satirlar: s.satirlar,
    hucre_sayisi: s.satirlar.reduce((t, r) => t + Object.keys(r.h).length, 0),
    ice_aktarim: new Date().toISOString(),
  }));
  log(`  Ham arsiv: ${arsiv.length} sayfa, ${arsiv.reduce((t, a) => t + a.hucre_sayisi, 0)} hucre`);

  // ---- 14. Deneme ciktisi
  if (!YAZ) {
    log("");
    log("  --- Defter satiri eslesmeleri (ornek) ---");
    for (const d of defter.filter((x) => x.eslesme !== "formul").slice(0, 400)) {
      const hedef = d.hedef!.startsWith("genel:")
        ? genel.find((g) => `genel:${g.satir}` === d.hedef)!
        : null;
      log(`    ${d.sayfa.padEnd(11)} ${String(d.satir).padStart(3)} ${(d.cocukAdi + (d.veliAdi ? " / " + d.veliAdi : "")).padEnd(46)} -> ${hedef ? `${hedef.ad} / ${hedef.veliAd} (${d.eslesme})` : "YENİ KAYIT"}`);
    }
    log("");
    log("  --- Yeni acilacak cocuklar (yalniz odeme sayfalarinda) ---");
    for (const [, y] of yeniCocuklar) log(`    ${y.ad}${y.veli ? " / " + y.veli : ""}  (${y.satirlar.map((d) => d.sayfa + " " + d.satir).join(", ")})`);
    rapor.push("", "  --- Dogum tarihi kararlari (GENEL LISTE) ---", ...dogumKararlari);
  }

  // ---- 15. Yazma
  if (YAZ) {
    const temizle = async (tablo: string) => {
      const { error } = await db.from(tablo).delete().eq("kaynak", "excel");
      if (error) throw new Error(`${tablo} temizlenemedi: ${error.message}`);
    };
    const parcaliYaz = async (tablo: string, satirlar: Record<string, unknown>[]) => {
      for (let i = 0; i < satirlar.length; i += 200) {
        const { error } = await db.from(tablo).insert(satirlar.slice(i, i + 200));
        if (error) throw new Error(`${tablo} yazilamadi: ${error.message}`);
      }
    };

    await temizle("paket_satislari");
    await parcaliYaz("paket_satislari", defterSatirlari);

    // Parti: telefonla veliye, oradan cocuga bagla.
    for (const p of partiler) {
      if (!p.telefon) continue;
      const veli = veliTelefonu.get(p.telefon);
      if (!veli) continue;
      const cocuklar = baglar.filter((b) => b.veli_id === veli.id).map((b) => b.ogrenci_id);
      if (cocuklar.length === 1) p.ogrenci_id = cocuklar[0];
      else if (cocuklar.length > 1) {
        const adi = parcalar(p.cocuk_adi)[0];
        const uygun = yazimlar.find((y) => cocuklar.includes(ogrenciIdleri.get(y.anahtar) ?? "") && parcalar(String(y.veri.excel_adi))[0] === adi);
        if (uygun) p.ogrenci_id = ogrenciIdleri.get(uygun.anahtar) ?? null;
      }
    }
    await temizle("dogum_gunu_partileri");
    await parcaliYaz("dogum_gunu_partileri", partiler);

    await temizle("giderler");
    await parcaliYaz("giderler", gecerliGiderler);

    await temizle("su_karti");
    await parcaliYaz("su_karti", suSatirlari);

    await temizle("devamsizlik_cizelgesi");
    await parcaliYaz(
      "devamsizlik_cizelgesi",
      cizelge.map(({ hedef, ...c }) => ({ ...c, ogrenci_id: hedef ? (ogrenciIdleri.get(hedef) ?? null) : null })),
    );

    for (const a of arsiv) {
      const { error } = await db.from("excel_sayfalari").upsert(a, { onConflict: "dosya,sayfa_adi" });
      if (error) throw new Error(`excel_sayfalari yazilamadi (${a.sayfa_adi}): ${error.message}`);
    }
    log("");
    log("  Yazma tamamlandi.");
  }

  if (uyarilar.length) {
    log("");
    log("  UYARILAR:");
    for (const u of uyarilar) log(`    ! ${u}`);
  }
  log("");

  const raporYolu = resolve("_gecici-excel-aktarim-raporu.md");
  writeFileSync(raporYolu, ["# Excel aktarım raporu", "", `Dosya: ${dosyaAdi}`, `Tarih: ${new Date().toISOString()}`, `Kip: ${YAZ ? "yaz" : "deneme"}`, "", "```", ...rapor, "```", ""].join("\n"), "utf8");
  console.log(`  Rapor: ${raporYolu}\n`);
}

main().catch((h) => {
  console.error("Hata:", h instanceof Error ? h.stack : h);
  process.exitCode = 1;
});
