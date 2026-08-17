import { redirect } from "next/navigation";
import { MARKA } from "@/lib/site";
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
    <main className="flex min-h-dvh items-center justify-center bg-krem px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <p className="font-baslik text-xs font-bold uppercase tracking-[0.18em] text-yesil-koyu">
            {MARKA.ad} Kampüs
          </p>
          <h1 className="mt-2 font-baslik text-2xl font-bold text-murekkep">
            Yönetim paneli
          </h1>
        </div>

        <div className="mt-8 rounded-blok border-2 border-cizgi bg-white p-6 shadow-kart">
          <GirisFormu />
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-murekkep-soluk">
          Bu alan yalnız kurum çalışanları ve velileri içindir.
          <br />
          Hesabınız yoksa kurum yöneticisine başvurun.
        </p>
      </div>
    </main>
  );
}
