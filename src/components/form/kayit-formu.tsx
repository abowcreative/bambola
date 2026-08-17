"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence } from "motion/react";

import { AILELER, aileBul } from "@/lib/data/gruplar";
import { atolyeBul } from "@/lib/data/atolyeler";
import { slotBul } from "@/lib/data/program";
import { GUN_ADI, type ProgramAilesiSlug } from "@/lib/data/types";
import {
  paketBul,
  tlYaz,
  gecerliFiyat,
  erkenKayitGosterilirMi,
  kampanyaAcikMi,
  KAMPANYA_KOSULLARI,
} from "@/lib/data/ucretler";
import {
  ayHesapla,
  yasMetni,
  uygunAileler,
  uygunKombinasyonlar,
  uygunTekSeferlikSlotlar,
  dogumTarihiGecerliMi,
} from "@/lib/yas";
import {
  ILETISIM_ETIKET,
  ILETISIM_TERCIHLERI,
  KAYNAKLAR,
  KAYNAK_ETIKET,
  telefonYaz,
} from "@/lib/schema";
import { pikselOlayi, formAdimi } from "@/lib/olcum";

import { Buton } from "@/components/ui/buton";
import { Ikon } from "@/components/ui/ikon";
import {
  AdimGecisi,
  Alan,
  IlerlemeCubugu,
  SecimKarti,
  girdiSinifi,
} from "./parcalar";
import { FiyatPaneli } from "./fiyat-paneli";

/** PLAN.md Bolum 7. Cok adimli, tek soru odakli, telefonda tek elle doldurulabilir. */

const DEPO_ANAHTARI = "bambola-kayit-v1";

type SecimTuru =
  | { tur: "aile"; slug: ProgramAilesiSlug }
  | { tur: "tek-seferlik" }
  | { tur: "serbest-oyun" }
  | { tur: "parti" }
  | { tur: "anaokulu" }
  | null;

type Durum = {
  cocukAdi: string;
  dogumTarihi: string;
  secim: SecimTuru;
  paketKod: string;
  secilenSlotIdler: string[];
  saatUymuyor: boolean;
  saatNotu: string;
  veliAdi: string;
  telefon: string;
  eposta: string;
  iletisimTercihi: string;
  kaynak: string;
  notMetni: string;
  kvkkOnay: boolean;
  ticariIletiOnay: boolean;
  website: string;
};

/**
 * Baslangic durumu. sessionStorage okumasi useState baslaticisinda yapilir,
 * effect icinde degil: React 19 effect icindeki setState'i kaskad render
 * olarak isaretliyor. Bu bilesen istemci tarafinda yuklendigi icin
 * (bkz. kayit-formu-yukleyici.tsx) hidrasyon uyusmazligi olusmaz.
 */
/*
  Adresten gelen on secimler. `onKaynak` /bilgi sayfasindaki cagri
  baglantisindan geliyor ve "bizi nereden duydunuz" alanini ONERI olarak
  dolduruyor -- veli degistirebiliyor. Amac: otomasyondan gelen talebi
  panelde sayabilmek. Cerezli olcum yerine bu yol secildi, cunku sitede
  hicbir analitik yok ve cerez politikasi bunu yaziyor.
*/
function baslangicDurumu(
  onProgram?: string,
  onKurum?: string,
  onKaynak?: string,
): Durum {
  let d: Durum = { ...BOS };

  try {
    const ham = sessionStorage.getItem(DEPO_ANAHTARI);
    if (ham) return { ...BOS, ...(JSON.parse(ham) as Partial<Durum>) };
  } catch {
    // depo kapaliysa form yine calisir
  }

  if (onKaynak && (KAYNAKLAR as readonly string[]).includes(onKaynak)) {
    d = { ...d, kaynak: onKaynak };
  }

  if (onProgram) {
    const aile = aileBul(onProgram);
    if (aile) d = { ...d, secim: { tur: "aile", slug: aile.slug } };
  } else if (onKurum === "parti") {
    d = { ...d, secim: { tur: "parti" } };
  } else if (onKurum === "anaokulu") {
    d = { ...d, secim: { tur: "anaokulu" } };
  }

  return d;
}

const BOS: Durum = {
  cocukAdi: "",
  dogumTarihi: "",
  secim: null,
  paketKod: "",
  secilenSlotIdler: [],
  saatUymuyor: false,
  saatNotu: "",
  veliAdi: "",
  telefon: "",
  eposta: "",
  iletisimTercihi: "whatsapp",
  kaynak: "",
  notMetni: "",
  kvkkOnay: false,
  ticariIletiOnay: false,
  website: "",
};

type AdimKodu = "cocuk" | "program" | "paket" | "saat" | "veli" | "ozet";

const ADIM_ADI: Record<AdimKodu, string> = {
  cocuk: "Çocuğunuz",
  program: "Program türü",
  paket: "Katılım paketi",
  saat: "Gün ve saat",
  veli: "Sizin bilgileriniz",
  ozet: "Özet ve gönderim",
};

