import type { Metadata } from "next";
import Link from "next/link";
import { MARKA } from "@/lib/site";
import { ANA_MENU } from "@/lib/nav";
import { ButonLink } from "@/components/ui/buton";
import { Ikon } from "@/components/ui/ikon";
import { Belir } from "@/components/site/bolum";
import { Tavsan } from "@/components/site/karakterler";

/**
 * 404. Kok layout icinde render edildigi icin header ve footer duruyor;
 * ziyaretci cikmaza dusmuyor.
 *
 * Sayfa yanlis linkten gelen ziyaretciyi iki sey yapmaya cagiriyor: ya kayit
 * formuna gitmek ya da aradigi bolume atlamak. PLAN.md Bolum 1: "sitenin tek
 * isi ziyaretciyi doldurulmus bir kayit formuna tasimak" -- 404 de bunun
 * disinda degil.
 *
 * `robots: noindex`: bulunamayan sayfanin dizine girmesi anlamsiz.
 */
export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
  robots: { index: false, follow: true },
};

export default function BulunamadiSayfasi() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
      <Belir>
        <span
          aria-hidden="true"
          className="sallan mx-auto grid size-28 place-items-center rounded-full border-4 border-white bg-krem-koyu shadow-kart"
        >
          <Tavsan boyut={72} className="text-yesil-derin" dolgu="#ffffff" />
        </span>

        {/* Lime denendi ama krem zeminde neredeyse gorunmuyordu; sayi
            dekoratif olsa da okunur olmali. */}
        <p className="mt-8 font-baslik text-6xl font-bold text-yesil sm:text-7xl">
          404
        </p>
        <h1 className="mt-2 font-baslik text-3xl font-bold text-murekkep sm:text-4xl">
          Bu sayfayı bulamadık
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-murekkep-soluk">
          Adres değişmiş ya da yanlış yazılmış olabilir. {MARKA.ad} yerinde
          duruyor, aşağıdan devam edebilirsiniz.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButonLink href="/kayit" olcu="lg">
            Çocuğuma uygun grubu bul
            <Ikon.Ok boyut={19} />
          </ButonLink>
          <ButonLink href="/" gorunum="cizgili" olcu="lg">
            Ana sayfaya dön
          </ButonLink>
        </div>
      </Belir>

      <Belir gecikme={0.1} className="mt-14">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-murekkep-soluk">
          Belki bunu arıyordunuz
        </p>
        <ul className="mt-4 flex flex-wrap justify-center gap-2.5">
          {ANA_MENU.map((o) => (
            <li key={o.href}>
              <Link
                href={o.href}
                className="inline-flex rounded-full border-2 border-cizgi bg-white px-4 py-2 font-medium text-murekkep transition-colors hover:border-yesil hover:text-yesil-koyu"
              >
                {o.ad}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/mekan"
              className="inline-flex rounded-full border-2 border-cizgi bg-white px-4 py-2 font-medium text-murekkep transition-colors hover:border-yesil hover:text-yesil-koyu"
            >
              Mekân
            </Link>
          </li>
        </ul>
      </Belir>
    </section>
  );
}
