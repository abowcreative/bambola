import { NextResponse, type NextRequest } from "next/server";
import { AILELER } from "@/lib/data/gruplar";
import {
  KAMPANYA_PENCERESI,
  ERKEN_KAYIT_ORANI,
  kampanyaAcikMi,
} from "@/lib/data/ucretler";
import { whatsappBaglantisi } from "@/lib/site";
import { yoneticiIstemcisi } from "@/lib/supabase/server";
import { ipOzeti, istekIp, sinirAsildiMi } from "@/lib/rate-limit";

/**
 * "Bu programa kaydol" -> WhatsApp yonlendirmesi, arada SAYAC.
 *
 * Neden dogrudan wa.me baglantisi degil: kurumun bilmek istedigi sey
 * "hangi programa kac kisi tikladi". wa.me baglantisina tiklayan kisi
 * WhatsApp'i acip yazmadan vazgecerse hicbir iz kalmiyor; asil bilgi de
 * tam orada, tiklama ile gelen mesaj arasindaki farkta.
 *
 * KISI TANIMLAYAN HICBIR SEY YAZILMIYOR: IP yok, IP ozeti yok, tarayici
 * bilgisi yok, cerez yok. Yalniz "hangi program, hangi sayfadan, ne zaman".
 * IP ozeti yalniz BELLEKTE, hiz siniri icin kullaniliyor ve hicbir yere
 * kaydedilmiyor -- yoksa sayac tarayici adres cubugundan sisirilebilirdi.
 *
 * Yonlendirme 302 (gecici): hedef metin kampanya durumuna gore degisiyor,
 * kalici yonlendirme tarayicida onbelleklenip eski metni tasirdi.
 */

/** Tiklamanin yapildigi sayfa. Beyaz liste: adres cubugundan gelen serbest
    metin veritabanina girmesin. */
const NEREDEN = ["bilgi", "ucretler", "program", "bilinmiyor"] as const;

export async function GET(istek: NextRequest) {
  const q = istek.nextUrl.searchParams;

  /*
    Grup slug'i AILELER ile dogrulaniyor. Beyaz liste olmadan buraya
    yazilan her metin veritabanina duserdi ve sayac cop dolardi.
  */
  const aile = AILELER.find((a) => a.slug === q.get("grup"));
  const nereden = NEREDEN.includes(
    (q.get("nereden") ?? "") as (typeof NEREDEN)[number],
  )
    ? q.get("nereden")!
    : "bilinmiyor";

  const kampanyaAcik = kampanyaAcikMi();
  const yuzde = Math.round(ERKEN_KAYIT_ORANI * 100);

  /*
    Mesaj programa OZEL. Veli WhatsApp'i actiginda ne sorduguyla ugrasmiyor,
    kurum da hangi program icin yazildigini ilk satirda goruyor.
  */
  /*
    "%20" YAZILMIYOR, "yuzde 20" yaziliyor. Sebebi: yuzde isareti URL'de
    once %25 olarak kodlaniyor ve "%2520" cikiyor; bazi istemciler bunu bir
    kez daha cozup yerine BOSLUK koyuyor, yani mesajda "20" kayboluyor.
    Harflerle yazmak bu sinifi tamamen ortadan kaldiriyor.
  */
  const mesaj = aile
    ? kampanyaAcik
      ? `Merhaba, ${aile.ad} (${aile.yasEtiket}) için kayıt olmak istiyorum. Erken kayıt indirimi (yüzde ${yuzde}, son gün ${KAMPANYA_PENCERESI.sonGun}) hakkında bilgi alabilir miyim?`
      : `Merhaba, ${aile.ad} (${aile.yasEtiket}) için kayıt olmak istiyorum. Uygun gün ve saatleri konuşabilir miyiz?`
    : "Merhaba, gruplar ve ücretler hakkında bilgi almak istiyorum.";

  const hedef = whatsappBaglantisi(mesaj);

  /*
    Numara yoksa WhatsApp'a gonderilecek yer de yok: veliyi bos bir sekmede
    birakmak yerine kayit formuna gonderiyoruz (PLAN.md Bolum 3 madde 5).
  */
  if (!hedef) {
    const yol = aile ? `/kayit?program=${aile.slug}` : "/kayit";
    return NextResponse.redirect(new URL(yol, istek.nextUrl.origin), 302);
  }

  /*
    Sayac YAZILAMASA BILE yonlendirme yapilir. Veliyi bir veritabani
    hatasi yuzunden bekletmek veya hata sayfasina dusurmek kabul edilemez;
    kaybedilen sey bir satirlik istatistik.
  */
  if (aile) {
    try {
      const ipHash = ipOzeti(istekIp(istek.headers));
      // 5 dakikada 12 tiklama: dort programi karsilastiran veli sayilsin,
      // adres cubugundan sayaci sisiren sayilmasin.
      if (!sinirAsildiMi(`tiklama:${ipHash}`, 12)) {
        await yoneticiIstemcisi()
          .from("tiklamalar")
          .insert({ hedef: "whatsapp", grup: aile.slug, nereden });
      }
    } catch {
      // sayac calismadi, yonlendirme devam ediyor
    }
  }

  return NextResponse.redirect(hedef, 302);
}
