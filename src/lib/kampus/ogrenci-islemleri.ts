"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sunucuIstemcisi } from "@/lib/supabase/server";
import { adminZorunlu } from "./oturum";
import { SLOTLAR } from "@/lib/data/program";
import { atolyeBul } from "@/lib/data/atolyeler";
import { GUN_ADI } from "@/lib/data/types";

/**
 * Ogrenci, veli ve sinif islemleri. PLAN.md Bolum 30.
 *
 * Server action'lar tarayicidan dogrudan cagrilabilir; her biri kendi
 * icinde hem YETKIYI hem GIRDIYI dogruluyor.
 */

export type IslemSonucu =
  | { ok: true; id?: string }
  | { ok: false; hata: string };

/** Telefonu 5XXXXXXXXX bicimine getirir. Basvurular tablosuyla ayni bicim. */
function telefonNormalle(ham: string): string {
  return ham.replace(/\D/g, "").replace(/^(90|0)/, "");
}

// ------------------------------------------------------- siniflari uret

const donemSemasi = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{4}$/, "Dönem 2026-2027 biçiminde olmalı.");

/**
 * Haftalik programdaki her slot icin sinif olusturur.
 *
 * Elle otuz sinif acmak yerine programdan uretiliyor: kurumun gercek
 * programi zaten kod icinde ve dogrulanmis durumda. Var olan slotlar
 * ATLANIYOR (`slot_id + donem` tekil), yani tekrar calistirmak zararsiz.
 */
export async function siniflariProgramdanUret(
  donem: string,
): Promise<IslemSonucu> {
  await adminZorunlu();

  const d = donemSemasi.safeParse(donem);
  if (!d.success) return { ok: false, hata: d.error.issues[0].message };

  const db = await sunucuIstemcisi();

  const { data: mevcut } = await db
    .from("siniflar")
    .select("slot_id")
    .eq("donem", d.data);
  const varOlan = new Set((mevcut ?? []).map((s) => s.slot_id));

  /*
    Serbest oyun disarida: atanmis ogretmeni ve kontenjani olan bir grup
    degil, her grup gununun ilk saati.
  */
  const yeniler = SLOTLAR.filter(
    (s) => s.atolyeSlug !== "serbest-oyun" && !varOlan.has(s.id),
  ).map((s) => ({
    ad: `${GUN_ADI[s.gun]} ${s.bas} · ${atolyeBul(s.atolyeSlug)?.kisaAd ?? s.atolyeSlug}`,
    slot_id: s.id,
    atolye_slug: s.atolyeSlug,
    program_slug: atolyeBul(s.atolyeSlug)?.ailesi ?? null,
    gun: s.gun,
    bas: s.bas,
    bit: s.bit,
    // Excel: grup mevcudu en fazla 12.
    kontenjan: 12,
    ogretmen_ad: s.ogretmenler[0] ?? null,
    donem: d.data,
    aktif: true,
  }));

  if (yeniler.length === 0) {
    return { ok: false, hata: "Bu dönem için bütün sınıflar zaten açılmış." };
  }

  const { error } = await db.from("siniflar").insert(yeniler);
  if (error) return { ok: false, hata: `Sınıflar açılamadı: ${error.message}` };

  revalidatePath("/kampus/siniflar");
  return { ok: true };
}

// -------------------------------------------------- sinif ogretmen atama

const atamaSemasi = z.object({
  sinifId: z.uuid("Geçersiz sınıf."),
  // Bos dize = atamayi kaldir.
  ogretmenAd: z.string().trim().max(60),
});

export async function sinifaOgretmenAta(
  sinifId: string,
  ogretmenAd: string,
): Promise<IslemSonucu> {
  await adminZorunlu();

  const s = atamaSemasi.safeParse({ sinifId, ogretmenAd });
  if (!s.success) return { ok: false, hata: s.error.issues[0].message };

  const db = await sunucuIstemcisi();
  const { error } = await db
    .from("siniflar")
    .update({ ogretmen_ad: s.data.ogretmenAd || null })
    .eq("id", s.data.sinifId);

  if (error) return { ok: false, hata: "Atama kaydedilemedi." };

  revalidatePath("/kampus/siniflar");
  revalidatePath(`/kampus/siniflar/${s.data.sinifId}`);
  return { ok: true };
}

