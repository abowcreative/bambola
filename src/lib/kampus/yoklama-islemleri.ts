"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sunucuIstemcisi } from "@/lib/supabase/server";
import { adminZorunlu, oturumZorunlu, rolZorunlu } from "./oturum";

/**
 * Ders, yoklama, odeme, lead, menu ve duyuru islemleri.
 * PLAN.md Bolum 31.
 *
 * Her islem hem YETKIYI hem GIRDIYI kendi icinde dogruluyor: server
 * action'lar tarayicidan dogrudan cagrilabilir.
 */

export type IslemSonucu =
  | { ok: true; id?: string }
  | { ok: false; hata: string };

const tarihSemasi = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih YYYY-AA-GG biçiminde olmalı.");

// -------------------------------------------------------------- ders acma

/**
 * Bir sinif icin belirli tarihte ders acar.
 *
 * Tekil indeks (sinif_id + tarih) yuzunden ayni gun ikinci kez acilamaz;
 * o durumda var olan dersin kimligi donuyor, hata degil. Cift tiklama
 * yuzunden akis kesilmesin.
 */
export async function dersAc(
  sinifId: string,
  tarih: string,
): Promise<IslemSonucu> {
  const oturum = await rolZorunlu("admin", "ogretmen");

  const g = z
    .object({ sinifId: z.uuid("Geçersiz sınıf."), tarih: tarihSemasi })
    .safeParse({ sinifId, tarih });
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };

  const db = await sunucuIstemcisi();

  const { data: varOlan } = await db
    .from("dersler")
    .select("id")
    .eq("sinif_id", g.data.sinifId)
    .eq("tarih", g.data.tarih)
    .maybeSingle();
  if (varOlan) return { ok: true, id: (varOlan as { id: string }).id };

  const { data, error } = await db
    .from("dersler")
    .insert({
      sinif_id: g.data.sinifId,
      tarih: g.data.tarih,
      durum: "planli",
      isleyen_ogretmen: oturum.ogretmenAd,
    })
    .select("id")
    .single();

  if (error || !data) return { ok: false, hata: "Ders açılamadı." };

  revalidatePath("/kampus/yoklama");
  revalidatePath("/kampus/dersler");
  return { ok: true, id: (data as { id: string }).id };
}

const dersDurumSemasi = z.object({
  dersId: z.uuid("Geçersiz ders."),
  durum: z.enum(["planli", "islendi", "iptal"]),
  konu: z.string().trim().max(500).optional(),
});

export async function dersDurumuDegistir(
  dersId: string,
  durum: string,
  konu?: string,
): Promise<IslemSonucu> {
  const oturum = await rolZorunlu("admin", "ogretmen");

  const g = dersDurumSemasi.safeParse({ dersId, durum, konu });
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };

  const db = await sunucuIstemcisi();
  const { error } = await db
    .from("dersler")
    .update({
      durum: g.data.durum,
      konu: g.data.konu ?? undefined,
      // Dersi fiilen isleyen kisi kaydediliyor, sinifin atanmis ogretmeni degil.
      isleyen_ogretmen: oturum.ogretmenAd ?? oturum.adSoyad,
    })
    .eq("id", g.data.dersId);

  if (error) return { ok: false, hata: "Ders kaydedilemedi." };

  revalidatePath("/kampus/yoklama");
  revalidatePath("/kampus/dersler");
  revalidatePath(`/kampus/yoklama/${g.data.dersId}`);
  return { ok: true };
}

// ------------------------------------------------------- yoklama isaretle

const yoklamaSemasi = z.object({
  dersId: z.uuid("Geçersiz ders."),
  ogrenciId: z.uuid("Geçersiz öğrenci."),
  durum: z.enum(["geldi", "gelmedi", "izinli", "telafi"]),
});

/**
 * Bir ogrencinin yoklamasini isaretler. Varsa gunceller, yoksa olusturur.
 *
 * `upsert` degil ayri kontrol: upsert cakismada butun satiri degistiriyor
 * ve `not_metni` gibi elle girilmis alanlari silebilirdi.
 */
