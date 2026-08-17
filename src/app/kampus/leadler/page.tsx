import Link from "next/link";
import { adminZorunlu } from "@/lib/kampus/oturum";
import { leadleriGetir } from "@/lib/kampus/yoklama";
import {
  LEAD_DURUM_ETIKET,
  LEAD_KAYNAK_ETIKET,
  type LeadDurumu,
} from "@/lib/kampus/yoklama-tipleri";
import {
  Kabuk,
  SayfaBasi,
  Kutu,
  Sayac,
  BosDurum,
} from "@/components/kampus/kabuk";
import { LeadFormu } from "@/components/kampus/lead-formu";
import { LeadDurumSecici } from "@/components/kampus/lead-durum-secici";
import { telefonYaz, gecenSure } from "@/components/kampus/basvuru-satiri";

export const metadata = { title: "Lead'ler", robots: { index: false } };
export const dynamic = "force-dynamic";

const DURUM_RENGI: Record<LeadDurumu, string> = {
  yeni: "bg-lime-rozet text-black",
  gorusuldu: "bg-yesil-koyu text-white",
  kayit_oldu: "bg-yesil text-white",
  kayip: "bg-cizgi text-murekkep-soluk",
};

/**
 * Web formu DISINDAN gelen talepler.
 *
 * Basvurular tablosuna konmadi: o tablo formun sema dogrulamasindan geciyor
 * ve zorunlu alanlari var (dogum tarihi, KVKK onayi). Instagram'dan gelen
 * bir mesajda cogu zaman yalniz bir ad ve telefon oluyor.
 */
export default async function LeadlerSayfasi({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const oturum = await adminZorunlu();
  const p = await searchParams;
  const tek = (a: string | string[] | undefined) =>
    Array.isArray(a) ? a[0] : a;

  const durum = (tek(p.durum) as LeadDurumu | "hepsi") ?? "hepsi";
  const ara = tek(p.ara) ?? "";

  const [liste, hepsi] = await Promise.all([
    leadleriGetir({ durum, ara }),
    leadleriGetir({ durum: "hepsi" }),
  ]);

  const say = (d: LeadDurumu) => hepsi.filter((l) => l.durum === d).length;
  const donusum =
    hepsi.length > 0 ? Math.round((say("kayit_oldu") / hepsi.length) * 100) : 0;

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/leadler">
      <SayfaBasi
        baslik="Lead'ler"
        aciklama="Instagram, telefon, tavsiye ve tabelayla gelen talepler."
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <Sayac etiket="Toplam" deger={hepsi.length} />
        <Sayac etiket="Yeni" deger={say("yeni")} vurgu={say("yeni") > 0} />
        <Sayac etiket="Kazanılan" deger={say("kayit_oldu")} />
        <Sayac etiket="Dönüşüm" deger={`%${donusum}`} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <form className="mb-4 flex flex-wrap gap-2" role="search">
            {(["hepsi", "yeni", "gorusuldu", "kayit_oldu", "kayip"] as const).map(
              (d) => (
                <button
                  key={d}
                  type="submit"
                  name="durum"
                  value={d}
                  className={`rounded-full border-2 px-4 py-1.5 font-baslik text-sm font-semibold transition-colors ${
                    durum === d
                      ? "border-yesil-koyu bg-yesil-koyu text-white"
                      : "border-cizgi bg-white text-murekkep-soluk hover:border-yesil hover:text-murekkep"
                  }`}
                >
                  {d === "hepsi" ? "Hepsi" : LEAD_DURUM_ETIKET[d]}
                </button>
              ),
            )}
            <input
              type="search"
              name="ara"
              defaultValue={ara}
              placeholder="Ad, çocuk veya telefon"
              aria-label="Lead'lerde ara"
              className="min-w-0 flex-1 rounded-full border-2 border-cizgi bg-white px-4 py-1.5 text-sm text-murekkep outline-none focus:border-yesil"
            />
          </form>

          {liste.length === 0 ? (
            <BosDurum
              baslik={hepsi.length === 0 ? "Henüz lead yok" : "Eşleşme yok"}
              aciklama={
                hepsi.length === 0
                  ? "Sağdaki formdan Instagram veya telefonla gelen bir talebi kaydedebilirsiniz."
                  : "Filtreyi değiştirin veya aramayı temizleyin."
              }
            />
          ) : (
            <Kutu>
              <ul className="divide-y divide-cizgi">
                {liste.map((l) => (
                  <li
                    key={l.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-baslik text-sm font-bold text-murekkep">
                        {l.ad_soyad}
                        <span
                          className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${DURUM_RENGI[l.durum]}`}
                        >
                          {LEAD_DURUM_ETIKET[l.durum]}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-xs text-murekkep-soluk">
                        {LEAD_KAYNAK_ETIKET[l.kaynak] ?? l.kaynak}
                        {l.cocuk_adi && ` · ${l.cocuk_adi}`}
                        {l.ilgilendigi_program && ` · ${l.ilgilendigi_program}`}
                        {" · "}
                        {gecenSure(l.created_at)}
                      </span>
                      {l.notlar && (
                        <span className="mt-1 block text-xs leading-snug text-murekkep-soluk">
                          {l.notlar}
                        </span>
                      )}
                    </span>

                    {l.telefon && (
                      <a
                        href={`tel:0${l.telefon}`}
                        className="shrink-0 text-sm font-medium text-yesil-koyu hover:underline"
                      >
                        {telefonYaz(l.telefon)}
                      </a>
                    )}

                    {/*
                      Lead ile ogrenci arasindaki kopru: donusmus lead
                      ogrenci kartina gider, donusmemis olan formu dolu
                      olarak acar.
                    */}
                    {l.ogrenci_id ? (
                      <Link
                        href={`/kampus/ogrenciler/${l.ogrenci_id}`}
                        className="shrink-0 text-sm font-semibold text-yesil-koyu hover:underline"
                      >
                        Öğrenci kartı
                      </Link>
                    ) : (
                      l.durum !== "kayip" && (
                        <Link
                          href={`/kampus/ogrenciler?lead=${l.id}`}
                          className="shrink-0 rounded-full border-2 border-cizgi bg-white px-3.5 py-1 font-baslik text-sm font-semibold text-murekkep transition-colors hover:border-yesil"
                        >
                          Öğrenciye dönüştür
                        </Link>
                      )
                    )}

                    <LeadDurumSecici id={l.id} durum={l.durum} />
                  </li>
                ))}
              </ul>
            </Kutu>
          )}
        </div>

        <Kutu baslik="Yeni lead">
          <LeadFormu />
        </Kutu>
      </div>
    </Kabuk>
  );
}
