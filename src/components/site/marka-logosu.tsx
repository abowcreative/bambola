import Image from "next/image";
import logoKaynagi from "@/assets/bambola-logo.png";

/**
 * Tek logo bileseni. Sitedeki her logo buradan gecer.
 *
 * KAYNAK: `bambola-final-logo.pdf`, 25 Agustos 2026'da musterinin verdigi
 * resmi amblem. Dosya `npm run logo` ile PNG'ye cevriliyor, elle
 * duzenlenmiyor; ayrintilar `scripts/logo-uret.ts` basindaki notta.
 *
 * NEDEN PNG, SVG DEGIL: Kaynak PDF'in ici raster (tek bir 1024x1024 CMYK
 * JPEG + saydamlik maskesi). Icinde vektor yok, dolayisiyla cikarilabilecek
 * bir yol da yok. Onceki yesil amblem SVG'ydi ama o amblem artik
 * kullanilmiyor: halkasinda "Kids Zone & Party House" yaziyordu ve musteri
 * 10 Agustos 2026'da o ifadenin kullanilmamasini istemisti.
 *
 * NEDEN STATIK ICE AKTARIM: Next dosyaya icerik damgasi basiyor
 * (/_next/static/media/bambola-logo.<hash>.png). Amblem degistiginde URL de
 * degisiyor, tarayici onbellekteki eski kopyayi gostermiyor. Genislik ve
 * yukseklik de dosyadan okunuyor, elle yazilmiyor.
 */
export function MarkaLogosu({
  boyut = 56,
  alt = "",
  className = "",
  oncelikli = false,
}: {
  boyut?: number;
  /** Bos birakilirsa suslemedir, ekran okuyucu atlar. */
  alt?: string;
  className?: string;
  /** Ekranin ust kismindaysa true. LCP adayi. */
  oncelikli?: boolean;
}) {
  return (
    <Image
      src={logoKaynagi}
      alt={alt}
      width={boyut}
      height={boyut}
      priority={oncelikli}
      className={className}
    />
  );
}
