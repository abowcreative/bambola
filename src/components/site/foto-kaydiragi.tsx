import Image from "next/image";
import { gosterilenFotolar, fotoYolu } from "@/lib/data/fotograflar";

/**
 * Sonsuz kayan kurum fotografi seridi.
 *
 * SUNUCU BILESENI: hareketin tamami CSS'te (globals.css, `.kaydir-seridi`),
 * tarayiciya tek satir JavaScript gitmiyor. prefers-reduced-motion aciksa
 * animasyon kapaniyor ve serit duran bir fotograf dizisi olarak kaliyor.
 *
 * Kare listesi IKI KEZ basiliyor: animasyon bir kopya genisligi kadar
 * kaydirip basa donuyor, birlesme yeri gorunmuyor. Ikinci kopya ekran
 * okuyucuya `aria-hidden` ile gizli -- ayni alt metinleri iki kez okumasi
 * gerekmiyor.
 *
 * Kareler `gosterilenFotolar()` uzerinden geliyor: musterinin kaldirilmasini
 * istedigi fotograf (uzun masa duzeni) burada da gorunmuyor. Liste tek
 * kaynakta, bkz. lib/data/fotograflar.ts.
 */
export function FotoKaydiragi({
  /** Bir tam dongunun suresi. Uzun serit icin uzun sure. */
  sure = "70s",
}: {
  sure?: string;
}) {
  const kareler = gosterilenFotolar();

  return (
    <section
      aria-label="Kurumdan kareler"
      className="border-y border-cizgi bg-krem-koyu py-8"
    >
      {/*
        Kenarlarda yumusak gecis: serit ekranin icinden akip gidiyor gibi
        duruyor, kesik bir kenarla bitmiyor.
      */}
      <div
        className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
      >
        <div
          className="kaydir-seridi flex w-max gap-4"
          style={{ "--kaydir-sure": sure } as React.CSSProperties}
        >
          {[0, 1].map((kopya) => (
            <div
              key={kopya}
              aria-hidden={kopya === 1}
              className="flex shrink-0 gap-4"
            >
              {kareler.map((f) => (
                <div
                  key={f.slug}
                  className="relative h-40 w-60 shrink-0 overflow-hidden rounded-kart bg-krem sm:h-48 sm:w-72"
                >
                  <Image
                    src={fotoYolu(f, f.genisVar)}
                    alt={kopya === 0 ? f.alt : ""}
                    fill
                    sizes="(min-width: 640px) 288px, 240px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
