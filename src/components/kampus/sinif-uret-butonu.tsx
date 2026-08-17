"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { siniflariProgramdanUret } from "@/lib/kampus/ogrenci-islemleri";
import { Buton } from "@/components/ui/buton";
import { Ikon } from "@/components/ui/ikon";

/**
 * Haftalik programdan sinif uretir.
 *
 * Onay adimi var: otuza yakin kayit olusturuyor ve yanlislikla tiklanmasi
 * paneli doldurur. Islem tekrar calistirilabilir (var olan slotlar
 * atlaniyor) ama kullanicinin bunu bilmesi gerekmez.
 */
export function SinifUretButonu({ donem }: { donem: string }) {
  const yonlendirici = useRouter();
  const [onay, setOnay] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  function uret() {
    setHata(null);
    basla(async () => {
      const sonuc = await siniflariProgramdanUret(donem);
      if (sonuc.ok) {
        setOnay(false);
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  if (!onay) {
    return (
      <div>
        <Buton type="button" olcu="sm" onClick={() => setOnay(true)}>
          <Ikon.Takvim boyut={16} />
          Programdan sınıfları aç
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
        Haftalık programdaki her seans için <strong>{donem}</strong> dönemine
        bir sınıf açılacak. Öğretmen programdaki öğretmen olur, kontenjan 12
        olur; sonradan değiştirilebilir.
      </p>
      <div className="mt-3 flex gap-2">
        <Buton type="button" olcu="sm" onClick={uret} disabled={bekliyor}>
          {bekliyor ? "Açılıyor..." : "Evet, aç"}
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
