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
