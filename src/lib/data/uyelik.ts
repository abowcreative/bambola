/**
 * Uyelik formu metinleri.
 *
 * Kaynak: kurumun elindeki Word formu (10 Agustos 2026'da ekran goruntusu
 * olarak geldi). Maddeler birebir korundu, yalnizca bir tanesi tasindi:
 *
 * ESKI 3. MADDE, gorsel kullanim izni. Eski metin "veliler ... cekilmesini en
 * bastan kabul eder ve ... suresiz olarak kullanilmasina da izin verir"
 * diyordu. Bu, KVKK acisindan riskli: acik riza belirli, bilgilendirilmis ve
 * ozgur iradeyle verilmis olmali; hizmetin sarti haline getirilemez ve
 * "suresiz" gibi sinirsiz bir kapsamla alinamaz. Madde kurallardan cikarildi,
 * formun altinda AYRI ve ISTEGE BAGLI onay kutusuna tasindi. Veli
 * isaretlemezse uyeligi etkilenmez.
 */

export const UYELIK_BASLIK = "Üyelik Formu";

/** Onay paragrafi. Bosluklar veli tarafindan elle doldurulur. */
export const UYELIK_ONAY_METNI =
  "T.C. kimlik numarası ______________________ olan ______________________________ " +
  "için velisi tarafından aktarılacak ________________ değerindeki oyun grubu " +
  "hizmet bedelinin eksiksiz bir şekilde ödenmesi karşılığında, kayıt tarihinden " +
  "itibaren oyun gruplarına 1 aylık süre içinde ________ kez katılım hakkı " +
  "sağlanması işletme yönetimi tarafından onaylanmıştır.";

/** Oyun grubu ve isletme kurallari. Kurumun metni, birebir. */
export const UYELIK_KURALLARI = [
  "Oyun gruplarına ve ilgili faaliyetlere çocukla beraber 1. ya da en az 2. derece akrabalık derecesinde yakınlığı bulunan bir ebeveynin eşlik etmesi zorunludur. Faaliyetler sırasında yaş grubuna göre ebeveynin atölye alanında bulunma zorunluluğu ayrıca uzman öğretmenlerimiz tarafından belirlenecektir.",
  "Oyun gruplarının yapıldığı alanlara ve serbest oyun alanlarına yiyecek ve içecek ile girmek kesinlikle yasaktır. Ayrıca oyun grubu faaliyetlerinin yapıldığı alanlara oyuncak ile girmek de yasaktır.",
  "İşletme sahiplerine ön bilgi verilmeden dışarıdan yiyecek ve içecek getirmek yasaktır. Özellikle de ambalajlı ürünlerin getirilmesi kesinlikle yasaktır.",
  "Her programın, ödeme tarihinden itibaren 1 ay içinde tamamlanması gerekir. Gruplarda uygunluk durumuna göre telafiler yapılacaktır.",
  "Serbest oyun alanlarında ya da diğer faaliyetlerde çocuklar için oluşabilecek yaralanma ya da genel olumsuz durumlardan işletme sorumlu değildir.",
];

/**
 * Ayri onay kutulari. Her biri istege bagli veya zorunlu olarak isaretlenir.
 * Zorunlu olan yalniz KVKK aydinlatmasidir; digerleri onay verilmezse de
 * uyelik kurulur.
 */
export const UYELIK_ONAYLARI = [
  {
    zorunlu: true,
    baslik: "Aydınlatma metni",
    metin:
      "Kişisel verilerimin üyelik ve iletişim süreçleri için işlendiğine dair aydınlatma metnini okudum.",
  },
  {
    zorunlu: false,
    baslik: "Görsel kullanım izni",
    metin:
      "Çocuğumun kurumda çekilen fotoğraf ve videolarının sosyal medya ve tanıtım çalışmalarında kullanılmasına izin veriyorum. Bu izni dilediğim zaman geri alabilirim.",
  },
  {
    zorunlu: false,
    baslik: "Ticari ileti izni",
    metin:
      "Yeni gruplar, etkinlikler ve kampanyalar hakkında bilgilendirme yapılmasına izin veriyorum.",
  },
];

/** Formun ust kismindaki kimlik alanlari. */
export const UYELIK_ALANLARI = {
  // Cocuk ve veli tek bolumde: ayri baslik sayfada 9mm yer yiyordu.
  kisiler: [
    { etiket: "Çocuğun adı ve soyadı", genislik: 2 },
    { etiket: "Doğum tarihi", genislik: 1 },
    { etiket: "Çocuğun T.C. kimlik no", genislik: 1 },
    { etiket: "Veli adı ve soyadı", genislik: 2 },
    { etiket: "Yakınlık derecesi", genislik: 1 },
    { etiket: "Veli T.C. kimlik no", genislik: 1 },
    { etiket: "Telefon", genislik: 2 },
    { etiket: "E-posta", genislik: 2 },
  ],
  kayit: [
    { etiket: "Program", genislik: 2 },
    { etiket: "Yaş grubu", genislik: 1 },
    { etiket: "Gün", genislik: 1 },
    { etiket: "Saat", genislik: 1 },
    // "adedi" degil "hakki": musteri 11 Agustos 2026'da boyle istedi.
    // Onay paragrafi da zaten "kez katilim hakki saglanmasi" diyor.
    { etiket: "Aylık katılım hakkı", genislik: 1 },
    { etiket: "Ücret", genislik: 1 },
    { etiket: "Kayıt tarihi", genislik: 1 },
  ],
} as const;
