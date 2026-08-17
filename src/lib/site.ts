/**
 * Kurumsal sabitler ve marka adlari.
 *
 * PLAN.md Bolum 2 (Marka mimarisi): Bambola ticari marka, Kibar tuzel kimlik.
 * Ticari ad H1'lerde ve site metninde, tuzel ad footer NAP'inda, KVKK metninde
 * ve schema legalName alaninda gecer.
 *
 * TEYIT BEKLEYENLER (PLAN.md Bolum 14, madde 9 ve 13):
 * Adres, telefon, WhatsApp ve Instagram GELDI. Eksik kalanlar: e-posta,
 * calisma saatleri ve vergi bilgileri (KVKK metni icin).
 * Eksikler null birakiliyor. null olan bir iletisim kanali icin site hicbir
 * yerde cagri yapmaz (Bolum 3, madde 5: "kap olmadan cagri yapilmaz").
 */

export const MARKA = {
  /** Ticari marka. Basliklarda, metinde, domainde bu gecer. */
  ad: "Bambola",
  /**
   * Yesil logonun halkasindaki Ingilizce alt baslik.
   *
   * DIKKAT: Musteri 10 Agustos 2026'da bu ifadenin kullanilmamasini istedi.
   * Fiyat listesi ve musteriye giden belgelerde YAZILMAZ; yerine amblem ve
   * resmi ad kullanilir. Logonun kendi icinde gectigi icin burada duruyor,
   * baslik olarak basilmaz.
   */
  altBaslik: "Kids Zone & Party House",
  /**
   * Resmi ad. 10 Agustos 2026'da musteri kesinlestirdi: "Oyun Merkezi".
   * Mor logonun halkasindaki yazi da bunu dogruluyor.
   */
  tuzelAdOyunEvi: "Kibar Çocuk Etkinlik ve Oyun Merkezi",
  /** Tuzel kimlik, anaokulu. */
  tuzelAdAnaokulu: "Kibar Çocuklar Anaokulu",
  ilce: "Çankaya",
  sehir: "Ankara",
} as const;

/*
  Adres, Google Business Profile kaydindaki yazimla BIREBIR ayni bilesenlerden
  kuruluyor (PLAN.md Bolum 14 madde 9: NAP tutarliligi). Google kayitta buyuk
  harf kullaniyor -- "OSMANTEMIZ MAH. 1022. CAD, Dikmen Cd NO:2/A, 06450
  Çankaya/Ankara" -- site cumle duzeninde yaziyor; bilesenler (mahalle, cadde,
  kapi no, posta kodu, ilce, il) degismiyor, yalniz harf boyu degisiyor.

  DIKKAT: "Dikmen" burada ILCE DEGIL, CADDE adi (Dikmen Caddesi). Ilce Çankaya.
  Onceki adres satiri "No: 2/A Dikmen, Çankaya" yazarak ikisini birbirine
  karistiriyordu.
*/
const ADRES_SOKAK = "Osmantemiz Mah. 1022. Cad, Dikmen Cd. No: 2/A";
const POSTA_KODU = "06450";

/**
 * Iletisim kanallari. null = henuz teyit edilmedi, sitede gosterilmez.
 * Teyit geldiginde yalniz bu blok doldurulur, site kendiliginden acilir.
 */
