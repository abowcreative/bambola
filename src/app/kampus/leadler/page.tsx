import Link from "next/link";
import { adminZorunlu } from "@/lib/kampus/oturum";
import { leadleriGetir } from "@/lib/kampus/yoklama";
import {
  LEAD_DURUM_ETIKET,
  LEAD_KAYNAK_ETIKET,
  type LeadDurumu,
} from "@/lib/kampus/yoklama-tipleri";
import { LEAD_TONU } from "@/lib/kampus/tonlar";
import { Kabuk, SayfaBasi, Kutu } from "@/components/kampus/kabuk";
import {
  BosDurum,
  DugmeLink,
  Rozet,
  Sayac,
  SekmeSeridi,
} from "@/components/kampus/ui";
import { AramaKutusu } from "@/components/kampus/ui-istemci";
import { LeadFormu, LeadDuzenle } from "@/components/kampus/lead-formu";
import { LeadDurumSecici } from "@/components/kampus/lead-durum-secici";
import { telefonYaz, gecenSure } from "@/components/kampus/basvuru-satiri";
import { Ikon } from "@/components/ui/ikon";

export const metadata = { title: "Lead'ler", robots: { index: false } };
export const dynamic = "force-dynamic";

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

  function yol(yeniDurum: string): string {
    const y = new URLSearchParams();
    if (ara) y.set("ara", ara);
    if (yeniDurum !== "hepsi") y.set("durum", yeniDurum);
    const sorgu = y.toString();
    return sorgu ? `/kampus/leadler?${sorgu}` : "/kampus/leadler";
  }

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/leadler">
      <SayfaBasi
        baslik="Lead'ler"
        aciklama="Instagram, telefon, tavsiye ve tabelayla gelen talepler."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Sayac etiket="Toplam" deger={hepsi.length} />
        <Sayac
          etiket="Yeni"
          deger={say("yeni")}
          ton={say("yeni") > 0 ? "uyari" : "notr"}
          alt={say("yeni") > 0 ? "aranmayı bekliyor" : "hepsi işlendi"}
        />
        <Sayac etiket="Kazanılan" deger={say("kayit_oldu")} ton="basari" />
        <Sayac etiket="Dönüşüm" deger={`%${donusum}`} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <SekmeSeridi
              sekmeler={(
                ["hepsi", "yeni", "gorusuldu", "kayit_oldu", "kayip"] as const
              ).map((d) => ({
                anahtar: d,
                etiket: d === "hepsi" ? "Hepsi" : LEAD_DURUM_ETIKET[d],
                yol: yol(d),
                sayi: d === "hepsi" ? hepsi.length : say(d),
                aktif: durum === d,
              }))}
            />
            <AramaKutusu
              yol="/kampus/leadler"
              deger={ara}
              yerTutucu="Ad, çocuk veya telefon"
              etiket="Lead'lerde ara"
              className="min-w-0 flex-1 sm:max-w-56"
            />
          </div>

          {liste.length === 0 ? (
            <BosDurum
              baslik={hepsi.length === 0 ? "Henüz lead yok" : "Eşleşme yok"}
              ikon={<Ikon.Yildiz boyut={22} />}
              aciklama={
                hepsi.length === 0
                  ? "Sağdaki formdan Instagram veya telefonla gelen bir talebi kaydedebilirsiniz."
                  : "Filtreyi değiştirin veya aramayı temizleyin."
              }
            />
          ) : (
            <Kutu dolgusuz>
              <ul className="divide-y divide-panel-cizgi">
                {liste.map((l) => (
                  <li
                    key={l.id}
                    className="flex flex-wrap items-start gap-x-3 gap-y-2 px-4 py-3 transition-colors hover:bg-panel-yuzey-alt"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-murekkep">
                          {l.ad_soyad}
                        </span>
                        <Rozet ton={LEAD_TONU[l.durum] ?? "notr"}>
                          {LEAD_DURUM_ETIKET[l.durum]}
                        </Rozet>
                      </span>
                      <span className="mt-0.5 block text-xs text-panel-soluk">
                        {LEAD_KAYNAK_ETIKET[l.kaynak] ?? l.kaynak}
                        {l.cocuk_adi && ` · ${l.cocuk_adi}`}
                        {l.ilgilendigi_program && ` · ${l.ilgilendigi_program}`}
                        {" · "}
                        {gecenSure(l.created_at)}
                      </span>
                      {l.notlar && (
                        <span className="mt-1 block text-xs leading-snug text-panel-silik">
                          {l.notlar}
                        </span>
                      )}
                    </span>

                    {l.telefon && (
                      <a
                        href={`tel:0${l.telefon}`}
                        className="shrink-0 text-sm font-medium text-yesil-derin hover:underline"
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
                        className="shrink-0 text-sm font-semibold text-yesil-derin hover:underline"
                      >
                        Öğrenci kartı
                      </Link>
                    ) : (
                      l.durum !== "kayip" && (
                        <DugmeLink
                          href={`/kampus/ogrenciler?lead=${l.id}`}
                          olcu="sm"
                        >
                          Öğrenciye dönüştür
                        </DugmeLink>
                      )
                    )}

                    <LeadDurumSecici id={l.id} durum={l.durum} />
                    <LeadDuzenle lead={l} />
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
