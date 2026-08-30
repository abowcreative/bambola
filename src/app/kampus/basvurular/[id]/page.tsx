import { notFound } from "next/navigation";
import { adminZorunlu } from "@/lib/kampus/oturum";
import {
  basvuruGetir,
  basvuruNotlariGetir,
  basvurununOgrencisi,
} from "@/lib/kampus/basvurular";
import { basvuruSil } from "@/lib/kampus/basvuru-islemleri";
import { OgrenciyeDonustur } from "@/components/kampus/ogrenciye-donustur";
import { Kabuk, Kutu, GeriBaglantisi } from "@/components/kampus/kabuk";
import { Bildirim, DugmeLink, Rozet, Satir } from "@/components/kampus/ui";
import { SilDugmesi } from "@/components/kampus/ui-istemci";
import { Ikon } from "@/components/ui/ikon";
import { DurumSecici } from "@/components/kampus/durum-secici";
import { NotKutusu } from "@/components/kampus/not-kutusu";
import {
  tarihYaz,
  telefonYaz,
  gecenSure,
} from "@/components/kampus/basvuru-satiri";
import { yasMetni } from "@/lib/yas";
import { aileBul } from "@/lib/data/gruplar";
import { atolyeBul } from "@/lib/data/atolyeler";
import { tlYaz } from "@/lib/data/ucretler";
import { GUN_ADI } from "@/lib/data/types";
import type { Gun } from "@/lib/data/types";
import { DURUM_ETIKET, KURUM_ETIKET } from "@/lib/supabase/types";
import type { Kurum } from "@/lib/supabase/types";
import { BASVURU_TONU } from "@/lib/kampus/tonlar";

