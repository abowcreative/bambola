/**
 * Ogretmen kadrosu. PLAN.md Bolum 14 madde 6.
 *
 * ÖZGEÇMIŞLER 16 AGUSTOS 2026'DA GELDI ve ogretmenlerin KENDI kaleminden.
 * Metinler yeniden yazilmadi, yalniz paragraflara bolundu; kisinin kendi
 * sozunu "iyilestirmek" onu baskasinin sesine cevirir. Unvan ve egitim
 * satirlari da metinden dogrudan cikan bilgiye dayaniyor, uydurulmadi.
 *
 * `ad` alani Excel'deki adla birebir ayni olmali: haftalik programdaki
 * `slot.ogretmenler[]` bununla eslesiyor. Soyad eklenirse eslesme bozulur.
 */

import { SLOTLAR, slotBul } from "./program";
import { aileBul } from "./gruplar";
import type { AtolyeSlug, ProgramAilesiSlug } from "./types";

export type Ogretmen = {
  /** Excel'de gecen ad. Slot verisindeki ogretmenler[] ile birebir eslesir. */
  ad: string;
  soyad: string | null;
  /** Mesleki unvan: "Okul Öncesi Öğretmeni". */
  unvan: string | null;
  /**
   * Kurum icindeki gorev. Unvandan AYRI bir alan: mudurluk mesleki unvanin
   * yerine gecmiyor, ustune biniyor. Musteri 16 Agustos 2026'da bildirdi.
   *
   * Bos birakilan ogretmen icin hicbir yerde bir sey gosterilmiyor; "gorevi
   * yok" diye bir ifade cikmaz.
   */
  gorev: string | null;
  /** Mezuniyet. Tek satir, kartta unvanin altinda. */
  egitim: string | null;
  /** Kart icin bir cumlelik ozet. Ozgecmisin ilk cumlesi degil, ayri yazildi. */
  ozet: string | null;
  /** Ogretmenin kendi metni, paragraflara bolunmus hali. */
  ozgecmis: string[] | null;
  /** Metinde acikca gecen yontem ve yaklasimlar. */
  yaklasimlar: string[] | null;
  /** public/ekip/<slug>.jpg. `npm run foto` uretir. */
  fotograf: string | null;
};

