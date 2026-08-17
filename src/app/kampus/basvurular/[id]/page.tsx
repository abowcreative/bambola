import Link from "next/link";
import { notFound } from "next/navigation";
import { adminZorunlu } from "@/lib/kampus/oturum";
import { basvuruGetir, basvuruNotlariGetir } from "@/lib/kampus/basvurular";
import { Kabuk } from "@/components/kampus/kabuk";
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
import { KURUM_ETIKET } from "@/lib/supabase/types";
import type { Kurum } from "@/lib/supabase/types";

export const metadata = {
  title: "Başvuru",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Kunye satiri. Bos deger yerine tire, "bilgi yok" demek de bir bilgi. */
function Satir({
  etiket,
  children,
}: {
  etiket: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap justify-between gap-3 border-b border-cizgi py-2.5 last:border-b-0">
      <dt className="text-sm text-murekkep-soluk">{etiket}</dt>
      <dd className="text-right text-sm font-medium text-murekkep">
        {children ?? <span className="text-murekkep-soluk">—</span>}
      </dd>
    </div>
  );
}

export default async function BasvuruDetaySayfasi({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const oturum = await adminZorunlu();
  const { id } = await params;

  const basvuru = await basvuruGetir(id);
  if (!basvuru) notFound();

  const notlar = await basvuruNotlariGetir(id);
  const aile = basvuru.program_slug ? aileBul(basvuru.program_slug) : undefined;

  const telefonDuz = basvuru.telefon.replace(/\D/g, "");
  const wa = `https://wa.me/90${telefonDuz.replace(/^(90|0)/, "")}`;

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/basvurular">
      <Link
        href="/kampus/basvurular"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-yesil-koyu hover:underline"
      >
        <Ikon.OkGeri boyut={16} />
        Başvurular
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-baslik text-2xl font-bold text-murekkep sm:text-3xl">
            {basvuru.veli_adi}
          </h1>
          <p className="mt-1 text-murekkep-soluk">
            {tarihYaz(basvuru.created_at)} · {gecenSure(basvuru.created_at)}
          </p>
        </div>
        <DurumSecici id={basvuru.id} durum={basvuru.durum} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* ---------------------------------------------------- sol sutun */}
        <div className="space-y-6">
          {/*
            Iletisim en uste: panelin ilk isi "bu kisiyi nasil ararim".
            Telefon ve WhatsApp tek tikla aciliyor, kopyalamaya gerek yok.
          */}
          <section className="rounded-blok border-2 border-cizgi bg-white p-6">
            <h2 className="font-baslik text-lg font-bold text-murekkep">
              İletişim
            </h2>

            <div className="mt-4 flex flex-wrap gap-2.5">
              <a
                href={`tel:0${telefonDuz.replace(/^(90|0)/, "")}`}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--kol-ana)] px-4 py-2.5 font-baslik text-sm font-semibold text-white shadow-kart transition-transform duration-200 ease-yayli hover:-translate-y-0.5"
              >
                <Ikon.Telefon boyut={16} />
                {telefonYaz(basvuru.telefon)}
              </a>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border-2 border-cizgi bg-white px-4 py-2.5 font-baslik text-sm font-semibold text-murekkep transition-colors hover:border-yesil"
              >
                <Ikon.Whatsapp boyut={16} />
                WhatsApp
              </a>
              {basvuru.eposta && (
                <a
                  href={`mailto:${basvuru.eposta}`}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-cizgi bg-white px-4 py-2.5 font-baslik text-sm font-semibold text-murekkep transition-colors hover:border-yesil"
                >
                  <Ikon.Posta boyut={16} />
                  E-posta
                </a>
              )}
            </div>

            <dl className="mt-5">
              <Satir etiket="Tercih ettiği kanal">
                {basvuru.iletisim_tercihi}
              </Satir>
              <Satir etiket="E-posta">{basvuru.eposta}</Satir>
              <Satir etiket="Bizi nereden duydu">{basvuru.kaynak}</Satir>
              <Satir etiket="Ticari ileti izni">
                {basvuru.ticari_ileti_onay ? "Verdi" : "Vermedi"}
              </Satir>
            </dl>
          </section>

          {/* --- secilen seanslar --- */}
          {basvuru.secilen_slotlar.length > 0 && (
            <section className="rounded-blok border-2 border-cizgi bg-white p-6">
              <h2 className="font-baslik text-lg font-bold text-murekkep">
                Seçilen seanslar
              </h2>
              <ul className="mt-4 space-y-2.5">
                {basvuru.secilen_slotlar.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-kart border-2 border-cizgi px-4 py-3"
                  >
                    <p className="font-baslik font-bold text-murekkep">
                      {GUN_ADI[s.gun as Gun] ?? s.gun} · {s.bas} - {s.bit}
                    </p>
                    <p className="mt-0.5 text-sm text-murekkep-soluk">
                      {atolyeBul(
                        s.atolye as Parameters<typeof atolyeBul>[0],
                      )?.ad ?? s.atolye}
                      {s.ogretmenler.length > 0 &&
                        ` · ${s.ogretmenler.join(", ")}`}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/*
            "Saat uymuyor" isareti ve velinin yazdigi alternatif. Bu, aramadan
            once programa bakilmasi gereken bir talep demek.
          */}
          {basvuru.saat_uymuyor && (
            <section className="rounded-blok border-2 border-yesil bg-white p-6">
              <h2 className="flex items-center gap-2 font-baslik text-lg font-bold text-murekkep">
                <Ikon.Saat boyut={19} />
                Saatler uymuyor
              </h2>
              <p className="mt-2 leading-relaxed text-murekkep-soluk">
                {basvuru.saat_notu ||
                  "Veli uygun saat belirtmemiş, aranırken sorulmalı."}
              </p>
            </section>
          )}

          {basvuru.not_metni && (
            <section className="rounded-blok border-2 border-cizgi bg-white p-6">
              <h2 className="font-baslik text-lg font-bold text-murekkep">
                Velinin notu
              </h2>
              <p className="mt-2 whitespace-pre-line leading-relaxed text-murekkep-soluk">
                {basvuru.not_metni}
              </p>
            </section>
          )}

          <NotKutusu basvuruId={basvuru.id} notlar={notlar} />
        </div>

        {/* ---------------------------------------------------- sag sutun */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-blok border-2 border-cizgi bg-white p-6">
            <h2 className="font-baslik text-lg font-bold text-murekkep">
              Çocuk
            </h2>
            <dl className="mt-3">
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
                karistirilmasin diye ikisi birden gosteriliyor.
              */}
              <Satir etiket="Başvuru anındaki yaş">
                {yasMetni(basvuru.yas_ay)}
              </Satir>
              <Satir etiket="Kurum">
                {KURUM_ETIKET[basvuru.kurum as Kurum]}
              </Satir>
            </dl>
          </section>

          <section className="rounded-blok border-2 border-cizgi bg-white p-6">
            <h2 className="font-baslik text-lg font-bold text-murekkep">
              Program ve ücret
            </h2>
            <dl className="mt-3">
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
            <p className="mt-3 text-xs leading-relaxed text-murekkep-soluk">
              Fiyatlar başvuru anındaki tarifeden alınmıştır. Tarife sonradan
              değişse de bu kayıt değişmez.
            </p>
          </section>

          <section className="rounded-blok border-2 border-cizgi bg-white p-6">
            <h2 className="font-baslik text-lg font-bold text-murekkep">
              Kayıt bilgisi
            </h2>
            <dl className="mt-3">
              <Satir etiket="KVKK onayı">
                {basvuru.kvkk_onay ? "Verildi" : "Yok"}
              </Satir>
              <Satir etiket="Son güncelleyen">{basvuru.guncelleyen}</Satir>
              <Satir etiket="Son güncelleme">
                {basvuru.updated_at && tarihYaz(basvuru.updated_at)}
              </Satir>
              <Satir etiket="Geldiği sayfa">{basvuru.referrer}</Satir>
            </dl>
          </section>
        </aside>
      </div>
    </Kabuk>
  );
}
