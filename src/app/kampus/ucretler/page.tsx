import { adminZorunlu } from "@/lib/kampus/oturum";
import { Kabuk, SayfaBasi, Kutu, Sayac } from "@/components/kampus/kabuk";
import { AILELER } from "@/lib/data/gruplar";
import {
  PAKETLER,
  ERKEN_KAYIT_ORANI,
  KAMPANYA_PENCERESI,
  kampanyaAcikMi,
  kampanyaKalanGun,
  indirimVarMi,
  tekSeferUcreti,
  tlYaz,
} from "@/lib/data/ucretler";

export const metadata = { title: "Ücretler", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * Tarife ve kampanya penceresi.
 *
 * Rakamlar `src/lib/data/ucretler.ts` icinden geliyor, yani site, PDF fiyat
 * listesi ve kayit formuyla AYNI kaynak. Panelde ayri bir tarife tutulsaydi
 * veliye soylenen fiyatla panelde gorulen ayrisirdi.
 */
export default async function UcretlerSayfasi() {
  const oturum = await adminZorunlu();
  const acik = kampanyaAcikMi();
  const kalan = kampanyaKalanGun();
  const yuzde = Math.round(ERKEN_KAYIT_ORANI * 100);

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/ucretler">
      <SayfaBasi
        baslik="Paketler ve ücretler"
        aciklama="Tarife, erken kayıt penceresi ve indirim kuralları."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Sayac
          etiket="Erken kayıt"
          deger={acik ? "Açık" : "Kapalı"}
          alt={KAMPANYA_PENCERESI.metin}
          vurgu={acik}
        />
        <Sayac
          etiket="İndirim oranı"
          deger={`%${yuzde}`}
          alt="aylık paketlerde"
        />
        <Sayac
          etiket="Kalan gün"
          deger={acik ? kalan : "—"}
          alt={acik ? `son gün ${KAMPANYA_PENCERESI.sonGun}` : "pencere kapalı"}
        />
      </div>

      <div className="mt-6 space-y-4">
        {AILELER.map((aile) => {
          const paketler = PAKETLER[aile.slug] ?? [];
          return (
            <Kutu key={aile.slug} baslik={aile.ad}>
              <p className="-mt-2 mb-3 text-sm text-murekkep-soluk">
                {aile.yasEtiket} · {aile.sure}
              </p>

              <div className="-mx-5 overflow-x-auto px-5">
                <table className="w-full min-w-[30rem] text-sm">
                  <thead>
                    <tr className="border-b-2 border-cizgi text-left">
                      <th className="pb-2 font-baslik text-xs uppercase tracking-wide text-murekkep-soluk">
                        Paket
                      </th>
                      <th className="pb-2 text-right font-baslik text-xs uppercase tracking-wide text-murekkep-soluk">
                        Normal
                      </th>
                      <th className="pb-2 text-right font-baslik text-xs uppercase tracking-wide text-murekkep-soluk">
                        Erken kayıt
                      </th>
                      <th className="pb-2 text-right font-baslik text-xs uppercase tracking-wide text-murekkep-soluk">
                        Şu an geçerli
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cizgi">
                    {paketler.map((p) => {
                      const indirim = indirimVarMi(p);
                      const gecerli = acik && indirim ? p.erkenKayit : p.normal;
                      return (
                        <tr key={p.kod}>
                          <td className="py-2.5 font-medium text-murekkep">
                            {p.etiket}
                          </td>
                          <td className="py-2.5 text-right tabular-nums text-murekkep-soluk">
                            {tlYaz(p.normal)}
                          </td>
                          <td className="py-2.5 text-right tabular-nums text-murekkep-soluk">
                            {indirim ? tlYaz(p.erkenKayit) : "—"}
                          </td>
                          <td className="py-2.5 text-right font-baslik font-bold tabular-nums text-yesil-koyu">
                            {tlYaz(gecerli)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Kutu>
          );
        })}
      </div>

      <Kutu baslik="Tek seferlik katılım" className="mt-4">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-kart border-2 border-cizgi px-4 py-3">
            <dt className="text-sm text-murekkep-soluk">Türkçe seans</dt>
            <dd className="font-baslik text-lg font-bold text-murekkep">
              {tlYaz(tekSeferUcreti("tr"))}
            </dd>
          </div>
          <div className="rounded-kart border-2 border-cizgi px-4 py-3">
            <dt className="text-sm text-murekkep-soluk">İngilizce seans</dt>
            <dd className="font-baslik text-lg font-bold text-murekkep">
              {tlYaz(tekSeferUcreti("en"))}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-murekkep-soluk">
          Tek seferlik katılıma erken kayıt indirimi uygulanmıyor.
        </p>
      </Kutu>

      <p className="mt-4 text-xs leading-relaxed text-murekkep-soluk">
        Rakamlar site, PDF fiyat listesi ve kayıt formuyla aynı kaynaktan
        geliyor. Değişiklik `src/lib/data/ucretler.ts` içinde yapılır ve her
        yere birden yansır.
      </p>
    </Kabuk>
  );
}
