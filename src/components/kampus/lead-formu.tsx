"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { leadEkle } from "@/lib/kampus/yoklama-islemleri";
import { LEAD_KAYNAK_ETIKET } from "@/lib/kampus/yoklama-tipleri";
import { Buton } from "@/components/ui/buton";

const ALAN =
  "w-full rounded-yumusak border-2 border-cizgi bg-white px-3.5 py-2 text-sm " +
  "text-murekkep outline-none transition-colors placeholder:text-murekkep-soluk/60 " +
  "focus:border-yesil disabled:opacity-60";

const KAYNAKLAR = [
  "instagram",
  "whatsapp",
  "telefon",
  "tavsiye",
  "tabela",
  "diger",
] as const;

/**
 * Hizli lead girisi.
 *
 * Yalniz ad zorunlu: Instagram'dan gelen bir mesajda cogu zaman elde bir
 * isim oluyor. Zorunlu alan sayisini artirmak, kaydin hic girilmemesine
 * yol acar.
 */
export function LeadFormu() {
  const yonlendirici = useRouter();
  const [adSoyad, setAdSoyad] = useState("");
  const [telefon, setTelefon] = useState("");
  const [kaynak, setKaynak] = useState<string>("instagram");
  const [cocukAdi, setCocukAdi] = useState("");
  const [program, setProgram] = useState("");
  const [notlar, setNotlar] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);

    basla(async () => {
      const sonuc = await leadEkle({
        adSoyad,
        telefon,
        kaynak,
        cocukAdi,
        ilgilendigiProgram: program,
        notlar,
      });
      if (sonuc.ok) {
        setAdSoyad("");
        setTelefon("");
        setCocukAdi("");
        setProgram("");
        setNotlar("");
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <form onSubmit={gonder} className="space-y-3">
      <div>
        <label htmlFor="lead-ad" className="mb-1 block text-sm text-murekkep-soluk">
          Ad soyad
        </label>
        <input
          id="lead-ad"
          required
          value={adSoyad}
          onChange={(e) => setAdSoyad(e.target.value)}
          disabled={bekliyor}
          className={ALAN}
          placeholder="Ayşe Yılmaz"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="lead-tel"
            className="mb-1 block text-sm text-murekkep-soluk"
          >
            Telefon
          </label>
          <input
            id="lead-tel"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            disabled={bekliyor}
            className={ALAN}
            placeholder="0532 ..."
          />
        </div>
        <div>
          <label
            htmlFor="lead-kaynak"
            className="mb-1 block text-sm text-murekkep-soluk"
          >
            Nereden
          </label>
          <select
            id="lead-kaynak"
            value={kaynak}
            onChange={(e) => setKaynak(e.target.value)}
            disabled={bekliyor}
            className={ALAN}
          >
            {KAYNAKLAR.map((k) => (
              <option key={k} value={k}>
                {LEAD_KAYNAK_ETIKET[k]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="lead-cocuk"
            className="mb-1 block text-sm text-murekkep-soluk"
          >
            Çocuğun adı
          </label>
          <input
            id="lead-cocuk"
            value={cocukAdi}
            onChange={(e) => setCocukAdi(e.target.value)}
            disabled={bekliyor}
            className={ALAN}
          />
        </div>
        <div>
          <label
            htmlFor="lead-program"
            className="mb-1 block text-sm text-murekkep-soluk"
          >
            İlgilendiği
          </label>
          <input
            id="lead-program"
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            disabled={bekliyor}
            className={ALAN}
            placeholder="Okula hazırlık"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="lead-not"
          className="mb-1 block text-sm text-murekkep-soluk"
        >
          Not
        </label>
        <textarea
          id="lead-not"
          rows={2}
          value={notlar}
          onChange={(e) => setNotlar(e.target.value)}
          disabled={bekliyor}
          className={`${ALAN} resize-y`}
          placeholder="Instagram'dan yazdı, eylülde başlamak istiyor."
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
        disabled={bekliyor || !adSoyad.trim()}
        className="w-full"
      >
        {bekliyor ? "Kaydediliyor..." : "Lead ekle"}
      </Buton>
    </form>
  );
}
