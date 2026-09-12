import { Belir } from "./bolum";
import { BilgiCagrisi, KayitKanaliNotu } from "./bilgi-cagrisi";

/**
 * Sayfa sonu cagri blogu. Kol rengine gore kendini boyar.
 *
 * Cagri WHATSAPP'a gidiyor, kayit formuna DEGIL: online form yayinda degil
 * (bkz. lib/site.ts KAYIT_FORMU_ACIK). Altindaki not 12 Eylul 2026'ya kadar
 * "online kayit formu cok yakinda aciliyor" diyordu; kurum "online siteden
 * kayit almayacagiz simdilik" deyince not, vaat yerine kanali soyluyor.
 * Bu blok sitenin hemen her sayfasinin altinda oldugu icin not da her yerde.
 */
export function SonCagri({
  baslik = "Çocuğunuza uygun grubu birlikte bulalım",
  aciklama = "Çocuğunuzun yaşına uygun grupları, gün ve saatleri WhatsApp'tan konuşalım.",
  butonMetni = "Detaylı bilgi al",
  grup,
  atolye,
}: {
  baslik?: string;
  aciklama?: string;
  butonMetni?: string;
  grup?: string;
  atolye?: string;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <Belir className="relative overflow-hidden rounded-blok bg-[var(--kol-ana)] px-6 py-14 text-center sm:px-12">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -left-10 -top-10 size-48 rounded-full bg-[var(--kol-vurgu)] blur-2xl" />
          <div className="absolute -bottom-16 -right-6 size-56 rounded-full bg-[var(--kol-vurgu)] blur-2xl" />
        </div>

        <h2 className="relative font-baslik text-3xl font-bold text-white sm:text-4xl">
          {baslik}
        </h2>
        <p className="relative mx-auto mt-4 max-w-lg text-lg leading-relaxed text-white/90">
          {aciklama}
        </p>
        <div className="relative mt-8 flex flex-col items-center gap-3">
          <BilgiCagrisi
            grup={grup}
            atolye={atolye}
            metin={butonMetni}
            gorunum="yumusak"
            olcu="lg"
          />
          <KayitKanaliNotu />
        </div>
      </Belir>
    </section>
  );
}
