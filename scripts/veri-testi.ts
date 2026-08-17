/**
 * Veri butunlugu ve yas mantigi testleri.
 * Calistirma: npm run test:veri
 *
 * Bagimlilik yok, node --experimental-strip-types ile dogrudan kosar.
 * Amac: lib/data icindeki referanslarin tutarli oldugunu ve yas
 * fonksiyonlarinin dogru davrandigini yayindan once garanti etmek.
 */

import { existsSync, readFileSync } from "node:fs";
import {
  SLOTLAR,
  slotBul,
  tekSeferlikSlotlar,
  saatiDakikaya,
} from "../src/lib/data/program";
import {
  EKIP,
  aileOgretmenleri,
  atolyeOgretmenleri,
} from "../src/lib/data/ekip";
import { AILELER } from "../src/lib/data/gruplar";
import {
  ATOLYELER,
  atolyeBul,
  aileninAtolyesi,
} from "../src/lib/data/atolyeler";
import {
  FOTOGRAFLAR,
  GOSTERILMEYEN,
  gosterilenFotolar,
} from "../src/lib/data/fotograflar";
import {
  PAKETLER,
  indirimVarMi,
  kampanyaAcikMi,
  kampanyaKalanGun,
  gecerliFiyat,
  erkenKayitGosterilirMi,
} from "../src/lib/data/ucretler";
import { SORULAR } from "../src/lib/data/sss";
import {
  ILETISIM,
  MARKA,
  SAATLER,
  SITE_URL,
  napAdi,
  googleKartBaglantisi,
} from "../src/lib/site";
import {
  aramaTemizle,
  telefonAramasi,
  aramaKalibi,
} from "../src/lib/kampus/arama";
import {
  ayHesapla,
  yasMetni,
  uygunAileler,
  uygunTekSeferlikSlotlar,
  dogumTarihiGecerliMi,
  YAS_SAYFALARI,
  yasBandiAileleri,
} from "../src/lib/yas";
import { YASAL_SAYFALAR } from "../src/lib/yasal";
import { KAYNAKLAR } from "../src/lib/schema";
import { acilisSaatleri } from "../src/lib/seo";

let gecen = 0;
const hatalar: string[] = [];

function dogru(kosul: boolean, ad: string) {
  if (kosul) gecen++;
  else hatalar.push(ad);
}

function esit<T>(a: T, b: T, ad: string) {
  if (Object.is(a, b)) gecen++;
  else hatalar.push(`${ad}  (beklenen ${String(b)}, gelen ${String(a)})`);
}

// ------------------------------------------------------------ veri butunlugu

dogru(SLOTLAR.length === 30, `slot sayisi 30 olmali, ${SLOTLAR.length} bulundu`);

const idler = new Set<string>();
for (const s of SLOTLAR) {
  dogru(!idler.has(s.id), `slot id tekrar ediyor: ${s.id}`);
  idler.add(s.id);
  dogru(Boolean(atolyeBul(s.atolyeSlug)), `tanimsiz atolye: ${s.atolyeSlug}`);
  dogru(
    /^\d{2}\.\d{2}$/.test(s.bas) && /^\d{2}\.\d{2}$/.test(s.bit),
    `saat formati bozuk: ${s.id}`,
  );
  dogru(s.yas.minAy < s.yas.maxAy, `yas araligi ters: ${s.id}`);
}

// Kombinasyonlardaki her slot id gercekten var mi.
for (const aile of AILELER) {
  for (const k of aile.sabitKombinasyonlar) {
    for (const id of k.slotIdler) {
      dogru(Boolean(slotBul(id)), `${aile.slug}: olmayan slot id "${id}"`);
    }
  }
  dogru(aile.paketler.length > 0, `${aile.slug}: paket yok`);
}

// Atolyelerin bagli oldugu aile gercekten var mi.
for (const a of ATOLYELER) {
  if (a.ailesi) {
    dogru(
      AILELER.some((x) => x.slug === a.ailesi),
      `${a.slug}: olmayan aile "${a.ailesi}"`,
    );
  }
}

// -------------------------------------------------------------------- fiyat

esit(PAKETLER["okula-hazirlik"].length, 3, "okula hazirlik paket sayisi");
dogru(
  !PAKETLER["okula-hazirlik"].some((p) => p.kod === "tek-sefer"),
  "okula hazirlikta tek sefer secenegi OLMAMALI",
);

// Tek sefer satirlarina indirim uygulanmaz (PLAN.md Bolum 6.3).
for (const [aile, paketler] of Object.entries(PAKETLER)) {
  const tek = paketler.find((p) => p.kod === "tek-sefer");
  if (tek) {
    dogru(!indirimVarMi(tek), `${aile}: tek sefer indirimli gorunuyor`);
  }
  for (const p of paketler.filter((x) => x.kod !== "tek-sefer")) {
    esit(
      p.erkenKayit,
      Math.round(p.normal * 0.8),
      `${aile}/${p.kod} erken kayit yuzde 20 olmali`,
    );
  }
}

// Excel'den birebir dogrulanmis rakamlar.
esit(PAKETLER["okula-hazirlik"][2].normal, 15000, "okula hazirlik ayda 12");
esit(PAKETLER["okula-hazirlik"][2].erkenKayit, 12000, "okula hazirlik ayda 12 indirimli");
esit(PAKETLER.ingilizce[0].normal, 2500, "ingilizce tek sefer");
esit(PAKETLER.bebek[1].erkenKayit, 5600, "bebek ayda 4 indirimli");

// ----------------------------------------------------- tek seferlik atolyeler

