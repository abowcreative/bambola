import { redirect } from "next/navigation";
import { MARKA } from "@/lib/site";
import { MarkaLogosu } from "@/components/site/marka-logosu";
import { oturumuGetir, rolAnaSayfasi } from "@/lib/kampus/oturum";
import { GirisFormu } from "./giris-formu";

export const metadata = {
  title: "Giriş",
  robots: { index: false, follow: false },
};

export default async function GirisSayfasi() {
  // Oturum zaten aciksa giris ekranini gostermenin anlami yok.
  const oturum = await oturumuGetir();
  if (oturum) redirect(rolAnaSayfasi(oturum.rol));

  return (
    <main className="flex min-h-dvh items-center justify-center bg-panel-zemin px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <MarkaLogosu boyut={44} />
          <p className="mt-3 font-baslik text-[0.7rem] font-bold uppercase tracking-[0.18em] text-yesil-derin">
            {MARKA.ad} Kampüs
          </p>
          <h1 className="mt-1 font-baslik text-xl font-bold text-murekkep">
            Yönetim paneli
          </h1>
        </div>

        <div className="mt-6 rounded-panel border border-panel-cizgi bg-panel-yuzey p-5 shadow-panel-orta">
          <GirisFormu />
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-panel-silik">
          Bu alan yalnız kurum çalışanları ve velileri içindir.
          <br />
          Hesabınız yoksa kurum yöneticisine başvurun.
        </p>
      </div>
    </main>
  );
}
