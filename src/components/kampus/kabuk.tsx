import Link from "next/link";
import { MARKA } from "@/lib/site";
import { MarkaLogosu } from "@/components/site/marka-logosu";
import { Ikon } from "@/components/ui/ikon";
import type { Oturum, Rol } from "@/lib/kampus/oturum";
import { rolunGruplari } from "@/lib/kampus/moduller";
import { CikisButonu } from "./cikis-butonu";
import { MenuCekmecesi, YanMenuSutunu } from "./yan-menu";

/**
 * Panel kabugu: ust cubuk, sol menu, icerik alani.
 *
 * Menu ROLE GORE uretiliyor (lib/kampus/moduller.ts). Ama bu yalniz gorunum:
 * bir ogretmen adres cubuguna /kampus/cari yazarsa menude gormemesi onu
 * durdurmaz. Asil engel her sayfanin basindaki `rolZorunlu()` ve veritabani
 * RLS politikalari.
 */

const ROL_ETIKET: Record<Rol, string> = {
  admin: "Yönetici",
  ogretmen: "Öğretmen",
  veli: "Veli",
};

export function Kabuk({
  oturum,
  aktifYol,
  children,
}: {
  oturum: Oturum;
  aktifYol: string;
  children: React.ReactNode;
}) {
  const gruplar = rolunGruplari(oturum.rol);

  return (
    <div className="min-h-dvh bg-krem">
      <header className="sticky top-0 z-40 border-b-2 border-cizgi bg-white">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <MenuCekmecesi gruplar={gruplar} aktifYol={aktifYol} />

          <Link href="/kampus" className="flex shrink-0 items-center gap-2.5">
            <MarkaLogosu boyut={32} />
            <span className="font-baslik text-base font-bold leading-none text-yesil-koyu">
              {MARKA.ad}
              <span className="ml-1.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-murekkep-soluk">
                Kampüs
              </span>
            </span>
          </Link>

          <div className="ml-auto flex shrink-0 items-center gap-3">
            <span className="hidden text-right leading-tight sm:block">
              <span className="block text-sm font-medium text-murekkep">
                {oturum.adSoyad}
              </span>
              <span className="block text-xs text-murekkep-soluk">
                {ROL_ETIKET[oturum.rol]}
              </span>
            </span>
            <CikisButonu />
          </div>
        </div>
      </header>

      <div className="flex">
        <YanMenuSutunu gruplar={gruplar} aktifYol={aktifYol} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

/** Sayfa basligi ve sag tarafa cagri alani. */
export function SayfaBasi({
  baslik,
  aciklama,
  cocuklar,
}: {
  baslik: string;
  aciklama?: string;
  cocuklar?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-baslik text-2xl font-bold text-murekkep">
          {baslik}
        </h1>
        {aciklama && <p className="mt-1 text-murekkep-soluk">{aciklama}</p>}
      </div>
      {cocuklar}
    </div>
  );
}

/** Icerik yokken gosterilen kutu. */
export function BosDurum({
  baslik,
  aciklama,
}: {
  baslik: string;
  aciklama: string;
}) {
  return (
    <div className="rounded-blok border-2 border-dashed border-cizgi bg-white px-6 py-16 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-krem-koyu text-murekkep-soluk">
        <Ikon.Grup boyut={24} />
      </span>
      <p className="mt-4 font-baslik text-lg font-bold text-murekkep">
        {baslik}
      </p>
      <p className="mx-auto mt-1.5 max-w-sm leading-relaxed text-murekkep-soluk">
        {aciklama}
      </p>
    </div>
  );
}

/** Panel kutusu. Baslik + icerik, her modulde ayni cerceve. */
export function Kutu({
  baslik,
  yanCocuk,
  className = "",
  children,
}: {
  baslik?: string;
  yanCocuk?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-blok border-2 border-cizgi bg-white p-5 ${className}`}
    >
      {baslik && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-baslik text-base font-bold text-murekkep">
            {baslik}
          </h2>
          {yanCocuk}
        </div>
      )}
      {children}
    </section>
  );
}

/** Sayisal gosterge. */
export function Sayac({
  etiket,
  deger,
  alt,
  vurgu = false,
}: {
  etiket: string;
  deger: string | number;
  alt?: string;
  vurgu?: boolean;
}) {
  return (
    <div
      className={`rounded-kart border-2 p-4 ${
        vurgu ? "border-yesil bg-lime-rozet/25" : "border-cizgi bg-white"
      }`}
    >
      <p className="text-xs uppercase tracking-wide text-murekkep-soluk">
        {etiket}
      </p>
      <p className="mt-1 font-baslik text-2xl font-bold tabular-nums text-murekkep">
        {deger}
      </p>
      {alt && <p className="mt-0.5 text-xs text-murekkep-soluk">{alt}</p>}
    </div>
  );
}