export async function yoklamaIsaretle(
  dersId: string,
  ogrenciId: string,
  durum: string,
): Promise<IslemSonucu> {
  const oturum = await rolZorunlu("admin", "ogretmen");

  const g = yoklamaSemasi.safeParse({ dersId, ogrenciId, durum });
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };

  const db = await sunucuIstemcisi();
  const isaretleyen = oturum.ogretmenAd ?? oturum.adSoyad;

  const { data: varOlan } = await db
    .from("yoklama")
    .select("id")
    .eq("ders_id", g.data.dersId)
    .eq("ogrenci_id", g.data.ogrenciId)
    .maybeSingle();

  const { error } = varOlan
    ? await db
        .from("yoklama")
        .update({ durum: g.data.durum, isaretleyen })
        .eq("id", (varOlan as { id: string }).id)
    : await db.from("yoklama").insert({
        ders_id: g.data.dersId,
        ogrenci_id: g.data.ogrenciId,
        durum: g.data.durum,
        isaretleyen,
      });

  if (error) return { ok: false, hata: "Yoklama kaydedilemedi." };

  revalidatePath(`/kampus/yoklama/${g.data.dersId}`);
  return { ok: true };
}

// ---------------------------------------------------------------- odemeler

const odemeSemasi = z.object({
  ogrenciId: z.uuid("Geçersiz öğrenci."),
  tur: z.enum(["borc", "tahsilat"]),
  tutar: z.coerce
    .number()
    .int("Tutar tam sayı olmalı.")
    .positive("Tutar sıfırdan büyük olmalı.")
    .max(1_000_000, "Tutar çok yüksek."),
  tarih: tarihSemasi,
  vade: tarihSemasi.optional().or(z.literal("")),
  yontem: z.enum(["nakit", "kart", "havale", "diger"]).optional().or(z.literal("")),
  aciklama: z.string().trim().max(300).optional(),
});

export async function odemeEkle(girdi: {
  ogrenciId: string;
  tur: string;
  tutar: number | string;
  tarih: string;
  vade?: string;
  yontem?: string;
  aciklama?: string;
}): Promise<IslemSonucu> {
  const oturum = await adminZorunlu();

  const g = odemeSemasi.safeParse(girdi);
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };

  const db = await sunucuIstemcisi();
  const { error } = await db.from("odemeler").insert({
    ogrenci_id: g.data.ogrenciId,
    tur: g.data.tur,
    tutar: g.data.tutar,
    tarih: g.data.tarih,
    // Vade yalniz borcta anlamli; tahsilatta bos birakiliyor.
    vade: g.data.tur === "borc" && g.data.vade ? g.data.vade : null,
    yontem: g.data.tur === "tahsilat" && g.data.yontem ? g.data.yontem : null,
    aciklama: g.data.aciklama || null,
    olusturan: oturum.adSoyad,
  });

  if (error) return { ok: false, hata: "Hareket kaydedilemedi." };

  revalidatePath("/kampus/cari");
  revalidatePath("/kampus/tahsilat");
  revalidatePath(`/kampus/ogrenciler/${g.data.ogrenciId}`);
  return { ok: true };
}

export async function odemeSil(id: string): Promise<IslemSonucu> {
  await adminZorunlu();
  const g = z.uuid().safeParse(id);
  if (!g.success) return { ok: false, hata: "Geçersiz kayıt." };

  const db = await sunucuIstemcisi();
  const { error } = await db.from("odemeler").delete().eq("id", g.data);
  if (error) return { ok: false, hata: "Kayıt silinemedi." };

  revalidatePath("/kampus/cari");
  revalidatePath("/kampus/tahsilat");
  return { ok: true };
}

// ------------------------------------------------------------------ leadler

const leadSemasi = z.object({
  adSoyad: z.string().trim().min(2, "Ad soyad gerekli.").max(80),
  telefon: z.string().trim().max(20).optional(),
  kaynak: z.enum([
    "instagram",
    "telefon",
    "tavsiye",
    "tabela",
    "whatsapp",
    "diger",
  ]),
  cocukAdi: z.string().trim().max(60).optional(),
  ilgilendigiProgram: z.string().trim().max(80).optional(),
  notlar: z.string().trim().max(1000).optional(),
});

