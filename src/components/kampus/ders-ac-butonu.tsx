"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { dersAc } from "@/lib/kampus/yoklama-islemleri";

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
      <button
        type="button"
        onClick={ac}
        disabled={bekliyor}
        className="rounded-full border-2 border-cizgi bg-white px-4 py-1.5 font-baslik text-sm font-semibold text-murekkep transition-colors hover:border-yesil disabled:opacity-60"
      >
        {bekliyor ? "Açılıyor..." : "Dersi aç"}
      </button>
      {hata && (
        <span role="alert" className="mt-1 block text-xs text-murekkep">
          {hata}
        </span>
      )}
    </span>
  );
}
