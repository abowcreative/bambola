import Link from "next/link";
import { ILETISIM, MARKA } from "@/lib/site";
import { sayfaMetadata } from "@/lib/seo";
import {
  YasalSayfa,
  YasalBaslik,
  YasalListe,
  YasalTablo,
} from "@/components/site/yasal-sayfa";

export const metadata = sayfaMetadata({
  baslik: "Gizlilik Politikası",
  aciklama: `${MARKA.ad} hangi kişisel veriyi topluyor, bu veri nerede saklanıyor, kim erişiyor ve ne kadar tutuluyor.`,
  yol: "/gizlilik",
  indeks: false,
});

/**
 * DIKKAT, BU METIN TASLAKTIR. Yayina cikmadan once kurumun hukuk danismani
 * okumali.
 *
 * Icerik UYDURULMADI, sistemin gercek davranisindan yazildi:
 * - kayit formu alanlari: lib/schema.ts ve app/api/kayit
 * - veritabani tablolari ve erisim kurallari: supabase/migrations/*.sql
 * - ucuncu taraflar: package.json bagimliliklari ve Vercel/Supabase kurulumu
 * - cerezler: /cerez sayfasi, ayni gercege dayaniyor
 *
 * KVKK aydinlatma metni (/kvkk) yalniz KAYIT FORMUNU anlatiyor. Bu sayfa
 * panelde (kampus) tutulan ogrenci ve veli kayitlarini da kapsiyor; cocuk
 * verisi tutan bir sistemin bunu yazmamasi kabul edilemez.
 */

const NEREDE: [string, string][] = [
  [
    "Web sitesi (Vercel)",
    "Site Vercel altyapısında barındırılıyor. Sunucu tarafı işlemler Frankfurt bölgesinde çalışıyor. Vercel erişim kayıtlarını (IP, tarayıcı, istenen adres) kendi altyapısında kısa süre tutar.",
  ],
  [
    "Veritabanı ve hesaplar (Supabase)",
    "Kayıt talepleri, öğrenci ve veli kayıtları, yoklama ve ödeme hareketleri Supabase (PostgreSQL) üzerinde duruyor. Panel şifreleri bizde değil, Supabase Auth tarafında şifrelenmiş özet olarak tutuluyor; kimse ham şifreyi göremez.",
  ],
  [
    "E-posta (Resend)",
    "Bildirim e-postaları Resend üzerinden gönderilir. Bu kanal henüz etkin değil; etkinleşene kadar hiçbir e-posta gönderilmiyor.",
  ],
  [
    "Harita (Google)",
    "İletişim sayfasındaki harita Google Maps'ten gelir ve yalnız siz “Haritayı göster” dediğinizde yüklenir. Siz istemedikçe Google'a hiçbir istek gitmez.",
  ],
];

const PANELDE: [string, string][] = [
  [
    "Çocuğun bilgileri",
    "Adı, doğum tarihi, hangi gruba kayıtlı olduğu, devam durumu; velinin bildirdiği alerji ve sağlık notu.",
  ],
  [
    "Veli bilgileri",
    "Adı soyadı, telefon, varsa e-posta ve adres, çocukla yakınlığı.",
  ],
  [
    "Kayıt ve ödeme hareketleri",
    "Hangi paket, hangi ücret, tahsilat ve bakiye. Öğretmenler ödeme bilgilerini göremez.",
  ],
  [
    "Yoklama",
    "Hangi derse gelindi, gelinmedi veya telafi edildi. Öğretmen yalnız kendi sınıfının yoklamasını görür.",
  ],
];

