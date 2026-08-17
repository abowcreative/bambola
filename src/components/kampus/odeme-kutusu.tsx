"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { odemeEkle, odemeSil } from "@/lib/kampus/yoklama-islemleri";
import {
  YONTEM_ETIKET,
  bakiyeHesapla,
  type Odeme,
} from "@/lib/kampus/yoklama-tipleri";
import { Buton } from "@/components/ui/buton";
import { Ikon } from "@/components/ui/ikon";

const ALAN =
  "w-full rounded-yumusak border-2 border-cizgi bg-white px-3 py-1.5 text-sm " +
  "text-murekkep outline-none transition-colors focus:border-yesil disabled:opacity-60";

/** Basit TL bicimi. Sunucu tarafiyla ayni gorunum. */
const tl = (n: number) =>
  `₺${n.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}`;

/**
 * Ogrencinin cari hareketleri ve yeni kayit.
 *
 * Borc ve tahsilat AYNI FORMLA giriliyor, `tur` secimiyle: iki ayri form
 * ekrani ikiye boluyor ve alanlarin cogu ayni.
 */
export function OdemeKutusu({
  ogrenciId,
  hareketler,
}: {
  ogrenciId: string;
  hareketler: Odeme[];
}) {
  const yonlendirici = useRouter();
  const bugun = new Date().toLocaleDateString("en-CA");

  const [tur, setTur] = useState<"borc" | "tahsilat">("tahsilat");
  const [tutar, setTutar] = useState("");
  const [tarih, setTarih] = useState(bugun);
  const [vade, setVade] = useState("");
  const [yontem, setYontem] = useState("nakit");
  const [aciklama, setAciklama] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  const { borc, tahsilat, bakiye } = bakiyeHesapla(hareketler);

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);
    basla(async () => {
      const sonuc = await odemeEkle({
        ogrenciId,
        tur,
        tutar,
        tarih,
        vade: tur === "borc" ? vade : undefined,
        yontem: tur === "tahsilat" ? yontem : undefined,
        aciklama,
      });
      if (sonuc.ok) {
        setTutar("");
        setAciklama("");
        setVade("");
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  function sil(id: string) {
    basla(async () => {
      const sonuc = await odemeSil(id);
      if (sonuc.ok) yonlendirici.refresh();
      else setHata(sonuc.hata);
    });
  }

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-xs text-murekkep-soluk">Tahakkuk</dt>
          <dd className="font-baslik font-bold tabular-nums text-murekkep">
            {tl(borc)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-murekkep-soluk">Tahsilat</dt>
          <dd className="font-baslik font-bold tabular-nums text-murekkep">
            {tl(tahsilat)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-murekkep-soluk">Bakiye</dt>
          <dd
            className={`font-baslik font-bold tabular-nums ${
              bakiye > 0 ? "text-murekkep" : "text-yesil-koyu"
            }`}
          >
            {tl(bakiye)}
          </dd>
        </div>
      </dl>

      {hareketler.length > 0 && (
        <ul className="divide-y divide-cizgi border-y border-cizgi">
          {hareketler.map((h) => (
            <li
              key={h.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm"
            >
              <span className="w-20 shrink-0 tabular-nums text-xs text-murekkep-soluk">
                {new Date(h.tarih).toLocaleDateString("tr-TR", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                  h.tur === "borc"
                    ? "bg-krem-koyu text-murekkep"
                    : "bg-lime-rozet text-black"
                }`}
              >
                {h.tur === "borc" ? "Borç" : "Tahsilat"}
              </span>
              <span className="min-w-0 flex-1 truncate text-xs text-murekkep-soluk">
                {h.aciklama ??
                  (h.yontem ? YONTEM_ETIKET[h.yontem] : "") ??
                  ""}
                {h.vade &&
                  ` · vade ${new Date(h.vade).toLocaleDateString("tr-TR")}`}
              </span>
              <span className="shrink-0 font-medium tabular-nums text-murekkep">
                {tl(h.tutar)}
              </span>
              <button
                type="button"
                onClick={() => sil(h.id)}
                disabled={bekliyor}
                aria-label="Hareketi sil"
                className="shrink-0 text-murekkep-soluk transition-colors hover:text-murekkep disabled:opacity-50"
              >
                <Ikon.Kapat boyut={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={gonder} className="space-y-2.5">
        <div className="flex gap-1.5">
          {(["tahsilat", "borc"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTur(t)}
              aria-pressed={tur === t}
              className={`rounded-full px-3.5 py-1.5 font-baslik text-sm font-semibold transition-colors ${
                tur === t
                  ? "bg-yesil-koyu text-white"
                  : "border-2 border-cizgi bg-white text-murekkep-soluk hover:border-yesil"
              }`}
            >
              {t === "tahsilat" ? "Tahsilat" : "Borç"}
            </button>
          ))}
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          <label className="block text-xs text-murekkep-soluk">
            Tutar (TL)
            <input
              type="number"
              min={1}
              step={1}
              required
              value={tutar}
              onChange={(e) => setTutar(e.target.value)}
              disabled={bekliyor}
              className={`${ALAN} mt-1`}
            />
          </label>
          <label className="block text-xs text-murekkep-soluk">
            Tarih
            <input
              type="date"
              required
              value={tarih}
              onChange={(e) => setTarih(e.target.value)}
              disabled={bekliyor}
              className={`${ALAN} mt-1`}
            />
          </label>
        </div>

        {tur === "borc" ? (
          <label className="block text-xs text-murekkep-soluk">
            Vade (isteğe bağlı)
            <input
              type="date"
              value={vade}
              onChange={(e) => setVade(e.target.value)}
              disabled={bekliyor}
              className={`${ALAN} mt-1`}
            />
          </label>
        ) : (
          <label className="block text-xs text-murekkep-soluk">
            Yöntem
            <select
              value={yontem}
              onChange={(e) => setYontem(e.target.value)}
              disabled={bekliyor}
              className={`${ALAN} mt-1`}
            >
              {Object.entries(YONTEM_ETIKET).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block text-xs text-murekkep-soluk">
          Açıklama
          <input
            value={aciklama}
            onChange={(e) => setAciklama(e.target.value)}
            disabled={bekliyor}
            className={`${ALAN} mt-1`}
            placeholder={tur === "borc" ? "Eylül ayda 8 katılım" : "Eylül tahsilatı"}
          />
        </label>

        {hata && (
          <p role="alert" className="text-sm text-murekkep">
            {hata}
          </p>
        )}

        <Buton
          type="submit"
          olcu="sm"
          disabled={bekliyor || !tutar}
          className="w-full"
        >
          {bekliyor ? "Kaydediliyor..." : "Hareket ekle"}
        </Buton>
      </form>
    </div>
  );
}
