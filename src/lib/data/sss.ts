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
      "Bebek Grubu 6 aydan itibaren başlar. 12 aydan sonra Gelişim Odaklı Bebek Oyun Grubu ve diğer oyun grupları, 30 aydan sonra Okula Hazırlık Grupları açılır. Atölyeler 3-5 yaş aralığına kadar sürer.",
    kategori: "genel",
  },
  {
    soru: "Ebeveyn etkinliğe katılıyor mu?",
    cevap:
      "Evet. Oyun gruplarında ve bebek gruplarında ebeveyn çocuğa eşlik eder. Okula Hazırlık Gruplarında da ilk aşamada ebeveyn çocuğuna eşlik edebilir; çocuk ortama ve öğretmenine güven kazandıkça süreç adım adım ebeveynsiz devam eder.",
    kategori: "program",
  },
  {
    soru: "Güvenli ayrılma programı nedir?",
    cevap:
      "Çocuğun ebeveyninden ayrılarak gruba tek başına katılmaya hazırlandığı süreçtir. İlk aşamada ebeveyn çocuğuna eşlik eder; çocuk öğretmeniyle ve yeni ortamıyla tanışırken ebeveyninin yakınında olduğunu bilir. Güven kazandıkça süreç adım adım ebeveynsiz devam eder. Böylece ayrılık bir anda gerçekleşen zorlayıcı bir deneyim olmaktan çıkar. Oyun gruplarından Okula Hazırlık Gruplarına geçiş bu program üzerinden yapılır.",
    kategori: "program",
    atolyeler: ["guvenli-ayrilma-programi", "okula-hazirlik-grubu"],
  },
  {
    soru: "Tek seferlik katılabilir miyim?",
    cevap:
      "İngilizce Oyun Grubuna tek katılımla girilebilir. Tarihli workshoplara da tek seferlik katılınır. Okula Hazırlık Gruplarında tek seferlik katılım yoktur.",
    kategori: "kayit",
  },
  {
    soru: "Günün akışı nasıl?",
    cevap:
      "İki saatlik oyun gruplarında bir saat atölye, bir saat serbest oyun yapılır; sıralama grubun programına ve o saatte alanı kullanan diğer gruba göre planlanır. Öğle arası her gün 12.30 - 13.30 arasındadır. Ara öğün yalnızca Okula Hazırlık Gruplarında verilir.",
    kategori: "program",
  },
  {
    soru: "Hafta sonu açık mısınız?",
    cevap:
      "Cumartesi dolu bir program işliyor: İngilizce oyun grupları, gelişim odaklı oyun grupları ve bebek grupları. Pazar günü grup programı yoktur; özel etkinlikler ve doğum günü partileri rezervasyonla yapılır.",
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
      "Kayıtlı çocuklara hafta sonu belirlenen zaman diliminde 1 saat serbest oyun ücretsizdir; bu, kayıtlı olmayan çocuklar için geçerli değildir. Ayrıca iki saatlik oyun gruplarının bir saati serbest oyun olarak geçer.",
    kategori: "ucret",
  },
  /*
    "Erken kayit indirimi nasil uygulaniyor?" sorusu 12 Eylul 2026'da
    KALDIRILDI. Kampanya penceresi 1 Eylul'de kapandi (bkz. ucretler.ts
    KAMPANYA_PENCERESI) ve fiyat kartlari o gun kendiliginden indirimsiz
    fiyata dondu; sorunun kendisi ise statik metindi ve bitmis bir indirimi
    anlatmaya devam ediyordu.

    YENI BIR KAMPANYA ACILIRSA: soru geri gelmeli ama TARIHI ELLE
    YAZILMAMALI. Metin KAMPANYA_PENCERESI.metin'den uretilmeli, yoksa ayni
    sey ikinci kez olur.
  */
  {
    soru: "Kayıt nasıl yapılıyor?",
    cevap:
      "Kayıtları WhatsApp ve telefonla alıyoruz: yazın ya da arayın, çocuğunuzun yaşına uygun grupları, gün ve saatleri birlikte netleştirelim. Site üzerinden doldurulacak bir form yok.",
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