export default function GizlilikSayfasi() {
  const eksik = !ILETISIM.eposta;

  return (
    <YasalSayfa
      yol="/gizlilik"
      baslik="Gizlilik politikası"
      aciklama="Hangi bilgiyi topladığımızı, nerede sakladığımızı, kimin eriştiğini ve ne kadar tuttuğumuzu olduğu gibi yazıyoruz."
      uyari={
        eksik ? (
          <>
            Bu metnin başvuru adresi kurumdan gelen bilgilerle
            tamamlanacaktır. İçeriği, sitenin ve panelin gerçekte ne yaptığına
            göre hazırlanmıştır.
          </>
        ) : undefined
      }
    >
      <p>
        Bu politika{" "}
        <strong className="text-murekkep">{MARKA.tuzelAdOyunEvi}</strong> ve{" "}
        <strong className="text-murekkep">{MARKA.tuzelAdAnaokulu}</strong>{" "}
        tarafından işletilen {MARKA.ad} web sitesi ve yönetim paneli için
        geçerlidir.
        {ILETISIM.adres ? ` Adres: ${ILETISIM.adres}.` : ""}
      </p>

      <YasalBaslik>Kısaca</YasalBaslik>
      <YasalListe
        ogeler={[
          "Sitede reklam ve izleme çerezi yok, analitik kurulu değil. Sizi sayfalar arasında izlemiyoruz.",
          <>
            Tek ölçüm şu: &quot;Bu programa kaydol&quot; düğmesine
            basıldığında hangi programın seçildiği sayılıyor. Kişiye dair
            hiçbir bilgi tutulmadan — ayrıntısı{" "}
            <Link
              href="/cerez"
              className="font-medium text-[var(--kol-koyu)] underline underline-offset-2"
            >
              çerez politikasında
            </Link>
            .
          </>,
          "Yalnız formda yazdığınız bilgileri ve kayıt sürecinin gerektirdiği bilgileri tutuyoruz.",
          "Verinizi pazarlama amacıyla kimseye satmıyoruz, devretmiyoruz.",
          "Çocuğa ait bilgiler yalnız kurumun yetkili çalışanlarının göreceği şekilde saklanıyor.",
        ]}
      />

      <YasalBaslik>Web sitesinde ne topluyoruz?</YasalBaslik>
      <p className="mt-3">
        Siteyi yalnız gezerken sizden hiçbir bilgi istemiyoruz. Kayıt formunu
        doldurduğunuzda aldığımız alanların tamamı ve her birinin niçin
        alındığı{" "}
        <Link
          href="/kvkk"
          className="font-medium text-[var(--kol-koyu)] underline underline-offset-2"
        >
          KVKK aydınlatma metninde
        </Link>{" "}
        tek tek yazılı. IP adresinizin kendisi saklanmaz; yalnız geri
        döndürülemez şifrelenmiş özeti, formun kötüye kullanılmasını önlemek
        için tutulur.
      </p>

      <YasalBaslik>Panelde ne tutuluyor?</YasalBaslik>
      <p className="mt-3">
        Çocuğunuz kayıt olduktan sonra kurumun yönetim panelinde şu kayıtlar
        oluşur. Bunlar hizmetin yürütülmesi için gereklidir:
      </p>
      <YasalTablo satirlar={PANELDE} />
      <p className="mt-4">
        Panele yalnız kurumun hesap açtığı kişiler girer ve herkes yalnız
        kendi işini görecek kadarını görür: öğretmen kendi sınıfını, veli
        kendi çocuğunu. Bu sınırlar arayüzde değil, veritabanı düzeyinde
        tanımlıdır; adres çubuğuna başka bir adres yazmak sınırı aşmaya
        yetmez.
      </p>

      <YasalBaslik>Veri nerede duruyor?</YasalBaslik>
      <YasalTablo satirlar={NEREDE} />
      <p className="mt-4">
        Bu sağlayıcılar veriyi bizim adımıza işleyen taraflardır; kendi
        amaçları için kullanmalarına izin verilmez.
      </p>

      <YasalBaslik>Ne kadar saklıyoruz?</YasalBaslik>
      <YasalListe
        ogeler={[
          "Kayda dönüşmeyen talepler en fazla iki yıl saklanır, sonra silinir.",
          "Kayda dönüşen taleplerde öğrenci kaydına ilişkin yasal saklama süreleri geçerlidir.",
          "Ödeme ve tahsilat kayıtları, mali mevzuatın gerektirdiği süre boyunca tutulur.",
          "Talebiniz üzerine, yasal saklama zorunluluğu bulunmayan kayıtları daha erken silebiliriz.",
        ]}
      />

      <YasalBaslik>Çocuklara ait veriler</YasalBaslik>
      <p className="mt-3">
        Çocuğa ait bilgileri yalnız velisinin bildirdiği kadarıyla ve yalnız
        hizmeti yürütmek için tutuyoruz. Alerji ve sağlık notu gibi bilgiler,
        çocuğun güvenliği için o çocukla ilgilenen öğretmenin görebileceği
        yerde durur; bunun dışında hiçbir amaçla kullanılmaz. Çocuk
        fotoğrafları, velinin ayrıca yazılı izni olmadan sitede veya sosyal
        medyada yayınlanmaz.
      </p>

      <YasalBaslik>Güvenlik</YasalBaslik>
      <YasalListe
        ogeler={[
          "Site ve panel yalnız şifreli bağlantı (HTTPS) üzerinden çalışır.",
          "Panel şifreleri kurum tarafında saklanmaz; kimlik doğrulama sağlayıcısında şifrelenmiş özet olarak durur.",
          "Her tablo için kimin hangi satırı görebileceği veritabanı düzeyinde tanımlıdır.",
          "Panel adresleri arama motorlarına kapalıdır.",
        ]}
      />

      <YasalBaslik>Haklarınız ve başvuru</YasalBaslik>
      <p className="mt-3">
        6698 sayılı Kanun&apos;un 11. maddesindeki hakların tamamı ve nasıl
        başvurulacağı{" "}
        <Link
          href="/kvkk"
          className="font-medium text-[var(--kol-koyu)] underline underline-offset-2"
        >
          KVKK aydınlatma metninde
        </Link>{" "}
        yazılıdır. Başvurunuz en geç otuz gün içinde sonuçlandırılır.
      </p>

      <YasalBaslik>Bu metin değişirse</YasalBaslik>
      <p className="mt-3">
        Politika değiştiğinde güncel hâli bu adreste yayınlanır. Kayıt
        sürecini etkileyen bir değişiklik olursa, kaydı süren velilere ayrıca
        bilgi verilir.
      </p>
    </YasalSayfa>
  );
}
