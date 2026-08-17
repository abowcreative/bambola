import { MARKA } from "@/lib/site";
import { SifreFormu } from "./sifre-formu";

export const metadata = {
  title: "Şifre belirle",
  robots: { index: false, follow: false },
};

/**
 * Sifre belirleme. `npm run kampus:kullanici` ile uretilen baglanti buraya
 * dusuyor; Supabase adres parcasinda (hash) bir oturum belirteci birakiyor
 * ve tarayici istemcisi onu okuyup gecici oturum aciyor.
 *
 * Sunucuda hicbir sey yapilmiyor: hash sunucuya HIC GONDERILMEZ, yalniz
 * tarayicida goruluyor.
 */
export default function SifreBelirleSayfasi() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-krem px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <p className="font-baslik text-xs font-bold uppercase tracking-[0.18em] text-yesil-koyu">
            {MARKA.ad} Kampüs
          </p>
          <h1 className="mt-2 font-baslik text-2xl font-bold text-murekkep">
            Şifrenizi belirleyin
          </h1>
        </div>

        <div className="mt-8 rounded-blok border-2 border-cizgi bg-white p-6 shadow-kart">
          <SifreFormu />
        </div>
      </div>
    </main>
  );
}