// PLAN.md Bolum 6.2 tablo C: 7 kalem, hepsi hafta ici veya Cumartesi,
// ama Cumartesi 14.00-16.00 ve 16.00-18.00 tek seferlik DEGIL (duzeltme).
const tekSefer = tekSeferlikSlotlar();
esit(tekSefer.length, 9, "tek seferlik slot sayisi");
dogru(
  !tekSefer.some((s) => s.id === "cmt-1400-gelisim"),
  "Cumartesi 14.00 tek seferlik olmamali, sabit grubun hafta sonu secenegi",
);
dogru(
  !tekSefer.some((s) => s.id === "cmt-1600-bebek"),
  "Cumartesi 16.00 tek seferlik olmamali, sabit grubun hafta sonu secenegi",
);

// Hafta sonu secenekleri kombinasyonlarda var mi (10 Agustos duzeltmesi).
const gelisim = AILELER.find((a) => a.slug === "gelisim-odakli-oyun")!;
dogru(
  gelisim.sabitKombinasyonlar.some(
    (k) => k.haftaSonu && k.slotIdler.includes("cmt-1400-gelisim"),
  ),
  "24-36 ay Cumartesi 14.00 hafta sonu secenegi eksik",
);
const bebek = AILELER.find((a) => a.slug === "bebek")!;
dogru(
  bebek.sabitKombinasyonlar.some(
    (k) => k.haftaSonu && k.slotIdler.includes("cmt-1600-bebek"),
  ),
  "6-12 ay Cumartesi 16.00 hafta sonu secenegi eksik",
);

// ------------------------------------------------------------- yas hesabi

const bugun = new Date("2026-08-10T12:00:00");
esit(ayHesapla("2025-01-10", bugun), 19, "19 aylik");
esit(ayHesapla("2025-01-11", bugun), 18, "gun gelmediyse ay sayilmaz");
esit(ayHesapla("2026-08-10", bugun), 0, "bugun dogan 0 aylik");
esit(ayHesapla("2023-08-10", bugun), 36, "3 yasinda 36 ay");

esit(yasMetni(19), "19 aylık", "yas metni ay");
esit(yasMetni(24), "2 yaşında", "yas metni tam yil");
esit(yasMetni(38), "3 yaş 2 aylık", "yas metni yil ve ay");

// ------------------------------------------------------------- uygunluk

// 19 aylik cocuk: gelisim odakli (16-36) + bebek (6-24) = 2 aile.
esit(uygunAileler(19).length, 2, "19 aylik icin aile sayisi");
// 8 aylik: yalniz bebek.
esit(uygunAileler(8).length, 1, "8 aylik icin aile sayisi");
esit(uygunAileler(8)[0].slug, "bebek", "8 aylik icin bebek grubu");
// 40 aylik (3 yas 4 ay): yalniz okula hazirlik.
esit(uygunAileler(40).length, 1, "40 aylik icin aile sayisi");
esit(uygunAileler(40)[0].slug, "okula-hazirlik", "40 aylik icin okula hazirlik");

// PLAN.md Bolum 6.6 sonuc 1: 3-5 yasa yalniz uc kapi acik.
const bes = YAS_SAYFALARI.find((y) => y.slug === "3-5-yas")!;
const besAileler = yasBandiAileleri(bes);
esit(besAileler.length, 1, "3-5 yas bandinda yalniz okula hazirlik ailesi");
dogru(
  !besAileler.some((a) => a.slug === "gelisim-odakli-oyun"),
  "3-5 yas sayfasinda gelisim odakli oyun grubu GOSTERILMEMELI",
);

// Diger uc yas sayfasi bandi da dogru aileleri getirmeli.
const bant = (s: string) => YAS_SAYFALARI.find((y) => y.slug === s)!;
esit(
  yasBandiAileleri(bant("6-12-ay"))
    .map((a) => a.slug)
    .join(","),
  "bebek",
  "6-12 ay bandi",
);
esit(
  yasBandiAileleri(bant("12-24-ay"))
    .map((a) => a.slug)
    .sort()
    .join(","),
  "bebek,gelisim-odakli-oyun",
  "12-24 ay bandi",
);
esit(
  yasBandiAileleri(bant("24-36-ay"))
    .map((a) => a.slug)
    .sort()
    .join(","),
  "gelisim-odakli-oyun,ingilizce,okula-hazirlik",
  "24-36 ay bandi",
);
// Bebek grubu 24 ayda bitiyor, 24-36 sayfasinda gorunmemeli.
dogru(
  !yasBandiAileleri(bant("24-36-ay")).some((a) => a.slug === "bebek"),
  "24-36 ay sayfasinda bebek grubu GORUNMEMELI",
);

// 40 aylik cocuk icin tek seferlik: matematik (Sali, Cmt) + minik beyinler.
const besTek = uygunTekSeferlikSlotlar(40);
esit(besTek.length, 3, "3 yas ustu tek seferlik slot sayisi");
dogru(
  besTek.every((s) =>
    ["oyunlarla-matematik-atolyesi", "minik-beyinler-laboratuvari"].includes(
      s.atolyeSlug,
    ),
  ),
  "3 yas ustu tek seferlikler yalniz matematik ve minik beyinler olmali",
);

// ----------------------------------------------------------- dogrulama

dogru(!dogumTarihiGecerliMi("2027-01-01", bugun).gecerli, "gelecek tarih reddedilmeli");
dogru(!dogumTarihiGecerliMi("2015-01-01", bugun).gecerli, "8 yildan eski reddedilmeli");
dogru(dogumTarihiGecerliMi("2025-01-10", bugun).gecerli, "gecerli tarih kabul edilmeli");
dogru(!dogumTarihiGecerliMi("abc", bugun).gecerli, "bozuk tarih reddedilmeli");

