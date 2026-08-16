import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MARKA } from "@/lib/site";
import { ATOLYELER, atolyeBul } from "@/lib/data/atolyeler";
import { SLOTLAR } from "@/lib/data/program";
import { aileBul } from "@/lib/data/gruplar";
import {
  aileOgretmenleri,
  atolyeOgretmenleri,
  ogretmenAdi,
  ogretmenSlug,
} from "@/lib/data/ekip";
import { atolyeSorulari, SORULAR } from "@/lib/data/sss";
import { DIL_ETIKET, GUN_ADI } from "@/lib/data/types";
import {
  tlYaz,
  gecerliFiyat,
  erkenKayitGosterilirMi,
  kampanyaAcikMi,
} from "@/lib/data/ucretler";
import {
  sayfaMetadata,
  ekmekKirintisiSemasi,
  kursSemasi,
  sssSemasi,
  SemaEtiketi,
} from "@/lib/seo";
import { EkmekKirintisi, SayfaBasligi } from "@/components/site/bolum-basligi";
import { Belir } from "@/components/site/bolum";
import { DinamikIkon, Ikon } from "@/components/ui/ikon";
import { ButonLink } from "@/components/ui/buton";
import { SssAkordiyon } from "@/components/site/sss-akordiyon";
import { SonCagri } from "@/components/site/son-cagri";
import { MekanSeridi } from "@/components/site/mekan-seridi";
import { SlotKarti } from "@/components/takvim/haftalik-takvim";

/** Dokuz program sayfasi tek sablondan uretiliyor. PLAN.md Bolum 5. */
/** Kampanya penceresi takvime bagli; bkz. ucretler sayfasindaki not. */
export const revalidate = 3600;

export function generateStaticParams() {
  return ATOLYELER.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = atolyeBul(slug);
  if (!a) return {};

  return sayfaMetadata({
    baslik: `${a.ad} (${a.yasEtiket})`,
    aciklama: `${a.ad}, ${a.yasEtiket}. ${MARKA.ilce}, ${MARKA.sehir}. Gün ve saatler, grup büyüklüğü, ücret ve kayıt.`,
    yol: `/oyun-evi/programlar/${a.slug}`,
  });
}

