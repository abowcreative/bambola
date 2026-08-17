import Link from "next/link";
import { DinamikIkon, Ikon } from "@/components/ui/ikon";
import type { Modul } from "@/lib/kampus/moduller";
import { Kutu } from "./kabuk";

/**
 * Henuz calismayan modulun ekrani.
 *
 * Neden bos bir "yakinda" sayfasi degil: panelde bir ekran acilip veri
 * girilebiliyor gorunurse, girilen veri kaybolur. Bu ekran acikca neyin
 * eksik oldugunu ve bu arada isin nasil yurudugunu soyluyor.
 */
export function Hazirlaniyor({
  modul,
  suAn,
}: {
  modul: Modul;
  /** Bu modul olmadan is nasil yurutuluyor. */
  suAn?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <Kutu>
        <div className="flex gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-krem-koyu text-murekkep-soluk">
            <DinamikIkon ad={modul.ikon} boyut={22} />
          </span>
          <div className="min-w-0">
            <h1 className="font-baslik text-xl font-bold text-murekkep">
              {modul.ad}
            </h1>
            <p className="mt-1 leading-relaxed text-murekkep-soluk">
              {modul.ozet}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-kart border-2 border-dashed border-cizgi bg-krem px-4 py-3.5">
          <p className="font-baslik text-sm font-bold text-murekkep">
            Bu modül hazırlanıyor
          </p>
          {modul.bekleyen && (
            <p className="mt-1 text-sm leading-relaxed text-murekkep-soluk">
              Bekleyen: {modul.bekleyen}
            </p>
          )}
        </div>

        {suAn && (
          <div className="mt-4">
            <p className="font-baslik text-sm font-bold text-murekkep">
              Bu arada
            </p>
            <div className="mt-1 text-sm leading-relaxed text-murekkep-soluk">
              {suAn}
            </div>
          </div>
        )}

        <Link
          href="/kampus/panel"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-yesil-koyu hover:underline"
        >
          <Ikon.OkGeri boyut={15} />
          Panele dön
        </Link>
      </Kutu>
    </div>
  );
}
