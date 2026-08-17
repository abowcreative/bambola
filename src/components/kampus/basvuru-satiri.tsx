import { yasMetni } from "@/lib/yas";
import { aileBul } from "@/lib/data/gruplar";
import { tlYaz } from "@/lib/data/ucretler";
import { Ikon } from "@/components/ui/ikon";
import { DURUM_ETIKET, KURUM_ETIKET } from "@/lib/supabase/types";
import type { BasvuruDurumu, Kurum } from "@/lib/supabase/types";
import type { BasvuruOzet } from "@/lib/kampus/basvurular";

/**
 * Listedeki bir basvuru satiri.
 *
 * Hangi bilgi one cikiyor: aranacak kisi (veli adi + telefon), cocugun yasi,
 * hangi program ve ne zaman geldigi. Panelin ilk isi "kimi arayacagim" ve
 * "ne istiyor" sorularini cevaplamak.
 */

export const DURUM_RENGI: Record<BasvuruDurumu, string> = {
  // Yeni dikkat cekmeli: islenmemis talep demek.
  yeni: "bg-lime-rozet text-black",
  arandi: "bg-yesil-koyu text-white",
  ulasilamadi: "bg-krem-koyu text-murekkep",
  kayit_oldu: "bg-yesil text-white",
  vazgecti: "bg-cizgi text-murekkep-soluk",
};

/** "3 saat once", "dun", "5 gun once". */
export function gecenSure(iso: string): string {
  const fark = Date.now() - new Date(iso).getTime();
  const dk = Math.floor(fark / 60000);
  if (dk < 1) return "az önce";
  if (dk < 60) return `${dk} dakika önce`;
  const saat = Math.floor(dk / 60);
  if (saat < 24) return `${saat} saat önce`;
  const gun = Math.floor(saat / 24);
  if (gun === 1) return "dün";
  if (gun < 30) return `${gun} gün önce`;
  const ay = Math.floor(gun / 30);
  return `${ay} ay önce`;
}

export function tarihYaz(iso: string): string {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  });
}

/** 5XXXXXXXXX -> 0532 123 45 67 */
export function telefonYaz(t: string): string {
  const r = t.replace(/\D/g, "");
  const on = r.length === 10 ? r : r.replace(/^(90|0)/, "");
  if (on.length !== 10) return t;
  return `0${on.slice(0, 3)} ${on.slice(3, 6)} ${on.slice(6, 8)} ${on.slice(8)}`;
}

export function BasvuruSatiri({ basvuru }: { basvuru: BasvuruOzet }) {
  const aile = basvuru.program_slug ? aileBul(basvuru.program_slug) : undefined;
  const yeni = basvuru.durum === "yeni";

  const fiyat = basvuru.erken_kayit_uygulandi
    ? basvuru.fiyat_erken_kayit
    : basvuru.fiyat_normal;

  return (
    <article
      className={`rounded-kart border-2 bg-white p-5 transition-colors ${
        yeni ? "border-yesil" : "border-cizgi hover:border-yesil/50"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-baslik text-lg font-bold leading-tight text-murekkep">
              {basvuru.veli_adi}
            </h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${DURUM_RENGI[basvuru.durum]}`}
            >
              {DURUM_ETIKET[basvuru.durum]}
            </span>
            {basvuru.kurum !== "oyun-evi" && (
              <span className="rounded-full bg-krem-koyu px-2.5 py-0.5 text-xs font-medium text-murekkep">
                {KURUM_ETIKET[basvuru.kurum as Kurum]}
              </span>
            )}
          </div>

          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-murekkep-soluk">
            <span className="inline-flex items-center gap-1.5 font-medium text-murekkep">
              <Ikon.Telefon boyut={14} />
              {telefonYaz(basvuru.telefon)}
            </span>
            {basvuru.iletisim_tercihi && (
              <span className="text-xs">
                · {basvuru.iletisim_tercihi} tercih ediyor
              </span>
            )}
          </p>
        </div>

        <span
          className="shrink-0 text-sm text-murekkep-soluk"
          title={tarihYaz(basvuru.created_at)}
        >
          {gecenSure(basvuru.created_at)}
        </span>
      </div>

      {/* --- cocuk ve program --- */}
      <dl className="mt-4 grid gap-x-6 gap-y-2 border-t border-cizgi pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-murekkep-soluk">
            Çocuk
          </dt>
          <dd className="mt-0.5 font-medium text-murekkep">
            {basvuru.cocuk_adi || "Ad verilmedi"}
            <span className="ml-1.5 font-normal text-murekkep-soluk">
              {yasMetni(basvuru.yas_ay)}
            </span>
          </dd>
        </div>

        <div>
          <dt className="text-xs uppercase tracking-wide text-murekkep-soluk">
            Program
          </dt>
          <dd className="mt-0.5 font-medium text-murekkep">
            {aile?.kisaAd ?? aile?.ad ?? "Seçilmedi"}
          </dd>
        </div>

        <div>
          <dt className="text-xs uppercase tracking-wide text-murekkep-soluk">
            Paket
          </dt>
          <dd className="mt-0.5 font-medium text-murekkep">
            {basvuru.paket_kod ? (
              <>
                {basvuru.paket_kod}
                {fiyat != null && (
                  <span className="ml-1.5 font-normal text-yesil-koyu">
                    {tlYaz(fiyat)}
                  </span>
                )}
              </>
            ) : (
              <span className="text-murekkep-soluk">—</span>
            )}
          </dd>
        </div>

        <div>
          <dt className="text-xs uppercase tracking-wide text-murekkep-soluk">
            Nereden
          </dt>
          <dd className="mt-0.5 font-medium text-murekkep">
            {basvuru.kaynak ?? <span className="text-murekkep-soluk">—</span>}
          </dd>
        </div>
      </dl>

      {/*
        Saat uymuyor isareti listede duruyor: bu talep "uygun saat yok"
        demek, yani aranmadan once program bakilmasi gereken bir kayit.
      */}
      {basvuru.saat_uymuyor && (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-krem-koyu px-3 py-1 text-xs font-semibold text-murekkep">
          <Ikon.Saat boyut={13} />
          Saatler uymuyor, alternatif isteniyor
        </p>
      )}
    </article>
  );
}
