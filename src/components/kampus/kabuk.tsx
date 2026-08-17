import Link from "next/link";
import { MARKA } from "@/lib/site";
import { MarkaLogosu } from "@/components/site/marka-logosu";
import { Ikon } from "@/components/ui/ikon";
import type { Oturum, Rol } from "@/lib/kampus/oturum";
import { CikisButonu } from "./cikis-butonu";

/**
 * Panel kabugu: ust cubuk, gezinme, icerik alani.
 *
 * Menu ROLE GORE uretiliyor. Ama bu yalniz gorunum: bir ogretmen adres
 * cubuguna /kampus/basvurular yazarsa menude gormemesi onu durdurmaz.
 * Asil engel her sayfanin basindaki `rolZorunlu()` cagrisi ve veritabani
 * RLS politikalari.
 */

type MenuOgesi = { ad: string; yol: string; roller: Rol[] };

const MENU: MenuOgesi[] = [
  { ad: "Başvurular", yol: "/kampus/basvurular", roller: ["admin"] },
  { ad: "Öğrenciler", yol: "/kampus/ogrenciler", roller: ["admin"] },
  { ad: "Program", yol: "/kampus/programim", roller: ["admin", "ogretmen"] },
  { ad: "Çocuğum", yol: "/kampus/cocugum", roller: ["veli"] },
];

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
  const menu = MENU.filter((m) => m.roller.includes(oturum.rol));

  return (
    <div className="min-h-dvh bg-krem">
      <header className="sticky top-0 z-40 border-b-2 border-cizgi bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link href="/kampus" className="flex shrink-0 items-center gap-2.5">
            <MarkaLogosu boyut={36} />
            <span className="hidden font-baslik text-lg font-bold leading-none text-yesil-koyu sm:block">
              {MARKA.ad}
              <span className="ml-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-murekkep-soluk">
                Kampüs
              </span>
            </span>
          </Link>

          <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
            {menu.map((m) => {
              const aktif =
                aktifYol === m.yol || aktifYol.startsWith(`${m.yol}/`);
              return (
                <Link
                  key={m.yol}
                  href={m.yol}
                  aria-current={aktif ? "page" : undefined}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 font-baslik text-sm font-semibold transition-colors ${
                    aktif
                      ? "bg-yesil-koyu text-white"
                      : "text-murekkep-soluk hover:bg-krem-koyu hover:text-murekkep"
                  }`}
                >
                  {m.ad}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
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
      <div>
        <h1 className="font-baslik text-2xl font-bold text-murekkep sm:text-3xl">
          {baslik}
        </h1>
        {aciklama && (
          <p className="mt-1.5 text-murekkep-soluk">{aciklama}</p>
        )}
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
