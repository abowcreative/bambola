"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sinifaKaydet } from "@/lib/kampus/ogrenci-islemleri";
import { ALAN, Bildirim, Dugme } from "./ui";
import { Firildak } from "./ui-istemci";

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
        <Bildirim ton="uyari">
          Sınıf dolu. Kontenjanı artırmadan kayıt eklenemez.
        </Bildirim>
      )}

      <select
        value={secili}
        onChange={(e) => setSecili(e.target.value)}
        disabled={bekliyor || dolu}
        aria-label="Öğrenci seç"
        className={ALAN}
      >
        <option value="">Öğrenci seçin</option>
        {adaylar.map((a) => (
          <option key={a.id} value={a.id}>
            {a.ad}
          </option>
        ))}
      </select>

      <Dugme
        type="button"
        gorunum="birincil"
        onClick={ekle}
        disabled={bekliyor || dolu || !secili}
        className="w-full"
      >
        {bekliyor && <Firildak />}
        {bekliyor ? "Ekleniyor…" : "Sınıfa ekle"}
      </Dugme>

      {hata && <Bildirim ton="tehlike">{hata}</Bildirim>}
    </div>
  );
}
