import Link from "next/link";
import { adminZorunlu } from "@/lib/kampus/oturum";
import { dogumGunleriGetir, tl } from "@/lib/kampus/defter";
import { kisaTarih } from "@/lib/kampus/ogrenci-tipleri";
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
import { PartiFormu } from "@/components/kampus/parti-formu";
import { telefonYaz } from "@/components/kampus/basvuru-satiri";
import { Ikon } from "@/components/ui/ikon";

export const metadata = { title: "Doğum günleri", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Excel "DOGUM GUNU" sayfasi: her satir bir organizasyon. */
export default async function DogumGunleriSayfasi() {
  const oturum = await adminZorunlu();
  const partiler = await dogumGunleriGetir();

  const bugun = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
  const gelecek = partiler.filter((p) => p.organizasyon_tarihi && p.organizasyon_tarihi >= bugun);
  const buYil = bugun.slice(0, 4);
  const buYilCiro = partiler
    .filter((p) => p.organizasyon_tarihi?.startsWith(buYil))
    .reduce((t, p) => t + (p.anlasilan_fiyat ?? 0), 0);
  const kalanToplam = partiler.reduce((t, p) => t + (p.kalan_odeme ?? 0), 0);

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/dogum-gunleri">
      <SayfaBasi
        baslik="Doğum günleri"
        aciklama="Doğum günü organizasyonları: kapora, anlaşılan fiyat, kişi sayısı, yemek ve süsleme."
        cocuklar={<PartiFormu />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Sayac etiket="Organizasyon" deger={partiler.length} />
        <Sayac etiket="Yaklaşan" deger={gelecek.length} ton={gelecek.length > 0 ? "bilgi" : "notr"} />
        <Sayac etiket={`${buYil} cirosu`} deger={tl(buYilCiro)} ton="basari" alt="anlaşılan fiyatlar" />
        <Sayac etiket="Kalan ödeme" deger={tl(kalanToplam)} ton={kalanToplam > 0 ? "uyari" : "notr"} />
      </div>

      {partiler.length === 0 ? (
        <div className="mt-4">
          <BosDurum
            baslik="Henüz organizasyon yok"
            ikon={<Ikon.Balon boyut={22} />}
            aciklama="Yukarıdaki düğmeyle ilk organizasyonu ekleyebilirsiniz."
          />
        </div>
      ) : (
        <Kutu className="mt-4" dolgusuz>
          <TabloSarmal enAz="80rem">
            <thead>
              <tr>
                <Th>Gün</Th>
                <Th>Saat</Th>
                <Th>Çocuk</Th>
                <Th>Veli</Th>
                <Th>Telefon</Th>
                <Th>Yaş</Th>
                <Th>Doğum günü</Th>
                <Th sag>Kapora</Th>
                <Th sag>Fiyat</Th>
                <Th sag>Kalan</Th>
                <Th sag>Çocuk</Th>
                <Th sag>Yetişkin</Th>
                <Th>Yemek</Th>
                <Th>Süsleme</Th>
                <Th>Mahalle</Th>
                <Th>Açıklama</Th>
                <Th sag> </Th>
              </tr>
            </thead>
            <tbody>
              {partiler.map((p) => {
                const yaklasan = p.organizasyon_tarihi && p.organizasyon_tarihi >= bugun;
                return (
                  <Tr key={p.id}>
                    <Td className="whitespace-nowrap font-semibold tabular-nums">
                      {kisaTarih(p.organizasyon_tarihi) || "—"}
                      {yaklasan && (
                        <span className="ml-1.5 align-middle">
                          <Rozet ton="bilgi">yaklaşan</Rozet>
                        </span>
                      )}
                    </Td>
                    <Td className="whitespace-nowrap text-panel-soluk">{p.saat ?? "—"}</Td>
                    <Td className="whitespace-nowrap">
                      {p.ogrenci_id ? (
                        <Link href={`/kampus/ogrenciler/${p.ogrenci_id}`} className="font-semibold text-murekkep hover:text-yesil-derin hover:underline">
                          {p.cocuk_adi ?? "—"}
                        </Link>
                      ) : (
                        <span className="font-semibold text-murekkep">{p.cocuk_adi ?? "—"}</span>
                      )}
                    </Td>
                    <Td className="whitespace-nowrap text-panel-soluk">{p.veli_adi ?? "—"}</Td>
                    <Td className="whitespace-nowrap">
                      {p.telefon ? (
                        <a href={`tel:0${p.telefon}`} className="font-medium text-yesil-derin hover:underline">
                          {telefonYaz(p.telefon)}
                        </a>
                      ) : (
                        <span className="text-panel-silik">—</span>
                      )}
                    </Td>
                    <Td className="whitespace-nowrap text-panel-soluk">{p.cocuk_yas ?? "—"}</Td>
                    <Td className="whitespace-nowrap text-panel-soluk">{kisaTarih(p.dogum_gunu) || "—"}</Td>
                    <Td sayi>{p.kapora !== null ? tl(p.kapora) : (p.kapora_ham ?? "—")}</Td>
                    <Td sayi className="font-semibold">{p.anlasilan_fiyat !== null ? tl(p.anlasilan_fiyat) : "—"}</Td>
                    <Td sayi className={p.kalan_odeme ? "font-semibold text-uyari" : "text-panel-silik"}>
                      {p.kalan_odeme !== null ? tl(p.kalan_odeme) : "—"}
                    </Td>
                    <Td sayi>{p.cocuk_sayisi ?? "—"}</Td>
                    <Td sayi>{p.yetiskin_sayisi ?? "—"}</Td>
                    <Td>{p.yemek ?? "—"}</Td>
                    <Td>{p.susleme ?? "—"}</Td>
                    <Td className="whitespace-nowrap text-panel-soluk">{p.mahalle ?? "—"}</Td>
                    <Td className="max-w-[22rem] truncate text-xs text-panel-soluk" title={[p.aciklama, p.ek_not].filter(Boolean).join(" · ") || undefined}>
                      {[p.aciklama, p.ek_not].filter(Boolean).join(" · ")}
                    </Td>
                    <Td sag>
                      <PartiFormu parti={p} />
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </TabloSarmal>
        </Kutu>
      )}
    </Kabuk>
  );
}
