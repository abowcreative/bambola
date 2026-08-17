import { MARKA, MEB_IFADESI, MEB_ACIKLAMA } from "@/lib/site";
import { sayfaMetadata, ekmekKirintisiSemasi, SemaEtiketi } from "@/lib/seo";
import { EkmekKirintisi, SayfaBasligi } from "@/components/site/bolum-basligi";
import { Belir, Sirali, SiraliOge } from "@/components/site/bolum";
import { Ikon } from "@/components/ui/ikon";
import { MarkaLogosu } from "@/components/site/marka-logosu";
import { SonCagri } from "@/components/site/son-cagri";
import { MekanSeridi } from "@/components/site/mekan-seridi";

export const metadata = sayfaMetadata({
  baslik: "Bambola Ne Demek? Hakkımızda",
  aciklama: `Bambola İtalyanca oyuncak bebek demek. ${MARKA.ilce}, ${MARKA.sehir}'da oyun evi ve anaokulu. Kurumun yaklaşımı, adın hikâyesi ve kadro.`,
  yol: "/hakkimizda",
});

const KIRINTI = [
  { ad: "Ana sayfa", yol: "/" },
  { ad: "Hakkımızda", yol: "/hakkimizda" },
];

/**
 * PLAN.md Bolum 2, Frobel tablosu.
 *
 * ABOW SINIRI (Bolum 2 sonu): sitede "su egitim modelini uyguluyoruz"
 * taahhudu VERILMEZ. Kurumun zaten o tarife uydugu anlatilir. Asagidaki
 * metin bu cizgiyi korur; "Frobel yontemini uyguluyoruz" demez.
 */
const FROBEL = [
  { sol: "Adın anlamı oyuncak", sag: "Bambola, İtalyanca oyuncak bebek" },
  { sol: "Oyun merkezli öğrenme", sag: "Kurumun kökeni bir oyun evi" },
  {
    sol: "Şarkı ve hareket",
    sag: "Şarkılı masal atölyeleri, müzik odası, piyano",
  },
  { sol: "Bahçe", sag: "Giriş katı bahçesi" },
  { sol: "Hediyeler", sag: "Atölye katları" },
  { sol: "Meşguliyetler", sag: "El işi ve sanat atölyeleri" },
  { sol: "Birlik", sag: "1,5 - 6 yaş tek çatı altında" },
];

