import {
  ILETISIM,
  MARKA,
  napAdi,
  saatSatirlari,
  whatsappBaglantisi,
  yolTarifiBaglantisi,
} from "@/lib/site";
import Link from "next/link";
import {
  sayfaMetadata,
  ekmekKirintisiSemasi,
  kurumSemasi,
  SemaEtiketi,
} from "@/lib/seo";
import { EkmekKirintisi, SayfaBasligi } from "@/components/site/bolum-basligi";
import { Belir } from "@/components/site/bolum";
import { ButonLink } from "@/components/ui/buton";
import { Ikon } from "@/components/ui/ikon";
import { GUNLER, GUN_ADI } from "@/lib/data/types";
import { gunSlotlari, PAZAR_NOTU } from "@/lib/data/program";
import { Foto } from "@/components/site/foto";
import { foto } from "@/lib/data/fotograflar";
import { HaritaKutusu } from "@/components/site/harita-kutusu";

export const metadata = sayfaMetadata({
  baslik: "İletişim ve Ulaşım",
  aciklama: `${MARKA.ad}, ${MARKA.ilce}, ${MARKA.sehir}. Adres, telefon, çalışma saatleri ve ulaşım. Kayıt için formu doldurabilirsiniz.`,
  yol: "/iletisim",
});

const KIRINTI = [
  { ad: "Ana sayfa", yol: "/" },
  { ad: "İletişim", yol: "/iletisim" },
];

/** Calisma saatleri programdan uretilir, elle yazilmaz. PLAN.md Bolum 5. */
function calismaSaatleri() {
  return GUNLER.map((g) => {
    const slotlar = gunSlotlari(g);
    if (!slotlar.length) return { gun: g, metin: null };
    const ilk = slotlar.reduce(
      (a, s) => (s.bas < a ? s.bas : a),
      slotlar[0].bas,
    );
    const son = slotlar.reduce(
      (a, s) => (s.bit > a ? s.bit : a),
      slotlar[0].bit,
    );
    return { gun: g, metin: `${ilk} - ${son}` };
  });
}

