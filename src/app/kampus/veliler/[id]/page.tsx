import Link from "next/link";
import { notFound } from "next/navigation";
import { adminZorunlu } from "@/lib/kampus/oturum";
import { sunucuIstemcisi } from "@/lib/supabase/server";
import {
  veliGetir,
  velininCocuklari,
  ogrenciAdi,
  OGRENCI_DURUM_ETIKET,
  YAKINLIK_ETIKET,
} from "@/lib/kampus/ogrenciler";
import { Kabuk, Kutu, GeriBaglantisi } from "@/components/kampus/kabuk";
import { Rozet, Sayac, Satir } from "@/components/kampus/ui";
import { VeliFormu, VeliHesapBagla } from "@/components/kampus/veli-formu";
import { OGRENCI_TONU } from "@/lib/kampus/tonlar";
import { telefonYaz } from "@/components/kampus/basvuru-satiri";
import { yasMetni, ayHesapla } from "@/lib/yas";
import { tlYaz } from "@/lib/data/ucretler";
import { Ikon } from "@/components/ui/ikon";

export const metadata = { title: "Veli", robots: { index: false } };
export const dynamic = "force-dynamic";

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

  const db = await sunucuIstemcisi();
  const [cocuklar, { data: hesapVerisi }] = await Promise.all([
    velininCocuklari(id),
    /* Baglanabilecek panel hesaplari: yalniz "veli" rolu. Ogretmen ya da
       yonetici hesabini veli kaydina baglamak, o kisiye RLS uzerinden
       baska bir ailenin verisini acardi. */
    db
      .from("profiller")
      .select("id, ad_soyad")
      .eq("rol", "veli")
      .eq("aktif", true)
      .order("ad_soyad"),
  ]);

  const hesaplar = (hesapVerisi ?? []) as { id: string; ad_soyad: string }[];
  const toplamBakiye = cocuklar.reduce((t, c) => t + c.bakiye, 0);
  const aktifCocuk = cocuklar.filter((c) => c.ogrenci.durum === "aktif").length;

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/veliler">
      <GeriBaglantisi yol="/kampus/veliler" etiket="Veliler" />

      <div className="mt-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-baslik text-xl font-bold text-murekkep sm:text-2xl">
              {veli.ad_soyad}
            </h1>
            {veli.profil_id ? (
              <Rozet ton="basari">Panel hesabı var</Rozet>
            ) : (
              <Rozet ton="sessiz">Panel hesabı yok</Rozet>
            )}
          </div>
          <p className="mt-1 text-sm text-panel-soluk">
            {cocuklar.length === 0
              ? "Bağlı çocuk kaydı yok"
              : cocuklar.map((c) => ogrenciAdi(c.ogrenci)).join(", ")}
          </p>
        </div>

        <VeliFormu
          veli={{
            id: veli.id,
            ad_soyad: veli.ad_soyad,
            telefon: veli.telefon,
            eposta: veli.eposta,
            adres: veli.adres,
            notlar: veli.notlar,
          }}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Sayac
          etiket="Çocuk"
          deger={cocuklar.length}
          alt={`${aktifCocuk} aktif`}
        />
        <Sayac
          etiket="Aile bakiyesi"
          deger={tlYaz(toplamBakiye)}
          alt={toplamBakiye > 0 ? "borç var" : "borç yok"}
          ton={toplamBakiye > 0 ? "uyari" : "notr"}
        />
        <Sayac
          etiket="Aktif sınıf"
          deger={cocuklar.reduce((t, c) => t + c.siniflar.length, 0)}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Kutu baslik="Çocuklar" dolgusuz>
          {cocuklar.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-panel-soluk">
              Bu veliye bağlı çocuk kaydı yok. Bağlantı öğrenci kartından
              kurulur.
            </p>
          ) : (
            <ul className="divide-y divide-panel-cizgi">
              {cocuklar.map((c) => (
                <li key={c.ogrenci.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <Link
                      href={`/kampus/ogrenciler/${c.ogrenci.id}`}
                      className="text-sm font-semibold text-murekkep hover:text-yesil-derin hover:underline"
                    >
                      {ogrenciAdi(c.ogrenci)}
                    </Link>
                    <Rozet>
                      {YAKINLIK_ETIKET[c.yakinlik] ?? c.yakinlik}
                      {c.birincil && " · birincil"}
                    </Rozet>
                    <span className="ml-auto">
                      <Rozet ton={OGRENCI_TONU[c.ogrenci.durum] ?? "notr"}>
                        {OGRENCI_DURUM_ETIKET[c.ogrenci.durum]}
                      </Rozet>
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-panel-soluk">
                    {yasMetni(ayHesapla(c.ogrenci.dogum_tarihi))}
                    {c.bakiye !== 0 && ` · bakiye ${tlYaz(c.bakiye)}`}
                  </p>

                  {c.ogrenci.alerji && (
                    <p className="mt-1.5">
                      <Rozet ton="uyari" ikon={<Ikon.Kalp boyut={11} />}>
                        Alerji: {c.ogrenci.alerji}
                      </Rozet>
                    </p>
                  )}

                  {c.siniflar.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5">
                      {c.siniflar.map((s) => (
                        <li key={s.id} className="text-xs">
                          <Link
                            href={`/kampus/siniflar/${s.id}`}
                            className="font-medium text-yesil-derin hover:underline"
                          >
                            {s.ad}
                          </Link>
                          {/*
                            Gun ve saat `s.ad` icinde zaten var; yaninda
                            tekrar yazilmiyor. Ogretmen adi ekleniyor:
                            veli en cok onu soruyor.
                          */}
                          {s.ogretmen_ad && (
                            <span className="ml-1.5 text-panel-silik">
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

        <aside className="space-y-4">
          <Kutu baslik="İletişim">
            <div className="space-y-2">
              <a
                href={`tel:0${veli.telefon}`}
                className="flex items-center gap-2.5 text-sm font-medium text-yesil-derin hover:underline"
              >
                <Ikon.Telefon boyut={15} />
                {telefonYaz(veli.telefon)}
              </a>
              <a
                href={`https://wa.me/90${veli.telefon}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 text-sm font-medium text-yesil-derin hover:underline"
              >
                <Ikon.Whatsapp boyut={15} />
                WhatsApp&apos;tan yaz
              </a>
              {veli.eposta && (
                <a
                  href={`mailto:${veli.eposta}`}
                  className="flex items-center gap-2.5 break-all text-sm font-medium text-yesil-derin hover:underline"
                >
                  <Ikon.Posta boyut={15} />
                  {veli.eposta}
                </a>
              )}
              {veli.adres && (
                <p className="flex items-start gap-2.5 text-sm leading-relaxed text-panel-soluk">
                  <span className="mt-0.5 shrink-0">
                    <Ikon.Konum boyut={15} />
                  </span>
                  {veli.adres}
                </p>
              )}
            </div>
          </Kutu>

          <Kutu
            baslik="Panel hesabı"
            aciklama="Veli kendi çocuğunu ancak bağlı bir hesapla görebilir."
          >
            <VeliHesapBagla
              veliId={veli.id}
              seciliProfilId={veli.profil_id}
              hesaplar={hesaplar}
            />
          </Kutu>

          {veli.notlar && (
            <Kutu baslik="Notlar">
              <p className="whitespace-pre-line text-sm leading-relaxed text-panel-soluk">
                {veli.notlar}
              </p>
            </Kutu>
          )}

          <Kutu baslik="Kayıt">
            <dl>
              <Satir etiket="Çocuk sayısı">{cocuklar.length}</Satir>
              <Satir etiket="Aktif sınıf">
                {cocuklar.reduce((t, c) => t + c.siniflar.length, 0)}
              </Satir>
            </dl>
          </Kutu>
        </aside>
      </div>
    </Kabuk>
  );
}
