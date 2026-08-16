import Link from "next/link";
import { ILETISIM, MARKA } from "@/lib/site";
import { sayfaMetadata, ekmekKirintisiSemasi, SemaEtiketi } from "@/lib/seo";
import { EkmekKirintisi, SayfaBasligi } from "@/components/site/bolum-basligi";
import { Belir } from "@/components/site/bolum";

export const metadata = sayfaMetadata({
  baslik: "KVKK Aydınlatma Metni",
  aciklama: `${MARKA.ad} kayıt formu üzerinden toplanan kişisel verilerin hangi amaçla işlendiği, ne kadar saklandığı ve haklarınız.`,
  yol: "/kvkk",
  indeks: false,
});

const KIRINTI = [
  { ad: "Ana sayfa", yol: "/" },
  { ad: "KVKK aydınlatma metni", yol: "/kvkk" },
];

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
 */

const TOPLANAN = [
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

function Baslik({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 font-baslik text-xl font-bold text-murekkep">
      {children}
    </h2>
  );
}

export default function KvkkSayfasi() {
  const eksikBilgi = !ILETISIM.adres || !ILETISIM.eposta;

  return (
    <div data-kol="anaokulu">
      <SemaEtiketi sema={ekmekKirintisiSemasi(KIRINTI)} />
      <EkmekKirintisi ogeler={KIRINTI} />

      <SayfaBasligi
        ustBaslik="Yasal"
        baslik="KVKK aydınlatma metni"
        aciklama="Kayıt formunu doldurduğunuzda hangi bilgileri aldığımızı, neden aldığımızı ve ne kadar sakladığımızı burada anlatıyoruz."
      />

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <Belir>
          {eksikBilgi && (
            <p className="mb-8 rounded-kart border-2 border-dashed border-cizgi bg-white p-5 text-sm leading-relaxed text-murekkep-soluk">
              Bu metnin veri sorumlusu künyesi (tam unvan, adres, başvuru
              adresi) kurumdan gelen bilgilerle tamamlanacaktır. Metnin içeriği
              sitenin gerçekte topladığı verilere göre hazırlanmıştır.
            </p>
          )}

          <div className="leading-relaxed text-murekkep-soluk">
            <Baslik>Veri sorumlusu</Baslik>
            <p className="mt-3">
              Kişisel verileriniz, veri sorumlusu sıfatıyla{" "}
              <strong className="text-murekkep">{MARKA.tuzelAdOyunEvi}</strong>{" "}
              tarafından, 6698 sayılı Kişisel Verilerin Korunması Kanunu
              kapsamında aşağıda açıklanan çerçevede işlenmektedir.
              {ILETISIM.adres ? ` Adres: ${ILETISIM.adres}.` : ""}
            </p>

            <Baslik>Hangi verileri alıyoruz?</Baslik>
            <p className="mt-3">
              Yalnızca kayıt formunda doldurduğunuz alanları ve talebi işleme
              almak için gereken teknik kayıtları alıyoruz. Başka bir kaynaktan
              veri toplamıyoruz.
            </p>
            <dl className="mt-5 divide-y divide-cizgi overflow-hidden rounded-kart border-2 border-cizgi bg-white">
              {TOPLANAN.map(([alan, amac]) => (
                <div key={alan} className="px-5 py-4">
                  <dt className="font-medium text-murekkep">{alan}</dt>
                  <dd className="mt-1 text-sm">{amac}</dd>
                </div>
              ))}
            </dl>

            <Baslik>Neden işliyoruz?</Baslik>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Kayıt talebinizi değerlendirmek ve size geri dönmek</li>
              <li>
                Çocuğunuzun yaşına uygun grubu belirlemek ve uygun saatleri
                sunmak
              </li>
              <li>Kayıt süreci boyunca sizinle iletişim kurmak</li>
              <li>
                Formun kötüye kullanılmasını ve otomatik gönderimleri önlemek
              </li>
              <li>
                Ayrıca onay verdiyseniz, yeni gruplar ve etkinlikler hakkında
                bilgilendirme göndermek
              </li>
            </ul>
            <p className="mt-3">
              Ticari ileti onayı ayrı bir kutudur ve zorunlu değildir.
              Onaylamamanız kayıt talebinizi etkilemez.
            </p>

            <Baslik>Hukuki sebep</Baslik>
            <p className="mt-3">
              Verileriniz, sözleşmenin kurulması için gerekli olması ve meşru
              menfaat hukuki sebeplerine dayanılarak; ticari ileti gönderimi ise
              yalnızca açık rızanıza dayanılarak işlenir.
            </p>

            <Baslik>Kimlerle paylaşıyoruz?</Baslik>
            <p className="mt-3">
              Verileriniz pazarlama amacıyla üçüncü kişilere satılmaz veya
              devredilmez. Yalnızca hizmetin çalışması için kullandığımız
              barındırma ve e-posta altyapısı sağlayıcıları, veriyi bizim
              adımıza işleyen taraflar olarak devrededir. Yasal olarak talep
              edilmesi hâlinde yetkili kamu kurumlarıyla paylaşım yapılabilir.
            </p>

            <Baslik>Ne kadar saklıyoruz?</Baslik>
            <p className="mt-3">
              Kayda dönüşmeyen talepler, en fazla iki yıl boyunca saklanır ve
              sonrasında silinir. Kayda dönüşen taleplerde, öğrenci kaydına
              ilişkin yasal saklama süreleri geçerlidir. Talebiniz üzerine daha
              erken de silebiliriz.
            </p>

            <Baslik>Çerezler</Baslik>
            <p className="mt-3">
              Site, formu doldururken girdiğiniz bilgileri kaybetmemeniz için
              tarayıcınızın oturum deposunu kullanır. Bu veri sunucuya
              gönderilmez ve sekmeyi kapattığınızda silinir.
            </p>

            <Baslik>Haklarınız</Baslik>
            <p className="mt-3">
              Kanunun 11. maddesi uyarınca şu haklara sahipsiniz:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              {HAKLAR.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>

            <Baslik>Nasıl başvurursunuz?</Baslik>
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
          </div>
        </Belir>
      </div>
    </div>
  );
}
