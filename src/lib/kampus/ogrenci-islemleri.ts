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

// ------------------------------------------------------ ogrenci duzenleme

const ogrenciGuncelSemasi = z.object({
  id: z.uuid("Geçersiz öğrenci."),
  ad: z.string().trim().min(2, "Çocuğun adı gerekli.").max(60),
  soyad: z.string().trim().max(60).optional(),
  dogumTarihi: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Doğum tarihi gerekli."),
  kurum: z.enum(["oyun-evi", "anaokulu", "parti"]),
  durum: z.enum(["aday", "aktif", "dondurdu", "ayrildi"]),
  kayitTarihi: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Kayıt tarihi geçersiz.")
    .optional()
    .or(z.literal("")),
  alerji: z.string().trim().max(300).optional(),
  saglikNotu: z.string().trim().max(500).optional(),
  notlar: z.string().trim().max(1000).optional(),
});

export type OgrenciGuncelGirdisi = z.input<typeof ogrenciGuncelSemasi>;

/**
 * Ogrenci kunyesini gunceller.
 *
 * Veli baglantisi ve sinif kaydi BURADA DEGIL: onlarin kendi islemleri var
 * (`ogrenciyeVeliBagla`, `sinifaKaydet`). Tek forma sigdirmak, bir alani
 * duzeltirken baska bir baglantiyi sessizce koparma riski demekti.
 */
export async function ogrenciGuncelle(
  girdi: OgrenciGuncelGirdisi,
): Promise<IslemSonucu> {
  await adminZorunlu();

  const g = ogrenciGuncelSemasi.safeParse(girdi);
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };
  const v = g.data;

  const db = await sunucuIstemcisi();
  const { error } = await db
    .from("ogrenciler")
    .update({
      ad: v.ad,
      soyad: v.soyad || null,
      dogum_tarihi: v.dogumTarihi,
      kurum: v.kurum,
      durum: v.durum,
      ...(v.kayitTarihi ? { kayit_tarihi: v.kayitTarihi } : {}),
      alerji: v.alerji || null,
      saglik_notu: v.saglikNotu || null,
      notlar: v.notlar || null,
    })
    .eq("id", v.id);

  if (error) return { ok: false, hata: "Öğrenci kaydedilemedi." };

  revalidatePath("/kampus/ogrenciler");
  revalidatePath(`/kampus/ogrenciler/${v.id}`);
  revalidatePath("/kampus/yemek");
  return { ok: true, id: v.id };
}

/**
 * Ogrencinin durumunu degistirir.
 *
 * "ayrildi" ve "dondurdu" secildiginde AKTIF SINIF KAYITLARI da kapaniyor:
 * ayrilmis bir cocugun sinif listesinde durmasi yoklamada her hafta karsiya
 * cikiyor ve doluluk sayisini yaniltiyor.
 */
export async function ogrenciDurumDegistir(
  id: string,
  durum: string,
): Promise<IslemSonucu> {
  await adminZorunlu();

  const g = z
    .object({
      id: z.uuid("Geçersiz öğrenci."),
      durum: z.enum(["aday", "aktif", "dondurdu", "ayrildi"]),
    })
    .safeParse({ id, durum });
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };

  const db = await sunucuIstemcisi();
  const { error } = await db
    .from("ogrenciler")
    .update({ durum: g.data.durum })
    .eq("id", g.data.id);

  if (error) return { ok: false, hata: "Durum kaydedilemedi." };

  if (g.data.durum === "ayrildi" || g.data.durum === "dondurdu") {
    await db
      .from("kayitlar")
      .update({
        durum: g.data.durum === "ayrildi" ? "bitti" : "dondurdu",
        bitis: new Date().toISOString().slice(0, 10),
      })
      .eq("ogrenci_id", g.data.id)
      .eq("durum", "aktif");
  }

  revalidatePath("/kampus/ogrenciler");
  revalidatePath(`/kampus/ogrenciler/${g.data.id}`);
  revalidatePath("/kampus/siniflar");
  return { ok: true };
}

