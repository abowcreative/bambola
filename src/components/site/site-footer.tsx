import Link from "next/link";
import { FOOTER_MENU } from "@/lib/nav";
import {
  ILETISIM,
  MARKA,
  MEB_IFADESI,
  napAdi,
  saatSatirlari,
  whatsappBaglantisi,
} from "@/lib/site";
import { YASAL_SAYFALAR } from "@/lib/yasal";
import { Ikon } from "@/components/ui/ikon";
import { MarkaLogosu } from "./marka-logosu";

/**
 * PLAN.md Bolum 5, Yerel SEO:
 * NAP bilgisi (isim, adres, telefon) her sayfanin footer'inda BIREBIR ayni yazilir.
 * Isim `napAdi()`'den geliyor: Google kaydindaki ad + parantez icinde tuzel ad.
 * Elle yazilmaz, yoksa Google kaydi degistiginde burasi geride kalir.
 *
 * Teyit edilmemis kanal hic basilmaz (Bolum 3 madde 5).
 */
export function SiteFooter() {
  const wa = whatsappBaglantisi();
  const yil = 2026;

  return (
    <footer className="mt-24 border-t-4 border-yesil bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.3fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-3">
              <MarkaLogosu boyut={56} />
              <div className="leading-tight">
                <p className="font-baslik text-xl font-semibold text-yesil-koyu">
                  {MARKA.ad}
                </p>
                <p className="text-xs uppercase tracking-[0.14em] text-murekkep-soluk">
                  {MARKA.altBaslik}
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-xs text-sm leading-relaxed text-murekkep-soluk">
              {MARKA.ilce}, {MARKA.sehir}. Oyun grupları, atölyeler, doğum günü
              ve anaokulu. 6 aydan 5 yaşa, küçük gruplar.
            </p>

            <address className="mt-5 space-y-2 text-sm not-italic text-murekkep-soluk">
              <p className="font-medium text-murekkep">{napAdi()}</p>
              {MEB_IFADESI && (
                <p className="inline-flex items-center gap-1.5 rounded-full bg-yesil-koyu px-3 py-1 text-xs font-semibold text-white">
                  <Ikon.Rozet boyut={13} />
                  {MEB_IFADESI}
                </p>
              )}
              {ILETISIM.adres && (
                <p className="flex items-start gap-2">
                  <Ikon.Konum boyut={17} className="mt-0.5 shrink-0" />
                  <span>{ILETISIM.adres}</span>
                </p>
              )}
              {ILETISIM.telefon && (
                <p className="flex items-center gap-2">
                  <Ikon.Telefon boyut={17} className="shrink-0" />
                  <a
                    href={`tel:${ILETISIM.telefon.replace(/\s/g, "")}`}
                    className="hover:text-yesil-koyu"
                  >
                    {ILETISIM.telefon}
                  </a>
                </p>
              )}
              {ILETISIM.eposta && (
                <p className="flex items-center gap-2">
                  <Ikon.Posta boyut={17} className="shrink-0" />
                  <a
                    href={`mailto:${ILETISIM.eposta}`}
                    className="hover:text-yesil-koyu"
                  >
                    {ILETISIM.eposta}
                  </a>
                </p>
              )}
            </address>

            {/* Calisma saatleri: yerel aramada en cok sorulan bilgi. */}
            <dl className="mt-5 space-y-1 text-sm text-murekkep-soluk">
              <dt className="flex items-center gap-2 font-medium text-murekkep">
                <Ikon.Saat boyut={17} className="shrink-0" />
                Çalışma saatleri
              </dt>
              {saatSatirlari().map((s) => (
                <dd key={s.gunler} className="flex justify-between gap-4 pl-6">
                  <span>{s.gunler}</span>
                  <span className="tabular-nums">{s.saat}</span>
                </dd>
              ))}
            </dl>

            {(wa || ILETISIM.instagram) && (
              <div className="mt-5 flex gap-2">
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp'tan yazın"
                    className="grid size-11 place-items-center rounded-full border-2 border-cizgi text-yesil-koyu transition-colors hover:bg-lime-rozet"
                  >
                    <Ikon.Whatsapp boyut={20} />
                  </a>
                )}
                {ILETISIM.instagram && (
                  <a
                    href={ILETISIM.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram hesabımız"
                    className="grid size-11 place-items-center rounded-full border-2 border-cizgi text-yesil-koyu transition-colors hover:bg-lime-rozet"
                  >
                    <Ikon.Instagram boyut={20} />
                  </a>
                )}
              </div>
            )}
          </div>

          {FOOTER_MENU.map((sutun) => (
            <nav key={sutun.baslik} aria-label={sutun.baslik}>
              <h2 className="font-baslik text-sm font-semibold uppercase tracking-[0.12em] text-murekkep">
                {sutun.baslik}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {sutun.ogeler.map((oge) => (
                  <li key={oge.href}>
                    <Link
                      href={oge.href}
                      className="text-sm text-murekkep-soluk transition-colors hover:text-yesil-koyu"
                    >
                      {oge.ad}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-cizgi pt-6 text-xs text-murekkep-soluk lg:flex-row lg:items-center lg:justify-between">
          <p>
            {yil} {MARKA.ad}. {MARKA.tuzelAdOyunEvi} ve {MARKA.tuzelAdAnaokulu}{" "}
            markasıdır.
          </p>
          {/* Yasal metinlerin tamami tek kaynaktan, bkz. lib/yasal.ts */}
          <nav aria-label="Yasal metinler">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {YASAL_SAYFALAR.map((s) => (
                <li key={s.yol}>
                  <Link href={s.yol} className="hover:text-yesil-koyu">
                    {s.ad}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