// --------------------------------------------------- icerik kurallari

// PLAN.md Bolum 3 madde 1: gorunen metinde uzun tire yok.
const tumMetin = [
  ...SORULAR.flatMap((s) => [s.soru, s.cevap]),
  ...AILELER.flatMap((a) => [a.ad, a.ozet, ...a.ozellikler, ...a.notlar]),
  ...ATOLYELER.flatMap((a) => [a.ad, ...a.olgular]),
  // Ogretmen metinleri de ev uslubuna tabi. Metinler onlarin kaleminden
  // ama uzun tire ve emoji yayin kurali (PLAN.md Bolum 3).
  ...EKIP.flatMap((o) => [
    o.ozet ?? "",
    ...(o.ozgecmis ?? []),
    ...(o.yaklasimlar ?? []),
  ]),
].join(" ");
dogru(!tumMetin.includes("—"), "veri metninde uzun tire (—) var");
// PLAN.md Bolum 3 madde 2: emoji yok.
dogru(
  !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(tumMetin),
  "veri metninde emoji var",
);

// ------------------------------------------------------------------- ekip

/*
  Ekip sayfasi E-E-A-T icin en degerli sayfa. Eksik alanla yayina cikmasin:
  ad/soyad/unvan/egitim/fotograf ve ozgecmis dolu olmali. Ayrica `ad` alani
  Excel'deki adla birebir ayni olmali, yoksa haftalik programdaki
  `slot.ogretmenler[]` eslesmesi sessizce kopar ve ogretmen hicbir seans
  yurutmuyor gibi gorunur.
*/
const slotOgretmenleri = new Set(SLOTLAR.flatMap((s) => s.ogretmenler));

for (const o of EKIP) {
  dogru(Boolean(o.soyad), `${o.ad}: soyad eksik`);
  dogru(Boolean(o.unvan), `${o.ad}: unvan eksik`);
  dogru(Boolean(o.egitim), `${o.ad}: egitim eksik`);
  dogru(Boolean(o.fotograf), `${o.ad}: fotograf eksik`);
  dogru(
    Boolean(o.ozgecmis && o.ozgecmis.length > 0),
    `${o.ad}: ozgecmis eksik`,
  );
  dogru(
    Boolean(o.yaklasimlar && o.yaklasimlar.length > 0),
    `${o.ad}: yaklasimlar eksik`,
  );
  dogru(
    slotOgretmenleri.has(o.ad),
    `${o.ad}: bu adla hic slot yok, program eslesmesi kopmus`,
  );
  dogru(
    existsSync(`public/ekip/${o.fotograf}.jpg`),
    `${o.ad}: public/ekip/${o.fotograf}.jpg yok, "npm run foto" calistirilmali`,
  );
}

// Ters yon: programda gecen her ogretmenin ekipte karsiligi olmali.
for (const ad of slotOgretmenleri) {
  dogru(
    EKIP.some((o) => o.ad === ad),
    `programda gecen "${ad}" ekip listesinde yok`,
  );
}

// ------------------------------------------------------- kampanya penceresi

/*
  Kampanya takvimi parayla ilgili: pencere kapandiginda site indirimli fiyati
  gostermeyi BIRAKMALI. Sinirlar Turkiye saatiyle (UTC+3) sinaniyor, cunku
  sunucu UTC'de kosuyor ve gun donumu uc saat kayik olsaydi kampanya yanlis
  gunde acilip kapanirdi.
*/
const an = (iso: string) => new Date(iso);

dogru(
  !kampanyaAcikMi(an("2026-08-09T23:59:00+03:00")),
  "kampanya baslangictan once acik gorunuyor",
);
dogru(
  kampanyaAcikMi(an("2026-08-10T00:00:00+03:00")),
  "kampanya baslangic gunu kapali gorunuyor",
);
dogru(
  kampanyaAcikMi(an("2026-09-01T23:59:00+03:00")),
  "son gun (1 Eylul) dahil olmali",
);
dogru(
  !kampanyaAcikMi(an("2026-09-02T00:00:00+03:00")),
  "kampanya 2 Eylul 00:00'da kapanmali",
);
// Yayindaki asil risk: tarih gecince fiyatin indirimli kalmasi.
dogru(
  !kampanyaAcikMi(an("2027-01-01T12:00:00+03:00")),
  "kampanya ertesi yil hala acik gorunuyor",
);

/*
  Kalan gun sayisi WhatsApp balonunda "N gün kaldı" olarak yaziliyor. Son gun
  DAHIL: 1 Eylul gunu 1 donmeli, 2 Eylul'de kampanya kapali ve 0.
*/
esit(
  kampanyaKalanGun(an("2026-09-01T09:00:00+03:00")),
  1,
  "son gun 1 donmeli",
);
esit(
  kampanyaKalanGun(an("2026-08-31T23:00:00+03:00")),
  2,
  "son gunden bir onceki gun 2 donmeli",
);
esit(
  kampanyaKalanGun(an("2026-08-17T12:00:00+03:00")),
  16,
  "17 Agustos'ta 16 gun kalmali",
);
esit(
  kampanyaKalanGun(an("2026-09-02T00:00:00+03:00")),
  0,
  "kampanya kapaliyken 0 donmeli",
);
esit(
  kampanyaKalanGun(an("2026-08-09T23:59:00+03:00")),
  0,
  "kampanya baslamadan 0 donmeli",
);

