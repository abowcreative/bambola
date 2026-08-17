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
  baslik: "KVKK Aydınlatma Metni",
  aciklama: `${MARKA.ad} kayıt formu üzerinden toplanan kişisel verilerin hangi amaçla işlendiği, ne kadar saklandığı ve haklarınız.`,
  yol: "/kvkk",
  indeks: false,
});

/**
 * DIKKAT, BU METIN TASLAKTIR.
 *
 * Icerigi sitenin gercekte ne topladigina gore yazildi, uydurma yok:
 * toplanan alanlar /api/kayit ve supabase/migrations/0001_basvurular.sql ile
 * birebir ortusuyor. Ancak veri sorumlusunun tam unvani, adresi, vergi
 * bilgileri ve basvuru kanali teyit bekliyor (PLAN.md Bolum 14 madde 9).
 *
 * Yayina cikmadan once kurumun hukuk danismani okumali. Eksik alanlar
 * ILETISIM uzerinden geliyor; doldurulmadigi surece sayfa bunu acikca yazar.
 *
 * KAPSAM: bu metin YALNIZ KAYIT FORMUNU anlatiyor. Panelde tutulan ogrenci
 * ve veli kayitlari /gizlilik sayfasinda.
 */

const TOPLANAN: [string, string][] = [
  ["Çocuğun adı", "İsteğe bağlı. Görüşmede doğru hitap edebilmek için."],
  [
    "Çocuğun doğum tarihi",
    "Zorunlu. Yaşa uygun grubu belirlemek için. Yalnızca ay olarak hesaplanan yaş da kaydedilir.",
  ],
  ["Veli adı ve soyadı", "Zorunlu. Size ulaşabilmek için."],
  ["Telefon numarası", "Zorunlu. Talebinize dönebilmek için."],
  ["E-posta adresi", "İsteğe bağlı."],
  ["Seçilen program, paket, gün ve saat", "Talebinizin içeriğini oluşturur."],
  [
    "Notunuz",
    "İsteğe bağlı. Alerji gibi bir bilgi yazarsanız yalnızca bu amaçla kullanılır.",
  ],
  [
    "Bizi nereden duyduğunuz",
    "İsteğe bağlı. Hangi kanalın işe yaradığını anlamak için.",
  ],
  [
    "Teknik kayıtlar",
    "Tarayıcı bilgisi, siteye hangi adresten geldiğiniz ve IP adresinizin geri döndürülemez şekilde şifrelenmiş özeti. Yalnızca kötüye kullanımı önlemek için tutulur; ham IP adresi saklanmaz.",
  ],
];

const HAKLAR = [
  "Kişisel verinizin işlenip işlenmediğini öğrenme",
  "İşlenmişse buna ilişkin bilgi talep etme",
  "İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme",
  "Eksik veya yanlış işlenmişse düzeltilmesini isteme",
  "Şartları oluştuğunda silinmesini veya yok edilmesini isteme",
  "Düzeltme, silme veya yok etme işlemlerinin üçüncü kişilere bildirilmesini isteme",
  "İşlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonuç doğmasına itiraz etme",
  "Kanuna aykırı işlenme sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme",
];

