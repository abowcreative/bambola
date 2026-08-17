import { MARKA, SITE_URL } from "@/lib/site";
import { sayfaMetadata, ekmekKirintisiSemasi, SemaEtiketi } from "@/lib/seo";
import { EkmekKirintisi, SayfaBasligi } from "@/components/site/bolum-basligi";
import { Belir, Sirali, SiraliOge } from "@/components/site/bolum";
import { ButonLink } from "@/components/ui/buton";
import { DinamikIkon, Ikon } from "@/components/ui/ikon";
import { SonCagri } from "@/components/site/son-cagri";
import { MekanSeridi } from "@/components/site/mekan-seridi";

export const metadata = sayfaMetadata({
  baslik: `${MARKA.ilce} Anaokulu, Bu Sene Açılıyor`,
  aciklama: `${MARKA.ilce}, ${MARKA.sehir}'da anaokulu. 1,5 yaştan 6 yaşa tek çatı altında, 8 kat, 160 kişilik kapasite. Ön kayıt formu açık.`,
  yol: "/anaokulu",
});

const KIRINTI = [
  { ad: "Ana sayfa", yol: "/" },
  { ad: "Anaokulu", yol: "/anaokulu" },
];

/**
 * PLAN.md Bolum 2'deki DOGRULANMIS olgular. Bunlarin disina cikilmaz.
 * Ucret, kayit takvimi ve program yapisi teyit bekliyor (Bolum 14 madde 12),
 * o yuzden bu sayfada ucret bolumu YOK.
 */
const OLGULAR = [
  { ikon: "Ampul", baslik: "8 kat", metin: "Her katın kendi işlevi var." },
  {
    ikon: "Grup",
    baslik: "160 kapasite",
    metin: "Sınıflar yaşa göre ayrılıyor.",
  },
  {
    ikon: "Kalp",
    baslik: "1,5 - 6 yaş tek çatı",
    metin: "Çocuk aynı binada büyüyor, okul değiştirmiyor.",
  },
  {
    ikon: "Mercek",
    baslik: "Laboratuvar",
    metin: "Deney ve keşif için ayrı bir alan.",
  },
  {
    ikon: "Muzik",
    baslik: "Piyano ve müzik odası",
    metin: "Şarkı ve hareket günlük akışın parçası.",
  },
  {
    ikon: "Yildiz",
    baslik: "Teleskop",
    metin: "Gökyüzü gözlemi için kurulmuş bir alan.",
  },
];