for (const paketler of Object.values(PAKETLER)) {
  for (const p of paketler) {
    dogru(
      gecerliFiyat(p, false) === p.normal,
      `kampanya kapaliyken ${p.kod} normal fiyat donmeli`,
    );
    dogru(
      gecerliFiyat(p, true) === (indirimVarMi(p) ? p.erkenKayit : p.normal),
      `kampanya acikken ${p.kod} yanlis fiyat donuyor`,
    );
    dogru(
      !erkenKayitGosterilirMi(p, false),
      `kampanya kapaliyken ${p.kod} icin indirim rozeti gosteriliyor`,
    );
  }
}

/*
  Kurum icindeki gorev. Kurum semasindaki `employee` alani EKIP icinde gorevi
  dolu OLAN ILK kisiyi aliyor; birden fazla olursa sema sessizce yalniz
  birini gosterir ve digeri hicbir yerde gorunmez.
*/
const gorevliler = EKIP.filter((o) => o.gorev);
dogru(
  gorevliler.length <= 1,
  `birden fazla kurum gorevi tanimli: ${gorevliler.map((o) => o.ad).join(", ")}`,
);
for (const o of gorevliler) {
  dogru(Boolean(o.unvan), `${o.ad}: gorevi var ama mesleki unvani yok`);
  dogru(Boolean(o.soyad), `${o.ad}: gorevi var ama soyadi yok`);
}

// ------------------------------------------------- program -> ogretmen bagi

/*
  Kartlardaki ogretmen rozetleri ve program sayfasindaki "kim veriyor"
  bolumu bu iki fonksiyondan besleniyor. Bos donerlerse ekranda hata cikmaz,
  bolum sessizce KAYBOLUR -- gozle fark edilmeyen tam olarak bu.
*/
for (const aile of AILELER) {
  const kadro = aileOgretmenleri(aile.slug);
  dogru(kadro.length > 0, `${aile.slug}: program ailesinin ogretmeni yok`);
  for (const o of kadro) {
    dogru(
      Boolean(o.fotograf),
      `${aile.slug}: ${o.ad} rozette gosterilecek ama fotografi yok`,
    );
  }
}

/*
  Seansi olup ogretmeni olmayan TEK atolye serbest oyun olmali. Serbest oyun
  atanmis ogretmeni olmayan bir zaman dilimi (her grup gununun ilk saati),
  Excel'de de ogretmen yazmiyor. Baska bir programin ogretmensiz kalmasi ise
  hata: sayfasindaki "kim veriyor" bolumu sessizce kaybolur.

  Guvenli Ayrilma Programi bu listede yok cunku kendi seansi hic yok; Okula
  Hazirlik Gruplarinin icinde yuruyor ve sayfasi ailenin kadrosunu gosteriyor.
*/
const ogretmensiz = ATOLYELER.filter(
  (a) =>
    SLOTLAR.some((s) => s.atolyeSlug === a.slug) &&
    atolyeOgretmenleri(a.slug).length === 0,
).map((a) => a.slug);

esit(
  ogretmensiz.join(", "),
  "serbest-oyun",
  "ogretmensiz seansi olan atolyeler beklenenden farkli",
);

// Ailenin kadrosu, o aileye bagli atolyelerin kadrosunu kapsamali.
for (const aile of AILELER) {
  const aileKadro = new Set(aileOgretmenleri(aile.slug).map((o) => o.ad));
  for (const atolye of ATOLYELER.filter((a) => a.ailesi === aile.slug)) {
    for (const o of atolyeOgretmenleri(atolye.slug)) {
      dogru(
        aileKadro.has(o.ad),
        `${aile.slug} kadrosunda ${o.ad} yok ama ${atolye.slug} atolyesinde var`,
      );
    }
  }
}

// -------------------------------------------------- arama temizligi (guvenlik)

/*
  Panel aramasi PostgREST suzgec SOZDIZIMI uretiyor; virgul, nokta ve
  parantez orada yapisal karakterler. Girdi dogrudan birlestirildiginde
  kullanici OR agacina kendi kosulunu ekleyebiliyordu (denendi, filtre
  kirildi). Beyaz liste temizligi bu yuzden var ve burada sinaniyor:
  bir daha gevsetilirse test duser.
*/
const enjeksiyonDenemeleri = [
  "x,durum.eq.yeni",
  "x,id.not.is.null",
  "x),or(id.not.is.null",
  "%",
  "_",
  'a"b\\c',
  "a.b.c",
];