/**
 * Ogrenciyi ve butun bagli kayitlarini siler.
 *
 * SILME degil ARSIVLEME beklenen normal is akisi: ayrilan cocuk "ayrildi"
 * durumuna alinir, gecmisi (yoklama, odeme) durur. Bu islem yalniz YANLIS
 * ACILMIS kayit icin: test kaydi, iki kez girilmis cocuk, yanlis kisiye
 * acilmis dosya.
 *
 * Cari hareketi olan ogrenci silinmiyor: para gecmisi sessizce yok olmamali.
 */
export async function ogrenciSil(id: string): Promise<IslemSonucu> {
  await adminZorunlu();

  const g = z.uuid().safeParse(id);
  if (!g.success) return { ok: false, hata: "Geçersiz öğrenci." };

  const db = await sunucuIstemcisi();

  const { count } = await db
    .from("odemeler")
    .select("id", { count: "exact", head: true })
    .eq("ogrenci_id", g.data);

  if ((count ?? 0) > 0) {
    return {
      ok: false,
      hata: `Bu öğrencinin ${count} cari hareketi var. Silmek yerine durumunu "ayrıldı" yapın.`,
    };
  }

  /* kayitlar, ogrenci_veli ve yoklama satirlari veritabaninda cascade ile
     dusuyor (0003 ve 0004 gocleri); burada ayrica silmeye gerek yok. */
  const { error } = await db.from("ogrenciler").delete().eq("id", g.data);
  if (error) return { ok: false, hata: "Öğrenci silinemedi." };

  revalidatePath("/kampus/ogrenciler");
  revalidatePath("/kampus/veliler");
  revalidatePath("/kampus/siniflar");
  return { ok: true };
}

// ------------------------------------------------------------------ veli

const veliSemasi = z.object({
  adSoyad: z.string().trim().min(2, "Veli adı gerekli.").max(80),
  telefon: z.string().trim().min(10, "Telefon gerekli.").max(20),
  eposta: z
    .string()
    .trim()
    .email("Geçersiz e-posta.")
    .optional()
    .or(z.literal("")),
  adres: z.string().trim().max(300).optional(),
  notlar: z.string().trim().max(1000).optional(),
});

export type VeliGirdisi = z.input<typeof veliSemasi>;

/**
 * Yeni veli kaydi.
 *
 * Ayni telefonlu veli varsa YENISI ACILMIYOR, var olanin kimligi donuyor:
 * kardes kaydinda ikinci bir veli karti cikmasin. `ogrenciEkle` ile ayni
 * kural.
 */
export async function veliEkle(girdi: VeliGirdisi): Promise<IslemSonucu> {
  await adminZorunlu();

  const g = veliSemasi.safeParse(girdi);
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };

  const telefon = telefonNormalle(g.data.telefon);
  if (telefon.length !== 10) {
    return { ok: false, hata: "Telefon 10 haneli olmalı." };
  }

  const db = await sunucuIstemcisi();

  const { data: mevcut } = await db
    .from("veliler")
    .select("id")
    .eq("telefon", telefon)
    .maybeSingle();

  if (mevcut) {
    revalidatePath("/kampus/veliler");
    return { ok: true, id: (mevcut as { id: string }).id };
  }

  const { data, error } = await db
    .from("veliler")
    .insert({
      ad_soyad: g.data.adSoyad,
      telefon,
      eposta: g.data.eposta || null,
      adres: g.data.adres || null,
      notlar: g.data.notlar || null,
    })
    .select("id")
    .single();

  if (error || !data) return { ok: false, hata: "Veli kaydedilemedi." };

  revalidatePath("/kampus/veliler");
  return { ok: true, id: (data as { id: string }).id };
}

