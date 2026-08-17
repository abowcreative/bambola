import Link from "next/link";
import { MARKA, whatsappBaglantisi, saatSatirlari, ILETISIM } from "@/lib/site";
import { sayfaMetadata } from "@/lib/seo";
import { AILELER } from "@/lib/data/gruplar";
import {
  KAMPANYA_PENCERESI,
  KAMPANYA_KOSULLARI,
  ERKEN_KAYIT_ORANI,
  kampanyaAcikMi,
  tekSeferUcreti,
} from "@/lib/data/ucretler";
import { SORULAR } from "@/lib/data/sss";
import { slotBul } from "@/lib/data/program";
import { UcretKarti } from "@/components/site/ucret-tablosu";
import { SssAkordiyon } from "@/components/site/sss-akordiyon";
import { Sirali } from "@/components/site/bolum";
import { ButonLink } from "@/components/ui/buton";
import { Ikon } from "@/components/ui/ikon";

/**
 * Tek sayfada "her sey" -- Instagram otomasyonunun gonderdigi adres.
 *
 * KALICI SAYFA, kampanya sayfasi degil. Otomasyon linki bir daha
 * degistirilmesin diye adres sabit; erken kayit kutusu yalniz kampanya
 * acikken cikiyor, 1 Eylul'de kendiliginden dusuyor ve fiyatlar normale
 * doner (`kampanyaAcikMi`). Aksi halde otomasyon 5 Eylul'de hala "indirim
 * var" diyen bir sayfa gonderirdi.
 *
 * ICERIK KOPYALANMADI. Gruplar, saatler, fiyatlar ve sorular sitenin
 * kendi sabitlerinden (AILELER, PAKETLER, SORULAR) okunuyor; fiyat bir
 * yerde degisince burasi da degisiyor. Ikinci bir metin yazilsaydi biri
 * eskir, ustelik Google iki sayfayi birbirine rakip gorurdu.
 *
 * ARAMAYA KAPALI (`indeks: false`, sitemap'te yok): trafik DM'den geliyor.
 * Indekslenseydi /oyun-evi/ucretler ile ayni sorguda yarisirdi.
 *
 * GERI SAYIM YOK (PLAN.md Bolum 3 madde 4, musteri onayi 17 Agustos 2026):
 * yalniz "son gun" tarihi yaziliyor. Tarih bilgi verir, geri sayim baski kurar.
 */

export const metadata = sayfaMetadata({
  baslik: "Gruplar, Saatler ve Ücretler",
  aciklama: `${MARKA.ad} oyun grupları ve atölyeleri: hangi yaşa hangi grup, gün ve saatler, güncel ücretler ve sık sorulan sorular.`,
  yol: "/bilgi",
  indeks: false,
});

/** Kampanya durumu SUNUCUDA hesaplanir, bkz. ucretler.ts. */
export const revalidate = 3600;

/*
  Kayit baglantisindaki kaynak etiketi. Otomasyon Instagram uzerinden
  calisiyor; form "bizi nereden duydunuz" alanini bununla ON DOLDURUYOR,
  veli degistirebiliyor. Baska bir kanaldan yayilirsa yalniz burasi degisir.
*/
const KAYNAK = "instagram";

/** Sayfada gosterilecek sorular: fiyat, kayit ve grup mantigi. */
const SECILI_SORULAR = SORULAR.filter((s) =>
  ["ucret", "kayit", "genel"].includes(s.kategori),
).slice(0, 8);

/*
  Sayfa uzun (telefonda 8000 pikselden fazla) ve DM'den gelen kisi genelde
  TEK bir sey ariyor: cogu zaman fiyat. Ustteki kisayol seridi o kisiyi
  dogrudan ilgili bolume goturuyor, bastan sona kaydirmasi gerekmiyor.
*/
const KISAYOLLAR = [
  { ad: "Gruplar", kimlik: "gruplar" },
  { ad: "Ücretler", kimlik: "ucretler" },
  { ad: "Koşullar", kimlik: "kosullar" },
  { ad: "Sorular", kimlik: "sorular" },
  { ad: "Adres ve saat", kimlik: "adres" },
];