for (const d of enjeksiyonDenemeleri) {
  const temiz = aramaTemizle(d);
  dogru(
    !/[,.()"\\%_]/.test(temiz),
    `arama temizligi yapisal karakter birakti: "${d}" -> "${temiz}"`,
  );
}

// Mesru girdi bozulmamali; Turkce harfler korunmali.
esit(aramaTemizle("Ayşe Yılmaz"), "Ayşe Yılmaz", "Turkce harfler korunmuyor");
esit(aramaTemizle("  Ali   Can  "), "Ali Can", "fazla bosluk kirpilmiyor");
esit(aramaTemizle("O'Brien-Kaya"), "O'Brien-Kaya", "kesme ve cizgi korunmuyor");
esit(aramaTemizle(""), "", "bos girdi bos donmeli");
esit(aramaTemizle(undefined), "", "tanimsiz girdi bos donmeli");

// Telefon: bicim ne olursa olsun 5XXXXXXXXX'e inmeli.
for (const [girdi, beklenen] of [
  ["0532 111 22 33", "5321112233"],
  ["+90 532 111 22 33", "5321112233"],
  ["905321112233", "5321112233"],
  ["5321112233", "5321112233"],
] as const) {
  esit(telefonAramasi(girdi), beklenen, `telefon normalizesi: ${girdi}`);
}

/*
  Kalip uretimi: temizlik sonrasi hicbir sey kalmadiysa kalip da
  uretilmemeli. Aksi halde `ad.ilike.%%` gibi butun kayitlari donduren
  bir suzgec olusur.
*/
esit(
  aramaKalibi("%%%", ["ad"], "telefon"),
  null,
  "tumu temizlenen girdi kalip uretmemeli",
);
dogru(
  (aramaKalibi("Ayşe", ["ad", "soyad"]) ?? "").split(",").length === 2,
  "iki alan icin iki kalip parcasi uretilmeli",
);
dogru(
  !(aramaKalibi("12", ["ad"], "telefon") ?? "").includes("telefon"),
  "uc rakamdan kisa arama telefon kalibi uretmemeli",
);

// ------------------------------------------------------------------ NAP

/*
  NAP (isim, adres, telefon) yerel SEO'nun temeli: footer, /iletisim, KVKK
  metni ve schema.org hepsi ayni adresi basmali. Asil risk, sokak satirinin
  degisip tek satirlik gosterim halinin eski kalmasi -- bu yuzden `adres`
  parcalardan uretiliyor ve burada gercekten oyle uretildigi sinaniyor.
*/
const { adres, adresSokak, postaKodu } = ILETISIM;

/*
  Yayin adresi: sonunda bolu isareti OLMAMALI. Olsaydi butun kanonik URL'ler
  ve sitemap girdileri cift bolu tasirdi ("https://alanadi.com//iletisim").
  Adres ortam degiskeninden geliyor, yani bu hata yalniz yayinda ortaya cikar.
*/
dogru(!SITE_URL.endsWith("/"), `SITE_URL sonunda bolu var: ${SITE_URL}`);
dogru(
  /^https?:\/\/[^/]+$/.test(SITE_URL),
  `SITE_URL "protokol://alanadi" bicminde olmali: ${SITE_URL}`,
);

/*
  WhatsApp numarasi wa.me bicimini tutmali: 905XXXXXXXXX, basinda arti yok,
  bosluk yok. Yanlis yazilirsa baglanti sessizce bos bir sohbet aciyor --
  sag alttaki yuzen buton da, footer'daki de bu numaradan uretiliyor.
*/
if (ILETISIM.whatsapp) {
  dogru(
    /^905\d{9}$/.test(ILETISIM.whatsapp),
    `WhatsApp numarasi 905XXXXXXXXX olmali: ${ILETISIM.whatsapp}`,
  );
}

/*
  WhatsApp ve telefon AYNI HAT: musteri 17 Agustos 2026'da teyit etti
  (Bolum 14, madde 9). Iki alan ayri durdugu icin biri degisip oteki eski
  halde kalabilir; ekranda hicbir sey bozulmaz, yalniz yanlis numaraya
  yazilir. Ayri bir WhatsApp hatti alinirsa bu test de birlikte guncellenir.
*/
if (ILETISIM.whatsapp && ILETISIM.telefon) {
  const telefonHanesi = `90${ILETISIM.telefon.replace(/\D/g, "").replace(/^0/, "")}`;
  dogru(
    ILETISIM.whatsapp === telefonHanesi,
    `WhatsApp telefonla ayni hat olmali: ${ILETISIM.whatsapp} ≠ ${telefonHanesi}`,
  );
}

/*
  Isim tarafi: musteri karari (c). Footer NAP'i ve schema `name` alani Google
  kaydindaki adi tasimali, tuzel ad da parantez icinde gorunmeli. Ikisinden
  biri dusudugunde yerel SEO sessizce bolunur, ekranda hicbir sey bozulmaz --
  bu yuzden test var.
*/
const nap = napAdi();
dogru(
  nap.includes(ILETISIM.googleAdi ?? ""),
  `NAP adi Google kaydindaki adi tasimiyor: ${nap}`,
);
dogru(
  nap.includes(MARKA.tuzelAdOyunEvi),
  `NAP adi tuzel adi tasimiyor: ${nap}`,
);

// Google kart baglantisi: CID'in ikinci parcasi ondaliga cevrilebilmeli.
const kart = googleKartBaglantisi();
dogru(Boolean(kart), "Google kart baglantisi uretilemedi");
dogru(
  /^https:\/\/www\.google\.com\/maps\?cid=\d+$/.test(kart ?? ""),
  `Google kart baglantisi bozuk: ${kart}`,
);

dogru(Boolean(adresSokak), "adres sokak satiri bos");
dogru(Boolean(adres), "tek satirlik adres bos");
dogru(
  /^\d{5}$/.test(postaKodu ?? ""),
  `posta kodu bes haneli olmali: ${postaKodu}`,
);
dogru(
  (postaKodu ?? "").startsWith("06"),
  `Ankara posta kodu 06 ile baslar: ${postaKodu}`,
);

if (adres && adresSokak && postaKodu) {
  dogru(adres.includes(adresSokak), "gosterim adresi sokak satirini icermiyor");
  dogru(adres.includes(postaKodu), "gosterim adresi posta kodunu icermiyor");
  dogru(adres.includes(MARKA.ilce), "gosterim adresinde ilce yok");
  dogru(adres.includes(MARKA.sehir), "gosterim adresinde il yok");

  // Sokak satiri schema.org streetAddress'e giriyor; ilce/il/posta kodu
  // orada kendi alanlarinda duruyor, burada tekrar etmemeli.
  for (const parca of [MARKA.ilce, MARKA.sehir, postaKodu]) {
    dogru(
      !adresSokak.includes(parca),
      `sokak satirinda tekrar eden alan: "${parca}"`,
    );
  }
}

// -------------------------------------------------- calisma saatleri

/*
  Saat bicimi "SS.DD" olmali ve acilis kapanistan once gelmeli. Bicim
  bozulursa schema.org acilis saatleri sessizce gecersiz olur: Google
  yerel kartta saati hic gostermez, sayfada hicbir sey bozulmaz.
*/
for (const [gun, aralik] of Object.entries(SAATLER)) {
  if (!aralik) continue;
  for (const [ad, deger] of [
    ["acilis", aralik.acilis],
    ["kapanis", aralik.kapanis],
  ] as const) {
    dogru(
      /^([01]\d|2[0-3])\.[0-5]\d$/.test(deger),
      `${gun} ${ad} saati "SS.DD" olmali: ${deger}`,
    );
  }
  dogru(
    saatiDakikaya(aralik.acilis) < saatiDakikaya(aralik.kapanis),
    `${gun}: acilis kapanistan sonra (${aralik.acilis} - ${aralik.kapanis})`,
  );
}

/*
  schema.org acilis saatleri SAATLER'den uretilmeli, programdan degil.
  Kapali gun schema'ya girmemeli.
*/
const semaSaatleri = acilisSaatleri();
const acikGunSayisi = Object.values(SAATLER).filter(Boolean).length;
dogru(
  semaSaatleri.length === acikGunSayisi,
  `schema acilis saati sayisi acik gun sayisiyla ayni olmali: ${semaSaatleri.length} ≠ ${acikGunSayisi}`,
);
dogru(
  semaSaatleri.some(
    (s) => s.dayOfWeek === "https://schema.org/Monday" && s.opens === "09:00",
  ),
  "schema pazartesi acilisi 09:00 olmali",
);
dogru(
  !semaSaatleri.some((s) => s.dayOfWeek === "https://schema.org/Sunday"),
  "pazar kapali, schema'da gorunmemeli",
);

/*
  Program seanslari calisma saatlerinin ICINDE olmali. Disina tasan bir
  seans, veliye "kapaliyken ders var" diyen bir celiski demek.

  ISTISNA YOK. Bir sure "cumartesi 18.00-19.00 serbest oyun" seansi
  kapanisin (18.00) disinda kaliyordu; musteri 17 Agustos 2026'da teyit
  etti, cumartesi 19.00'a kadar acik. Liste bos kaldi ve boyle kalmali:
  yeni bir seans kapanisin disina tasarsa test dursun.
*/
const SAAT_ISTISNALARI = new Set<string>();
for (const slot of SLOTLAR) {
  if (SAAT_ISTISNALARI.has(slot.id)) continue;
  const aralik = SAATLER[slot.gun];
  dogru(
    Boolean(aralik),
    `${slot.id}: ${slot.gun} kapali ama programda seans var`,
  );
  if (!aralik) continue;
  dogru(
    saatiDakikaya(slot.bas) >= saatiDakikaya(aralik.acilis),
    `${slot.id} acilistan once basliyor: ${slot.bas} < ${aralik.acilis}`,
  );
  dogru(
    saatiDakikaya(slot.bit) <= saatiDakikaya(aralik.kapanis),
    `${slot.id} kapanistan sonra bitiyor: ${slot.bit} > ${aralik.kapanis}`,
  );
}

// Istisna listesi bosalinca kaldirilsin diye: listedeki id gercekten var mi.
for (const id of SAAT_ISTISNALARI) {
  dogru(
    SLOTLAR.some((s) => s.id === id),
    `saat istisnasi artik var olmayan bir slot: ${id}`,
  );
}

// ------------------------------------------------- /bilgi (otomasyon sayfasi)

/*
  Otomasyonun gonderdigi tek sayfa. Ucretler, gruplar ve sorular ORADA
  YENIDEN YAZILMAMALI; sabitlerden okunmali. Test bunu dosya icerigine
  bakarak kontrol ediyor: sayfada elle yazilmis bir TL rakami veya saat
  varsa, bir gun fiyat degistiginde o rakam geride kalir.
*/
const sitemapMetni = readFileSync("src/app/sitemap.ts", "utf8");
const bilgiSayfasi = readFileSync("src/app/bilgi/page.tsx", "utf8");

dogru(
  bilgiSayfasi.includes("AILELER") &&
    bilgiSayfasi.includes("KAMPANYA_KOSULLARI") &&
    bilgiSayfasi.includes("SORULAR"),
  "/bilgi icerigi sabitlerden okumali (AILELER, KAMPANYA_KOSULLARI, SORULAR)",
);
dogru(
  bilgiSayfasi.includes("kampanyaAcikMi"),
  "/bilgi kampanya durumunu kontrol etmeli: kapaninca indirim yazisi dusmeli",
);
dogru(
  bilgiSayfasi.includes("indeks: false"),
  "/bilgi aramaya kapali olmali, /oyun-evi/ucretler ile yarismasin",
);
dogru(
  !sitemapMetni.includes('"/bilgi"'),
  "/bilgi sitemap'te olmamali",
);

/*
  Elle yazilmis fiyat aramasi: dort haneli bir sayinin yaninda "TL" veya
  bin ayraci. Fiyatlar PAKETLER'den gelmeli.
*/
dogru(
  !/\b\d\.\d{3}\s*TL/.test(bilgiSayfasi) && !/\b\d{4,}\s*TL/.test(bilgiSayfasi),
  "/bilgi sayfasinda elle yazilmis fiyat var, PAKETLER'den okunmali",
);

/*
  Geri sayim yasagi (PLAN.md Bolum 3 madde 4, musteri onayi 17 Agustos 2026).
  Ne /bilgi sayfasinda ne WhatsApp balonunda "gun kaldi" yazmamali; yalniz
  son gun tarihi yazilir.
*/
for (const dosya of [
  "src/app/bilgi/page.tsx",
  "src/components/site/whatsapp-butonu.tsx",
]) {
  const metin = readFileSync(dosya, "utf8");
  dogru(
    !/gün kaldı/.test(metin),
    `geri sayim yasak, "gün kaldı" gecmemeli: ${dosya}`,
  );
}

/*
  Kayit baglantisi kaynak etiketi tasimali: otomasyondan gelen talebin
  panelde sayilabilmesi buna bagli. Etiket KAYNAKLAR icinde olmali,
  yoksa form onu sessizce yok sayar.
*/
const kaynakEslesme = bilgiSayfasi.match(/const KAYNAK = "([^"]+)"/);
dogru(Boolean(kaynakEslesme), "/bilgi sayfasinda KAYNAK etiketi tanimli olmali");
if (kaynakEslesme) {
  dogru(
    (KAYNAKLAR as readonly string[]).includes(kaynakEslesme[1]),
    `/bilgi KAYNAK etiketi KAYNAKLAR icinde olmali: ${kaynakEslesme[1]}`,
  );
}