export async function veliGuncelle(
  id: string,
  girdi: VeliGirdisi,
): Promise<IslemSonucu> {
  await adminZorunlu();

  const k = z.uuid().safeParse(id);
  if (!k.success) return { ok: false, hata: "Geçersiz veli." };

  const g = veliSemasi.safeParse(girdi);
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };

  const telefon = telefonNormalle(g.data.telefon);
  if (telefon.length !== 10) {
    return { ok: false, hata: "Telefon 10 haneli olmalı." };
  }

  const db = await sunucuIstemcisi();

  /* Telefon baska bir veliye aitse durduruluyor: iki kayit ayni numaraya
     dusunce "hangisini arayacagim" sorusu cikiyor ve veli birlestirme
     mantigi (telefonla eslestirme) bozuluyor. */
  const { data: cakisan } = await db
    .from("veliler")
    .select("id")
    .eq("telefon", telefon)
    .neq("id", k.data)
    .maybeSingle();
  if (cakisan) {
    return { ok: false, hata: "Bu telefon başka bir veli kaydında kayıtlı." };
  }

  const { error } = await db
    .from("veliler")
    .update({
      ad_soyad: g.data.adSoyad,
      telefon,
      eposta: g.data.eposta || null,
      adres: g.data.adres || null,
      notlar: g.data.notlar || null,
    })
    .eq("id", k.data);

  if (error) return { ok: false, hata: "Veli kaydedilemedi." };

  revalidatePath("/kampus/veliler");
  revalidatePath(`/kampus/veliler/${k.data}`);
  return { ok: true, id: k.data };
}

/**
 * Veli kaydini siler.
 *
 * Bagli cocugu varsa silinmiyor: cocuk kaydi velisiz kalirsa kime
 * ulasilacagi bilinmez olur. Once baglanti kaldirilir.
 */
export async function veliSil(id: string): Promise<IslemSonucu> {
  await adminZorunlu();

  const g = z.uuid().safeParse(id);
  if (!g.success) return { ok: false, hata: "Geçersiz veli." };

  const db = await sunucuIstemcisi();

  const { count } = await db
    .from("ogrenci_veli")
    .select("veli_id", { count: "exact", head: true })
    .eq("veli_id", g.data);

  if ((count ?? 0) > 0) {
    return {
      ok: false,
      hata: `Bu veliye bağlı ${count} çocuk var. Önce çocuk bağlantılarını kaldırın.`,
    };
  }

  const { error } = await db.from("veliler").delete().eq("id", g.data);
  if (error) return { ok: false, hata: "Veli silinemedi." };

  revalidatePath("/kampus/veliler");
  return { ok: true };
}

const baglantiSemasi = z.object({
  ogrenciId: z.uuid("Geçersiz öğrenci."),
  veliId: z.uuid("Geçersiz veli."),
  yakinlik: z.enum(["anne", "baba", "vasi", "veli"]),
  birincil: z.boolean().optional(),
});

/**
 * Ogrenciye veli baglar.
 *
 * "birincil" tek olabilir: aramada once denenecek numara birden fazlaysa
 * isaret hicbir sey soylemiyor. Yeni birincil isaretlenirse eskisi
 * dusuruluyor.
 */
export async function ogrenciyeVeliBagla(girdi: {
  ogrenciId: string;
  veliId: string;
  yakinlik: string;
  birincil?: boolean;
}): Promise<IslemSonucu> {
  await adminZorunlu();

  const g = baglantiSemasi.safeParse(girdi);
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };

  const db = await sunucuIstemcisi();

  if (g.data.birincil) {
    await db
      .from("ogrenci_veli")
      .update({ birincil: false })
      .eq("ogrenci_id", g.data.ogrenciId);
  }

  const { error } = await db.from("ogrenci_veli").upsert(
    {
      ogrenci_id: g.data.ogrenciId,
      veli_id: g.data.veliId,
      yakinlik: g.data.yakinlik,
      birincil: g.data.birincil ?? false,
    },
    { onConflict: "ogrenci_id,veli_id" },
  );

  if (error) return { ok: false, hata: "Bağlantı kurulamadı." };

  revalidatePath(`/kampus/ogrenciler/${g.data.ogrenciId}`);
  revalidatePath(`/kampus/veliler/${g.data.veliId}`);
  revalidatePath("/kampus/veliler");
  return { ok: true };
}

/**
 * Ogrenci-veli baglantisini kaldirir.
 *
 * Son veli koparilamiyor: velisi olmayan bir cocuk kaydi, ilk gun aranacak
 * kimsesi olmayan bir kayit demek.
 */
