import { KAYIT_FORMU_ACIK, whatsappBaglantisi } from "@/lib/site";
import { ButonLink } from "@/components/ui/buton";
import { Ikon } from "@/components/ui/ikon";

/**
 * Sitenin tek donusum cagrisi.
 *
 * Musteri karari, 17 Agustos 2026: online kayit formu henuz yayinda degil,
 * "kayit formunu doldur" dugmesi hicbir sayfada olmayacak. Kayit WhatsApp
 * ve telefonla aliniyor. Bu yuzden butun cagrilar buradan geciyor: dugmenin
 * metni, hedefi ve tiklama sayimi tek yerde.
 *
 * `grup` veya `atolye` verilirse baglanti sayac rotasindan gecer
 * (app/git/whatsapp/route.ts): hazir mesaj o programa ozel yazilir ve
 * tiklama "hangi programa kac kisi" olarak sayilir.
 *
 * KAYIT_FORMU_ACIK true olunca burasi tekrar forma yonlendirmek uzere
 * degistirilecek; sayfalara dokunmak gerekmiyor.
 */
export function BilgiCagrisi({
  grup,
  atolye,
  donem,
  nereden = "bilinmiyor",
  metin = "Detaylı bilgi al",
  olcu = "lg",
  gorunum,
  className = "",
}: {
  /** Program ailesi slug'i. Ucret kartlari ve aile sayfalari. */
  grup?: string;
  /** Atolye slug'i. Bir aileye bagli olmayan programlar icin. */
  atolye?: string;
  /**
   * /bilgi sayfasindaki donem karti slug'i (bkz. data/donem.ts).
   * Kart ucret ailesinden daha ince bolunmus olabilir ("12-24 Ay Bebek Oyun
   * Grubu"); mesajda kartin kendi adi gecsin diye ayri bir alan var.
   */
  donem?: string;
  nereden?: "bilgi" | "ucretler" | "program" | "bilinmiyor";
  metin?: string;
  olcu?: "sm" | "md" | "lg";
  gorunum?: "dolu" | "cizgili" | "yumusak";
  className?: string;
}) {
  const wa = whatsappBaglantisi(
    "Merhaba, gruplar ve ücretler hakkında bilgi almak istiyorum.",
  );

  /*
    Numara yoksa cagri HIC BASILMAZ (PLAN.md Bolum 3 madde 5: kap olmadan
    cagri yapilmaz). Kayit formu da kapali oldugu icin yedek bir hedef yok.
  */
  if (!wa) return null;

  const hedef = donem
    ? `/git/whatsapp?donem=${donem}&nereden=${nereden}`
    : grup
      ? `/git/whatsapp?grup=${grup}&nereden=${nereden}`
      : atolye
        ? `/git/whatsapp?atolye=${atolye}&nereden=${nereden}`
        : wa;

  const disaAcilir = hedef === wa;

  return (
    <ButonLink
      href={hedef}
      olcu={olcu}
      gorunum={gorunum}
      className={className}
      {...(disaAcilir
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      <Ikon.Whatsapp boyut={olcu === "sm" ? 16 : 19} />
      {metin}
    </ButonLink>
  );
}

/**
 * Kayit kapali oldugunu anlatan tek satir. Cagri bloklarinin altinda,
 * "bir sekilde kayit olmak isteyen" veliye gorunur.
 */
export function KayitYakindaNotu({
  className = "",
  ton = "koyu",
}: {
  className?: string;
  /** Koyu zeminde beyaz, acik zeminde soluk murekkep. */
  ton?: "koyu" | "acik";
}) {
  if (KAYIT_FORMU_ACIK) return null;
  return (
    <p
      className={`text-sm leading-relaxed ${
        ton === "koyu" ? "text-white/90" : "text-murekkep-soluk"
      } ${className}`}
    >
      Online kayıt formu çok yakında açılıyor.
    </p>
  );
}
