"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { duyuruEkle } from "@/lib/kampus/yoklama-islemleri";
import { HEDEF_ETIKET } from "@/lib/kampus/yoklama-tipleri";
import { Buton } from "@/components/ui/buton";

const ALAN =
  "w-full rounded-yumusak border-2 border-cizgi bg-white px-3.5 py-2 text-sm " +
  "text-murekkep outline-none transition-colors placeholder:text-murekkep-soluk/60 " +
  "focus:border-yesil disabled:opacity-60";

const HEDEFLER = ["hepsi", "ogretmen", "veli"] as const;

export function DuyuruFormu() {
  const yonlendirici = useRouter();
  const [baslik, setBaslik] = useState("");
  const [metin, setMetin] = useState("");
  const [hedef, setHedef] = useState<string>("hepsi");
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);
    basla(async () => {
      const sonuc = await duyuruEkle({ baslik, metin, hedef });
      if (sonuc.ok) {
        setBaslik("");
        setMetin("");
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <form onSubmit={gonder} className="space-y-3">
      <div>
        <label
          htmlFor="d-baslik"
          className="mb-1 block text-sm text-murekkep-soluk"
        >
          Başlık
        </label>
        <input
          id="d-baslik"
          required
          value={baslik}
          onChange={(e) => setBaslik(e.target.value)}
          disabled={bekliyor}
          className={ALAN}
          placeholder="Cumartesi atölyesi iptal"
        />
      </div>

      <div>
        <label
          htmlFor="d-hedef"
          className="mb-1 block text-sm text-murekkep-soluk"
        >
          Kimler görecek
        </label>
        <select
          id="d-hedef"
          value={hedef}
          onChange={(e) => setHedef(e.target.value)}
          disabled={bekliyor}
          className={ALAN}
        >
          {HEDEFLER.map((h) => (
            <option key={h} value={h}>
              {HEDEF_ETIKET[h]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="d-metin"
          className="mb-1 block text-sm text-murekkep-soluk"
        >
          Metin
        </label>
        <textarea
          id="d-metin"
          required
          rows={5}
          value={metin}
          onChange={(e) => setMetin(e.target.value)}
          disabled={bekliyor}
          className={`${ALAN} resize-y`}
        />
      </div>

      {hata && (
        <p role="alert" className="text-sm text-murekkep">
          {hata}
        </p>
      )}

      <Buton
        type="submit"
        olcu="sm"
        disabled={bekliyor || !baslik.trim() || !metin.trim()}
        className="w-full"
      >
        {bekliyor ? "Kaydediliyor..." : "Taslak olarak kaydet"}
      </Buton>

      <p className="text-xs leading-relaxed text-murekkep-soluk">
        Duyuru taslak olarak kaydedilir. Yayına almak ayrı bir adım.
      </p>
    </form>
  );
}
