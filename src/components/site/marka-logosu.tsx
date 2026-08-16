import Image from "next/image";
import logoKaynagi from "@/assets/bambola-kids-zone.svg";

/**
 * Tek logo bileseni. Sitedeki her logo buradan gecer.
 *
 * NEDEN STATIK ICE AKTARIM:
 * Logo once `public/marka/...svg` yolundan sabit URL ile sunuluyordu. O
 * dosyanin ilk surumu bozuktu (aria-label icindeki & karakteri XML olarak
 * kacislanmamisti, dosya gecersiz XML oldugu icin tarayici cizmiyordu).
 * Dosya duzeltildi ama URL ayni kaldigi icin tarayicilar onbellekteki bozuk
 * kopyayi gostermeye devam etti.
 *
 * Statik ice aktarimda Next dosyaya icerik damgasi basiyor
 * (/_next/static/media/bambola-kids-zone.<hash>.svg). Dosya her degistiginde
 * URL de degisiyor, yani onbellek sorunu bir daha yasanmiyor. Ayrica
 * genislik ve yukseklik dosyadan okunuyor, elle yazilmiyor.
 *
 * `unoptimized`: SVG zaten vektor. Next'in goruntu iyilestiricisi SVG'yi
 * guvenlik gerekcesiyle reddediyor ve zaten kazanc saglamazdi.
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
      unoptimized
      className={className}
    />
  );
}
