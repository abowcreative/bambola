import type { Metadata } from "next";
import { ButonLink } from "@/components/ui/buton";
import { Ikon } from "@/components/ui/ikon";
import { MarkaLogosu } from "@/components/site/marka-logosu";
import { ILETISIM, whatsappBaglantisi } from "@/lib/site";
import { Belir } from "@/components/site/bolum";
import { Konfeti } from "@/components/site/konfeti";
import { Ayi } from "@/components/site/karakterler";
import { DonusumOlayi } from "./donusum-olayi";

export const metadata: Metadata = {
  title: "Talebiniz bize ulaştı",
  description: "Kayıt talebiniz alındı, en kısa sürede size döneceğiz.",
  robots: { index: false, follow: true },
};

/**
 * Donusum olcumunun tetiklendigi sayfa. PLAN.md Bolum 7 sonu.
 * Kanal teyit edilmemisse buton hic basilmaz (Bolum 3 madde 5).
 */
export default function TesekkurlerSayfasi() {
  const wa = whatsappBaglantisi(
    "Merhaba, siteden kayıt talebi gönderdim. Bilgi alabilir miyim?",
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-24">
      <DonusumOlayi />
      <Konfeti />

      <Belir>
        <div className="relative mx-auto flex w-full items-end justify-center gap-2">
          <Ayi boyut={140} className="text-yesil-koyu" />
          <MarkaLogosu boyut={72} className="sallan mb-4" />
        </div>

        <h1 className="mt-8 font-baslik text-3xl font-bold text-murekkep sm:text-4xl">
          Talebiniz bize ulaştı
        </h1>

        <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-murekkep-soluk">
          En kısa sürede size döneceğiz. Çocuğunuzun yaşına uygun grubu ve saati
          birlikte netleştireceğiz.
        </p>

        {(wa || ILETISIM.instagram) && (
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {wa && (
              <ButonLink
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                olcu="lg"
              >
                <Ikon.Whatsapp boyut={19} />
                WhatsApp&apos;tan yazın
              </ButonLink>
            )}
            {ILETISIM.instagram && (
              <ButonLink
                href={ILETISIM.instagram}
                target="_blank"
                rel="noopener noreferrer"
                gorunum="cizgili"
                olcu="lg"
              >
                <Ikon.Instagram boyut={19} />
                Instagram
              </ButonLink>
            )}
          </div>
        )}

        <div className="mt-12 border-t border-cizgi pt-8">
          <p className="text-sm text-murekkep-soluk">
            Beklerken programa göz atabilirsiniz.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <ButonLink
              href="/oyun-evi/haftalik-program"
              gorunum="yumusak"
              olcu="sm"
            >
              <Ikon.Takvim boyut={17} />
              Haftalık program
            </ButonLink>
            <ButonLink href="/sss" gorunum="yumusak" olcu="sm">
              Sık sorulan sorular
            </ButonLink>
          </div>
        </div>
      </Belir>
    </div>
  );
}
