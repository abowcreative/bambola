import Link from "next/link";
import { MARKA, saatSatirlari, ILETISIM } from "@/lib/site";
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
import {
  DONEM_GRUPLARI,
  DONEM_DUYURUSU,
  donemKaydiAcikMi,
} from "@/lib/data/donem";
import { UcretKarti } from "@/components/site/ucret-tablosu";
import { SssAkordiyon } from "@/components/site/sss-akordiyon";
import { Sirali, SiraliOge } from "@/components/site/bolum";
import {
  BilgiCagrisi,
  KayitYakindaNotu,
} from "@/components/site/bilgi-cagrisi";
import { DinamikIkon, Ikon } from "@/components/ui/ikon";
import { FotoMozaik } from "@/components/site/foto-mozaik";

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
  aciklama: `${MARKA.ad} oyun grupları ve atölyeleri: hangi yaşa hangi grup, hangi günler açık, güncel ücretler ve sık sorulan sorular.`,
  yol: "/bilgi",
  indeks: false,
});

/** Kampanya durumu SUNUCUDA hesaplanir, bkz. ucretler.ts. */
export const revalidate = 3600;

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
  /* Eylul donemi duyurusu 25 Agustos'tan sonra kendiliginden dusuyor. */
  const donemKaydiAcik = donemKaydiAcikMi();
  const yuzde = Math.round(ERKEN_KAYIT_ORANI * 100);

  return (
    <div data-kol="oyun-evi" className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-baslik text-3xl font-bold text-murekkep sm:text-4xl">
        Gruplar, saatler ve ücretler
      </h1>
      <p className="mt-3 text-lg leading-relaxed text-murekkep-soluk">
        Aradığınız her şey bu sayfada: çocuğunuzun yaşına uygun gruplar, hangi
        günler açık, güncel ücretler ve en çok sorulanlar.
      </p>

      {/*
        Mekan kareleri EN USTTE, kampanya kutusunun bile ustunde.
        DM'den gelen veli once "burasi neresi" diye bakiyor; onceden kareler
        sayfanin ortasindaydi ve o soru 4000 piksel sonra cevaplaniyordu.
      */}
      <div className="mt-6">
        <FotoMozaik />
      </div>

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
        {/*
          Gruplar DONEM_GRUPLARI'ndan basiliyor, AILELER'den degil
          (musteri revizesi, 18 Agustos 2026). Gerekcesi data/donem.ts
          basindaki notta; ozeti: bir kisim grup artik saat yazmiyor ve
          bebek grubu ucret ailesi bolunmeden ikiye ayriliyor. Asagidaki
          UCRET bolumu hala AILELER'den okuyor, fiyat tek kaynakta.
        */}
        <Bolum
          no="01"
          kimlik="gruplar"
          baslik="Hangi yaşa hangi grup?"
          aciklama="Gruplar yaşa göre ayrılıyor. Gün ve saatleri çocuğunuza uyacak şekilde birlikte belirliyoruz."
        >
          {/*
            Iki sutun. Kartlar onceden tam genislikte alt alta diziliyordu ve
            sayfa max-w-3xl oldugu icin her kartin sagi bos kaliyordu; ustelik
            bes kart tek sutunda 8000 piksellik sayfayi daha da uzatiyordu.
            Telefonda tek sutuna dusuyor.

            Hareket sitenin kendi idiomu: Sirali/SiraliOge sirayla yaylanarak
            girer, kart uzerine gelince kalkar, ikon `oyna` ile titrer
            (bkz. /oyun-evi/programlar kartlari, globals.css .oyna).
          */}
          <Sirali className="grid gap-4 sm:grid-cols-2">
            {DONEM_GRUPLARI.map((g) => (
              <SiraliOge
                key={g.slug}
                className={g.genis ? "sm:col-span-2" : undefined}
              >
                <div className="group flex h-full flex-col rounded-kart border-2 border-cizgi bg-white p-5 transition-all duration-200 ease-yayli hover:-translate-y-1.5 hover:border-yesil hover:shadow-kart-hover">
                  <div className="flex items-start gap-3">
                    <span className="oyna grid size-12 shrink-0 place-items-center rounded-full bg-lime-rozet text-black">
                      <DinamikIkon ad={g.ikon} boyut={24} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-baslik text-lg font-bold leading-snug text-murekkep">
                        {g.ad}
                      </h3>
                      {/*
                        Birden fazla yas bandi varsa tek etiket yerine
                        bantlarin kendisi yaziliyor; "12 ay ve uzeri" velinin
                        aradigi bandi gizlerdi.
                      */}
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {(g.yasBantlari.length > 0
                          ? g.yasBantlari
                          : [g.yasEtiket]
                        ).map((b) => (
                          <span
                            key={b}
                            className="rounded-full bg-krem-koyu px-2.5 py-0.5 text-xs font-semibold text-murekkep"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/*
                    Durum rozeti kartin kendi satirinda: baslik hizasina
                    konsaydi dar sutunda basligi asagi itiyordu.
                    Nokta sabit, yanip sonmuyor -- PLAN Bolum 3 madde 4,
                    "tarih bilgi verir, geri sayim baski kurar".
                  */}
                  {g.durum && (
                    <p
                      className={`mt-3 inline-flex self-start items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
                        g.durum.ton === "vurgu"
                          ? "bg-yesil-koyu text-white"
                          : "bg-krem-koyu text-murekkep"
                      }`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {g.durum.etiket}
                    </p>
                  )}

                  {/* flex-1: cagri kartin dibine yapisiyor, boylece yan yana
                      duran iki kartin dugmeleri ayni hizada. */}
                  <div
                    className={`mt-4 flex-1 text-sm ${
                      g.genis
                        ? "grid gap-x-8 gap-y-1.5 sm:grid-cols-2"
                        : "space-y-1.5"
                    }`}
                  >
                    {g.gunler && (
                      <p className="flex items-baseline gap-2 text-murekkep">
                        <Ikon.Takvim
                          boyut={14}
                          className="shrink-0 text-yesil-koyu"
                        />
                        {g.gunler}
                      </p>
                    )}
                    {/* Saat YALNIZCA veride yaziliysa cikiyor; revizede
                        yalniz Okula Hazirlik saat tasiyor. */}
                    {g.saatler.map((s) => (
                      <p
                        key={s}
                        className="flex items-baseline gap-2 text-murekkep"
                      >
                        <Ikon.Saat
                          boyut={14}
                          className="shrink-0 text-yesil-koyu"
                        />
                        {s}
                      </p>
                    ))}
                    {g.secenek && (
                      <p className="flex items-baseline gap-2 text-murekkep">
                        <Ikon.Tik
                          boyut={14}
                          className="shrink-0 text-yesil-koyu"
                        />
                        {g.secenek}
                      </p>
                    )}
                    {/*
                      Saat yoksa bosluk birakilmiyor: veli "saat neden
                      yazmiyor" diye dusunmesin, ne yapacagini okusun.
                    */}
                    {g.saatler.length === 0 && (
                      <p className="leading-relaxed text-murekkep-soluk">
                        {g.gunler ? "Saatleri" : "Gün ve saatleri"}{" "}
                        WhatsApp&apos;tan paylaşıyoruz; çocuğunuza uyan zamanı
                        birlikte belirliyoruz.
                      </p>
                    )}
                  </div>

                  {/* Donem duyurusu 25 Agustos'tan sonra kendiliginden duser. */}
                  {g.donemDuyurusu && donemKaydiAcik && (
                    <p className="mt-4 rounded-yumusak border-2 border-lime-rozet bg-lime-rozet/40 px-3 py-2 text-sm font-semibold leading-snug text-murekkep">
                      {DONEM_DUYURUSU.baslik}
                      <span className="block font-medium text-murekkep-soluk">
                        Son kayıt {DONEM_DUYURUSU.sonKayitMetin}
                      </span>
                    </p>
                  )}

                  <div className="mt-5 border-t border-cizgi pt-4">
                    <BilgiCagrisi
                      donem={g.slug}
                      nereden="bilgi"
                      metin="Detaylı bilgi için bize ulaşın"
                      olcu="sm"
                      className="w-full"
                    />
                    {/*
                      ATOLYE slug'i, aile slug'i degil: program sayfalari
                      atolye slug'lariyla uretiliyor ve aile slug'i verilirse
                      404 doner (musteri bildirdi, 17 Agustos 2026).
                    */}
                    {g.programSayfasi && (
                      <Link
                        href={`/oyun-evi/programlar/${g.programSayfasi}`}
                        className="mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-yesil-koyu hover:underline"
                      >
                        Programın ayrıntısı
                        <Ikon.Ok boyut={14} />
                      </Link>
                    )}
                  </div>
                </div>
              </SiraliOge>
            ))}
          </Sirali>
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
                nereden="bilgi"
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

        {/*
          Kurum kareleri eskiden BURADAYDI (fiyattan sonra, kosullardan
          once) ve sonsuz kayan bir seritti -- musteri istegi, 17 Agustos
          2026. 18 Agustos'ta sayfanin en ustune, duran bir mozaige tasindi;
          gerekcesi components/site/foto-mozaik.tsx basinda. Kayan serit
          bileseni (FotoKaydiragi) duruyor, geri istenirse yerine konur.
        */}
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
          Çocuğunuzun yaşını yazın; uygun grupları, gün ve saatleri
          WhatsApp&apos;tan birlikte konuşalım.
        </p>
        <KayitYakindaNotu ton="acik" className="mt-2" />
        {/*
          TEK cagri: ikisi de WhatsApp'a gittigi icin yan yana iki dugme
          gereksizdi. Bu dugme sayac rotasindan geciyor, digeri gecmiyordu.
        */}
        <div className="mt-6">
          <BilgiCagrisi metin="Detaylı bilgi al" nereden="bilgi" olcu="md" />
        </div>
      </div>
    </div>
  );
}
