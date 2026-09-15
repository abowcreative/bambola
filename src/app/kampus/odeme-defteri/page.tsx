import Link from "next/link";
import { adminZorunlu } from "@/lib/kampus/oturum";
import {
  defterAylari,
  defterSatirlari,
  ogrenciSecenekleri,
  defterSozlugu,
  ayEtiketi,
  tl,
  tutarMetni,
  DEFTER_YONTEM_ETIKET,
} from "@/lib/kampus/defter";
import { kisaTarih } from "@/lib/kampus/ogrenci-tipleri";
import { Kabuk, SayfaBasi, Kutu } from "@/components/kampus/kabuk";
import {
  BosDurum,
  Rozet,
  Sayac,
  SekmeSeridi,
  TabloSarmal,
  Th,
  Td,
  Tr,
} from "@/components/kampus/ui";
import { PaketSatisiFormu, PaketSatisiDuzelt } from "@/components/kampus/defter-formu";
import { Ikon } from "@/components/ui/ikon";

export const metadata = { title: "Ödeme defteri", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * Odeme defteri: Excel'deki aylik sayfalarin yerine.
 *
 * Her ay bir sekme, altinda o ayin satirlari ve en altta "TOPLAM CIRO"
 * (Excel'de AGUSTOS'26 sayfasindaki SUM hucresi; burada her ay icin var).
 * Satir bir ogrenciye bagliysa adi baglanti; baglanamamis Excel satirlari
 * adiyla duruyor ve duzeltme kipinden ogrenciye baglanabiliyor.
 */
export default async function OdemeDefteriSayfasi({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const oturum = await adminZorunlu();
  const p = await searchParams;
  const istenen = Array.isArray(p.ay) ? p.ay[0] : p.ay;

  const aylar = await defterAylari();
  const buAy = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" }).slice(0, 7);
  const ay = istenen && /^\d{4}-\d{2}$/.test(istenen) ? istenen : (aylar[0]?.ay ?? buAy);

  const [satirlar, secenekler, sozluk] = await Promise.all([
    defterSatirlari(ay),
    ogrenciSecenekleri(),
    defterSozlugu(),
  ]);

  const seciliAy = aylar.find((a) => a.ay === ay);
  const toplam = satirlar.reduce((t, s) => t + (s.tutar ?? 0), 0);
  const tutarsiz = satirlar.filter((s) => s.tutar === null).length;
  const bagsiz = satirlar.filter((s) => !s.ogrenci_id).length;
  const tumZamanlar = aylar.reduce((t, a) => t + a.toplam, 0);
  const sonOnIkiAy = aylar.slice(0, 12).reduce((t, a) => t + a.toplam, 0);

  /* Sekmeler: defterdeki aylar + bu ay (henuz satiri yoksa da acilabilsin). */
  const sekmeAylari = [...new Set([buAy, ...aylar.map((a) => a.ay)])].sort((a, b) => b.localeCompare(a));

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/odeme-defteri">
      <SayfaBasi
        baslik="Ödeme defteri"
        aciklama="Ay ay alınan paket ödemeleri. Excel'deki aylık sayfaların karşılığı; ödeme eklenince öğrencinin son ödeme bilgisi de güncellenir."
        cocuklar={
          <PaketSatisiFormu
            ogrenciler={secenekler}
            sozluk={sozluk}
            varsayilanTarih={ay === buAy ? undefined : `${ay}-01`}
          />
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Sayac
          etiket={`${ayEtiketi(ay)} cirosu`}
          deger={tl(toplam)}
          ton="basari"
          alt={`${satirlar.length} ödeme${tutarsiz ? ` · ${tutarsiz} tutarsız satır` : ""}`}
        />
        <Sayac etiket="Son 12 ay" deger={tl(sonOnIkiAy)} />
        <Sayac etiket="Tüm zamanlar" deger={tl(tumZamanlar)} alt={`${aylar.length} ay`} />
        <Sayac
          etiket="Öğrenciye bağlanmamış"
          deger={bagsiz}
          alt="bu ayda"
          ton={bagsiz > 0 ? "uyari" : "notr"}
        />
      </div>

      <div className="mt-4">
        <SekmeSeridi
          sekmeler={sekmeAylari.map((a) => ({
            anahtar: a,
            etiket: ayEtiketi(a),
            yol: `/kampus/odeme-defteri?ay=${a}`,
            sayi: aylar.find((x) => x.ay === a)?.satir,
            aktif: a === ay,
          }))}
        />
      </div>

      {satirlar.length === 0 ? (
        <div className="mt-4">
          <BosDurum
            baslik={`${ayEtiketi(ay)} için kayıt yok`}
            ikon={<Ikon.Sayilar boyut={22} />}
            aciklama="Yukarıdaki düğmeyle bu aya ödeme ekleyebilirsiniz."
          />
        </div>
      ) : (
        <Kutu
          className="mt-4"
          dolgusuz
          baslik={ayEtiketi(ay)}
          aciklama={seciliAy?.tutarsiz ? `${seciliAy.tutarsiz} satırın tutarı sayı değil (Excel'de metin); toplama girmiyor.` : undefined}
        >
          <TabloSarmal enAz="64rem">
            <thead>
              <tr>
                <Th>Tarih</Th>
                <Th>Çocuk</Th>
                <Th>Veli</Th>
                <Th>Paket</Th>
                <Th>Program</Th>
                <Th sag>Tutar</Th>
                <Th>Ödeme şekli</Th>
                <Th>Açıklama</Th>
                <Th>Kaynak</Th>
                <Th sag> </Th>
              </tr>
            </thead>
            <tbody>
              {satirlar.map((s) => (
                <Tr key={s.id}>
                  <Td className="whitespace-nowrap tabular-nums text-panel-soluk">
                    {kisaTarih(s.tarih) || (
                      <span className="text-panel-silik">{s.tarih_ham ?? "—"}</span>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap">
                    {s.ogrenci ? (
                      <Link
                        href={`/kampus/ogrenciler/${s.ogrenci.id}`}
                        className="font-semibold text-murekkep hover:text-yesil-derin hover:underline"
                      >
                        {s.cocuk_adi}
                      </Link>
                    ) : (
                      <>
                        <span className="font-semibold text-murekkep">{s.cocuk_adi}</span>
                        <span className="ml-1.5 align-middle">
                          <Rozet ton="uyari">bağlı değil</Rozet>
                        </span>
                      </>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap text-panel-soluk">{s.veli_adi ?? "—"}</Td>
                  <Td className="whitespace-nowrap">{s.paket ?? "—"}</Td>
                  <Td className="whitespace-nowrap text-panel-soluk">{s.program ?? "—"}</Td>
                  <Td sayi className={`whitespace-nowrap font-semibold ${s.tutar === null ? "text-uyari" : ""}`}>
                    {tutarMetni(s)}
                  </Td>
                  <Td className="whitespace-nowrap text-panel-soluk">
                    {s.odeme_turu ?? (s.yontem ? DEFTER_YONTEM_ETIKET[s.yontem] : "—")}
                  </Td>
                  <Td className="max-w-[20rem] truncate text-xs text-panel-soluk" title={s.aciklama ?? undefined}>
                    {s.aciklama ?? ""}
                    {s.bolum && <span className="text-panel-silik"> · {s.bolum}</span>}
                  </Td>
                  <Td className="whitespace-nowrap text-xs text-panel-silik">
                    {s.kaynak === "excel" ? `${s.sayfa} · ${s.kaynak_satir}` : `panel · ${s.olusturan ?? ""}`}
                  </Td>
                  <Td sag>
                    <PaketSatisiDuzelt satis={s} ogrenciler={secenekler} sozluk={sozluk} />
                  </Td>
                </Tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} className="border-t border-panel-cizgi-guclu px-4 py-3 font-baslik text-sm font-bold uppercase tracking-[0.06em] text-panel-soluk">
                  Toplam ciro
                </td>
                <td className="border-t border-panel-cizgi-guclu px-4 py-3 text-right font-baslik text-base font-bold tabular-nums text-murekkep">
                  {tl(toplam)}
                </td>
                <td colSpan={4} className="border-t border-panel-cizgi-guclu" />
              </tr>
            </tfoot>
          </TabloSarmal>
        </Kutu>
      )}

      <p className="mt-3 text-xs leading-relaxed text-panel-silik">
        Excel&apos;den gelen satırlar sayfa adı ve satır numarasıyla işaretli; hücre
        metin olarak girilmişse (“2500 nakit 2500 kart”) tutar toplanmış, ham
        metin düzeltme kipinde görünür.
      </p>
    </Kabuk>
  );
}
