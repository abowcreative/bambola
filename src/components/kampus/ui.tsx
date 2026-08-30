import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Ikon } from "@/components/ui/ikon";
import type { Ton } from "@/lib/kampus/tonlar";

/**
 * Kampus panelinin arayuz parcalari.
 *
 * Site tarafindaki bilesenlerden AYRI duruyorlar ve oyle kalmali: pazarlama
 * sayfalari kalin cerceveli, cok yuvarlak, hareketli; panel gun boyu
 * bakilan bir calisma ekrani. Ayni marka renkleri ve ayni iki yazi tipi
 * kullaniliyor, degisen yalniz yogunluk: ince cerceve, az yuvarlaklik,
 * kucuk yazi, sik satir.
 *
 * Buradaki hicbir bilesen kanca (hook) kullanmiyor; sunucu bileseninde de
 * istemci bileseninde de import edilebiliyorlar. Etkilesim gerektirenler
 * `ui-istemci.tsx` icinde.
 */

/* ------------------------------------------------------------------ ton */

/**
 * Durum tonu. Panelde "gecikmis odeme" ile "ders islendi" ayni yesille
 * gosterilemez; renk okunmadan once anlami tasimali.
 *
 * Tanim `lib/kampus/tonlar.ts` icinde ve durum -> ton eslemeleri de orada:
 * sunucu sayfalari ile istemci bilesenleri ayni haritaya baksin diye.
 */
export type { Ton };

const ROZET_TONU: Record<Ton, string> = {
  notr: "bg-panel-yuzey-alt text-panel-soluk ring-panel-cizgi-guclu",
  basari: "bg-basari-zemin text-basari ring-basari/20",
  uyari: "bg-uyari-zemin text-uyari ring-uyari/20",
  tehlike: "bg-tehlike-zemin text-tehlike ring-tehlike/20",
  bilgi: "bg-bilgi-zemin text-bilgi ring-bilgi/20",
  vurgu: "bg-lime-rozet text-black ring-yesil/30",
  sessiz: "bg-transparent text-panel-silik ring-panel-cizgi",
};

