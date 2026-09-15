import { adminZorunlu } from "@/lib/kampus/oturum";
import {
  giderAylari,
  giderleriGetir,
  suKartiGetir,
  ayEtiketi,
  tl,
} from "@/lib/kampus/defter";
import { kisaTarih } from "@/lib/kampus/ogrenci-tipleri";
import { Kabuk, SayfaBasi, Kutu } from "@/components/kampus/kabuk";
import {
  BosDurum,
  Sayac,
  SekmeSeridi,
  TabloSarmal,
  Th,
  Td,
  Tr,
} from "@/components/kampus/ui";
import { GiderFormu, SuKartiFormu } from "@/components/kampus/gider-formu";
import { Ikon } from "@/components/ui/ikon";

export const metadata = { title: "Giderler", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * Giderler: Excel "ELDEN VERDIGIMIZ ODEMELER" sayfasi + "SU YUKLEME".
 * Aylik sekmeler, satirlar ve toplam. Su karti ustte ayri bir kutu.
 */
export default async function GiderlerSayfasi({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const oturum = await adminZorunlu();
  const p = await searchParams;
  const istenen = Array.isArray(p.ay) ? p.ay[0] : p.ay;

  const [aylar, su] = await Promise.all([giderAylari(), suKartiGetir()]);
  const buAy = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" }).slice(0, 7);
  const ay =
    istenen === "hepsi"
      ? "hepsi"
      : istenen && /^\d{4}-\d{2}$/.test(istenen)
        ? istenen
        : (aylar[0]?.ay ?? buAy);

  const giderler = await giderleriGetir(ay === "hepsi" ? undefined : ay);
  const toplam = giderler.reduce((t, g) => t + g.tutar, 0);
  const tumZamanlar = aylar.reduce((t, a) => t + a.toplam, 0);
  const sekmeAylari = [...new Set([buAy, ...aylar.map((a) => a.ay)])].sort((a, b) => b.localeCompare(a));

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/giderler">
      <SayfaBasi
        baslik="Giderler"
        aciklama="Elden verilen ödemeler: personel elden kısımları, market, su, süsleme, tadilat."
        cocuklar={<GiderFormu />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Sayac
          etiket={ay === "hepsi" ? "Tüm giderler" : `${ayEtiketi(ay)} gideri`}
          deger={tl(toplam)}
          ton="uyari"
          alt={`${giderler.length} kalem`}
        />
        <Sayac etiket="Tüm zamanlar" deger={tl(tumZamanlar)} alt={`${aylar.length} ay`} />
        {su.map((s) => (
          <Sayac
            key={s.id}
            etiket={s.etiket}
            deger={s.tl !== null ? tl(s.tl) : "—"}
            alt={
              <span className="flex flex-wrap items-center gap-x-2">
                {s.tarih && <span>{kisaTarih(s.tarih)}</span>}
                {s.stok !== null && <span>stok {s.stok}</span>}
                <SuKartiFormu satir={s} />
              </span>
            }
            ikon={<Ikon.Balon boyut={14} />}
          />
        ))}
        {su.length === 0 && (
          <Sayac etiket="Su kartı" deger="—" alt={<SuKartiFormu />} />
        )}
      </div>

      <div className="mt-4">
        <SekmeSeridi
          sekmeler={[
            ...sekmeAylari.map((a) => ({
              anahtar: a,
              etiket: ayEtiketi(a),
              yol: `/kampus/giderler?ay=${a}`,
              sayi: aylar.find((x) => x.ay === a)?.satir,
              aktif: a === ay,
            })),
            { anahtar: "hepsi", etiket: "Hepsi", yol: "/kampus/giderler?ay=hepsi", aktif: ay === "hepsi" },
          ]}
        />
      </div>

      {giderler.length === 0 ? (
        <div className="mt-4">
          <BosDurum
            baslik="Bu ayda gider yok"
            ikon={<Ikon.Rozet boyut={22} />}
            aciklama="Yukarıdaki düğmeyle gider ekleyebilirsiniz."
          />
        </div>
      ) : (
        <Kutu className="mt-4" dolgusuz>
          <TabloSarmal enAz="40rem">
            <thead>
              <tr>
                <Th>Tarih</Th>
                <Th>Açıklama</Th>
                <Th>Not</Th>
                <Th sag>Tutar</Th>
                <Th>Kaynak</Th>
                <Th sag> </Th>
              </tr>
            </thead>
            <tbody>
              {giderler.map((g) => (
                <Tr key={g.id}>
                  <Td className="whitespace-nowrap tabular-nums text-panel-soluk">{kisaTarih(g.tarih)}</Td>
                  <Td className="text-murekkep">{g.aciklama}</Td>
                  <Td className="text-xs text-panel-soluk">{g.ek_not ?? ""}</Td>
                  <Td sayi className="whitespace-nowrap font-semibold">{tl(g.tutar)}</Td>
                  <Td className="whitespace-nowrap text-xs text-panel-silik">
                    {g.kaynak === "excel" ? `Excel · ${g.kaynak_satir}` : `panel · ${g.olusturan ?? ""}`}
                  </Td>
                  <Td sag>
                    <GiderFormu gider={g} />
                  </Td>
                </Tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="border-t border-panel-cizgi-guclu px-4 py-3 font-baslik text-sm font-bold uppercase tracking-[0.06em] text-panel-soluk">
                  Toplam
                </td>
                <td className="border-t border-panel-cizgi-guclu px-4 py-3 text-right font-baslik text-base font-bold tabular-nums text-murekkep">
                  {tl(toplam)}
                </td>
                <td colSpan={2} className="border-t border-panel-cizgi-guclu" />
              </tr>
            </tfoot>
          </TabloSarmal>
        </Kutu>
      )}
    </Kabuk>
  );
}