export const EKIP: Ogretmen[] = [
  {
    ad: "Emine",
    soyad: "Yıldız Keleş",
    unvan: "Okul Öncesi Öğretmeni",
    gorev: "Kurum Müdürü",
    egitim: "Anadolu Üniversitesi, Okul Öncesi Öğretmenliği (2022)",
    ozet:
      "Üç yıl kolejde okul öncesi öğretmenliği, iki yıl zümre başkanlığı. Etkinliklerine ukulele ve akıl oyunları da giriyor.",
    ozgecmis: [
      "Merhaba, ben Emine Yıldız Keleş.",
      "2018 yılında Anadolu Üniversitesi Örgün Okul Öncesi Öğretmenliği Bölümü'nde başladığım lisans eğitimimi 2022 yılında tamamladım. Eğitim hayatım boyunca yalnızca sınıf ortamında değil; doğada oyun projelerinde ve çeşitli sosyal yardımlaşma kurumlarında çocuklarla çalışma fırsatı buldum. Bu deneyimler, çocukları tanıma ve onların dünyasına farklı pencerelerden bakma konusunda bana önemli katkılar sağladı.",
      "Mezuniyetimin ardından 3 yıl boyunca bir kolejde okul öncesi öğretmeni olarak görev yaptım. Bu sürecin 2 yılında zümre başkanlığı görevini üstlenerek eğitim planlamaları, etkinlik geliştirme, öğretmenler arası iş birliği ve ekip çalışmalarında aktif rol aldım. Bu deneyim, yalnızca çocuklarla değil, eğitim ekibiyle birlikte üretmenin ve ortak bir eğitim anlayışı oluşturmanın önemini görmemi sağladı.",
      "Mesleki yolculuğum boyunca Çoklu Zekâ Kuramı, HighScope ve Froebel yaklaşımlarından yararlanarak çocukların bireysel farklılıklarını, meraklarını ve öğrenme biçimlerini destekleyen çeşitli etkinlikler tasarladım. Zamanla kendime “Çocuklar için daha verimli ve keyifli öğrenme deneyimleri nasıl oluşturabilirim?” sorusunu sormaya başladım.",
      "Bu arayış beni müziğe ve özellikle ukuleleye yönlendirdi. Müziğin çocukların öğrenme sürecine kattığı neşeyi ve yaratıcılığı keşfederek ukulele çalmayı öğrendim ve bunu çocuklarla gerçekleştirdiğim etkinliklerin bir parçası hâline getirdim. Bunun yanında Akıl ve Zekâ Oyunları alanında eğitim alarak çocukların problem çözme, dikkat, akıl yürütme ve strateji geliştirme becerilerini destekleyen çalışmalar gerçekleştirdim.",
      "Bugün eğitim anlayışımın merkezinde; çocuğu yalnızca bilgiyle buluşturmak değil, merak eden, araştıran, üreten, sorgulayan ve kendi potansiyelini keşfeden bir birey olarak desteklemek yer alıyor.",
      "Benim için eğitim, çocuğa hazır bilgiler sunmaktan çok daha fazlası. Çocuğun merak etmesine, denemesine, yanılmasına, keşfetmesine ve kendi öğrenme yolculuğunu oluşturmasına alan açmak…",
      "Çünkü inanıyorum ki: “Çocuğa zorla bir şey öğretmeyin; onun içindeki keşfetme arzusunu uyandırın.”",
    ],
    yaklasimlar: [
      "Çoklu Zekâ Kuramı",
      "HighScope",
      "Fröbel",
      "Ukulele ve müzik",
      "Akıl ve zekâ oyunları",
    ],
    fotograf: "emine-yildiz-keles",
  },
  {
    ad: "Burcu",
    soyad: "Erışık",
    unvan: "İngilizce Öğretmeni",
    gorev: null,
    egitim: "Ankara Üniversitesi, İngiliz Dili ve Edebiyatı",
    ozet:
      "Pedagojik formasyonlu İngilizce öğretmeni. Dili ezberle değil, oyun ve dramayla kurmayı savunuyor.",
    ozgecmis: [
      "Herkese merhaba, ben Burcu Öğretmen. Ankara Üniversitesi İngiliz Dili ve Edebiyatı mezunuyum. Pedagojik formasyon eğitimim sayesinde çocuklarla çalışma ve onların eğitim süreçlerine katkıda bulunma fırsatı elde ettim.",
      "İngilizce eğitiminde en önemli hedeflerimden biri, çocuklara öncelikle yabancı bir dil öğrenmenin keyifli ve doğal bir süreç olduğunu hissettirmek ve İngilizceye karşı olumlu bir tutum kazandırmaktır. Özellikle erken yaşlarda verilen dil eğitiminin yalnızca kelime ve dil bilgisi öğretiminden ibaret olmadığına; çocukların dili oyun, hareket, etkileşim ve günlük yaşam deneyimleri yoluyla doğal bir şekilde öğrenmeleri gerektiğine inanıyorum.",
      "Bu doğrultuda derslerimizde oyun temelli öğrenme, drama ve role-play, hikâye anlatımı, şarkılar, hareketli etkinlikler gibi çocukların aktif katılımını destekleyen yöntem ve tekniklerden yararlanmayı önemsiyorum. Özellikle küçük yaş gruplarında çocukların dikkat sürelerini ve gelişimsel özelliklerini göz önünde bulundurarak etkinlikleri kısa, çeşitli ve etkileşimli şekilde planlamayı hedefliyorum. Böylece çocukların yalnızca İngilizce kelimeleri ezberlemelerini değil, öğrendikleri ifadeleri oyun içerisinde kullanarak deneyimlemelerini amaçlıyorum.",
      "Aynı zamanda iletişimsel dil öğretimi yaklaşımını benimseyerek çocukların öğrendikleri İngilizceyi gerçek yaşam durumlarında kullanmalarına fırsat vermeyi önemsiyorum.",
      "Bu eğitim merkezimizde farklı yaş gruplarındaki çocukların İngilizceyi günlük hayatlarının bir parçası hâline getirmelerini ve dili mümkün olduğunca doğal, eğlenceli ve ulaşılabilir bir şekilde öğrenmelerini hedefliyorum.",
      "Çünkü bir eğitimci olarak temel rolümün yalnızca bilgi aktarmak değil, aynı zamanda çocukların kendilerini güvende, değerli ve rahat hissettikleri bir öğrenme ortamı oluşturmak olduğuna inanıyorum. Bu nedenle sınıf içerisinde güler yüzlü, güvenilir, destekleyici ve eğitici bir atmosfer yaratmayı; çocukların İngilizce öğrenmeye karşı merak, özgüven ve motivasyon geliştirmelerine öncülük etmeyi amaçlıyorum.",
    ],
    yaklasimlar: [
      "Oyun temelli öğrenme",
      "Drama ve role-play",
      "Hikâye anlatımı",
      "Şarkı ve hareket",
      "İletişimsel dil öğretimi",
    ],
    fotograf: "burcu-erisik",
  },
  {
    ad: "Dilara",
    soyad: "Özcan",
    unvan: "Atölye Öğretmeni",
    gorev: null,
    egitim: "Başkent Üniversitesi, Çocuk Gelişimi",
    ozet:
      "Bir yılı aşkın süredir Bambola'da. Duyusal oyundan sanata, müzikten ritme atölyeleri planlıyor ve yürütüyor.",
    ozgecmis: [
      "Ben Dilara Özcan. Başkent Üniversitesi Çocuk Gelişimi Bölümü mezunuyum. Eğitim hayatım boyunca çocukların gelişim süreçlerini yakından tanımaya, onların ihtiyaçlarını anlamaya ve öğrenme süreçlerini destekleyen doğru yaklaşımları keşfetmeye önem verdim.",
      "Bir yılı aşkın süredir Bambola'da çocuklarla aktif olarak çalışıyor; farklı yaş gruplarına yönelik atölyelerin planlanması, hazırlanması ve uygulanmasında aktif rol alıyorum. Duyusal oyunlardan sanat çalışmalarına, müzik ve ritim etkinliklerinden hareket, dil ve bilişsel gelişimi destekleyen çalışmalara kadar çocukların farklı gelişim alanlarına hitap eden birçok atölye deneyimini çocuklarla birlikte gerçekleştiriyorum.",
      "Çocuklarla kurduğum iletişimde çocuğu merkeze alan ve onun bireysel özelliklerine saygı duyan bir yaklaşımı benimsiyorum. Her çocuğun kendine özgü bir gelişim süreci olduğuna inanıyor; çocukları yönlendirmekten çok, onların keşfetmelerine, denemelerine, soru sormalarına ve kendi deneyimlerini oluşturmalarına alan açmayı önemsiyorum.",
      "Benim için öğretmenlik; yalnızca bir etkinliği uygulamak ya da bilgi aktarmak değil, çocuğun merakına eşlik etmek, onu olduğu haliyle kabul etmek ve öğrenme yolculuğunda güvenli bir rehber olabilmek demek.",
      "Bambola'da geçirdiğim bu süreçte çocuklarla birlikte öğrenmeye, onların dünyasını daha yakından tanımaya ve her çocuğun kendine özgü potansiyelini desteklemeye devam ediyorum. Amacım; çocukların kendilerini güvende, özgür ve değerli hissettikleri, öğrenmenin oyun ve keşifle iç içe olduğu nitelikli deneyimler sunabilmek.",
    ],
    yaklasimlar: [
      "Çocuk merkezli yaklaşım",
      "Duyusal oyun",
      "Sanat çalışmaları",
      "Müzik ve ritim",
      "Dil ve bilişsel gelişim",
    ],
    fotograf: "dilara-ozcan",
  },
];

