"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { dersAc } from "@/lib/kampus/yoklama-islemleri";
import { Dugme } from "./ui";
import { Firildak } from "./ui-istemci";

/** O gun icin dersi acar ve yoklama ekranina goturur. */
export function DersAcButonu({
  sinifId,
  tarih,
}: {
  sinifId: string;
  tarih: string;
}) {
  const yonlendirici = useRouter();
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  function ac() {
    setHata(null);
    basla(async () => {
      const sonuc = await dersAc(sinifId, tarih);
      if (sonuc.ok && sonuc.id) {
        yonlendirici.push(`/kampus/yoklama/${sonuc.id}`);
      } else if (!sonuc.ok) {
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <span className="shrink-0">
      <Dugme type="button" olcu="sm" onClick={ac} disabled={bekliyor}>
        {bekliyor && <Firildak />}
        {bekliyor ? "Açılıyor…" : "Dersi aç"}
      </Dugme>
      {hata && (
        <span role="alert" className="mt-1 block text-xs text-tehlike">
          {hata}
        </span>
      )}
    </span>
  );
}
