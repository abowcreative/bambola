import "server-only";

import { sunucuIstemcisi } from "@/lib/supabase/server";
import { adminZorunlu, oturumZorunlu } from "./oturum";
import { aramaKalibi } from "./arama";

/**
 * Ogrenci, veli ve sinif veri erisimi. PLAN.md Bolum 30.
 *
 * Sorgular OTURUM ISTEMCISIYLE atiliyor (service role degil), yani RLS
 * politikalari da devrede: ogretmen yalniz kendi sinifindakileri, veli
 * yalniz kendi cocugunu goruyor. Buradaki rol kontrolu ikinci savunma
 * hatti, tek basina degil.
 */

export * from "./ogrenci-tipleri";
import type {
  OgrenciDurumu,
  Ogrenci,
  Veli,
  Sinif,
  Kayit,
} from "./ogrenci-tipleri";

// --------------------------------------------------------------- ogrenciler

export async function ogrencileriGetir(suzgec?: {
  durum?: OgrenciDurumu | "hepsi";
  ara?: string;
}): Promise<Ogrenci[]> {
  await oturumZorunlu();
  const db = await sunucuIstemcisi();

  let q = db
    .from("ogrenciler")
    .select("*")
    .order("kayit_tarihi", { ascending: false })
    .limit(500);

  if (suzgec?.durum && suzgec.durum !== "hepsi") {
    q = q.eq("durum", suzgec.durum);
  }
  // Enjeksiyona karsi temizlenmis kalip, bkz. lib/kampus/arama.ts.
  const kalip = aramaKalibi(suzgec?.ara, ["ad", "soyad"]);
  if (kalip) q = q.or(kalip);

  const { data, error } = await q;
  if (error) throw new Error(`Öğrenciler okunamadı: ${error.message}`);
  return (data ?? []) as Ogrenci[];
}

export async function ogrenciGetir(id: string): Promise<Ogrenci | null> {
  await oturumZorunlu();
  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("ogrenciler")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Öğrenci okunamadı: ${error.message}`);
  return (data as Ogrenci | null) ?? null;
}

/** Ogrencinin velileri, yakinligiyla. */
export async function ogrencininVelileri(
  ogrenciId: string,
): Promise<(Veli & { yakinlik: string; birincil: boolean })[]> {
  await oturumZorunlu();
  const db = await sunucuIstemcisi();

  const { data, error } = await db
    .from("ogrenci_veli")
    .select("yakinlik, birincil, veliler(*)")
    .eq("ogrenci_id", ogrenciId);

  if (error) throw new Error(`Veliler okunamadı: ${error.message}`);

  return (data ?? []).flatMap((s) => {
    const v = (s as unknown as { veliler: Veli | null }).veliler;
    if (!v) return [];
    const { yakinlik, birincil } = s as unknown as {
      yakinlik: string;
      birincil: boolean;
    };
    return [{ ...v, yakinlik, birincil }];
  });
}

/** Ogrencinin sinif kayitlari, sinif bilgisiyle. */
export async function ogrencininKayitlari(
  ogrenciId: string,
): Promise<(Kayit & { sinif: Sinif | null })[]> {
  await oturumZorunlu();
  const db = await sunucuIstemcisi();

  const { data, error } = await db
    .from("kayitlar")
    .select("*, siniflar(*)")
    .eq("ogrenci_id", ogrenciId)
    .order("baslangic", { ascending: false });

  if (error) throw new Error(`Kayıtlar okunamadı: ${error.message}`);

  return (data ?? []).map((k) => {
    const { siniflar, ...kayit } = k as unknown as Kayit & {
      siniflar: Sinif | null;
    };
    return { ...kayit, sinif: siniflar };
  });
}

// ------------------------------------------------------------------ veliler

export async function velileriGetir(ara?: string): Promise<
  (Veli & { cocukSayisi: number })[]
> {
  await adminZorunlu();
  const db = await sunucuIstemcisi();

  let q = db
    .from("veliler")
    .select("*, ogrenci_veli(ogrenci_id)")
    .order("ad_soyad")
    .limit(500);

  const veliKalibi = aramaKalibi(ara, ["ad_soyad"], "telefon");
  if (veliKalibi) q = q.or(veliKalibi);

  const { data, error } = await q;
  if (error) throw new Error(`Veliler okunamadı: ${error.message}`);

  return (data ?? []).map((v) => {
    const { ogrenci_veli, ...veli } = v as unknown as Veli & {
      ogrenci_veli: unknown[];
    };
    return { ...veli, cocukSayisi: ogrenci_veli?.length ?? 0 };
  });
}

export async function veliGetir(id: string): Promise<Veli | null> {
  await adminZorunlu();
  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("veliler")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Veli okunamadı: ${error.message}`);
  return (data as Veli | null) ?? null;
}

