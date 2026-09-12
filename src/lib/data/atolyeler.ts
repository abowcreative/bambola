import type { Atolye, AtolyeSlug } from "./types";

/**
 * Atolye ve program tanimlari. PLAN.md Bolum 6.4.
 *
 * DIKKAT: "aciklama" alani bilerek null. Atolyelerin pedagojik aciklamalari
 * kurumdan alinacak, uydurma icerik yazilmaz (PLAN.md Bolum 14 madde 5).
 * "olgular" alani yalnizca Excel'den dogrudan cikan, dogrulanmis bilgileri
 * tasir. Aciklama geldiginde tek yerden doldurulur.
 */

export const ATOLYELER: Atolye[] = [
  {
    /*
      12 Eylul 2026, IKINCI TUR: yas etiketi "2,5 yas ve uzeri, ebeveynsiz"
      ve olgu satiri "Cocuk gruba ebeveyni olmadan katilir" BURADA KALMISTI.
      Ayni turda aile metni (gruplar.ts) ve Guvenli Ayrilma olgulari
      duzeltilmisti; bu iki satir gozden kacti ve sayfanin kendi anlatimiyla
      celisiyordu: anlatim "ilk asamada ebeveyn eslik edebilir" diyor,
      basligin yanindaki etiket "ebeveynsiz" diyordu.

      Ebeveynsizlik programin SONUCU, giris sarti degil. Etiket bunu artik
      iddia etmiyor, olgu satiri sureci anlatiyor.
    */
    slug: "okula-hazirlik-grubu",
    ad: "Okula Hazırlık Grubu",
    kisaAd: "Okula Hazırlık",
    yasEtiket: "2,5 yaş ve üzeri",
    dil: "karma",
    ailesi: "okula-hazirlik",
    aciklama: null,
    olgular: [
      "Haftada 3 gün, günde 3 saat, bütünleştirilmiş etkinlikler",
      "Her gün 1 saat İngilizce, 1 saat Türkçe ve tematik atölye",
      "Güvenli ayrılma: ilk aşamada ebeveyn eşlik edebilir, çocuk güven kazandıkça süreç ebeveynsiz devam eder",
      "Güne başlama, egzersiz ve ara öğün rutinleri",
      "Gelişim takibi yapılır",
      "Tek seferlik katılım yoktur",
    ],
    /* Kurumdan gelen uzun anlatim, 12 Eylul 2026. Metin kurumun kalemiyle;
       yalnizca emoji isaretleri madde listesine cevrildi ve kurum adinin
       farkli yazilmis hali cikarildi. */
    anlatim: [
      {
        baslik: null,
        paragraflar: [
          "Okula başlamak yalnızca akademik beceriler kazanmak değildir.",
          "Çocuğun yeni bir ortama güvenle adım atması, öğretmeniyle bağ kurması, arkadaşlarıyla iletişim kurması, günlük rutinlere alışması, kendi ihtiyaçlarını ifade edebilmesi ve ebeveyninden güvenli bir şekilde ayrışabilmesi de okul hazırlığının önemli bir parçasıdır.",
          "Okula hazırlık gruplarımızı, çocukların okul yaşamına adım adım ve güven içerisinde hazırlanabilecekleri bir süreç olarak planlıyoruz.",
          "Programımız haftada 3 gün, günde 3 saat şeklinde ilerliyor. Ancak bizim için bu üç saat yalnızca etkinliklerden oluşmuyor: çocukların okul yaşamında karşılaşacakları rutinleri deneyimlediği, sosyal ilişkiler kurduğu, bağımsızlaştığı ve farklı gelişim alanlarının desteklendiği bütüncül bir süreç sunuyoruz.",
        ],
        maddeler: [],
      },
      {
        baslik: "Güvenli ayrılma programı",
        paragraflar: [
          "Okula başlama sürecinde en önemli adımlardan biri, çocuğun ebeveyninden güvenli bir şekilde ayrışabilmesidir. Bu nedenle programımızda güvenli ayrılma sürecine özel olarak yer veriyoruz.",
          "İlk aşamada ebeveyn, çocuğuna eşlik ederek sürece dahil olabiliyor. Çocuk öğretmeniyle, arkadaşlarıyla ve yeni ortamıyla tanışırken ebeveyninin yakınında olduğunu bilmenin verdiği güveni hissediyor.",
          "Çocuk ortama ve öğretmenine güven kazandıkça süreç adım adım ebeveynsiz devam ediyor.",
          "Böylece çocuk için ayrılık bir anda gerçekleşen zorlayıcı bir deneyim olmaktan çıkıyor; güven duygusu içerisinde, kendi hızında ilerleyen doğal bir geçiş sürecine dönüşüyor.",
        ],
        maddeler: [],
      },
      {
        baslik: "Güne başlama rutini",
        paragraflar: [
          "Her güne belirli bir rutinle başlıyoruz. Birlikte güne başlıyor, günün akışını tanıyor ve grup içerisinde hareket etmeyi öğreniyoruz.",
          "Öngörülebilir rutinler sayesinde çocukların kendilerini güvende hissetmelerini ve okul düzenine uyum sağlamalarını destekliyoruz.",
        ],
        maddeler: [],
      },
      {
        baslik: "Egzersiz rutini",
        paragraflar: [
          "Güne hareket ederek başlıyoruz. Egzersiz ve hareket çalışmalarımızla kaba motor gelişimini, dengeyi, koordinasyonu, beden farkındalığını ve hareket becerilerini destekliyoruz.",
        ],
        maddeler: [],
      },
      {
        baslik: "Ara öğün rutini",
        paragraflar: [
          "Ara öğünümüzü birlikte yapıyoruz. Çocuklar günlük yaşam içerisinde kendi ihtiyaçlarını ifade etmeyi, kişisel sorumluluklarını yerine getirmeyi ve grup içerisindeki yemek rutinine uyum sağlamayı deneyimliyor.",
        ],
        maddeler: [],
      },
      {
        baslik: "İngilizce atölye, 1 saat",
        paragraflar: [
          "İngilizceyi oyun, şarkı, hikâye, hareket ve etkileşim yoluyla deneyimliyoruz.",
          "Çocukların İngilizceyi doğal bir ortam içerisinde duymalarını, eğlenerek keşfetmelerini ve yabancı dile karşı olumlu bir yaklaşım geliştirmelerini destekliyoruz.",
        ],
        maddeler: [],
      },
      {
        baslik: "Türkçe ve tematik atölye, 1 saat",
        paragraflar: [
          "Temalarımızı birbirinden bağımsız değil, birbiriyle bağlantılı ve birbirini pekiştirecek şekilde planlıyoruz.",
          "Çocuk bir temayı yalnızca dinlemiyor: onu oynuyor, hareket ediyor, canlandırıyor, üretiyor, keşfediyor ve deneyimliyor. Bir gün karşılaştığı kavramı başka bir etkinlikte yeniden kullanıyor, böylece farklı deneyimler arasında bağlantı kuruyor ve öğrendiklerini pekiştiriyor.",
          "Çocuklar temaları şu yollarla deneyimliyor:",
        ],
        maddeler: [
          "Drama ve canlandırmalar",
          "Sanat ve üretim çalışmaları",
          "İnce motor etkinlikleri",
          "Hareket ve kaba motor çalışmaları",
          "Düşünme ve problem çözme oyunları",
          "Sohbet ve ifade çalışmaları",
          "Keşif ve gözlem etkinlikleri",
        ],
      },
      {
        baslik: "Serbest oyun alanı",
        paragraflar: [
          "Günün bir bölümünde çocuklara serbest oyun alanında kendi oyunlarını kurabilecekleri özgür bir alan sunuyoruz.",
          "Çünkü oyun bizim için yalnızca eğlence değil; iletişim kurma, seçim yapma, problem çözme, yaratıcılık, sosyal ilişki kurma ve öğrenilenleri doğal biçimde pekiştirme alanı.",
          "Çocuk kendi oyununu kuruyor, arkadaşlarıyla etkileşime giriyor ve günlük yaşamda karşılaştığı durumları oyun yoluyla yeniden deneyimliyor.",
        ],
        maddeler: [],
      },
      {
        baslik: "Bu programda çocuk ne kazanıyor?",
        paragraflar: [],
        maddeler: [
          "Okul rutinlerini tanıyor",
          "Ebeveyninden güvenli şekilde ayrışmayı deneyimliyor",
          "Öğretmeniyle güven ilişkisi kuruyor",
          "Grup içerisinde hareket etmeyi öğreniyor",
          "Arkadaşlarıyla iletişim kuruyor",
          "Kendi ihtiyaçlarını ifade ediyor",
          "Bağımsızlık becerilerini geliştiriyor",
          "İnce ve kaba motor becerilerini geliştiriyor",
          "Drama, sanat, hareket ve oyun yoluyla kendini ifade ediyor",
          "Dikkat, koordinasyon ve problem çözme becerilerini destekliyor",
          "Temalar arasında bağlantı kurarak öğrendiklerini pekiştiriyor",
          "Farklı öğrenme deneyimleriyle özgüven kazanıyor",
          "Okul ortamını güvenli, eğlenceli ve keyifli bir deneyim olarak tanımaya başlıyor",
        ],
      },
      {
        baslik: "Bizim için okula hazırlık sadece akademik hazırlık değil",
        paragraflar: [
          "Çocuğun kalem tutması, sayı sayması ya da harfleri tanıması kadar şunları söyleyebilmesi de okul hazırlığının bir parçası:",
        ],
        maddeler: [
          "Ben burada güvendeyim.",
          "Öğretmenime güveniyorum.",
          "Annem ya da babam gidebilir ve geri gelir.",
          "Arkadaşlarımla oynayabilirim.",
          "Kendi başıma yapabilirim.",
        ],
      },
      {
        baslik: null,
        paragraflar: [
          "Bu nedenle çocuklarımızı okula bir anda bırakmak yerine; güvenli ayrılma, düzenli rutinler, oyun, temalar ve çok yönlü gelişim çalışmalarıyla adım adım hazırlıyoruz.",
          "Çünkü inanıyoruz ki okula hazır olmak sadece öğrenmeye hazır olmak değil, kendini güvende hissederek keşfetmeye hazır olmaktır.",
        ],
        maddeler: [],
      },
    ],
    ikon: "Ampul",
  },
  {
    slug: "gelisim-odakli-oyun-grubu",
    ad: "Gelişim Odaklı Oyun Grubu",
    kisaAd: "Gelişim Odaklı Oyun",
    yasEtiket: "1 - 3 yaş",
    // v2 Excel dili yazmiyor. PLAN.md Bolum 6.6 sonuc 2:
    // bu grupta "Ingilizce" iddiasi kullanilamaz, dil rozeti gosterilmez.
    dil: "tr",
    ailesi: "gelisim-odakli-oyun",
    aciklama: null,
    olgular: [
      "Haftada 2 gün, günde 2 saat, bütünleştirilmiş etkinlikler",
      "Gelişim takibi yapılır",
      "Güvenli ayrılma programına geçiş hazırlığı",
      "Gelişim Odaklı Oyun Grubuna haftada 2 gün katılan çocuklarımıza haftada 1 İngilizce oyun grubu hediyedir",
    ],
    anlatim: [],
    ikon: "Grup",
  },
  {
    /*
      6-12 ay 12 Eylul 2026'da AYRILDI (yukaridaki "bebek-grubu-6-12").
      Burada kalan seanslar: Cumartesi 13.30 (8-16 ay) ve 12-24 ay
      gruplari. Yas etiketi bu yuzden 6 aydan 8 aya cekildi.
    */
    slug: "bebek-oyun-grubu",
    ad: "Bebek Oyun Grubu",
    kisaAd: "Bebek Oyun Grubu",
    yasEtiket: "8 aylık - 2 yaş",
    dil: "tr",
    ailesi: "bebek",
    aciklama: null,
    olgular: [
      "Etkinlik süresi 2 saat: 1 saat atölye, 1 saat serbest oyun",
      "Bebek gruplarına ebeveyn eşlik eder",
      "En fazla 8 bebek",
    ],
    anlatim: [],
    ikon: "Bebek",
  },
  {
    /*
      6-12 ay AYRI BIR SAYFA oldu (12 Eylul 2026). Onceden "Bebek Oyun
      Grubu" sayfasinin (6 aylik - 2 yas) icindeydi; kurumdan gelen uzun
      6-12 anlatimi oraya konsaydi 12-24 ay seanslarini da anlatiyor
      gorunurdu. Reklamda gorulen baslik da ayni: "6-12 Ay Bebek Grubu".

      Tek seansi Sali 14.00 - 16.00. Ucret ailesi "bebek", fiyat degismedi.
    */
    slug: "bebek-grubu-6-12",
    ad: "Bebek Grubu",
    kisaAd: "Bebek Grubu",
    yasEtiket: "6-12 ay",
    dil: "tr",
    ailesi: "bebek",
    aciklama: null,
    olgular: [
      "Haftada 1 gün, günde 2 saat",
      "1 saat gelişim destekleyici atölye, 1 saat serbest oyun",
      "Yenilebilir duyusal materyaller, alerji bilgisine göre planlanır",
      "Müzik ve ukulele rutini",
      "Bebeğe ebeveyni eşlik eder",
      "En fazla 8 bebek",
    ],
    anlatim: [
      {
        baslik: null,
        paragraflar: [
          "Bebeklik dönemi; duyuların keşfedildiği, hareket becerilerinin geliştiği ve çevreyle kurulan etkileşimin her geçen gün arttığı çok özel bir dönemdir.",
          "6-12 ay bebek gruplarımız haftada 1 gün, 2 saat olacak şekilde ilerliyor.",
          "Bu iki saatlik süreçte bebeğin hem yapılandırılmış etkinliklere katılmasına hem de özgürce keşfedip oyun kurmasına fırsat sunuyoruz.",
        ],
        maddeler: [],
      },
      {
        baslik: "1 saat atölye",
        paragraflar: [
          "Atölye saatimizde her hafta farklı duyusal ve gelişim destekleyici deneyimler sunuyoruz.",
          "Özellikle bu yaş grubunda bebeklerin nesneleri ağızlarıyla keşfetme eğilimlerini göz önünde bulundurarak yenilebilir duyusal materyallere ağırlık veriyoruz.",
          "Materyallerimiz, ailelerden alınan bilinen alerji bilgileri doğrultusunda planlanıyor ve her etkinlik için özenle hazırlanıyor.",
          "Kullandığımız materyaller şu gelişim alanlarını destekleyecek şekilde seçiliyor:",
        ],
        maddeler: [
          "Dokunma ve keşif",
          "Görsel ve işitsel farkındalık",
          "El göz koordinasyonu",
          "Neden sonuç ilişkisi",
          "Merak ve keşif",
        ],
      },
      {
        baslik: "Müzik ve ukulele rutinimiz",
        paragraflar: [
          "Atölyelerimizin vazgeçilmezlerinden biri müzik ve ukulele. Ukulele eşliğinde şarkılar söylüyor, ritimler oluşturuyor ve müziği günlük rutinlerimizin doğal bir parçası hâline getiriyoruz.",
          "Bebeklerin farklı sesleri dinlemesi, ritmi fark etmesi, müziğe tepki vermesi ve seslerle etkileşime geçmesi için çeşitli fırsatlar oluşturuyoruz.",
          "Ukulele bizim için yalnızca bir etkinlik değil, rutinlerimizin bir parçası. Güne bazen bir şarkıyla başlıyor, bazen duyusal etkinliklerimize müzikle eşlik ediyor, bazen hareket ediyor, bazen de müzik eşliğinde sakinleşiyoruz.",
        ],
        maddeler: [],
      },
      {
        baslik: "Hareket ve motor gelişim",
        paragraflar: [
          "Bebeklerin doğal hareketlerini destekleyen çalışmalarla uzanma, kavrama, bırakma, dönme, emekleme ve hareket etme gibi becerilere uygun deneyimler sunuyoruz.",
          "Bebeğin kendi bedenini keşfetmesine ve hareket yoluyla çevresiyle etkileşim kurmasına fırsat veriyoruz.",
        ],
        maddeler: [],
      },
      {
        baslik: "Duyusal keşifler",
        paragraflar: [
          "Farklı dokular, şekiller, sesler ve güvenli materyallerle bebeğin duyularını kullanarak keşfetmesini destekliyoruz.",
          "Bebeğin dokunması, sıkması, karıştırması ve kendi yöntemleriyle keşfetmesi bizim için değerli bir öğrenme deneyimi. Çünkü bu dönemde keşfetmek, öğrenmenin en doğal yollarından biri.",
        ],
        maddeler: [],
      },
      {
        baslik: "1 saat serbest oyun",
        paragraflar: [
          "İkinci saatimizi serbest oyun alanımızda geçiriyoruz. Bebeğe kendi ilgisi doğrultusunda hareket edebileceği, keşfedebileceği ve çevresiyle etkileşime girebileceği özgür bir alan sunuyoruz.",
          "Serbest oyun sürecinde ebeveyn bebek etkileşimini, sosyal etkileşimi, çevreyi keşfetmeyi, motor becerileri, merak ve problem çözme becerilerini destekleyen doğal oyun fırsatları oluşturuyoruz.",
        ],
        maddeler: [],
      },
      {
        baslik: "Amacımız sadece etkinlik yapmak değil",
        paragraflar: [
          "Bebeğin iki saat boyunca farklı duyularını kullanabileceği, hareket edebileceği, müzikle buluşabileceği, ebeveyniyle kaliteli zaman geçirebileceği ve kendi hızında keşfedebileceği zengin bir deneyim alanı oluşturmayı hedefliyoruz.",
          "Her hafta farklı bir keşif, farklı bir duyusal deneyim ve farklı bir oyunla ilerliyoruz.",
          "Çünkü her bebeğin gelişimi kendine özgü. Biz de bebeğin kendi hızında, kendi merakı doğrultusunda ve güvenli bir ortamda keşfetmesine alan açıyoruz.",
        ],
        maddeler: [],
      },
    ],
    ikon: "Bebek",
  },
  {
    /*
      12 Eylul 2026'da kurumun bildirdigi yeni marka dili:
        6-12 ay  -> Bebek Grubu
        12-16 ay -> Gelisim Odakli Bebek Oyun Grubu
      Reklamda gorulen baslik sitede de birebir gorunsun diye ayri bir
      program sayfasi acildi.

      ADI "Gelisim Odakli Oyun Grubu" ILE KARISTIRMAYIN: o 16-36 ay icin
      ayri bir program. Ikisini ayirt eden kelime "Bebek"; bu yuzden ad
      hicbir yerde kisaltilarak yazilmaz.

      Ucret ailesi "bebek" kaldi: fiyat degismedi, yalniz ad ve yas bandi
      ayrildi.
    */
    slug: "gelisim-odakli-bebek-oyun-grubu",
    ad: "Gelişim Odaklı Bebek Oyun Grubu",
    kisaAd: "Gelişim Odaklı Bebek Oyun",
    yasEtiket: "12-16 ay",
    dil: "tr",
    ailesi: "bebek",
    aciklama: null,
    olgular: [
      "Günde 2 saat: 1 saat gelişim destekleyici atölye, 1 saat serbest oyun",
      "Yenilebilir duyusal materyaller, alerji bilgisine göre planlanır",
      "Müzik ve ukulele rutini",
      "Bebeğe ebeveyni eşlik eder",
      "En fazla 8 bebek",
    ],
    anlatim: [
      {
        baslik: null,
        paragraflar: [
          "12-16 ay dönemi; çocukların hareket alanlarının genişlediği, çevrelerini daha aktif keşfetmeye başladığı, taklit ettiği, iletişim kurduğu ve bağımsızlık duygusunun gelişmeye başladığı önemli bir dönemdir.",
          "12-16 ay gruplarımızı, çocukların gelişim dönemlerine uygun zengin deneyimler yaşayabilecekleri bir program olarak hazırladık.",
          /*
            KURUM METNI "haftada 2 gun, gunde 2 saat" diyor ve ihtiyaca gore
            haftada 1 gun secenegi oldugunu ekliyor. Takvimde bu grubun SU AN
            tek seansi var (Carsamba 15.00). Ikinci gun gelene kadar cumle
            gun sayisi TAAHHUT ETMIYOR, yoksa sayfanin kendi takvimiyle
            celisirdi. Ikinci gun bildirilince kurumun cumlesi aynen konur.
          */
          "Katılım günde 2 saat. Haftada kaç gün katılacağınızı ailenin programına göre birlikte belirliyoruz; güncel gün ve saatler haftalık programda.",
          "Bu süreçte çocukların hareket edebilecekleri, keşfedebilecekleri, oyun kurabilecekleri ve farklı deneyimler yaşayabilecekleri güvenli ve destekleyici bir ortam oluşturuyoruz.",
        ],
        maddeler: [],
      },
      {
        baslik: "1 saat atölye",
        paragraflar: [
          "Atölye saatimizde her hafta farklı içeriklerle çocukların gelişim alanlarını destekleyen deneyimler sunuyoruz.",
          "Bu yaş döneminde çocukların nesneleri dokunarak, hareket ederek ve deneyerek keşfetmelerini önemsiyoruz.",
          "Çocuğun yaşına ve gelişim dönemine uygun, güvenli ve doğal materyaller kullanıyoruz. Yenilebilir duyusal materyallere de sıklıkla yer veriyoruz. Kullanılan materyaller, ailelerden alınan bilinen alerji bilgileri doğrultusunda planlanıyor.",
          "Atölyede yer verdiğimiz çalışmalar:",
        ],
        maddeler: [
          "Duyusal keşifler",
          "Hareket çalışmaları",
          "Sanat ve üretim deneyimleri",
          "Müzik ve ritim",
          "Taklit oyunları",
          "Eşleştirme ve keşif etkinlikleri",
        ],
      },
      {
        baslik: "Müzik ve ukulele rutinimiz",
        paragraflar: [
          "Müzik ve ukulele atölyelerimizin vazgeçilmez parçalarından biri. Ukulele eşliğinde şarkılar söylüyor, ritimler oluşturuyor, çocukları müziğe ve harekete dahil ediyoruz.",
          "Çocukların şarkılara eşlik etmesi, hareketleri taklit etmesi, ritme tepki vermesi ve farklı sesleri keşfetmesi; işitsel farkındalık, dikkat, iletişim ve beden koordinasyonu açısından değerli deneyimler sunuyor.",
          "Ukulele yalnızca belirli bir etkinlikte kullandığımız bir materyal değil, rutinlerimizin doğal bir parçası.",
        ],
        maddeler: [],
      },
      {
        baslik: "Hareket ve motor gelişim",
        paragraflar: [
          "12-16 ay döneminde çocuklar hareket konusunda daha aktif hâle gelir. Yürüme, tırmanma, eğilme, taşıma, itme, çekme ve farklı yönlerde hareket etme gibi becerileri destekleyen oyunlara alan açıyoruz.",
          "Aynı zamanda kavrama, bırakma, yerleştirme ve aktarma gibi becerileri destekleyen çalışmalarla ince motor gelişimlerini de destekliyoruz.",
        ],
        maddeler: [],
      },
      {
        baslik: "İletişim, taklit ve sosyal etkileşim",
        paragraflar: [
          "Bu dönemde çocuklar çevrelerindeki yetişkinleri ve diğer çocukları gözlemleyerek birçok davranışı taklit etmeye başlar.",
          "Şarkılar, parmak oyunları, hareketli oyunlar, taklit çalışmaları ve birlikte yapılan etkinliklerle çocukların iletişim kurmasına, karşılıklı etkileşime girmesine ve kendilerini farklı yollarla ifade etmelerine fırsat sunuyoruz.",
        ],
        maddeler: [],
      },
      {
        baslik: "1 saat serbest oyun",
        paragraflar: [
          "İkinci saatimizi serbest oyun alanımızda geçiriyoruz. Çocuklara kendi ilgileri doğrultusunda seçim yapabilecekleri ve özgürce hareket edebilecekleri bir oyun ortamı sunuyoruz.",
          "Bu süreçte çocuklar arkadaşlarını gözlemliyor, birlikte oyun kurmaya başlıyor, çevrelerini keşfediyor ve atölyede edindikleri deneyimleri kendi oyunlarına taşıyor.",
          "Serbest oyun; sosyal gelişim, iletişim, motor beceriler, problem çözme, bağımsızlık ve yaratıcılık açısından çocuklara doğal öğrenme fırsatları sunuyor.",
        ],
        maddeler: [],
      },
      {
        baslik: "Amacımız sadece etkinlik yapmak değil",
        paragraflar: [
          "12-16 ay grubumuzda çocukların gelişim dönemlerine uygun zengin bir deneyim alanı oluşturmayı hedefliyoruz.",
          "Çocuğun hareket etmesine, keşfetmesine, dokunmasına, denemesine, taklit etmesine, iletişim kurmasına ve kendi seçimlerini yapmasına alan açıyoruz.",
          "Her çocuk kendi gelişim hızına ve ilgi alanlarına göre sürece dahil oluyor.",
        ],
        maddeler: [],
      },
    ],
    ikon: "Bebek",
  },
  {
    /*
      SARKILI MASAL VE SANAT BURAYA TASINDI (kurum karari, 12 Eylul 2026).
      Ayri bir atolye karti olarak durmuyor; sarki, masal, sanat, hareket ve
      oyun bu grubun icerigi olarak anlatiliyor.
    */
    slug: "ingilizce-oyun-grubu",
    ad: "İngilizce Oyun Grubu",
    kisaAd: "İngilizce Oyun",
    yasEtiket: "1 - 3 yaş",
    dil: "en",
    ailesi: "ingilizce",
    aciklama: null,
    olgular: [
      "Seans tamamen İngilizce işlenir",
      "Şarkı, masal, sanat, hareket ve oyun bir arada",
      "Etkinlik süresi 2 saat",
      "Tek katılımla da girilebilir",
      "Hafta içi ve hafta sonu ayrı günlerde açılır",
    ],
    anlatim: [],
    ikon: "Yildiz",
  },
  {
    /*
      12 Eylul 2026'da TAMAMEN DEGISTI. Onceki hali haftalik programda Sali
      ve Cumartesi seanslari olan, INGILIZCE islenen 2 saatlik bir atolyeydi;
      o seanslar 9 Eylul listesiyle zaten takvimden cikmisti.

      Yeni hali tarihli, tek seferlik bir workshop: 27 Eylul 2026 Pazar,
      17.00 - 18.30, TURKCE. Tarih ve saat etkinlikler.ts'de duruyor, tarih
      gecince kendiliginden dusuyor; buraya YAZILMAZ, yoksa iki yerde iki
      tarih olur.
    */
    slug: "oyunlarla-matematik-atolyesi",
    ad: "Oyunlarla Matematik Atölyesi",
    kisaAd: "Oyunlarla Matematik",
    yasEtiket: "3-5 yaş",
    dil: "tr",
    ailesi: null,
    aciklama: null,
    olgular: [
      "Tek seferlik workshop, haftalık programın parçası değil",
      "Türkçe işlenir",
      "Kontenjan sınırlıdır, rezervasyonla katılınır",
    ],
    anlatim: [],
    ikon: "Sayilar",
  },
  {
    slug: "minik-beyinler-laboratuvari",
    ad: "Minik Beyinler Laboratuvarı",
    kisaAd: "Minik Beyinler",
    yasEtiket: "3-5 yaş",
    dil: "tr",
    ailesi: null,
    aciklama: null,
    olgular: [
      "Akıl ve zekâ oyunları",
      "Etkinlik süresi 2 saat",
      "Tek katılımla girilebilir",
    ],
    anlatim: [],
    ikon: "Mercek",
  },
  {
    slug: "guvenli-ayrilma-programi",
    ad: "Güvenli Ayrılma Programı",
    kisaAd: "Güvenli Ayrılma",
    yasEtiket: "2,5 yaş ve üzeri",
    dil: "tr",
    ailesi: "okula-hazirlik",
    aciklama: null,
    /*
      12 Eylul 2026: "cocuk gruba ebeveynsiz katilir" tek basina yanlisti.
      Kurumun uzun metnine gore ILK ASAMADA ebeveyn cocuguna eslik ediyor,
      cocuk ortama ve ogretmenine guven kazandikca surec ebeveynsiz
      devam ediyor. Ebeveynsizlik programin SONUCU, giris sarti degil.
    */
    olgular: [
      "Okula Hazırlık Gruplarının parçasıdır",
      "İlk aşamada ebeveyn çocuğuna eşlik edebilir",
      "Çocuk güven kazandıkça süreç ebeveynsiz devam eder",
      "Oyun gruplarından bu programa geçiş yapılır",
    ],
    anlatim: [],
    ikon: "Kalp",
  },
  {
    slug: "serbest-oyun",
    ad: "Serbest Oyun Zamanı",
    kisaAd: "Serbest Oyun",
    yasEtiket: "Tüm yaşlar",
    dil: "tr",
    ailesi: null,
    aciklama: null,
    olgular: [
      "İki saatlik oyun gruplarında bir saat atölye, bir saat serbest oyun yapılır",
      "Sıralama gruba göre değişir, her grup için sabit değildir",
      "Kayıtlı çocuklara hafta sonu belirlenen zaman diliminde 1 saat serbest oyun ücretsizdir",
    ],
    anlatim: [],
    ikon: "Balon",
  },
];

const indeks = new Map(ATOLYELER.map((a) => [a.slug, a]));

export function atolyeBul(slug: string): Atolye | undefined {
  return indeks.get(slug as AtolyeSlug);
}

export const ATOLYE_SLUGLARI: AtolyeSlug[] = ATOLYELER.map((a) => a.slug);

/**
 * Bir program AILESININ program sayfasi.
 *
 * DIKKAT, IKI AYRI SLUG VAR: aile slug'i ("okula-hazirlik") ile atolye
 * slug'i ("okula-hazirlik-grubu") ayni sey degil. `/oyun-evi/programlar/[slug]`
 * rotasi ATOLYE slug'lariyla uretiliyor; aile slug'i verilirse sayfa 404
 * doner. /bilgi sayfasi tam bu yuzden 404 veriyordu.
 *
 * Okula hazirlik ailesine iki atolye bagli (grup ve guvenli ayrilma
 * programi); dizideki ilki grubun kendisi, o donuyor.
 */
export function aileninAtolyesi(aileSlug: string): Atolye | undefined {
  return ATOLYELER.find((a) => a.ailesi === aileSlug);
}