export function KayitFormu({
  onProgram,
  onKurum,
  onKaynak,
}: {
  onProgram?: string;
  onKurum?: string;
  onKaynak?: string;
}) {
  const router = useRouter();
  /*
    Kampanya durumu burada, istemcide hesaplaniyor. Bu bilesen `ssr: false`
    ile yukleniyor (bkz. kayit-formu-yukleyici.tsx), yani sunucu render'i hic
    yok ve hidrasyon uyusmazligi mumkun degil. Ustelik boylesi daha dogru:
    deger, sayfa onbellege girdigi an degil, velinin formu actigi an
    hesaplaniyor. Formun acik kaldigi sure boyunca sabit kalsin diye lazy
    state icinde tutuluyor.
  */
  const [kampanyaAcik] = useState(kampanyaAcikMi);
  const [d, setD] = useState<Durum>(() => baslangicDurumu(onProgram, onKurum, onKaynak));
  const [adimIndex, setAdimIndex] = useState(0);
  const [yon, setYon] = useState<1 | -1>(1);
  const [hatalar, setHatalar] = useState<Record<string, string>>({});
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [sunucuHatasi, setSunucuHatasi] = useState<string | null>(null);
  const basligaOdak = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    pikselOlayi("InitiateCheckout");
  }, []);

  // Girilen veri kaybolmaz: her degisiklikte oturum deposuna yazilir.
  // Bal tuzagi alani saklanmaz.
  useEffect(() => {
    try {
      const { website: _website, ...saklanacak } = d;
      void _website;
      sessionStorage.setItem(DEPO_ANAHTARI, JSON.stringify(saklanacak));
    } catch {
      // yoksay
    }
  }, [d]);

  const guncelle = (yama: Partial<Durum>) => {
    setD((x) => ({ ...x, ...yama }));
    setSunucuHatasi(null);
  };

  // --- hesaplananlar ---
  const yasAy = useMemo(
    () => (d.dogumTarihi ? ayHesapla(d.dogumTarihi) : Number.NaN),
    [d.dogumTarihi],
  );
  const yasGecerli = Number.isFinite(yasAy) && yasAy >= 0;

  const aileler = useMemo(
    () => (yasGecerli ? uygunAileler(yasAy) : []),
    [yasAy, yasGecerli],
  );
  const tekSeferlikler = useMemo(
    () => (yasGecerli ? uygunTekSeferlikSlotlar(yasAy) : []),
    [yasAy, yasGecerli],
  );

  const secilenAile =
    d.secim?.tur === "aile" ? aileBul(d.secim.slug) : undefined;

  /** Tek seferlik secimde fiyat, secilen atolyenin ailesinden gelir. */
  const tekSeferAilesi = useMemo(() => {
    if (d.secim?.tur !== "tek-seferlik" || !d.secilenSlotIdler[0]) return null;
    const slot = slotBul(d.secilenSlotIdler[0]);
    const atolye = slot && atolyeBul(slot.atolyeSlug);
    if (!atolye?.ailesi) return null;
    return paketBul(atolye.ailesi, "tek-sefer") ? atolye.ailesi : null;
  }, [d.secim, d.secilenSlotIdler]);

  const aktifPaket = useMemo(() => {
    if (secilenAile && d.paketKod)
      return paketBul(secilenAile.slug, d.paketKod);
    if (tekSeferAilesi) return paketBul(tekSeferAilesi, "tek-sefer");
    return undefined;
  }, [secilenAile, d.paketKod, tekSeferAilesi]);

  /** Bu secim icin yayinlanmis ucret yok (atolyelerin tek sefer fiyati Excel'de yok). */
  const fiyatYok =
    d.secim?.tur === "tek-seferlik" &&
    d.secilenSlotIdler.length > 0 &&
    !tekSeferAilesi;

  // --- adim listesi, secime gore daralir ---
  const adimlar: AdimKodu[] = useMemo(() => {
    const a: AdimKodu[] = ["cocuk", "program"];
    if (d.secim?.tur === "aile") a.push("paket", "saat");
    else if (d.secim?.tur === "tek-seferlik" || d.secim?.tur === "serbest-oyun")
      a.push("saat");
    a.push("veli", "ozet");
    return a;
  }, [d.secim]);

  const adim = adimlar[Math.min(adimIndex, adimlar.length - 1)];
  const sonAdimMi = adimIndex >= adimlar.length - 1;

  useEffect(() => {
    formAdimi(adimIndex + 1, ADIM_ADI[adim]);
    basligaOdak.current?.focus();
    // Mobilde adim degisince ustten basla.
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [adimIndex, adim]);

  // --- adim dogrulama ---
  function adimGecerliMi(): boolean {
    const h: Record<string, string> = {};

    if (adim === "cocuk") {
      const kontrol = dogumTarihiGecerliMi(d.dogumTarihi);
      if (!d.dogumTarihi) h.dogumTarihi = "Çocuğunuzun doğum tarihini seçin.";
      else if (!kontrol.gecerli) h.dogumTarihi = kontrol.hata!;
    }

    if (adim === "program" && !d.secim) {
      h.secim = "Bir program türü seçin.";
    }

    if (adim === "paket" && !d.paketKod) {
      h.paketKod = "Bir katılım paketi seçin.";
    }

    if (adim === "saat") {
      /*
        Serbest oyunda sabit slot YOK: gunluk akis her gun farkli oldugu
        icin veliden ARALIK isteniyor ve talep kuruma gidiyor (musteri
        istegi, 17 Agustos 2026). O yuzden slot zorunlulugu aranmaz,
        saat araligi zorunludur.
      */
      if (d.secim?.tur === "serbest-oyun") {
        if (!d.saatNotu.trim()) {
          h.saatNotu = "Size uygun gün ve saat aralığını yazın.";
        }
      } else {
        if (!d.saatUymuyor && d.secilenSlotIdler.length === 0) {
          h.saat = "Bir gün ve saat seçin veya aşağıdaki seçeneği işaretleyin.";
        }
        if (d.saatUymuyor && !d.saatNotu.trim()) {
          h.saatNotu = "Size uyan zamanı kısaca yazın.";
        }
      }
    }

    if (adim === "veli") {
      if (d.veliAdi.trim().length < 2)
        h.veliAdi = "Adınızı ve soyadınızı yazın.";
      if (!/^0?5\d{9}$|^\+?90\s?5\d{9}$/.test(d.telefon.replace(/\s/g, "")))
        h.telefon = "Telefonu 05XX XXX XX XX biçiminde girin.";
      if (!d.kvkkOnay)
        h.kvkkOnay = "Devam etmek için aydınlatma metnini onaylayın.";
      if (d.eposta && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.eposta))
        h.eposta = "Geçerli bir e-posta girin.";
    }

    setHatalar(h);
    return Object.keys(h).length === 0;
  }

  function ileri() {
    if (!adimGecerliMi()) return;
    setYon(1);
    setAdimIndex((i) => Math.min(i + 1, adimlar.length - 1));
  }

  function geri() {
    setYon(-1);
    setHatalar({});
    setAdimIndex((i) => Math.max(i - 1, 0));
  }

  function adimaGit(kod: AdimKodu) {
    const i = adimlar.indexOf(kod);
    if (i >= 0) {
      setYon(-1);
      setAdimIndex(i);
    }
  }

  // --- gonderim ---
  async function gonder() {
    if (!adimGecerliMi()) return;
    setGonderiliyor(true);
    setSunucuHatasi(null);

    const kurum =
      d.secim?.tur === "parti"
        ? "parti"
        : d.secim?.tur === "anaokulu"
          ? "anaokulu"
          : "oyun-evi";

    const programSlug =
      d.secim?.tur === "aile"
        ? d.secim.slug
        : d.secim?.tur === "tek-seferlik"
          ? (tekSeferAilesi ?? "tek-seferlik")
          : d.secim?.tur === "serbest-oyun"
            ? "serbest-oyun"
            : "";

    const paketKod =
      d.secim?.tur === "aile"
        ? d.paketKod || undefined
        : tekSeferAilesi
          ? "tek-sefer"
          : undefined;

    try {
      const cevap = await fetch("/api/kayit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kurum,
          cocukAdi: d.cocukAdi,
          dogumTarihi: d.dogumTarihi,
          programSlug,
          paketKod,
          secilenSlotIdler: d.secilenSlotIdler,
          saatUymuyor: d.saatUymuyor,
          saatNotu: d.saatNotu,
          veliAdi: d.veliAdi,
          telefon: d.telefon,
          eposta: d.eposta,
          iletisimTercihi: d.iletisimTercihi,
          kaynak: d.kaynak || undefined,
          notMetni: d.notMetni,
          kvkkOnay: d.kvkkOnay,
          ticariIletiOnay: d.ticariIletiOnay,
          website: d.website,
          referrer: typeof document !== "undefined" ? document.referrer : "",
        }),
      });

      const sonuc = await cevap.json();

      if (!cevap.ok || !sonuc.ok) {
        setSunucuHatasi(sonuc.hata ?? "Talebiniz gönderilemedi.");
        if (sonuc.alanlar) setHatalar(sonuc.alanlar);
        setGonderiliyor(false);
        return;
      }

      pikselOlayi("Lead");
      try {
        sessionStorage.removeItem(DEPO_ANAHTARI);
      } catch {
        // yoksay
      }
      router.push("/kayit/tesekkurler");
    } catch {
      setSunucuHatasi(
        "Bağlantı kurulamadı. İnternetinizi kontrol edip tekrar deneyin.",
      );
      setGonderiliyor(false);
    }
  }

  // ------------------------------------------------------------------ ekran

  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 sm:px-6">
      <IlerlemeCubugu
        adim={adimIndex + 1}
        toplam={adimlar.length}
        adimAdlari={adimlar.map((a) => ADIM_ADI[a])}
      />

      {/* Sayfanin H1'i kayit/page.tsx'te, sunucuda uretiliyor. Buradaki adim
          basligi H2. Adim degisince odak buraya gelir, ekran okuyucu yeni
          adimi okur. */}
      <h2
        ref={basligaOdak}
        tabIndex={-1}
        className="font-baslik text-2xl font-bold text-murekkep outline-none sm:text-3xl"
      >
        {adim === "cocuk" && "Çocuğunuzu tanıyalım"}
        {adim === "program" && "Hangi program?"}
        {adim === "paket" && "Ne sıklıkla geleceksiniz?"}
        {adim === "saat" && "Hangi gün ve saat?"}
        {adim === "veli" && "Size nasıl ulaşalım?"}
        {adim === "ozet" && "Son bir kontrol"}
      </h2>

      <div className="mt-6">
        <AnimatePresence mode="wait" initial={false}>
          <AdimGecisi key={adim} yon={yon}>
            {/* ----------------------------------------------- Adim 1: cocuk */}
            {adim === "cocuk" && (
              <div className="space-y-6">
                <Alan
                  etiket="Çocuğunuzun adı"
                  ipucu="Size daha sıcak seslenebilmemiz için."
                >
                  {(p) => (
                    <input
                      {...p}
                      type="text"
                      value={d.cocukAdi}
                      onChange={(e) => guncelle({ cocukAdi: e.target.value })}
                      className={girdiSinifi}
                      placeholder="Örnek: Deniz"
                      autoComplete="off"
                    />
                  )}
                </Alan>

                <Alan
                  etiket="Doğum tarihi"
                  zorunlu
                  hata={hatalar.dogumTarihi}
                  ipucu="Uygun grupları buna göre listeliyoruz."
                >
                  {(p) => (
                    <input
                      {...p}
                      type="date"
                      value={d.dogumTarihi}
                      max={new Date().toISOString().slice(0, 10)}
                      onChange={(e) =>
                        guncelle({
                          dogumTarihi: e.target.value,
                          secim: null,
                          paketKod: "",
                          secilenSlotIdler: [],
                        })
                      }
                      className={girdiSinifi}
                    />
                  )}
                </Alan>

                {yasGecerli && (
                  <div
                    aria-live="polite"
                    className="rounded-kart bg-[var(--kol-vurgu)]/30 p-5"
                  >
                    <p className="font-baslik text-lg font-semibold text-murekkep">
                      {d.cocukAdi ? `${d.cocukAdi} ` : "Çocuğunuz "}
                      {yasMetni(yasAy)}
                    </p>
                    <p className="mt-1 text-sm text-murekkep-soluk">
                      {aileler.length + (tekSeferlikler.length ? 1 : 0) > 0
                        ? `Bu yaşa uygun ${aileler.length} grubumuz${
                            tekSeferlikler.length
                              ? ` ve ${tekSeferlikler.length} tek seferlik atölyemiz`
                              : ""
                          } var.`
                        : "Bu yaş için açık grubumuz görünmüyor. Yine de formu doldurun, size uygun bir çözüm arayalım."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* --------------------------------------------- Adim 2: program */}
            {adim === "program" && (
              <div className="space-y-3">
                {hatalar.secim && (
                  <p role="alert" className="text-sm font-medium text-red-700">
                    {hatalar.secim}
                  </p>
                )}

                {aileler.map((a) => {
                  const IkonBileseni =
                    Ikon[a.ikon as keyof typeof Ikon] ?? Ikon.Grup;
                  return (
                    <SecimKarti
                      key={a.slug}
                      ad="program"
                      secili={
                        d.secim?.tur === "aile" && d.secim.slug === a.slug
                      }
                      onSec={() =>
                        guncelle({
                          secim: { tur: "aile", slug: a.slug },
                          paketKod: "",
                          secilenSlotIdler: [],
                          saatUymuyor: false,
                        })
                      }
                      baslik={a.ad}
                      altBaslik={a.ozet}
                      rozetler={[a.yasEtiket, a.sure]}
                      ikon={<IkonBileseni boyut={22} />}
                    />
                  );
                })}

                {tekSeferlikler.length > 0 && (
                  <SecimKarti
                    ad="program"
                    secili={d.secim?.tur === "tek-seferlik"}
                    onSec={() =>
                      guncelle({
                        secim: { tur: "tek-seferlik" },
                        paketKod: "",
                        secilenSlotIdler: [],
                        saatUymuyor: false,
                      })
                    }
                    baslik="Tek seferlik atölye"
                    altBaslik="Önce bir deneyin, sonra karar verin."
                    rozetler={[`${tekSeferlikler.length} seçenek`]}
                    ikon={<Ikon.Firca boyut={22} />}
                  />
                )}

                <SecimKarti
                  ad="program"
                  secili={d.secim?.tur === "serbest-oyun"}
                  onSec={() =>
                    guncelle({
                      secim: { tur: "serbest-oyun" },
                      paketKod: "",
                      secilenSlotIdler: [],
                      saatUymuyor: false,
                    })
                  }
                  baslik="Serbest oyun"
                  altBaslik="Oyun alanını kullanmak istiyoruz."
                  ikon={<Ikon.Balon boyut={22} />}
                />

                <SecimKarti
                  ad="program"
                  secili={d.secim?.tur === "parti"}
                  onSec={() =>
                    guncelle({
                      secim: { tur: "parti" },
                      paketKod: "",
                      secilenSlotIdler: [],
                      saatUymuyor: false,
                    })
                  }
                  baslik="Doğum günü ve parti"
                  altBaslik="Parti evi için bilgi almak istiyoruz."
                  ikon={<Ikon.Yildiz boyut={22} />}
                />

                <SecimKarti
                  ad="program"
                  secili={d.secim?.tur === "anaokulu"}
                  onSec={() =>
                    guncelle({
                      secim: { tur: "anaokulu" },
                      paketKod: "",
                      secilenSlotIdler: [],
                      saatUymuyor: false,
                    })
                  }
                  baslik="Anaokulu ön kaydı"
                  altBaslik="Anaokulu hakkında bilgi almak istiyoruz."
                  ikon={<Ikon.Ampul boyut={22} />}
                />
              </div>
            )}

            {/* ----------------------------------------------- Adim 3: paket */}
            {adim === "paket" && secilenAile && (
              <div className="space-y-3">
                {hatalar.paketKod && (
                  <p role="alert" className="text-sm font-medium text-red-700">
                    {hatalar.paketKod}
                  </p>
                )}

                {secilenAile.paketler.map((p) => (
                  <SecimKarti
                    key={p.kod}
                    ad="paket"
                    secili={d.paketKod === p.kod}
                    onSec={() => guncelle({ paketKod: p.kod })}
                    baslik={p.etiket}
                    ikon={<Ikon.Takvim boyut={22} />}
                    sag={
                      <span className="block">
                        {erkenKayitGosterilirMi(p, kampanyaAcik) && (
                          <s className="block text-sm text-murekkep-soluk">
                            {tlYaz(p.normal)}
                          </s>
                        )}
                        <span className="block font-baslik text-xl font-bold tabular-nums text-[var(--kol-koyu)]">
                          {tlYaz(gecerliFiyat(p, kampanyaAcik))}
                        </span>
                      </span>
                    }
                  />
                ))}

                {kampanyaAcik && (
                <div className="rounded-kart border-2 border-cizgi bg-white p-5">
                  <p className="font-baslik font-semibold text-murekkep">
                    Erken kayıt koşulları
                  </p>
                  <ul className="mt-3 space-y-2">
                    {KAMPANYA_KOSULLARI.map((k) => (
                      <li
                        key={k}
                        className="flex gap-2 text-sm text-murekkep-soluk"
                      >
                        <Ikon.Tik
                          boyut={17}
                          className="mt-0.5 shrink-0 text-yesil"
                        />
                        {k}
                      </li>
                    ))}
                  </ul>
                </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------ Adim 4: saat */}
            {adim === "saat" && (
              <div className="space-y-3">
                {hatalar.saat && (
                  <p role="alert" className="text-sm font-medium text-red-700">
                    {hatalar.saat}
                  </p>
                )}

                {/* Sabit kombinasyonlar: veli tek tek gun isaretlemez. */}
                {d.secim?.tur === "aile" &&
                  secilenAile &&
                  uygunKombinasyonlar(secilenAile, yasAy).map((k) => {
                    const secili =
                      k.slotIdler.length === d.secilenSlotIdler.length &&
                      k.slotIdler.every((id) =>
                        d.secilenSlotIdler.includes(id),
                      );
                    const ilk = slotBul(k.slotIdler[0]);
                    const ogretmenler = ilk?.ogretmenler ?? [];
                    return (
                      <SecimKarti
                        key={k.etiket}
                        ad="saat"
                        secili={secili}
                        onSec={() =>
                          guncelle({
                            secilenSlotIdler: k.slotIdler,
                            saatUymuyor: false,
                          })
                        }
                        baslik={k.etiket}
                        altBaslik={
                          ogretmenler.length
                            ? `Öğretmen: ${ogretmenler.join(", ")}`
                            : undefined
                        }
                        rozetler={[
                          ...(k.haftaSonu ? ["Hafta sonu"] : []),
                          ...(ilk && ilk.dil !== "tr"
                            ? [
                                ilk.dil === "en"
                                  ? "İngilizce"
                                  : "1 saat İngilizce",
                              ]
                            : []),
                        ]}
                        ikon={<Ikon.Takvim boyut={22} />}
                      />
                    );
                  })}

                {/* Tek seferlik: yalniz o atolyelerin saatleri. */}
                {d.secim?.tur === "tek-seferlik" &&
                  tekSeferlikler.map((s) => {
                    const atolye = atolyeBul(s.atolyeSlug);
                    return (
                      <SecimKarti
                        key={s.id}
                        ad="saat"
                        secili={d.secilenSlotIdler[0] === s.id}
                        onSec={() =>
                          guncelle({
                            secilenSlotIdler: [s.id],
                            saatUymuyor: false,
                          })
                        }
                        baslik={`${GUN_ADI[s.gun]} · ${s.bas} - ${s.bit}`}
                        altBaslik={atolye?.ad}
                        rozetler={[
                          s.yas.etiket,
                          ...(s.dil === "en" ? ["İngilizce"] : []),
                          ...(s.yas.ebeveynsiz ? ["Ebeveynsiz"] : []),
                          ...(s.ogretmenler.length
                            ? [s.ogretmenler.join(", ")]
                            : []),
                        ]}
                        ikon={<Ikon.Firca boyut={22} />}
                      />
                    );
                  })}

                {d.secim?.tur === "serbest-oyun" && (
                  <div className="rounded-kart border-2 border-cizgi bg-white p-5 text-sm text-murekkep-soluk">
                    <p className="font-baslik text-base font-semibold text-murekkep">
                      Serbest oyun saatleri
                    </p>
                    <p className="mt-2">
                      Günlük program ve akış her gün farklı olduğu için serbest
                      oyun saatini birlikte netleştiriyoruz. Size uygun gün ve
                      saat aralığını yazın, uygunluğa göre dönelim.
                    </p>
                    <p className="mt-2">
                      Kayıtlı çocuklara hafta sonu belirlenen zaman diliminde 1
                      saat serbest oyun ücretsizdir. Her grup gününün ilk bir
                      saati de serbest oyun olarak geçer.
                    </p>
                  </div>
                )}

                {/*
                  PLAN.md Bolum 7: kaybedilen talebi gorunur kilan secenek.
                  Serbest oyunda GOSTERILMEZ: orada secilecek sabit bir saat
                  listesi yok, aralik zaten aciktan isteniyor.
                */}
                {d.secim?.tur !== "serbest-oyun" && (
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-kart border-2 border-dashed p-4 transition-colors ${
                    d.saatUymuyor
                      ? "border-[var(--kol-ana)] bg-[var(--kol-vurgu)]/20"
                      : "border-cizgi bg-white hover:border-[var(--kol-ana)]/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={d.saatUymuyor}
                    onChange={(e) =>
                      guncelle({
                        saatUymuyor: e.target.checked,
                        secilenSlotIdler: e.target.checked
                          ? []
                          : d.secilenSlotIdler,
                      })
                    }
                    className="mt-1 size-5 shrink-0 accent-[var(--kol-ana)]"
                  />
                  <span>
                    <span className="block font-baslik font-semibold text-murekkep">
                      Bu saatlerin hiçbiri uymuyor
                    </span>
                    <span className="mt-0.5 block text-sm text-murekkep-soluk">
                      Size uyan zamanı yazın, yeni grup açarken dikkate alalım.
                    </span>
                  </span>
                </label>
                )}

                {(d.saatUymuyor || d.secim?.tur === "serbest-oyun") && (
                  <Alan
                    etiket={
                      d.secim?.tur === "serbest-oyun"
                        ? "Size uygun gün ve saat aralığı"
                        : "Size hangi gün ve saatler uyar?"
                    }
                    zorunlu
                    hata={hatalar.saatNotu}
                  >
                    {(p) => (
                      <textarea
                        {...p}
                        rows={3}
                        value={d.saatNotu}
                        onChange={(e) => guncelle({ saatNotu: e.target.value })}
                        className={girdiSinifi}
                        placeholder="Örnek: hafta içi 17.00 sonrası veya cumartesi sabah"
                      />
                    )}
                  </Alan>
                )}
              </div>
            )}

            {/* ------------------------------------------------ Adim 5: veli */}
            {adim === "veli" && (
              <div className="space-y-6">
                <Alan
                  etiket="Adınız ve soyadınız"
                  zorunlu
                  hata={hatalar.veliAdi}
                >
                  {(p) => (
                    <input
                      {...p}
                      type="text"
                      value={d.veliAdi}
                      onChange={(e) => guncelle({ veliAdi: e.target.value })}
                      className={girdiSinifi}
                      autoComplete="name"
                    />
                  )}
                </Alan>

                <Alan etiket="Telefon" zorunlu hata={hatalar.telefon}>
                  {(p) => (
                    <input
                      {...p}
                      type="tel"
                      inputMode="numeric"
                      value={d.telefon}
                      onChange={(e) => guncelle({ telefon: e.target.value })}
                      className={girdiSinifi}
                      placeholder="05XX XXX XX XX"
                      autoComplete="tel"
                    />
                  )}
                </Alan>

                <Alan etiket="E-posta" hata={hatalar.eposta}>
                  {(p) => (
                    <input
                      {...p}
                      type="email"
                      value={d.eposta}
                      onChange={(e) => guncelle({ eposta: e.target.value })}
                      className={girdiSinifi}
                      autoComplete="email"
                    />
                  )}
                </Alan>

                <fieldset>
                  <legend className="font-baslik font-medium text-murekkep">
                    Size nasıl ulaşalım?
                  </legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ILETISIM_TERCIHLERI.map((t) => (
                      <label
                        key={t}
                        className={`cursor-pointer rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors ${
                          d.iletisimTercihi === t
                            ? "border-[var(--kol-ana)] bg-[var(--kol-vurgu)] text-[var(--kol-vurgu-metin)]"
                            : "border-cizgi bg-white text-murekkep-soluk hover:border-[var(--kol-ana)]/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="iletisim"
                          checked={d.iletisimTercihi === t}
                          onChange={() => guncelle({ iletisimTercihi: t })}
                          className="sr-only"
                        />
                        {ILETISIM_ETIKET[t]}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="font-baslik font-medium text-murekkep">
                    Bizi nereden duydunuz?
                    <span className="ml-2 text-xs font-normal text-murekkep-soluk">
                      isteğe bağlı
                    </span>
                  </legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {KAYNAKLAR.map((k) => (
                      <label
                        key={k}
                        className={`cursor-pointer rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors ${
                          d.kaynak === k
                            ? "border-[var(--kol-ana)] bg-[var(--kol-vurgu)] text-[var(--kol-vurgu-metin)]"
                            : "border-cizgi bg-white text-murekkep-soluk hover:border-[var(--kol-ana)]/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="kaynak"
                          checked={d.kaynak === k}
                          onChange={() => guncelle({ kaynak: k })}
                          className="sr-only"
                        />
                        {KAYNAK_ETIKET[k]}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <Alan
                  etiket="Eklemek istediğiniz bir şey var mı?"
                  ipucu="Alerji, özel durum, ikinci çocuk gibi."
                >
                  {(p) => (
                    <textarea
                      {...p}
                      rows={3}
                      value={d.notMetni}
                      onChange={(e) => guncelle({ notMetni: e.target.value })}
                      className={girdiSinifi}
                    />
                  )}
                </Alan>

                {/* Bal tuzagi. Ekran okuyucudan ve klavyeden gizli. */}
                <div aria-hidden="true" className="absolute left-[-9999px]">
                  <label htmlFor="website">Web siteniz</label>
                  <input
                    id="website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={d.website}
                    onChange={(e) => guncelle({ website: e.target.value })}
                  />
                </div>

                <div className="space-y-3 rounded-kart border-2 border-cizgi bg-white p-5">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={d.kvkkOnay}
                      onChange={(e) => guncelle({ kvkkOnay: e.target.checked })}
                      className="mt-0.5 size-5 shrink-0 accent-[var(--kol-ana)]"
                    />
                    <span className="text-sm text-murekkep">
                      <Link
                        href="/kvkk"
                        target="_blank"
                        className="font-medium text-[var(--kol-koyu)] underline underline-offset-2"
                      >
                        Aydınlatma metnini
                      </Link>{" "}
                      okudum, kişisel verilerimin bu talep için işlenmesini
                      kabul ediyorum.
                    </span>
                  </label>
                  {hatalar.kvkkOnay && (
                    <p
                      role="alert"
                      className="text-sm font-medium text-red-700"
                    >
                      {hatalar.kvkkOnay}
                    </p>
                  )}

                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={d.ticariIletiOnay}
                      onChange={(e) =>
                        guncelle({ ticariIletiOnay: e.target.checked })
                      }
                      className="mt-0.5 size-5 shrink-0 accent-[var(--kol-ana)]"
                    />
                    <span className="text-sm text-murekkep-soluk">
                      Yeni gruplar ve etkinlikler hakkında bilgi almak
                      istiyorum.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* ------------------------------------------------ Adim 6: ozet */}
            {adim === "ozet" && (
              <Ozet
                d={d}
                yasAy={yasAy}
                aileAdi={secilenAile?.ad}
                paket={aktifPaket}
                fiyatYok={Boolean(fiyatYok)}
                kampanyaAcik={kampanyaAcik}
                adimaGit={adimaGit}
              />
            )}
          </AdimGecisi>
        </AnimatePresence>
      </div>

      {sunucuHatasi && (
        <p
          role="alert"
          className="mt-6 rounded-kart border-2 border-red-300 bg-red-50 p-4 text-sm font-medium text-red-800"
        >
          {sunucuHatasi}
        </p>
      )}

      <div className="mt-8 flex items-center gap-3">
        {adimIndex > 0 && (
          <Buton gorunum="cizgili" onClick={geri} type="button">
            <Ikon.OkGeri boyut={18} />
            Geri
          </Buton>
        )}

        {!sonAdimMi ? (
          <Buton onClick={ileri} type="button" className="flex-1 sm:flex-none">
            Devam
            <Ikon.Ok boyut={18} />
          </Buton>
        ) : (
          <Buton
            onClick={gonder}
            type="button"
            disabled={gonderiliyor}
            olcu="lg"
            className="flex-1"
          >
            {gonderiliyor ? "Gönderiliyor" : "Talebimi gönder"}
            {!gonderiliyor && <Ikon.Ok boyut={19} />}
          </Buton>
        )}
      </div>

      {/* Fiyat adim 3'ten sonra ekranda sabit kalir. */}
      {adimIndex >= 2 && (
        <FiyatPaneli
          paket={aktifPaket}
          programAdi={secilenAile?.ad ?? "Tek seferlik atölye"}
          fiyatYok={Boolean(fiyatYok)}
          kampanyaAcik={kampanyaAcik}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------- ozet

function OzetSatiri({
  etiket,
  deger,
  duzenle,
}: {
  etiket: string;
  deger: string;
  duzenle?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-cizgi py-3 last:border-0">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.1em] text-murekkep-soluk">
          {etiket}
        </p>
        <p className="mt-0.5 font-medium text-murekkep">{deger}</p>
      </div>
      {duzenle && (
        <button
          type="button"
          onClick={duzenle}
          className="shrink-0 text-sm font-medium text-[var(--kol-koyu)] underline underline-offset-2"
        >
          Düzenle
        </button>
      )}
    </div>
  );
}

function Ozet({
  d,
  yasAy,
  aileAdi,
  paket,
  fiyatYok,
  kampanyaAcik,
  adimaGit,
}: {
  d: Durum;
  yasAy: number;
  aileAdi?: string;
  paket?: ReturnType<typeof paketBul>;
  fiyatYok: boolean;
  kampanyaAcik: boolean;
  adimaGit: (k: AdimKodu) => void;
}) {
  const programMetni =
    d.secim?.tur === "aile"
      ? (aileAdi ?? "")
      : d.secim?.tur === "tek-seferlik"
        ? "Tek seferlik atölye"
        : d.secim?.tur === "serbest-oyun"
          ? "Serbest oyun"
          : d.secim?.tur === "parti"
            ? "Doğum günü ve parti"
            : d.secim?.tur === "anaokulu"
              ? "Anaokulu ön kaydı"
              : "";

  const saatMetni = d.saatUymuyor
    ? `Uygun saat yok: ${d.saatNotu}`
    : d.secilenSlotIdler
        .map((id) => {
          const s = slotBul(id);
          return s ? `${GUN_ADI[s.gun]} ${s.bas} - ${s.bit}` : id;
        })
        .join(" · ") || "Seçilmedi";

  return (
    <div className="rounded-kart border-2 border-cizgi bg-white p-5 sm:p-6">
      <OzetSatiri
        etiket="Çocuk"
        deger={`${d.cocukAdi ? d.cocukAdi + ", " : ""}${yasMetni(yasAy)}`}
        duzenle={() => adimaGit("cocuk")}
      />
      <OzetSatiri
        etiket="Program"
        deger={programMetni}
        duzenle={() => adimaGit("program")}
      />
      {d.secim?.tur === "aile" && paket && (
        <OzetSatiri
          etiket="Paket"
          deger={`${paket.etiket} · ${tlYaz(gecerliFiyat(paket, kampanyaAcik))}`}
          duzenle={() => adimaGit("paket")}
        />
      )}
      {(d.secim?.tur === "aile" ||
        d.secim?.tur === "tek-seferlik" ||
        d.secim?.tur === "serbest-oyun") && (
        <OzetSatiri
          etiket="Gün ve saat"
          deger={saatMetni}
          duzenle={() => adimaGit("saat")}
        />
      )}
      <OzetSatiri
        etiket="Veli"
        deger={`${d.veliAdi} · ${telefonYaz(d.telefon.replace(/\D/g, "").slice(-10))}`}
        duzenle={() => adimaGit("veli")}
      />
      {d.notMetni && (
        <OzetSatiri
          etiket="Notunuz"
          deger={d.notMetni}
          duzenle={() => adimaGit("veli")}
        />
      )}
      {fiyatYok && (
        <p className="mt-4 rounded-yumusak bg-krem-koyu p-4 text-sm text-murekkep-soluk">
          Bu atölyenin ücretini telefonda paylaşıyoruz.
        </p>
      )}
    </div>
  );
}

/** AILELER disaridan da kullanilabilsin diye disari acilir. */
export { AILELER };
