import { NextResponse, type NextRequest } from "next/server";

/**
 * Alan adina gore yonlendirme. PLAN.md Bolum 28.
 *
 * Next.js 16'da middleware'in adi PROXY oldu, islevi ayni
 * (node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md).
 *
 *   bambola.com.tr         -> app/(site)/...     herkese acik
 *   kampus.bambola.com.tr  -> app/kampus/...     giris zorunlu
 *
 * Ayrim ALAN ADI duzeyinde, kod duzeyinde degil: ikisi ayni depoda, ayni
 * Supabase'i ve ayni program/ucret/ekip verisini kullaniyor.
 *
 * DIKKAT: burada YETKI KONTROLU YAPILMIYOR. Next belgeleri acikca uyariyor:
 * proxy her istekte (prefetch dahil) calisiyor, tam yetkilendirme cozumu
 * degil. Buradaki tek is adres yonlendirmesi; kim ne gorebilir sorusu
 * `src/lib/kampus/oturum.ts` icinde ve veritabani RLS politikalarinda
 * cevaplaniyor.
 */

/** Kampus alt alan adi. Yerelde `?kampus=1` ile de denenebilir. */
const KAMPUS_ONEKI = "kampus.";

/**
 * Kok layout'a "bu istek kampus tarafindan geldi" demenin yolu.
 * Okuyan taraf: `src/lib/kampus/istek.ts`.
 *
 * Ad orada da tanimli ve buradan import EDILMIYOR: proxy ayri bir calisma
 * ortaminda kosuyor, oradan modul cekmek gereksiz bag kuruyor. Iki sabit
 * ayni degeri tasiyor, testte karsilastiriliyor.
 */
const KAMPUS_BASLIGI = "x-bambola-kampus";

function kampusMu(istek: NextRequest): boolean {
  const host = istek.headers.get("host") ?? "";
  if (host.startsWith(KAMPUS_ONEKI)) return true;

  /*
    Yerel gelistirme: localhost'ta alt alan adi yok. `?kampus=1` ile bir kez
    girilince cerez yaziliyor ve sonraki isteklerde de kampus gorunuyor.
    Yalniz gelistirmede calisiyor; yayinda host disinda hicbir sey bakilmaz,
    yoksa ana alan adindan da kampuse girilebilirdi.
  */
  if (process.env.NODE_ENV === "development") {
    if (istek.nextUrl.searchParams.get("kampus") === "1") return true;
    if (istek.cookies.get("kampus-yerel")?.value === "1") return true;
  }

  return false;
}

export function proxy(istek: NextRequest) {
  const { pathname, search } = istek.nextUrl;
  const kampus = kampusMu(istek);

  if (kampus) {
    /*
      Kampus alan adinda sitenin sayfalari ACILMAZ. Acilsaydi ayni icerik iki
      adresten yayinlanirdi: arama motoru icin kopya, veli icin kafa karistirici.
    */
    const hedef = istek.nextUrl.clone();
    hedef.pathname = pathname.startsWith("/kampus")
      ? pathname
      : `/kampus${pathname === "/" ? "" : pathname}`;

    /*
      Kok layout site header/footer'ini ve WhatsApp balonunu basiyor; bunlar
      panelde gorunmemeli. Layout'un hangi alan adindan gelindigini bilmesi
      icin istek basligina isaret koyuluyor.

      Neden boyle: rota gruplariyla (app/(site)/...) ayirmak da mumkundu ama
      butun site sayfalarini tasimak gerekirdi. Proxy zaten bu karari
      veriyor, bir kez daha vermesin.
    */
    const basliklar = new Headers(istek.headers);
    basliklar.set(KAMPUS_BASLIGI, "1");

    const cevap = NextResponse.rewrite(hedef, {
      request: { headers: basliklar },
    });
    if (
      process.env.NODE_ENV === "development" &&
      istek.nextUrl.searchParams.get("kampus") === "1"
    ) {
      cevap.cookies.set("kampus-yerel", "1", { path: "/" });
    }
    return cevap;
  }

  /*
    Ana alan adindan /kampus adresine girilemez. Kampus giris ekraninin ana
    alan adinda gorunmesi, oradan oturum acilabilmesi anlamina gelirdi;
    yetkiyi RLS tutuyor ama iki ayri yuzey tutmanin anlami yok.
  */
  if (pathname === "/kampus" || pathname.startsWith("/kampus/")) {
    const hedef = istek.nextUrl.clone();
    hedef.pathname = "/";
    hedef.search = "";
    return NextResponse.redirect(hedef);
  }

  // Site tarafi: dokunulmuyor.
  void search;
  return NextResponse.next();
}

export const config = {
  /*
    Statik dosyalar, gorseller ve api disindaki her yol. `_next` ve dosya
    uzantili yollar disarida: proxy'nin onlarda calismasi bos yere gecikme.
  */
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|ico|webp|woff2?)$).*)",
  ],
};
