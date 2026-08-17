"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { tarayiciIstemcisi } from "@/lib/supabase/client";
import { Ikon } from "@/components/ui/ikon";

/**
 * Cikis. Giris gibi istemcide yapiliyor: `@supabase/ssr` tarayici istemcisi
 * oturum cerezlerini kendisi siliyor.
 */
export function CikisButonu() {
  const yonlendirici = useRouter();
  const [bekliyor, basla] = useTransition();

  function cik() {
    basla(async () => {
      await tarayiciIstemcisi().auth.signOut();
      // Sunucu bilesenleri hala oturumlu halini onbellekte tutuyor.
      yonlendirici.refresh();
      yonlendirici.replace("/kampus/giris");
    });
  }

  return (
    <button
      type="button"
      onClick={cik}
      disabled={bekliyor}
      aria-label="Çıkış yap"
      title="Çıkış yap"
      className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-cizgi text-murekkep-soluk transition-colors hover:border-yesil hover:text-yesil-koyu disabled:opacity-50"
    >
      <Ikon.Cikis boyut={18} />
    </button>
  );
}
