import { MARKA } from "@/lib/site";
import { sayfaMetadata, ekmekKirintisiSemasi, SemaEtiketi } from "@/lib/seo";
import { EkmekKirintisi, SayfaBasligi } from "@/components/site/bolum-basligi";
import { Belir, Sirali, SiraliOge } from "@/components/site/bolum";
import { BilgiCagrisi } from "@/components/site/bilgi-cagrisi";
import { DinamikIkon, Ikon } from "@/components/ui/ikon";
import { SonCagri } from "@/components/site/son-cagri";
import { MekanSeridi } from "@/components/site/mekan-seridi";
import { Foto } from "@/components/site/foto";
import { foto } from "@/lib/data/fotograflar";

export const metadata = sayfaMetadata({
  baslik: `${MARKA.ilce} Doğum Günü ve Parti Evi`,
  aciklama: `${MARKA.sehir}, ${MARKA.ilce}'da çocuk doğum günü mekânı. ${MARKA.ad} parti evi, oyun evinin bir parçası. WhatsApp'tan yazın, size dönelim.`,
  yol: "/parti",
});

const KIRINTI = [
  { ad: "Ana sayfa", yol: "/" },
  { ad: "Doğum günü ve parti", yol: "/parti" },
];

/**
 * PLAN.md Bolum 14 madde 11: parti paketleri ve fiyatlari Excel'de yok.
 * Gelmezse sayfa fiyatsiz tanitim + talep formu olarak cikar. Su an oyle.
 * Uydurma paket, uydurma fiyat, uydurma sure yazilmaz.
 */
const NEDEN = [
  {
    ikon: "Konum",
    baslik: "Çocuğun tanıdığı bir yer",
    metin: "Oyun evine alışkın çocuk, kendi doğum gününde yabancılık çekmiyor.",
  },
  {
    ikon: "Grup",
    baslik: "Oyun alanı hazır",
    metin:
      "Parti evi oyun evinin bir parçası, ayrı bir mekân kurmaya gerek yok.",
  },
  {
    ikon: "Kalp",
    baslik: "Kadro aynı kadro",
    metin: "Çocukları tanıyan öğretmenler, gün boyu aynı yerde.",
  },
];

export default function PartiSayfasi() {
  return (
    <>
      <SemaEtiketi sema={ekmekKirintisiSemasi(KIRINTI)} />
      <EkmekKirintisi ogeler={KIRINTI} />

      <SayfaBasligi
        ustBaslik="Parti evi"
        baslik="Doğum gününü tanıdığı yerde kutlasın"
        aciklama={`${MARKA.ad} parti evi, oyun evinin ayrılmaz parçası. Aynı mekân, aynı öğretmenler, çocuğun tanıdığı yer.`}
        cocuklar={
          <BilgiCagrisi metin="Parti için bilgi isteyin" olcu="lg" />
        }
      />

      {/* MUSTERI KARARI, 17 Agustos 2026: uzun masa karesine yer verilmiyor.
          Yerine tenteli terasin genel gorunumu kondu; parti kurulumu
          terasta yapiliyor ama masa duzeni gosterilmiyor. */}
      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
        <Belir>
          <Foto
            foto={foto("bambola-teras-01")}
            oran="serit"
            oncelikli
            boyutlar="(min-width: 1152px) 1088px, 100vw"
            yuvarlak="rounded-blok"
          />
        </Belir>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Sirali className="grid gap-5 sm:grid-cols-3">
          {NEDEN.map((n) => (
            <SiraliOge
              key={n.baslik}
              className="rounded-kart border-2 border-cizgi bg-white p-6 transition-all duration-200 ease-yayli hover:-translate-y-1 hover:border-yesil hover:shadow-kart"
            >
              <span className="oyna grid size-12 place-items-center rounded-full bg-lime-rozet text-black">
                <DinamikIkon ad={n.ikon} boyut={24} />
              </span>
              <h2 className="mt-4 font-baslik text-lg font-bold text-murekkep">
                {n.baslik}
              </h2>
              <p className="mt-2 leading-relaxed text-murekkep-soluk">
                {n.metin}
              </p>
            </SiraliOge>
          ))}
        </Sirali>
      </section>

      <section className="border-y border-cizgi bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <Belir>
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-lime-rozet text-black">
              <Ikon.Balon boyut={32} />
            </span>
            <h2 className="mt-6 font-baslik text-2xl font-bold text-murekkep sm:text-3xl">
              Paketler ve fiyatlar
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-murekkep-soluk">
              Parti paketlerini ve fiyatları henüz yayınlamıyoruz. Kaç kişi
              geleceğini, çocuğunuzun yaşını ve aklınızdaki tarihi yazın, size
              uygun kurguyu birlikte çıkaralım.
            </p>
            <div className="mt-8">
              <BilgiCagrisi metin="WhatsApp'tan yazın" olcu="lg" />
            </div>
          </Belir>
        </div>
      </section>

      <MekanSeridi
        sluglar={[
          "bambola-etkinlik-salonu-dinozor-duvari-01",
          "bambola-top-havuzu-01",
          "bambola-teras-02",
        ]}
        ustBaslik="Parti mekânı"
        baslik="Partinin kurulduğu yerler"
        aciklama="Etkinlik salonu, oyun alanı ve teras. Kaç kişi geleceğine göre kurguyu birlikte seçiyoruz."
      />

      <div className="pt-16">
        <SonCagri
          baslik="Aklınızda bir tarih var mı?"
          aciklama="WhatsApp'tan yazın; uygunluk ve kurgu için konuşalım."
          butonMetni="Parti için yazın"
        />
      </div>
    </>
  );
}
