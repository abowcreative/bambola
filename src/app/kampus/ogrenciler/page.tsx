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
import { Kabuk, SayfaBasi, Kutu, Sayac, BosDurum } from "@/components/kampus/kabuk";
import { OgrenciSuzgeci } from "@/components/kampus/ogrenci-suzgeci";
import { yasMetni, ayHesapla } from "@/lib/yas";
import { KURUM_ETIKET } from "@/lib/supabase/types";
import type { Kurum } from "@/lib/supabase/types";
import { Ikon } from "@/components/ui/ikon";

export const metadata = { title: "Öğrenciler", robots: { index: false } };
export const dynamic = "force-dynamic";

const DURUM_RENGI: Record<OgrenciDurumu, string> = {
  aktif: "bg-lime-rozet text-black",
  aday: "bg-krem-koyu text-murekkep",
  dondurdu: "bg-cizgi text-murekkep-soluk",
  ayrildi: "bg-cizgi text-murekkep-soluk",
};

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
  const leadId = oturum.rol === "admin" ? z.uuid().safeParse(tek(p.lead)).data : undefined;

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

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/ogrenciler">
      <SayfaBasi
        baslik="Öğrenciler"
        aciklama={
          oturum.rol === "ogretmen"
            ? "Kendi sınıflarınızdaki çocuklar."
            : "Kayıtlı çocuklar, grupları ve durumları."
        }
      />

      {oturum.rol === "admin" && (
        <div className="mb-5">
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
        </div>
      )}

      {hepsi.length === 0 ? (
        <BosDurum
          baslik="Henüz öğrenci yok"
          aciklama={
            oturum.rol === "admin"
              ? "Yukarıdan öğrenci ekleyebilir ya da Başvurular bölümünden bir talebi öğrenciye dönüştürebilirsiniz."
              : "Sınıflarınıza çocuk atandığında burada görünecek."
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            <Sayac etiket="Aktif" deger={say("aktif")} />
            <Sayac etiket="Aday" deger={say("aday")} />
            <Sayac etiket="Donduran" deger={say("dondurdu")} />
            <Sayac etiket="Ayrılan" deger={say("ayrildi")} />
          </div>

          <div className="mt-5">
            <OgrenciSuzgeci durum={durum} ara={ara} />
          </div>

          {liste.length === 0 ? (
            <div className="mt-5">
              <BosDurum
                baslik="Bu filtrede öğrenci yok"
                aciklama="Durum filtresini değiştirin veya aramayı temizleyin."
              />
            </div>
          ) : (
            <Kutu className="mt-5">
              <ul className="divide-y divide-cizgi">
                {liste.map((o) => (
                  <li key={o.id}>
                    <Link
                      href={`/kampus/ogrenciler/${o.id}`}
                      className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 transition-colors hover:bg-krem"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-baslik text-sm font-bold text-murekkep">
                          {ogrenciAdi(o)}
                        </span>
                        <span className="mt-0.5 block text-xs text-murekkep-soluk">
                          {yasMetni(ayHesapla(o.dogum_tarihi))} ·{" "}
                          {KURUM_ETIKET[o.kurum as Kurum] ?? o.kurum}
                        </span>
                      </span>

                      {o.alerji && (
                        <span
                          title={o.alerji}
                          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-krem-koyu px-2.5 py-0.5 text-xs font-semibold text-murekkep"
                        >
                          <Ikon.Kalp boyut={12} />
                          Alerji
                        </span>
                      )}

                      <span className="shrink-0 text-xs text-murekkep-soluk">
                        {new Date(o.kayit_tarihi).toLocaleDateString("tr-TR")}
                      </span>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${DURUM_RENGI[o.durum]}`}
                      >
                        {OGRENCI_DURUM_ETIKET[o.durum]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Kutu>
          )}
        </>
      )}
    </Kabuk>
  );
}