export const ILETISIM = {
  telefon: "0542 641 66 08" as string | null,
  /**
   * 905XXXXXXXXX formatinda, basinda arti yok. wa.me baglantisi bundan uretilir.
   *
   * TELEFONLA AYNI HAT. Musteri 17 Agustos 2026'da teyit etti: ayri bir
   * WhatsApp numarasi yok. Iki alan yine de ayri duruyor -- ileride ayri bir
   * hat alinirsa yalniz burasi degisir. Ikisinin ayni kalmasi veri testiyle
   * korunuyor (scripts/veri-testi.ts).
   */
  whatsapp: "905426416608" as string | null,
  eposta: null as string | null,
  instagram: "https://www.instagram.com/bambolaoyunvepartievi/" as string | null,
  /**
   * Sokak satiri: mahalle, cadde ve kapi numarasi. Ilce, il ve posta kodu
   * BURAYA YAZILMAZ; schema.org `streetAddress` alanina oldugu gibi giriyor
   * ve orada ilce/il ayri alanlarda tekrar ediyor.
   */
  adresSokak: ADRES_SOKAK as string | null,
  /** Posta kodu. schema.org `postalCode`. */
  postaKodu: POSTA_KODU as string | null,
  /**
   * Tek satirlik gosterim hali. Footer NAP'i, /iletisim ve KVKK metni bunu
   * basiyor. Parcalardan URETILIYOR: elle yazilsaydi bir gun sokak satiri
   * degisip bu satir eski hâlde kalabilirdi.
   */
  adres:
    `${ADRES_SOKAK}, ${POSTA_KODU} ${MARKA.ilce}/${MARKA.sehir}` as
      | string
      | null,
  /**
   * Google Business Profile kaydindaki isletme adi. Kayitta buyuk harfle
   * ("BAMBOLA OYUN VE PARTİ EVİ") yaziyor, burada cumle duzeninde duruyor.
   *
   * NAP adi bundan uretiliyor, bkz. `napAdi()`.
   */
  googleAdi: "Bambola Oyun ve Parti Evi" as string | null,
  /** Yer kimligi (CID). Yol tarifi baglantilarini adrese degil KAYDA baglar. */
  googlePlaceCid: "0x14d345307d4a48a3:0x8b53e3ff4f4bbcba" as string | null,
  /**
   * Google'in varlik kimligi (FID). Kaydin kisa baglantisi cozuldugunde
   * URL'deki `!16s/g/...` parcasindan okundu. Su an hicbir yerde
   * kullanilmiyor; kayit kimliklerinin en kalicisi oldugu icin duruyor.
   */
  googleVarlikId: "/g/11lv4vtthv" as string | null,
  /** Kaydin koordinatlari. schema.org `geo` alanina giriyor. */
  konum: { enlem: 39.8739282, boylam: 32.8394536 } as {
    enlem: number;
    boylam: number;
  } | null,
  /**
   * Google Maps yer gomme baglantisi. null = gomulu harita gosterilmez,
   * yerine yalniz yol tarifi baglantilari cikar.
   *
   * Anahtarsiz `output=embed` bicimi. API anahtari veya faturalandirma
   * istemez; `maps/embed/v1/place` isterdi (401 donuyor).
   *
   * Adres metni yerine KOORDINAT veriliyor: adres aramasi yakindaki baska
   * bir noktaya dusebiliyor, koordinat dusmez.
   *
   * DIKKAT: bu URL yalnizca iframe icinde calisir. Dogrudan acilinca
   * "The Google Maps Embed API must be used in an iframe." doner. Bu yuzden
   * "calisiyor mu" testi iframe icinde ve DOM uzerinden yapilmali; headless
   * tarayici haritayi BOYAYAMADIGI icin ekran goruntusu bos cikiyor ama
   * doseme goruntuleri yukleniyor.
   */
  haritaEmbed:
    "https://maps.google.com/maps?q=39.8739282,32.8394536&z=17&hl=tr&output=embed" as
      | string
      | null,
} as const;

/**
 * Footer NAP'inda ve schema `name` alaninda gecen isletme adi.
 *
 * PLAN.md Bolum 14 madde 9, musteri karari (16 Agustos 2026): Google
 * kaydindaki ad ONDE, tuzel ad parantez icinde. Ikisi birden yaziliyor cunku
 * her biri baska bir yerde zorunlu -- Google kaydi yerel SEO icin, tuzel ad
 * KVKK metni ve MEB ruhsati icin. Yalniz birini yazmak digerini kirar.
 *
 * Google kaydi henuz yoksa (googleAdi null) tuzel ada dusuyor: parantez
 * icinde tek bir ad gostermek anlamsiz olurdu.
 */
export function napAdi(): string {
  if (!ILETISIM.googleAdi) return MARKA.tuzelAdOyunEvi;
  return `${ILETISIM.googleAdi} (${MARKA.tuzelAdOyunEvi})`;
}

/**
 * Isletmenin Google Maps kartinin kalici baglantisi. schema `sameAs`
 * alanina giriyor: arama motoruna "sitedeki kurum ile su Google kaydi ayni
 * varliktir" demenin dogrudan yolu.
 *
 * CID'in ikinci parcasi ONDALIGA cevriliyor; `?cid=` bicimi onaltilik
 * beklemiyor. Kisa baglanti (maps.app.goo.gl) kullanilmiyor: yonlendirme
 * hedefi Google'in elinde, `cid` ise kaydin kendi kimligi.
 */
