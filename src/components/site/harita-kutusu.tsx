"use client";

import { useState } from "react";
import { Ikon } from "@/components/ui/ikon";

/**
 * Gomulu Google haritasi, TIKLAYINCA yukleniyor.
 *
 * Neden: iframe sayfa acilir acilmaz yuklenince Google'a istek gidiyor ve
 * ucuncu taraf cerez yaziliyor -- veli daha hicbir sey secmemisken. KVKK ve
 * cerez politikasinin dogru olabilmesi icin harita ONAY BEKLIYOR. Site
 * boylece "zorunlu olmayan hicbir cerez yok" diyebiliyor; cerez uyari
 * bandina da gerek kalmiyor.
 *
 * Onay verilmezse kullanici yine kaybetmiyor: "Yol tarifi al" ve adres
 * zaten yaninda duruyor, ikisi de ucuncu taraf istegi yapmiyor.
 */
export function HaritaKutusu({
  embedUrl,
  baslik,
  className = "",
}: {
  embedUrl: string;
  baslik: string;
  className?: string;
}) {
  const [acik, setAcik] = useState(false);

  if (acik) {
    return (
      <iframe
        src={embedUrl}
        title={baslik}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className={className}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setAcik(true)}
      className={`group flex flex-col items-center justify-center gap-3 bg-krem p-8 text-center transition-colors hover:bg-krem-koyu ${className}`}
    >
      <span className="grid size-14 place-items-center rounded-full border-2 border-cizgi bg-white text-yesil-koyu transition-colors group-hover:border-yesil">
        <Ikon.Konum boyut={24} />
      </span>
      <span className="font-baslik text-base font-bold text-murekkep">
        Haritayı göster
      </span>
      <span className="max-w-xs text-sm leading-relaxed text-murekkep-soluk">
        Harita Google Maps&apos;ten yüklenir ve Google çerez yazar. Siz
        istemedikçe yüklenmiyor.
      </span>
    </button>
  );
}
