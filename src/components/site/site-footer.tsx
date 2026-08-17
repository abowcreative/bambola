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
 * Site alt bilgisi.
 *
 * PLAN.md Bolum 5, Yerel SEO: NAP bilgisi (isim, adres, telefon) her
 * sayfanin footer'inda BIREBIR ayni yazilir. Isim `napAdi()`'den geliyor:
 * Google kaydindaki ad + parantez icinde tuzel ad. Elle yazilmaz, yoksa
 * Google kaydi degistiginde burasi geride kalir.
 *
 * DUZEN, 17 Agustos 2026'da yenilendi (musteri: "footer cok dagimik ve
 * duzensiz"). Onceki hali tek bir sol sutuna yigilmisti: marka, aciklama,
 * NAP, MEB rozeti, adres, telefon, calisma saatleri ve sosyal ikonlar
 * ust uste diziliyor, yanindaki uc menu sutunu ise kisa kaliyordu. Sonuc
 * dengesiz bir blok ve dar sutunda satir satir kirilan saat tablosuydu.
 *
 * Yeni duzen UC SERIT:
 *   1. Marka + kisa tanim + sosyal  |  uc menu sutunu
 *   2. Iletisim (NAP)               |  Calisma saatleri
 *   3. Telif + yasal metinler
 * Her serit kendi cizgisiyle ayriliyor; hicbir sutun otekinin iki kati
 * uzunlugunda degil.
 *
 * Teyit edilmemis kanal hic basilmaz (Bolum 3 madde 5).
 */

const BASLIK_SINIFI =
  "font-baslik text-xs font-semibold uppercase tracking-[0.14em] text-murekkep-soluk";

export function SiteFooter() {
  const wa = whatsappBaglantisi();
  const yil = 2026;
  const telefonYolu = ILETISIM.telefon
    ? `tel:${ILETISIM.telefon.replace(/\s/g, "")}`
    : null;

  return (
    <footer className="mt-24 border-t-4 border-yesil bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* --- 1. serit: marka ve menuler --- */}
        <div className="grid gap-10 py-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <MarkaLogosu boyut={52} />
              <div className="leading-tight">
                <p className="font-baslik text-xl font-semibold text-yesil-koyu">
                  {MARKA.ad}
                </p>
                <p className="text-xs uppercase tracking-[0.14em] text-murekkep-soluk">
                  {MARKA.ilce}, {MARKA.sehir}
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-murekkep-soluk">
              Oyun grupları, atölyeler, doğum günü ve anaokulu. 6 aydan 5 yaşa,
              küçük gruplar.
            </p>

            {MEB_IFADESI && (
              <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-yesil-koyu px-3 py-1 text-xs font-semibold text-white">
                <Ikon.Rozet boyut={13} />
                {MEB_IFADESI}
              </p>
            )}

            {(wa || ILETISIM.instagram) && (
              <div className="mt-5 flex gap-2">
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp'tan yazın"
                    className="grid size-10 place-items-center rounded-full border-2 border-cizgi text-yesil-koyu transition-colors hover:bg-lime-rozet hover:text-black"
                  >
                    <Ikon.Whatsapp boyut={18} />
                  </a>
                )}
                {ILETISIM.instagram && (
                  <a
                    href={ILETISIM.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram hesabımız"
                    className="grid size-10 place-items-center rounded-full border-2 border-cizgi text-yesil-koyu transition-colors hover:bg-lime-rozet hover:text-black"
                  >
                    <Ikon.Instagram boyut={18} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Menuler: telefonda iki, genis ekranda uc sutun. */}
          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-8">
            {FOOTER_MENU.map((sutun) => (
              <nav key={sutun.baslik} aria-label={sutun.baslik}>
                <h2 className={BASLIK_SINIFI}>{sutun.baslik}</h2>
                <ul className="mt-3 space-y-2">
                  {sutun.ogeler.map((oge) => (
                    <li key={oge.href}>
                      <Link
                        href={oge.href}
                        className="text-sm text-murekkep transition-colors hover:text-yesil-koyu"
                      >
                        {oge.ad}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* --- 2. serit: NAP ve calisma saatleri --- */}
        <div className="grid gap-8 border-t border-cizgi py-10 sm:grid-cols-2">
          <div>
            <h2 className={BASLIK_SINIFI}>İletişim</h2>
            <address className="mt-3 space-y-2 text-sm not-italic leading-relaxed text-murekkep-soluk">
              <p className="font-medium text-murekkep">{napAdi()}</p>
              {ILETISIM.adres && (
                <p className="flex items-start gap-2">
                  <Ikon.Konum boyut={16} className="mt-0.5 shrink-0" />
                  <span>{ILETISIM.adres}</span>
                </p>
              )}
              {ILETISIM.telefon && telefonYolu && (
                <p className="flex items-center gap-2">
                  <Ikon.Telefon boyut={16} className="shrink-0" />
                  <a href={telefonYolu} className="hover:text-yesil-koyu">
                    {ILETISIM.telefon}
                  </a>
                </p>
              )}
              {ILETISIM.eposta && (
                <p className="flex items-center gap-2">
                  <Ikon.Posta boyut={16} className="shrink-0" />
                  <a
                    href={`mailto:${ILETISIM.eposta}`}
                    className="hover:text-yesil-koyu"
                  >
                    {ILETISIM.eposta}
                  </a>
                </p>
              )}
            </address>
          </div>

          <div>
            <h2 className={BASLIK_SINIFI}>Çalışma saatleri</h2>
            {/*
              Saatler kendi sutununda: dar bir sutunda "Pazartesi - Cumartesi"
              ile saat yan yana sigmiyor ve satir kiriliyordu.
            */}
            <dl className="mt-3 max-w-xs text-sm text-murekkep-soluk">
              {saatSatirlari().map((s) => (
                <div
                  key={s.gunler}
                  className="flex justify-between gap-4 border-b border-cizgi py-1.5 last:border-b-0"
                >
                  <dt>{s.gunler}</dt>
                  <dd className="tabular-nums font-medium text-murekkep">
                    {s.saat}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* --- 3. serit: telif ve yasal metinler --- */}
        <div className="flex flex-col gap-4 border-t border-cizgi py-6 text-xs text-murekkep-soluk lg:flex-row lg:items-center lg:justify-between">
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
