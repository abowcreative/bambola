"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sunucuIstemcisi } from "@/lib/supabase/server";
import { adminZorunlu } from "./oturum";
import { bugununTarihi } from "@/lib/tarih";

/**
 * Odeme defteri, giderler, dogum gunleri ve su karti islemleri.
 * PLAN.md Bolum 42.
 *
 * Excel'de bir odeme almak iki sayfada sekiz hucre degistirmek demekti:
 * aylik sayfaya satir, GENEL LISTE'de son odeme tarihi, odenen, tur, kalan
 * hak, gelis hakki, toplam formulu, guncellenme tarihi. Burada tek islem:
 * `paketSatisiEkle` satiri yazip ogrencinin ozet alanlarini kendi
 * tazeliyor.
 *
 * Her islem yetkiyi ve girdiyi kendi icinde dogruluyor.
 */

export type IslemSonucu =
  | { ok: true; id?: string }
  | { ok: false; hata: string };

const tarihSemasi = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih YYYY-AA-GG biçiminde olmalı.");

const bosVeya = <T extends z.ZodTypeAny>(s: T) => s.optional().or(z.literal(""));

const yolTazele = (ogrenciId?: string | null, ay?: string | null) => {
  revalidatePath("/kampus/odeme-defteri");
  revalidatePath("/kampus/ogrenciler");
  revalidatePath("/kampus/raporlar");
  if (ogrenciId) revalidatePath(`/kampus/ogrenciler/${ogrenciId}`);
  if (ay) revalidatePath(`/kampus/odeme-defteri/${ay}`);
};

// ----------------------------------------------------------- odeme defteri

const paketSatisiSemasi = z.object({
  ogrenciId: bosVeya(z.uuid("Geçersiz öğrenci.")),
  cocukAdi: z.string().trim().max(80).optional(),
  veliAdi: z.string().trim().max(80).optional(),
  tarih: tarihSemasi,
  paket: z.string().trim().max(60).optional(),
  program: z.string().trim().max(80).optional(),
  tutar: bosVeya(
    z.coerce
      .number()
      .int("Tutar tam sayı olmalı.")
      .min(0, "Tutar eksi olamaz.")
      .max(5_000_000, "Tutar çok yüksek."),
  ),
  yontem: bosVeya(z.enum(["nakit", "kart", "havale", "karisik", "diger"])),
  odemeTuru: z.string().trim().max(80).optional(),
  aciklama: z.string().trim().max(500).optional(),
  /* Ogrencinin hak sayaclari: bos birakilirsa dokunulmuyor. */
  kalanHakSaat: bosVeya(z.coerce.number().int().min(-999).max(9999)),
  gelisHakki: bosVeya(z.coerce.number().int().min(-999).max(9999)),
});

export type PaketSatisiGirdisi = z.input<typeof paketSatisiSemasi>;

/**
 * Ogrencinin ozet alanlarini defterden tazeler: son odeme tarihi, son
 * odenen, son odeme turu, guncellenme tarihi. Paket ve program yalniz
 * verildiginde degisiyor.
 *
 * TOPLAM ODENEN GUNCELLENMIYOR: o alan Excel'in son formul degeri; canli
 * toplam ekranda defterden hesaplaniyor. Ikisi ayri durunca Excel'deki
 * toplamla defterin toplami karsilastirilabiliyor.
 */
