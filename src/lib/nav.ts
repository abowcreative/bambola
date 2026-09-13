/**
 * Site gezinme yapisi. PLAN.md Bolum 5, sayfa agacindan birebir.
 */
import { ATOLYELER } from "./data/atolyeler";

export type NavAlt = { ad: string; href: string; aciklama?: string };

export type NavOge = {
  ad: string;
  href: string;
  alt?: NavAlt[];
};

/**
 * "Gruplarimiz" menusunun sirasi. Kurum karari, 12 Eylul 2026: veli ust
 * cubuktan dogrudan grubun sayfasina gidebilmeli.
 *
 * SIRA ELLE YAZILIYOR ama ADLAR YAZILMIYOR. Sira yasa gore kuruluyor ve
 * ATOLYELER dizisinin kendi sirasi bunu vermiyor; ad ile yas etiketi ise
 * tek kaynaktan, atolye verisinden geliyor. Bir grubun adi degistiginde
 * menu kendiliginde dogru kaliyor.
 *
 * Listede olmayan bir slug yazilirsa uretim ANINDA patlar; sessizce eksik
 * bir menu cikmasindansa derleme durmali.
 *
 * KAPSAM KURALI, 13 Eylul 2026: haftalik programda seansi olan her grup bu
 * listede olmali. Eksiksizligi scripts/veri-testi.ts kontrol ediyor; sira
 * elle, kapsam otomatik. Ayni gun Cumartesi 13.30 seansi
 * ("Hafta Sonu Oyun Grubu") bu kuralla eklendi: takvimde ayri bir grup olarak
 * gorunuyordu ama kendi sayfasi ve dolayisiyla menude yeri yoktu.
 *
 * SIRA YASA GORE, ADA GORE DEGIL. Adlar birbirini tutmuyor: biri ayla
 * basliyor ("6-12 Ay Bebek Grubu"), biri gunle ("Hafta Sonu Oyun Grubu"),
 * biri sifatla ("Gelisim Odakli Bebek Oyun Grubu"). Alfabetik sira bu ucunu
 * birbirinden ayirirdi; veli ise yasina gore ariyor.
 */
const GRUP_SIRASI = [
  "bebek-grubu-6-12",
  "hafta-sonu-oyun-grubu",
  "gelisim-odakli-bebek-oyun-grubu",
  "bebek-oyun-grubu",
  "gelisim-odakli-oyun-grubu",
  "ingilizce-oyun-grubu",
  "okula-hazirlik-grubu",
] as const;

const GRUP_MENUSU: NavAlt[] = [
  ...GRUP_SIRASI.map((slug) => {
    const a = ATOLYELER.find((x) => x.slug === slug);
    if (!a) throw new Error(`Gruplarımız menüsünde bulunamayan slug: ${slug}`);
    return {
      ad: a.ad,
      href: `/oyun-evi/programlar/${a.slug}`,
      aciklama: a.yasEtiket,
    };
  }),
  {
    ad: "Bütün programlar",
    href: "/oyun-evi/programlar",
    aciklama: "Atölyeler dahil tam liste",
  },
];

export const ANA_MENU: NavOge[] = [
  {
    ad: "Oyun Evi",
    href: "/oyun-evi",
    alt: [
      /*
        "Programlar" satiri buradan KALKTI: artik "Gruplarimiz" menusunun
        son maddesi. Iki menude ayni baglanti, kullaniciya iki farkli yer
        vaat ediyor gibi duruyordu.
      */
      {
        ad: "Haftalık Program",
        href: "/oyun-evi/haftalik-program",
        aciklama: "Hangi gün, hangi saat",
      },
      {
        ad: "Ücretler",
        href: "/oyun-evi/ucretler",
        aciklama: "Paketler ve erken kayıt",
      },
      {
        ad: "Mekân",
        href: "/mekan",
        aciklama: "Oyun alanları, atölyeler, bahçe",
      },
    ],
  },
  { ad: "Gruplarımız", href: "/oyun-evi/programlar", alt: GRUP_MENUSU },
  { ad: "Anaokulu", href: "/anaokulu" },
  { ad: "Parti", href: "/parti" },
  { ad: "Hakkımızda", href: "/hakkimizda" },
  { ad: "S.S.S.", href: "/sss" },
  { ad: "İletişim", href: "/iletisim" },
];

/** Footer'daki ikincil baglantilar. */
export const FOOTER_MENU: { baslik: string; ogeler: NavOge[] }[] = [
  {
    baslik: "Oyun Evi",
    ogeler: [
      { ad: "Oyun evi", href: "/oyun-evi" },
      { ad: "Programlar", href: "/oyun-evi/programlar" },
      { ad: "Haftalık program", href: "/oyun-evi/haftalik-program" },
      { ad: "Ücretler", href: "/oyun-evi/ucretler" },
    ],
  },
  {
    baslik: "Kurum",
    ogeler: [
      { ad: "Hakkımızda", href: "/hakkimizda" },
      { ad: "Ekip", href: "/ekip" },
      // Fotograflar 16 Agustos 2026'da geldi, /mekan acildi.
      // PLAN.md Bolum 14 madde 7.
      { ad: "Mekân", href: "/mekan" },
      /*
        "Gruplarimiz" satiri 12 Eylul 2026'da yanlislikla BURAYA da dusmustu
        (ust cubuk yamasi iki yere uygulandi). Footer'in "Oyun Evi"
        sutunundaki "Programlar" ayni adrese gidiyor; ayni footer'da ayni
        hedefe iki baglanti, veliye iki farkli yer vaat ediyor gibi
        duruyordu. Alt menu de footer'da hic basilmiyor, yani GRUP_MENUSU
        burada bir ise yaramiyordu.
      */
      { ad: "Anaokulu", href: "/anaokulu" },
    ],
  },
  {
    baslik: "Yardım",
    ogeler: [
      { ad: "Sık sorulan sorular", href: "/sss" },
      { ad: "İletişim", href: "/iletisim" },
      { ad: "Doğum günü ve parti", href: "/parti" },
      /*
        Yasal metinler bu sutunda DEGIL, footer'in en altindaki kendi
        seridinde duruyor (bkz. lib/yasal.ts). Dordu birden bu listeye
        girseydi "Yardim" sutunu yasal metin listesine donusurdu.
      */
    ],
  },
];