export default function IletisimSayfasi() {
  const wa = whatsappBaglantisi(
    "Merhaba, Bambola hakkında bilgi almak istiyorum.",
  );
  const saatler = calismaSaatleri();
  const tarif = yolTarifiBaglantisi();
  const kanalVar = Boolean(
    ILETISIM.telefon || ILETISIM.eposta || wa || ILETISIM.instagram,
  );

  return (
    <>
      <SemaEtiketi sema={[ekmekKirintisiSemasi(KIRINTI), kurumSemasi()]} />
      <EkmekKirintisi ogeler={KIRINTI} />

      <SayfaBasligi
        ustBaslik="İletişim"
        baslik="Bize ulaşın"
        aciklama={`${MARKA.ilce}, ${MARKA.sehir}. En hızlı yol kayıt formunu doldurmak: talebiniz elimize ulaşır ulaşmaz sizi arıyoruz.`}
        cocuklar={
          <ButonLink href="/kayit" olcu="lg">
            Kayıt formunu doldur
            <Ikon.Ok boyut={19} />
          </ButonLink>
        }
      />

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        {/*
          Ust sira iki kisa sutun: kanallar ve saatler. Ikisi de aliniyor,
          bu yuzden yakin boyda; harita ve ulasim ASAGIDAKI serit bloguna
          alindi. Onceki halde harita sag sutunun icindeydi ve o sutunu tek
          basina uzatiyordu -- sol sutun bitince altinda kocaman bir bosluk
          kaliyordu.
        */}
        <div className="grid gap-10 lg:grid-cols-2">
          {/* --- kanallar --- */}
          <Belir>
            <h2 className="font-baslik text-2xl font-bold text-murekkep">
              İletişim bilgileri
            </h2>

            <address className="mt-6 space-y-4 not-italic">
              <div className="flex gap-4 rounded-kart border-2 border-cizgi bg-white p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-lime-rozet text-black">
                  <Ikon.Konum boyut={22} />
                </span>
                <div className="min-w-0">
                  <p className="font-baslik font-bold text-murekkep">Adres</p>
                  <p className="mt-1 text-murekkep-soluk">
                    {ILETISIM.adres ?? `${MARKA.ilce}, ${MARKA.sehir}`}
                  </p>
                  {/* NAP adi footer'dakiyle ayni olmali, bkz. napAdi(). */}
                  <p className="mt-2 text-sm text-murekkep-soluk">
                    {napAdi()}
                  </p>
                </div>
              </div>

              {ILETISIM.telefon && (
                <a
                  href={`tel:${ILETISIM.telefon.replace(/\s/g, "")}`}
                  className="flex gap-4 rounded-kart border-2 border-cizgi bg-white p-5 transition-colors hover:border-yesil"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-lime-rozet text-black">
                    <Ikon.Telefon boyut={22} />
                  </span>
                  <span>
                    <span className="block font-baslik font-bold text-murekkep">
                      Telefon
                    </span>
                    <span className="mt-1 block text-murekkep-soluk">
                      {ILETISIM.telefon}
                    </span>
                  </span>
                </a>
              )}

              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-4 rounded-kart border-2 border-cizgi bg-white p-5 transition-colors hover:border-yesil"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-lime-rozet text-black">
                    <Ikon.Whatsapp boyut={22} />
                  </span>
                  <span>
                    <span className="block font-baslik font-bold text-murekkep">
                      WhatsApp
                    </span>
                    <span className="mt-1 block text-murekkep-soluk">
                      Yazın, kısa sürede dönelim
                    </span>
                  </span>
                </a>
              )}

              {ILETISIM.eposta && (
                <a
                  href={`mailto:${ILETISIM.eposta}`}
                  className="flex gap-4 rounded-kart border-2 border-cizgi bg-white p-5 transition-colors hover:border-yesil"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-lime-rozet text-black">
                    <Ikon.Posta boyut={22} />
                  </span>
                  <span>
                    <span className="block font-baslik font-bold text-murekkep">
                      E-posta
                    </span>
                    <span className="mt-1 block text-murekkep-soluk">
                      {ILETISIM.eposta}
                    </span>
                  </span>
                </a>
              )}

              {/*
                Calisma saatleri: telefonun hemen altinda. Yerel aramada en
                cok sorulan bilgi ve "acik mi" sorusunun cevabi.
              */}
              <div className="rounded-kart border-2 border-cizgi bg-white p-5">
                <div className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-lime-rozet text-black">
                    <Ikon.Saat boyut={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-baslik font-bold text-murekkep">
                      Çalışma saatleri
                    </p>
                    <dl className="mt-2 space-y-1 text-murekkep-soluk">
                      {saatSatirlari().map((s) => (
                        <div key={s.gunler} className="flex justify-between gap-4">
                          <dt>{s.gunler}</dt>
                          <dd className="tabular-nums">{s.saat}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-3 text-sm text-murekkep-soluk">
                      Grup ve atölye saatleri bundan farklı;{" "}
                      <Link
                        href="/oyun-evi/haftalik-program"
                        className="font-medium text-yesil-koyu underline underline-offset-2"
                      >
                        haftalık programa
                      </Link>{" "}
                      bakabilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            </address>

            {/*
              PLAN.md Bolum 3 madde 5: kap olmadan cagri yapilmaz.
              Kanallar teyit edilene kadar veliyi calisan tek kanala,
              yani kayit formuna yonlendiriyoruz.
            */}
            {!kanalVar && (
              <p className="mt-6 rounded-kart border-2 border-dashed border-cizgi bg-white p-5 leading-relaxed text-murekkep-soluk">
                Telefon ve WhatsApp hattımız yayına hazırlanıyor. Bu arada kayıt
                formunu doldurursanız size biz ulaşırız, hiçbir talep kaybolmaz.
              </p>
            )}

          </Belir>

          {/* --- saatler --- */}
          <Belir gecikme={0.1}>
            <h2 className="font-baslik text-2xl font-bold text-murekkep">
              Program saatleri
            </h2>
            <p className="mt-2 text-murekkep-soluk">
              Haftalık programın ilk ve son etkinlik saatleri.
            </p>

            <ul className="mt-6 divide-y divide-cizgi overflow-hidden rounded-kart border-2 border-cizgi bg-white">
              {saatler.map(({ gun, metin }) => (
                <li
                  key={gun}
                  className="flex items-center justify-between gap-4 px-5 py-3.5"
                >
                  <span className="font-medium text-murekkep">
                    {GUN_ADI[gun]}
                  </span>
                  <span className="tabular-nums text-murekkep-soluk">
                    {metin ?? "Grup programı yok"}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-sm leading-relaxed text-murekkep-soluk">
              {PAZAR_NOTU} Öğle arası her gün 12.30 - 13.30 arasındadır.
            </p>
          </Belir>
        </div>

        {/*
          --- ulasim seridi ---

          Harita, adres ve bina cephesi BIR ARADA: veli "nerede" sorusunu bir
          bakista cevapliyor. Harita noktayi gosterir, yol tarifi baglantisi
          onu kendi telefonundaki uygulamaya birakir, fotograf da kapiyi
          gorerek bulmasini saglar (kapi numarasi karede okunuyor).

          "Haritada aç" butonu KALDIRILDI (16 Agustos 2026): harita zaten
          gomulu duruyor ve gomulu haritanin uzerine tiklamak da ayni yeri
          aciyor. Iki buton yan yana durunca hangisinin ne yaptigi da
          belirsizlesiyordu. Kalan tek cagri "Yol tarifi al".

          iframe `loading="lazy"`: Google Maps agir ve ucuncu taraf cerez
          yukluyor, sayfa acilir acilmaz degil ekrana girince yuklensin.
        */}
        <Belir gecikme={0.15}>
          <div className="mt-10 overflow-hidden rounded-kart border-2 border-cizgi bg-white lg:mt-12 lg:grid lg:grid-cols-5">
            {ILETISIM.haritaEmbed && (
              <HaritaKutusu
                embedUrl={ILETISIM.haritaEmbed}
                baslik={`${MARKA.ad} konumu, ${ILETISIM.adres}`}
                /*
                  Mobilde 4:3 kutu, genis ekranda satirin yuksekligini
                  doldurur: yanindaki sutun neyse harita da o boyda olur,
                  arada bosluk kalmaz.
                */
                className="aspect-[4/3] w-full border-b-2 border-cizgi lg:col-span-3 lg:aspect-auto lg:h-full lg:min-h-[420px] lg:border-b-0 lg:border-r-2"
              />
            )}

            <div className="p-6 lg:col-span-2 lg:p-8">
              <p className="flex gap-2 font-baslik text-lg font-bold text-murekkep">
                <Ikon.Konum boyut={22} className="mt-0.5 shrink-0" />
                Nasıl gelinir?
              </p>
              <p className="mt-2 leading-relaxed text-murekkep-soluk">
                {ILETISIM.adres}
              </p>

              {tarif && (
                <ButonLink
                  href={tarif}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5"
                >
                  Yol tarifi al
                  <Ikon.Ok boyut={17} />
                </ButonLink>
              )}

              {/* Bina cephesi. Kapi numarasi karede gorunuyor, veli adresi
                  tarif ederken degil gorerek buluyor. */}
              <figure className="mt-7">
                <Foto
                  foto={foto("bambola-teras-01")}
                  oran="genis"
                  boyutlar="(min-width: 1024px) 400px, 100vw"
                />
                <figcaption className="mt-2 text-sm leading-snug text-murekkep-soluk">
                  {foto("bambola-teras-01").alt}
                </figcaption>
              </figure>
            </div>
          </div>
        </Belir>
      </div>
    </>
  );
}
