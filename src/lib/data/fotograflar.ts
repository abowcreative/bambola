/**
 * Mekan fotograflari. PLAN.md Bolum 14 madde 7 ile gelen paketten.
 *
 * Dosyalar `public/foto/` altinda duruyor ve `npm run foto` ile kaynak
 * paketten uretiliyor; elle kopyalanmaz. Bkz. scripts/foto-hazirla.ts.
 *
 * Alt metinler kurumun kendi paketindeki ALT_METIN_ONERILERI.txt dosyasindan
 * birebir alindi. Metinler mekani tarif ediyor, iddia icermiyor: sitede
 * dogrulanmamis bilgi olmaz (PLAN.md Bolum 3).
 *
 * `en` ve `boy` gercek dosya olculeri. next/image bunlari layout shift'i
 * onlemek icin kullaniyor, tahminle doldurulmaz.
 */

/**
 * Karenin hangi alani gosterdigi. Kod bunu okumuyor; /mekan sayfasindaki
 * yerlesim elle kurgulanmis durumda. Alan bilgisi kayitla birlikte duruyor
 * ki yeni bir kare eklendiginde nereye ait oldugu belli olsun.
 */
export type FotoAlani = "oyun" | "atolye" | "bahce" | "kafe" | "genel";

export type Fotograf = {
  slug: string;
  alt: string;
  en: number;
  boy: number;
  alan: FotoAlani;
  /** 16:9 kirpimi da uretilmis mi. Genis seritlerde kullanilir. */
  genisVar?: boolean;
};

const YATAY = { en: 1600, boy: 1200 } as const;
const DIKEY = { en: 1086, boy: 1448 } as const;

export const FOTOGRAFLAR: Fotograf[] = [
  // --- oyun alanlari ---
  {
    slug: "bambola-top-havuzu-01",
    alt: "Bambola top havuzu, kaydırak ve ağ korumalı tırmanma platformu",
    ...YATAY,
    alan: "oyun",
    genisVar: true,
  },
  {
    slug: "bambola-deniz-temali-oyun-alani-01",
    alt: "Deniz temalı Bambola oyun alanı ve ebeveynler için hemen yanındaki oturma bölümü",
    ...YATAY,
    alan: "oyun",
    genisVar: true,
  },
  {
    slug: "bambola-oyun-merkezi-tirmanma-duvari-01",
    alt: "Bambola oyun merkezinde tırmanma duvarı, salıncaklar ve renkli oyun zemini",
    ...YATAY,
    alan: "oyun",
  },
  {
    slug: "bambola-oyun-merkezi-trambolin-01",
    alt: "Bambola oyun merkezindeki güvenlik ağlı trambolin alanı",
    ...DIKEY,
    alan: "oyun",
  },

  // --- atolye ve etkinlik salonlari ---
  {
    slug: "bambola-atolye-sinifi-01",
    alt: "Bambola atölye sınıfı, oyuncak ve malzeme dolapları ile çocuk masaları",
    ...YATAY,
    alan: "atolye",
  },
  {
    slug: "bambola-atolye-sinifi-02",
    alt: "Bambola atölye sınıfında eğitici halı ve depolama üniteleri",
    ...YATAY,
    alan: "atolye",
  },
  {
    slug: "bambola-atolye-sinifi-03",
    alt: "Duvar çizimleriyle bezeli Bambola atölye sınıfı ve sanat malzemeleri köşesi",
    ...DIKEY,
    alan: "atolye",
  },
  {
    slug: "bambola-etkinlik-salonu-dinozor-duvari-01",
    alt: "Dinozor duvar resimli Bambola etkinlik salonu ve çocuk boyu ahşap masalar",
    ...YATAY,
    alan: "atolye",
    genisVar: true,
  },
  {
    slug: "bambola-etkinlik-salonu-dinozor-duvari-02",
    alt: "Bambola etkinlik salonunda grup çalışmaları için hazırlanmış masa düzeni",
    ...DIKEY,
    alan: "atolye",
  },
  {
    slug: "bambola-etkinlik-salonu-dinozor-duvari-03",
    alt: "Bambola etkinlik salonunun terasa açılan cam cepheli geniş açı görünümü",
    ...DIKEY,
    alan: "atolye",
  },

  // --- bahce ve teras ---
  {
    slug: "bambola-bahce-kum-havuzu-01",
    alt: "Bambola'nın kapalı bahçe alanındaki ahşap kum havuzu ve deniz temalı duvar resmi",
    ...YATAY,
    alan: "bahce",
  },
  {
    slug: "bambola-teras-01",
    alt: "Tenteli Bambola terasında oturma grupları ve yön tabelası",
    ...YATAY,
    alan: "bahce",
    genisVar: true,
  },
  {
    slug: "bambola-teras-02",
    alt: "Bambola terasında rahat koltuklar ve gölgelikli dinlenme alanı",
    ...DIKEY,
    alan: "bahce",
  },
  {
    slug: "bambola-teras-03",
    alt: "Bambola terasında doğum günü ve grup etkinlikleri için uzun masa düzeni",
    ...DIKEY,
    alan: "bahce",
  },
  {
    slug: "bambola-teras-cicek-detay-01",
    alt: "Bambola teras korkuluğu, sardunyalar ve rüzgârgülü detayı",
    ...DIKEY,
    alan: "bahce",
  },

  // --- kafe ---
  {
    slug: "bambola-kafe-ic-mekan-01",
    alt: "Bambola kafe iç mekânı, cadde cepheli pencereler ve ahşap oturma grupları",
    ...YATAY,
    alan: "kafe",
  },
  {
    slug: "bambola-kafe-pencere-kenari-01",
    alt: "Bambola kafede pencere kenarı oturma alanı ve aile masaları",
    ...YATAY,
    alan: "kafe",
    genisVar: true,
  },

  // --- bina ---
  {
    slug: "bambola-koridor-01",
    alt: "Bambola sınıf katı koridoru ve sınıflara açılan camlı kapılar",
    ...DIKEY,
    alan: "genel",
  },
  {
    slug: "bambola-koridor-02",
    alt: "Bambola koridorunun sınıflara açılan turuncu zeminli görünümü",
    ...DIKEY,
    alan: "genel",
  },
  {
    slug: "bambola-yon-tabelasi-01",
    alt: "Bambola'nın oyun merkezi, atölye ve okula hazırlık gruplarını gösteren yön tabelası",
    ...DIKEY,
    alan: "genel",
  },
];

const HARITA = new Map(FOTOGRAFLAR.map((f) => [f.slug, f]));

/**
 * Slug'dan fotografi getirir. Bulunamazsa hata verir: sessizce bos gorsel
 * basmaktansa derleme/gelistirme sirasinda patlamasi iyidir.
 */
export function foto(slug: string): Fotograf {
  const f = HARITA.get(slug);
  if (!f) throw new Error(`Fotograf yok: ${slug}`);
  return f;
}

/** Birden cok fotografi sirayla getirir. */
export const fotolar = (...sluglar: string[]) => sluglar.map(foto);

/** `public/foto/` altindaki dosya yolu. */
export const fotoYolu = (f: Fotograf, genis = false) =>
  `/foto/${f.slug}${genis && f.genisVar ? "-genis" : ""}.jpg`;