async function ogrenciOzetiniTazele(
  db: Awaited<ReturnType<typeof sunucuIstemcisi>>,
  ogrenciId: string,
  ek?: { paket?: string; program?: string; kalanHakSaat?: number | ""; gelisHakki?: number | "" },
) {
  const { data: son } = await db
    .from("paket_satislari")
    .select("tarih, tutar, tutar_ham, odeme_turu, yontem")
    .eq("ogrenci_id", ogrenciId)
    .order("tarih", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const s = son as {
    tarih: string | null;
    tutar: number | null;
    tutar_ham: string | null;
    odeme_turu: string | null;
    yontem: string | null;
  } | null;

  const guncel: Record<string, unknown> = { guncellenme_tarihi: bugununTarihi() };
  if (s) {
    guncel.son_odeme_tarihi = s.tarih;
    guncel.son_odenen = s.tutar !== null ? String(s.tutar) : s.tutar_ham;
    guncel.son_odeme_turu = s.odeme_turu ?? s.yontem ?? null;
  }
  if (ek?.paket) guncel.paket = ek.paket;
  if (ek?.program) guncel.program_metni = ek.program;
  if (ek?.kalanHakSaat !== undefined && ek.kalanHakSaat !== "") guncel.kalan_hak_saat = ek.kalanHakSaat;
  if (ek?.gelisHakki !== undefined && ek.gelisHakki !== "") guncel.gelis_hakki = ek.gelisHakki;

  await db.from("ogrenciler").update(guncel).eq("id", ogrenciId);
}

export async function paketSatisiEkle(girdi: PaketSatisiGirdisi): Promise<IslemSonucu> {
  const oturum = await adminZorunlu();
  const g = paketSatisiSemasi.safeParse(girdi);
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };
  const v = g.data;

  const db = await sunucuIstemcisi();

  let cocukAdi = v.cocukAdi ?? "";
  let veliAdi = v.veliAdi ?? "";
  if (v.ogrenciId) {
    const { data } = await db
      .from("ogrenciler")
      .select("ad, soyad, ogrenci_veli(birincil, veliler(ad_soyad))")
      .eq("id", v.ogrenciId)
      .maybeSingle();
    if (!data) return { ok: false, hata: "Öğrenci bulunamadı." };
    const o = data as unknown as {
      ad: string;
      soyad: string | null;
      ogrenci_veli: { birincil: boolean; veliler: { ad_soyad: string } | null }[];
    };
    cocukAdi = cocukAdi || (o.soyad ? `${o.ad} ${o.soyad}` : o.ad);
    const bag = (o.ogrenci_veli ?? []).sort((a, b) => Number(b.birincil) - Number(a.birincil))[0];
    veliAdi = veliAdi || (bag?.veliler?.ad_soyad ?? "");
  }
  if (!cocukAdi) return { ok: false, hata: "Öğrenci seçin ya da çocuğun adını yazın." };

  const { data, error } = await db
    .from("paket_satislari")
    .insert({
      ogrenci_id: v.ogrenciId || null,
      cocuk_adi: cocukAdi,
      veli_adi: veliAdi || null,
      tarih: v.tarih,
      paket: v.paket || null,
      program: v.program || null,
      tutar: v.tutar === "" || v.tutar === undefined ? null : v.tutar,
      odeme_turu: v.odemeTuru || null,
      yontem: v.yontem || null,
      aciklama: v.aciklama || null,
      ay: v.tarih.slice(0, 7),
      kaynak: "panel",
      olusturan: oturum.adSoyad,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, hata: `Ödeme kaydedilemedi: ${error?.message ?? ""}` };

  if (v.ogrenciId) {
    await ogrenciOzetiniTazele(db, v.ogrenciId, {
      paket: v.paket,
      program: v.program,
      kalanHakSaat: v.kalanHakSaat,
      gelisHakki: v.gelisHakki,
    });
  }
  yolTazele(v.ogrenciId || null, v.tarih.slice(0, 7));
  return { ok: true, id: (data as { id: string }).id };
}

export async function paketSatisiGuncelle(
  id: string,
  girdi: PaketSatisiGirdisi,
): Promise<IslemSonucu> {
  await adminZorunlu();
  const k = z.uuid().safeParse(id);
  if (!k.success) return { ok: false, hata: "Geçersiz kayıt." };
  const g = paketSatisiSemasi.safeParse(girdi);
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };
  const v = g.data;

  const db = await sunucuIstemcisi();
  const { data: eski } = await db
    .from("paket_satislari")
    .select("ogrenci_id, ay")
    .eq("id", k.data)
    .maybeSingle();
  if (!eski) return { ok: false, hata: "Kayıt bulunamadı." };
  const e = eski as { ogrenci_id: string | null; ay: string };

  const guncel: Record<string, unknown> = {
    tarih: v.tarih,
    ay: v.tarih.slice(0, 7),
    paket: v.paket || null,
    program: v.program || null,
    tutar: v.tutar === "" || v.tutar === undefined ? null : v.tutar,
    /* Tutar elle duzeltildiyse ham metin artik gecerli degil. */
    tutar_ham: v.tutar === "" || v.tutar === undefined ? undefined : null,
    odeme_turu: v.odemeTuru || null,
    yontem: v.yontem || null,
    aciklama: v.aciklama || null,
  };
  if (v.ogrenciId !== undefined) guncel.ogrenci_id = v.ogrenciId || null;
  if (v.cocukAdi) guncel.cocuk_adi = v.cocukAdi;
  if (v.veliAdi !== undefined) guncel.veli_adi = v.veliAdi || null;

  const { error } = await db.from("paket_satislari").update(guncel).eq("id", k.data);
  if (error) return { ok: false, hata: `Kayıt güncellenemedi: ${error.message}` };

  const yeniOgrenci = v.ogrenciId || null;
  if (e.ogrenci_id) await ogrenciOzetiniTazele(db, e.ogrenci_id);
  if (yeniOgrenci && yeniOgrenci !== e.ogrenci_id) {
    await ogrenciOzetiniTazele(db, yeniOgrenci, {
      kalanHakSaat: v.kalanHakSaat,
      gelisHakki: v.gelisHakki,
    });
  } else if (yeniOgrenci && (v.kalanHakSaat !== undefined || v.gelisHakki !== undefined)) {
    await ogrenciOzetiniTazele(db, yeniOgrenci, {
      kalanHakSaat: v.kalanHakSaat,
      gelisHakki: v.gelisHakki,
    });
  }
  yolTazele(e.ogrenci_id, e.ay);
  yolTazele(yeniOgrenci, v.tarih.slice(0, 7));
  return { ok: true, id: k.data };
}

