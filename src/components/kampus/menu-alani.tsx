"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { menuKaydet, menuSil } from "@/lib/kampus/yoklama-islemleri";
import type { Menu } from "@/lib/kampus/yoklama-tipleri";
import { Ikon } from "@/components/ui/ikon";
import { ALAN, Etiket, Dugme } from "./ui";
import { Firildak, SilDugmesi } from "./ui-istemci";

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
  const yonlendirici = useRouter();
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
      if (sonuc.ok) {
        setKaydedildi(true);
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  const degisti =
    kahvalti !== (menu?.kahvalti ?? "") ||
    ogle !== (menu?.ogle ?? "") ||
    araOgun !== (menu?.ara_ogun ?? "");

  const satirlar = [
    { ad: "Kahvaltı", deger: kahvalti, yaz: setKahvalti, id: `k-${tarih}` },
    { ad: "Öğle", deger: ogle, yaz: setOgle, id: `o-${tarih}` },
    { ad: "Ara öğün", deger: araOgun, yaz: setAraOgun, id: `a-${tarih}` },
  ];

  return (
    <div className="space-y-2.5">
      {satirlar.map((s) => (
        <div key={s.id}>
          <Etiket htmlFor={s.id}>{s.ad}</Etiket>
          <input
            id={s.id}
            value={s.deger}
            onChange={(e) => {
              s.yaz(e.target.value);
              setKaydedildi(false);
            }}
            disabled={bekliyor}
            className={ALAN}
          />
        </div>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <span className="flex items-center gap-2">
          <Dugme
            type="button"
            gorunum="birincil"
            olcu="sm"
            onClick={kaydet}
            disabled={bekliyor || !degisti}
          >
            {bekliyor && <Firildak />}
            {bekliyor ? "Kaydediliyor…" : "Kaydet"}
          </Dugme>
          {kaydedildi && !bekliyor && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-basari">
              <Ikon.Tik boyut={13} />
              Kaydedildi
            </span>
          )}
        </span>

        {/* Menu kaydi varsa temizleme secenegi: uc alani tek tek bosaltip
            kaydetmek yerine satiri kaldiriyor. */}
        {menu && (
          <SilDugmesi
            etiket="Menüyü temizle"
            onayEtiketi="Onayla"
            islem={() => menuSil(tarih)}
            tamamlandi={() => {
              setKahvalti("");
              setOgle("");
              setAraOgun("");
            }}
          />
        )}
      </div>

      {hata && (
        <p role="alert" className="text-xs font-medium text-tehlike">
          {hata}
        </p>
      )}
    </div>
  );
}