export async function veliBagiKaldir(
  ogrenciId: string,
  veliId: string,
): Promise<IslemSonucu> {
  await adminZorunlu();

  const g = z
    .object({ ogrenciId: z.uuid(), veliId: z.uuid() })
    .safeParse({ ogrenciId, veliId });
  if (!g.success) return { ok: false, hata: "Geçersiz bağlantı." };

  const db = await sunucuIstemcisi();

  const { count } = await db
    .from("ogrenci_veli")
    .select("veli_id", { count: "exact", head: true })
    .eq("ogrenci_id", g.data.ogrenciId);

  if ((count ?? 0) <= 1) {
    return {
      ok: false,
      hata: "Öğrencinin tek velisi bu. Önce başka bir veli bağlayın.",
    };
  }

  const { error } = await db
    .from("ogrenci_veli")
    .delete()
    .eq("ogrenci_id", g.data.ogrenciId)
    .eq("veli_id", g.data.veliId);

  if (error) return { ok: false, hata: "Bağlantı kaldırılamadı." };

  revalidatePath(`/kampus/ogrenciler/${g.data.ogrenciId}`);
  revalidatePath(`/kampus/veliler/${g.data.veliId}`);
  return { ok: true };
}

// -------------------------------------------------------- sinif duzenleme

const saatSemasi = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Saat 09:30 biçiminde olmalı.");

const sinifSemasi = z.object({
  ad: z.string().trim().min(2, "Sınıf adı gerekli.").max(80),
  gun: z.enum([
    "pazartesi",
    "sali",
    "carsamba",
    "persembe",
    "cuma",
    "cumartesi",
    "pazar",
  ]),
  bas: saatSemasi,
  bit: saatSemasi,
  atolyeSlug: z.string().trim().max(60).optional(),
  kontenjan: z.coerce
    .number()
    .int()
    .min(1, "Kontenjan en az 1 olmalı.")
    .max(40, "Kontenjan en fazla 40 olabilir."),
  ogretmenAd: z.string().trim().max(60).optional(),
  donem: donemSemasi,
  aktif: z.boolean().optional(),
  notlar: z.string().trim().max(500).optional(),
});

export type SinifGirdisi = z.input<typeof sinifSemasi>;

/** Atolye slug'indan program ailesi. Bilinmeyen slug'da null. */
function aileSlugu(slug: string | undefined): string | null {
  if (!slug) return null;
  return atolyeBul(slug as Parameters<typeof atolyeBul>[0])?.ailesi ?? null;
}

/**
 * Elle sinif acar.
 *
 * Normal yol `siniflariProgramdanUret`: kurumun gercek programi zaten kod
 * icinde. Bu islem programda KARSILIGI OLMAYAN gruplar icin: telafi grubu,
 * yaz donemi, ozel istek uzerine acilan bir seans. `slot_id` bos kaliyor,
 * boylece bir sonraki uretim bu kaydi tekrar acmaya calismiyor.
 */
export async function sinifEkle(girdi: SinifGirdisi): Promise<IslemSonucu> {
  await adminZorunlu();

  const g = sinifSemasi.safeParse(girdi);
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };
  const v = g.data;

  if (v.bit <= v.bas) {
    return { ok: false, hata: "Bitiş saati başlangıçtan sonra olmalı." };
  }

  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("siniflar")
    .insert({
      ad: v.ad,
      slot_id: null,
      atolye_slug: v.atolyeSlug || null,
      program_slug: aileSlugu(v.atolyeSlug),
      gun: v.gun,
      bas: v.bas,
      bit: v.bit,
      kontenjan: v.kontenjan,
      ogretmen_ad: v.ogretmenAd || null,
      donem: v.donem,
      aktif: v.aktif ?? true,
      notlar: v.notlar || null,
    })
    .select("id")
    .single();

  if (error || !data) return { ok: false, hata: "Sınıf açılamadı." };

  revalidatePath("/kampus/siniflar");
  revalidatePath("/kampus/yoklama");
  return { ok: true, id: (data as { id: string }).id };
}