export async function paketSatisiSil(id: string): Promise<IslemSonucu> {
  await adminZorunlu();
  const k = z.uuid().safeParse(id);
  if (!k.success) return { ok: false, hata: "Geçersiz kayıt." };

  const db = await sunucuIstemcisi();
  const { data: eski } = await db
    .from("paket_satislari")
    .select("ogrenci_id, ay")
    .eq("id", k.data)
    .maybeSingle();
  const e = (eski as { ogrenci_id: string | null; ay: string } | null) ?? null;

  const { error } = await db.from("paket_satislari").delete().eq("id", k.data);
  if (error) return { ok: false, hata: "Kayıt silinemedi." };

  if (e?.ogrenci_id) await ogrenciOzetiniTazele(db, e.ogrenci_id);
  yolTazele(e?.ogrenci_id, e?.ay);
  return { ok: true };
}

// ------------------------------------------------------------------ giderler

const giderSemasi = z.object({
  tarih: tarihSemasi,
  tutar: z.coerce
    .number()
    .int("Tutar tam sayı olmalı.")
    .min(0, "Tutar eksi olamaz.")
    .max(5_000_000, "Tutar çok yüksek."),
  aciklama: z.string().trim().min(2, "Açıklama gerekli.").max(300),
  ekNot: z.string().trim().max(300).optional(),
});

export type GiderGirdisi = z.input<typeof giderSemasi>;