export default async function ProgramDetaySayfasi({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const atolye = atolyeBul(slug);
  if (!atolye) notFound();

  const kampanyaAcik = kampanyaAcikMi();
  const slotlar = SLOTLAR.filter((s) => s.atolyeSlug === atolye.slug);
  const aile = atolye.ailesi ? aileBul(atolye.ailesi) : undefined;
  /*
    Kendi seansi olmayan atolyeler (Serbest Oyun, Guvenli Ayrilma) icin
    takvimde ogretmen kaydi yok. Bunlar bir programin ICINDE yuruyor, o
    yuzden ailenin kadrosu gosteriliyor -- ve baslik da bunu acikca soyluyor,
    "bu programi su kisi veriyor" gibi okunmasin.
  */
  const kendiOgretmenleri = atolyeOgretmenleri(atolye.slug);
  const ogretmenler =
    kendiOgretmenleri.length || !aile
      ? kendiOgretmenleri
      : aileOgretmenleri(aile.slug);
  const kadroAileden = kendiOgretmenleri.length === 0 && ogretmenler.length > 0;
  const tekSeferMumkun = slotlar.some((s) => s.tekSeferMumkun);

  const sorular = [
    ...atolyeSorulari(atolye.slug),
    ...SORULAR.filter((s) => s.kategori === "program" && !s.atolyeler).slice(
      0,
      3,
    ),
  ];

  const kirinti = [
    { ad: "Ana sayfa", yol: "/" },
    { ad: "Oyun evi", yol: "/oyun-evi" },
    { ad: "Programlar", yol: "/oyun-evi/programlar" },
    { ad: atolye.kisaAd, yol: `/oyun-evi/programlar/${atolye.slug}` },
  ];

  const kayitYolu = aile ? `/kayit?program=${aile.slug}` : "/kayit";

  return (
    <>
      <SemaEtiketi
        sema={[
          ekmekKirintisiSemasi(kirinti),
          ...(slotlar.length
            ? [
                kursSemasi({
                  ad: atolye.ad,
                  aciklama:
                    atolye.aciklama ??
                    `${atolye.ad}, ${atolye.yasEtiket}. ${atolye.olgular[0] ?? ""}`,
                  yol: `/oyun-evi/programlar/${atolye.slug}`,
                  slotlar,
                }),
              ]
            : []),
          ...(sorular.length ? [sssSemasi(sorular)] : []),
        ]}
      />
      <EkmekKirintisi ogeler={kirinti} />

      <SayfaBasligi
        ustBaslik={atolye.yasEtiket}
        baslik={atolye.ad}
        aciklama={
          <div className="flex flex-wrap gap-2">
            {atolye.dil !== "tr" && (
              <span className="rounded-full bg-lime-rozet px-3 py-1 text-sm font-medium text-black">
                {DIL_ETIKET[atolye.dil]}
              </span>
            )}
            {tekSeferMumkun && (
              <span className="rounded-full bg-krem-koyu px-3 py-1 text-sm font-medium text-murekkep-soluk">
                Tek katılımla girilebilir
              </span>
            )}
            <span className="rounded-full bg-krem-koyu px-3 py-1 text-sm font-medium text-murekkep-soluk">
              En fazla {aile?.maxKisi ?? 8} çocuk
            </span>
          </div>
        }
        cocuklar={
          <ButonLink href={kayitYolu} olcu="lg">
            Bu programa kaydol
            <Ikon.Ok boyut={19} />
          </ButonLink>
        }
      />

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
        {/* ------------------------------------------------------- sol sutun */}
        <div className="space-y-12">
          {/* Ne yapiliyor */}
          <Belir>
            <h2 className="font-baslik text-2xl font-bold text-murekkep">
              Bu programda ne yapılıyor?
            </h2>

            {atolye.aciklama ? (
              <p className="mt-4 text-lg leading-relaxed text-murekkep-soluk">
                {atolye.aciklama}
              </p>
            ) : (
              <p className="mt-4 leading-relaxed text-murekkep-soluk">
                Programın ayrıntılı anlatımı hazırlanıyor. Aşağıdaki bilgiler
                programın kesinleşmiş çerçevesidir; merak ettiğiniz her şeyi
                formu doldurduktan sonra telefonda konuşuyoruz.
              </p>
            )}

            <ul className="mt-6 space-y-3">
              {atolye.olgular.map((o) => (
                <li
                  key={o}
                  className="flex gap-3 rounded-yumusak bg-white p-4 leading-relaxed text-murekkep"
                >
                  <Ikon.Tik boyut={19} className="mt-0.5 shrink-0 text-yesil" />
                  {o}
                </li>
              ))}
            </ul>
          </Belir>

          {/* Gun ve saatler */}
          {slotlar.length > 0 && (
            <Belir>
              <h2 className="font-baslik text-2xl font-bold text-murekkep">
                Gün ve saatler
              </h2>
              <p className="mt-2 text-murekkep-soluk">
                Haftada {slotlar.length} seans açılıyor.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {slotlar.map((s) => (
                  <div key={s.id}>
                    <p className="mb-1.5 text-sm font-semibold text-murekkep-soluk">
                      {GUN_ADI[s.gun]}
                    </p>
                    <SlotKarti slot={s} />
                  </div>
                ))}
              </div>
            </Belir>
          )}

          {/*
            Egitmenler. Liste haftalik programdan cikiyor (bkz.
            atolyeOgretmenleri), elle yazilmiyor: seansin ogretmeni
            degistiginde burasi kendiliginden dogru kaliyor.

            Ozgecmis METNI burada tekrar EDILMIYOR, yalniz bir cumlelik ozet
            duruyor ve tam metin /ekip sayfasindaki kendi bolumune baglaniyor.
            Ayni metnin iki sayfada birden durmasi arama motoru icin de
            kotu, guncelleme icin de.
          */}
          {ogretmenler.length > 0 && (
            <Belir>
              <h2 className="font-baslik text-2xl font-bold text-murekkep">
                Bu programı kim veriyor?
              </h2>
              <p className="mt-2 text-murekkep-soluk">
                {kadroAileden
                  ? `${atolye.ad}, ${aile?.ad} kapsamında yürüyor. Grubu veren öğretmenler:`
                  : ogretmenler.length === 1
                    ? "Programın öğretmeni:"
                    : `Programda ${ogretmenler.length} öğretmen görev alıyor.`}
              </p>

              <ul className="mt-6 space-y-4">
                {ogretmenler.map((o) => (
                  <li
                    key={o.ad}
                    className="flex gap-4 rounded-kart border-2 border-cizgi bg-white p-5"
                  >
                    {o.fotograf && (
                      <Image
                        src={`/ekip/${o.fotograf}.jpg`}
                        alt={ogretmenAdi(o)}
                        width={160}
                        height={160}
                        sizes="80px"
                        className="size-20 shrink-0 rounded-full bg-krem-koyu object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-baslik text-lg font-bold leading-snug text-murekkep">
                        {ogretmenAdi(o)}
                      </p>
                      <p className="text-sm font-medium text-yesil-koyu">
                        {[o.gorev, o.unvan].filter(Boolean).join(" - ")}
                      </p>
                      {o.ozet && (
                        <p className="mt-2 text-sm leading-relaxed text-murekkep-soluk">
                          {o.ozet}
                        </p>
                      )}
                      <Link
                        href={`/ekip#${ogretmenSlug(o)}`}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-yesil-koyu hover:underline"
                      >
                        Özgeçmişini oku
                        <Ikon.Ok boyut={15} />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </Belir>
          )}

          {/* Sorular */}
          {sorular.length > 0 && (
            <Belir>
              <h2 className="font-baslik text-2xl font-bold text-murekkep">
                Sık sorulanlar
              </h2>
              <div className="mt-6">
                <SssAkordiyon sorular={sorular} />
              </div>
            </Belir>
          )}
        </div>

        {/* ------------------------------------------------------- sag sutun */}
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <Belir className="rounded-kart border-2 border-cizgi bg-white p-6">
            <span className="grid size-12 place-items-center rounded-full bg-lime-rozet text-black">
              <DinamikIkon ad={atolye.ikon} boyut={24} />
            </span>

            <h2 className="mt-4 font-baslik text-xl font-bold text-murekkep">
              Özet
            </h2>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3 border-b border-cizgi pb-3">
                <dt className="text-murekkep-soluk">Yaş</dt>
                <dd className="font-medium text-murekkep">
                  {atolye.yasEtiket}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-cizgi pb-3">
                <dt className="text-murekkep-soluk">Dil</dt>
                <dd className="text-right font-medium text-murekkep">
                  {DIL_ETIKET[atolye.dil]}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-cizgi pb-3">
                <dt className="text-murekkep-soluk">Grup</dt>
                <dd className="font-medium text-murekkep">
                  En fazla {aile?.maxKisi ?? 8} çocuk
                </dd>
              </div>
              {slotlar.length > 0 && (
                <div className="flex justify-between gap-3 border-b border-cizgi pb-3">
                  <dt className="text-murekkep-soluk">Haftalık seans</dt>
                  <dd className="font-medium text-murekkep">
                    {slotlar.length}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-murekkep-soluk">Tek katılım</dt>
                <dd className="font-medium text-murekkep">
                  {tekSeferMumkun ? "Mümkün" : "Yok"}
                </dd>
              </div>
            </dl>
          </Belir>

          {/* Ucret */}
          <Belir className="rounded-kart border-2 border-cizgi bg-white p-6">
            <h2 className="font-baslik text-xl font-bold text-murekkep">
              Ücret
            </h2>

            {aile ? (
              <>
                <ul className="mt-4 space-y-2.5">
                  {aile.paketler.map((p) => (
                    <li
                      key={p.kod}
                      className="flex items-baseline justify-between gap-3 text-sm"
                    >
                      <span className="text-murekkep">{p.etiket}</span>
                      <span className="text-right">
                        {erkenKayitGosterilirMi(p, kampanyaAcik) && (
                          <s className="mr-2 text-xs text-murekkep-soluk">
                            {tlYaz(p.normal)}
                          </s>
                        )}
                        <span className="font-baslik font-bold tabular-nums text-yesil-koyu">
                          {tlYaz(gecerliFiyat(p, kampanyaAcik))}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/oyun-evi/ucretler"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-yesil-koyu underline underline-offset-2"
                >
                  Bütün ücretler ve koşullar
                  <Ikon.Ok boyut={15} />
                </Link>
              </>
            ) : (
              /* PLAN.md Bolum 14 madde 13: bu atolyelerin tek seferlik
                 ucreti Excel'de yok. Uydurulmaz. */
              <p className="mt-3 leading-relaxed text-murekkep-soluk">
                Bu atölyenin ücretini telefonda paylaşıyoruz. Formu doldurun,
                sizi arayıp netleştirelim.
              </p>
            )}

            <ButonLink href={kayitYolu} className="mt-6 w-full">
              Kayıt formunu doldur
              <Ikon.Ok boyut={18} />
            </ButonLink>
          </Belir>
        </aside>
      </div>

      <MekanSeridi />

      <div className="pt-16">
        <SonCagri
          baslik={`${atolye.kisaAd} çocuğunuza uyar mı?`}
          aciklama="Doğum tarihini girin, bu program dahil uygun bütün seçenekleri görün."
        />
      </div>
    </>
  );
}
