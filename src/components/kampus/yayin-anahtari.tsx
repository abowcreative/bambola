"use client";

import { useState, useTransition } from "react";
import { duyuruYayinDegistir } from "@/lib/kampus/yoklama-islemleri";
import { Ikon } from "@/components/ui/ikon";
import { Dugme } from "./ui";
import { Firildak } from "./ui-istemci";

/** Duyuruyu yayina alir veya taslaga cevirir. */
export function YayinAnahtari({
  id,
  yayinda,
}: {
  id: string;
  yayinda: boolean;
}) {
  const [acik, setAcik] = useState(yayinda);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  function degistir() {
    const yeni = !acik;
    setAcik(yeni);
    setHata(null);
    basla(async () => {
      const sonuc = await duyuruYayinDegistir(id, yeni);
      if (!sonuc.ok) {
        setAcik(!yeni);
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <span className="shrink-0">
      <Dugme
        type="button"
        olcu="sm"
        gorunum={acik ? "birincil" : "ikincil"}
        onClick={degistir}
        disabled={bekliyor}
        aria-pressed={acik}
      >
        {bekliyor ? <Firildak /> : acik ? <Ikon.Tik boyut={13} /> : null}
        {acik ? "Yayında" : "Yayına al"}
      </Dugme>
      {hata && (
        <span role="alert" className="mt-1 block text-xs text-tehlike">
          {hata}
        </span>
      )}
    </span>
  );
}
