import Link from "next/link";
import { foto, gosterilenFotolar } from "@/lib/data/fotograflar";
import { Foto } from "./foto";
import { Sirali, SiraliOge } from "./bolum";
import { Ikon } from "@/components/ui/ikon";

/**
 * Sayfanin ustundeki kompakt mekan mozaigi.
 *
 * NEDEN SERIT DEGIL: /bilgi'de mekan kareleri sonsuz kayan bir seritti
 * (FotoKaydiragi) ve sayfanin ortasinda, ucretlerden sonra duruyordu.
 * DM'den gelen velinin ilk sorusu "burasi neresi" oldugu icin kareler yukari
 * alindi. Yukarida akan bir serit iyi durmuyor: goz metni okumaya calisirken
 * yandaki hareket rahatsiz ediyor ve kayan seritte kullanici hangi kareyi
 * gordugunu secemiyor. Duran mozaik dort mekani bir bakista veriyor.
 *
 * DORT KARE, DORT AYRI ALAN: oyun alani, atolye, bahce ve ebeveyn bekleme
 * alani. Velinin merak ettigi dort sey bunlar; ayni alandan iki kare koymak
 * yerine her alandan bir kare secildi.
 *
 * Kapak karesi `oncelikli`: mozaik artik sayfanin en ustunde, yani en buyuk
 * gorsel oge (LCP) o. Onceligi verilmezse tarayici onu sirasi gelince
 * indirir ve ilk boyama gecikir.
 *
 * Kare secimi ELLE: `gosterilenFotolar()` sirasindan ilk dordu alinsaydi
 * dordu de oyun alanindan cikardi. Ama sayac o listeden okunuyor, boylece
 * musteri bir kareyi kaldirtinca "19 kare" yazisi kendiliginden duzeliyor.
 */

/** Mozaikteki dort kare, soldan saga. */
const KARELER = [
  {
    slug: "bambola-top-havuzu-01",
    /* Masaustunde iki sutun iki satir: mozaigin capasi. Mobilde tek hucre. */
    yerlesim: "sm:col-span-2 sm:row-span-2",
    boyutlar: "(min-width: 640px) 384px, 50vw",
    oncelikli: true,
    genis: false,
  },
  {
    slug: "bambola-atolye-sinifi-01",
    yerlesim: "",
    boyutlar: "(min-width: 640px) 192px, 50vw",
    oncelikli: false,
    genis: false,
  },
  {
    slug: "bambola-bahce-kum-havuzu-01",
    yerlesim: "",
    boyutlar: "(min-width: 640px) 192px, 50vw",
    oncelikli: false,
    genis: false,
  },
  {
    slug: "bambola-kafe-pencere-kenari-01",
    /* Alt satirin sagi. 16:9 kirpimi var, genis kutuda daha iyi kadraj. */
    yerlesim: "sm:col-span-2",
    boyutlar: "(min-width: 640px) 384px, 50vw",
    oncelikli: false,
    genis: true,
  },
] as const;

export function FotoMozaik() {
  const kareSayisi = gosterilenFotolar().length;

  return (
    <section aria-label="Mekândan kareler">
      {/*
        IZGARA HER IKI KIRILIMDA DA SABIT YUKSEKLIKTE. Kutular kendi
        oranlarini birakip hucreyi dolduruyor (asagida `aspect-auto`),
        mozaik duzgun bir dikdortgen olarak kapaniyor.

        Mobil 2x2, masaustu 4x2. Yukseklik bilerek dusuk tutuldu: bu oge
        sayfanin en ustunde ve altinda okunmasi gereken uzun bir sayfa var,
        kareler ekrani kaplarsa veli fiyata inmeden birakiyor. Kutular
        mobilde tam genislige birakilsaydi dort kare ust uste ~1100 piksel
        tutuyordu.
      */}
      <Sirali
        className="grid h-[280px] grid-cols-2 grid-rows-2 gap-2.5 sm:h-[320px] sm:grid-cols-4"
        aralik={0.06}
      >
        {KARELER.map((k) => (
          <SiraliOge key={k.slug} className={`${k.yerlesim} h-full`}>
            {/*
              Uzerine gelince kare yavasca yakinlasiyor. Efekt Foto'nun
              icindeki <img>'e ariyor sinif (`[&_img]:`) ile veriliyor:
              Foto butun sayfalarda kullanilan ortak bilesen, ona yalniz
              bu mozaik icin bir prop eklemek gerekmiyor.
            */}
            <Foto
              foto={foto(k.slug)}
              oran="yatay"
              genis={k.genis}
              oncelikli={k.oncelikli}
              boyutlar={k.boyutlar}
              className="h-full !aspect-auto overflow-hidden [&_img]:transition-transform [&_img]:duration-500 [&_img]:ease-yayli hover:[&_img]:scale-105"
            />
          </SiraliOge>
        ))}
      </Sirali>

      <Link
        href="/mekan"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-yesil-koyu hover:underline"
      >
        Mekânın tamamı, {kareSayisi} kare
        <Ikon.Ok boyut={14} />
      </Link>
    </section>
  );
}
