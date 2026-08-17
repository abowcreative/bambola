import Link from "next/link";
import { adminZorunlu } from "@/lib/kampus/oturum";
import { basvurulariGetir, basvuruSayilari } from "@/lib/kampus/basvurular";
import { Kabuk, SayfaBasi, Kutu, Sayac } from "@/components/kampus/kabuk";
import { BasvuruSatiri, gecenSure } from "@/components/kampus/basvuru-satiri";
import { MODULLER } from "@/lib/kampus/moduller";
import { DinamikIkon, Ikon } from "@/components/ui/ikon";
import { SLOTLAR, gunSlotlari } from "@/lib/data/program";
import { atolyeBul } from "@/lib/data/atolyeler";
import { EKIP } from "@/lib/data/ekip";
import { AILELER } from "@/lib/data/gruplar";
import { GUNLER, GUN_ADI } from "@/lib/data/types";
import type { Gun } from "@/lib/data/types";
import {
  KAMPANYA_PENCERESI,
  kampanyaAcikMi,
  kampanyaKalanGun,
} from "@/lib/data/ucretler";

export const metadata = { title: "Panel", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Bugunun gun anahtari. Kurum saati Turkiye. */
function bugununGunu(): Gun {
  const ad = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: "Europe/Istanbul",
    })
    .toLowerCase();
  const esleme: Record<string, Gun> = {
    monday: "pazartesi",
    tuesday: "sali",
    wednesday: "carsamba",
    thursday: "persembe",
    friday: "cuma",
    saturday: "cumartesi",
    sunday: "pazar",
  };
  return esleme[ad] ?? "pazartesi";
}

/**
 * Son N gunde gelen kayit sayisi.
 *
 * Bilesenin DISINDA: `Date.now()` render sirasinda cagrilinca React saflik
 * kurali uyariyor, cunku her yeniden cizimde baska sonuc verebilir. Sunucu
 * bileseninde pratikte sorun cikarmaz ama kural dogru; hesap buraya alindi.
 */
function sonGunlerde(kayitlar: { created_at: string }[], gun: number): number {
  const sinir = Date.now() - gun * 864e5;
  return kayitlar.filter((k) => new Date(k.created_at).getTime() >= sinir)
    .length;
}

