import { MARKA, MEB_IFADESI, SITE_URL } from "@/lib/site";
import {
  FOTOGRAFLAR,
  foto,
  fotoYolu,
  type Fotograf,
} from "@/lib/data/fotograflar";
import { sayfaMetadata, ekmekKirintisiSemasi, SemaEtiketi } from "@/lib/seo";
import { EkmekKirintisi, SayfaBasligi } from "@/components/site/bolum-basligi";
import { Belir, Sirali, SiraliOge } from "@/components/site/bolum";
import { Foto } from "@/components/site/foto";
import { ButonLink } from "@/components/ui/buton";
import { Ikon } from "@/components/ui/ikon";
import { SonCagri } from "@/components/site/son-cagri";

export const metadata = sayfaMetadata({
  baslik: `${MARKA.ad} Mekân: Oyun Alanları, Atölyeler ve Bahçe`,
  aciklama: `${MARKA.ilce}, ${MARKA.sehir}. Oyun alanları, atölye sınıfları, etkinlik salonu, kapalı bahçe, teras ve kafe. Çocuğunuzun vakit geçireceği yerleri gelmeden görün.`,
  yol: "/mekan",
});

const KIRINTI = [
  { ad: "Ana sayfa", yol: "/" },
  { ad: "Mekân", yol: "/mekan" },
];

/**
 * PLAN.md Bolum 14 madde 7: "Mekan fotograflari. Sitenin en guclu argumani."
 * Fotograflar 16 Agustos 2026'da geldi.
 *
 * Yerlesim ELLE kurgulandi, otomatik degil. Once masonry denendi: sutun
 * akisi kareleri sigdiriyordu ama sayfa dagilmis gorunuyordu, cunku hicbir
 * kare digerinden onemli degildi ve sutunlar farkli yuksekliklerde bitiyordu.
 * Simdi her bolum sabit oranli SATIRLARdan olusuyor; satir icindeki kutular
 * ayni yukseklikte, genislikleri `span` ile degisiyor. Boylece her bolumde
 * bir "bas kare" var ve sayfa kurgulanmis duruyor.
 *
 * Span'ler kaynak yonune gore secildi: 21:9 bir satirda 4 birimlik kutu
 * yatay, 2 birimlik kutu dikey cikiyor. Yatay cekilmis kareler genis
 * kutulara, dikey cekilmisler dar kutulara konuldu; boylece kirpma en az.
 */

type Kutu = { slug: string; genislik: 2 | 3 | 4 };
type Bolum = {
  no: string;
  baslik: string;
  girisi: string;
  olgular: string[];
  satirlar: Kutu[][];
};

