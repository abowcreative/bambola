"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { siniflariProgramdanUret } from "@/lib/kampus/ogrenci-islemleri";
import { Ikon } from "@/components/ui/ikon";
import { Bildirim, Dugme } from "./ui";
import { Firildak, Kip } from "./ui-istemci";

/**
 * Haftalik programdan sinif uretir.
 *
 * Onay adimi var: otuza yakin kayit olusturuyor ve yanlislikla tiklanmasi
 * paneli doldurur. Islem tekrar calistirilabilir (var olan slotlar
 * atlaniyor) ama kullanicinin bunu bilmesi gerekmez.
 */
export function SinifUretButonu({ donem }: { donem: string }) {
  const yonlendirici = useRouter();
  const [acik, setAcik] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  function uret() {
    setHata(null);
    basla(async () => {
      const sonuc = await siniflariProgramdanUret(donem);
      if (sonuc.ok) {
        setAcik(false);
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <>
      <Dugme type="button" onClick={() => setAcik(true)}>
        <Ikon.Takvim boyut={15} />
        Programdan sınıfları aç
      </Dugme>

      <Kip
        acik={acik}
        kapat={() => setAcik(false)}
        genislik="30rem"
        baslik="Dönem sınıflarını aç"
      >
        <p className="text-sm leading-relaxed text-murekkep">
          Haftalık programdaki her seans için <strong>{donem}</strong> dönemine
          bir sınıf açılacak. Öğretmen programdaki öğretmen olur, kontenjan 12
          olur; ikisi de sonradan değiştirilebilir.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-panel-soluk">
          Zaten açılmış seanslar atlanır, ikinci kez sınıf oluşmaz.
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
            onClick={uret}
            disabled={bekliyor}
          >
            {bekliyor && <Firildak />}
            {bekliyor ? "Açılıyor…" : "Evet, aç"}
          </Dugme>
        </div>
      </Kip>
    </>
  );
}