export function ogretmenAdi(o: Ogretmen): string {
  return o.soyad ? `${o.ad} ${o.soyad}` : o.ad;
}

/** Ada gore ogretmen. Takvimdeki `slot.ogretmenler[]` bu adla geliyor. */
export const ogretmenBul = (ad: string) => EKIP.find((o) => o.ad === ad);

/** URL'de ve fotograf dosyasinda kullanilan slug. */
export const ogretmenSlug = (o: Ogretmen) => o.fotograf ?? o.ad.toLowerCase();

/* --------------------------------------------------- program -> ogretmenler

   Hangi programi kimin verdigi AYRI BIR LISTEDE TUTULMUYOR, haftalik
   programdan cikariliyor. Elle yazilan bir eslesme, program degistiginde
   sessizce eskir; tek dogru kaynak takvimin kendisi.

   Sira her zaman EKIP dizisinin sirasi. Boylece ayni ogretmen kadrosu her
   kartta ve her sayfada ayni siralamada gorunuyor.
*/

/** Bir atolyeyi veren ogretmenler. */
export function atolyeOgretmenleri(slug: AtolyeSlug): Ogretmen[] {
  const adlar = new Set(
    SLOTLAR.filter((s) => s.atolyeSlug === slug).flatMap((s) => s.ogretmenler),
  );
  return EKIP.filter((o) => adlar.has(o.ad));
}

/**
 * Bir program ailesini veren ogretmenler. Ailenin sabit kombinasyonlarindaki
 * slotlarin tamami taranir; aile birden fazla atolyeyi kapsayabiliyor.
 */
export function aileOgretmenleri(slug: ProgramAilesiSlug): Ogretmen[] {
  const aile = aileBul(slug);
  if (!aile) return [];
  const adlar = new Set(
    aile.sabitKombinasyonlar.flatMap((k) =>
      k.slotIdler.flatMap((id) => slotBul(id)?.ogretmenler ?? []),
    ),
  );
  return EKIP.filter((o) => adlar.has(o.ad));
}
