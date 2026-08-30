import { adminZorunlu } from "@/lib/kampus/oturum";
import { Kabuk, SayfaBasi, Kutu } from "@/components/kampus/kabuk";
import { Bildirim, Satir } from "@/components/kampus/ui";
import { Ikon } from "@/components/ui/ikon";
import {
  MARKA,
  ILETISIM,
  MEB_IFADESI,
  SITE_URL,
  napAdi,
} from "@/lib/site";
import { GUNLER, GUN_ADI } from "@/lib/data/types";
import { gunSlotlari } from "@/lib/data/program";

export const metadata = { title: "Ayarlar", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * Kurum bilgileri.
 *
 * Su an SALT OKUNUR. Bu bilgiler `src/lib/site.ts` ve `src/lib/data/*`
 * icinde kod olarak duruyor; site, PDF fiyat listesi, üyelik formu ve
 * schema.org hepsi ayni kaynaktan besleniyor. Panelden duzenlenebilir hale
 * getirmek, o kaynagi veritabanina tasimak demek ve o ayri bir is.
 *
 * Yarim yapmak en kotusu olurdu: panelde degistirilen ama sitede
 * gorunmeyen bir alan, yanlis bilgiyi sessizce yayar.
 */
export default async function AyarlarSayfasi() {
  const oturum = await adminZorunlu();

  const saatler = GUNLER.map((g) => {
    const s = gunSlotlari(g);
    if (!s.length) return { gun: g, metin: null };
    const ilk = s.reduce((a, x) => (x.bas < a ? x.bas : a), s[0].bas);
    const son = s.reduce((a, x) => (x.bit > a ? x.bit : a), s[0].bit);
    return { gun: g, metin: `${ilk} - ${son}` };
  });

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/ayarlar">
      <SayfaBasi
        baslik="Ayarlar"
        aciklama="Kurum bilgileri ve çalışma saatleri."
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <Kutu baslik="Kurum">
          <dl>
            <Satir etiket="Ticari ad">{MARKA.ad}</Satir>
            <Satir etiket="NAP adı">{napAdi()}</Satir>
            <Satir etiket="MEB kurum adı (oyun evi)">{MARKA.kurumAdiOyunEvi}</Satir>
            <Satir etiket="MEB kurum adı (anaokulu)">{MARKA.kurumAdiAnaokulu}</Satir>
            <Satir etiket="MEB ifadesi">{MEB_IFADESI}</Satir>
            <Satir etiket="Site adresi">{SITE_URL}</Satir>
          </dl>
        </Kutu>

        <Kutu baslik="İletişim">
          <dl>
            <Satir etiket="Adres">{ILETISIM.adres}</Satir>
            <Satir etiket="Posta kodu">{ILETISIM.postaKodu}</Satir>
            <Satir etiket="Telefon">{ILETISIM.telefon}</Satir>
            <Satir etiket="WhatsApp">{ILETISIM.whatsapp ? `+${ILETISIM.whatsapp}` : null}</Satir>
            <Satir etiket="E-posta">{ILETISIM.eposta}</Satir>
            <Satir etiket="Instagram">{ILETISIM.instagram}</Satir>
            <Satir etiket="Google kaydı">{ILETISIM.googleAdi}</Satir>
            <Satir etiket="Koordinat">{
                ILETISIM.konum
                  ? `${ILETISIM.konum.enlem}, ${ILETISIM.konum.boylam}`
                  : null
              }</Satir>
          </dl>
        </Kutu>

        <Kutu baslik="Çalışma saatleri">
          <dl>
            {saatler.map(({ gun, metin }) => (
              <Satir key={gun} etiket={GUN_ADI[gun]}>
                {metin ?? "Grup programı yok"}
              </Satir>
            ))}
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-panel-silik">
            Saatler haftalık programdan hesaplanıyor, elle girilmiyor.
          </p>
        </Kutu>

        <Kutu baslik="Düzenleme">
          <Bildirim ton="bilgi" ikon={<Ikon.Ampul boyut={16} />}>
            Bu bilgiler şu an <strong>salt okunur</strong>. Kaynak{" "}
            <code className="rounded bg-panel-yuzey px-1.5 py-0.5 font-mono text-xs">
              src/lib/site.ts
            </code>{" "}
            dosyasında; site, PDF fiyat listesi, üyelik formu ve schema.org
            hepsi oradan besleniyor.
          </Bildirim>
          <p className="mt-3 text-sm leading-relaxed text-panel-soluk">
            Panelden düzenlenebilir yapmak, bu kaynağı veritabanına taşımak
            demek. Yarım yapmak en kötüsü olurdu: panelde değiştirilip sitede
            görünmeyen bir alan, yanlış bilgiyi sessizce yayar.
          </p>
        </Kutu>
      </div>
    </Kabuk>
  );
}
