import type { Metadata } from "next";
import { KayitFormuYukleyici } from "@/components/form/kayit-formu-yukleyici";
import { MARKA } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kayıt formu",
  description:
    "Çocuğunuzun doğum tarihini girin, yaşına uygun grupları görün, gün ve saati seçip talebinizi bırakın.",
  alternates: { canonical: "/kayit" },
};

/** Next 16: searchParams bir Promise, await edilir. */
export default async function KayitSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ program?: string; kurum?: string; kaynak?: string }>;
}) {
  const q = await searchParams;

  return (
    <div className="py-8 sm:py-12">
      {/* Sunucuda uretilir: arama motoru ve yavas baglanti bos sayfa gormez. */}
      <header className="mx-auto mb-8 max-w-2xl px-4 sm:px-6">
        <h1 className="font-baslik text-3xl font-bold text-murekkep sm:text-4xl">
          Kayıt formu
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-murekkep-soluk">
          Çocuğunuzun doğum tarihini girin, yaşına uygun grupları birlikte
          görelim. Altı kısa adım, birkaç dakika sürer.
        </p>
        <p className="mt-2 text-sm text-murekkep-soluk">
          {MARKA.ilce}, {MARKA.sehir}. Okula hazırlıkta en fazla 12, diğer gruplarda en fazla 8 çocuk.
        </p>
      </header>

      <KayitFormuYukleyici
        onProgram={q.program}
        onKurum={q.kurum}
        onKaynak={q.kaynak}
      />
    </div>
  );
}