export async function giderEkle(girdi: GiderGirdisi): Promise<IslemSonucu> {
  const oturum = await adminZorunlu();
  const g = giderSemasi.safeParse(girdi);
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };

  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("giderler")
    .insert({
      tarih: g.data.tarih,
      tutar: g.data.tutar,
      aciklama: g.data.aciklama,
      ek_not: g.data.ekNot || null,
      kaynak: "panel",
      olusturan: oturum.adSoyad,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, hata: "Gider kaydedilemedi." };

  revalidatePath("/kampus/giderler");
  revalidatePath("/kampus/raporlar");
  return { ok: true, id: (data as { id: string }).id };
}

export async function giderGuncelle(id: string, girdi: GiderGirdisi): Promise<IslemSonucu> {
  await adminZorunlu();
  const k = z.uuid().safeParse(id);
  if (!k.success) return { ok: false, hata: "Geçersiz kayıt." };
  const g = giderSemasi.safeParse(girdi);
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };

  const db = await sunucuIstemcisi();
  const { error } = await db
    .from("giderler")
    .update({
      tarih: g.data.tarih,
      tutar: g.data.tutar,
      aciklama: g.data.aciklama,
      ek_not: g.data.ekNot || null,
    })
    .eq("id", k.data);
  if (error) return { ok: false, hata: "Gider güncellenemedi." };

  revalidatePath("/kampus/giderler");
  return { ok: true, id: k.data };
}

export async function giderSil(id: string): Promise<IslemSonucu> {
  await adminZorunlu();
  const k = z.uuid().safeParse(id);
  if (!k.success) return { ok: false, hata: "Geçersiz kayıt." };

  const db = await sunucuIstemcisi();
  const { error } = await db.from("giderler").delete().eq("id", k.data);
  if (error) return { ok: false, hata: "Gider silinemedi." };

  revalidatePath("/kampus/giderler");
  return { ok: true };
}

// ------------------------------------------------------------------ su karti

const suSemasi = z.object({
  etiket: z.string().trim().min(2, "Etiket gerekli.").max(80),
  tarih: bosVeya(tarihSemasi),
  tl: bosVeya(z.coerce.number().int().min(0).max(1_000_000)),
  stok: bosVeya(z.coerce.number().int().min(-1000).max(1_000_000)),
});

export type SuKartiGirdisi = z.input<typeof suSemasi>;

/** Su karti satirini yazar; `id` verilmezse yeni satir. */
export async function suKartiKaydet(id: string | null, girdi: SuKartiGirdisi): Promise<IslemSonucu> {
  await adminZorunlu();
  const g = suSemasi.safeParse(girdi);
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };
  const v = g.data;
  const veri = {
    etiket: v.etiket,
    tarih: v.tarih || null,
    tl: v.tl === "" || v.tl === undefined ? null : v.tl,
    stok: v.stok === "" || v.stok === undefined ? null : v.stok,
  };

  const db = await sunucuIstemcisi();
  if (id) {
    const k = z.uuid().safeParse(id);
    if (!k.success) return { ok: false, hata: "Geçersiz kayıt." };
    const { error } = await db.from("su_karti").update(veri).eq("id", k.data);
    if (error) return { ok: false, hata: "Su kartı kaydedilemedi." };
  } else {
    const { error } = await db.from("su_karti").insert({ ...veri, kaynak: "panel" });
    if (error) return { ok: false, hata: "Su kartı kaydedilemedi." };
  }
  revalidatePath("/kampus/giderler");
  return { ok: true };
}

// ------------------------------------------------------------ dogum gunleri