export default function AnaokuluSayfasi() {
  return (
    <div data-kol="anaokulu">
      <SemaEtiketi
        sema={[
          ekmekKirintisiSemasi(KIRINTI),
          {
            "@context": "https://schema.org",
            "@type": "Preschool",
            name: MARKA.tuzelAdAnaokulu,
            alternateName: `${MARKA.ad} Anaokulu`,
            url: `${SITE_URL}/anaokulu`,
            parentOrganization: { "@id": `${SITE_URL}/#kurum` },
            address: {
              "@type": "PostalAddress",
              addressLocality: MARKA.ilce,
              addressRegion: MARKA.sehir,
              addressCountry: "TR",
            },
          },
        ]}
      />
      <EkmekKirintisi ogeler={KIRINTI} />

      <SayfaBasligi
        ustBaslik="Anaokulu"
        baslik="Anaokulumuz bu sene açılıyor"
        aciklama="Oyun evinde başlayan çocuk, yaşı gelince aynı çatının altında devam ediyor. 1,5 yaştan 6 yaşa kadar tek bir yer."
        cocuklar={
          <ButonLink href="/kayit?kurum=anaokulu" olcu="lg">
            Ön kayıt formunu doldur
            <Ikon.Ok boyut={19} />
          </ButonLink>
        }
      />

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Belir className="max-w-2xl">
          <h2 className="font-baslik text-2xl font-bold text-murekkep sm:text-3xl">
            Bina ne sunuyor?
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-murekkep-soluk">
            Aşağıdakiler kesinleşmiş olgular. Program yapısı, ücretler ve kayıt
            takvimi netleştikçe bu sayfa dolacak.
          </p>
        </Belir>

        <Sirali className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OLGULAR.map((o) => (
            <SiraliOge
              key={o.baslik}
              className="rounded-kart border-2 border-cizgi bg-white p-6 transition-all duration-200 ease-yayli hover:-translate-y-1 hover:border-yesil hover:shadow-kart-hover"
            >
              <span className="oyna grid size-12 place-items-center rounded-full bg-lime-rozet text-black">
                <DinamikIkon ad={o.ikon} boyut={24} />
              </span>
              <h3 className="mt-4 font-baslik text-lg font-bold text-murekkep">
                {o.baslik}
              </h3>
              <p className="mt-2 leading-relaxed text-murekkep-soluk">
                {o.metin}
              </p>
            </SiraliOge>
          ))}
        </Sirali>
      </section>

      {/* --- yas merdiveni --- */}
      <section className="border-y border-cizgi bg-yesil-derin">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <Belir>
            <h2 className="font-baslik text-3xl font-bold text-white sm:text-4xl">
              Oyun evinden anaokuluna
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-lime-rozet">
              Çocuk altı aylıkken bebek grubuyla tanışıyor, yürümeye başlayınca
              oyun grubuna geçiyor, otuz ayı geçince ebeveyninden ayrılmayı
              öğreniyor ve anaokuluna hazır hale geliyor. Hepsi aynı kurumda,
              aynı öğretmenlerle.
            </p>

            <ol className="mt-10 grid gap-3 text-left sm:grid-cols-3">
              {[
                { yas: "6 aylık - 2 yaş", ad: "Bebek grubu" },
                { yas: "1,5 - 3 yaş", ad: "Oyun grupları" },
                { yas: "2,5 yaş ve üzeri", ad: "Okula hazırlık" },
              ].map((a, i) => (
                <li
                  key={a.ad}
                  className="rounded-kart bg-white/10 p-5 backdrop-blur-sm"
                >
                  <span className="font-baslik text-sm font-bold text-lime-rozet">
                    {i + 1}. adım
                  </span>
                  <p className="mt-1 font-baslik text-lg font-bold text-white">
                    {a.ad}
                  </p>
                  <p className="mt-0.5 text-sm text-lime-rozet">{a.yas}</p>
                </li>
              ))}
            </ol>
          </Belir>
        </div>
      </section>

      {/*
        Bu kareler FAAL OYUN EVINDEN. Anaokulu bu sene aciliyor ve kendi
        katlarinin fotografi henuz yok. Sayfaya "anaokulu sinifi" diye
        konulamaz; baslik ve aciklama neyin gosterildigini acikca soyluyor.
        PLAN.md Bolum 3: dogrulanmamis iddia yazilmaz.
      */}
      <MekanSeridi
        sluglar={[
          "bambola-koridor-01",
          "bambola-atolye-sinifi-01",
          "bambola-bahce-kum-havuzu-01",
        ]}
        ustBaslik="Aynı çatı"
        baslik="Oyun evini şimdiden görün"
        aciklama="Aşağıdaki kareler faal oyun evimizden. Anaokulu katlarının fotoğrafları açılışla birlikte eklenecek."
      />

      {/* --- ne zaman aciliyor --- */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <Belir>
          <h2 className="font-baslik text-2xl font-bold text-murekkep sm:text-3xl">
            Ücretler ve kayıt takvimi
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-murekkep-soluk">
            Anaokulu ücretleri ve kayıt takvimi henüz yayınlanmadı. Ön kayıt
            formunu doldurun, bilgiler netleştiği anda ilk sizi arayalım.
          </p>
          <div className="mt-8">
            <ButonLink href="/kayit?kurum=anaokulu" olcu="lg">
              Ön kayıt listesine girin
              <Ikon.Ok boyut={19} />
            </ButonLink>
          </div>
        </Belir>
      </section>

      <SonCagri
        baslik="Anaokulu için ön kaydınızı bırakın"
        aciklama="Kontenjan ve ücret bilgisi açıklandığında sırayla dönüyoruz."
        butonMetni="Ön kayıt formu"
        href="/kayit?kurum=anaokulu"
      />
    </div>
  );
}
