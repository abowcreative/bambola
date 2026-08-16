import type { SVGProps } from "react";

/**
 * Animasyonlu karakterler.
 *
 * Neden GIF degil de SVG: her boyutta net kaliyor, dosya olarak birkac yuz
 * bayt, rengi CSS'ten degisiyor ve prefers-reduced-motion aciksa hareket
 * tamamen duruyor. GIF bunlarin hicbirini yapamaz, ustelik kenarlari
 * tirtikli cikar ve sayfa agirlasir.
 *
 * Cizgi dili logodan aliniyor: sabit kalinlik, yuvarlak uclar, daire agirlikli
 * bicimler. Boylece karakterler logo ile ayni elden cikmis gorunuyor.
 */

type KarakterProps = SVGProps<SVGSVGElement> & {
  boyut?: number;
  /** Govde dolgusu. Cizgi her zaman currentColor. */
  dolgu?: string;
};

function Sahne({
  boyut = 120,
  children,
  ...rest
}: KarakterProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={boyut}
      height={boyut}
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Ayicik. Kulaklari oynar, gozleri kirpisir. */
export function Ayi({ dolgu = "#bdf270", ...p }: KarakterProps) {
  return (
    <Sahne {...p}>
      <g className="karakter-zipla">
        {/* kulaklar */}
        <circle
          cx="36"
          cy="30"
          r="12"
          fill={dolgu}
          className="karakter-kulak-sol"
        />
        <circle
          cx="84"
          cy="30"
          r="12"
          fill={dolgu}
          className="karakter-kulak-sag"
        />
        {/* govde */}
        <path
          d="M40 66c-8 4-12 14-10 24 1 8 8 14 16 14h28c8 0 15-6 16-14 2-10-2-20-10-24"
          fill={dolgu}
        />
        {/* kollar */}
        <path d="M38 78c-6 2-9 7-8 13" />
        <path d="M82 78c6 2 9 7 8 13" />
        {/* bas */}
        <circle cx="60" cy="48" r="26" fill={dolgu} />
        {/* burun bolgesi */}
        <ellipse cx="60" cy="58" rx="13" ry="10" fill="#fff" />
        <circle cx="60" cy="53" r="3.5" fill="currentColor" stroke="none" />
        <path d="M54 62c4 3.5 8 3.5 12 0" strokeWidth="3.2" />
        {/* gozler */}
        <g className="karakter-goz">
          <circle cx="50" cy="43" r="3.4" fill="currentColor" stroke="none" />
          <circle cx="70" cy="43" r="3.4" fill="currentColor" stroke="none" />
        </g>
      </g>
    </Sahne>
  );
}

/** Kedi. Kuyrugu sallanir. */
export function Kedi({ dolgu = "#d8c09a", ...p }: KarakterProps) {
  return (
    <Sahne {...p}>
      <path
        className="karakter-kuyruk"
        d="M86 94c14 2 20-8 16-18"
        strokeWidth="5"
      />
      <g className="karakter-sus">
        {/* kulaklar */}
        <path d="M40 34 36 16l17 8" fill={dolgu} />
        <path d="M80 34 84 16l-17 8" fill={dolgu} />
        {/* govde */}
        <path
          d="M42 68c-7 5-10 14-9 22 1 6 6 10 12 10h30c6 0 11-4 12-10 1-8-2-17-9-22"
          fill={dolgu}
        />
        {/* bas */}
        <circle cx="60" cy="48" r="24" fill={dolgu} />
        {/* gozler */}
        <g className="karakter-goz">
          <circle cx="51" cy="45" r="3.2" fill="currentColor" stroke="none" />
          <circle cx="69" cy="45" r="3.2" fill="currentColor" stroke="none" />
        </g>
        {/* burun ve biyik */}
        <path d="M57 55h6l-3 3.5z" fill="currentColor" stroke="none" />
        <path d="M36 50h10M36 57h10M74 50h10M74 57h10" strokeWidth="2.6" />
      </g>
    </Sahne>
  );
}

/** Tavsan. Kulaklari egilir. */
export function Tavsan({ dolgu = "#fff", ...p }: KarakterProps) {
  return (
    <Sahne {...p}>
      <g className="karakter-zipla">
        <ellipse
          className="karakter-kulak-sol"
          cx="48"
          cy="26"
          rx="8"
          ry="20"
          fill={dolgu}
        />
        <ellipse
          className="karakter-kulak-sag"
          cx="72"
          cy="26"
          rx="8"
          ry="20"
          fill={dolgu}
        />
        <path
          d="M42 70c-6 5-9 14-8 21 1 6 6 10 12 10h28c6 0 11-4 12-10 1-7-2-16-8-21"
          fill={dolgu}
        />
        <circle cx="60" cy="58" r="22" fill={dolgu} />
        <g className="karakter-goz">
          <circle cx="52" cy="55" r="3.2" fill="currentColor" stroke="none" />
          <circle cx="68" cy="55" r="3.2" fill="currentColor" stroke="none" />
        </g>
        <path d="M57 64h6l-3 3.5z" fill="currentColor" stroke="none" />
        <path d="M60 68v4M55 74c3 2 7 2 10 0" strokeWidth="3" />
      </g>
    </Sahne>
  );
}

/** Balon demeti. Ipler ve balonlar yavasca sallanir. */
export function Balonlar({ dolgu = "#bdf270", ...p }: KarakterProps) {
  return (
    <Sahne {...p}>
      <g className="karakter-sus">
        {/* Ipler once ciziliyor, balonlar ustune binip baglanti noktasini
            kapatiyor. Ucu asagida tek noktada birlesiyor. */}
        <path d="M34 58c4 18 14 28 26 42" strokeWidth="2.4" />
        <path d="M60 45c2 20 1 38 0 55" strokeWidth="2.4" />
        <path d="M86 60c-4 16-16 28-26 40" strokeWidth="2.4" />
        <path d="M60 100c5 6 3 11-4 14" strokeWidth="2.4" />
        <ellipse cx="34" cy="40" rx="14" ry="17" fill={dolgu} />
        <ellipse cx="60" cy="26" rx="13" ry="16" fill="#d8c09a" />
        <ellipse cx="86" cy="42" rx="12" ry="15" fill="#fff" />
      </g>
    </Sahne>
  );
}

/** Yildiz. Yavasca doner ve parlar. */
export function Yildiz({ dolgu = "#bdf270", ...p }: KarakterProps) {
  return (
    <Sahne {...p}>
      <path
        className="karakter-donen"
        d="m60 16 13 27 29 4-21 21 5 29-26-14-26 14 5-29-21-21 29-4z"
        fill={dolgu}
        style={{ transformOrigin: "60px 60px" }}
      />
    </Sahne>
  );
}

/** Bulut. Yatayda suzulur. */
export function Bulut({ dolgu = "#fff", ...p }: KarakterProps) {
  return (
    <Sahne {...p}>
      <path
        d="M34 78a17 17 0 0 1 2-34 23 23 0 0 1 44-4 16 16 0 0 1 6 31 15 15 0 0 1-4 7z"
        fill={dolgu}
      />
    </Sahne>
  );
}

/** Kule. Bloklar sirayla yerine oturur. */
export function Kule({ ...p }: KarakterProps) {
  return (
    <Sahne {...p}>
      <rect
        x="30"
        y="76"
        width="60"
        height="22"
        rx="6"
        fill="#bdf270"
        className="karakter-blok karakter-blok-1"
      />
      <rect
        x="38"
        y="52"
        width="44"
        height="22"
        rx="6"
        fill="#d8c09a"
        className="karakter-blok karakter-blok-2"
      />
      <rect
        x="46"
        y="28"
        width="28"
        height="22"
        rx="6"
        fill="#fff"
        className="karakter-blok karakter-blok-3"
      />
    </Sahne>
  );
}

export const KARAKTERLER = {
  Ayi,
  Kedi,
  Tavsan,
  Balonlar,
  Yildiz,
  Bulut,
  Kule,
} as const;

export type KarakterAdi = keyof typeof KARAKTERLER;

/** Veriden gelen karakter adini cizer. */
export function DinamikKarakter({
  ad,
  boyut,
  dolgu,
  className,
}: {
  ad: KarakterAdi;
  boyut?: number;
  dolgu?: string;
  className?: string;
}) {
  const Bilesen = KARAKTERLER[ad] ?? KARAKTERLER.Ayi;
  return <Bilesen boyut={boyut} dolgu={dolgu} className={className} />;
}