/** Kucuk durum etiketi. Metin + renk birlikte anlam tasir, tek basina renk degil. */
export function Rozet({
  ton = "notr",
  ikon,
  className = "",
  children,
}: {
  ton?: Ton;
  ikon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold leading-5 ring-1 ring-inset ${ROZET_TONU[ton]} ${className}`}
    >
      {ikon}
      {children}
    </span>
  );
}

/* ----------------------------------------------------------------- kart */

/** Panel yuzeyi. Ince cerceve + cok hafif golge; kalin cerceve degil. */
export function Kart({
  className = "",
  children,
  ...rest
}: ComponentProps<"section">) {
  return (
    <section
      className={`rounded-panel border border-panel-cizgi bg-panel-yuzey shadow-panel ${className}`}
      {...rest}
    >
      {children}
    </section>
  );
}

/**
 * Kart basligi. Kartin kendi ic dolgusundan bagimsiz: baslik seridi
 * kenarlara kadar uzanip altinda ayrac cizgisi birakiyor.
 */
export function KartBasi({
  baslik,
  aciklama,
  yanCocuk,
}: {
  baslik: ReactNode;
  aciklama?: ReactNode;
  yanCocuk?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-panel-cizgi px-4 py-3">
      <div className="min-w-0">
        <h2 className="font-baslik text-sm font-bold leading-tight text-murekkep">
          {baslik}
        </h2>
        {aciklama && (
          <p className="mt-0.5 text-xs leading-snug text-panel-soluk">
            {aciklama}
          </p>
        )}
      </div>
      {yanCocuk && <div className="shrink-0">{yanCocuk}</div>}
    </div>
  );
}

/* --------------------------------------------------------------- dugme */

type DugmeGorunum = "birincil" | "ikincil" | "sessiz" | "tehlike";
type DugmeOlcu = "sm" | "md";

const DUGME_GORUNUM: Record<DugmeGorunum, string> = {
  birincil:
    "bg-yesil-koyu text-white shadow-panel hover:bg-yesil-derin active:bg-yesil-derin",
  ikincil:
    "border border-panel-cizgi-guclu bg-panel-yuzey text-murekkep shadow-panel hover:bg-panel-yuzey-alt hover:border-panel-soluk/40",
  sessiz: "text-panel-soluk hover:bg-panel-yuzey-alt hover:text-murekkep",
  tehlike:
    "border border-tehlike/25 bg-tehlike-zemin text-tehlike hover:bg-tehlike hover:text-white hover:border-transparent",
};

const DUGME_OLCU: Record<DugmeOlcu, string> = {
  sm: "h-8 gap-1.5 px-3 text-xs",
  md: "h-9 gap-2 px-3.5 text-sm",
};

const DUGME_TEMEL =
  "inline-flex shrink-0 items-center justify-center rounded-panel-sm font-baslik font-semibold " +
  "transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50";

export function Dugme({
  gorunum = "ikincil",
  olcu = "md",
  className = "",
  children,
  ...rest
}: ComponentProps<"button"> & {
  gorunum?: DugmeGorunum;
  olcu?: DugmeOlcu;
}) {
  return (
    <button
      className={`${DUGME_TEMEL} ${DUGME_GORUNUM[gorunum]} ${DUGME_OLCU[olcu]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function DugmeLink({
  gorunum = "ikincil",
  olcu = "md",
  className = "",
  children,
  ...rest
}: ComponentProps<typeof Link> & {
  gorunum?: DugmeGorunum;
  olcu?: DugmeOlcu;
}) {
  return (
    <Link
      className={`${DUGME_TEMEL} ${DUGME_GORUNUM[gorunum]} ${DUGME_OLCU[olcu]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}

/** Yalniz ikon tasiyan kare dugme. `baslik` hem ipucu hem erisilebilir ad. */
export function IkonDugme({
  baslik,
  gorunum = "sessiz",
  className = "",
  children,
  ...rest
}: ComponentProps<"button"> & {
  baslik: string;
  gorunum?: DugmeGorunum;
}) {
  return (
    <button
      title={baslik}
      aria-label={baslik}
      className={`grid size-8 shrink-0 place-items-center rounded-panel-sm transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 ${DUGME_GORUNUM[gorunum]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------- girdi */

/**
 * Girdi sinifi. Bilesen degil DIZE: `input`, `select` ve `textarea` ayni
 * gorunumu paylasiyor ama farkli oznitelikler aliyor; hepsini tek bilesene
 * sarmak her seferinde prop aktarmak demekti.
 */
export const ALAN =
  "w-full rounded-panel-sm border border-panel-cizgi-guclu bg-panel-yuzey px-3 py-2 " +
  "text-sm text-murekkep outline-none transition-colors " +
  "placeholder:text-panel-silik hover:border-panel-soluk/45 " +
  "focus:border-yesil-koyu focus:ring-2 focus:ring-yesil-koyu/15 " +
  "disabled:cursor-not-allowed disabled:bg-panel-yuzey-alt disabled:opacity-70";

/** Girdi ustundeki kucuk etiket. */
export function Etiket({
  htmlFor,
  children,
  gerekli = false,
}: {
  htmlFor?: string;
  children: ReactNode;
  gerekli?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-xs font-semibold text-panel-soluk"
    >
      {children}
      {gerekli && (
        <span aria-hidden className="ml-0.5 text-tehlike">
          *
        </span>
      )}
    </label>
  );
}

/** Etiket + girdi + ipucu/hata ucusu. */
export function AlanKutusu({
  etiket,
  htmlFor,
  gerekli,
  ipucu,
  hata,
  className = "",
  children,
}: {
  etiket: string;
  htmlFor?: string;
  gerekli?: boolean;
  ipucu?: ReactNode;
  hata?: string | null;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <Etiket htmlFor={htmlFor} gerekli={gerekli}>
        {etiket}
      </Etiket>
      {children}
      {hata ? (
        <p role="alert" className="mt-1 text-xs font-medium text-tehlike">
          {hata}
        </p>
      ) : (
        ipucu && <p className="mt-1 text-xs text-panel-silik">{ipucu}</p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- uyari */

const BILDIRIM_TONU: Record<Ton, string> = {
  notr: "border-panel-cizgi bg-panel-yuzey-alt text-murekkep",
  basari: "border-basari/25 bg-basari-zemin text-murekkep",
  uyari: "border-uyari/25 bg-uyari-zemin text-murekkep",
  tehlike: "border-tehlike/25 bg-tehlike-zemin text-murekkep",
  bilgi: "border-bilgi/25 bg-bilgi-zemin text-murekkep",
  vurgu: "border-yesil/40 bg-lime-rozet/25 text-murekkep",
  sessiz: "border-panel-cizgi bg-transparent text-panel-soluk",
};

/** Sayfa icindeki bilgi/uyari seridi. */
export function Bildirim({
  ton = "bilgi",
  baslik,
  ikon,
  className = "",
  children,
}: {
  ton?: Ton;
  baslik?: ReactNode;
  ikon?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`rounded-panel border px-4 py-3 text-sm leading-relaxed ${BILDIRIM_TONU[ton]} ${className}`}
    >
      <div className="flex gap-2.5">
        {ikon && <span className="mt-0.5 shrink-0">{ikon}</span>}
        <div className="min-w-0 flex-1">
          {baslik && (
            <p className="font-baslik text-sm font-bold text-murekkep">
              {baslik}
            </p>
          )}
          {children && (
            <div className={baslik ? "mt-0.5 text-panel-soluk" : ""}>
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- tablo */

/**
 * Tablo sarmalayici. Dar ekranda YATAY KAYIYOR, sutun gizlemiyor: gizlenen
 * sutun telefonda paneli kullanilamaz hale getiriyordu.
 */
export function TabloSarmal({
  enAz = "40rem",
  className = "",
  children,
}: {
  /** Tablonun sikismadan durabilecegi en dar genislik. */
  enAz?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table
        className="w-full border-collapse text-sm"
        style={{ minWidth: enAz }}
      >
        {children}
      </table>
    </div>
  );
}

/** Tablo basligi hucresi. */
export function Th({
  sag = false,
  className = "",
  children,
  ...rest
}: ComponentProps<"th"> & { sag?: boolean }) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap border-b border-panel-cizgi bg-panel-yuzey-alt px-4 py-2.5 font-baslik text-[0.7rem] font-bold uppercase tracking-[0.06em] text-panel-soluk ${
        sag ? "text-right" : "text-left"
      } ${className}`}
      {...rest}
    >
      {children}
    </th>
  );
}

/** Tablo govde hucresi. Sayilar `tabular-nums` ve saga yaslı. */
export function Td({
  sag = false,
  sayi = false,
  className = "",
  children,
  ...rest
}: ComponentProps<"td"> & { sag?: boolean; sayi?: boolean }) {
  return (
    <td
      className={`border-b border-panel-cizgi px-4 py-2.5 align-middle text-murekkep ${
        sag || sayi ? "text-right" : ""
      } ${sayi ? "tabular-nums" : ""} ${className}`}
      {...rest}
    >
      {children}
    </td>
  );
}

/** Uzerine gelince aydinlanan tablo satiri. */
export function Tr({ className = "", children, ...rest }: ComponentProps<"tr">) {
  return (
    <tr
      className={`transition-colors last:[&>td]:border-b-0 hover:bg-panel-yuzey-alt ${className}`}
      {...rest}
    >
      {children}
    </tr>
  );
}

/* ------------------------------------------------------------ ilerleme */

/** Doluluk cubugu. Yuzde 100'u asan deger kirpiliyor. */
export function Ilerleme({
  deger,
  toplam,
  ton,
  className = "",
}: {
  deger: number;
  toplam: number;
  /** Verilmezse dolulugun kendisine gore seciliyor. */
  ton?: Ton;
  className?: string;
}) {
  const oran = toplam > 0 ? deger / toplam : 0;
  const secilen: Ton =
    ton ?? (oran >= 1 ? "uyari" : oran >= 0.75 ? "basari" : "notr");
  const renk: Record<Ton, string> = {
    notr: "bg-yesil",
    basari: "bg-basari",
    uyari: "bg-uyari",
    tehlike: "bg-tehlike",
    bilgi: "bg-bilgi",
    vurgu: "bg-lime-rozet",
    sessiz: "bg-panel-cizgi-guclu",
  };

  return (
    <span
      role="progressbar"
      aria-valuenow={deger}
      aria-valuemin={0}
      aria-valuemax={toplam}
      className={`block h-1.5 overflow-hidden rounded-full bg-panel-cizgi ${className}`}
    >
      <span
        className={`block h-full rounded-full transition-[width] duration-300 ${renk[secilen]}`}
        style={{ width: `${Math.min(100, Math.max(0, oran * 100))}%` }}
      />
    </span>
  );
}

/* --------------------------------------------------------------- sekme */

/**
 * Adres cubuguna yazan sekme seridi.
 *
 * Baglanti olarak uretiliyor, dugme olarak degil: sekme secimi adreste
 * durdugu icin bir kayda girip geri donuldugunde ayni liste geliyor ve
 * ekran baglanti olarak paylasilabiliyor.
 */
export function SekmeSeridi({
  sekmeler,
  className = "",
}: {
  sekmeler: {
    anahtar: string;
    etiket: string;
    yol: string;
    sayi?: number;
    aktif: boolean;
  }[];
  className?: string;
}) {
  return (
    <nav
      className={`flex flex-wrap items-center gap-1 rounded-panel border border-panel-cizgi bg-panel-yuzey p-1 shadow-panel ${className}`}
    >
      {sekmeler.map((s) => (
        <Link
          key={s.anahtar}
          href={s.yol}
          aria-current={s.aktif ? "page" : undefined}
          className={`inline-flex items-center gap-1.5 rounded-panel-sm px-3 py-1.5 font-baslik text-sm font-semibold transition-colors ${
            s.aktif
              ? "bg-yesil-koyu text-white"
              : "text-panel-soluk hover:bg-panel-yuzey-alt hover:text-murekkep"
          }`}
        >
          {s.etiket}
          {s.sayi !== undefined && (
            <span
              className={`rounded-full px-1.5 text-[0.7rem] font-bold tabular-nums leading-5 ${
                s.aktif ? "bg-white/20 text-white" : "bg-panel-zemin text-panel-soluk"
              }`}
            >
              {s.sayi}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}

/* ----------------------------------------------------------- bos durum */

/** Icerik yokken gosterilen kutu. */
export function BosDurum({
  baslik,
  aciklama,
  ikon,
  cocuklar,
  className = "",
}: {
  baslik: string;
  aciklama?: string;
  ikon?: ReactNode;
  cocuklar?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-panel border border-dashed border-panel-cizgi-guclu bg-panel-yuzey px-6 py-14 text-center ${className}`}
    >
      <span className="mx-auto grid size-11 place-items-center rounded-full bg-panel-zemin text-panel-silik">
        {ikon ?? <Ikon.Grup boyut={22} />}
      </span>
      <p className="mt-3 font-baslik text-base font-bold text-murekkep">
        {baslik}
      </p>
      {aciklama && (
        <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-panel-soluk">
          {aciklama}
        </p>
      )}
      {cocuklar && <div className="mt-4 flex justify-center">{cocuklar}</div>}
    </div>
  );
}

/* -------------------------------------------------------------- sayilar */

/**
 * Sayisal gosterge kutusu.
 *
 * Panelin ust seridinde yan yana duruyorlar; hepsi ayni yukseklikte olsun
 * diye ic yapi sabit: kucuk etiket, buyuk sayi, tek satir alt aciklama.
 */
export function Sayac({
  etiket,
  deger,
  alt,
  ikon,
  ton = "notr",
  vurgu = false,
  yol,
}: {
  etiket: string;
  deger: string | number;
  alt?: ReactNode;
  ikon?: ReactNode;
  ton?: Ton;
  /** Geriye donuk uyum: `vurgu` verilirse ton "uyari" sayiliyor. */
  vurgu?: boolean;
  /** Verilirse kutu tiklanabilir olur. */
  yol?: string;
}) {
  const secilen: Ton = vurgu && ton === "notr" ? "uyari" : ton;
  const vurgulu = secilen !== "notr";

  const kenar: Record<Ton, string> = {
    notr: "border-panel-cizgi",
    basari: "border-basari/30",
    uyari: "border-uyari/35",
    tehlike: "border-tehlike/35",
    bilgi: "border-bilgi/30",
    vurgu: "border-yesil/40",
    sessiz: "border-panel-cizgi",
  };
  const ikonZemin: Record<Ton, string> = {
    notr: "bg-panel-zemin text-panel-soluk",
    basari: "bg-basari-zemin text-basari",
    uyari: "bg-uyari-zemin text-uyari",
    tehlike: "bg-tehlike-zemin text-tehlike",
    bilgi: "bg-bilgi-zemin text-bilgi",
    vurgu: "bg-lime-rozet/40 text-yesil-derin",
    sessiz: "bg-panel-zemin text-panel-silik",
  };

  const govde = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-panel-soluk">{etiket}</p>
        {ikon && (
          <span
            className={`grid size-7 shrink-0 place-items-center rounded-panel-sm ${ikonZemin[secilen]}`}
          >
            {ikon}
          </span>
        )}
      </div>
      <p className="mt-1.5 font-baslik text-2xl font-bold leading-none tabular-nums text-murekkep">
        {deger}
      </p>
      {alt && (
        <p
          className={`mt-1.5 text-xs leading-snug ${
            vurgulu ? "font-medium text-murekkep" : "text-panel-silik"
          }`}
        >
          {alt}
        </p>
      )}
    </>
  );

  const sinif = `rounded-panel border bg-panel-yuzey p-4 shadow-panel ${kenar[secilen]}`;

  if (yol) {
    return (
      <Link
        href={yol}
        className={`${sinif} block transition-colors hover:border-yesil-koyu/40 hover:bg-panel-yuzey-alt`}
      >
        {govde}
      </Link>
    );
  }
  return <div className={sinif}>{govde}</div>;
}

/* -------------------------------------------------------------- ayrinti */

/** Ad/deger satiri. Kunye ve ayar kutularinda kullaniliyor. */
export function Satir({
  etiket,
  children,
}: {
  etiket: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-panel-cizgi py-2 last:border-b-0">
      <dt className="text-xs font-medium text-panel-soluk">{etiket}</dt>
      <dd className="text-right text-sm font-medium text-murekkep">
        {children || <span className="text-panel-silik">—</span>}
      </dd>
    </div>
  );
}
