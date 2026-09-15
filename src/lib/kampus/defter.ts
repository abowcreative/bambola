import "server-only";

import { sunucuIstemcisi } from "@/lib/supabase/server";
import { adminZorunlu, oturumZorunlu } from "./oturum";
import type {
  DevamsizlikSatiri,
  DogumGunuPartisi,
  ExcelSayfasi,
  Gider,
  PaketSatisi,
  SuKarti,
} from "./defter-tipleri";

export * from "./defter-tipleri";

/**
 * Odeme defteri, giderler, dogum gunleri, su karti, devamsizlik cizelgesi
 * ve Excel arsivi veri erisimi. PLAN.md Bolum 42.
 *
 * Sorgular oturum istemcisiyle: RLS devrede. Para tablolarini yalniz
 * yonetici okuyor (0007 gocu); burada `adminZorunlu` ikinci savunma hatti.
 */

// ------------------------------------------------------------ odeme defteri

export type DefterAyi = {
  ay: string;
  satir: number;
  toplam: number;
  /** Tutari okunamayan (metin) satir sayisi. */
  tutarsiz: number;
};

/** Defterdeki aylar, en yeni once. */
export async function defterAylari(): Promise<DefterAyi[]> {
  await adminZorunlu();
  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("paket_satislari")
    .select("ay, tutar")
    .limit(5000);
  if (error) throw new Error(`Defter okunamadı: ${error.message}`);

  const harita = new Map<string, DefterAyi>();
  for (const s of (data ?? []) as { ay: string; tutar: number | null }[]) {
    const a = harita.get(s.ay) ?? { ay: s.ay, satir: 0, toplam: 0, tutarsiz: 0 };
    a.satir++;
    if (s.tutar === null) a.tutarsiz++;
    else a.toplam += s.tutar;
    harita.set(s.ay, a);
  }
  return [...harita.values()].sort((a, b) => b.ay.localeCompare(a.ay));
}

export type DefterSatiriOzet = PaketSatisi & {
  ogrenci: { id: string; ad: string; soyad: string | null } | null;
};

