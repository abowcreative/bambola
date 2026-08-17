import Link from "next/link";
import { oturumZorunlu } from "@/lib/kampus/oturum";
import {
  ogrencileriGetir,
  ogrenciAdi,
  OGRENCI_DURUM_ETIKET,
  type OgrenciDurumu,
} from "@/lib/kampus/ogrenciler";
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

  const [liste, hepsi] = await Promise.all([
    ogrencileriGetir({ durum, ara }),
    ogrencileriGetir({ durum: "hepsi" }),
  ]);

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

      {hepsi.length === 0 ? (
        <BosDurum
          baslik="Henüz öğrenci yok"
          aciklama="Başvurular bölümünden bir talebi öğrenciye dönüştürerek başlayabilirsiniz."
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