const kontenjanSemasi = z.object({
  sinifId: z.uuid("Geçersiz sınıf."),
  kontenjan: z.coerce
    .number()
    .int()
    .min(1, "Kontenjan en az 1 olmalı.")
    .max(40, "Kontenjan en fazla 40 olabilir."),
});

export async function kontenjanDegistir(
  sinifId: string,
  kontenjan: number,
): Promise<IslemSonucu> {
  await adminZorunlu();

  const s = kontenjanSemasi.safeParse({ sinifId, kontenjan });
  if (!s.success) return { ok: false, hata: s.error.issues[0].message };

  const db = await sunucuIstemcisi();
  const { error } = await db
    .from("siniflar")
    .update({ kontenjan: s.data.kontenjan })
    .eq("id", s.data.sinifId);

  if (error) return { ok: false, hata: "Kontenjan kaydedilemedi." };

  revalidatePath("/kampus/siniflar");
  revalidatePath(`/kampus/siniflar/${s.data.sinifId}`);
  return { ok: true };
}

// ------------------------------------------------- elle ogrenci ekleme

const yeniOgrenciSemasi = z.object({
  ad: z.string().trim().min(2, "Çocuğun adı gerekli.").max(60),
  soyad: z.string().trim().max(60).optional(),
  dogumTarihi: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Doğum tarihi gerekli."),
  kurum: z.enum(["oyun-evi", "anaokulu", "parti"]),
  alerji: z.string().trim().max(300).optional(),
  saglikNotu: z.string().trim().max(500).optional(),
  notlar: z.string().trim().max(1000).optional(),

  /*
    VELI BILGISI ZORUNLU. Velisi olmayan bir cocuk kaydi kime
    ulasilacagini bilmediginiz bir kayit demek; ilk gun aranacak biri
    olmadan ogrenci acmak ise yaramiyor.
  */
  veliAdSoyad: z.string().trim().min(2, "Veli adı gerekli.").max(80),
  veliTelefon: z
    .string()
    .trim()
    .min(10, "Veli telefonu gerekli.")
    .max(20),
  veliEposta: z
    .string()
    .trim()
    .email("Geçersiz e-posta.")
    .optional()
    .or(z.literal("")),
  yakinlik: z.enum(["anne", "baba", "vasi", "veli"]),

  // Istege bagli: hemen bir sinifa kaydet.
  sinifId: z.uuid().optional().or(z.literal("")),
  // Istege bagli: ilk borc kaydi.
  ucret: z.coerce.number().int().min(0).max(1_000_000).optional(),
  paketKod: z.string().trim().max(20).optional(),
});

export type YeniOgrenciGirdisi = z.input<typeof yeniOgrenciSemasi>;

/**
 * Elle ogrenci ekler ve BAGLI KAYITLARI birlikte kurar:
 * ogrenci, veli, ogrenci-veli baglantisi, istege bagli sinif kaydi ve
 * istege bagli ilk borc.
 *
 * Neden tek islem: bunlari ayri ekranlarda yapmak, yarim kalmis kayitlar
 * uretiyor. Velisi girilmemis ogrenci, sinifi olmayan ogrenci, borcu
 * islenmemis kayit... Panelde en sik yapilan is "yeni cocuk geldi" ve
 * o isin tamami burada bitiyor.
 *
 * Ayni telefonlu veli varsa YENIDEN OLUSTURULMUYOR, mevcut veliye
 * baglaniyor: kardes kaydinda ikinci bir veli karti cikmasin.
 */
