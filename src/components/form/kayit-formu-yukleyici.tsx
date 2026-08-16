"use client";

import dynamic from "next/dynamic";

/**
 * Form yalniz istemcide yuklenir.
 *
 * Gerekce: form, oturum deposundan geri yukleniyor. Sunucuda bos, istemcide
 * dolu olsaydi hidrasyon uyusmazligi cikardi. Istemci tarafinda yukleyerek
 * hem uyusmazlik hem de effect icinde setState (React 19 kaskad render
 * uyarisi) tamamen ortadan kalkiyor.
 *
 * SEO: sayfanin H1'i ve tanitim metni sunucuda uretiliyor (kayit/page.tsx),
 * yani tarayici ve arama motoru bos sayfa gormuyor.
 */
const KayitFormu = dynamic(
  () => import("./kayit-formu").then((m) => m.KayitFormu),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="h-2.5 w-full rounded-full bg-krem-koyu" />
        <div className="mt-8 space-y-4">
          <div className="h-12 w-2/3 rounded-yumusak bg-krem-koyu" />
          <div className="h-14 w-full rounded-yumusak bg-krem-koyu" />
          <div className="h-14 w-full rounded-yumusak bg-krem-koyu" />
        </div>
        <p className="sr-only">Form yükleniyor</p>
      </div>
    ),
  },
);

export function KayitFormuYukleyici({
  onProgram,
  onKurum,
}: {
  onProgram?: string;
  onKurum?: string;
}) {
  return <KayitFormu onProgram={onProgram} onKurum={onKurum} />;
}
