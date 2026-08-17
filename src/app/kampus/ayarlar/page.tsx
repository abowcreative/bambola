import { adminZorunlu } from "@/lib/kampus/oturum";
import { Kabuk, SayfaBasi, Kutu } from "@/components/kampus/kabuk";
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

function Satir({
  etiket,
  deger,
}: {
  etiket: string;
  deger: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap justify-between gap-3 border-b border-cizgi py-2.5 last:border-b-0">
      <dt className="text-sm text-murekkep-soluk">{etiket}</dt>
      <dd className="text-right text-sm font-medium text-murekkep">
        {deger || <span className="text-murekkep-soluk">—</span>}
      </dd>
    </div>
  );
}

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

      <div className="grid gap-4 lg:grid-cols-2">
        <Kutu baslik="Kurum">
          <dl>
            <Satir etiket="Ticari ad" deger={MARKA.ad} />
            <Satir etiket="NAP adı" deger={napAdi()} />
            <Satir etiket="Tüzel ad (oyun evi)" deger={MARKA.tuzelAdOyunEvi} />
            <Satir etiket="Tüzel ad (anaokulu)" deger={MARKA.tuzelAdAnaokulu} />
            <Satir etiket="MEB ifadesi" deger={MEB_IFADESI} />
            <Satir etiket="Site adresi" deger={SITE_URL} />
          </dl>
        </Kutu>

        <Kutu baslik="İletişim">
          <dl>
            <Satir etiket="Adres" deger={ILETISIM.adres} />
            <Satir etiket="Posta kodu" deger={ILETISIM.postaKodu} />
            <Satir etiket="Telefon" deger={ILETISIM.telefon} />
            <Satir
              etiket="WhatsApp"
              deger={ILETISIM.whatsapp ? `+${ILETISIM.whatsapp}` : null}
            />
            <Satir etiket="E-posta" deger={ILETISIM.eposta} />
            <Satir etiket="Instagram" deger={ILETISIM.instagram} />
            <Satir etiket="Google kaydı" deger={ILETISIM.googleAdi} />
            <Satir
              etiket="Koordinat"
              deger={
                ILETISIM.konum
                  ? `${ILETISIM.konum.enlem}, ${ILETISIM.konum.boylam}`
                  : null
              }
            />
          </dl>
        </Kutu>

        <Kutu baslik="Çalışma saatleri">
          <dl>
            {saatler.map(({ gun, metin }) => (
              <Satir
                key={gun}
                etiket={GUN_ADI[gun]}
                deger={metin ?? "Grup programı yok"}
              />
            ))}
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-murekkep-soluk">
            Saatler haftalık programdan hesaplanıyor, elle girilmiyor.
          </p>
        </Kutu>

        <Kutu baslik="Düzenleme">
          <p className="text-sm leading-relaxed text-murekkep-soluk">
            Bu bilgiler şu an <strong>salt okunur</strong>. Kaynak
            <code className="mx-1 rounded bg-krem px-1.5 py-0.5 font-mono text-xs">
              src/lib/site.ts
            </code>
            dosyasında; site, PDF fiyat listesi, üyelik formu ve schema.org
            hepsi oradan besleniyor.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-murekkep-soluk">
            Panelden düzenlenebilir yapmak, bu kaynağı veritabanına taşımak
            demek. Yarım yapmak en kötüsü olurdu: panelde değiştirilip sitede
            görünmeyen bir alan, yanlış bilgiyi sessizce yayar.
          </p>
        </Kutu>
      </div>
    </Kabuk>
  );
}
