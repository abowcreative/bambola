"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Ikon } from "@/components/ui/ikon";
import { Dugme, IkonDugme } from "./ui";

/**
 * Panelin etkilesimli arayuz parcalari.
 *
 * `window.confirm` ve `alert` HIC KULLANILMIYOR: tarayici kipi sayfayi
 * kilitliyor, uslupla hic ilgisi olmuyor ve otomasyon/ekran okuyucu
 * tarafinda sorun cikariyor. Onay iki adimli satir ici bir dugmeyle
 * aliniyor.
 */

/* ------------------------------------------------------------ yukleniyor */

/** Islem surerken donen halka. */
export function Firildak({ boyut = 14 }: { boyut?: number }) {
  return (
    <svg
      width={boyut}
      height={boyut}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="animate-spin"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------- kip */

/**
 * Ortada acilan kip pencere.
 *
 * Escape kapatiyor, arka plan tiklamasi kapatiyor, acikken sayfa
 * kaydirilmiyor. Odak kipin icine tasiniyor: klavyeyle gezen biri kipin
 * arkasindaki forma dusmemeli.
 */
export function Kip({
  acik,
  kapat,
  baslik,
  aciklama,
  genislik = "32rem",
  children,
}: {
  acik: boolean;
  kapat: () => void;
  baslik: string;
  aciklama?: string;
  genislik?: string;
  children: React.ReactNode;
}) {
  const kutu = useRef<HTMLDivElement>(null);
  const basligId = useId();

  useEffect(() => {
    if (!acik) return;

    const oncekiOdak = document.activeElement as HTMLElement | null;
    const oncekiTasma = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function tus(e: KeyboardEvent) {
      if (e.key === "Escape") kapat();
    }
    document.addEventListener("keydown", tus);

    // Odagi kipin ilk odaklanabilir ogesine tasi.
    const ilk = kutu.current?.querySelector<HTMLElement>(
      'input:not([type="hidden"]), select, textarea, button, [href], [tabindex]:not([tabindex="-1"])',
    );
    ilk?.focus();

    return () => {
      document.removeEventListener("keydown", tus);
      document.body.style.overflow = oncekiTasma;
      oncekiOdak?.focus?.();
    };
  }, [acik, kapat]);

  if (!acik) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Kapat"
        onClick={kapat}
        className="fixed inset-0 bg-murekkep/45 backdrop-blur-[2px]"
      />
      <div
        ref={kutu}
        role="dialog"
        aria-modal="true"
        aria-labelledby={basligId}
        style={{ maxWidth: genislik }}
        className="relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-panel border border-panel-cizgi bg-panel-yuzey shadow-panel-yuksek sm:rounded-panel"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-panel-cizgi bg-panel-yuzey px-5 py-3.5">
          <div className="min-w-0">
            <h2
              id={basligId}
              className="font-baslik text-base font-bold text-murekkep"
            >
              {baslik}
            </h2>
            {aciklama && (
              <p className="mt-0.5 text-xs leading-snug text-panel-soluk">
                {aciklama}
              </p>
            )}
          </div>
          <IkonDugme baslik="Kapat" onClick={kapat}>
            <Ikon.Kapat boyut={17} />
          </IkonDugme>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ silme onayi */

/**
 * Iki adimli silme.
 *
 * Ilk tikla dugme "Emin misiniz?" haline geliyor, ikinci tik siliyor. Bes
 * saniye icinde ikinci tik gelmezse kendiliginden geri donuyor -- yanlislikla
 * acik kalmis bir onay dugmesi bir sonraki tikla kaydi silmesin.
 */
export function SilDugmesi({
  islem,
  etiket = "Sil",
  onayEtiketi = "Emin misiniz?",
  olcu = "sm",
  tamamlandi,
}: {
  islem: () => Promise<{ ok: true } | { ok: false; hata: string }>;
  etiket?: string;
  onayEtiketi?: string;
  olcu?: "sm" | "md";
  tamamlandi?: () => void;
}) {
  const yonlendirici = useRouter();
  const [onayda, setOnayda] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  useEffect(() => {
    if (!onayda) return;
    const z = setTimeout(() => setOnayda(false), 5000);
    return () => clearTimeout(z);
  }, [onayda]);

  function tikla() {
    if (!onayda) {
      setOnayda(true);
      setHata(null);
      return;
    }
    basla(async () => {
      const sonuc = await islem();
      if (sonuc.ok) {
        setOnayda(false);
        tamamlandi?.();
        yonlendirici.refresh();
      } else {
        setOnayda(false);
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <Dugme
        type="button"
        gorunum={onayda ? "tehlike" : "sessiz"}
        olcu={olcu}
        onClick={tikla}
        disabled={bekliyor}
        aria-live="polite"
      >
        {bekliyor ? <Firildak /> : <Ikon.Kapat boyut={14} />}
        {onayda ? onayEtiketi : etiket}
      </Dugme>
      {hata && (
        <span role="alert" className="text-xs font-medium text-tehlike">
          {hata}
        </span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ arama */

/**
 * Adres cubuguna yazan arama kutusu.
 *
 * Her tusa istek atmamak icin 350 ms bekliyor: yazma hizindan uzun,
 * kullaniciyi bekletecek kadar da degil. Deger adreste durdugu icin sayfa
 * yenilenince veya baglanti paylasilinca arama korunuyor.
 */
export function AramaKutusu({
  yol,
  deger,
  yerTutucu = "Ara",
  etiket = "Ara",
  anahtar = "ara",
  className = "",
}: {
  /** Aramanin yazilacagi sayfa yolu. */
  yol: string;
  deger: string;
  yerTutucu?: string;
  etiket?: string;
  anahtar?: string;
  className?: string;
}) {
  const yonlendirici = useRouter();
  const parametreler = useSearchParams();
  const [metin, setMetin] = useState(deger);
  const [, basla] = useTransition();

  useEffect(() => {
    if (metin === deger) return;
    const z = setTimeout(() => {
      const y = new URLSearchParams(parametreler.toString());
      if (metin.trim()) y.set(anahtar, metin.trim());
      else y.delete(anahtar);
      const sorgu = y.toString();
      basla(() => yonlendirici.push(sorgu ? `${yol}?${sorgu}` : yol));
    }, 350);
    return () => clearTimeout(z);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metin]);

  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-panel-silik">
        <Ikon.Mercek boyut={16} />
      </span>
      <input
        type="search"
        value={metin}
        onChange={(e) => setMetin(e.target.value)}
        placeholder={yerTutucu}
        aria-label={etiket}
        className="h-9 w-full rounded-panel-sm border border-panel-cizgi-guclu bg-panel-yuzey pl-9 pr-3 text-sm text-murekkep outline-none transition-colors placeholder:text-panel-silik hover:border-panel-soluk/45 focus:border-yesil-koyu focus:ring-2 focus:ring-yesil-koyu/15"
      />
    </div>
  );
}
