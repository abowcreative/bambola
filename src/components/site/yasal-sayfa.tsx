import Link from "next/link";
import { ekmekKirintisiSemasi, SemaEtiketi } from "@/lib/seo";
import { EkmekKirintisi, SayfaBasligi } from "./bolum-basligi";
import { YASAL_SAYFALAR } from "@/lib/yasal";

/**
 * Yasal metinlerin ortak kabugu.
 *
 * Dort sayfa (KVKK aydinlatma metni, gizlilik, cerez, kullanim kosullari)
 * ayni duzeni paylasiyor. Ortak kabuk olmadan dordu de kendi baslik
 * hiyerarsisini tasiyordu ve biri degistiginde otekiler geride kaliyordu.
 *
 * Altta HEP diger yasal sayfalarin listesi duruyor: veli birini acinca
 * otekileri de gorsun, footer'a geri donmek zorunda kalmasin.
 */
export function YasalSayfa({
  yol,
  baslik,
  aciklama,
  uyari,
  children,
}: {
  yol: string;
  baslik: string;
  aciklama: string;
  /** Eksik bilgi veya taslak uyarisi. Varsa metnin en ustunde durur. */
  uyari?: React.ReactNode;
  children: React.ReactNode;
}) {
  const kirinti = [
    { ad: "Ana sayfa", yol: "/" },
    { ad: baslik, yol },
  ];

  return (
    <div data-kol="anaokulu">
      <SemaEtiketi sema={ekmekKirintisiSemasi(kirinti)} />
      <EkmekKirintisi ogeler={kirinti} />

      <SayfaBasligi ustBaslik="Yasal" baslik={baslik} aciklama={aciklama} />

      {/*
        Yasal metin BELIR SARMALAYICISINDA DEGIL.
        Belir kaydirmayla acilan bir animasyon; metin ilk boyamada opaklik 0
        ile duruyordu ve 3000 piksellik bir metnin tamami kaydirilana kadar
        gorunmuyordu. Yasal bir metnin "kaydirinca gorunmesi" kabul edilemez:
        acildigi anda okunabilir olmali.
      */}
      {/*
        Genislik 6xl kapsayici + 3xl metin: metin sol kenardan basligin
        hizasinda basliyor. Dogrudan `mx-auto max-w-3xl` verilince metin
        ortalanip basligin sagina kayiyordu.
      */}
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="max-w-3xl">
          {uyari && (
            <div className="mb-8 rounded-kart border-2 border-dashed border-cizgi bg-white p-5 text-sm leading-relaxed text-murekkep-soluk">
              {uyari}
            </div>
          )}

          <div className="leading-relaxed text-murekkep-soluk">{children}</div>

          <nav
            aria-label="Diğer yasal metinler"
            className="mt-12 border-t border-cizgi pt-6"
          >
            <h2 className="font-baslik text-sm font-semibold uppercase tracking-[0.12em] text-murekkep">
              Diğer yasal metinler
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {YASAL_SAYFALAR.filter((s) => s.yol !== yol).map((s) => (
                <li key={s.yol}>
                  <Link
                    href={s.yol}
                    className="font-medium text-[var(--kol-koyu)] underline underline-offset-2"
                  >
                    {s.ad}
                  </Link>
                  <span className="text-murekkep-soluk"> — {s.ozet}</span>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

/** Yasal metin icinde bolum basligi. */
export function YasalBaslik({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 font-baslik text-xl font-bold text-murekkep">
      {children}
    </h2>
  );
}

/** Madde listesi. */
export function YasalListe({ ogeler }: { ogeler: React.ReactNode[] }) {
  return (
    <ul className="mt-3 list-disc space-y-2 pl-5">
      {ogeler.map((o, i) => (
        <li key={i}>{o}</li>
      ))}
    </ul>
  );
}

/** Alan-aciklama tablosu. Hangi veriyi neden aldigimizi anlatan bloklar. */
export function YasalTablo({ satirlar }: { satirlar: [string, string][] }) {
  return (
    <dl className="mt-5 divide-y divide-cizgi overflow-hidden rounded-kart border-2 border-cizgi bg-white">
      {satirlar.map(([alan, aciklama]) => (
        <div key={alan} className="px-5 py-4">
          <dt className="font-medium text-murekkep">{alan}</dt>
          <dd className="mt-1 text-sm">{aciklama}</dd>
        </div>
      ))}
    </dl>
  );
}
