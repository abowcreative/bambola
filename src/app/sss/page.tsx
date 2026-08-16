import { MARKA } from "@/lib/site";
import { SORULAR, sorularKategori, type Soru } from "@/lib/data/sss";
import {
  sayfaMetadata,
  ekmekKirintisiSemasi,
  sssSemasi,
  SemaEtiketi,
} from "@/lib/seo";
import { EkmekKirintisi, SayfaBasligi } from "@/components/site/bolum-basligi";
import { Belir } from "@/components/site/bolum";
import { SssAkordiyon } from "@/components/site/sss-akordiyon";
import { SonCagri } from "@/components/site/son-cagri";

export const metadata = sayfaMetadata({
  baslik: "Sık Sorulan Sorular",
  aciklama: `${MARKA.ad} oyun evi hakkında velilerin en çok sorduğu sorular: grup büyüklüğü, yaş aralıkları, ücretler, telafi, kayıt.`,
  yol: "/sss",
});

const KIRINTI = [
  { ad: "Ana sayfa", yol: "/" },
  { ad: "Sık sorulan sorular", yol: "/sss" },
];

const BOLUMLER: { baslik: string; kategori: Soru["kategori"] }[] = [
  { baslik: "Genel", kategori: "genel" },
  { baslik: "Program ve işleyiş", kategori: "program" },
  { baslik: "Ücretler", kategori: "ucret" },
  { baslik: "Kayıt", kategori: "kayit" },
];

export default function SssSayfasi() {
  return (
    <>
      <SemaEtiketi sema={[ekmekKirintisiSemasi(KIRINTI), sssSemasi(SORULAR)]} />
      <EkmekKirintisi ogeler={KIRINTI} />

      <SayfaBasligi
        ustBaslik="Sık sorulanlar"
        baslik="Merak ettikleriniz"
        aciklama="Aradığınızı bulamazsanız formu doldurun, telefonda konuşalım."
      />

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="space-y-12">
          {BOLUMLER.map((b) => {
            const sorular = sorularKategori(b.kategori);
            if (!sorular.length) return null;
            return (
              <section key={b.kategori}>
                <Belir>
                  <h2 className="font-baslik text-2xl font-bold text-murekkep">
                    {b.baslik}
                  </h2>
                </Belir>
                <div className="mt-5">
                  <SssAkordiyon sorular={sorular} />
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <SonCagri
        baslik="Sorunuz burada yoksa"
        aciklama="Formu doldurun, notunuza yazın. Sizi arayıp cevaplayalım."
      />
    </>
  );
}
