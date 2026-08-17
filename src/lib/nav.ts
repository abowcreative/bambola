/**
 * Site gezinme yapisi. PLAN.md Bolum 5, sayfa agacindan birebir.
 */

export type NavOge = {
  ad: string;
  href: string;
  alt?: { ad: string; href: string; aciklama?: string }[];
};

export const ANA_MENU: NavOge[] = [
  {
    ad: "Oyun Evi",
    href: "/oyun-evi",
    alt: [
      {
        ad: "Programlar",
        href: "/oyun-evi/programlar",
        aciklama: "Oyun gruplari ve atolyeler",
      },
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
