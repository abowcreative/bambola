"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sunucuIstemcisi } from "@/lib/supabase/server";
import { adminZorunlu } from "./oturum";

/**
 * Basvuru uzerindeki islemler. PLAN.md Bolum 28.
 *
 * Server action'lar dis dunyaya acik uc noktalardir: tarayicidan dogrudan
 * cagrilabilirler. Bu yuzden her biri kendi icinde hem YETKIYI hem GIRDIYI
 * dogruluyor; cagiran sayfanin kontrol etmis olmasi yeterli degil.
 */

const DURUMLAR = [
  "yeni",
  "arandi",
  "ulasilamadi",
  "kayit_oldu",
  "vazgecti",
] as const;

const durumSemasi = z.object({
  id: z.uuid("Geçersiz başvuru."),
  durum: z.enum(DURUMLAR),
});

const notSemasi = z.object({
  basvuruId: z.uuid("Geçersiz başvuru."),
  metin: z
    .string()
    .trim()
    .min(1, "Not boş olamaz.")
    .max(2000, "Not en fazla 2000 karakter olabilir."),
});

export type IslemSonucu = { ok: true } | { ok: false; hata: string };

export async function durumDegistir(
  id: string,
  durum: string,
): Promise<IslemSonucu> {
  const oturum = await adminZorunlu();

  const sonuc = durumSemasi.safeParse({ id, durum });
  if (!sonuc.success) {
    return { ok: false, hata: sonuc.error.issues[0].message };
  }

  const db = await sunucuIstemcisi();
  const { error } = await db
    .from("basvurular")
    .update({
      durum: sonuc.data.durum,
      // Kim degistirdi: sonradan "bunu kim kapatti" sorusu mutlaka geliyor.
      guncelleyen: oturum.adSoyad,
    })
    .eq("id", sonuc.data.id);

  if (error) return { ok: false, hata: "Durum kaydedilemedi." };

  revalidatePath("/kampus/basvurular");
  revalidatePath(`/kampus/basvurular/${sonuc.data.id}`);
  return { ok: true };
}

export async function notEkle(
  basvuruId: string,
  metin: string,
): Promise<IslemSonucu> {
  const oturum = await adminZorunlu();

  const sonuc = notSemasi.safeParse({ basvuruId, metin });
  if (!sonuc.success) {
    return { ok: false, hata: sonuc.error.issues[0].message };
  }

  const db = await sunucuIstemcisi();
  const { error } = await db.from("basvuru_notlari").insert({
    basvuru_id: sonuc.data.basvuruId,
    yazan: oturum.adSoyad,
    metin: sonuc.data.metin,
  });

  if (error) return { ok: false, hata: "Not kaydedilemedi." };

  revalidatePath(`/kampus/basvurular/${sonuc.data.basvuruId}`);
  return { ok: true };
}

/**
 * Basvuruyu siler.
 *
 * Normal yol DURUM DEGISTIRMEK: formdan gelen bir talep, sonu ne olursa
 * olsun bir kayittir ve donusum oranini o kayitlar olusturuyor. Silme
 * yalniz gercekten kayit olmayanlar icin: bot doldurmasi, deneme kaydi,
 * ayni kisinin iki kez gonderdigi form.
 *
 * Ogrenciye donusmus basvuru silinmiyor: ogrenci karti `basvuru_id` ile
 * ona bakiyor ve "nereden geldi" bilgisini oradan okuyor.
 *
 * Silme yetkisi 0006 gocuyle aciliyor. Goc calistirilmadiysa RLS satiri
 * dusurmuyor ve cagri sessizce basarili gorunurdu; o yuzden silinen satir
 * sayisi geri isteniyor ve sifirsa acik bir hata donuyor.
 */
export async function basvuruSil(id: string): Promise<IslemSonucu> {
  await adminZorunlu();

  const g = z.uuid().safeParse(id);
  if (!g.success) return { ok: false, hata: "Geçersiz başvuru." };

  const db = await sunucuIstemcisi();

  const { count } = await db
    .from("ogrenciler")
    .select("id", { count: "exact", head: true })
    .eq("basvuru_id", g.data);

  if ((count ?? 0) > 0) {
    return {
      ok: false,
      hata: "Bu başvurudan öğrenci kaydı açılmış; silinemez. Durumunu değiştirebilirsiniz.",
    };
  }

  const { data, error } = await db
    .from("basvurular")
    .delete()
    .eq("id", g.data)
    .select("id");

  if (error) return { ok: false, hata: "Başvuru silinemedi." };
  if (!data || data.length === 0) {
    return {
      ok: false,
      hata: "Silme yetkisi yok. supabase/migrations/0006_basvuru_silme.sql çalıştırılmalı.",
    };
  }

  revalidatePath("/kampus/basvurular");
  revalidatePath("/kampus/panel");
  return { ok: true };
}

/** Gorusme notunu siler. Yanlis yazilmis bir not kalici olmamali. */
export async function notSil(
  id: string,
  basvuruId: string,
): Promise<IslemSonucu> {
  await adminZorunlu();

  const g = z
    .object({ id: z.uuid(), basvuruId: z.uuid() })
    .safeParse({ id, basvuruId });
  if (!g.success) return { ok: false, hata: "Geçersiz not." };

  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("basvuru_notlari")
    .delete()
    .eq("id", g.data.id)
    .select("id");

  if (error) return { ok: false, hata: "Not silinemedi." };
  if (!data || data.length === 0) {
    return {
      ok: false,
      hata: "Silme yetkisi yok. supabase/migrations/0006_basvuru_silme.sql çalıştırılmalı.",
    };
  }

  revalidatePath(`/kampus/basvurular/${g.data.basvuruId}`);
  return { ok: true };
}