const BOLUMLER: Bolum[] = [
  {
    no: "01",
    baslik: "Oyun alanları",
    girisi:
      "Günün ilk saati burada geçiyor. Çocuk gruba girmeden önce serbest oynuyor, mekâna ve öğretmenine kendi hızında ısınıyor. Top havuzunun içinde kaydırak ve ağ korumalı bir tırmanma platformu var; yanındaki bölümde tırmanma duvarı, salıncaklar ve güvenlik ağlı trambolin duruyor. Deniz temalı alanın hemen bitişiğinde ebeveynlerin oturduğu masalar var, yani çocuk gözünüzün önünde.",
    olgular: [
      "İlk bir saat serbest oyun",
      "Ağ korumalı tırmanma ve trambolin",
      "Ebeveyn oturma alanı oyun alanının yanında",
    ],
    satirlar: [
      [
        { slug: "bambola-top-havuzu-01", genislik: 4 },
        { slug: "bambola-oyun-merkezi-trambolin-01", genislik: 2 },
      ],
      [
        { slug: "bambola-deniz-temali-oyun-alani-01", genislik: 3 },
        { slug: "bambola-oyun-merkezi-tirmanma-duvari-01", genislik: 3 },
      ],
    ],
  },
  {
    no: "02",
    baslik: "Atölye ve etkinlik salonları",
    girisi:
      "Grupların toplandığı yer. Masalar ve sandalyeler çocuk boyunda, malzeme dolapları çocuğun kendi uzanabileceği yükseklikte; bir çalışmaya başlamak için yetişkin beklemesi gerekmiyor. Duvarlar boyalı çizimlerle kaplı, dinozor duvarlı etkinlik salonu terasa cam cepheyle açılıyor. Gruplar küçük: Okula Hazırlık'ta en fazla 12, diğerlerinde en fazla 8 çocuk.",
    olgular: [
      "Okula Hazırlık'ta en fazla 12, diğer gruplarda 8 çocuk",
      "Çocuk boyunda masa ve ulaşılabilir malzeme dolapları",
      "Etkinlik salonu terasa açılıyor",
    ],
    satirlar: [
      [
        { slug: "bambola-atolye-sinifi-01", genislik: 4 },
        { slug: "bambola-atolye-sinifi-03", genislik: 2 },
      ],
      [
        { slug: "bambola-etkinlik-salonu-dinozor-duvari-02", genislik: 2 },
        { slug: "bambola-etkinlik-salonu-dinozor-duvari-01", genislik: 4 },
      ],
      [
        { slug: "bambola-etkinlik-salonu-dinozor-duvari-03", genislik: 2 },
        { slug: "bambola-atolye-sinifi-02", genislik: 4 },
      ],
    ],
  },
  {
    no: "03",
    baslik: "Bahçe ve teras",
    girisi:
      "Kapalı bahçede ahşap bir kum havuzu ve deniz temalı duvar resmi var; hava ne olursa olsun kullanılabiliyor. Üst kattaki tenteli teras günün büyük bölümünde gölgede kalıyor ve doğum günlerinde uzun masa düzeni burada kuruluyor. Korkuluk boyunca sardunyalar ve bir rüzgârgülü var.",
    olgular: [
      "Kapalı bahçe, her mevsim kullanılabiliyor",
      "Tenteli teras",
      "Doğum günü masa düzeni terasta kuruluyor",
    ],
    satirlar: [
      [
        { slug: "bambola-bahce-kum-havuzu-01", genislik: 4 },
        { slug: "bambola-teras-02", genislik: 2 },
      ],
      [
        { slug: "bambola-teras-03", genislik: 2 },
        { slug: "bambola-teras-01", genislik: 2 },
        { slug: "bambola-teras-cicek-detay-01", genislik: 2 },
      ],
    ],
  },
  {
    no: "04",
    baslik: "Kafe",
    girisi:
      "Velinin beklediği yer. Cadde cepheli pencereler, aile masaları ve oyun alanını gören oturma bölümleri. Çocuğunu ilk kez bırakan bir veli için önemli: güvenli ayrılma programı boyunca binadan çıkmanız gerekmiyor, aşağıda oturup bekleyebiliyorsunuz.",
    olgular: [
      "Cadde cepheli, aydınlık",
      "Güvenli ayrılma sürecinde velinin bekleyebileceği yer",
    ],
    satirlar: [
      [
        { slug: "bambola-kafe-pencere-kenari-01", genislik: 3 },
        { slug: "bambola-kafe-ic-mekan-01", genislik: 3 },
      ],
    ],
  },
  {
    no: "05",
    baslik: "Bina",
    girisi:
      "Katlar arası geçişler ve sınıflara açılan camlı kapılar. Camlı olması tesadüf değil: içeride ne olduğu koridordan görünüyor. Girişteki yön tabelası oyun merkezini, atölyeleri ve okula hazırlık gruplarını tek levhada topluyor.",
    olgular: ["Sınıflara camlı kapılar", "Katlara göre ayrılmış işlevler"],
    satirlar: [
      [
        { slug: "bambola-koridor-01", genislik: 2 },
        { slug: "bambola-yon-tabelasi-01", genislik: 2 },
        { slug: "bambola-koridor-02", genislik: 2 },
      ],
    ],
  },
];

/** ImageGallery semasi: gorseller Google Gorseller'de kuruma baglanir. */
function galeriSemasi() {
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: `${MARKA.ad} mekân fotoğrafları`,
    url: `${SITE_URL}/mekan`,
    about: { "@id": `${SITE_URL}/#kurum` },
    image: FOTOGRAFLAR.map((f) => ({
      "@type": "ImageObject",
      contentUrl: `${SITE_URL}${fotoYolu(f)}`,
      caption: f.alt,
      width: f.en,
      height: f.boy,
    })),
  };
}

/** Tailwind sinif adlari derleme aninda taranir, dinamik string uretilmez. */
const GENISLIK_SINIFI: Record<Kutu["genislik"], string> = {
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
};

/**
 * `sizes` degeri kutu genisligine gore. Yanlis verilirse tarayici gereksiz
 * buyuk dosya indirir; izgara max-w-6xl (1152px) icinde durdugu icin bir
 * birim yaklasik 176px.
 */
const BOYUT_SINIFI: Record<Kutu["genislik"], string> = {
  2: "(min-width: 1024px) 360px, 100vw",
  3: "(min-width: 1024px) 544px, 100vw",
  4: "(min-width: 1024px) 726px, 100vw",
};

