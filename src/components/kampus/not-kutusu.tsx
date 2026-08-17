"use client";

import { useRef, useState, useTransition } from "react";
import { notEkle } from "@/lib/kampus/basvuru-islemleri";
import { Buton } from "@/components/ui/buton";
import { Ikon } from "@/components/ui/ikon";
import type { BasvuruNotu } from "@/lib/kampus/basvurular";
import { tarihYaz } from "./basvuru-satiri";

/**
 * Gorusme notlari.
 *
 * Notlar DEGISTIRILEMIYOR ve silinemiyor, yalnizca ekleniyor. Kim ne zaman
 * ne yazdi kaydi bir gorusme gecmisi; sonradan duzeltilebilir olsaydi
 * dayanak olmaktan cikardi.
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
    <section className="rounded-blok border-2 border-cizgi bg-white p-6">
      <h2 className="flex items-center gap-2 font-baslik text-lg font-bold text-murekkep">
        <Ikon.Not boyut={19} />
        Görüşme notları
      </h2>

      <form onSubmit={gonder} className="mt-4">
        <textarea
          ref={alan}
          value={metin}
          onChange={(e) => setMetin(e.target.value)}
          disabled={bekliyor}
          rows={3}
          maxLength={2000}
          placeholder="Arandı, çarşamba grubuna bakacak. Cuma tekrar aranacak."
          className="w-full resize-y rounded-yumusak border-2 border-cizgi bg-white px-4 py-3 text-murekkep outline-none transition-colors placeholder:text-murekkep-soluk/60 focus:border-yesil disabled:opacity-60"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xs text-murekkep-soluk">
            Notlar sonradan değiştirilemez.
          </span>
          <Buton
            type="submit"
            olcu="sm"
            disabled={bekliyor || !metin.trim()}
          >
            {bekliyor ? "Ekleniyor..." : "Not ekle"}
          </Buton>
        </div>
        {hata && (
          <p role="alert" className="mt-2 text-sm text-murekkep">
            {hata}
          </p>
        )}
      </form>

      {notlar.length > 0 && (
        <ul className="mt-6 space-y-3 border-t border-cizgi pt-5">
          {notlar.map((n) => (
            <li key={n.id} className="rounded-kart bg-krem px-4 py-3">
              <p className="whitespace-pre-line leading-relaxed text-murekkep">
                {n.metin}
              </p>
              <p className="mt-1.5 text-xs text-murekkep-soluk">
                {n.yazan ?? "Bilinmiyor"} · {tarihYaz(n.created_at)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