// ------------------------------------------- aile -> program sayfasi baglantisi

/*
  IKI AYRI SLUG VAR ve karistirilmasi 404 uretiyor:
    aile slug'i   -> "okula-hazirlik"
    atolye slug'i -> "okula-hazirlik-grubu"
  /oyun-evi/programlar/[slug] rotasi ATOLYE slug'lariyla uretiliyor.
  /bilgi sayfasi aile slug'ini yazdigi icin "Programin ayrintisi"
  baglantilari 404 donuyordu (musteri bildirdi, 17 Agustos 2026).

  Test her ailenin bir program sayfasi karsiligi oldugunu ve o slug'in
  gercekten var oldugunu dogruluyor.
*/
for (const aile of AILELER) {
  const atolye = aileninAtolyesi(aile.slug);
  dogru(
    Boolean(atolye),
    `${aile.slug}: program sayfasi karsiligi yok (aileninAtolyesi bos dondu)`,
  );
  if (atolye) {
    dogru(
      Boolean(atolyeBul(atolye.slug)),
      `${aile.slug} -> ${atolye.slug}: atolye bulunamadi`,
    );
    /*
      "Aile slug'i ile atolye slug'i ayni olmasin" diye bir kontrol
      YAZILMADI: TypeScript iki turun (AtolyeSlug, ProgramAilesiSlug)
      kesismedigini zaten biliyor ve boyle bir karsilastirma derleme
      hatasi veriyor. Tur sistemi garanti ediyorsa test gereksizdir.
    */
  }
}

