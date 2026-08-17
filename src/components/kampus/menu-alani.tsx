"use client";

import { useState, useTransition } from "react";
import { menuKaydet } from "@/lib/kampus/yoklama-islemleri";
import type { Menu } from "@/lib/kampus/yoklama-tipleri";
import { Buton } from "@/components/ui/buton";

const ALAN =
  "w-full rounded-yumusak border-2 border-cizgi bg-white px-3 py-1.5 text-sm " +
  "text-murekkep outline-none transition-colors placeholder:text-murekkep-soluk/60 " +
  "focus:border-yesil disabled:opacity-60";

/**
 * Bir gunun menusu. Uc alan tek dugmeyle kaydediliyor: gunun menusu bir
 * butun, alan alan kaydetmek gereksiz istek uretiyor.
 */
export function MenuAlani({
  tarih,
  menu,
}: {
  tarih: string;
  menu: Menu | null;
}) {
  const [kahvalti, setKahvalti] = useState(menu?.kahvalti ?? "");
  const [ogle, setOgle] = useState(menu?.ogle ?? "");
  const [araOgun, setAraOgun] = useState(menu?.ara_ogun ?? "");
  const [kaydedildi, setKaydedildi] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  function kaydet() {
    setHata(null);
    setKaydedildi(false);
    basla(async () => {
      const sonuc = await menuKaydet({ tarih, kahvalti, ogle, araOgun });
      if (sonuc.ok) setKaydedildi(true);
      else setHata(sonuc.hata);
    });
  }

  const degisti =
    kahvalti !== (menu?.kahvalti ?? "") ||
    ogle !== (menu?.ogle ?? "") ||
    araOgun !== (menu?.ara_ogun ?? "");

  return (
    <div className="space-y-2.5">
      <div>
        <label className="mb-1 block text-xs text-murekkep-soluk">
          Kahvaltı
          <input
            value={kahvalti}
            onChange={(e) => {
              setKahvalti(e.target.value);
              setKaydedildi(false);
            }}
            disabled={bekliyor}
            className={`${ALAN} mt-1`}
          />
        </label>
      </div>
      <div>
        <label className="mb-1 block text-xs text-murekkep-soluk">
          Öğle
          <input
            value={ogle}
            onChange={(e) => {
              setOgle(e.target.value);
              setKaydedildi(false);
            }}
            disabled={bekliyor}
            className={`${ALAN} mt-1`}
          />
        </label>
      </div>
      <div>
        <label className="mb-1 block text-xs text-murekkep-soluk">
          Ara öğün
          <input
            value={araOgun}
            onChange={(e) => {
              setAraOgun(e.target.value);
              setKaydedildi(false);
            }}
            disabled={bekliyor}
            className={`${ALAN} mt-1`}
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <Buton
          type="button"
          olcu="sm"
          onClick={kaydet}
          disabled={bekliyor || !degisti}
        >
          {bekliyor ? "Kaydediliyor..." : "Kaydet"}
        </Buton>
        {kaydedildi && !bekliyor && (
          <span className="text-sm text-yesil-koyu">Kaydedildi</span>
        )}
      </div>

      {hata && (
        <p role="alert" className="text-sm text-murekkep">
          {hata}
        </p>
      )}
    </div>
  );
}
