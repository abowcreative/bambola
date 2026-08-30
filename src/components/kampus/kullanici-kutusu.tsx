"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { tarayiciIstemcisi } from "@/lib/supabase/client";
import { Ikon } from "@/components/ui/ikon";
import { Firildak } from "./ui-istemci";

/**
 * Oturum kutusu: ad, rol ve acilir menu.
 *
 * Sol menunun altinda duruyor, ust cubukta degil. Ust cubuk gun boyu
 * degisen bilgiye ayrildi (hangi sayfadayim, ne yapabilirim); "kimim ve
 * nasil cikarim" sabit bilgi ve sabit yerde durmali.
 */

/** "Ayşe Yılmaz" -> "AY". Tek kelimeyse ilk iki harf. */
function basHarfler(ad: string): string {
  const parcalar = ad.trim().split(/\s+/).filter(Boolean);
  if (parcalar.length === 0) return "?";
  if (parcalar.length === 1) return parcalar[0].slice(0, 2).toLocaleUpperCase("tr-TR");
  return (parcalar[0][0] + parcalar[parcalar.length - 1][0]).toLocaleUpperCase(
    "tr-TR",
  );
}

export function KullaniciKutusu({
  adSoyad,
  eposta,
  rolEtiketi,
  yonetici,
  yon = "yukari",
}: {
  adSoyad: string;
  eposta: string;
  rolEtiketi: string;
  /** Yalniz yoneticiye gosterilen menu satirlari icin. */
  yonetici: boolean;
  /** Menunun acilma yonu. Sol sutunun dibinde yukari, ust cubukta asagi. */
  yon?: "yukari" | "asagi";
}) {
  const yonlendirici = useRouter();
  const kutu = useRef<HTMLDivElement>(null);
  const [acik, setAcik] = useState(false);
  const [bekliyor, basla] = useTransition();

  useEffect(() => {
    if (!acik) return;
    function disari(e: MouseEvent) {
      if (!kutu.current?.contains(e.target as Node)) setAcik(false);
    }
    function tus(e: KeyboardEvent) {
      if (e.key === "Escape") setAcik(false);
    }
    document.addEventListener("mousedown", disari);
    document.addEventListener("keydown", tus);
    return () => {
      document.removeEventListener("mousedown", disari);
      document.removeEventListener("keydown", tus);
    };
  }, [acik]);

  function cik() {
    basla(async () => {
      await tarayiciIstemcisi().auth.signOut();
      // Sunucu bilesenleri hala oturumlu halini onbellekte tutuyor.
      yonlendirici.refresh();
      yonlendirici.replace("/kampus/giris");
    });
  }

  return (
    <div ref={kutu} className="relative">
      <button
        type="button"
        onClick={() => setAcik((a) => !a)}
        aria-expanded={acik}
        aria-haspopup="menu"
        className={`flex w-full items-center gap-2.5 rounded-panel-sm px-2 py-2 text-left transition-colors ${
          acik ? "bg-panel-yuzey-alt" : "hover:bg-panel-yuzey-alt"
        }`}
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-yesil-koyu/10 font-baslik text-xs font-bold text-yesil-derin">
          {basHarfler(adSoyad)}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-semibold text-murekkep">
            {adSoyad}
          </span>
          <span className="block truncate text-xs text-panel-silik">
            {rolEtiketi}
          </span>
        </span>
        <Ikon.OkAsagi
          boyut={15}
          className={`shrink-0 text-panel-silik transition-transform ${acik ? "rotate-180" : ""}`}
        />
      </button>

      {acik && (
        <div
          role="menu"
          className={`absolute right-0 z-40 w-full min-w-56 overflow-hidden rounded-panel border border-panel-cizgi bg-panel-yuzey py-1 shadow-panel-yuksek ${
            yon === "yukari" ? "bottom-full mb-1 left-0" : "top-full mt-1"
          }`}
        >
          <p className="truncate px-3 py-2 text-xs text-panel-silik">
            {eposta}
          </p>
          <div className="my-1 border-t border-panel-cizgi" />

          {yonetici && (
            <>
              <Link
                href="/kampus/ayarlar"
                role="menuitem"
                onClick={() => setAcik(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-murekkep transition-colors hover:bg-panel-yuzey-alt"
              >
                <Ikon.Ampul boyut={15} className="text-panel-silik" />
                Ayarlar
              </Link>
              <Link
                href="/kampus/kullanicilar"
                role="menuitem"
                onClick={() => setAcik(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-murekkep transition-colors hover:bg-panel-yuzey-alt"
              >
                <Ikon.Grup boyut={15} className="text-panel-silik" />
                Kullanıcılar
              </Link>
              <div className="my-1 border-t border-panel-cizgi" />
            </>
          )}

          <button
            type="button"
            role="menuitem"
            onClick={cik}
            disabled={bekliyor}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-tehlike transition-colors hover:bg-tehlike-zemin disabled:opacity-60"
          >
            {bekliyor ? <Firildak /> : <Ikon.Cikis boyut={15} />}
            Çıkış yap
          </button>
        </div>
      )}
    </div>
  );
}
