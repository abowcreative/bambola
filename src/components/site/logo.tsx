import Link from "next/link";
import { MarkaLogosu } from "./marka-logosu";
import { MARKA } from "@/lib/site";

/**
 * Ana logo. Kaynak PDF'ten cikarilmis gercek vektor, bkz. PLAN.md Bolum 14 madde 8.
 * priority: header'da her sayfada gorunur, LCP adayidir.
 */
export function Logo({
  boyut = 52,
  yaziliMi = true,
  className = "",
}: {
  boyut?: number;
  yaziliMi?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label={`${MARKA.ad} ana sayfa`}
      className={`group flex shrink-0 items-center gap-3 ${className}`}
    >
      <MarkaLogosu
        boyut={boyut}
        oncelikli
        className="transition-transform duration-300 ease-yayli group-hover:rotate-[8deg] group-hover:scale-105"
      />
      {yaziliMi && (
        <span className="hidden leading-none sm:block">
          <span className="block font-baslik text-xl font-semibold tracking-tight text-yesil-koyu">
            {MARKA.ad}
          </span>
          <span className="block text-[0.68rem] font-medium uppercase tracking-[0.16em] text-murekkep-soluk">
            {MARKA.ilce}
          </span>
        </span>
      )}
    </Link>
  );
}
