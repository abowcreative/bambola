"use client";

import { Fragment, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import {
  GUNLER,
  GUN_ADI,
  GUN_KISA,
  type Gun,
  type Slot,
} from "@/lib/data/types";
import { gunSlotlari, SLOTLAR, PAZAR_NOTU, OGLE_ARASI } from "@/lib/data/program";
import { atolyeBul } from "@/lib/data/atolyeler";
import { YAS_SAYFALARI } from "@/lib/yas";
import { Ikon, DinamikIkon } from "@/components/ui/ikon";

/**
 * Haftalik program. PLAN.md Bolum 6.1.
 *
 * Mobil: gun secici + tek gun listesi. Masaustu: yedi sutun yan yana.
 * Yas suzgeci ustte; veli once kendi cocugunun yasini secip programi
 * daraltabiliyor.
 */

type YasSuzgec = "hepsi" | (typeof YAS_SAYFALARI)[number]["slug"];

function slotUyarMi(s: Slot, suzgec: YasSuzgec): boolean {
  if (suzgec === "hepsi") return true;
  const bant = YAS_SAYFALARI.find((y) => y.slug === suzgec);
  if (!bant) return true;
  // Ust sinir haric, bkz. lib/yas.ts bantKesisiyorMu.
  return s.yas.minAy < bant.maxAy && s.yas.maxAy > bant.minAy;
}

export function HaftalikTakvim({ baslangicGunu }: { baslangicGunu?: Gun }) {
  const azHareket = useReducedMotion();
  const [suzgec, setSuzgec] = useState<YasSuzgec>("hepsi");
  const [acikGun, setAcikGun] = useState<Gun>(baslangicGunu ?? "pazartesi");

  const gunler = useMemo(
    () =>
      GUNLER.map((g) => ({
        gun: g,
        slotlar: gunSlotlari(g).filter((s) => slotUyarMi(s, suzgec)),
      })),
    [suzgec],
  );

  const toplam = gunler.reduce((t, g) => t + g.slotlar.length, 0);
  const acik = gunler.find((g) => g.gun === acikGun)!;

  return (
    <div>
      {/* --- yas suzgeci --- */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-medium text-murekkep-soluk">
          Yaşa göre:
        </span>
        <SuzgecDugmesi
          etkin={suzgec === "hepsi"}
          onClick={() => setSuzgec("hepsi")}
        >
          Tümü
        </SuzgecDugmesi>
        {YAS_SAYFALARI.map((y) => (
          <SuzgecDugmesi
            key={y.slug}
            etkin={suzgec === y.slug}
            onClick={() => setSuzgec(y.slug)}
          >
            {y.ad}
          </SuzgecDugmesi>
        ))}
      </div>

      <p aria-live="polite" className="mt-3 text-sm text-murekkep-soluk">
        {toplam} etkinlik gösteriliyor.
      </p>

      {/* --- mobil: gun secici --- */}
      <div className="mt-6 lg:hidden">
        <div
          role="tablist"
          aria-label="Günler"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2"
        >
          {gunler.map(({ gun, slotlar }) => (
            <button
              key={gun}
              role="tab"
              aria-selected={acikGun === gun}
              onClick={() => setAcikGun(gun)}
              className={`flex shrink-0 flex-col items-center rounded-yumusak border-2 px-4 py-2.5 transition-colors ${
                acikGun === gun
                  ? "border-[var(--kol-ana)] bg-[var(--kol-vurgu)] text-[var(--kol-vurgu-metin)]"
                  : "border-cizgi bg-white text-murekkep-soluk"
              }`}
            >
              <span className="font-baslik text-sm font-semibold">
                {GUN_KISA[gun]}
              </span>
              <span className="text-xs tabular-nums opacity-80">
                {slotlar.length || "-"}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={acikGun + suzgec}
              initial={azHareket ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={azHareket ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: azHareket ? 0.01 : 0.2 }}
            >
              <h3 className="font-baslik text-xl font-bold text-murekkep">
                {GUN_ADI[acikGun]}
              </h3>
              <GunListesi gun={acikGun} slotlar={acik.slotlar} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* --- masaustu: zaman izgarasi --- */}
      <div className="mt-8 hidden lg:block">
        <ZamanIzgarasi gunler={gunler} />
      </div>
    </div>
  );
}

/**
 * Masaustu gorunumu: satirlar saat araligi, sutunlar gun.
 *
 * Onceki hali yedi bagimsiz sutundu ve her sutun kendi kartlarini ust uste
 * diziyordu; ayni saat farkli gunlerde farkli yukseklige denk geliyor, "Ara"
 * serifi her sutunda baska yerde duruyordu. Yani tablo gibi degil, yan yana
 * yedi liste gibi okunuyordu.
 *
 * Simdi tek bir CSS izgarasi var, o yuzden 14.00 - 16.00 hangi gunde olursa
 * olsun ayni satirda. Veli satiri tarayip "bu saat hangi gunler var" sorusunu
 * bir bakista cevapliyor. Saat satir basligina tasindigi icin kartlarin
 * icinden de cikti, kartlar daraldi.
 */
function ZamanIzgarasi({
  gunler,
}: {
  gunler: { gun: Gun; slotlar: Slot[] }[];
}) {
  // Sutunlar: yalnizca programi OLAN gunler. Pazar su an bos, bos bir sutun
  // izgaranin altida birini yiyordu. Veriye bagli: Pazar'a program eklenirse
  // sutun kendiliginden geri gelir.
  const sutunlar = gunler.filter((g) =>
    SLOTLAR.some((s) => s.gun === g.gun),
  );

  // Satirlar: suzgecten GECEN slotlarin saat araliklari. Suzgec bir araligi
  // tamamen bosaltirsa o satir hic cizilmez.
  const araliklar = [
    ...new Map(
      sutunlar
        .flatMap((g) => g.slotlar)
        .map((s) => [`${s.bas}-${s.bit}`, { bas: s.bas, bit: s.bit }]),
    ).values(),
  ].sort((a, b) => a.bas.localeCompare(b.bas) || a.bit.localeCompare(b.bit));

  const bosGun = gunler.find((g) => g.gun === "pazar");

  if (araliklar.length === 0) {
    return (
      <p className="rounded-kart border-2 border-dashed border-cizgi bg-white p-6 text-center text-murekkep-soluk">
        Bu yaşa uygun etkinlik yok. Yaş süzgecini genişletin.
      </p>
    );
  }

  // Ogle arasi serifi, sabah araliklarinin bittigi yere BIR KEZ giriyor.
  const sonSabah = araliklar.filter((a) => a.bas < OGLE_ARASI.bas).length;

  return (
    <div className="overflow-hidden rounded-kart border-2 border-cizgi bg-white">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `5.75rem repeat(${sutunlar.length}, minmax(0, 1fr))`,
        }}
      >
        {/* baslik satiri */}
        <div className="border-b-2 border-cizgi bg-krem-koyu" />
        {sutunlar.map(({ gun }) => (
          <div
            key={gun}
            className="border-b-2 border-l border-cizgi bg-krem-koyu px-3 py-2.5 text-center font-baslik text-sm font-bold text-murekkep"
          >
            {GUN_ADI[gun]}
          </div>
        ))}

        {araliklar.map((a, satir) => (
          <Fragment key={`${a.bas}-${a.bit}`}>
            {satir === sonSabah && sonSabah > 0 && (
              <div className="col-span-full flex items-center justify-center gap-1.5 border-y border-cizgi bg-krem-koyu/60 py-1.5 text-xs font-medium text-murekkep-soluk">
                <Ikon.Saat boyut={14} />
                Öğle arası {OGLE_ARASI.bas} - {OGLE_ARASI.bit}
              </div>
            )}

            <div
              className={`flex flex-col justify-center bg-krem px-3 py-3 text-center ${
                satir > 0 ? "border-t border-cizgi" : ""
              }`}
            >
              <span className="font-baslik text-sm font-bold tabular-nums text-murekkep">
                {a.bas}
              </span>
              <span className="text-xs tabular-nums text-murekkep-soluk">
                {a.bit}
              </span>
            </div>

            {sutunlar.map(({ gun, slotlar }) => {
              const hucre = slotlar.filter(
                (s) => s.bas === a.bas && s.bit === a.bit,
              );
              return (
                <div
                  key={gun}
                  className={`border-l border-cizgi p-2 ${
                    satir > 0 ? "border-t" : ""
                  } ${hucre.length === 0 ? "bg-krem/40" : ""}`}
                >
                  {hucre.length === 0 ? (
                    <span className="sr-only">Program yok</span>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {hucre.map((s) => (
                        <IzgaraKarti key={s.id} slot={s} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>

      {bosGun && (
        <p className="flex items-center gap-2 border-t-2 border-cizgi bg-krem px-4 py-3 text-sm text-murekkep-soluk">
          <Ikon.Saat boyut={15} className="shrink-0" />
          {PAZAR_NOTU}
        </p>
      )}
    </div>
  );
}

/**
 * Izgara hucresindeki kart. SlotKarti'nin dar hali: saat satir basliginda
 * oldugu icin karttan cikarildi, ikon da yer actigi icin kucultuldu.
 */
function IzgaraKarti({ slot }: { slot: Slot }) {
  const atolye = atolyeBul(slot.atolyeSlug);

  // `block`, `h-full` degil: kart kendi icerigi kadar yuksek olur, satirin en
  // uzun hucresi kadar uzamaz. Uzasaydi tek kartli satirlarda rozetlerle
  // ogretmen adi arasinda acikta bir bosluk kalirdi.
  return (
    <Link
      href={`/oyun-evi/programlar/${slot.atolyeSlug}`}
      className="group block rounded-yumusak border border-cizgi bg-white p-2.5 transition-all duration-200 ease-yayli hover:-translate-y-0.5 hover:border-yesil hover:shadow-kart"
    >
      <div className="flex items-start gap-2">
        <span className="mt-px grid size-6 shrink-0 place-items-center rounded-full bg-krem-koyu text-yesil-koyu transition-colors group-hover:bg-lime-rozet">
          <DinamikIkon ad={atolye?.ikon ?? "Grup"} boyut={13} />
        </span>
        <p className="min-w-0 text-[0.82rem] font-semibold leading-tight text-murekkep">
          {atolye?.kisaAd ?? slot.atolyeSlug}
        </p>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        <Rozet>{slot.yas.etiket}</Rozet>
        {slot.yas.ebeveynsiz && <Rozet vurgu>Ebeveynsiz</Rozet>}
        {slot.dil === "en" && <Rozet vurgu>İngilizce</Rozet>}
        {slot.dil === "karma" && <Rozet vurgu>1 sa. İngilizce</Rozet>}
        {slot.tekSeferMumkun && <Rozet>Tek seferlik</Rozet>}
      </div>

      {slot.ogretmenler.length > 0 && (
        <p className="mt-1.5 text-[0.7rem] leading-tight text-murekkep-soluk">
          {slot.ogretmenler.join(", ")}
        </p>
      )}
    </Link>
  );
}

function SuzgecDugmesi({
  etkin,
  onClick,
  children,
}: {
  etkin: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={etkin}
      className={`rounded-full border-2 px-3.5 py-1.5 text-sm font-medium transition-colors ${
        etkin
          ? "border-[var(--kol-ana)] bg-[var(--kol-vurgu)] text-[var(--kol-vurgu-metin)]"
          : "border-cizgi bg-white text-murekkep-soluk hover:border-[var(--kol-ana)]/50"
      }`}
    >
      {children}
    </button>
  );
}

function GunListesi({
  gun,
  slotlar,
  sutun = false,
}: {
  gun: Gun;
  slotlar: Slot[];
  sutun?: boolean;
}) {
  if (gun === "pazar") {
    return (
      <p
        className={`rounded-kart border-2 border-dashed border-cizgi bg-white p-4 text-sm text-murekkep-soluk ${
          sutun ? "" : "mt-3"
        }`}
      >
        {PAZAR_NOTU}
      </p>
    );
  }

  if (slotlar.length === 0) {
    return (
      <p
        className={`rounded-kart border-2 border-dashed border-cizgi bg-white p-4 text-sm text-murekkep-soluk ${
          sutun ? "" : "mt-3"
        }`}
      >
        Bu yaşa uygun etkinlik yok.
      </p>
    );
  }

  // Ogle arasi, sabah ve ogleden sonra arasina bir kez girer.
  const sabah = slotlar.filter((s) => s.bas < OGLE_ARASI.bas);
  const ogledenSonra = slotlar.filter((s) => s.bas >= OGLE_ARASI.bas);

  return (
    <ul className={`space-y-2.5 ${sutun ? "" : "mt-3"}`}>
      {sabah.map((s) => (
        <li key={s.id}>
          <SlotKarti slot={s} />
        </li>
      ))}

      {sabah.length > 0 && ogledenSonra.length > 0 && (
        <li>
          <p className="flex items-center justify-center gap-1.5 rounded-yumusak bg-krem-koyu/70 px-3 py-1.5 text-xs font-medium text-murekkep-soluk">
            <Ikon.Saat boyut={14} />
            Ara {OGLE_ARASI.bas} - {OGLE_ARASI.bit}
          </p>
        </li>
      )}

      {ogledenSonra.map((s) => (
        <li key={s.id}>
          <SlotKarti slot={s} />
        </li>
      ))}
    </ul>
  );
}

export function SlotKarti({ slot }: { slot: Slot }) {
  const atolye = atolyeBul(slot.atolyeSlug);

  return (
    <Link
      href={`/oyun-evi/programlar/${slot.atolyeSlug}`}
      className="group block rounded-kart border-2 border-cizgi bg-white p-3.5 transition-all duration-200 ease-yayli hover:-translate-y-0.5 hover:border-yesil hover:shadow-kart"
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-krem-koyu text-yesil-koyu transition-colors group-hover:bg-lime-rozet">
          <DinamikIkon ad={atolye?.ikon ?? "Grup"} boyut={17} />
        </span>
        <div className="min-w-0">
          <p className="font-baslik text-sm font-bold tabular-nums text-murekkep">
            {slot.bas} - {slot.bit}
          </p>
          <p className="mt-0.5 text-sm leading-snug text-murekkep">
            {atolye?.kisaAd ?? slot.atolyeSlug}
          </p>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <Rozet>{slot.yas.etiket}</Rozet>
        {slot.yas.ebeveynsiz && <Rozet vurgu>Ebeveynsiz</Rozet>}
        {slot.dil === "en" && <Rozet vurgu>İngilizce</Rozet>}
        {slot.dil === "karma" && <Rozet vurgu>1 saat İngilizce</Rozet>}
        {slot.tekSeferMumkun && <Rozet>Tek seferlik</Rozet>}
      </div>

      {slot.ogretmenler.length > 0 && (
        <p className="mt-2 text-xs text-murekkep-soluk">
          {slot.ogretmenler.join(", ")}
        </p>
      )}
    </Link>
  );
}

function Rozet({
  children,
  vurgu,
}: {
  children: React.ReactNode;
  vurgu?: boolean;
}) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${
        vurgu ? "bg-lime-rozet text-black" : "bg-krem-koyu text-murekkep-soluk"
      }`}
    >
      {children}
    </span>
  );
}