export default async function PanelSayfasi() {
  const oturum = await adminZorunlu();

  const [sayilar, sonBasvurular] = await Promise.all([
    basvuruSayilari(),
    basvurulariGetir({ durum: "hepsi" }),
  ]);

  const bugun = bugununGunu();
  const bugunkuSeanslar = gunSlotlari(bugun);
  const kampanya = kampanyaAcikMi();
  const kalanGun = kampanyaKalanGun();

  /* Bekleyen is: aranmamis basvurular. Panelin ilk soylemesi gereken sey. */
  const bekleyen = sayilar.yeni;
  const buHafta = sonGunlerde(sonBasvurular, 7);

  const hazirModuller = MODULLER.filter((m) => m.durum === "hazir");

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/panel">
      <SayfaBasi
        baslik={`Merhaba ${oturum.adSoyad.split(" ")[0]}`}
        aciklama={`${GUN_ADI[bugun]} · ${new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" })}`}
      />

      {/* ------------------------------------------------------- sayaclar */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Sayac
          etiket="Bekleyen başvuru"
          deger={bekleyen}
          alt={bekleyen > 0 ? "aranmayı bekliyor" : "hepsi işlendi"}
          vurgu={bekleyen > 0}
        />
        <Sayac etiket="Bu hafta gelen" deger={buHafta} alt="son 7 gün" />
        <Sayac
          etiket="Bugünkü seans"
          deger={bugunkuSeanslar.length}
          alt={GUN_ADI[bugun]}
        />
        <Sayac
          etiket="Kayıt olan"
          deger={sayilar.kayit_oldu}
          alt={`${sayilar.hepsi} başvurudan`}
        />
      </div>

      {/* --- erken kayit penceresi: para ve takvimle ilgili, ustte durur --- */}
      {kampanya && (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-kart border-2 border-yesil bg-lime-rozet/25 px-5 py-3">
          <span className="font-baslik text-sm font-bold text-murekkep">
            Erken kayıt penceresi açık
          </span>
          <span className="text-sm text-murekkep-soluk">
            {KAMPANYA_PENCERESI.metin} · son gün {KAMPANYA_PENCERESI.sonGun}
            {kalanGun > 0 && ` · ${kalanGun} gün kaldı`}
          </span>
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        {/* ------------------------------------------------ son basvurular */}
        <Kutu
          baslik="Son başvurular"
          yanCocuk={
            <Link
              href="/kampus/basvurular"
              className="inline-flex items-center gap-1 text-sm font-semibold text-yesil-koyu hover:underline"
            >
              Hepsi
              <Ikon.Ok boyut={14} />
            </Link>
          }
        >
          {sonBasvurular.length === 0 ? (
            <p className="py-8 text-center text-murekkep-soluk">
              Henüz başvuru yok. Formdan gelen ilk talep burada görünecek.
            </p>
          ) : (
            <ul className="space-y-3">
              {sonBasvurular.slice(0, 4).map((b) => (
                <li key={b.id}>
                  <Link href={`/kampus/basvurular/${b.id}`} className="block">
                    <BasvuruSatiri basvuru={b} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Kutu>

        <div className="space-y-5">
          {/* ------------------------------------------ bugunku program --- */}
          <Kutu
            baslik={`Bugün · ${GUN_ADI[bugun]}`}
            yanCocuk={
              <Link
                href="/kampus/takvim"
                className="inline-flex items-center gap-1 text-sm font-semibold text-yesil-koyu hover:underline"
              >
                Takvim
                <Ikon.Ok boyut={14} />
              </Link>
            }
          >
            {bugunkuSeanslar.length === 0 ? (
              <p className="py-6 text-center text-murekkep-soluk">
                Bugün grup programı yok.
              </p>
            ) : (
              <ul className="space-y-2">
                {bugunkuSeanslar.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-start justify-between gap-3 rounded-kart border border-cizgi px-3.5 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="font-baslik text-sm font-bold text-murekkep">
                        {atolyeBul(s.atolyeSlug)?.kisaAd ?? s.atolyeSlug}
                      </p>
                      <p className="mt-0.5 text-xs text-murekkep-soluk">
                        {s.yas.etiket}
                        {s.ogretmenler.length > 0 &&
                          ` · ${s.ogretmenler.join(", ")}`}
                      </p>
                    </div>
                    <span className="shrink-0 font-baslik text-sm font-bold tabular-nums text-yesil-koyu">
                      {s.bas}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Kutu>

          {/* ------------------------------------------------- kurum ozeti */}
          <Kutu baslik="Kurum">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-murekkep-soluk">Haftalık seans</dt>
                <dd className="font-baslik text-lg font-bold text-murekkep">
                  {SLOTLAR.length}
                </dd>
              </div>
              <div>
                <dt className="text-murekkep-soluk">Öğretmen</dt>
                <dd className="font-baslik text-lg font-bold text-murekkep">
                  {EKIP.length}
                </dd>
              </div>
              <div>
                <dt className="text-murekkep-soluk">Program ailesi</dt>
                <dd className="font-baslik text-lg font-bold text-murekkep">
                  {AILELER.length}
                </dd>
              </div>
              <div>
                <dt className="text-murekkep-soluk">Açık gün</dt>
                <dd className="font-baslik text-lg font-bold text-murekkep">
                  {GUNLER.filter((g) => gunSlotlari(g).length > 0).length}
                </dd>
              </div>
            </dl>
          </Kutu>
        </div>
      </div>

      {/* --------------------------------------------------- kisayollar --- */}
      <Kutu baslik="Modüller" className="mt-5">
        <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {hazirModuller.map((m) => (
            <li key={m.slug}>
              <Link
                href={m.yol}
                className="flex h-full gap-3 rounded-kart border-2 border-cizgi px-4 py-3 transition-colors hover:border-yesil"
              >
                <span className="mt-0.5 shrink-0 text-yesil-koyu">
                  <DinamikIkon ad={m.ikon} boyut={18} />
                </span>
                <span className="min-w-0">
                  <span className="block font-baslik text-sm font-bold text-murekkep">
                    {m.ad}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-murekkep-soluk">
                    {m.ozet}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-murekkep-soluk">
          Sol menüde noktayla işaretli modüller hazırlanıyor. Açıldıklarında
          neyi beklediklerini yazıyorlar.
        </p>
      </Kutu>

      {sonBasvurular.length > 0 && (
        <p className="mt-4 text-xs text-murekkep-soluk">
          Son başvuru {gecenSure(sonBasvurular[0].created_at)} geldi.
        </p>
      )}
    </Kabuk>
  );
}
