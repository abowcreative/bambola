import { MARKA } from "@/lib/site";
import { AILELER } from "@/lib/data/gruplar";
import {
  ERKEN_KAYIT_ORANI,
  KAMPANYA_KOSULLARI,
  KAMPANYA_PENCERESI,
  kampanyaAcikMi,
} from "@/lib/data/ucretler";
import { sorularKategori } from "@/lib/data/sss";
import {
  sayfaMetadata,
  ekmekKirintisiSemasi,
  sssSemasi,
  SemaEtiketi,
} from "@/lib/seo";
import {
  EkmekKirintisi,
  SayfaBasligi,
  BolumBasligi,
} from "@/components/site/bolum-basligi";
import { UcretKarti } from "@/components/site/ucret-tablosu";
import { SssAkordiyon } from "@/components/site/sss-akordiyon";
import { SonCagri } from "@/components/site/son-cagri";
import { Belir, Sirali } from "@/components/site/bolum";
import { Ikon } from "@/components/ui/ikon";

export const metadata = sayfaMetadata({
  // Aciklamada kampanyadan bilerek soz edilmiyor: metadata onbellege giriyor
  // ve arama sonucunda uzun sure asili kalabiliyor. Suresi dolmus bir indirim
  // vaadiyle tiklanmak, tiklanmamaktan kotudur.
  baslik: "Oyun Evi Ücretleri ve Paketler",
  aciklama: `${MARKA.ad} oyun grubu ücretleri. Okula hazırlık, gelişim odaklı oyun, bebek ve İngilizce grubu paketleri. Bütün paketler ve koşullar tek sayfada.`,
  yol: "/oyun-evi/ucretler",
});

/**
 * Kampanya penceresi takvime bagli oldugu icin sayfa saatte bir tazelenir.
 * Aksi halde derleme anindaki durum yayinda donar ve kampanya 1 Eylul'de
 * kapandiginda site indirimli fiyati gostermeye devam eder.
 */
export const revalidate = 3600;

const KIRINTI = [
  { ad: "Ana sayfa", yol: "/" },
  { ad: "Oyun evi", yol: "/oyun-evi" },
  { ad: "Ücretler", yol: "/oyun-evi/ucretler" },
];

export default function UcretlerSayfasi() {
  const ucretSorulari = sorularKategori("ucret");
  const kampanyaAcik = kampanyaAcikMi();

  return (
    <>
      <SemaEtiketi
        sema={[ekmekKirintisiSemasi(KIRINTI), sssSemasi(ucretSorulari)]}
      />
      <EkmekKirintisi ogeler={KIRINTI} />

      <SayfaBasligi
        ustBaslik="Ücretler"
        baslik="Paketler ve ücretler"
        aciklama="Bütün fiyatlar burada, tek sayfada. Formda da aynısını görürsünüz, sürpriz olmaz."
      />

      {/* --- erken kayit serit, yalniz kampanya acikken --- */}
      {kampanyaAcik && (
        <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
          <Belir className="flex flex-wrap items-center gap-4 rounded-kart bg-lime-rozet px-6 py-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-yesil-koyu">
              <Ikon.Yildiz boyut={24} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-baslik text-lg font-bold text-black">
                Erken kayıt dönemi devam ediyor
              </p>
              <p className="mt-0.5 text-sm text-black/75">
                Paket ücretlerinde yüzde{" "}
                {Math.round(ERKEN_KAYIT_ORANI * 100)} indirim
                {KAMPANYA_PENCERESI.siteyeYazilirMi
                  ? `, son gün ${KAMPANYA_PENCERESI.sonGun}`
                  : ""}
                . Koşullar aşağıda.
              </p>
            </div>
          </Belir>
        </section>
      )}

      {/* --- ucret kartlari --- */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <Sirali className="grid gap-5 sm:grid-cols-2">
          {AILELER.map((a) => (
            <UcretKarti key={a.slug} aile={a} kampanyaAcik={kampanyaAcik} />
          ))}
        </Sirali>
      </section>

      {/* --- kosullar. Kampanya kapaninca kosullarin da anlami kalmiyor. --- */}
      {kampanyaAcik && (
      <section className="border-y border-cizgi bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <BolumBasligi
            ustBaslik="Koşullar"
            baslik="Erken kayıt nasıl işliyor?"
            ortala
          />
          <Belir className="mt-8">
            <ul className="space-y-3">
              {KAMPANYA_KOSULLARI.map((k) => (
                <li
                  key={k}
                  className="flex gap-3 rounded-yumusak bg-krem p-4 leading-relaxed text-murekkep"
                >
                  <Ikon.Tik boyut={19} className="mt-0.5 shrink-0 text-yesil" />
                  {k}
                </li>
              ))}
            </ul>

            <p className="mt-6 rounded-yumusak border-2 border-dashed border-cizgi p-4 text-sm text-murekkep-soluk">
              Tek seferlik katılım fiyatlarına indirim uygulanmaz. Okula
              Hazırlık Gruplarında tek seferlik katılım seçeneği yoktur.
            </p>
          </Belir>
        </div>
      </section>
      )}

      {/* --- sss --- */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <BolumBasligi baslik="Ücretlerle ilgili sorular" ortala />
        <div className="mt-8">
          <SssAkordiyon sorular={ucretSorulari} />
        </div>
      </section>

      <SonCagri
        baslik="Hangi paket size uyar?"
        aciklama="Formda çocuğunuzun yaşına uygun paketleri fiyatlarıyla birlikte görürsünüz."
      />
    </>
  );
}