/**
 * Velinin cocuklari; her cocugun aktif sinif kayitlari ve cari bakiyesi de
 * geliyor. Veli sayfasi "bu aileyle ne durumdayiz" sorusunun tek ekranda
 * cevabi olsun diye: kardesler, hangi gunler gelecekleri ve borc birlikte.
 */
export async function velininCocuklari(veliId: string): Promise<
  {
    ogrenci: Ogrenci;
    yakinlik: string;
    birincil: boolean;
    siniflar: Sinif[];
    bakiye: number;
  }[]
> {
  await adminZorunlu();
  const db = await sunucuIstemcisi();

  const { data, error } = await db
    .from("ogrenci_veli")
    .select(
      "yakinlik, birincil, ogrenciler(*, kayitlar(durum, siniflar(*)), odemeler(tur, tutar))",
    )
    .eq("veli_id", veliId);

  if (error) throw new Error(`Veli çocukları okunamadı: ${error.message}`);

  return (data ?? []).flatMap((s) => {
    const satir = s as unknown as {
      yakinlik: string;
      birincil: boolean;
      ogrenciler:
        | (Ogrenci & {
            kayitlar: { durum: string; siniflar: Sinif | null }[];
            odemeler: { tur: "borc" | "tahsilat"; tutar: number }[];
          })
        | null;
    };
    if (!satir.ogrenciler) return [];

    const { kayitlar, odemeler, ...ogrenci } = satir.ogrenciler;
    const siniflar = (kayitlar ?? [])
      .filter((k) => k.durum === "aktif" && k.siniflar)
      .map((k) => k.siniflar as Sinif);
    const bakiye = (odemeler ?? []).reduce(
      (t, h) => t + (h.tur === "borc" ? h.tutar : -h.tutar),
      0,
    );

    return [
      {
        ogrenci,
        yakinlik: satir.yakinlik,
        birincil: satir.birincil,
        siniflar,
        bakiye,
      },
    ];
  });
}

// ----------------------------------------------------------------- siniflar

export type SinifOzet = Sinif & {
  /** Aktif kayit sayisi. Doluluk bundan hesaplaniyor. */
  ogrenciSayisi: number;
};

export async function siniflariGetir(donem?: string): Promise<SinifOzet[]> {
  await oturumZorunlu();
  const db = await sunucuIstemcisi();

  let q = db
    .from("siniflar")
    .select("*, kayitlar(id, durum)")
    .order("gun")
    .order("bas");

  if (donem) q = q.eq("donem", donem);

  const { data, error } = await q;
  if (error) throw new Error(`Sınıflar okunamadı: ${error.message}`);

  return (data ?? []).map((s) => {
    const { kayitlar, ...sinif } = s as unknown as Sinif & {
      kayitlar: { id: string; durum: string }[];
    };
    return {
      ...sinif,
      ogrenciSayisi: (kayitlar ?? []).filter((k) => k.durum === "aktif").length,
    };
  });
}

export async function sinifGetir(id: string): Promise<Sinif | null> {
  await oturumZorunlu();
  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("siniflar")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Sınıf okunamadı: ${error.message}`);
  return (data as Sinif | null) ?? null;
}

/** Sinifin ogrenci listesi. */
export async function sinifinOgrencileri(
  sinifId: string,
): Promise<(Kayit & { ogrenci: Ogrenci | null })[]> {
  await oturumZorunlu();
  const db = await sunucuIstemcisi();

  const { data, error } = await db
    .from("kayitlar")
    .select("*, ogrenciler(*)")
    .eq("sinif_id", sinifId)
    .order("baslangic");

  if (error) throw new Error(`Sınıf listesi okunamadı: ${error.message}`);

  return (data ?? []).map((k) => {
    const { ogrenciler, ...kayit } = k as unknown as Kayit & {
      ogrenciler: Ogrenci | null;
    };
    return { ...kayit, ogrenci: ogrenciler };
  });
}