export function googleKartBaglantisi(): string | null {
  const kayit = ILETISIM.googlePlaceCid?.split(":")[1];
  if (!kayit) return null;
  return `https://www.google.com/maps?cid=${BigInt(kayit)}`;
}

/**
 * Google Maps baglantilari.
 *
 * Yer kimligi (CID) varsa ADRES METNI YERINE o kullaniliyor: adres aramasi
 * yakindaki baska bir noktaya dusebilir, kayit kimligi dogrudan isletmenin
 * kendi kartini acar.
 */
export function yolTarifiBaglantisi(): string | null {
  if (ILETISIM.googlePlaceCid) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ILETISIM.googleAdi ?? "")}&destination_place_id=${ILETISIM.googlePlaceCid}`;
  }
  if (!ILETISIM.adres) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ILETISIM.adres)}`;
}

/** Google Maps'te konumu ac. */
export function haritadaAcBaglantisi(): string | null {
  if (ILETISIM.konum) {
    const { enlem, boylam } = ILETISIM.konum;
    return `https://www.google.com/maps/place/${enlem},${boylam}/@${enlem},${boylam},17z`;
  }
  if (!ILETISIM.adres) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ILETISIM.adres)}`;
}

/** Bir kanal yayina hazir mi. Cagri butonlari bunu kontrol eder. */
export function kanalAcik(kanal: keyof typeof ILETISIM): boolean {
  return Boolean(ILETISIM[kanal]);
}

/** WhatsApp baglantisi. Numara yoksa null doner ve buton hic basilmaz. */
export function whatsappBaglantisi(mesaj?: string): string | null {
  if (!ILETISIM.whatsapp) return null;
  const q = mesaj ? `?text=${encodeURIComponent(mesaj)}` : "";
  return `https://wa.me/${ILETISIM.whatsapp}${q}`;
}

/**
 * Sitenin yayin adresi. Kanonik URL'ler, sitemap, robots, OG kartlari ve
 * schema.org kimlikleri bunun uzerine kuruluyor.
 *
 * YAYIN RISKI: `NEXT_PUBLIC_SITE_URL` tanimlanmadan yayina cikilirsa butun
 * bu adresler `localhost` gosterir. Hicbir yerde hata vermez, site normal
 * gorunur, ama arama motoru sitenin tamamini erisilemez adreslerle
 * indeksler. Bu yuzden Vercel'in kendi production adresine dusuyor:
 * `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL` platform tarafindan otomatik
 * tanimlaniyor ve NEXT_PUBLIC_ onekli oldugu icin tarayicida da ayni degeri
 * veriyor (sunucu ile istemci farkli deger gorseydi hydration bozulurdu).
 *
 * Sondaki bolu isareti kirpiliyor: adres "https://alanadi.com/" olarak
 * girilirse kanonik URL "https://alanadi.com//iletisim" olur.
 */
function siteAdresi(): string {
  const acik = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (acik) return acik.replace(/\/+$/, "");

  const vercel = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;

  return "http://localhost:3939";
}

export const SITE_URL = siteAdresi();

/**
 * MEB ifadesi. 10 Agustos 2026'da musteri kesinlestirdi: "bagli".
 * ("onayli" ve "ruhsatli" hukuken farkli seyler, o yuzden tek dogru kelime
 * kullaniliyor ve tek yerden geliyor.)
 *
 * Musteri bunun kurumun EN ONEMLI ayirt edici ozelligi oldugunu ve dikkat
 * cekmesi gerektigini soyledi. Bu yuzden hem sitede hem fiyat listesinde
 * ust siralarda, kendi rozetinde duruyor; dipnotta degil.
 */
export const MEB_IFADESI = "Millî Eğitim Bakanlığı'na bağlı";

/** Rozetin altinda kullanilan aciklayici cumle. */
export const MEB_ACIKLAMA =
  "Kurumumuz Millî Eğitim Bakanlığı'na bağlıdır. Denetimi, personel niteliği ve fiziki şartları bakanlık standartlarına tabidir.";
