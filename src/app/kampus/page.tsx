import { MARKA } from "@/lib/site";

/**
 * Kampus giris noktasi. Su an yalniz yonlendirmenin calistigini gosteren
 * gecici bir sayfa; giris ekrani ve panel bir sonraki adimda geliyor.
 * PLAN.md Bolum 28, Asama 1.
 */
export const metadata = {
  title: "Kampüs",
  // Kampus arama motorunda gorunmez. Ic panel, disariya kapali.
  robots: { index: false, follow: false },
};

export default function KampusGiris() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <p className="font-baslik text-sm font-semibold uppercase tracking-[0.14em] text-yesil-koyu">
        {MARKA.ad} Kampüs
      </p>
      <h1 className="mt-2 font-baslik text-3xl font-bold text-murekkep">
        Yönetim paneli
      </h1>
      <p className="mt-4 leading-relaxed text-murekkep-soluk">
        Giriş ekranı hazırlanıyor. Bu adres yalnız kurum içi kullanım
        içindir.
      </p>
    </div>
  );
}
