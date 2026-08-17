/**
 * Sik sorulan sorular. FAQPage schema bu listeden uretilir.
 *
 * KURAL: Her cevap Excel'den veya PLAN.md'deki dogrulanmis olgulardan cikar.
 * Teyit bekleyen hicbir konu (MEB ifadesi, adres, telefon, kontenjan doluluk,
 * KDV, parti fiyatlari) burada cevaplanmaz.
 */

export type Soru = {
  soru: string;
  cevap: string;
  kategori: "genel" | "program" | "ucret" | "kayit";
  /** Hangi program sayfalarinda da gosterilecegi. Bos ise yalniz /sss. */
  atolyeler?: string[];
};

export const SORULAR: Soru[] = [
  {
    soru: "Gruplar kaç kişilik?",
    cevap:
      "Grupları küçük tutuyoruz: Okula Hazırlık Gruplarında 12, diğer bütün gruplarda 8 çocuk. Böylece her çocuk öğretmenin ilgisini görüyor.",
    kategori: "genel",
  },
  {
    soru: "Çocuğum kaç aylıkken başlayabilir?",
    cevap:
      "Bebek Oyun Grubu 6 aydan itibaren başlar. 12 aydan sonra oyun grupları, 30 aydan sonra Okula Hazırlık Grupları açılır. Atölyeler 3-5 yaş aralığına kadar sürer.",
    kategori: "genel",
  },
  {
    soru: "Ebeveyn etkinliğe katılıyor mu?",
    cevap:
      "Evet. Oyun gruplarında ve bebek gruplarında ebeveyn çocuğa eşlik eder; çocuk güvenli ayrılmayı sağlayana kadar bu böyle sürer. Okula Hazırlık Grupları ile Salı günkü Oyunlarla Matematik Atölyesi ebeveynsizdir; çocuk gruba tek başına katılır.",
    kategori: "program",
  },
  {
    soru: "Güvenli ayrılma programı nedir?",
    cevap:
      "Çocuğun ebeveyninden ayrılarak gruba tek başına katılmaya hazırlandığı süreçtir. Oyun gruplarından Okula Hazırlık Gruplarına geçiş bu program üzerinden yapılır.",
    kategori: "program",
    atolyeler: ["guvenli-ayrilma-programi", "okula-hazirlik-grubu"],
  },
  {
    soru: "Tek seferlik katılabilir miyim?",
    cevap:
      "Bazı atölyelere tek katılımla girilebilir: Oyunlarla Matematik, İngilizce Oyun Grubu, Şarkılı Masal ve Sanat Atölyesi, Minik Beyinler Laboratuvarı. Okula Hazırlık Gruplarında tek seferlik katılım yoktur.",
    kategori: "kayit",
  },
  {
    soru: "Günün akışı nasıl?",
    cevap:
      "Her grup gününün ilk bir saati serbest oyundur. Öğle arası her gün 12.30 - 13.30 arasındadır. Ara öğün yalnızca Okula Hazırlık Gruplarında verilir.",
    kategori: "program",
  },
  {
    soru: "Hafta sonu açık mısınız?",
    cevap:
      "Cumartesi dolu bir program işliyor: şarkılı masal, matematik atölyesi, oyun grupları ve serbest oyun. Pazar günü grup programı yoktur.",
    kategori: "genel",
  },
  {
    soru: "Etkinliği kaçırırsam telafi var mı?",
    cevap:
      "Hafta içi öğleden önce ve öğleden sonra olmak üzere iki grup açılır. Uygunluk olması durumunda gruplar arasında telafi yapılabilir.",
    kategori: "program",
  },
  {
    soru: "İngilizce hangi programlarda var?",
    cevap:
      "Okula Hazırlık Gruplarında her gün 1 saat İngilizce vardır. İngilizce Oyun Grubu tamamen İngilizce işlenir. Gelişim Odaklı Oyun Grubuna haftada 2 gün katılan çocuklarımıza haftada 1 İngilizce oyun grubu hediyedir.",
    kategori: "program",
  },
  {
    soru: "Serbest oyun ücretli mi?",
    cevap:
      "Kayıtlı çocuklara hafta sonu belirlenen zaman diliminde 1 saat serbest oyun ücretsizdir; bu, kayıtlı olmayan çocuklar için geçerli değildir. Ayrıca her grup gününün ilk bir saati serbest oyun olarak geçer.",
    kategori: "ucret",
  },
  {
    soru: "Erken kayıt indirimi nasıl uygulanıyor?",
    cevap:
      "Erken kayıt döneminde, 10 Ağustos ile 1 Eylül arasında, paket ücretlerinde yüzde 20 indirim uygulanır. İndirimden peşin ödeme koşuluyla faydalanılır: kredi kartı, havale veya nakit. En fazla 3 ay faydalanılabilir ve her programın ödeme tarihinden itibaren 1 ay içinde tamamlanması gerekir. Tek seferlik katılım fiyatlarına indirim uygulanmaz.",
    kategori: "ucret",
  },
  {
    soru: "Kayıt nasıl yapılıyor?",
    cevap:
      "Şu an kayıtları WhatsApp ve telefonla alıyoruz: yazın, çocuğunuzun yaşına uygun grupları, gün ve saatleri birlikte netleştirelim. Online kayıt formu çok yakında açılıyor.",
    kategori: "kayit",
  },
  {
    soru: "Uygun bir saat bulamazsam ne olur?",
    cevap:
      "Size uyan gün ve saat aralığını WhatsApp'tan yazın. Uyan bir saat yoksa onu da söyleyin: bu talepler yeni grup açarken dikkate alınıyor.",
    kategori: "kayit",
  },
];

export function sorularKategori(k: Soru["kategori"]): Soru[] {
  return SORULAR.filter((s) => s.kategori === k);
}

export function atolyeSorulari(slug: string): Soru[] {
  return SORULAR.filter((s) => s.atolyeler?.includes(slug));
}
