import type { Metadata } from "next";
import {
  MARKA,
  SITE_URL,
  ILETISIM,
  SAATLER,
  MEB_IFADESI,
  haritadaAcBaglantisi,
  googleKartBaglantisi,
} from "./site";
import { SLOTLAR, saatIso } from "./data/program";
import { GUN_SCHEMA } from "./data/types";
import type { Gun } from "./data/types";
import { fotolar, fotoYolu } from "./data/fotograflar";
import { EKIP, ogretmenAdi, ogretmenSlug } from "./data/ekip";

/**
 * Schema.org `image` alanina giren kareler. Kurumun vitrini: oyun alani,
 * atolye sinifi, teras. Tam liste /mekan sayfasindaki ImageGallery'de.
 */
const VITRIN_FOTOLARI = fotolar(
  "bambola-top-havuzu-01",
  "bambola-atolye-sinifi-01",
  "bambola-teras-01",
);

/**
 * SEO yardimcilari. PLAN.md Bolum 5.
 * Baslik 55-60 karakter, aciklama 150-160 karakter hedefi.
 */

export function sayfaMetadata({
  baslik,
  aciklama,
  yol,
  indeks = true,
}: {
  baslik: string;
  aciklama: string;
  yol: string;
  indeks?: boolean;
}): Metadata {
  return {
    title: baslik,
    description: aciklama,
    alternates: { canonical: yol },
    openGraph: {
      title: `${baslik} | ${MARKA.ad}`,
      description: aciklama,
      url: yol,
      type: "website",
      locale: "tr_TR",
      siteName: MARKA.ad,
    },
    robots: indeks
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

/** Uzunluk denetimi. Gelistirmede uyarir, yayinda sessizdir. */
export function baslikUzunlugu(b: string): string {
  if (process.env.NODE_ENV === "development" && b.length > 60) {
    console.warn(`[seo] baslik 60 karakteri asiyor (${b.length}): ${b}`);
  }
  return b;
}

// ------------------------------------------------------------------- schema

type Sema = Record<string, unknown>;

/**
 * Organization + LocalBusiness. PLAN.md Bolum 5.
 *
 * `legalName` BILEREK YOK. O alan sicildeki ticaret unvanini ister; site
 * unvani hicbir yerde yazmiyor (sebebi lib/site.ts basindaki notta). Onceden
 * oraya MEB kurum adi yaziliyordu -- kurum adi ile ticaret unvani ayri
 * seyler, arama motoruna yanlis bilgi gidiyordu. Kurum adi `name` icinde
 * zaten geciyor, kaybolan bir sey yok.
 *
 * Teyit edilmemis alan (adres, telefon) hic yazilmaz; bos deger yazmak
 * yanlis bilgi yaymaktan beterdir.
 */
export function kurumSemasi(): Sema {
  const s: Sema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "ChildCare", "LocalBusiness"],
    "@id": `${SITE_URL}/#kurum`,
    /*
      `name` Google Business Profile kaydindaki adla ayni olmali: arama
      motoru sitedeki kurumla oradaki kaydi bu alandan eslestiriyor. Kisa
      marka adi ("Bambola") alternateName icinde duruyor, kaybolmuyor.

      "Kids Zone & Party House" 25 Agustos 2026'da buradan cikti. Musteri
      10 Agustos'ta ifadenin kullanilmamasini istemisti; alanda durmasinin
      tek gerekcesi amblemin halkasinda yaziyor olmasiydi. Halka yazisi
      resmi kurum adiyla degisince o gerekce de ortadan kalkti.
    */
    name: ILETISIM.googleAdi ?? MARKA.ad,
    alternateName: [MARKA.ad],
    url: SITE_URL,
    logo: `${SITE_URL}/marka/bambola-logo.png`,
    // Google yerel sonuclarinda `image` gercek mekan fotografi bekliyor;
    // logo koymak alani doldurur ama ise yaramaz. Sirasi bilincli: ilk kare
    // sonuc kartinda cikan karedir.
    image: VITRIN_FOTOLARI.map((f) => `${SITE_URL}${fotoYolu(f)}`),
    areaServed: { "@type": "City", name: `${MARKA.ilce}, ${MARKA.sehir}` },
    description: MEB_IFADESI
      ? `${MEB_IFADESI} oyun merkezi. ${MARKA.ilce}, ${MARKA.sehir}.`
      : undefined,
    openingHoursSpecification: acilisSaatleri(),
  };

  const adres: Sema = {
    "@type": "PostalAddress",
    addressLocality: MARKA.ilce,
    addressRegion: MARKA.sehir,
    addressCountry: "TR",
  };
  /*
    `streetAddress` yalniz sokak satirini alir: ilce, il ve posta kodu zaten
    kendi alanlarinda duruyor, tek satirlik `ILETISIM.adres` konsaydi ucu de
    semada iki kez gecerdi.
  */
  if (ILETISIM.adresSokak) adres.streetAddress = ILETISIM.adresSokak;
  if (ILETISIM.postaKodu) adres.postalCode = ILETISIM.postaKodu;
  s.address = adres;

  if (ILETISIM.telefon) s.telephone = ILETISIM.telefon;
  if (ILETISIM.eposta) s.email = ILETISIM.eposta;
  /*
    `sameAs` kurumun baska platformlardaki resmi profilleri. Google Maps
    karti da buraya giriyor: sitedeki kurumla oradaki kaydin ayni varlik
    oldugunu soyleyen en dogrudan sinyal bu.
  */
  const profiller = [ILETISIM.instagram, googleKartBaglantisi()].filter(
    (u): u is string => Boolean(u),
  );
  if (profiller.length) s.sameAs = profiller;

  /*
    Koordinat, yerel sonuclarda adres metninden daha guvenilir bir sinyal:
    "Osmantemiz Mah. 1022. Cad." gibi bir satiri Google yanlis noktaya
    baglayabiliyor, enlem/boylam baglamiyor.
  */
  if (ILETISIM.konum) {
    s.geo = {
      "@type": "GeoCoordinates",
      latitude: ILETISIM.konum.enlem,
      longitude: ILETISIM.konum.boylam,
    };
  }
  const harita = haritadaAcBaglantisi();
  if (harita) s.hasMap = harita;

  /*
    Kurumu kimin yonettigi E-E-A-T'nin dogrudan sinyali: arama motoru
    kurumun arkasinda gercek bir kisi oldugunu buradan goruyor. Ad ve gorev
    ekip verisinden geliyor, elle yazilmiyor.
  */
  const mudur = EKIP.find((o) => o.gorev);
  if (mudur) {
    s.employee = {
      "@type": "Person",
      name: ogretmenAdi(mudur),
      jobTitle: mudur.gorev,
      url: `${SITE_URL}/ekip#${ogretmenSlug(mudur)}`,
    };
  }

  return s;
}

