"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sinifaKaydet } from "@/lib/kampus/ogrenci-islemleri";
import { Buton } from "@/components/ui/buton";

/** Sinifa ogrenci kaydeder. */
export function SinifaEkle({
  sinifId,
  adaylar,
  dolu,
}: {
  sinifId: string;
  adaylar: { id: string; ad: string }[];
  dolu: boolean;
}) {
  const yonlendirici = useRouter();
  const [secili, setSecili] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  function ekle() {
    if (!secili) return;
    setHata(null);
    basla(async () => {
      const sonuc = await sinifaKaydet(secili, sinifId);
      if (sonuc.ok) {
        setSecili("");
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <div className="space-y-2.5">
      {dolu && (
        <p className="rounded-yumusak border-2 border-dashed border-cizgi bg-krem px-3 py-2 text-sm text-murekkep">
          Sınıf dolu. Kontenjanı artırmadan kayıt eklenemez.
        </p>
      )}

      <select
        value={secili}
        onChange={(e) => setSecili(e.target.value)}
        disabled={bekliyor || dolu}
        aria-label="Öğrenci seç"
        className="w-full rounded-yumusak border-2 border-cizgi bg-white px-3.5 py-2 text-sm text-murekkep outline-none focus:border-yesil disabled:opacity-60"
      >
        <option value="">Öğrenci seçin</option>
        {adaylar.map((a) => (
          <option key={a.id} value={a.id}>
            {a.ad}
          </option>
        ))}
      </select>

      <Buton
        type="button"
        olcu="sm"
        onClick={ekle}
        disabled={bekliyor || dolu || !secili}
        className="w-full"
      >
        {bekliyor ? "Ekleniyor..." : "Sınıfa ekle"}
      </Buton>

      {hata && (
        <p role="alert" className="text-sm text-murekkep">
          {hata}
        </p>
      )}
    </div>
  );
}
