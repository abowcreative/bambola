import type { SVGProps } from "react";

/**
 * Ikon seti. PLAN.md Bolum 11, Ikon ve illustrasyon:
 * emoji yok; logonun cizgi diliyle ayni monoline set. Sabit kalinlik,
 * yuvarlak uclar, kontursuz. Hepsi 24x24 kutuda, currentColor ile boyanir.
 */

type IkonProps = SVGProps<SVGSVGElement> & { boyut?: number };

function Kutu({ boyut = 24, children, ...rest }: IkonProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={boyut}
      height={boyut}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
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

export const Ikon = {
  Menu: (p: IkonProps) => (
    <Kutu {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Kutu>
  ),
  Kapat: (p: IkonProps) => (
    <Kutu {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Kutu>
  ),
  /* Kampus panelinde kullanilanlar. Ayni monoline dil, 24x24 kutu. */
  Cikis: (p: IkonProps) => (
    <Kutu {...p}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h11" />
    </Kutu>
  ),
  Not: (p: IkonProps) => (
    <Kutu {...p}>
      <path d="M5 4h9l5 5v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
      <path d="M14 4v5h5M8 13h8M8 17h5" />
    </Kutu>
  ),
  Suzgec: (p: IkonProps) => (
    <Kutu {...p}>
      <path d="M4 5h16l-6.2 7.3V19l-3.6-2v-4.7Z" />
    </Kutu>
  ),
  Ok: (p: IkonProps) => (
    <Kutu {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Kutu>
  ),
  OkGeri: (p: IkonProps) => (
    <Kutu {...p}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </Kutu>
  ),
  OkAsagi: (p: IkonProps) => (
    <Kutu {...p}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </Kutu>
  ),
  Takvim: (p: IkonProps) => (
    <Kutu {...p}>
      <rect x="3" y="5" width="18" height="16" rx="4" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </Kutu>
  ),
  Saat: (p: IkonProps) => (
    <Kutu {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Kutu>
  ),
  Grup: (p: IkonProps) => (
    <Kutu {...p}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 6.2a3 3 0 0 1 0 5.6M17.5 19a5.4 5.4 0 0 0-2.2-4.3" />
    </Kutu>
  ),
  Bebek: (p: IkonProps) => (
    <Kutu {...p}>
      <circle cx="12" cy="9" r="5.2" />
      <path d="M9.8 8.4h.01M14.2 8.4h.01" />
      <path d="M10.2 11.2c1.1.9 2.5.9 3.6 0" />
      <path d="M6.9 19.8a5.2 5.2 0 0 1 10.2 0" />
    </Kutu>
  ),
  Ayi: (p: IkonProps) => (
    <Kutu {...p}>
      <circle cx="7.2" cy="6.4" r="2.2" />
      <circle cx="16.8" cy="6.4" r="2.2" />
      <circle cx="12" cy="12.4" r="6" />
      <path d="M10.2 11.4h.01M13.8 11.4h.01" />
      <path d="M10.6 14.6c.9.7 1.9.7 2.8 0" />
    </Kutu>
  ),
  Balon: (p: IkonProps) => (
    <Kutu {...p}>
      <path d="M12 3c3 0 5 2.4 5 5.4 0 3.4-2.6 6.6-5 6.6s-5-3.2-5-6.6C7 5.4 9 3 12 3Z" />
      <path d="M12 15v1.6M10.6 18.2c1.4-.6 1.4-1.6 0-2.2M12 18.2c.9 1.2 2.6 1.6 4 1.2" />
    </Kutu>
  ),
  Muzik: (p: IkonProps) => (
    <Kutu {...p}>
      <path d="M9 18V6.5l10-2V16" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
    </Kutu>
  ),
  Firca: (p: IkonProps) => (
    <Kutu {...p}>
      <path d="M14.5 3.5 20.5 9.5 11 19H5v-6l9.5-9.5Z" />
      <path d="M12.5 5.5 18.5 11.5" />
    </Kutu>
  ),
  Sayilar: (p: IkonProps) => (
    <Kutu {...p}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <path d="M8 9.5 9.6 8.3V16M13.4 9.6a2 2 0 0 1 3.4 1.4c0 1.9-3.5 2.9-3.5 5h3.6" />
    </Kutu>
  ),
  Mercek: (p: IkonProps) => (
    <Kutu {...p}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.3 15.3 20.5 20.5" />
    </Kutu>
  ),
  Ampul: (p: IkonProps) => (
    <Kutu {...p}>
      <path d="M9 17.5a6 6 0 1 1 6 0v1.2a1.6 1.6 0 0 1-1.6 1.6h-2.8A1.6 1.6 0 0 1 9 18.7v-1.2Z" />
      <path d="M9.6 17.5h4.8" />
    </Kutu>
  ),
  Kalp: (p: IkonProps) => (
    <Kutu {...p}>
      <path d="M12 20s-7.5-4.4-7.5-9.4A4.1 4.1 0 0 1 12 8.2a4.1 4.1 0 0 1 7.5 2.4C19.5 15.6 12 20 12 20Z" />
    </Kutu>
  ),
  Yildiz: (p: IkonProps) => (
    <Kutu {...p}>
      <path d="m12 3.8 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.6 9.9l5.8-.8L12 3.8Z" />
    </Kutu>
  ),
  Tik: (p: IkonProps) => (
    <Kutu {...p}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Kutu>
  ),
  /** Kalkan ve tik. MEB baglilik rozetinde kullanilir. */
  Rozet: (p: IkonProps) => (
    <Kutu {...p}>
      <path d="M12 2.5 20 5.5v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10v-6z" />
      <path d="m8.6 11.8 2.4 2.4 4.6-4.6" />
    </Kutu>
  ),
  Telefon: (p: IkonProps) => (
    <Kutu {...p}>
      <path d="M6.2 3.8h3l1.4 3.6-2 1.3a11 11 0 0 0 4.7 4.7l1.3-2 3.6 1.4v3a1.8 1.8 0 0 1-2 1.8C10.3 17.1 6.9 13.7 4.4 5.8a1.8 1.8 0 0 1 1.8-2Z" />
    </Kutu>
  ),
  Whatsapp: (p: IkonProps) => (
    <Kutu {...p}>
      <path d="M20 12a8 8 0 0 1-11.9 7L4 20l1.1-4A8 8 0 1 1 20 12Z" />
      <path d="M9.3 9c.3 1.2.8 2.2 1.6 3s1.8 1.3 3 1.6l.9-1.3 1.8.8v1.3c-2.6.4-6.7-2.4-8-6.3h1.3l.8 1.8L9.3 9Z" />
    </Kutu>
  ),
  Konum: (p: IkonProps) => (
    <Kutu {...p}>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </Kutu>
  ),
  Posta: (p: IkonProps) => (
    <Kutu {...p}>
      <rect x="3" y="5.5" width="18" height="13" rx="3.5" />
      <path d="m4 8 7.1 4.6a1.7 1.7 0 0 0 1.8 0L20 8" />
    </Kutu>
  ),
  Instagram: (p: IkonProps) => (
    <Kutu {...p}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M16.9 7.1h.01" />
    </Kutu>
  ),
} as const;

export type IkonAdi = keyof typeof Ikon;

/**
 * Veriden gelen ikon adini cizer.
 *
 * Neden ayri bir bilesen: cagiran yerde `const X = Ikon[veri.ikon]` yazip
 * sonra `<X />` render etmek, React derleyicisinin "render sirasinda bilesen
 * yaratiliyor" uyarisini tetikliyor. Arama burada, modul sabiti uzerinden
 * yapilinca o sorun kalmiyor ve cagiran taraf sadece dizge geciriyor.
 */
export function DinamikIkon({
  ad,
  boyut,
  className,
}: {
  ad: string;
  boyut?: number;
  className?: string;
}) {
  const Bilesen = Ikon[ad as IkonAdi] ?? Ikon.Grup;
  return <Bilesen boyut={boyut} className={className} />;
}
