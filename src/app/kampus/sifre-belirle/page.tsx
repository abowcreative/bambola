import { MARKA } from "@/lib/site";
import { MarkaLogosu } from "@/components/site/marka-logosu";
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
    <main className="flex min-h-dvh items-center justify-center bg-panel-zemin px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <MarkaLogosu boyut={44} />
          <p className="mt-3 font-baslik text-[0.7rem] font-bold uppercase tracking-[0.18em] text-yesil-derin">
            {MARKA.ad} Kampüs
          </p>
          <h1 className="mt-1 font-baslik text-xl font-bold text-murekkep">
            Şifrenizi belirleyin
          </h1>
        </div>

        <div className="mt-6 rounded-panel border border-panel-cizgi bg-panel-yuzey p-5 shadow-panel-orta">
          <SifreFormu />
        </div>
      </div>
    </main>
  );
}
