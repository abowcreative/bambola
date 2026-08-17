import "server-only";

import { sunucuIstemcisi } from "@/lib/supabase/server";
import { adminZorunlu } from "./oturum";
import { AILELER } from "@/lib/data/gruplar";

/**
 * Program ilgisi sayaci. PLAN.md Bolum 35.
 *
 * "Bu programa kaydol" tiklamalari. Tabloda kisi tanimlayan hicbir alan
 * yok (bkz. 0005_tiklamalar.sql); burada da yalniz sayilar uretiliyor.
 */

export type ProgramIlgisi = {
  slug: string;
  ad: string;
  yasEtiket: string;
  toplam: number;
  yediGun: number;
  otuzGun: number;
  /** Hangi sayfadan tiklandi: bilgi / ucretler / program / bilinmiyor. */
  nereden: Record<string, number>;
};

export type TiklamaOzeti = {
  programlar: ProgramIlgisi[];
  toplam: number;
  yediGun: number;
  /** Kayit yok mu: tablo hic yazilmadiysa "veri yok" demek gerekiyor. */
  bosMu: boolean;
  /**
   * Tablo hic yok mu (migration calistirilmadi). "Veri yok" ile "tablo yok"
   * ayri seyler: ilki beklenir, ikincisi eksik bir kurulum adimi demek ve
   * panelde acikca yazilmasi gerekiyor.
   */
  tabloYok: boolean;
};

const BOS: TiklamaOzeti = {
  programlar: [],
  toplam: 0,
  yediGun: 0,
  bosMu: true,
  tabloYok: false,
};

export async function tiklamaOzeti(): Promise<TiklamaOzeti> {
  await adminZorunlu();
  const db = await sunucuIstemcisi();

  /*
    Tek sorgu, sayim JS tarafinda. Program basina ayri count sorgusu
    atmak ondan fazla gidis donus demekti; tiklama hacmi bunun icin
    fazlasiyla kucuk (bkz. raporlar sayfasindaki ayni karar).
  */
  const { data, error } = await db
    .from("tiklamalar")
    .select("grup, nereden, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);

  /*
    Tablo yoksa RAPORLAR SAYFASI COKMESIN. Migration henuz calistirilmadan
    yayina cikilirsa butun raporlar bir sayacin eksikligi yuzunden
    erisilemez olurdu; panelde bunun yerine "kurulum eksik" yaziyor.
    PostgREST'in tablo bulunamadi kodu: 42P01.
  */
  if (error) {
    if (error.code === "42P01" || /schema cache/i.test(error.message)) {
      return { ...BOS, tabloYok: true };
    }
    throw new Error(`Tıklamalar okunamadı: ${error.message}`);
  }

  const satirlar = (data ?? []) as {
    grup: string;
    nereden: string | null;
    created_at: string;
  }[];

  const simdi = Date.now();
  const gun = 24 * 60 * 60 * 1000;

  const programlar = AILELER.map((a) => {
    const kendi = satirlar.filter((s) => s.grup === a.slug);
    const nereden: Record<string, number> = {};
    for (const s of kendi) {
      const k = s.nereden ?? "bilinmiyor";
      nereden[k] = (nereden[k] ?? 0) + 1;
    }
    return {
      slug: a.slug,
      ad: a.ad,
      yasEtiket: a.yasEtiket,
      toplam: kendi.length,
      yediGun: kendi.filter(
        (s) => simdi - Date.parse(s.created_at) < 7 * gun,
      ).length,
      otuzGun: kendi.filter(
        (s) => simdi - Date.parse(s.created_at) < 30 * gun,
      ).length,
      nereden,
    };
  }).sort((a, b) => b.toplam - a.toplam);

  return {
    programlar,
    toplam: satirlar.length,
    yediGun: satirlar.filter((s) => simdi - Date.parse(s.created_at) < 7 * gun)
      .length,
    bosMu: satirlar.length === 0,
    tabloYok: false,
  };
}
