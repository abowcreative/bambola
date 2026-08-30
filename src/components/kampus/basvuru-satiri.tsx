import { yasMetni } from "@/lib/yas";
import { aileBul } from "@/lib/data/gruplar";
import { tlYaz } from "@/lib/data/ucretler";
import { Ikon } from "@/components/ui/ikon";
import { DURUM_ETIKET, KURUM_ETIKET } from "@/lib/supabase/types";
import type { Kurum } from "@/lib/supabase/types";
import { BASVURU_TONU } from "@/lib/kampus/tonlar";
import type { BasvuruOzet } from "@/lib/kampus/basvurular";
import { Kart, Rozet } from "./ui";

/**
 * Listedeki bir basvuru satiri.
 *
 * Hangi bilgi one cikiyor: aranacak kisi (veli adi + telefon), cocugun yasi,
 * hangi program ve ne zaman geldigi. Panelin ilk isi "kimi arayacagim" ve
 * "ne istiyor" sorularini cevaplamak.
 */

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

/** Kunye kutucugu: kucuk etiket, altinda deger. */
function Kutucuk({
  etiket,
  children,
}: {
  etiket: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.05em] text-panel-silik">
        {etiket}
      </dt>
      <dd className="mt-0.5 truncate text-sm font-medium text-murekkep">
        {children}
      </dd>
    </div>
  );
}

export function BasvuruSatiri({ basvuru }: { basvuru: BasvuruOzet }) {
  const aile = basvuru.program_slug ? aileBul(basvuru.program_slug) : undefined;
  const yeni = basvuru.durum === "yeni";

  const fiyat = basvuru.erken_kayit_uygulandi
    ? basvuru.fiyat_erken_kayit
    : basvuru.fiyat_normal;

  return (
    <Kart
      className={`p-4 transition-colors ${
        yeni
          ? "border-yesil/50 bg-lime-rozet/8"
          : "hover:border-panel-cizgi-guclu"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-baslik text-base font-bold leading-tight text-murekkep">
              {basvuru.veli_adi}
            </h2>
            <Rozet ton={BASVURU_TONU[basvuru.durum] ?? "notr"}>
              {DURUM_ETIKET[basvuru.durum]}
            </Rozet>
            {basvuru.kurum !== "oyun-evi" && (
              <Rozet>{KURUM_ETIKET[basvuru.kurum as Kurum]}</Rozet>
            )}
          </div>

          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-panel-soluk">
            <span className="inline-flex items-center gap-1.5 font-medium text-murekkep">
              <Ikon.Telefon boyut={14} className="text-panel-silik" />
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
          className="shrink-0 text-xs text-panel-silik"
          title={tarihYaz(basvuru.created_at)}
        >
          {gecenSure(basvuru.created_at)}
        </span>
      </div>

      {/* --- cocuk ve program --- */}
      <dl className="mt-3 grid gap-x-5 gap-y-2 border-t border-panel-cizgi pt-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kutucuk etiket="Çocuk">
          {basvuru.cocuk_adi || "Ad verilmedi"}
          <span className="ml-1.5 font-normal text-panel-soluk">
            {yasMetni(basvuru.yas_ay)}
          </span>
        </Kutucuk>

        <Kutucuk etiket="Program">
          {aile?.kisaAd ?? aile?.ad ?? (
            <span className="text-panel-silik">Seçilmedi</span>
          )}
        </Kutucuk>

        <Kutucuk etiket="Paket">
          {basvuru.paket_kod ? (
            <>
              {basvuru.paket_kod}
              {fiyat != null && (
                <span className="ml-1.5 font-normal text-basari">
                  {tlYaz(fiyat)}
                </span>
              )}
            </>
          ) : (
            <span className="text-panel-silik">—</span>
          )}
        </Kutucuk>

        <Kutucuk etiket="Nereden">
          {basvuru.kaynak ?? <span className="text-panel-silik">—</span>}
        </Kutucuk>
      </dl>

      {/*
        Saat uymuyor isareti listede duruyor: bu talep "uygun saat yok"
        demek, yani aranmadan once program bakilmasi gereken bir kayit.
      */}
      {basvuru.saat_uymuyor && (
        <p className="mt-3">
          <Rozet ton="uyari" ikon={<Ikon.Saat boyut={12} />}>
            Saatler uymuyor, alternatif isteniyor
          </Rozet>
        </p>
      )}
    </Kart>
  );
}