export async function leadEkle(girdi: {
  adSoyad: string;
  telefon?: string;
  kaynak: string;
  cocukAdi?: string;
  ilgilendigiProgram?: string;
  notlar?: string;
}): Promise<IslemSonucu> {
  const oturum = await adminZorunlu();

  const g = leadSemasi.safeParse(girdi);
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };

  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("leadler")
    .insert({
      ad_soyad: g.data.adSoyad,
      // Telefon basvurular tablosuyla ayni bicimde saklaniyor.
      telefon: g.data.telefon
        ? g.data.telefon.replace(/\D/g, "").replace(/^(90|0)/, "")
        : null,
      kaynak: g.data.kaynak,
      cocuk_adi: g.data.cocukAdi || null,
      ilgilendigi_program: g.data.ilgilendigiProgram || null,
      notlar: g.data.notlar || null,
      olusturan: oturum.adSoyad,
    })
    .select("id")
    .single();

  if (error || !data) return { ok: false, hata: "Lead kaydedilemedi." };

  revalidatePath("/kampus/leadler");
  return { ok: true, id: (data as { id: string }).id };
}

export async function leadDurumuDegistir(
  id: string,
  durum: string,
): Promise<IslemSonucu> {
  await adminZorunlu();

  const g = z
    .object({
      id: z.uuid("Geçersiz kayıt."),
      durum: z.enum(["yeni", "gorusuldu", "kayit_oldu", "kayip"]),
    })
    .safeParse({ id, durum });
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };

  const db = await sunucuIstemcisi();
  const { error } = await db
    .from("leadler")
    .update({ durum: g.data.durum })
    .eq("id", g.data.id);

  if (error) return { ok: false, hata: "Durum kaydedilemedi." };
  revalidatePath("/kampus/leadler");
  return { ok: true };
}

// ------------------------------------------------------------------- menuler

const menuSemasi = z.object({
  tarih: tarihSemasi,
  kahvalti: z.string().trim().max(300).optional(),
  ogle: z.string().trim().max(300).optional(),
  araOgun: z.string().trim().max(300).optional(),
  notlar: z.string().trim().max(300).optional(),
});

/** Gunun menusunu yazar veya gunceller. */
export async function menuKaydet(girdi: {
  tarih: string;
  kahvalti?: string;
  ogle?: string;
  araOgun?: string;
  notlar?: string;
}): Promise<IslemSonucu> {
  await adminZorunlu();

  const g = menuSemasi.safeParse(girdi);
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };

  const db = await sunucuIstemcisi();
  const { error } = await db.from("menuler").upsert(
    {
      tarih: g.data.tarih,
      kahvalti: g.data.kahvalti || null,
      ogle: g.data.ogle || null,
      ara_ogun: g.data.araOgun || null,
      notlar: g.data.notlar || null,
    },
    { onConflict: "tarih" },
  );

  if (error) return { ok: false, hata: "Menü kaydedilemedi." };
  revalidatePath("/kampus/yemek");
  return { ok: true };
}

// ----------------------------------------------------------------- duyurular

const duyuruSemasi = z.object({
  baslik: z.string().trim().min(3, "Başlık gerekli.").max(120),
  metin: z.string().trim().min(3, "Metin gerekli.").max(4000),
  hedef: z.enum(["hepsi", "ogretmen", "veli"]),
});

export async function duyuruEkle(girdi: {
  baslik: string;
  metin: string;
  hedef: string;
}): Promise<IslemSonucu> {
  const oturum = await adminZorunlu();

  const g = duyuruSemasi.safeParse(girdi);
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };

  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("duyurular")
    .insert({
      baslik: g.data.baslik,
      metin: g.data.metin,
      hedef: g.data.hedef,
      // TASLAK olarak aciliyor: yazilmakta olan metin kimseye dusmesin.
      yayinda: false,
      olusturan: oturum.adSoyad,
    })
    .select("id")
    .single();

  if (error || !data) return { ok: false, hata: "Duyuru kaydedilemedi." };
  revalidatePath("/kampus/duyurular");
  return { ok: true, id: (data as { id: string }).id };
}

export async function duyuruYayinDegistir(
  id: string,
  yayinda: boolean,
): Promise<IslemSonucu> {
  await adminZorunlu();
  const g = z.uuid().safeParse(id);
  if (!g.success) return { ok: false, hata: "Geçersiz duyuru." };

  const db = await sunucuIstemcisi();
  const { error } = await db
    .from("duyurular")
    .update({ yayinda })
    .eq("id", g.data);

  if (error) return { ok: false, hata: "Durum kaydedilemedi." };
  revalidatePath("/kampus/duyurular");
  return { ok: true };
}

/** Oturum acan kisi icin yardimci: veli mi ogretmen mi. */
export async function rolumuGetir() {
  const oturum = await oturumZorunlu();
  return oturum.rol;
}
