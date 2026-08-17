/**
 * Yasal metinlerin listesi. Tek kaynak: footer baglantilari, yasal
 * sayfalarin birbirine verdigi baglantilar ve veri testi bunu okuyor.
 *
 * Neden ayri dosya: `components/site/yasal-sayfa.tsx` bunu import ediyor ve
 * footer da import ediyor; sabiti bilesenin icine koymak footer'i bilesene
 * bagimli kilardi.
 *
 * INDEKSLENMIYOR (`indeks: false`). Yasal metinler arama sonucunda
 * gorunmesi gereken sayfalar degil; site icinden ve footer'dan erisiliyor,
 * sitemap'e de girmiyorlar. Bkz. app/sitemap.ts.
 */
export const YASAL_SAYFALAR = [
  {
    ad: "KVKK aydınlatma metni",
    yol: "/kvkk",
    ozet: "Kayıt formundaki verilerin hangi amaçla işlendiği ve haklarınız",
  },
  {
    ad: "Gizlilik politikası",
    yol: "/gizlilik",
    ozet: "Hangi veriyi topluyoruz, nerede duruyor, kim erişiyor",
  },
  {
    ad: "Çerez politikası",
    yol: "/cerez",
    ozet: "Sitede hangi çerez ve tarayıcı deposu kullanılıyor",
  },
  {
    ad: "Kullanım koşulları",
    yol: "/kosullar",
    ozet: "Sitenin kullanımı, içerik hakları ve sorumluluk sınırları",
  },
] as const;
