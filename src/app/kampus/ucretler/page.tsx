import { adminZorunlu } from "@/lib/kampus/oturum";
import { Kabuk, SayfaBasi, Kutu } from "@/components/kampus/kabuk";
import {
  Sayac,
  TabloSarmal,
  Th,
  Td,
  Tr,
} from "@/components/kampus/ui";
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
          ton={acik ? "basari" : "notr"}
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

      <div className="mt-4 space-y-3">
        {AILELER.map((aile) => {
          const paketler = PAKETLER[aile.slug] ?? [];
          return (
            <Kutu
              key={aile.slug}
              baslik={aile.ad}
              aciklama={`${aile.yasEtiket} · ${aile.sure}`}
              dolgusuz
            >
              <TabloSarmal enAz="30rem">
                <thead>
                  <tr>
                    <Th>Paket</Th>
                    <Th sag>Normal</Th>
                    <Th sag>Erken kayıt</Th>
                    <Th sag>Şu an geçerli</Th>
                  </tr>
                </thead>
                <tbody>
                  {paketler.map((p) => {
                    const indirim = indirimVarMi(p);
                    const gecerli = acik && indirim ? p.erkenKayit : p.normal;
                    return (
                      <Tr key={p.kod}>
                        <Td className="font-medium">{p.etiket}</Td>
                        <Td sayi className="text-panel-soluk">
                          {tlYaz(p.normal)}
                        </Td>
                        <Td sayi className="text-panel-soluk">
                          {indirim ? tlYaz(p.erkenKayit) : "—"}
                        </Td>
                        <Td
                          sayi
                          className="font-baslik font-bold text-yesil-derin"
                        >
                          {tlYaz(gecerli)}
                        </Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </TabloSarmal>
            </Kutu>
          );
        })}
      </div>

      <Kutu baslik="Tek seferlik katılım" className="mt-4">
        <dl className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["Türkçe seans", tekSeferUcreti("tr")],
              ["İngilizce seans", tekSeferUcreti("en")],
            ] as const
          ).map(([etiket, tutar]) => (
            <div
              key={etiket}
              className="rounded-panel-sm border border-panel-cizgi bg-panel-yuzey-alt px-3.5 py-2.5"
            >
              <dt className="text-xs font-medium text-panel-soluk">{etiket}</dt>
              <dd className="mt-0.5 font-baslik text-lg font-bold tabular-nums text-murekkep">
                {tlYaz(tutar)}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-panel-silik">
          Tek seferlik katılıma erken kayıt indirimi uygulanmıyor.
        </p>
      </Kutu>

      <p className="mt-3 text-xs leading-relaxed text-panel-silik">
        Rakamlar site, PDF fiyat listesi ve kayıt formuyla aynı kaynaktan
        geliyor. Değişiklik `src/lib/data/ucretler.ts` içinde yapılır ve her
        yere birden yansır.
      </p>
    </Kabuk>
  );
}