// Bilerek gosterilmeyen kare hicbir yuzeyde gorunmemeli.
for (const slug of Object.keys(GOSTERILMEYEN)) {
  dogru(
    !gosterilenFotolar().some((f) => f.slug === slug),
    `gosterilmeyen kare listede: ${slug}`,
  );
  dogru(
    FOTOGRAFLAR.some((f) => f.slug === slug),
    `gosterilmeyen kare artik var olmayan bir slug: ${slug}`,
  );
}

// ------------------------------------------------- yas etiketleri (ay yok)

/*
  MUSTERI KARARI, 17 Agustos 2026: "Ay ve yas araligi vermeyelim."
  Netlesen hali: AY ifadeleri kalkti, YAS ifadeleri kaldi. Veli "16-36 ay"
  degil "1,5 - 3 yas" okuyor.

  Ay hesabi ARKADA duruyor (minAy/maxAy, ayHesapla, form eslestirmesi);
  yasak yalniz GORUNEN etiketler icin. Etiketler elle yazildigi icin yeni
  bir grup eklenirken kolayca "24-36 ay" yazilabilir; test onu yakaliyor.
*/
const AY_ARALIGI = /\d+\s*(-|–)\s*\d+\s*ay\b|\d+\+\s*ay\b/;

for (const a of AILELER) {
  dogru(
    !AY_ARALIGI.test(a.yasEtiket),
    `${a.slug}: yas etiketinde ay araligi var: "${a.yasEtiket}"`,
  );
  for (const k of a.sabitKombinasyonlar) {
    dogru(
      !AY_ARALIGI.test(k.etiket),
      `${a.slug}: kombinasyon etiketinde ay araligi var: "${k.etiket}"`,
    );
  }
}
for (const a of ATOLYELER) {
  dogru(
    !AY_ARALIGI.test(a.yasEtiket),
    `${a.slug}: yas etiketinde ay araligi var: "${a.yasEtiket}"`,
  );
}
for (const y of YAS_SAYFALARI) {
  dogru(
    !AY_ARALIGI.test(y.ad),
    `${y.slug}: yas sayfasi adinda ay araligi var: "${y.ad}"`,
  );
  /*
    SLUG'LAR ay temelli kaliyor ("12-24-ay"): adres degisirse eski
    baglantilar kirilir ve arama sirasi sifirlanir. Gorunen ad yas,
    adres ay -- bu bilincli.
  */
  dogru(
    /^[0-9a-z-]+$/.test(y.slug),
    `${y.slug}: yas sayfasi slug'i degismemeli`,
  );
}

// --------------------------------------------- program tiklama sayaci

