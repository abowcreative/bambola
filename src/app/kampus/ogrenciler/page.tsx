import Link from "next/link";
import { oturumZorunlu } from "@/lib/kampus/oturum";
import {
  ogrencileriGetir,
  ogrenciGenelListesi,
  siniflariGetir,
  ogrenciAdi,
  yasEtiketi,
  kisaTarih,
  OGRENCI_DURUM_ETIKET,
  type OgrenciDurumu,
  type GenelListeSatiri,
} from "@/lib/kampus/ogrenciler";
import { defterOzetleri, tl, type OgrenciDefterOzeti } from "@/lib/kampus/defter";
import { OgrenciFormu } from "@/components/kampus/ogrenci-formu";
import { leadGetir } from "@/lib/kampus/yoklama";
import { z } from "zod";
import { Kabuk, SayfaBasi, Kutu } from "@/components/kampus/kabuk";
import {
  BosDurum,
  DugmeLink,
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
import { telefonYaz } from "@/components/kampus/basvuru-satiri";
import { Ikon } from "@/components/ui/ikon";

export const metadata = { title: "Öğrenciler", robots: { index: false } };
export const dynamic = "force-dynamic";

const yas = (o: { dogum_tarihi: string | null; ilk_kayit_yas?: string | null }) =>
  yasEtiketi(o, (d) => yasMetni(ayHesapla(d)));

/**
 * Ogrenci listesi. Iki gorunum:
 *
 *  - "genel": Excel'in GENEL LISTE sayfasi. Kurum yillardir bu tabloyla
 *    calisiyor; ayni sutunlar ayni sirayla, ustune odeme defterinden gelen
 *    canli toplam. Yonetici icin varsayilan.
 *  - "kisa": ad, yas, kurum, kayit, durum. Ogretmen yalniz bunu goruyor.
 */
export default async function OgrencilerSayfasi({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const oturum = await oturumZorunlu();
  const p = await searchParams;
  const tek = (a: string | string[] | undefined) =>
    Array.isArray(a) ? a[0] : a;

  const yonetici = oturum.rol === "admin";
  const durum = (tek(p.durum) as OgrenciDurumu | "hepsi") ?? "aktif";
  const ara = tek(p.ara) ?? "";
  const gorunum = yonetici && tek(p.gorunum) !== "kisa" ? "genel" : "kisa";

  const leadId =
    yonetici ? z.uuid().safeParse(tek(p.lead)).data : undefined;

  const [liste, hepsi, siniflar, lead, genel, ozetler] = await Promise.all([
    ogrencileriGetir({ durum, ara }),
    ogrencileriGetir({ durum: "hepsi" }),
    yonetici ? siniflariGetir("2026-2027") : Promise.resolve([]),
    leadId ? leadGetir(leadId) : Promise.resolve(null),
    gorunum === "genel" ? ogrenciGenelListesi({ durum, ara }) : Promise.resolve([] as GenelListeSatiri[]),
    gorunum === "genel" ? defterOzetleri() : Promise.resolve(new Map<string, OgrenciDefterOzeti>()),
  ]);

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

  const digerGorunum = new URLSearchParams();
  if (durum !== "aktif") digerGorunum.set("durum", durum);
  if (ara) digerGorunum.set("ara", ara);
  if (gorunum === "genel") digerGorunum.set("gorunum", "kisa");
  const digerYol = `/kampus/ogrenciler${digerGorunum.toString() ? `?${digerGorunum}` : ""}`;

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/ogrenciler">
      <SayfaBasi
        baslik="Öğrenciler"
        aciklama={
          oturum.rol === "ogretmen"
            ? "Kendi sınıflarınızdaki çocuklar."
            : gorunum === "genel"
              ? "Excel'deki genel liste: kayıt, paket, program, ödeme ve hak bilgileri bir arada."
              : "Kayıtlı çocuklar, grupları ve durumları."
        }
        cocuklar={
          yonetici ? (
            <>
              <DugmeLink href={digerYol} olcu="md">
                <Ikon.Suzgec boyut={14} />
                {gorunum === "genel" ? "Kısa liste" : "Genel liste"}
              </DugmeLink>
              <OgrenciFormu
                siniflar={sinifSecenekleri}
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
            </>
          ) : undefined
        }
      />

      {hepsi.length === 0 ? (
        <BosDurum
          baslik="Henüz öğrenci yok"
          ikon={<Ikon.Bebek boyut={22} />}
          aciklama={
            yonetici
              ? "Yukarıdan öğrenci ekleyebilir ya da Başvurular bölümünden bir talebi öğrenciye dönüştürebilirsiniz."
              : "Sınıflarınıza çocuk atandığında burada görünecek."
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Sayac etiket="Aktif" deger={sayilar.aktif} ton="basari" />
            <Sayac etiket="Aday" deger={sayilar.aday} ton="bilgi" />
            <Sayac etiket="Pasif" deger={sayilar.dondurdu} />
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
          ) : gorunum === "genel" ? (
            <GenelListe satirlar={genel} ozetler={ozetler} />
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
                      <Td className="text-panel-soluk">{yas(o)}</Td>
                      <Td className="text-panel-soluk">
                        {KURUM_ETIKET[o.kurum as Kurum] ?? o.kurum}
                      </Td>
                      <Td sayi className="text-panel-silik">
                        {kisaTarih(o.kayit_tarihi)}
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

/* ------------------------------------------------------------ genel liste */

/** Excel GENEL LISTE sutunlari, ayni sirayla. Dar ekranda yatay kayar. */
function GenelListe({
  satirlar,
  ozetler,
}: {
  satirlar: GenelListeSatiri[];
  ozetler: Map<string, OgrenciDefterOzeti>;
}) {
  const toplamCanli = satirlar.reduce((t, o) => t + (ozetler.get(o.id)?.toplam ?? 0), 0);

  return (
    <Kutu
      className="mt-4"
      dolgusuz
      baslik="Genel liste"
      aciklama="Son ödeme ve toplam, ödeme defterinden canlı hesaplanır; Excel'in kendi değeri farklıysa altında küçük yazıyla durur."
      yanCocuk={
        <span className="text-xs text-panel-soluk">
          {satirlar.length} çocuk · defter toplamı{" "}
          <strong className="tabular-nums text-murekkep">{tl(toplamCanli)}</strong>
        </span>
      }
    >
      <TabloSarmal enAz="100rem">
        <thead>
          <tr>
            <Th>No</Th>
            <Th>Çocuk</Th>
            <Th>Veli</Th>
            <Th>Telefon</Th>
            <Th>İlk kayıt yaş</Th>
            <Th>Doğum günü</Th>
            <Th>Durum</Th>
            <Th>Paket</Th>
            <Th>Program</Th>
            <Th>Son ödeme</Th>
            <Th sag>Ödenen</Th>
            <Th>Ödeme türü</Th>
            <Th>İkametgâh</Th>
            <Th sag>Kalan hak</Th>
            <Th sag>Geliş hakkı</Th>
            <Th sag>Toplam</Th>
            <Th>Güncellenme</Th>
            <Th>İlk ders</Th>
            <Th>Not</Th>
          </tr>
        </thead>
        <tbody>
          {satirlar.map((o) => {
            const oz = ozetler.get(o.id);
            const son = oz?.son;
            const sonTarih = son?.tarih ?? o.son_odeme_tarihi;
            const sonOdenen = son ? (son.tutar !== null ? tl(son.tutar) : (son.tutar_ham ?? "—")) : (o.son_odenen ?? "—");
            const sonTur = son?.odeme_turu ?? o.son_odeme_turu;
            const canliToplam = oz?.toplam ?? 0;
            const excelFarkli = o.toplam_odenen !== null && o.toplam_odenen !== canliToplam;
            return (
              <Tr key={o.id}>
                <Td className="text-panel-silik">{o.excel_no ?? ""}</Td>
                <Td>
                  <Link
                    href={`/kampus/ogrenciler/${o.id}`}
                    className="whitespace-nowrap font-semibold text-murekkep hover:text-yesil-derin hover:underline"
                  >
                    {ogrenciAdi(o)}
                  </Link>
                  {o.alerji && (
                    <span className="ml-1.5 align-middle">
                      <Rozet ton="uyari" ikon={<Ikon.Kalp boyut={11} />}>
                        alerji
                      </Rozet>
                    </span>
                  )}
                </Td>
                <Td className="whitespace-nowrap">
                  {o.veli ? (
                    <Link href={`/kampus/veliler/${o.veli.id}`} className="text-murekkep hover:text-yesil-derin hover:underline">
                      {o.veli.ad_soyad}
                    </Link>
                  ) : (
                    <span className="text-panel-silik">—</span>
                  )}
                </Td>
                <Td className="whitespace-nowrap">
                  {o.veli?.telefon ? (
                    <a href={`tel:0${o.veli.telefon}`} className="font-medium text-yesil-derin hover:underline">
                      {telefonYaz(o.veli.telefon)}
                    </a>
                  ) : (
                    <span className="text-panel-silik">—</span>
                  )}
                </Td>
                <Td className="whitespace-nowrap text-panel-soluk">{o.ilk_kayit_yas ?? (o.dogum_tarihi ? yas(o) : "—")}</Td>
                <Td className="whitespace-nowrap text-panel-soluk">{kisaTarih(o.dogum_gunu ?? o.dogum_tarihi) || "—"}</Td>
                <Td>
                  <Rozet ton={OGRENCI_TONU[o.durum] ?? "notr"}>
                    {o.katilim_durumu ?? OGRENCI_DURUM_ETIKET[o.durum]}
                  </Rozet>
                </Td>
                <Td className="whitespace-nowrap">{o.paket ?? "—"}</Td>
                <Td className="whitespace-nowrap">{o.program_metni ?? "—"}</Td>
                <Td className="whitespace-nowrap text-panel-soluk">{kisaTarih(sonTarih) || "—"}</Td>
                <Td sayi className="whitespace-nowrap">{sonOdenen}</Td>
                <Td className="whitespace-nowrap text-panel-soluk">{sonTur ?? "—"}</Td>
                <Td className="max-w-[14rem] truncate text-panel-soluk" title={o.ikametgah ?? undefined}>
                  {o.ikametgah ?? "—"}
                </Td>
                <Td sayi className={o.kalan_hak_saat !== null && o.kalan_hak_saat < 0 ? "font-semibold text-tehlike" : ""}>
                  {o.kalan_hak_saat ?? "—"}
                </Td>
                <Td sayi>{o.gelis_hakki ?? "—"}</Td>
                <Td sayi className="whitespace-nowrap">
                  <span className="font-semibold">{oz ? tl(canliToplam) : (o.toplam_odenen !== null ? tl(o.toplam_odenen) : "—")}</span>
                  {excelFarkli && (
                    <span className="block text-[0.7rem] text-panel-silik" title={o.toplam_odenen_formul ?? undefined}>
                      Excel: {tl(o.toplam_odenen)}
                    </span>
                  )}
                </Td>
                <Td className="whitespace-nowrap text-panel-silik">{kisaTarih(o.guncellenme_tarihi) || "—"}</Td>
                <Td className="whitespace-nowrap text-panel-silik">{kisaTarih(o.ilk_ders_tarihi) || "—"}</Td>
                <Td className="max-w-[18rem] truncate text-xs text-panel-soluk" title={o.excel_notu ?? undefined}>
                  {o.excel_notu ?? ""}
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </TabloSarmal>
    </Kutu>
  );
}