export async function ogrenciEkle(
  girdi: YeniOgrenciGirdisi,
): Promise<IslemSonucu> {
  const oturum = await adminZorunlu();

  const g = yeniOgrenciSemasi.safeParse(girdi);
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };
  const v = g.data;

  const telefon = telefonNormalle(v.veliTelefon);
  if (telefon.length !== 10) {
    return { ok: false, hata: "Veli telefonu 10 haneli olmalı." };
  }

  const db = await sunucuIstemcisi();

  /*
    Sinif kontrolu EN BASTA: cocugu kaydettikten sonra "sinif dolu" demek,
    geri alinacak yarim bir kayit birakir. Once bakiyoruz, sonra yaziyoruz.
  */
  if (v.sinifId) {
    const { data: sinif } = await db
      .from("siniflar")
      .select("kontenjan, aktif, kayitlar(durum)")
      .eq("id", v.sinifId)
      .maybeSingle();

    if (!sinif) return { ok: false, hata: "Sınıf bulunamadı." };

    const s = sinif as unknown as {
      kontenjan: number;
      aktif: boolean;
      kayitlar: { durum: string }[];
    };
    if (!s.aktif) return { ok: false, hata: "Sınıf kapalı." };

    const dolu = (s.kayitlar ?? []).filter((k) => k.durum === "aktif").length;
    if (dolu >= s.kontenjan) {
      return { ok: false, hata: `Sınıf dolu (${dolu}/${s.kontenjan}).` };
    }
  }

  const { data: ogrenci, error: ogrenciHatasi } = await db
    .from("ogrenciler")
    .insert({
      ad: v.ad,
      soyad: v.soyad || null,
      dogum_tarihi: v.dogumTarihi,
      kurum: v.kurum,
      durum: "aktif",
      alerji: v.alerji || null,
      saglik_notu: v.saglikNotu || null,
      notlar: v.notlar || null,
    })
    .select("id")
    .single();

  if (ogrenciHatasi || !ogrenci) {
    return { ok: false, hata: "Öğrenci kaydı oluşturulamadı." };
  }
  const ogrenciId = (ogrenci as { id: string }).id;

  // Veli: telefonla ara, varsa bagla.
  const { data: mevcutVeli } = await db
    .from("veliler")
    .select("id")
    .eq("telefon", telefon)
    .maybeSingle();

  let veliId = (mevcutVeli as { id: string } | null)?.id;
  if (!veliId) {
    const { data: yeniVeli, error: veliHatasi } = await db
      .from("veliler")
      .insert({
        ad_soyad: v.veliAdSoyad,
        telefon,
        eposta: v.veliEposta || null,
      })
      .select("id")
      .single();
    if (veliHatasi || !yeniVeli) {
      /*
        Veli olusmadiysa ogrenci kaydi da geri aliniyor. Yarim kalan bir
        ogrenci -- velisi olmayan, kime ulasilacagi bilinmeyen bir kayit --
        hic olmamasindan kotudur.
      */
      await db.from("ogrenciler").delete().eq("id", ogrenciId);
      return { ok: false, hata: "Veli kaydı oluşturulamadı." };
    }
    veliId = (yeniVeli as { id: string }).id;
  }

  await db.from("ogrenci_veli").insert({
    ogrenci_id: ogrenciId,
    veli_id: veliId,
    yakinlik: v.yakinlik,
    birincil: true,
  });

  /*
    Sinif kaydi ve borc ISTEGE BAGLI. Basarisiz olurlarsa ogrenci kaydi
    geri ALINMIYOR: cocuk ve velisi dogru kaydedildi, eksik olan sonradan
    ekranından tamamlanabilir.
  */
  if (v.sinifId) {
    await db.from("kayitlar").insert({
      ogrenci_id: ogrenciId,
      sinif_id: v.sinifId,
      paket_kod: v.paketKod || null,
      ucret: v.ucret ?? null,
      durum: "aktif",
    });
  }

  if (v.ucret && v.ucret > 0) {
    await db.from("odemeler").insert({
      ogrenci_id: ogrenciId,
      tur: "borc",
      tutar: v.ucret,
      tarih: new Date().toISOString().slice(0, 10),
      aciklama: v.paketKod ? `Kayıt · ${v.paketKod}` : "Kayıt",
      olusturan: oturum.adSoyad,
    });
  }

  revalidatePath("/kampus/ogrenciler");
  revalidatePath("/kampus/veliler");
  revalidatePath("/kampus/siniflar");
  revalidatePath("/kampus/cari");
  return { ok: true, id: ogrenciId };
}

// ------------------------------------------------ lead'den ogrenci olustur