export async function sinifGuncelle(
  id: string,
  girdi: SinifGirdisi,
): Promise<IslemSonucu> {
  await adminZorunlu();

  const k = z.uuid().safeParse(id);
  if (!k.success) return { ok: false, hata: "Geçersiz sınıf." };

  const g = sinifSemasi.safeParse(girdi);
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };
  const v = g.data;

  if (v.bit <= v.bas) {
    return { ok: false, hata: "Bitiş saati başlangıçtan sonra olmalı." };
  }

  const db = await sunucuIstemcisi();

  /* Kontenjan kayitli ogrenci sayisinin altina cekilemiyor: 12 kisilik
     sinifta 15 kayit, doluluk ekranini ve yoklamayi tutarsiz birakiyor. */
  const { count } = await db
    .from("kayitlar")
    .select("id", { count: "exact", head: true })
    .eq("sinif_id", k.data)
    .eq("durum", "aktif");

  if (v.kontenjan < (count ?? 0)) {
    return {
      ok: false,
      hata: `Sınıfta ${count} kayıtlı öğrenci var, kontenjan bunun altına indirilemez.`,
    };
  }

  const { error } = await db
    .from("siniflar")
    .update({
      ad: v.ad,
      atolye_slug: v.atolyeSlug || null,
      program_slug: aileSlugu(v.atolyeSlug),
      gun: v.gun,
      bas: v.bas,
      bit: v.bit,
      kontenjan: v.kontenjan,
      ogretmen_ad: v.ogretmenAd || null,
      donem: v.donem,
      aktif: v.aktif ?? true,
      notlar: v.notlar || null,
    })
    .eq("id", k.data);

  if (error) return { ok: false, hata: "Sınıf kaydedilemedi." };

  revalidatePath("/kampus/siniflar");
  revalidatePath(`/kampus/siniflar/${k.data}`);
  revalidatePath("/kampus/yoklama");
  return { ok: true, id: k.data };
}

/** Sinifi kapatir veya yeniden acar. Kapali sinif yoklamada cikmiyor. */
export async function sinifAktifligiDegistir(
  id: string,
  aktif: boolean,
): Promise<IslemSonucu> {
  await adminZorunlu();

  const g = z.uuid().safeParse(id);
  if (!g.success) return { ok: false, hata: "Geçersiz sınıf." };

  const db = await sunucuIstemcisi();
  const { error } = await db.from("siniflar").update({ aktif }).eq("id", g.data);

  if (error) return { ok: false, hata: "Sınıf kaydedilemedi." };

  revalidatePath("/kampus/siniflar");
  revalidatePath(`/kampus/siniflar/${g.data}`);
  revalidatePath("/kampus/yoklama");
  return { ok: true };
}

/**
 * Sinifi siler.
 *
 * Kaydi veya islenmis dersi olan sinif SILINMIYOR: gecmis yoklama ve
 * kayitlar ona bagli. Boyle bir sinif kapatilir (`sinifAktifligiDegistir`),
 * gecmisi durur ama yeni yoklamada cikmaz.
 */
export async function sinifSil(id: string): Promise<IslemSonucu> {
  await adminZorunlu();

  const g = z.uuid().safeParse(id);
  if (!g.success) return { ok: false, hata: "Geçersiz sınıf." };

  const db = await sunucuIstemcisi();

  const [{ count: kayitSayisi }, { count: dersSayisi }] = await Promise.all([
    db
      .from("kayitlar")
      .select("id", { count: "exact", head: true })
      .eq("sinif_id", g.data),
    db
      .from("dersler")
      .select("id", { count: "exact", head: true })
      .eq("sinif_id", g.data),
  ]);

  if ((kayitSayisi ?? 0) > 0) {
    return {
      ok: false,
      hata: `Bu sınıfta ${kayitSayisi} öğrenci kaydı var. Silmek yerine sınıfı kapatın.`,
    };
  }
  if ((dersSayisi ?? 0) > 0) {
    return {
      ok: false,
      hata: `Bu sınıfın ${dersSayisi} ders kaydı var. Silmek yerine sınıfı kapatın.`,
    };
  }

  const { error } = await db.from("siniflar").delete().eq("id", g.data);
  if (error) return { ok: false, hata: "Sınıf silinemedi." };

  revalidatePath("/kampus/siniflar");
  revalidatePath("/kampus/yoklama");
  return { ok: true };
}
