"use client";

import { useSearchParams } from "next/navigation";
/* Tipler `ogrenci-tipleri` icinden: `ogrenciler` server-only ve buradan
   import edilse butun veri erisim katmani tarayici paketine girerdi. */
import { OGRENCI_DURUM_ETIKET } from "@/lib/kampus/ogrenci-tipleri";
import type { OgrenciDurumu } from "@/lib/kampus/ogrenci-tipleri";
import { SekmeSeridi } from "./ui";
import { AramaKutusu } from "./ui-istemci";

const SEKMELER: (OgrenciDurumu | "hepsi")[] = [
  "aktif",
  "aday",
  "dondurdu",
  "ayrildi",
  "hepsi",
];

const ETIKET: Record<OgrenciDurumu | "hepsi", string> = {
  ...OGRENCI_DURUM_ETIKET,
  hepsi: "Hepsi",
};

/**
 * Durum sekmeleri ve arama.
 *
 * Suzgec ADRES CUBUGUNDA tutuluyor: bir ogrenciye girip geri donuldugunde
 * ayni liste geliyor ve ekran baglanti olarak paylasilabiliyor.
 */
export function OgrenciSuzgeci({
  durum,
  ara,
  sayilar,
}: {
  durum: OgrenciDurumu | "hepsi";
  ara: string;
  sayilar: Record<OgrenciDurumu | "hepsi", number>;
}) {
  const parametreler = useSearchParams();

  function yol(yeniDurum: string): string {
    const y = new URLSearchParams(parametreler.toString());
    // "aktif" varsayilan: adres cubugunda gereksiz parametre birakmiyor.
    if (yeniDurum === "aktif") y.delete("durum");
    else y.set("durum", yeniDurum);
    const sorgu = y.toString();
    return sorgu ? `/kampus/ogrenciler?${sorgu}` : "/kampus/ogrenciler";
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SekmeSeridi
        sekmeler={SEKMELER.map((s) => ({
          anahtar: s,
          etiket: ETIKET[s],
          yol: yol(s),
          sayi: sayilar[s],
          aktif: durum === s,
        }))}
      />
      <AramaKutusu
        yol="/kampus/ogrenciler"
        deger={ara}
        yerTutucu="Ad veya soyad"
        etiket="Öğrencilerde ara"
        className="min-w-0 flex-1 sm:max-w-64"
      />
    </div>
  );
}