export default function HakkimizdaSayfasi() {
  return (
    <>
      <SemaEtiketi sema={ekmekKirintisiSemasi(KIRINTI)} />
      <EkmekKirintisi ogeler={KIRINTI} />

      <SayfaBasligi
        ustBaslik="Hakkımızda"
        baslik="Bambola, oyuncak bebek demek"
        aciklama="Adımız İtalyanca. Kurumun ne yaptığını anlatan en kısa cümle zaten adının içinde duruyor: burada oyun ciddi bir iş."
      />

      {/* --- adin hikayesi --- */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.8fr]">
          <Belir>
            <h2 className="font-baslik text-2xl font-bold text-murekkep sm:text-3xl">
              Neden oyun?
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-relaxed text-murekkep-soluk">
              <p>
                Küçük çocuk dünyayı oynayarak anlıyor. Bir kule kurup yıkarken
                dengeyi, sırayla oynarken beklemeyi, bir masalı canlandırırken
                başkasının yerine geçmeyi öğreniyor. Bunların hiçbiri ders
                değil, hepsi oyun.
              </p>
              <p>
                Bambola bu yüzden bir oyun evi olarak kuruldu. Gruplar en fazla
                on iki kişi, çünkü on üçüncü çocuk sıranın sonunda kalıyor.
                Günün ilk saati serbest oyun, çünkü çocuk kendi hızında ısınmak
                istiyor.
              </p>
              <p>
                {MARKA.ilce}, {MARKA.sehir}&apos;dayız. Oyun evinde başlayan
                çocuk, yaşı gelince aynı çatı altındaki anaokuluna geçiyor.
              </p>
            </div>
          </Belir>

          <Belir gecikme={0.1}>
            <div className="relative mx-auto aspect-square w-full max-w-sm">
              <div className="absolute inset-0 rounded-full bg-white shadow-kart" />
              <MarkaLogosu
                boyut={420}
                alt={`${MARKA.ad} logosu`}
                className="relative size-full p-8"
              />
            </div>
          </Belir>
        </div>
      </section>

      {/* --- frobel --- */}
      <section className="border-y border-cizgi bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <Belir>
            <h2 className="font-baslik text-2xl font-bold text-murekkep sm:text-3xl">
              Yaklaşımımız
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-relaxed text-murekkep-soluk">
              <p>
                Anaokulu fikrini ilk ortaya atan kişi Friedrich Fröbel. Bugün
                dünyanın her yerinde kullanılan &quot;kindergarten&quot;, yani
                çocuk bahçesi kelimesi ona ait. Fröbel çocuğun oyun oynarken
                öğrendiğini söylemişti; şarkıyı, hareketi ve el işini de bu
                öğrenmenin parçası saymıştı.
              </p>
              <p>
                Biz bir yöntem sertifikası taşımıyoruz. Ama kurumu kurarken
                verdiğimiz kararların, o eski tarifle yan yana durduğunu fark
                ettik.
              </p>
            </div>
          </Belir>

          <Belir className="mt-10 overflow-hidden rounded-kart border-2 border-cizgi">
            <table className="w-full text-left">
              <caption className="sr-only">
                Fröbel çizgisi ve Bambola&apos;daki karşılığı
              </caption>
              <thead>
                <tr className="bg-krem-koyu">
                  <th className="px-5 py-3 font-baslik text-sm font-bold text-murekkep">
                    Fröbel
                  </th>
                  <th className="px-5 py-3 font-baslik text-sm font-bold text-murekkep">
                    Bambola&apos;daki karşılığı
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cizgi bg-white">
                {FROBEL.map((f) => (
                  <tr key={f.sol}>
                    <td className="px-5 py-3.5 font-medium text-murekkep">
                      {f.sol}
                    </td>
                    <td className="px-5 py-3.5 text-murekkep-soluk">{f.sag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Belir>
        </div>
      </section>

      {/* --- ilkeler --- */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <Belir className="max-w-2xl">
          <h2 className="font-baslik text-2xl font-bold text-murekkep sm:text-3xl">
            Değişmeyen üç şey
          </h2>
        </Belir>

        <Sirali className="mt-8 grid gap-5 sm:grid-cols-3">
          {[
            {
              baslik: "Küçük gruplar",
              metin:
                "Grupları küçük tutuyoruz: okula hazırlıkta 12, diğer gruplarda 8 çocuk. Kalabalık grupta çocuk kayboluyor.",
            },
            {
              baslik: "Ayrılmak öğrenilir",
              metin:
                "Çocuğu ebeveyninden koparmıyoruz. Güvenli ayrılma kendi hızında ilerleyen bir süreç.",
            },
            {
              baslik: "Ne olacağı bellidir",
              metin:
                "Program, saatler ve ücretler sitede açık yazıyor. Kapıda sürpriz çıkmıyor.",
            },
          ].map((i) => (
            <SiraliOge
              key={i.baslik}
              className="rounded-kart border-2 border-cizgi bg-white p-6"
            >
              <span className="grid size-11 place-items-center rounded-full bg-lime-rozet text-black">
                <Ikon.Tik boyut={22} />
              </span>
              <h3 className="mt-4 font-baslik text-lg font-bold text-murekkep">
                {i.baslik}
              </h3>
              <p className="mt-2 leading-relaxed text-murekkep-soluk">
                {i.metin}
              </p>
            </SiraliOge>
          ))}
        </Sirali>

        {/*
          PLAN.md Bolum 14 madde 2: MEB'deki resmi ifade teyit edilmeden
          bu iddia yayina cikmaz. MEB_IFADESI null oldugu surece blok
          hic basilmaz.
        */}
        {MEB_IFADESI && (
          <Belir className="mt-8 flex flex-wrap items-center gap-5 rounded-kart bg-yesil-koyu p-6 sm:p-8">
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-lime-rozet text-yesil-derin">
              <Ikon.Rozet boyut={28} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-baslik text-xl font-bold text-white sm:text-2xl">
                {MEB_IFADESI} oyun merkezi
              </p>
              <p className="mt-2 max-w-xl leading-relaxed text-lime-rozet">
                {MEB_ACIKLAMA}
              </p>
            </div>
          </Belir>
        )}
      </section>

      {/* Yon tabelasi kurumun kendi yaptirdigi bir isaret: oyun merkezi,
          atolyeler ve okula hazirlik gruplari tek levhada. Marka anlatisini
          bizim cumlemiz degil, kurumun kendi levhasi dogruluyor. */}
      <MekanSeridi
        sluglar={[
          "bambola-yon-tabelasi-01",
          "bambola-atolye-sinifi-01",
          "bambola-top-havuzu-01",
        ]}
        baslik="Anlattığımız yer burası"
        aciklama="Oyun alanları, atölye sınıfları, kapalı bahçe ve teras. Metin değil, mekânın kendisi."
      />

      <div className="pt-16">
        <SonCagri
          baslik="Gelin, yerinde görün"
          aciklama="Formu doldurun, sizi arayıp uygun bir gün ayarlayalım."
        />
      </div>
    </>
  );
}