export default function KvkkSayfasi() {
  const eksikBilgi = !ILETISIM.adres || !ILETISIM.eposta;

  return (
    <YasalSayfa
      yol="/kvkk"
      baslik="KVKK aydınlatma metni"
      aciklama="Kayıt formunu doldurduğunuzda hangi bilgileri aldığımızı, neden aldığımızı ve ne kadar sakladığımızı burada anlatıyoruz."
      uyari={
        eksikBilgi ? (
          <>
            Bu metnin veri sorumlusu künyesi (tam unvan, adres, başvuru adresi)
            kurumdan gelen bilgilerle tamamlanacaktır. Metnin içeriği sitenin
            gerçekte topladığı verilere göre hazırlanmıştır.
          </>
        ) : undefined
      }
    >
      <YasalBaslik>Veri sorumlusu</YasalBaslik>
      <p className="mt-3">
        Kişisel verileriniz, veri sorumlusu sıfatıyla{" "}
        <strong className="text-murekkep">{MARKA.tuzelAdOyunEvi}</strong>{" "}
        tarafından, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında
        aşağıda açıklanan çerçevede işlenmektedir.
        {ILETISIM.adres ? ` Adres: ${ILETISIM.adres}.` : ""}
      </p>

      <YasalBaslik>Hangi verileri alıyoruz?</YasalBaslik>
      <p className="mt-3">
        Yalnızca kayıt formunda doldurduğunuz alanları ve talebi işleme almak
        için gereken teknik kayıtları alıyoruz. Başka bir kaynaktan veri
        toplamıyoruz.
      </p>
      <YasalTablo satirlar={TOPLANAN} />
      <p className="mt-4">
        Çocuğunuz kayıt olduktan sonra kurumun panelinde oluşan kayıtlar
        (sınıf, yoklama, ödeme) bu metnin kapsamı dışındadır ve{" "}
        <Link
          href="/gizlilik"
          className="font-medium text-mor underline underline-offset-2"
        >
          gizlilik politikasında
        </Link>{" "}
        anlatılır.
      </p>

      <YasalBaslik>Neden işliyoruz?</YasalBaslik>
      <YasalListe
        ogeler={[
          "Kayıt talebinizi değerlendirmek ve size geri dönmek",
          "Çocuğunuzun yaşına uygun grubu belirlemek ve uygun saatleri sunmak",
          "Kayıt süreci boyunca sizinle iletişim kurmak",
          "Formun kötüye kullanılmasını ve otomatik gönderimleri önlemek",
          "Ayrıca onay verdiyseniz, yeni gruplar ve etkinlikler hakkında bilgilendirme göndermek",
        ]}
      />
      <p className="mt-3">
        Ticari ileti onayı ayrı bir kutudur ve zorunlu değildir. Onaylamamanız
        kayıt talebinizi etkilemez. Onayınızı daha sonra dilediğiniz zaman geri
        alabilirsiniz.
      </p>

      <YasalBaslik>Hukuki sebep</YasalBaslik>
      <p className="mt-3">
        Verileriniz, sözleşmenin kurulması için gerekli olması ve meşru menfaat
        hukuki sebeplerine dayanılarak; ticari ileti gönderimi ise yalnızca açık
        rızanıza dayanılarak işlenir.
      </p>

      <YasalBaslik>Kimlerle paylaşıyoruz?</YasalBaslik>
      <p className="mt-3">
        Verileriniz pazarlama amacıyla üçüncü kişilere satılmaz veya
        devredilmez. Yalnızca hizmetin çalışması için kullandığımız barındırma
        ve e-posta altyapısı sağlayıcıları, veriyi bizim adımıza işleyen
        taraflar olarak devrededir; hangi sağlayıcıların devrede olduğu{" "}
        <Link
          href="/gizlilik"
          className="font-medium text-mor underline underline-offset-2"
        >
          gizlilik politikasında
        </Link>{" "}
        tek tek yazılı. Yasal olarak talep edilmesi hâlinde yetkili kamu
        kurumlarıyla paylaşım yapılabilir.
      </p>

      <YasalBaslik>Ne kadar saklıyoruz?</YasalBaslik>
      <p className="mt-3">
        Kayda dönüşmeyen talepler, en fazla iki yıl boyunca saklanır ve
        sonrasında silinir. Kayda dönüşen taleplerde, öğrenci kaydına ilişkin
        yasal saklama süreleri geçerlidir. Talebiniz üzerine daha erken de
        silebiliriz.
      </p>

      <YasalBaslik>Çerezler</YasalBaslik>
      <p className="mt-3">
        Site, formu doldururken girdiğiniz bilgileri kaybetmemeniz için
        tarayıcınızın oturum deposunu kullanır. Bu veri sunucuya gönderilmez ve
        sekmeyi kapattığınızda silinir. Sitede izleme veya reklam çerezi
        kullanılmaz; ayrıntısı{" "}
        <Link
          href="/cerez"
          className="font-medium text-mor underline underline-offset-2"
        >
          çerez politikasında
        </Link>
        .
      </p>

      <YasalBaslik>Haklarınız</YasalBaslik>
      <p className="mt-3">
        Kanunun 11. maddesi uyarınca şu haklara sahipsiniz:
      </p>
      <YasalListe ogeler={HAKLAR} />

      <YasalBaslik>Nasıl başvurursunuz?</YasalBaslik>
      <p className="mt-3">
        Taleplerinizi{" "}
        {ILETISIM.eposta ? (
          <a
            href={`mailto:${ILETISIM.eposta}`}
            className="font-medium text-mor underline underline-offset-2"
          >
            {ILETISIM.eposta}
          </a>
        ) : (
          "kurumun yayınlanacak başvuru adresi"
        )}{" "}
        üzerinden bize iletebilirsiniz. Başvurunuz en geç otuz gün içinde
        sonuçlandırılır.
      </p>

      <p className="mt-10 border-t border-cizgi pt-6 text-sm">
        Kayıt formuna dönmek için{" "}
        <Link
          href="/kayit"
          className="font-medium text-mor underline underline-offset-2"
        >
          buraya tıklayın
        </Link>
        .
      </p>
    </YasalSayfa>
  );
}
