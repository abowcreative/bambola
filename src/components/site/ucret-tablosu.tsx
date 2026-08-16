import Link from "next/link";
import type { ProgramAilesi } from "@/lib/data/types";
import {
  tlYaz,
  indirimYuzdesi,
  erkenKayitGosterilirMi,
} from "@/lib/data/ucretler";
import { Ikon, DinamikIkon } from "@/components/ui/ikon";
import { SiraliOge } from "./bolum";

/**
 * Bir program ailesinin ucret karti. PLAN.md Bolum 6.3.
 * Tek sefer satirinda indirim rozeti GOSTERILMEZ, cunku Excel'de tek sefer
 * fiyatina indirim uygulanmiyor.
 *
 * `kampanyaAcik` cagiran sunucu bileseninden gelir. Kampanya kapaninca
 * ustu cizili fiyat da, indirim rozeti de kendiliginden kaybolur.
 */
export function UcretKarti({
  aile,
  kampanyaAcik,
}: {
  aile: ProgramAilesi;
  kampanyaAcik: boolean;
}) {
  const indirimli = (p: (typeof aile.paketler)[number]) =>
    erkenKayitGosterilirMi(p, kampanyaAcik);

  return (
    <SiraliOge className="flex h-full flex-col rounded-kart border-2 border-cizgi bg-white p-6 transition-all duration-200 ease-yayli hover:-translate-y-1 hover:border-yesil hover:shadow-kart-hover">
      <div className="flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-lime-rozet text-black">
          <DinamikIkon ad={aile.ikon} boyut={24} />
        </span>
        <div className="min-w-0">
          <h3 className="font-baslik text-xl font-bold text-murekkep">
            {aile.ad}
          </h3>
          <p className="mt-0.5 text-sm text-murekkep-soluk">{aile.yasEtiket}</p>
        </div>
      </div>

      <p className="mt-4 inline-flex self-start rounded-full bg-yesil-koyu px-3 py-1 text-xs font-bold text-white">
        {aile.sure}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-murekkep-soluk">
        {aile.ozet}
      </p>

      <ul className="mt-5 space-y-2.5 border-t border-cizgi pt-5">
        {aile.paketler.map((p) => (
          <li key={p.kod} className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-murekkep">{p.etiket}</span>
            <span className="text-right">
              {indirimli(p) ? (
                <>
                  <s className="mr-2 text-xs text-murekkep-soluk">
                    {tlYaz(p.normal)}
                  </s>
                  <span className="font-baslik font-bold tabular-nums text-yesil-koyu">
                    {tlYaz(p.erkenKayit)}
                  </span>
                </>
              ) : (
                <span className="font-baslik font-bold tabular-nums text-murekkep">
                  {tlYaz(p.normal)}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {aile.paketler.some(indirimli) && (
        <p className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full bg-lime-rozet px-3 py-1 text-xs font-semibold text-black">
          <Ikon.Yildiz boyut={13} />
          Erken kayıtta yüzde{" "}
          {indirimYuzdesi(aile.paketler.find(indirimli)!)} indirim
        </p>
      )}

      {aile.notlar.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {aile.notlar.map((n) => (
            <li key={n} className="flex gap-2 text-xs text-murekkep-soluk">
              <Ikon.Tik boyut={14} className="mt-0.5 shrink-0 text-yesil" />
              {n}
            </li>
          ))}
        </ul>
      )}

      <Link
        href={`/kayit?program=${aile.slug}`}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border-2 border-yesil px-5 py-2.5 font-baslik font-semibold text-yesil-koyu transition-all duration-200 ease-yayli hover:-translate-y-0.5 hover:bg-lime-rozet hover:text-black"
      >
        Bu programa kaydol
        <Ikon.Ok boyut={17} />
      </Link>
    </SiraliOge>
  );
}
