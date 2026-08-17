import Link from "next/link";
import { MARKA } from "@/lib/site";
import { sayfaMetadata } from "@/lib/seo";
import {
  YasalSayfa,
  YasalBaslik,
  YasalListe,
  YasalTablo,
} from "@/components/site/yasal-sayfa";

export const metadata = sayfaMetadata({
  baslik: "Çerez Politikası",
  aciklama: `${MARKA.ad} sitesinde hangi çerez ve tarayıcı deposu kullanılıyor: izleme ve reklam çerezi yok, analitik kurulu değil.`,
  yol: "/cerez",
  indeks: false,
});

/**
 * DIKKAT, BU METIN TASLAKTIR. Yayina cikmadan once kurumun hukuk danismani
 * okumali.
 *
 * Icerik UYDURULMADI, koddaki gercek durumdan yazildi:
 * - analitik/reklam betigi YOK (app/layout.tsx'te ucuncu taraf betik yok)
 * - yazi tipleri KENDI SUNUCUMUZDA (public/fonts), Google Fonts istegi yok
 * - form taslagi ve WhatsApp balonu sessionStorage kullaniyor
 * - Google haritasi TIKLAYINCA yukleniyor (components/site/harita-kutusu.tsx)
 * - panel oturumu Supabase cerezi kullaniyor (yalniz kampus alan adinda)
 *
 * Bu sayfa degistiginde koda da bakilmali: "cerez kullanmiyoruz" cumlesi
 * bir gun bir analitik eklendiginde sessizce yanlisa dusen tek cumledir.
 */

const DEPO: [string, string][] = [
  [
    "Kayıt formu taslağı (oturum deposu)",
    "Formu doldururken yazdıklarınız, sekmeyi yenilerseniz kaybolmasın diye tarayıcınızın oturum deposunda tutulur. Sunucuya gönderilmez, sekmeyi kapattığınızda silinir.",
  ],
  [
    "WhatsApp balonunun kapatılması (oturum deposu)",
    "Sağ alttaki mesaj kartını kapattıysanız aynı oturumda tekrar açılmaz. Yalnız “kapatıldı” bilgisi tutulur.",
  ],
  [
    "Yönetim paneli oturumu (çerez)",
    "Yalnızca kurumun panelinde (kampus adresinde) ve yalnızca giriş yapan kişide oluşur. Oturumun açık kalmasını sağlar; zorunludur, kapatılamaz. Site tarafında bu çerez yoktur.",
  ],
];

export default function CerezSayfasi() {
  return (
    <YasalSayfa
      yol="/cerez"
      baslik="Çerez politikası"
      aciklama="Sitede reklam ve izleme çerezi kullanmıyoruz. Kullandığımız üç şeyin tamamı aşağıda tek tek yazılı."
    >
      <YasalBaslik>Kısa cevap</YasalBaslik>
      <p className="mt-3">
        Sitede <strong className="text-murekkep">analitik yok</strong>, reklam
        veya izleme çerezi yok, sosyal medya izleme piksellerinden hiçbiri yok.
        Sizi sayfalar arasında veya siteler arasında izlemiyoruz. Bu yüzden
        sitede bir <strong className="text-murekkep">çerez onay bandı da
        yok</strong>: onay gerektiren bir çerez kullanmıyoruz.
      </p>

      <YasalBaslik>Kullandığımız üç şey</YasalBaslik>
      <YasalTablo satirlar={DEPO} />
      <p className="mt-4">
        İlk ikisi teknik olarak çerez bile değil, tarayıcınızın{" "}
        <em>oturum deposu</em>. Aradaki fark şu: çerez her istekte sunucuya
        gönderilir, oturum deposu gönderilmez ve sekmeyi kapattığınızda
        kaybolur.
      </p>

      <YasalBaslik>Google haritası: siz istemedikçe yüklenmiyor</YasalBaslik>
      <p className="mt-3">
        İletişim sayfasındaki harita Google Maps&apos;ten geliyor ve Google
        kendi çerezlerini yazıyor. Bu yüzden harita sayfa açılınca{" "}
        <strong className="text-murekkep">yüklenmiyor</strong>: yerinde bir
        “Haritayı göster” düğmesi duruyor. Siz o düğmeye basmadıkça Google&apos;a
        hiçbir istek gitmiyor, hiçbir çerez yazılmıyor.
      </p>
      <p className="mt-3">
        Haritayı açmak istemezseniz hiçbir şey kaybetmiyorsunuz: adres yazılı
        duruyor ve “Yol tarifi al” bağlantısı haritayı sizin kendi
        uygulamanızda açıyor.
      </p>

      <YasalBaslik>Yazı tipleri ve görseller</YasalBaslik>
      <p className="mt-3">
        Yazı tipleri Google Fonts kaynaklı ama site derlenirken indirilip{" "}
        <strong className="text-murekkep">kendi sunucumuzdan</strong>{" "}
        sunuluyor; sayfayı açtığınızda Google&apos;a yazı tipi isteği gitmiyor.
        Fotoğraflar da kendi sunucumuzda. Yani sayfayı açmak, harita
        düğmesine basmadığınız sürece bizim dışımızda hiçbir adrese istek
        atmıyor.
      </p>

      <YasalBaslik>Dışa açılan bağlantılar</YasalBaslik>
      <p className="mt-3">
        WhatsApp, Instagram ve Google Maps bağlantılarına tıkladığınızda o
        sitelerin kendi politikaları geçerli olur.
      </p>

      <YasalBaslik>Program sayacı</YasalBaslik>
      <p className="mt-3">
        Ücret kartlarındaki &quot;Detaylı bilgi al&quot; düğmesine
        bastığınızda, <strong className="text-murekkep">hangi programın</strong>{" "}
        seçildiği sayısal olarak kaydedilir. Kurum böylece hangi gruba ilgi
        olduğunu görüyor.
      </p>
      <p className="mt-3">
        Bu kayıt <strong className="text-murekkep">kişiye bağlı değildir</strong>
        : IP adresiniz, tarayıcı bilgileriniz ve herhangi bir kimlik
        tutulmuyor, çerez yazılmıyor. Kaydedilen tek şey &quot;şu tarihte, şu
        sayfadan, şu programa tıklandı&quot;. İki farklı kişinin tıklaması ile
        aynı kişinin iki kez tıklaması birbirinden ayırt edilemez; bu bilinçli
        bir tercih.
      </p>

      <YasalBaslik>Nasıl temizlerim?</YasalBaslik>
      <YasalListe
        ogeler={[
          "Oturum deposu: sekmeyi kapatmanız yeterli.",
          "Tarayıcı ayarlarından site verilerini silmek de her ikisini birden temizler.",
          "Panel oturumu: panelden çıkış yapmanız çerezi siler.",
        ]}
      />

      <YasalBaslik>Daha fazlası</YasalBaslik>
      <p className="mt-3">
        Hangi kişisel veriyi topladığımız ve nerede sakladığımız{" "}
        <Link
          href="/gizlilik"
          className="font-medium text-[var(--kol-koyu)] underline underline-offset-2"
        >
          gizlilik politikasında
        </Link>
        , kayıt formundaki alanların tamamı{" "}
        <Link
          href="/kvkk"
          className="font-medium text-[var(--kol-koyu)] underline underline-offset-2"
        >
          KVKK aydınlatma metninde
        </Link>{" "}
        yazılı.
      </p>
    </YasalSayfa>
  );
}