function Bolum({
  no,
  kimlik,
  baslik,
  aciklama,
  children,
}: {
  no: string;
  kimlik: string;
  baslik: string;
  aciklama?: string;
  children: React.ReactNode;
}) {
  return (
    /* scroll-mt: sabit ust cubugun basligi kesmemesi icin. */
    <section id={kimlik} className="mt-12 scroll-mt-24 first:mt-0">
      <div className="flex items-baseline gap-3">
        <span className="font-baslik text-sm font-bold text-yesil-koyu">
          {no}
        </span>
        <h2 className="font-baslik text-2xl font-bold text-murekkep">
          {baslik}
        </h2>
      </div>
      {aciklama && (
        <p className="mt-2 leading-relaxed text-murekkep-soluk">{aciklama}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function BilgiSayfasi() {
  const kampanyaAcik = kampanyaAcikMi();
  const yuzde = Math.round(ERKEN_KAYIT_ORANI * 100);
  const wa = whatsappBaglantisi(
    kampanyaAcik
      ? `Merhaba, ${KAMPANYA_PENCERESI.sonGun}'e kadar süren erken kayıt indirimi için bilgi almak istiyorum.`
      : "Merhaba, gruplar ve ücretler hakkında bilgi almak istiyorum.",
  );
  const kayitYolu = `/kayit?kaynak=${KAYNAK}`;

  return (
    <div data-kol="oyun-evi" className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-baslik text-3xl font-bold text-murekkep sm:text-4xl">
        Gruplar, saatler ve ücretler
      </h1>
      <p className="mt-3 text-lg leading-relaxed text-murekkep-soluk">
        Aradığınız her şey bu sayfada: çocuğunuzun yaşına uygun gruplar, gün ve
        saatler, güncel ücretler ve en çok sorulanlar.
      </p>

      {/*
        Kampanya kutusu: yalniz acikken. Kapandiginda kutu yok oluyor,
        fiyat kartlari da normal fiyata donuyor -- tek kontrol, iki sonuc.
      */}
      {kampanyaAcik && (
        <div className="mt-6 rounded-blok border-2 border-yesil bg-lime-rozet/30 p-5 sm:p-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-yesil-koyu px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white">
            <Ikon.Yildiz boyut={13} />
            Erken kayıt
          </p>
          <p className="mt-3 font-baslik text-2xl font-bold text-murekkep">
            Aylık paketlerde %{yuzde} indirim
          </p>
          <p className="mt-1 font-medium text-yesil-koyu">
            Son gün {KAMPANYA_PENCERESI.sonGun}
          </p>
          <p className="mt-3 leading-relaxed text-murekkep-soluk">
            Aşağıdaki bütün fiyatlar indirimli hâliyle yazılı. Tek seferlik
            katılımda indirim uygulanmıyor.
          </p>
        </div>
      )}

      <nav aria-label="Sayfa içi kısayollar" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          {KISAYOLLAR.map((k) => (
            <li key={k.kimlik}>
              <a
                href={`#${k.kimlik}`}
                className="inline-block rounded-full border-2 border-cizgi bg-white px-3.5 py-1.5 text-sm font-semibold text-murekkep transition-colors hover:border-yesil"
              >
                {k.ad}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-10">
        <Bolum
          no="01"
          kimlik="gruplar"
          baslik="Hangi yaşa hangi grup?"
          aciklama="Çocuğunuzun ayını bilmek yeterli; gruplar yaşa göre ayrılıyor."
        >
          <ul className="space-y-4">
            {AILELER.map((a) => (
              <li
                key={a.slug}
                className="rounded-kart border-2 border-cizgi bg-white p-5"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-baslik text-lg font-bold text-murekkep">
                    {a.ad}
                  </h3>
                  <span className="rounded-full bg-krem-koyu px-2.5 py-0.5 text-xs font-semibold text-murekkep">
                    {a.yasEtiket}
                  </span>
                  <span className="text-sm text-murekkep-soluk">
                    en fazla {a.maxKisi} çocuk
                  </span>
                </div>
                <p className="mt-2 leading-relaxed text-murekkep-soluk">
                  {a.ozet}
                </p>
                <p className="mt-2 text-sm font-medium text-murekkep">
                  {a.sure}
                </p>

                {/* Gun ve saatler: velinin ikinci sorusu bu. */}
                <ul className="mt-3 space-y-1.5">
                  {a.sabitKombinasyonlar.map((k) => (
                    <li
                      key={k.etiket}
                      className="flex flex-wrap items-baseline gap-x-2 text-sm"
                    >
                      <Ikon.Saat boyut={14} className="text-yesil-koyu" />
                      <span className="text-murekkep">{k.etiket}</span>
                      {k.haftaSonu && (
                        <span className="rounded-full bg-lime-rozet px-2 py-0.5 text-xs font-semibold text-black">
                          hafta sonu
                        </span>
                      )}
                      {/*
                        Slot gercekten var mi: kombinasyon metni elle yazili
                        ama slot id'leri veriden geliyor. Biri silinirse
                        satirin yaninda sessizce yanlis saat kalmasin.
                      */}
                      {k.slotIdler.some((id) => !slotBul(id)) && (
                        <span className="text-xs text-murekkep-soluk">
                          (program güncelleniyor)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/oyun-evi/programlar/${a.slug}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-yesil-koyu hover:underline"
                >
                  Programın ayrıntısı
                  <Ikon.Ok boyut={14} />
                </Link>
              </li>
            ))}
          </ul>
        </Bolum>

        <Bolum
          no="02"
          kimlik="ucretler"
          baslik="Ücretler"
          aciklama={
            kampanyaAcik
              ? `Erken kayıt fiyatı yanında normal fiyat da yazılı. Son gün ${KAMPANYA_PENCERESI.sonGun}.`
              : "Aylık paketler ve tek seferlik katılım ücretleri."
          }
        >
          <Sirali className="grid gap-5 sm:grid-cols-2">
            {AILELER.map((a) => (
              <UcretKarti
                key={a.slug}
                aile={a}
                kampanyaAcik={kampanyaAcik}
              />
            ))}
          </Sirali>

          <div className="mt-5 rounded-kart border-2 border-dashed border-cizgi bg-white p-5">
            <p className="font-baslik font-bold text-murekkep">
              Tek seferlik katılım
            </p>
            <p className="mt-1.5 leading-relaxed text-murekkep-soluk">
              Türkçe atölyeler {tekSeferUcreti("tr").toLocaleString("tr-TR")} TL,
              İngilizce atölyeler{" "}
              {tekSeferUcreti("en").toLocaleString("tr-TR")} TL. Tek seferlik
              katılımda indirim uygulanmaz. Okula Hazırlık Gruplarında tek
              seferlik katılım yoktur.
            </p>
          </div>
        </Bolum>

        <Bolum
          no="03"
          kimlik="kosullar"
          baslik="Koşullar"
          aciklama="Ödeme, telafi ve grup büyüklüğü kuralları."
        >
          <ul className="space-y-2.5">
            {KAMPANYA_KOSULLARI.map((k) => (
              <li key={k} className="flex gap-3 leading-relaxed">
                <Ikon.Tik
                  boyut={18}
                  className="mt-0.5 shrink-0 text-yesil-koyu"
                />
                <span className="text-murekkep-soluk">{k}</span>
              </li>
            ))}
          </ul>
        </Bolum>

        <Bolum no="04" kimlik="sorular" baslik="Sık sorulanlar">
          <SssAkordiyon sorular={SECILI_SORULAR} />
          <Link
            href="/sss"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-yesil-koyu hover:underline"
          >
            Bütün sorular
            <Ikon.Ok boyut={14} />
          </Link>
        </Bolum>

        <Bolum
          no="05"
          kimlik="adres"
          baslik="Nerede, ne zaman açığız?"
          aciklama={ILETISIM.adres ?? undefined}
        >
          <dl className="space-y-1.5">
            {saatSatirlari().map((s) => (
              <div
                key={s.gunler}
                className="flex justify-between gap-4 border-b border-cizgi py-2 last:border-b-0"
              >
                <dt className="text-murekkep-soluk">{s.gunler}</dt>
                <dd className="tabular-nums font-medium text-murekkep">
                  {s.saat}
                </dd>
              </div>
            ))}
          </dl>
          <Link
            href="/iletisim"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-yesil-koyu hover:underline"
          >
            Adres ve yol tarifi
            <Ikon.Ok boyut={14} />
          </Link>
        </Bolum>
      </div>

      {/*
        Tek cagri bloku, sayfanin sonunda. Iki kanal: form talebi kayda
        geciriyor, WhatsApp konusmayi hemen basliyor. Ikisinden hangisinin
        isledigi kayit kaydindaki kaynak alanindan sayilabiliyor.
      */}
      <div className="mt-14 rounded-blok border-2 border-yesil bg-white p-6 sm:p-8">
        <h2 className="font-baslik text-2xl font-bold text-murekkep">
          Çocuğunuza uygun grubu birlikte bulalım
        </h2>
        <p className="mt-2 leading-relaxed text-murekkep-soluk">
          Formda doğum tarihini girin, yaşına uygun gruplar ve uygun saatler
          karşınıza çıkar. Birkaç dakika sürer.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButonLink href={kayitYolu}>
            Kayıt formunu doldur
            <Ikon.Ok boyut={17} />
          </ButonLink>
          {wa && (
            <ButonLink
              href={wa}
              gorunum="cizgili"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Ikon.Whatsapp boyut={17} />
              WhatsApp&apos;tan yazın
            </ButonLink>
          )}
        </div>
      </div>
    </div>
  );
}
