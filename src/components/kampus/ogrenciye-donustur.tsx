"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { basvurudanOgrenciOlustur } from "@/lib/kampus/ogrenci-islemleri";
import { Buton } from "@/components/ui/buton";
import { Ikon } from "@/components/ui/ikon";

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
  const [onay, setOnay] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  if (mevcutOgrenciId) {
    return (
      <Link
        href={`/kampus/ogrenciler/${mevcutOgrenciId}`}
        className="inline-flex items-center gap-1.5 rounded-full border-2 border-cizgi bg-white px-4 py-2 font-baslik text-sm font-semibold text-murekkep transition-colors hover:border-yesil"
      >
        <Ikon.Bebek boyut={16} />
        Öğrenci kaydına git
      </Link>
    );
  }

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

  if (!onay) {
    return (
      <div>
        <Buton type="button" olcu="sm" onClick={() => setOnay(true)}>
          <Ikon.Bebek boyut={16} />
          Öğrenciye dönüştür
        </Buton>
        {hata && (
          <p role="alert" className="mt-2 text-sm text-murekkep">
            {hata}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-kart border-2 border-yesil bg-white p-4">
      <p className="text-sm leading-relaxed text-murekkep">
        Bu başvurudan bir <strong>öğrenci</strong> ve bir{" "}
        <strong>veli</strong> kaydı oluşturulacak, başvurunun durumu
        &quot;Kayıt oldu&quot; olacak. Başvuru silinmez; ilk talep ve notlar
        yerinde kalır.
      </p>
      <p className="mt-2 text-xs leading-relaxed text-murekkep-soluk">
        Aynı telefonla kayıtlı veli varsa yeni kayıt açılmaz, mevcut veliye
        bağlanır.
      </p>
      <div className="mt-3 flex gap-2">
        <Buton type="button" olcu="sm" onClick={donustur} disabled={bekliyor}>
          {bekliyor ? "Oluşturuluyor..." : "Evet, dönüştür"}
        </Buton>
        <Buton
          type="button"
          olcu="sm"
          gorunum="cizgili"
          onClick={() => setOnay(false)}
          disabled={bekliyor}
        >
          Vazgeç
        </Buton>
      </div>
      {hata && (
        <p role="alert" className="mt-2 text-sm text-murekkep">
          {hata}
        </p>
      )}
    </div>
  );
}