export const metadata = {
  title: "Başvuru",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function BasvuruDetaySayfasi({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const oturum = await adminZorunlu();
  const { id } = await params;

  const basvuru = await basvuruGetir(id);
  if (!basvuru) notFound();

  const [notlar, ogrenciId] = await Promise.all([
    basvuruNotlariGetir(id),
    basvurununOgrencisi(id),
  ]);
  const aile = basvuru.program_slug ? aileBul(basvuru.program_slug) : undefined;

  const telefonDuz = basvuru.telefon.replace(/\D/g, "").replace(/^(90|0)/, "");
  const wa = `https://wa.me/90${telefonDuz}`;

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/basvurular">
      <GeriBaglantisi yol="/kampus/basvurular" etiket="Başvurular" />

      <div className="mt-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-baslik text-xl font-bold text-murekkep sm:text-2xl">
              {basvuru.veli_adi}
            </h1>
            <Rozet ton={BASVURU_TONU[basvuru.durum] ?? "notr"}>
              {DURUM_ETIKET[basvuru.durum]}
            </Rozet>
          </div>
          <p className="mt-1 text-sm text-panel-soluk">
            {tarihYaz(basvuru.created_at)} · {gecenSure(basvuru.created_at)}
          </p>
        </div>

        {/*
          Donusturme cagrisi en gorunur yerde: bir basvuruyla yapilacak asil
          is bu. Zaten donusturulmusse baglanti gosteriliyor, ikinci kayit
          olusmasin.
        */}
        <div className="flex flex-wrap items-center gap-2">
          <OgrenciyeDonustur
            basvuruId={basvuru.id}
            mevcutOgrenciId={ogrenciId}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        {/* ---------------------------------------------------- sol sutun */}
        <div className="space-y-4">
          {/*
            Iletisim en uste: panelin ilk isi "bu kisiyi nasil ararim".
            Telefon ve WhatsApp tek tikla aciliyor, kopyalamaya gerek yok.
          */}
          <Kutu baslik="İletişim">
            <div className="flex flex-wrap gap-2">
              <DugmeLink href={`tel:0${telefonDuz}`} gorunum="birincil">
                <Ikon.Telefon boyut={15} />
                {telefonYaz(basvuru.telefon)}
              </DugmeLink>
              <DugmeLink href={wa} target="_blank" rel="noopener noreferrer">
                <Ikon.Whatsapp boyut={15} />
                WhatsApp
              </DugmeLink>
              {basvuru.eposta && (
                <DugmeLink href={`mailto:${basvuru.eposta}`}>
                  <Ikon.Posta boyut={15} />
                  E-posta
                </DugmeLink>
              )}
            </div>

            <dl className="mt-4">
              <Satir etiket="Tercih ettiği kanal">
                {basvuru.iletisim_tercihi}
              </Satir>
              <Satir etiket="E-posta">{basvuru.eposta}</Satir>
              <Satir etiket="Bizi nereden duydu">{basvuru.kaynak}</Satir>
              <Satir etiket="Ticari ileti izni">
                {basvuru.ticari_ileti_onay ? "Verdi" : "Vermedi"}
              </Satir>
            </dl>
          </Kutu>

          <Kutu baslik="Durum">
            <DurumSecici id={basvuru.id} durum={basvuru.durum} />
          </Kutu>

          {/* --- secilen seanslar --- */}
          {basvuru.secilen_slotlar.length > 0 && (
            <Kutu baslik="Seçilen seanslar" dolgusuz>
              <ul className="divide-y divide-panel-cizgi">
                {basvuru.secilen_slotlar.map((s) => (
                  <li key={s.id} className="px-4 py-2.5">
                    <p className="text-sm font-semibold text-murekkep">
                      {GUN_ADI[s.gun as Gun] ?? s.gun} · {s.bas} - {s.bit}
                    </p>
                    <p className="mt-0.5 text-xs text-panel-soluk">
                      {atolyeBul(
                        s.atolye as Parameters<typeof atolyeBul>[0],
                      )?.ad ?? s.atolye}
                      {s.ogretmenler.length > 0 &&
                        ` · ${s.ogretmenler.join(", ")}`}
                    </p>
                  </li>
                ))}
              </ul>
            </Kutu>
          )}

          {/*
            "Saat uymuyor" isareti ve velinin yazdigi alternatif. Bu, aramadan
            once programa bakilmasi gereken bir talep demek.
          */}
          {basvuru.saat_uymuyor && (
            <Bildirim
              ton="uyari"
              baslik="Saatler uymuyor"
              ikon={<Ikon.Saat boyut={16} />}
            >
              {basvuru.saat_notu ||
                "Veli uygun saat belirtmemiş, aranırken sorulmalı."}
            </Bildirim>
          )}

          {basvuru.not_metni && (
            <Kutu baslik="Velinin notu">
              <p className="whitespace-pre-line text-sm leading-relaxed text-panel-soluk">
                {basvuru.not_metni}
              </p>
            </Kutu>
          )}

          <NotKutusu basvuruId={basvuru.id} notlar={notlar} />
        </div>

        {/* ---------------------------------------------------- sag sutun */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Kutu baslik="Çocuk">
            <dl>
              <Satir etiket="Ad">{basvuru.cocuk_adi}</Satir>
              <Satir etiket="Doğum tarihi">
                {new Date(basvuru.dogum_tarihi).toLocaleDateString("tr-TR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </Satir>
              {/*
                Yas basvuru anindaki degeriyle saklaniyor, simdiki yasla
                karistirilmasin diye etiketinde acikca yaziyor.
              */}
              <Satir etiket="Başvuru anındaki yaş">
                {yasMetni(basvuru.yas_ay)}
              </Satir>
              <Satir etiket="Kurum">
                {KURUM_ETIKET[basvuru.kurum as Kurum]}
              </Satir>
            </dl>
          </Kutu>

          <Kutu
            baslik="Program ve ücret"
            aciklama="Başvuru anındaki tarife. Tarife sonradan değişse de bu kayıt değişmez."
          >
            <dl>
              <Satir etiket="Program">{aile?.ad}</Satir>
              <Satir etiket="Paket">{basvuru.paket_kod}</Satir>
              <Satir etiket="Normal fiyat">
                {basvuru.fiyat_normal != null && tlYaz(basvuru.fiyat_normal)}
              </Satir>
              <Satir etiket="Erken kayıt fiyatı">
                {basvuru.fiyat_erken_kayit != null &&
                  tlYaz(basvuru.fiyat_erken_kayit)}
              </Satir>
              <Satir etiket="İndirim uygulandı mı">
                {basvuru.erken_kayit_uygulandi ? "Evet" : "Hayır"}
              </Satir>
            </dl>
          </Kutu>

          <Kutu baslik="Kayıt bilgisi">
            <dl>
              <Satir etiket="KVKK onayı">
                {basvuru.kvkk_onay ? "Verildi" : "Yok"}
              </Satir>
              <Satir etiket="Son güncelleyen">{basvuru.guncelleyen}</Satir>
              <Satir etiket="Son güncelleme">
                {basvuru.updated_at && tarihYaz(basvuru.updated_at)}
              </Satir>
              <Satir etiket="Geldiği sayfa">{basvuru.referrer}</Satir>
            </dl>
          </Kutu>

          {/*
            Silme en altta ve ayri kutuda: formdan gelen bir talep, sonu ne
            olursa olsun bir kayittir ve donusum oranini o kayitlar
            olusturuyor. Silme yalniz bot/deneme kaydi icin.
          */}
          {!ogrenciId && (
            <Kutu baslik="Kaydı sil">
              <p className="text-xs leading-relaxed text-panel-soluk">
                Normal yol durumu değiştirmek. Silme yalnız bot doldurması,
                deneme kaydı ya da aynı kişinin iki kez gönderdiği form için.
              </p>
              <div className="mt-2 flex justify-end">
                <SilDugmesi
                  etiket="Başvuruyu sil"
                  onayEtiketi="Kalıcı olarak sil"
                  islem={async () => {
                    "use server";
                    return basvuruSil(id);
                  }}
                />
              </div>
            </Kutu>
          )}
        </aside>
      </div>
    </Kabuk>
  );
}
