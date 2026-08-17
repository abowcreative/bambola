import Link from "next/link";
import { ILETISIM, MARKA } from "@/lib/site";
import { sayfaMetadata } from "@/lib/seo";
import {
  YasalSayfa,
  YasalBaslik,
  YasalListe,
} from "@/components/site/yasal-sayfa";

export const metadata = sayfaMetadata({
  baslik: "Kullanım Koşulları",
  aciklama: `${MARKA.ad} web sitesinin kullanım koşulları: içeriğin kapsamı, fiyat ve program bilgisinin bağlayıcılığı, içerik hakları.`,
  yol: "/kosullar",
  indeks: false,
});

/**
 * DIKKAT, BU METIN TASLAKTIR. Yayina cikmadan once kurumun hukuk danismani
 * okumali.
 *
 * En kritik cumle "kayit formu sozlesme degildir": site fiyat ve program
 * yaziyor, veli formu doldurunca kendini kayitli sanabilir. Sitenin kendi
 * akisi da bunu soyluyor (form "talep" gonderiyor, kurum geri donuyor);
 * burada da yazili olmasi gerekiyor.
 */
export default function KosullarSayfasi() {
  return (
    <YasalSayfa
      yol="/kosullar"
      baslik="Kullanım koşulları"
      aciklama="Bu sitedeki bilgilerin kapsamı, kayıt talebinin ne anlama geldiği ve içerik hakları."
    >
      <p>
        Bu koşullar, {MARKA.ad} adıyla{" "}
        <strong className="text-murekkep">{MARKA.tuzelAdOyunEvi}</strong> ve{" "}
        <strong className="text-murekkep">{MARKA.tuzelAdAnaokulu}</strong>{" "}
        tarafından işletilen web sitesi için geçerlidir. Siteyi kullanarak bu
        koşulları kabul etmiş olursunuz.
      </p>

      <YasalBaslik>Kayıt formu bir sözleşme değildir</YasalBaslik>
      <p className="mt-3">
        Sitedeki kayıt formu bir{" "}
        <strong className="text-murekkep">talep</strong> gönderir. Kaydınız,
        kurum sizinle iletişime geçip yer, grup ve ödeme konusunda anlaşma
        sağlandığında kesinleşir. Form doldurmak tek başına yer ayırtmaz;
        gruplar kontenjanla sınırlıdır.
      </p>

      <YasalBaslik>Fiyat, program ve kontenjan bilgisi</YasalBaslik>
      <YasalListe
        ogeler={[
          "Sitedeki ücretler ve paketler, yayınlandığı tarihteki hâlidir; kurum bunları değiştirebilir.",
          "Haftalık program dönem başında planlanır. Öğretmen, gün ve saat değişikliği olabilir.",
          "Yaş aralıkları çocuğun gelişimine göre esnek uygulanabilir; hangi gruba uygun olduğu görüşmede belirlenir.",
          "Bir yazım veya güncelleme hatası kurumu bağlamaz; geçerli olan, görüşmede size yazılı olarak bildirilen koşullardır.",
        ]}
      />

      <YasalBaslik>Sitedeki içerik kime ait?</YasalBaslik>
      <p className="mt-3">
        Sitedeki metinler, fotoğraflar, logo ve tasarım kuruma aittir. İzin
        almadan kopyalanamaz, başka bir yerde yayınlanamaz veya ticari amaçla
        kullanılamaz. Kurumu tanıtmak için siteye bağlantı vermek serbesttir.
      </p>

      <YasalBaslik>Sitenin kullanımı</YasalBaslik>
      <YasalListe
        ogeler={[
          "Formu gerçek dışı bilgiyle veya başkası adına doldurmayın.",
          "Otomatik araçlarla toplu form gönderimi yapmayın; bu tür istekler engellenir.",
          "Siteye veya panele izinsiz erişim denemesi yapmayın.",
        ]}
      />
      <p className="mt-3">
        Formun kötüye kullanılmasını önlemek için gönderim sıklığı sınırlanır
        ve teknik kayıt tutulur. Ayrıntısı{" "}
        <Link
          href="/kvkk"
          className="font-medium text-[var(--kol-koyu)] underline underline-offset-2"
        >
          KVKK aydınlatma metninde
        </Link>
        .
      </p>

      <YasalBaslik>Sorumluluk</YasalBaslik>
      <p className="mt-3">
        Site bilgilendirme amacıyla yayınlanır. İçeriğin doğru ve güncel olması
        için özen gösterilir; buna rağmen sitede yer alan bir bilgiye
        dayanarak alınan kararlardan doğan sonuçlardan kurum sorumlu tutulamaz.
        Hizmetin kendisine ilişkin haklar ve yükümlülükler, kayıt sırasında
        imzalanan üyelik sözleşmesinde düzenlenir.
      </p>

      <YasalBaslik>Dışa açılan bağlantılar</YasalBaslik>
      <p className="mt-3">
        Site; WhatsApp, Instagram ve Google Maps gibi başka hizmetlere
        bağlantı verir. Bu hizmetlerin içeriği ve gizlilik uygulamaları kurumun
        denetiminde değildir.
      </p>

      <YasalBaslik>Uygulanacak hukuk</YasalBaslik>
      <p className="mt-3">
        Bu koşullara Türkiye Cumhuriyeti hukuku uygulanır. Uyuşmazlıklarda{" "}
        {MARKA.sehir} mahkemeleri yetkilidir.
      </p>

      <YasalBaslik>İletişim</YasalBaslik>
      <p className="mt-3">
        Koşullarla ilgili sorularınızı{" "}
        {ILETISIM.telefon ? (
          <a
            href={`tel:${ILETISIM.telefon.replace(/\s/g, "")}`}
            className="font-medium text-[var(--kol-koyu)] underline underline-offset-2"
          >
            {ILETISIM.telefon}
          </a>
        ) : (
          "kurumun iletişim kanalları"
        )}{" "}
        üzerinden ya da{" "}
        <Link
          href="/iletisim"
          className="font-medium text-[var(--kol-koyu)] underline underline-offset-2"
        >
          iletişim sayfasından
        </Link>{" "}
        iletebilirsiniz.
      </p>
    </YasalSayfa>
  );
}
