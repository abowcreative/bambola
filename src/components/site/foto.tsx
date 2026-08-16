import Image from "next/image";
import type { Fotograf } from "@/lib/data/fotograflar";
import { fotoYolu } from "@/lib/data/fotograflar";

/**
 * Mekan fotografi. Tek yerden basilir ki oran, kose ve yuklenme davranisi
 * her sayfada ayni olsun.
 *
 * `oran` kutunun seklini belirler, gorsel `object-cover` ile kirpilir.
 * Kaynak dosyalarin bir kismi yatay (4:3), bir kismi dikey (3:4); kutu orani
 * kaynaktan bagimsiz secilebilsin diye kirpma CSS'e birakildi.
 *
 * `boyutlar` next/image'in `sizes` degeri. Yanlis verilirse tarayici gereksiz
 * buyuk dosya indirir, o yuzden her cagri yerinde acikca yaziliyor.
 */

const ORANLAR = {
  kare: "aspect-square",
  yatay: "aspect-[4/3]",
  dikey: "aspect-[3/4]",
  genis: "aspect-[16/9]",
  serit: "aspect-[21/9]",
} as const;

export type FotoOrani = keyof typeof ORANLAR;

export function Foto({
  foto,
  oran = "yatay",
  boyutlar,
  className = "",
  oncelikli = false,
  genis = false,
  yuvarlak = "rounded-kart",
}: {
  foto: Fotograf;
  oran?: FotoOrani;
  boyutlar: string;
  className?: string;
  oncelikli?: boolean;
  /** 16:9 kirpimi varsa onu kullan. Genis seritlerde daha iyi kadraj verir. */
  genis?: boolean;
  yuvarlak?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-krem-koyu ${ORANLAR[oran]} ${yuvarlak} ${className}`}
    >
      <Image
        src={fotoYolu(foto, genis)}
        alt={foto.alt}
        fill
        sizes={boyutlar}
        priority={oncelikli}
        className="object-cover"
      />
    </div>
  );
}
