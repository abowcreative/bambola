import "server-only";

import { sunucuIstemcisi } from "@/lib/supabase/server";
import { adminZorunlu } from "./oturum";
import { aramaKalibi } from "./arama";
import type { Basvuru, BasvuruDurumu } from "@/lib/supabase/types";
import { DURUM_ETIKET } from "@/lib/supabase/types";

/**
 * Basvuru veri erisim katmani. PLAN.md Bolum 28.
 *
 * Her fonksiyon ONCE `adminZorunlu()` cagiriyor. Sayfa zaten kontrol etse
 * bile burada tekrar kontrol ediliyor: veri erisimi tek kapidan gecsin,
 * yeni bir sayfa yazan kisi kontrolu unutunca veri sizmasin.
 *
 * Ikinci savunma hatti RLS: sorgular OTURUM ISTEMCISIYLE atiliyor (service
 * role degil), yani politikalar da devrede. Buradaki kontrol atlansa bile
 * veritabani admin olmayana satir vermez.
 */

export type BasvuruSuzgeci = {
  durum?: BasvuruDurumu | "hepsi";
  kurum?: string;
  /** Ad, telefon veya cocuk adinda arar. */
  ara?: string;
};

export type BasvuruOzet = Pick<
  Basvuru,
  | "id"
  | "created_at"
  | "kurum"
  | "cocuk_adi"
  | "dogum_tarihi"
  | "yas_ay"
  | "program_slug"
  | "paket_kod"
  | "veli_adi"
  | "telefon"
  | "eposta"
  | "iletisim_tercihi"
  | "kaynak"
  | "durum"
  | "saat_uymuyor"
  | "fiyat_normal"
  | "fiyat_erken_kayit"
  | "erken_kayit_uygulandi"
>;

const OZET_ALANLARI =
  "id, created_at, kurum, cocuk_adi, dogum_tarihi, yas_ay, program_slug, " +
  "paket_kod, veli_adi, telefon, eposta, iletisim_tercihi, kaynak, durum, " +
  "saat_uymuyor, fiyat_normal, fiyat_erken_kayit, erken_kayit_uygulandi";

export async function basvurulariGetir(
  suzgec: BasvuruSuzgeci = {},
): Promise<BasvuruOzet[]> {
  await adminZorunlu();
  const db = await sunucuIstemcisi();

  let sorgu = db
    .from("basvurular")
    .select(OZET_ALANLARI)
    .order("created_at", { ascending: false })
    .limit(500);

  if (suzgec.durum && suzgec.durum !== "hepsi") {
    sorgu = sorgu.eq("durum", suzgec.durum);
  }
  if (suzgec.kurum && suzgec.kurum !== "hepsi") {
    sorgu = sorgu.eq("kurum", suzgec.kurum);
  }

  /*
    Arama kalibi `aramaKalibi` icinde TEMIZLENEREK kuruluyor. Girdiyi
    dogrudan birlestirmek PostgREST suzgec enjeksiyonuna aciktir,
    bkz. lib/kampus/arama.ts.
  */
  const kalip = aramaKalibi(
    suzgec.ara,
    ["veli_adi", "cocuk_adi"],
    "telefon",
  );
  if (kalip) sorgu = sorgu.or(kalip);

  const { data, error } = await sorgu;
  if (error) throw new Error(`Başvurular okunamadı: ${error.message}`);
  return (data ?? []) as unknown as BasvuruOzet[];
}

/**
 * Bu basvurudan olusturulmus ogrenci var mi.
 * Detay sayfasi "donustur" yerine "ogrenci kaydina git" gosterebilsin diye.
 */
export async function basvurununOgrencisi(
  basvuruId: string,
): Promise<string | null> {
  await adminZorunlu();
  const db = await sunucuIstemcisi();
  const { data } = await db
    .from("ogrenciler")
    .select("id")
    .eq("basvuru_id", basvuruId)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

export async function basvuruGetir(id: string): Promise<Basvuru | null> {
  await adminZorunlu();
  const db = await sunucuIstemcisi();

  const { data, error } = await db
    .from("basvurular")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Başvuru okunamadı: ${error.message}`);
  return (data as Basvuru | null) ?? null;
}

export type BasvuruNotu = {
  id: string;
  created_at: string;
  yazan: string | null;
  metin: string;
};

export async function basvuruNotlariGetir(
  basvuruId: string,
): Promise<BasvuruNotu[]> {
  await adminZorunlu();
  const db = await sunucuIstemcisi();

  const { data, error } = await db
    .from("basvuru_notlari")
    .select("id, created_at, yazan, metin")
    .eq("basvuru_id", basvuruId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Notlar okunamadı: ${error.message}`);
  return (data ?? []) as BasvuruNotu[];
}

/** Durum bazinda sayilar. Ust seritteki rozetler bunu kullaniyor. */
export async function basvuruSayilari(): Promise<
  Record<BasvuruDurumu | "hepsi", number>
> {
  await adminZorunlu();
  const db = await sunucuIstemcisi();

  const { data, error } = await db.from("basvurular").select("durum");
  if (error) throw new Error(`Sayılar okunamadı: ${error.message}`);

  const sayac = {
    hepsi: 0,
    yeni: 0,
    arandi: 0,
    ulasilamadi: 0,
    kayit_oldu: 0,
    vazgecti: 0,
  } as Record<BasvuruDurumu | "hepsi", number>;

  for (const s of data ?? []) {
    sayac.hepsi++;
    const d = (s as { durum: BasvuruDurumu }).durum;
    if (d in sayac) sayac[d]++;
  }
  return sayac;
}

export { DURUM_ETIKET };