/** Bir ayin satirlari, Excel'deki sirayla (tarih, sonra satir numarasi). */
export async function defterSatirlari(ay: string): Promise<DefterSatiriOzet[]> {
  await adminZorunlu();
  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("paket_satislari")
    .select("*, ogrenciler(id, ad, soyad)")
    .eq("ay", ay)
    .order("tarih", { ascending: true, nullsFirst: false })
    .order("kaynak_satir", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(1000);
  if (error) throw new Error(`Defter okunamadı: ${error.message}`);
  return (data ?? []).map((s) => {
    const { ogrenciler, ...satir } = s as unknown as PaketSatisi & {
      ogrenciler: { id: string; ad: string; soyad: string | null } | null;
    };
    return { ...satir, ogrenci: ogrenciler };
  });
}

/** Ogrencinin defteri, en yeni once. Veli de kendi cocugununkini okuyabilir. */
export async function ogrencininDefteri(ogrenciId: string): Promise<PaketSatisi[]> {
  await oturumZorunlu();
  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("paket_satislari")
    .select("*")
    .eq("ogrenci_id", ogrenciId)
    .order("tarih", { ascending: false, nullsFirst: false })
    .order("kaynak_satir", { ascending: false });
  if (error) throw new Error(`Ödemeler okunamadı: ${error.message}`);
  return (data ?? []) as PaketSatisi[];
}

export type OgrenciDefterOzeti = {
  toplam: number;
  satir: number;
  son: { tarih: string | null; tutar: number | null; tutar_ham: string | null; odeme_turu: string | null; paket: string | null; program: string | null } | null;
};

/**
 * Ogrenci basina canli ozet: defter toplami ve son odeme. Excel'in
 * "TOPLAM ODENEN" ve "SON ODEME" sutunlarinin canli hali; Excel'deki
 * degerler ogrencinin kendi alanlarinda ayrica duruyor.
 */
export async function defterOzetleri(): Promise<Map<string, OgrenciDefterOzeti>> {
  await adminZorunlu();
  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("paket_satislari")
    .select("ogrenci_id, tarih, tutar, tutar_ham, odeme_turu, paket, program, kaynak_satir")
    .not("ogrenci_id", "is", null)
    .limit(5000);
  if (error) throw new Error(`Defter özeti okunamadı: ${error.message}`);

  const harita = new Map<string, OgrenciDefterOzeti>();
  for (const s of (data ?? []) as {
    ogrenci_id: string;
    tarih: string | null;
    tutar: number | null;
    tutar_ham: string | null;
    odeme_turu: string | null;
    paket: string | null;
    program: string | null;
    kaynak_satir: number | null;
  }[]) {
    const o = harita.get(s.ogrenci_id) ?? { toplam: 0, satir: 0, son: null };
    o.satir++;
    if (s.tutar !== null) o.toplam += s.tutar;
    const daha = !o.son || (s.tarih ?? "") > (o.son.tarih ?? "");
    if (daha) o.son = { tarih: s.tarih, tutar: s.tutar, tutar_ham: s.tutar_ham, odeme_turu: s.odeme_turu, paket: s.paket, program: s.program };
    harita.set(s.ogrenci_id, o);
  }
  return harita;
}

export type OgrenciSecenegi = {
  id: string;
  ad: string;
  soyad: string | null;
  durum: string;
  excel_adi: string | null;
  paket: string | null;
  program_metni: string | null;
  kalan_hak_saat: number | null;
  gelis_hakki: number | null;
  veli: string | null;
};

/** Odeme formu icin ogrenci listesi: ad, veli, paket ve hak sayaclari. */
export async function ogrenciSecenekleri(): Promise<OgrenciSecenegi[]> {
  await adminZorunlu();
  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("ogrenciler")
    .select(
      "id, ad, soyad, durum, excel_adi, paket, program_metni, kalan_hak_saat, gelis_hakki, ogrenci_veli(birincil, veliler(ad_soyad))",
    )
    .order("ad")
    .limit(2000);
  if (error) throw new Error(`Öğrenciler okunamadı: ${error.message}`);
  return (data ?? []).map((o) => {
    const { ogrenci_veli, ...rest } = o as unknown as Omit<OgrenciSecenegi, "veli"> & {
      ogrenci_veli: { birincil: boolean; veliler: { ad_soyad: string } | null }[];
    };
    const bag = (ogrenci_veli ?? []).sort((a, b) => Number(b.birincil) - Number(a.birincil))[0];
    return { ...rest, veli: bag?.veliler?.ad_soyad ?? null };
  });
}

/** Defterde gecen paket ve program yazimlari: formda oneri listesi. */
export async function defterSozlugu(): Promise<{ paketler: string[]; programlar: string[] }> {
  await adminZorunlu();
  const db = await sunucuIstemcisi();
  const { data } = await db.from("paket_satislari").select("paket, program").limit(5000);
  const say = (alan: "paket" | "program") => {
    const h = new Map<string, number>();
    for (const s of (data ?? []) as { paket: string | null; program: string | null }[]) {
      const v = s[alan]?.trim();
      if (v) h.set(v, (h.get(v) ?? 0) + 1);
    }
    return [...h.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v);
  };
  return { paketler: say("paket"), programlar: say("program") };
}

// ---------------------------------------------------------------- giderler

export async function giderAylari(): Promise<{ ay: string; satir: number; toplam: number }[]> {
  await adminZorunlu();
  const db = await sunucuIstemcisi();
  const { data, error } = await db.from("giderler").select("tarih, tutar").limit(5000);
  if (error) throw new Error(`Giderler okunamadı: ${error.message}`);
  const harita = new Map<string, { ay: string; satir: number; toplam: number }>();
  for (const g of (data ?? []) as { tarih: string; tutar: number }[]) {
    const ay = g.tarih.slice(0, 7);
    const a = harita.get(ay) ?? { ay, satir: 0, toplam: 0 };
    a.satir++;
    a.toplam += g.tutar;
    harita.set(ay, a);
  }
  return [...harita.values()].sort((a, b) => b.ay.localeCompare(a.ay));
}

export async function giderleriGetir(ay?: string): Promise<Gider[]> {
  await adminZorunlu();
  const db = await sunucuIstemcisi();
  let q = db
    .from("giderler")
    .select("*")
    .order("tarih", { ascending: false })
    .order("kaynak_satir", { ascending: false })
    .limit(1000);
  if (ay) {
    /* Ayin son gunu 28-31 arasi degisiyor; "YYYY-AA-31" Subat'ta gecersiz
       tarih. Ust sinir bir sonraki ayin ilk gunu, disarida birakilarak. */
    const [y, a] = ay.split("-").map(Number);
    const sonraki = a === 12 ? `${y + 1}-01-01` : `${y}-${String(a + 1).padStart(2, "0")}-01`;
    q = q.gte("tarih", `${ay}-01`).lt("tarih", sonraki);
  }
  const { data, error } = await q;
  if (error) throw new Error(`Giderler okunamadı: ${error.message}`);
  return (data ?? []) as Gider[];
}

export async function suKartiGetir(): Promise<SuKarti[]> {
  await adminZorunlu();
  const db = await sunucuIstemcisi();
  const { data, error } = await db.from("su_karti").select("*").order("kaynak_satir");
  if (error) throw new Error(`Su kartı okunamadı: ${error.message}`);
  return (data ?? []) as SuKarti[];
}

// ------------------------------------------------------------ dogum gunleri

export async function dogumGunleriGetir(): Promise<DogumGunuPartisi[]> {
  await adminZorunlu();
  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("dogum_gunu_partileri")
    .select("*")
    .order("organizasyon_tarihi", { ascending: false, nullsFirst: false })
    .limit(1000);
  if (error) throw new Error(`Doğum günleri okunamadı: ${error.message}`);
  return (data ?? []) as DogumGunuPartisi[];
}

// ---------------------------------------------------------- devamsizlik

export async function devamsizlikCizelgesi(): Promise<DevamsizlikSatiri[]> {
  await oturumZorunlu();
  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("devamsizlik_cizelgesi")
    .select("*")
    .order("kaynak_satir")
    .limit(1000);
  if (error) throw new Error(`Devamsızlık çizelgesi okunamadı: ${error.message}`);
  return (data ?? []) as DevamsizlikSatiri[];
}

// ------------------------------------------------------------ excel arsivi

export type ExcelSayfaOzeti = Omit<ExcelSayfasi, "satirlar"> & { satir_sayisi: number };

export async function excelSayfalariGetir(): Promise<ExcelSayfaOzeti[]> {
  await adminZorunlu();
  const db = await sunucuIstemcisi();
  /*
    `satirlar` cekilmiyor: GENEL LISTE tek basina ~200 KB. Satir sayisi icin
    jsonb uzunlugu Postgres tarafinda hesaplanamiyor (PostgREST'te fonksiyon
    yok), o yuzden hucre sayisi gosteriliyor, satir sayisi detayda.
  */
  const { data, error } = await db
    .from("excel_sayfalari")
    .select("id, dosya, sayfa_adi, sira, gizli, boyut, sutun_sayisi, hucre_sayisi, ice_aktarim")
    .order("sira");
  if (error) throw new Error(`Excel arşivi okunamadı: ${error.message}`);
  return (data ?? []).map((s) => ({ ...(s as Omit<ExcelSayfasi, "satirlar">), satir_sayisi: 0 }));
}

export async function excelSayfasiGetir(sira: number): Promise<ExcelSayfasi | null> {
  await adminZorunlu();
  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("excel_sayfalari")
    .select("*")
    .eq("sira", sira)
    .maybeSingle();
  if (error) throw new Error(`Excel sayfası okunamadı: ${error.message}`);
  return (data as ExcelSayfasi | null) ?? null;
}
