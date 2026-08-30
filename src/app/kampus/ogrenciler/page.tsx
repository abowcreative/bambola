import Link from "next/link";
import { oturumZorunlu } from "@/lib/kampus/oturum";
import {
  ogrencileriGetir,
  siniflariGetir,
  ogrenciAdi,
  OGRENCI_DURUM_ETIKET,
  type OgrenciDurumu,
} from "@/lib/kampus/ogrenciler";
import { OgrenciFormu } from "@/components/kampus/ogrenci-formu";
import { leadGetir } from "@/lib/kampus/yoklama";
import { z } from "zod";
import { Kabuk, SayfaBasi, Kutu } from "@/components/kampus/kabuk";
import {
  BosDurum,
  Rozet,
  Sayac,
  TabloSarmal,
  Th,
  Td,
  Tr,
} from "@/components/kampus/ui";
import { OgrenciSuzgeci } from "@/components/kampus/ogrenci-suzgeci";
import { OGRENCI_TONU } from "@/lib/kampus/tonlar";
import { yasMetni, ayHesapla } from "@/lib/yas";
import { KURUM_ETIKET } from "@/lib/supabase/types";
import type { Kurum } from "@/lib/supabase/types";
import { Ikon } from "@/components/ui/ikon";

export const metadata = { title: "Öğrenciler", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function OgrencilerSayfasi({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const oturum = await oturumZorunlu();
  const p = await searchParams;
  const tek = (a: string | string[] | undefined) =>
    Array.isArray(a) ? a[0] : a;

  const durum = (tek(p.durum) as OgrenciDurumu | "hepsi") ?? "aktif";
  const ara = tek(p.ara) ?? "";

  /*
    `lead` lead'ler sayfasindaki "Ogrenciye donustur" baglantisindan gelir:
    form dolu ve acik baslar, kayit tamamlandiginda lead'e baglanir.
  */
  const leadId =
    oturum.rol === "admin" ? z.uuid().safeParse(tek(p.lead)).data : undefined;

  const [liste, hepsi, siniflar, lead] = await Promise.all([
    ogrencileriGetir({ durum, ara }),
    ogrencileriGetir({ durum: "hepsi" }),
    // Form icin: sinif listesi ve bos yer sayilari. Ogretmen ekleme yapamaz.
    oturum.rol === "admin" ? siniflariGetir("2026-2027") : Promise.resolve([]),
    leadId ? leadGetir(leadId) : Promise.resolve(null),
  ]);

  // siniflar.ad zaten "Sali 10:00 · Okula Hazirlik" bicimde uretiliyor.
  const sinifSecenekleri = siniflar
    .filter((s) => s.aktif)
    .map((s) => ({
      id: s.id,
      ad: s.ad,
      bosYer: Math.max(0, s.kontenjan - s.ogrenciSayisi),
    }));

  const say = (d: OgrenciDurumu) => hepsi.filter((o) => o.durum === d).length;
  const sayilar = {
    aktif: say("aktif"),
    aday: say("aday"),
    dondurdu: say("dondurdu"),
    ayrildi: say("ayrildi"),
    hepsi: hepsi.length,
  };

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/ogrenciler">
      <SayfaBasi
        baslik="Öğrenciler"
        aciklama={
          oturum.rol === "ogretmen"
            ? "Kendi sınıflarınızdaki çocuklar."
            : "Kayıtlı çocuklar, grupları ve durumları."
        }
        cocuklar={
          oturum.rol === "admin" ? (
            <OgrenciFormu
              siniflar={sinifSecenekleri}
              // Zaten donusturulmus lead ikinci kez form acmasin.
              leadId={lead && !lead.ogrenci_id ? lead.id : undefined}
              acikBaslasin={Boolean(lead && !lead.ogrenci_id)}
              baslangic={
                lead
                  ? {
                      ad: lead.cocuk_adi ?? "",
                      dogumTarihi: lead.cocuk_dogum ?? "",
                      veliAdSoyad: lead.ad_soyad,
                      veliTelefon: lead.telefon ?? "",
                      notlar: lead.notlar ?? "",
                    }
                  : undefined
              }
            />
          ) : undefined
        }
      />

      {hepsi.length === 0 ? (
        <BosDurum
          baslik="Henüz öğrenci yok"
          ikon={<Ikon.Bebek boyut={22} />}
          aciklama={
            oturum.rol === "admin"
              ? "Yukarıdan öğrenci ekleyebilir ya da Başvurular bölümünden bir talebi öğrenciye dönüştürebilirsiniz."
              : "Sınıflarınıza çocuk atandığında burada görünecek."
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Sayac etiket="Aktif" deger={sayilar.aktif} ton="basari" />
            <Sayac etiket="Aday" deger={sayilar.aday} ton="bilgi" />
            <Sayac etiket="Donduran" deger={sayilar.dondurdu} />
            <Sayac etiket="Ayrılan" deger={sayilar.ayrildi} />
          </div>

          <div className="mt-4">
            <OgrenciSuzgeci durum={durum} ara={ara} sayilar={sayilar} />
          </div>

          {liste.length === 0 ? (
            <div className="mt-4">
              <BosDurum
                baslik="Bu filtrede öğrenci yok"
                aciklama="Durum filtresini değiştirin veya aramayı temizleyin."
              />
            </div>
          ) : (
            <Kutu className="mt-4" dolgusuz>
              <TabloSarmal enAz="38rem">
                <thead>
                  <tr>
                    <Th>Çocuk</Th>
                    <Th>Yaş</Th>
                    <Th>Kurum</Th>
                    <Th>Kayıt</Th>
                    <Th sag>Durum</Th>
                  </tr>
                </thead>
                <tbody>
                  {liste.map((o) => (
                    <Tr key={o.id}>
                      <Td>
                        <Link
                          href={`/kampus/ogrenciler/${o.id}`}
                          className="font-semibold text-murekkep hover:text-yesil-derin hover:underline"
                        >
                          {ogrenciAdi(o)}
                        </Link>
                        {o.alerji && (
                          <span className="ml-2 align-middle">
                            <Rozet ton="uyari" ikon={<Ikon.Kalp boyut={11} />}>
                              alerji
                            </Rozet>
                          </span>
                        )}
                      </Td>
                      <Td className="text-panel-soluk">
                        {yasMetni(ayHesapla(o.dogum_tarihi))}
                      </Td>
                      <Td className="text-panel-soluk">
                        {KURUM_ETIKET[o.kurum as Kurum] ?? o.kurum}
                      </Td>
                      <Td sayi className="text-panel-silik">
                        {new Date(o.kayit_tarihi).toLocaleDateString("tr-TR")}
                      </Td>
                      <Td sag>
                        <Rozet ton={OGRENCI_TONU[o.durum] ?? "notr"}>
                          {OGRENCI_DURUM_ETIKET[o.durum]}
                        </Rozet>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </TabloSarmal>
            </Kutu>
          )}
        </>
      )}
    </Kabuk>
  );
}