function Satir({ kutular }: { kutular: Kutu[] }) {
  return (
    <Sirali className="grid gap-4 lg:aspect-[21/9] lg:grid-cols-6">
      {kutular.map((k) => {
        const f = foto(k.slug);
        return (
          <SiraliOge
            key={k.slug}
            className={`${GENISLIK_SINIFI[k.genislik]} lg:h-full`}
          >
            {/*
              Mobilde kare kendi yonunu koruyor; masaustunde satirin
              yuksekligini dolduruyor. Iki hali de object-cover ile kirpiliyor.
            */}
            <Foto
              foto={f}
              oran={f.en > f.boy ? "yatay" : "dikey"}
              boyutlar={BOYUT_SINIFI[k.genislik]}
              className="lg:h-full lg:aspect-auto"
            />
          </SiraliOge>
        );
      })}
    </Sirali>
  );
}

export default function MekanSayfasi() {
  const kapak = foto("bambola-top-havuzu-01");

  return (
    <>
      <SemaEtiketi sema={[ekmekKirintisiSemasi(KIRINTI), galeriSemasi()]} />
      <EkmekKirintisi ogeler={KIRINTI} />

      <SayfaBasligi
        ustBaslik="Mekân"
        baslik="Gelmeden önce görün"
        aciklama="Çocuğunuz haftada iki gün, günde iki saat burada olacak. Nerede oynayacağını, hangi masada oturacağını ve sizin nerede bekleyeceğinizi peşinen görmenizde fayda var."
        cocuklar={
          <div className="flex flex-wrap gap-3">
            <ButonLink href="/kayit" olcu="lg">
              Çocuğuma uygun grubu bul
              <Ikon.Ok boyut={19} />
            </ButonLink>
            <ButonLink href="/iletisim" gorunum="cizgili" olcu="lg">
              <Ikon.Konum boyut={19} />
              Yol tarifi
            </ButonLink>
          </div>
        }
      />

      {/* Kapak: sayfanin ilk goruntusu tek karede mekani anlatsin. */}
      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
        <Belir className="relative">
          <Foto
            foto={kapak}
            oran="serit"
            genis
            oncelikli
            boyutlar="(min-width: 1152px) 1088px, 100vw"
            yuvarlak="rounded-blok"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-blok bg-gradient-to-t from-black/55 via-transparent to-transparent"
          />
          <p className="absolute inset-x-0 bottom-0 p-5 font-baslik text-lg font-bold text-white sm:p-8 sm:text-2xl">
            {MEB_IFADESI} oyun merkezi · {MARKA.ilce}, {MARKA.sehir}
          </p>
        </Belir>
      </section>

      {BOLUMLER.map((b) => (
        <section
          key={b.no}
          className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20"
        >
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            {/* Sol sutun: numara, baslik ve olgular. Olgular sagda kalinca
                sol sutunun alti bosaliyordu, iki sutun da agirlik tasisin. */}
            <Belir>
              <span className="grid size-14 place-items-center rounded-full bg-lime-rozet font-baslik text-xl font-bold text-black">
                {b.no}
              </span>
              <h2 className="mt-4 font-baslik text-3xl font-bold text-murekkep sm:text-4xl">
                {b.baslik}
              </h2>
              <ul className="mt-6 space-y-2">
                {b.olgular.map((o) => (
                  <li
                    key={o}
                    className="flex gap-2 text-sm leading-snug text-murekkep"
                  >
                    <Ikon.Tik
                      boyut={16}
                      className="mt-0.5 shrink-0 text-yesil"
                    />
                    {o}
                  </li>
                ))}
              </ul>
            </Belir>

            <Belir gecikme={0.08}>
              <p className="text-lg leading-relaxed text-murekkep-soluk">
                {b.girisi}
              </p>
            </Belir>
          </div>

          <div className="mt-10 space-y-4">
            {b.satirlar.map((satir, i) => (
              <Satir key={i} kutular={satir} />
            ))}
          </div>
        </section>
      ))}

      <SonCagri
        baslik="Yerinde görmek ister misiniz?"
        aciklama="Formu doldurun, uygun bir saat için sizi arayalım."
        butonMetni="Kayıt formunu doldur"
      />
    </>
  );
}

/** Yerlesimde kullanilmayan kare kalmasin diye derleme aninda dogrulanir. */
const YERLESEN = new Set(
  BOLUMLER.flatMap((b) => b.satirlar.flat().map((k) => k.slug)),
);
const EKSIK = FOTOGRAFLAR.filter((f: Fotograf) => !YERLESEN.has(f.slug));
if (EKSIK.length > 0) {
  throw new Error(
    `/mekan yerlesiminde yer almayan fotograf var: ${EKSIK.map((f) => f.slug).join(", ")}`,
  );
}
