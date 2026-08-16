import type { Metadata, Viewport } from "next";
import { Baloo_2, Poppins } from "next/font/google";
import "./globals.css";
import { MARKA, SITE_URL } from "@/lib/site";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { WhatsappButonu } from "@/components/site/whatsapp-butonu";
import { kampanyaAcikMi, kampanyaKalanGun } from "@/lib/data/ucretler";

/**
 * PLAN.md Bolum 11, Tipografi.
 *
 * DIKKAT, buraya Fredoka KONULMAZ. Fredoka'nin latin-ext altkumesinde
 * Turkce harfler yok: dosya yalnizca 22 glif tasiyor ve g-breve, G-breve,
 * I-nokta, s-cedilla, S-cedilla hicbiri icinde degil. Yazi tipi degistirilecek
 * olursa once glif kapsami dogrulanir, "latin-ext destekliyor" yazmasi yetmez.
 *
 * Baloo 2 ve Poppins'in kapsami woff2 cmap tablosundan tek tek dogrulandi:
 * ikisi de on iki Turkce harfin tamamini tasiyor.
 */
const baslik = Baloo_2({
  subsets: ["latin", "latin-ext"],
  variable: "--font-baslik-ailesi",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${MARKA.ad} ${MARKA.ilce} | Oyun Evi ve Anaokulu`,
    template: `%s | ${MARKA.ad}`,
  },
  description: `${MARKA.ilce}, ${MARKA.sehir}'da oyun evi, oyun gruplari ve anaokulu. 6 aydan 6 yasa kadar, en fazla 12 kisilik gruplar.`,
  applicationName: MARKA.ad,
  /*
    Ana sayfanin kanonik adresi. Diger sayfalar bunu `sayfaMetadata`'dan
    aliyor, ana sayfanin metadata'si ise dogrudan burada duruyor ve kanonik
    etiketi eksik kalmisti.
    Onemi: kampanya trafigi Instagram ve WhatsApp'tan geliyor, yani ana
    sayfaya `?utm_source=...` ve `?fbclid=...` ekli adreslerle giriliyor.
    Kanonik olmadan bunlarin her biri ayri bir sayfa olarak indekslenebilir
    ve ana sayfanin sinyali bolunur.
  */
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: MARKA.ad,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#588f27",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${baslik.variable} ${poppins.variable}`}>
      <head>
        {/*
          Kaydirmada beliren bolumler motion ile opaklik 0'dan basliyor ve bu
          deger sunucudan gelen HTML'e de yaziliyor. JavaScript calismazsa
          icerik kalici olarak gorunmez kalirdi. Bu kural yalniz JS kapaliyken
          devreye girer ve her seyi gorunur yapar.
        */}
        <noscript>
          <style>{`[data-belir]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#icerik"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-yumusak focus:bg-yesil focus:px-4 focus:py-2 focus:text-white"
        >
          İçeriğe geç
        </a>
        <SiteHeader />
        <main id="icerik" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        {/*
          Kampanya durumu SUNUCUDA hesaplanip prop olarak geciriliyor.
          Istemcide hesaplansaydi, sayfa onbellekten gelirken sunucu "acik"
          istemci "kapali" diyebilir ve hydration uyusmazligi cikardi
          (bkz. ucretler.ts, kampanyaAcikMi).
        */}
        <WhatsappButonu
          kampanyaAcik={kampanyaAcikMi()}
          kalanGun={kampanyaKalanGun()}
        />
      </body>
    </html>
  );
}