/**
 * openingHoursSpecification KURUMUN CALISMA SAATLERINDEN uretilir
 * (lib/site.ts SAATLER), programdan degil.
 *
 * Onceden haftalik programdan uretiliyordu: ilk seansin basi acilis, son
 * seansin sonu kapanis sayiliyordu. Sonuc yanlisti -- program 09.30'da
 * basladigi icin Google'a "09.30'da aciliyor" diyordu, kurum ise 09.00'da
 * acik. Program seans saatini anlatir, acilis saatini anlatmaz.
 *
 * Saatler henuz gelmediyse programa dusuyor: hic saat yazmamak, yaklasik
 * bir saat yazmaktan kotu (Google yerel kartta bos birakiyor).
 */
export function acilisSaatleri(): Sema[] {
  const saatli = Object.entries(SAATLER).filter(
    (g): g is [Gun, { acilis: string; kapanis: string }] => g[1] !== null,
  );

  if (saatli.length > 0) {
    return saatli.map(([gun, { acilis, kapanis }]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${GUN_SCHEMA[gun]}`,
      opens: saatIso(acilis),
      closes: saatIso(kapanis),
    }));
  }

  const gunler = new Map<Gun, { ilk: string; son: string }>();

  for (const s of SLOTLAR) {
    const mevcut = gunler.get(s.gun);
    if (!mevcut) {
      gunler.set(s.gun, { ilk: s.bas, son: s.bit });
    } else {
      if (s.bas < mevcut.ilk) mevcut.ilk = s.bas;
      if (s.bit > mevcut.son) mevcut.son = s.bit;
    }
  }

  return [...gunler.entries()].map(([gun, { ilk, son }]) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: `https://schema.org/${GUN_SCHEMA[gun]}`,
    opens: saatIso(ilk),
    closes: saatIso(son),
  }));
}

export function ekmekKirintisiSemasi(
  ogeler: { ad: string; yol: string }[],
): Sema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: ogeler.map((o, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: o.ad,
      item: `${SITE_URL}${o.yol}`,
    })),
  };
}

export function sssSemasi(sorular: { soru: string; cevap: string }[]): Sema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: sorular.map((s) => ({
      "@type": "Question",
      name: s.soru,
      acceptedAnswer: { "@type": "Answer", text: s.cevap },
    })),
  };
}

/** Program detay sayfalari icin Course. hasCourseInstance saatlerden uretilir. */
export function kursSemasi({
  ad,
  aciklama,
  yol,
  slotlar,
}: {
  ad: string;
  aciklama: string;
  yol: string;
  slotlar: { gun: Gun; bas: string; bit: string }[];
}): Sema {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: ad,
    description: aciklama,
    url: `${SITE_URL}${yol}`,
    provider: { "@id": `${SITE_URL}/#kurum` },
    hasCourseInstance: slotlar.map((s) => ({
      "@type": "CourseInstance",
      courseMode: "onsite",
      courseSchedule: {
        "@type": "Schedule",
        byDay: `https://schema.org/${GUN_SCHEMA[s.gun]}`,
        startTime: saatIso(s.bas),
        endTime: saatIso(s.bit),
        repeatFrequency: "P1W",
      },
      location: { "@id": `${SITE_URL}/#kurum` },
    })),
  };
}

/** JSON-LD bloklarini sayfaya basar. */
export function SemaEtiketi({ sema }: { sema: Sema | Sema[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(sema) }}
    />
  );
}
