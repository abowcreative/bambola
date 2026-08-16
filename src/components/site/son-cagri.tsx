import { ButonLink } from "@/components/ui/buton";
import { Ikon } from "@/components/ui/ikon";
import { Belir } from "./bolum";

/** Sayfa sonu cagri blogu. Kol rengine gore kendini boyar. */
export function SonCagri({
  baslik = "Çocuğunuza uygun grubu birlikte bulalım",
  aciklama = "Doğum tarihini girin, yaşına uygun bütün seçenekleri görün. Birkaç dakika sürer.",
  butonMetni = "Kayıt formunu doldur",
  href = "/kayit",
}: {
  baslik?: string;
  aciklama?: string;
  butonMetni?: string;
  href?: string;
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
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <ButonLink href={href} gorunum="yumusak" olcu="lg">
            {butonMetni}
            <Ikon.Ok boyut={19} />
          </ButonLink>
        </div>
      </Belir>
    </section>
  );
}
