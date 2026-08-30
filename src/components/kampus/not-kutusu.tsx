"use client";

import { useRef, useState, useTransition } from "react";
import { notEkle, notSil } from "@/lib/kampus/basvuru-islemleri";
import { Ikon } from "@/components/ui/ikon";
import type { BasvuruNotu } from "@/lib/kampus/basvurular";
import { ALAN, Bildirim, Dugme, Kart, KartBasi } from "./ui";
import { Firildak, SilDugmesi } from "./ui-istemci";
import { tarihYaz } from "./basvuru-satiri";

/**
 * Gorusme notlari.
 *
 * Notlar DEGISTIRILEMIYOR, yalnizca ekleniyor ve silinebiliyor. Kim ne
 * zaman ne yazdi kaydi bir gorusme gecmisi; sonradan duzeltilebilir olsaydi
 * dayanak olmaktan cikardi. Silme yanlis kayda yazilmis not icin var.
 */
export function NotKutusu({
  basvuruId,
  notlar,
}: {
  basvuruId: string;
  notlar: BasvuruNotu[];
}) {
  const [metin, setMetin] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();
  const alan = useRef<HTMLTextAreaElement>(null);

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    const yazi = metin.trim();
    if (!yazi) return;
    setHata(null);

    basla(async () => {
      const sonuc = await notEkle(basvuruId, yazi);
      if (sonuc.ok) {
        setMetin("");
        alan.current?.focus();
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <Kart className="overflow-hidden">
      <KartBasi
        baslik={
          <span className="inline-flex items-center gap-2">
            <Ikon.Not boyut={16} className="text-panel-silik" />
            Görüşme notları
          </span>
        }
        yanCocuk={
          notlar.length > 0 ? (
            <span className="text-xs text-panel-silik">
              {notlar.length} not
            </span>
          ) : undefined
        }
      />

      <div className="p-4">
        <form onSubmit={gonder}>
          <textarea
            ref={alan}
            value={metin}
            onChange={(e) => setMetin(e.target.value)}
            disabled={bekliyor}
            rows={3}
            maxLength={2000}
            aria-label="Yeni görüşme notu"
            placeholder="Arandı, çarşamba grubuna bakacak. Cuma tekrar aranacak."
            className={`${ALAN} resize-y`}
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-xs text-panel-silik">
              Notlar sonradan değiştirilemez.
            </span>
            <Dugme
              type="submit"
              gorunum="birincil"
              olcu="sm"
              disabled={bekliyor || !metin.trim()}
            >
              {bekliyor && <Firildak />}
              {bekliyor ? "Ekleniyor…" : "Not ekle"}
            </Dugme>
          </div>
          {hata && (
            <div className="mt-2">
              <Bildirim ton="tehlike">{hata}</Bildirim>
            </div>
          )}
        </form>

        {notlar.length > 0 && (
          <ul className="mt-4 space-y-2 border-t border-panel-cizgi pt-4">
            {notlar.map((n) => (
              <li
                key={n.id}
                className="rounded-panel-sm border border-panel-cizgi bg-panel-yuzey-alt px-3.5 py-2.5"
              >
                <p className="whitespace-pre-line text-sm leading-relaxed text-murekkep">
                  {n.metin}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-panel-silik">
                    {n.yazan ?? "Bilinmiyor"} · {tarihYaz(n.created_at)}
                  </span>
                  <SilDugmesi
                    etiket="Sil"
                    onayEtiketi="Onayla"
                    islem={() => notSil(n.id, basvuruId)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Kart>
  );
}
