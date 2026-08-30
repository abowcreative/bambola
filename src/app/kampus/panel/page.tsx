import Link from "next/link";
import { adminZorunlu } from "@/lib/kampus/oturum";
import { basvurulariGetir, basvuruSayilari } from "@/lib/kampus/basvurular";
import { cariListesi, raporuGetir } from "@/lib/kampus/yoklama";
import { Kabuk, SayfaBasi, Kutu } from "@/components/kampus/kabuk";
import {
  Bildirim,
  BosDurum,
  DugmeLink,
  Rozet,
  Sayac,
} from "@/components/kampus/ui";
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
  tlYaz,
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

  const [sayilar, sonBasvurular, cari, rapor] = await Promise.all([
    basvuruSayilari(),
    basvurulariGetir({ durum: "hepsi" }),
    cariListesi(),
    raporuGetir(),
  ]);

  const bugun = bugununGunu();
  const bugunkuSeanslar = gunSlotlari(bugun);
  const kampanya = kampanyaAcikMi();
  const kalanGun = kampanyaKalanGun();

  /* Bekleyen is: aranmamis basvurular. Panelin ilk soylemesi gereken sey. */
  const bekleyen = sayilar.yeni;
  const buHafta = sonGunlerde(sonBasvurular, 7);

  const gecikmisler = cari.filter((c) => c.gecikmis);
  const acikBakiye = cari.reduce((t, c) => t + Math.max(0, c.bakiye), 0);

  const hazirModuller = MODULLER.filter((m) => m.durum === "hazir");

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/panel">
      <SayfaBasi
        baslik={`Merhaba ${oturum.adSoyad.split(" ")[0]}`}
        aciklama={`${GUN_ADI[bugun]} · ${new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" })}`}
        cocuklar={
          <DugmeLink href="/kampus/yoklama" gorunum="birincil">
            <Ikon.Tik boyut={15} />
            Bugünün yoklaması
          </DugmeLink>
        }
      />

      {/* ------------------------------------------------------- sayaclar */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Sayac
          etiket="Bekleyen başvuru"
          deger={bekleyen}
          alt={bekleyen > 0 ? "aranmayı bekliyor" : "hepsi işlendi"}
          ton={bekleyen > 0 ? "uyari" : "notr"}
          ikon={<Ikon.Posta boyut={15} />}
          yol="/kampus/basvurular"
        />
        <Sayac
          etiket="Bu hafta gelen"
          deger={buHafta}
          alt="son 7 gün · başvuru"
          ikon={<Ikon.Takvim boyut={15} />}
          yol="/kampus/basvurular?durum=hepsi"
        />
        <Sayac
          etiket="Aktif öğrenci"
          deger={rapor.aktifOgrenci}
          alt={`${rapor.toplamKayit}/${rapor.toplamKontenjan} yer dolu`}
          ikon={<Ikon.Bebek boyut={15} />}
          yol="/kampus/ogrenciler"
        />
        <Sayac
          etiket="Açık bakiye"
          deger={tlYaz(acikBakiye)}
          alt={
            gecikmisler.length > 0
              ? `${gecikmisler.length} öğrencide vadesi geçmiş`
              : "vadesi geçen yok"
          }
          ton={gecikmisler.length > 0 ? "tehlike" : "notr"}
          ikon={<Ikon.Rozet boyut={15} />}
          yol="/kampus/tahsilat"
        />
      </div>

      {/* --- erken kayit penceresi: para ve takvimle ilgili, ustte durur --- */}
      {kampanya && (
        <Bildirim
          ton="vurgu"
          className="mt-3"
          ikon={<Ikon.Yildiz boyut={16} />}
          baslik="Erken kayıt penceresi açık"
        >
          {KAMPANYA_PENCERESI.metin} · son gün {KAMPANYA_PENCERESI.sonGun}
          {kalanGun > 0 && ` · ${kalanGun} gün kaldı`}
        </Bildirim>
      )}

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        {/* ------------------------------------------------ son basvurular */}
        <Kutu
          baslik="Son başvurular"
          yanCocuk={
            <Link
              href="/kampus/basvurular"
              className="inline-flex items-center gap-1 text-xs font-semibold text-yesil-derin hover:underline"
            >
              Hepsi
              <Ikon.Ok boyut={13} />
            </Link>
          }
        >
          {sonBasvurular.length === 0 ? (
            <BosDurum
              baslik="Henüz başvuru yok"
              aciklama="Formdan gelen ilk talep burada görünecek."
              ikon={<Ikon.Posta boyut={22} />}
              className="border-0 bg-transparent py-8"
            />
          ) : (
            <ul className="space-y-2.5">
              {sonBasvurular.slice(0, 4).map((b) => (
                <li key={b.id}>
                  <Link href={`/kampus/basvurular/${b.id}`} className="block">
                    <BasvuruSatiri basvuru={b} />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {sonBasvurular.length > 0 && (
            <p className="mt-3 text-xs text-panel-silik">
              Son başvuru {gecenSure(sonBasvurular[0].created_at)} geldi.
            </p>
          )}
        </Kutu>

        <div className="space-y-4">
          {/* ------------------------------------------ bugunku program --- */}
          <Kutu
            baslik={`Bugün · ${GUN_ADI[bugun]}`}
            yanCocuk={
              <Link
                href="/kampus/takvim"
                className="inline-flex items-center gap-1 text-xs font-semibold text-yesil-derin hover:underline"
              >
                Takvim
                <Ikon.Ok boyut={13} />
              </Link>
            }
            dolgusuz
          >
            {bugunkuSeanslar.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-panel-soluk">
                Bugün grup programı yok.
              </p>
            ) : (
              <ul className="divide-y divide-panel-cizgi">
                {bugunkuSeanslar.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-start gap-3 px-4 py-2.5"
                  >
                    <span className="w-11 shrink-0 font-baslik text-sm font-bold tabular-nums text-yesil-derin">
                      {s.bas}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-murekkep">
                        {atolyeBul(s.atolyeSlug)?.kisaAd ?? s.atolyeSlug}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-panel-soluk">
                        {s.yas.etiket}
                        {s.ogretmenler.length > 0 &&
                          ` · ${s.ogretmenler.join(", ")}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Kutu>

          {/* -------------------------------------- gecikmis tahsilatlar --- */}
          {gecikmisler.length > 0 && (
            <Kutu
              baslik="Vadesi geçmiş"
              yanCocuk={
                <Link
                  href="/kampus/tahsilat"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-yesil-derin hover:underline"
                >
                  Tahsilat
                  <Ikon.Ok boyut={13} />
                </Link>
              }
              dolgusuz
            >
              <ul className="divide-y divide-panel-cizgi">
                {gecikmisler.slice(0, 5).map((c) => (
                  <li key={c.ogrenci.id}>
                    <Link
                      href={`/kampus/ogrenciler/${c.ogrenci.id}`}
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-panel-yuzey-alt"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-murekkep">
                        {c.ogrenci.ad} {c.ogrenci.soyad ?? ""}
                      </span>
                      <Rozet ton="tehlike">{tlYaz(c.bakiye)}</Rozet>
                    </Link>
                  </li>
                ))}
              </ul>
            </Kutu>
          )}

          {/* ------------------------------------------------- kurum ozeti */}
          <Kutu baslik="Kurum">
            <dl className="grid grid-cols-2 gap-3">
              {(
                [
                  ["Haftalık seans", SLOTLAR.length],
                  ["Öğretmen", EKIP.length],
                  ["Program ailesi", AILELER.length],
                  [
                    "Açık gün",
                    GUNLER.filter((g) => gunSlotlari(g).length > 0).length,
                  ],
                ] as const
              ).map(([etiket, deger]) => (
                <div key={etiket}>
                  <dt className="text-xs text-panel-soluk">{etiket}</dt>
                  <dd className="font-baslik text-lg font-bold tabular-nums text-murekkep">
                    {deger}
                  </dd>
                </div>
              ))}
            </dl>
          </Kutu>
        </div>
      </div>

      {/* --------------------------------------------------- kisayollar --- */}
      <Kutu
        baslik="Modüller"
        aciklama="Sol menüde noktayla işaretli modüller hazırlanıyor."
        className="mt-4"
      >
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {hazirModuller.map((m) => (
            <li key={m.slug}>
              <Link
                href={m.yol}
                className="flex h-full gap-3 rounded-panel-sm border border-panel-cizgi px-3.5 py-2.5 transition-colors hover:border-yesil-koyu/40 hover:bg-panel-yuzey-alt"
              >
                <span className="mt-0.5 shrink-0 text-panel-silik">
                  <DinamikIkon ad={m.ikon} boyut={17} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-murekkep">
                    {m.ad}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-panel-soluk">
                    {m.ozet}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Kutu>
    </Kabuk>
  );
}
