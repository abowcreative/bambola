"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { basvurudanOgrenciOlustur } from "@/lib/kampus/ogrenci-islemleri";
import { Ikon } from "@/components/ui/ikon";
import { Bildirim, Dugme, DugmeLink } from "./ui";
import { Firildak, Kip } from "./ui-istemci";

/**
 * Basvuruyu ogrenci kaydina cevirir.
 *
 * Onay adimi var: cocuk ve veli kaydi olusturuyor ve basvurunun durumunu
 * degistiriyor. Islem geri alinabilir degil (kayitlar elle silinir), o
 * yuzden tek tikla yapilmiyor.
 */
export function OgrenciyeDonustur({
  basvuruId,
  mevcutOgrenciId,
}: {
  basvuruId: string;
  /** Bu basvurudan zaten ogrenci olusturulduysa kimligi. */
  mevcutOgrenciId?: string | null;
}) {
  const yonlendirici = useRouter();
  const [acik, setAcik] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  function donustur() {
    setHata(null);
    basla(async () => {
      const sonuc = await basvurudanOgrenciOlustur(basvuruId);
      if (sonuc.ok && sonuc.id) {
        yonlendirici.push(`/kampus/ogrenciler/${sonuc.id}`);
      } else if (!sonuc.ok) {
        setHata(sonuc.hata);
      }
    });
  }

  if (mevcutOgrenciId) {
    return (
      <DugmeLink href={`/kampus/ogrenciler/${mevcutOgrenciId}`}>
        <Ikon.Bebek boyut={15} />
        Öğrenci kaydına git
      </DugmeLink>
    );
  }

  return (
    <>
      <Dugme type="button" gorunum="birincil" onClick={() => setAcik(true)}>
        <Ikon.Bebek boyut={15} />
        Öğrenciye dönüştür
      </Dugme>

      <Kip
        acik={acik}
        kapat={() => setAcik(false)}
        genislik="30rem"
        baslik="Öğrenciye dönüştür"
      >
        <p className="text-sm leading-relaxed text-murekkep">
          Bu başvurudan bir <strong>öğrenci</strong> ve bir{" "}
          <strong>veli</strong> kaydı oluşturulacak, başvurunun durumu “Kayıt
          oldu” olacak. Başvuru silinmez; ilk talep ve notlar yerinde kalır.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-panel-soluk">
          Aynı telefonla kayıtlı veli varsa yeni kayıt açılmaz, mevcut veliye
          bağlanır.
        </p>

        {hata && (
          <div className="mt-3">
            <Bildirim ton="tehlike">{hata}</Bildirim>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2 border-t border-panel-cizgi pt-4">
          <Dugme type="button" onClick={() => setAcik(false)} disabled={bekliyor}>
            Vazgeç
          </Dugme>
          <Dugme
            type="button"
            gorunum="birincil"
            onClick={donustur}
            disabled={bekliyor}
          >
            {bekliyor && <Firildak />}
            {bekliyor ? "Oluşturuluyor…" : "Evet, dönüştür"}
          </Dugme>
        </div>
      </Kip>
    </>
  );
}
