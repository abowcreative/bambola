import type { Metadata } from "next";
import { KayitFormuYukleyici } from "@/components/form/kayit-formu-yukleyici";
import {
  ILETISIM,
  KAYIT_FORMU_ACIK,
  KAYIT_YAKINDA_METNI,
  MARKA,
} from "@/lib/site";
import { BilgiCagrisi } from "@/components/site/bilgi-cagrisi";
import { Ikon } from "@/components/ui/ikon";

export const metadata: Metadata = {
  title: KAYIT_FORMU_ACIK ? "Kayıt formu" : "Kayıt çok yakında",
  description: KAYIT_FORMU_ACIK
    ? "Çocuğunuzun doğum tarihini girin, yaşına uygun grupları görün, gün ve saati seçip talebinizi bırakın."
    : "Online kayıt formu çok yakında açılıyor. O zamana kadar WhatsApp veya telefonla ulaşabilirsiniz.",
  alternates: { canonical: "/kayit" },
  /*
    Form kapaliyken bu adres arama sonuclarinda gorunmesin: veliyi
    "kayit" arayip bos bir sayfaya dusurmek en kotu karsilama olurdu.
  */
  robots: KAYIT_FORMU_ACIK ? undefined : { index: false, follow: true },
};

/** Next 16: searchParams bir Promise, await edilir. */
export default async function KayitSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ program?: string; kurum?: string; kaynak?: string }>;
}) {
  const q = await searchParams;

  /*
    KAYIT KAPALI HALI. Musteri karari, 17 Agustos 2026: "bir sekilde kayit
    olmak isteyen olursa cok yakinda uyarisi ciksin." Sitede forma giden
    dugme kalmadi ama bu adres eski baglantidan, arama sonucundan veya elle
    yazilarak yine acilabilir. O zaman bos bir form degil bu kart cikiyor.

    Form kodu SILINMEDI: KAYIT_FORMU_ACIK true olunca oldugu gibi geri
    geliyor (lib/site.ts).
  */
  if (!KAYIT_FORMU_ACIK) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="rounded-blok border-2 border-yesil bg-white p-8 text-center sm:p-12">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-lime-rozet text-black">
            <Ikon.Saat boyut={30} />
          </span>

          <h1 className="mt-6 font-baslik text-3xl font-bold text-murekkep sm:text-4xl">
            Kayıt çok yakında
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-murekkep-soluk">
            {KAYIT_YAKINDA_METNI}
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <BilgiCagrisi metin="WhatsApp'tan yazın" olcu="lg" />
            {ILETISIM.telefon && (
              <a
                href={`tel:${ILETISIM.telefon.replace(/\s/g, "")}`}
                className="font-medium text-yesil-koyu hover:underline"
              >
                {ILETISIM.telefon}
              </a>
            )}
          </div>

          <p className="mt-8 border-t border-cizgi pt-6 text-sm leading-relaxed text-murekkep-soluk">
            Grupları, gün ve saatleri, güncel ücretleri şimdiden
            görebilirsiniz:{" "}
            <a
              href="/bilgi"
              className="font-medium text-yesil-koyu underline underline-offset-2"
            >
              gruplar ve ücretler
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

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
          {MARKA.ilce}, {MARKA.sehir}. Küçük gruplar: okula hazırlıkta 12, diğer gruplarda 8 çocuk.
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
