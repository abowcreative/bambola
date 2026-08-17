import Link from "next/link";
import { notFound } from "next/navigation";
import { adminZorunlu } from "@/lib/kampus/oturum";
import {
  veliGetir,
  velininCocuklari,
  ogrenciAdi,
  OGRENCI_DURUM_ETIKET,
  YAKINLIK_ETIKET,
} from "@/lib/kampus/ogrenciler";
import { Kabuk, Kutu, Sayac } from "@/components/kampus/kabuk";
import { telefonYaz } from "@/components/kampus/basvuru-satiri";
import { yasMetni, ayHesapla } from "@/lib/yas";
import { Ikon } from "@/components/ui/ikon";

export const metadata = { title: "Veli", robots: { index: false } };
export const dynamic = "force-dynamic";

const paraYaz = (n: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(n);

/**
 * Veli detayi.
 *
 * Bu sayfa modulleri birbirine baglayan dugum: velinin cocuklari, o
 * cocuklarin sinif ve gunleri, ailenin toplam bakiyesi ve iletisim bilgisi
 * tek ekranda. "Ayse Hanim aradi" dendiginde tek yerden bakiliyor.
 */
export default async function VeliDetaySayfasi({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const oturum = await adminZorunlu();
  const { id } = await params;

  const veli = await veliGetir(id);
  if (!veli) notFound();

  const cocuklar = await velininCocuklari(id);
  const toplamBakiye = cocuklar.reduce((t, c) => t + c.bakiye, 0);
  const aktifCocuk = cocuklar.filter(
    (c) => c.ogrenci.durum === "aktif",
  ).length;

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/veliler">
      <Link
        href="/kampus/veliler"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-yesil-koyu hover:underline"
      >
        <Ikon.OkGeri boyut={16} />
        Veliler
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-baslik text-2xl font-bold text-murekkep">
          {veli.ad_soyad}
        </h1>
        {veli.profil_id ? (
          <span className="rounded-full bg-lime-rozet px-3 py-1 text-xs font-bold text-black">
            Panel hesabı var
          </span>
        ) : (
          <span className="rounded-full bg-cizgi px-3 py-1 text-xs font-bold text-murekkep-soluk">
            Panel hesabı yok
          </span>
        )}
      </div>
      <p className="mt-1 text-murekkep-soluk">
        {cocuklar.length === 0
          ? "Bağlı çocuk kaydı yok"
          : cocuklar.map((c) => ogrenciAdi(c.ogrenci)).join(", ")}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Sayac
          etiket="Çocuk"
          deger={cocuklar.length}
          alt={`${aktifCocuk} aktif`}
        />
        <Sayac
          etiket="Aile bakiyesi"
          deger={paraYaz(toplamBakiye)}
          alt={toplamBakiye > 0 ? "borç var" : "borç yok"}
          vurgu={toplamBakiye > 0}
        />
        <Sayac
          etiket="Aktif sınıf"
          deger={cocuklar.reduce((t, c) => t + c.siniflar.length, 0)}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Kutu baslik="Çocuklar">
          {cocuklar.length === 0 ? (
            <p className="py-6 text-center text-murekkep-soluk">
              Bu veliye bağlı çocuk kaydı yok.
            </p>
          ) : (
            <ul className="space-y-3">
              {cocuklar.map((c) => (
                <li
                  key={c.ogrenci.id}
                  className="rounded-kart border-2 border-cizgi px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Link
                      href={`/kampus/ogrenciler/${c.ogrenci.id}`}
                      className="font-baslik text-sm font-bold text-murekkep hover:underline"
                    >
                      {ogrenciAdi(c.ogrenci)}
                    </Link>
                    <span className="rounded-full bg-krem-koyu px-2 py-0.5 text-xs font-semibold text-murekkep">
                      {YAKINLIK_ETIKET[c.yakinlik] ?? c.yakinlik}
                      {c.birincil && " · birincil"}
                    </span>
                    <span className="ml-auto text-xs text-murekkep-soluk">
                      {OGRENCI_DURUM_ETIKET[c.ogrenci.durum]}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-murekkep-soluk">
                    {yasMetni(ayHesapla(c.ogrenci.dogum_tarihi))}
                    {c.bakiye !== 0 && ` · bakiye ${paraYaz(c.bakiye)}`}
                  </p>

                  {c.ogrenci.alerji && (
                    <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-lime-rozet/40 px-2.5 py-0.5 text-xs font-semibold text-murekkep">
                      <Ikon.Kalp boyut={12} />
                      Alerji: {c.ogrenci.alerji}
                    </p>
                  )}

                  {c.siniflar.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {c.siniflar.map((s) => (
                        <li key={s.id} className="text-xs">
                          <Link
                            href={`/kampus/siniflar/${s.id}`}
                            className="font-medium text-yesil-koyu hover:underline"
                          >
                            {s.ad}
                          </Link>
                          {/*
                            Gun ve saat `s.ad` icinde zaten var; yaninda
                            tekrar yazilmiyor. Ogretmen adi ekleniyor:
                            veli en cok onu soruyor.
                          */}
                          {s.ogretmen_ad && (
                            <span className="ml-1.5 text-murekkep-soluk">
                              {s.ogretmen_ad}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Kutu>

        <aside className="space-y-5">
          <Kutu baslik="İletişim">
            <div className="space-y-2.5">
              <a
                href={`tel:0${veli.telefon}`}
                className="flex items-center gap-2.5 text-sm font-medium text-yesil-koyu hover:underline"
              >
                <Ikon.Telefon boyut={16} />
                {telefonYaz(veli.telefon)}
              </a>
              <a
                href={`https://wa.me/90${veli.telefon}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 text-sm font-medium text-yesil-koyu hover:underline"
              >
                <Ikon.Whatsapp boyut={16} />
                WhatsApp&apos;tan yaz
              </a>
              {veli.eposta && (
                <a
                  href={`mailto:${veli.eposta}`}
                  className="flex items-center gap-2.5 break-all text-sm font-medium text-yesil-koyu hover:underline"
                >
                  <Ikon.Posta boyut={16} />
                  {veli.eposta}
                </a>
              )}
              {veli.adres && (
                <p className="flex items-start gap-2.5 text-sm leading-relaxed text-murekkep-soluk">
                  <span className="mt-0.5 shrink-0">
                    <Ikon.Konum boyut={16} />
                  </span>
                  {veli.adres}
                </p>
              )}
            </div>

            {!veli.profil_id && (
              <p className="mt-4 border-t border-cizgi pt-3 text-xs leading-relaxed text-murekkep-soluk">
                Veli panele girip çocuğunun yoklamasını ve ödemelerini
                görebilsin isterseniz hesabı{" "}
                <code className="text-murekkep">npm run kampus:kullanici</code>{" "}
                ile açılıp bu kayda bağlanır.
              </p>
            )}
          </Kutu>

          {veli.notlar && (
            <Kutu baslik="Notlar">
              <p className="whitespace-pre-line leading-relaxed text-murekkep-soluk">
                {veli.notlar}
              </p>
            </Kutu>
          )}
        </aside>
      </div>
    </Kabuk>
  );
}