const partiSemasi = z.object({
  cocukAdi: z.string().trim().max(80).optional(),
  veliAdi: z.string().trim().max(80).optional(),
  telefon: z.string().trim().max(30).optional(),
  cocukYas: z.string().trim().max(20).optional(),
  dogumGunu: bosVeya(tarihSemasi),
  kapora: bosVeya(z.coerce.number().int().min(0).max(1_000_000)),
  organizasyonTarihi: bosVeya(tarihSemasi),
  saat: z.string().trim().max(10).optional(),
  anlasilanFiyat: bosVeya(z.coerce.number().int().min(0).max(5_000_000)),
  kalanOdeme: bosVeya(z.coerce.number().int().min(0).max(5_000_000)),
  cocukSayisi: bosVeya(z.coerce.number().int().min(0).max(999)),
  yetiskinSayisi: bosVeya(z.coerce.number().int().min(0).max(999)),
  yemek: z.string().trim().max(20).optional(),
  susleme: z.string().trim().max(20).optional(),
  mahalle: z.string().trim().max(80).optional(),
  aciklama: z.string().trim().max(600).optional(),
  ekNot: z.string().trim().max(300).optional(),
});

export type PartiGirdisi = z.input<typeof partiSemasi>;

function partiVerisi(v: z.output<typeof partiSemasi>) {
  const sayi = (x: number | "" | undefined) => (x === "" || x === undefined ? null : x);
  return {
    cocuk_adi: v.cocukAdi || null,
    veli_adi: v.veliAdi || null,
    telefon: v.telefon ? v.telefon.replace(/\D/g, "").replace(/^(90|0)/, "") || v.telefon : null,
    cocuk_yas: v.cocukYas || null,
    dogum_gunu: v.dogumGunu || null,
    kapora: sayi(v.kapora),
    organizasyon_tarihi: v.organizasyonTarihi || null,
    saat: v.saat || null,
    anlasilan_fiyat: sayi(v.anlasilanFiyat),
    kalan_odeme: sayi(v.kalanOdeme),
    cocuk_sayisi: sayi(v.cocukSayisi),
    yetiskin_sayisi: sayi(v.yetiskinSayisi),
    yemek: v.yemek || null,
    susleme: v.susleme || null,
    mahalle: v.mahalle || null,
    aciklama: v.aciklama || null,
    ek_not: v.ekNot || null,
  };
}

export async function dogumGunuEkle(girdi: PartiGirdisi): Promise<IslemSonucu> {
  const oturum = await adminZorunlu();
  const g = partiSemasi.safeParse(girdi);
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };
  if (!g.data.cocukAdi && !g.data.veliAdi) return { ok: false, hata: "Çocuk ya da veli adı gerekli." };

  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("dogum_gunu_partileri")
    .insert({ ...partiVerisi(g.data), kaynak: "panel", olusturan: oturum.adSoyad })
    .select("id")
    .single();
  if (error || !data) return { ok: false, hata: "Organizasyon kaydedilemedi." };

  revalidatePath("/kampus/dogum-gunleri");
  return { ok: true, id: (data as { id: string }).id };
}

export async function dogumGunuGuncelle(id: string, girdi: PartiGirdisi): Promise<IslemSonucu> {
  await adminZorunlu();
  const k = z.uuid().safeParse(id);
  if (!k.success) return { ok: false, hata: "Geçersiz kayıt." };
  const g = partiSemasi.safeParse(girdi);
  if (!g.success) return { ok: false, hata: g.error.issues[0].message };

  const db = await sunucuIstemcisi();
  const { error } = await db.from("dogum_gunu_partileri").update(partiVerisi(g.data)).eq("id", k.data);
  if (error) return { ok: false, hata: "Organizasyon güncellenemedi." };

  revalidatePath("/kampus/dogum-gunleri");
  return { ok: true, id: k.data };
}

export async function dogumGunuSil(id: string): Promise<IslemSonucu> {
  await adminZorunlu();
  const k = z.uuid().safeParse(id);
  if (!k.success) return { ok: false, hata: "Geçersiz kayıt." };

  const db = await sunucuIstemcisi();
  const { error } = await db.from("dogum_gunu_partileri").delete().eq("id", k.data);
  if (error) return { ok: false, hata: "Organizasyon silinemedi." };

  revalidatePath("/kampus/dogum-gunleri");
  return { ok: true };
}