/**
 * Lead'i ogrenciye cevirir: `ogrenciEkle` ile kayitlari kurar, sonra lead'i
 * "kayit_oldu" isaretleyip olusan ogrenciye baglar.
 *
 * Lead SILINMIYOR: talebin nereden geldigi (Instagram, tavsiye, tabela)
 * donusum oraniyla birlikte kayitli kalsin. Raporlarda "hangi kanal
 * ogrenciye donusuyor" sorusunun cevabi bu baglanti.
 *
 * Ayni lead iki kez donusturulemez: ikinci cagri var olan ogrenciyi doner.
 */
export async function leaddenOgrenciOlustur(
  leadId: string,
  girdi: YeniOgrenciGirdisi,
): Promise<IslemSonucu> {
  await adminZorunlu();

  const l = z.uuid().safeParse(leadId);
  if (!l.success) return { ok: false, hata: "Geçersiz lead." };

  const db = await sunucuIstemcisi();

  const { data: lead } = await db
    .from("leadler")
    .select("id, ogrenci_id")
    .eq("id", l.data)
    .maybeSingle();

  if (!lead) return { ok: false, hata: "Lead bulunamadı." };

  const mevcut = (lead as { ogrenci_id: string | null }).ogrenci_id;
  if (mevcut) return { ok: true, id: mevcut };

  const sonuc = await ogrenciEkle(girdi);
  if (!sonuc.ok) return sonuc;

  await db
    .from("leadler")
    .update({ durum: "kayit_oldu", ogrenci_id: sonuc.id })
    .eq("id", l.data);

  revalidatePath("/kampus/leadler");
  revalidatePath("/kampus/raporlar");
  return sonuc;
}

// ------------------------------------------- basvurudan ogrenci olustur

const donusturSemasi = z.object({
  basvuruId: z.uuid("Geçersiz başvuru."),
});

/**
 * Basvuruyu ogrenciye cevirir: cocuk kaydini ve veli kaydini olusturur,
 * ikisini baglar, basvurunun durumunu "kayit_oldu" yapar.
 *
 * Basvuru SILINMIYOR: nereden geldigi ve ilk talebin ne oldugu kayit olarak
 * duruyor. Ogrenci kaydi basvuruya `basvuru_id` ile bagli.
 *
 * Ayni basvuru iki kez donusturulemez; ikinci cagri var olan ogrenciyi
 * doner. Cift tiklama veya geri tusu yuzunden iki cocuk kaydi olusmasin.
 */
export async function basvurudanOgrenciOlustur(
  basvuruId: string,
): Promise<IslemSonucu> {
  await adminZorunlu();

  const g = donusturSemasi.safeParse({ basvuruId });
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };

  const db = await sunucuIstemcisi();

  const { data: varOlan } = await db
    .from("ogrenciler")
    .select("id")
    .eq("basvuru_id", g.data.basvuruId)
    .maybeSingle();
  if (varOlan) return { ok: true, id: (varOlan as { id: string }).id };

  const { data: basvuru, error: okumaHatasi } = await db
    .from("basvurular")
    .select("*")
    .eq("id", g.data.basvuruId)
    .maybeSingle();

  if (okumaHatasi || !basvuru) {
    return { ok: false, hata: "Başvuru bulunamadı." };
  }

  const b = basvuru as {
    cocuk_adi: string | null;
    dogum_tarihi: string;
    kurum: string;
    veli_adi: string;
    telefon: string;
    eposta: string | null;
    not_metni: string | null;
  };

  const { data: ogrenci, error: ogrenciHatasi } = await db
    .from("ogrenciler")
    .insert({
      // Cocuk adi verilmemis olabilir; bos birakmak yerine veliden turetiyoruz.
      ad: b.cocuk_adi?.trim() || `${b.veli_adi.split(" ")[0]}'in çocuğu`,
      dogum_tarihi: b.dogum_tarihi,
      kurum: b.kurum,
      basvuru_id: g.data.basvuruId,
      durum: "aktif",
      notlar: b.not_metni,
    })
    .select("id")
    .single();

  if (ogrenciHatasi || !ogrenci) {
    return { ok: false, hata: "Öğrenci kaydı oluşturulamadı." };
  }

  /*
    Ayni telefonla kayitli veli varsa YENIDEN OLUSTURULMUYOR: kardes
    kaydinda ikinci bir veli karti cikmasin.
  */
  const telefon = telefonNormalle(b.telefon);
  const { data: mevcutVeli } = await db
    .from("veliler")
    .select("id")
    .eq("telefon", telefon)
    .maybeSingle();

  let veliId = (mevcutVeli as { id: string } | null)?.id;

  if (!veliId) {
    const { data: yeniVeli, error: veliHatasi } = await db
      .from("veliler")
      .insert({
        ad_soyad: b.veli_adi,
        telefon,
        eposta: b.eposta,
      })
      .select("id")
      .single();
    if (veliHatasi || !yeniVeli) {
      return { ok: false, hata: "Veli kaydı oluşturulamadı." };
    }
    veliId = (yeniVeli as { id: string }).id;
  }

  await db.from("ogrenci_veli").insert({
    ogrenci_id: (ogrenci as { id: string }).id,
    veli_id: veliId,
    yakinlik: "veli",
    birincil: true,
  });

  await db
    .from("basvurular")
    .update({ durum: "kayit_oldu" })
    .eq("id", g.data.basvuruId);

  revalidatePath("/kampus/ogrenciler");
  revalidatePath("/kampus/basvurular");
  revalidatePath(`/kampus/basvurular/${g.data.basvuruId}`);
  return { ok: true, id: (ogrenci as { id: string }).id };
}