/*
  "Detayli bilgi al" WhatsApp'a, arada sayac rotasindan gidiyor.
  Dogrudan wa.me baglantisi olsaydi tiklama sayilamazdi.
*/
const ucretKarti = readFileSync("src/components/site/ucret-tablosu.tsx", "utf8");
dogru(
  ucretKarti.includes("/git/whatsapp?grup="),
  "ucret kartindaki cagri sayac rotasindan gecmeli",
);
dogru(
  !/href={`https:\/\/wa\.me/.test(ucretKarti),
  "ucret kartinda dogrudan wa.me baglantisi olmamali, tiklama sayilamaz",
);

const sayacRotasi = readFileSync("src/app/git/whatsapp/route.ts", "utf8");

/*
  Grup slug'i AILELER ile dogrulanmali. Beyaz liste olmadan adres
  cubugundan gelen her metin veritabanina yazilirdi.
*/
dogru(
  sayacRotasi.includes("AILELER.find"),
  "sayac rotasi grup slug'ini AILELER ile dogrulamali",
);

/*
  KISI TANIMLAYAN VERI YAZILMAMALI. Gizlilik ve cerez politikasi bunu
  yaziyor; kod bir gun IP veya tarayici bilgisi eklerse o metinler
  sessizce yanlisa duser.
*/
for (const yasak of ["user-agent", "userAgent", "ipHash,", "ip:"]) {
  dogru(
    !sayacRotasi.includes(`${yasak}`),
    `sayac rotasi kisi tanimlayan veri yazmamali: ${yasak}`,
  );
}
dogru(
  /insert\(\{ hedef: "whatsapp", grup: aile\.slug, nereden \}\)/.test(
    sayacRotasi,
  ),
  "sayac yalniz hedef, grup ve nereden alanlarini yazmali",
);

/*
  WhatsApp mesajinda YUZDE ISARETI olmamali. "%20" URL'de once %25 olarak
  kodlaniyor, "%2520" cikiyor ve bazi istemciler bunu bir kez daha cozup
  yerine bosluk koyuyor -- mesajda "20" kayboluyor. Harflerle yazilmali.
*/
const mesajSatirlari = sayacRotasi
  .split("\n")
  .filter((s) => s.includes("Merhaba,"));
dogru(mesajSatirlari.length > 0, "sayac rotasinda hazir mesaj bulunamadi");
for (const satir of mesajSatirlari) {
  dogru(
    !/%\$\{/.test(satir) && !/%\d/.test(satir),
    `WhatsApp mesajinda yuzde isareti var, "yuzde N" yazilmali: ${satir.trim().slice(0, 60)}`,
  );
}

/*
  Sayac yazilamasa bile yonlendirme yapilmali: veli bir veritabani hatasi
  yuzunden bekletilemez.
*/
dogru(
  sayacRotasi.includes("try {") && sayacRotasi.includes("} catch {"),
  "sayac hatasi yonlendirmeyi engellememeli (try/catch)",
);

/*
  Cerez politikasi sayaci ACIKCA yazmali. Kod olcum yapip metin
  "olcmuyoruz" derse, o metin dogru olmaz.
*/
const cerezMetni = readFileSync("src/app/cerez/page.tsx", "utf8");
dogru(
  cerezMetni.includes("Program sayacı"),
  "cerez politikasi program sayacini yazmali",
);
dogru(
  !cerezMetni.includes("Biz o tıklamayı ölçmüyoruz"),
  "cerez politikasindaki 'tiklamayi olcmuyoruz' cumlesi artik dogru degil",
);

// Migration dosyasi duruyor mu ve anon insert izni VERMEMELI.
const tiklamaSql = readFileSync(
  "supabase/migrations/0005_tiklamalar.sql",
  "utf8",
);
dogru(
  tiklamaSql.includes("enable row level security"),
  "tiklamalar tablosunda RLS acik olmali",
);
dogru(
  !/for insert/i.test(tiklamaSql),
  "tiklamalar icin insert politikasi OLMAMALI: sayac konsoldan sisirilebilir",
);

// ------------------------------------------------------- yasal metinler

/*
  Yasal metinlerin dosyasi gercekten var mi. Footer bu listeden baglanti
  basiyor; bir yol yanlis yazilirsa 404 veren bir yasal metin baglantisi
  cikar ve bunu kimse fark etmez.
*/
for (const sayfa of YASAL_SAYFALAR) {
  dogru(
    existsSync(`src/app${sayfa.yol}/page.tsx`),
    `yasal sayfa dosyasi yok: src/app${sayfa.yol}/page.tsx`,
  );
  dogru(sayfa.ad.length > 0 && sayfa.ozet.length > 0, `yasal sayfa eksik: ${sayfa.yol}`);
}

dogru(
  YASAL_SAYFALAR.some((s) => s.yol === "/kvkk"),
  "KVKK aydinlatma metni yasal sayfa listesinde olmali",
);

/*
  Yasal sayfalar sitemap'e GIRMEMELI: hepsi indeks disi. Biri sitemap'e
  girerse Google'a "indeksle" derken sayfa "indeksleme" diyor olur.
*/
for (const sayfa of YASAL_SAYFALAR) {
  dogru(
    !sitemapMetni.includes(`"${sayfa.yol}"`),
    `yasal sayfa sitemap'te: ${sayfa.yol}`,
  );
}

// ------------------------------------------------------------------ sonuc

if (hatalar.length) {
  console.error(`\n${hatalar.length} test BASARISIZ:\n`);
  for (const h of hatalar) console.error("  x " + h);
  console.error(`\n${gecen} gecti, ${hatalar.length} kaldi.\n`);
  process.exit(1);
}
console.log(`\nTum testler gecti: ${gecen} kontrol.\n`);