// ---------------------------------------------------- sinifa kayit etme

const sinifKaydiSemasi = z.object({
  ogrenciId: z.uuid("Geçersiz öğrenci."),
  sinifId: z.uuid("Geçersiz sınıf."),
});

export async function sinifaKaydet(
  ogrenciId: string,
  sinifId: string,
): Promise<IslemSonucu> {
  await adminZorunlu();

  const s = sinifKaydiSemasi.safeParse({ ogrenciId, sinifId });
  if (!s.success) return { ok: false, hata: s.error.issues[0].message };

  const db = await sunucuIstemcisi();

  /*
    Kontenjan kontrolu. Yaris durumunda iki es zamanli kayit siniri
    asabilir; kabul edilebilir, cunku kontenjan kati bir sinir degil ve
    admin doluluk ekraninda gorup duzeltebiliyor. Kati olsaydi veritabani
    tarafinda kilit gerekirdi.
  */
  const { data: sinif } = await db
    .from("siniflar")
    .select("kontenjan, kayitlar(id, durum)")
    .eq("id", s.data.sinifId)
    .maybeSingle();

  if (!sinif) return { ok: false, hata: "Sınıf bulunamadı." };

  const veri = sinif as unknown as {
    kontenjan: number;
    kayitlar: { durum: string }[];
  };
  const dolu = (veri.kayitlar ?? []).filter((k) => k.durum === "aktif").length;
  if (dolu >= veri.kontenjan) {
    return { ok: false, hata: `Sınıf dolu (${dolu}/${veri.kontenjan}).` };
  }

  const { error } = await db.from("kayitlar").insert({
    ogrenci_id: s.data.ogrenciId,
    sinif_id: s.data.sinifId,
    durum: "aktif",
  });

  if (error) {
    // Tekil indeks: ayni ogrenci ayni sinifa iki kez aktif kaydedilemez.
    if (error.code === "23505") {
      return { ok: false, hata: "Öğrenci bu sınıfa zaten kayıtlı." };
    }
    return { ok: false, hata: "Kayıt oluşturulamadı." };
  }

  revalidatePath(`/kampus/ogrenciler/${s.data.ogrenciId}`);
  revalidatePath(`/kampus/siniflar/${s.data.sinifId}`);
  revalidatePath("/kampus/siniflar");
  return { ok: true };
}

export async function sinifKaydiniBitir(
  kayitId: string,
): Promise<IslemSonucu> {
  await adminZorunlu();

  const g = z.uuid().safeParse(kayitId);
  if (!g.success) return { ok: false, hata: "Geçersiz kayıt." };

  const db = await sunucuIstemcisi();
  const { error } = await db
    .from("kayitlar")
    .update({ durum: "bitti", bitis: new Date().toISOString().slice(0, 10) })
    .eq("id", g.data);

  if (error) return { ok: false, hata: "Kayıt kapatılamadı." };

  revalidatePath("/kampus/siniflar");
  revalidatePath("/kampus/ogrenciler");
  return { ok: true };
}
