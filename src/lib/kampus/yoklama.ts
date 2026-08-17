import "server-only";

import { sunucuIstemcisi } from "@/lib/supabase/server";
import { adminZorunlu, oturumZorunlu, oturumuGetir } from "./oturum";
import type { Ogrenci, Sinif } from "./ogrenci-tipleri";
import type {
  Ders,
  Duyuru,
  Lead,
  LeadDurumu,
  Menu,
  Odeme,
  YoklamaKaydi,
} from "./yoklama-tipleri";
import { bakiyeHesapla } from "./yoklama-tipleri";

export * from "./yoklama-tipleri";

/**
 * Ders, yoklama, odeme, lead, menu ve duyuru veri erisimi.
 * PLAN.md Bolum 31.
 *
 * Sorgular oturum istemcisiyle: RLS devrede. Ogretmen kendi siniflarini,
 * veli kendi cocugunu goruyor; odemeleri ogretmen HIC gormuyor.
 */

// ------------------------------------------------------------------ dersler

export type DersOzet = Ders & {
  sinif: Sinif | null;
  /** Yoklama alinmis mi ve kac kisi geldi. */
  yoklamaSayisi: number;
  gelenSayisi: number;
};

export async function dersleriGetir(suzgec?: {
  sinifId?: string;
  baslangic?: string;
  bitis?: string;
  durum?: Ders["durum"] | "hepsi";
}): Promise<DersOzet[]> {
  await oturumZorunlu();
  const db = await sunucuIstemcisi();

  let q = db
    .from("dersler")
    .select("*, siniflar(*), yoklama(id, durum)")
    .order("tarih", { ascending: false })
    .limit(400);

  if (suzgec?.sinifId) q = q.eq("sinif_id", suzgec.sinifId);
  if (suzgec?.baslangic) q = q.gte("tarih", suzgec.baslangic);
  if (suzgec?.bitis) q = q.lte("tarih", suzgec.bitis);
  if (suzgec?.durum && suzgec.durum !== "hepsi") {
    q = q.eq("durum", suzgec.durum);
  }

  const { data, error } = await q;
  if (error) throw new Error(`Dersler okunamadı: ${error.message}`);

  return (data ?? []).map((d) => {
    const { siniflar, yoklama, ...ders } = d as unknown as Ders & {
      siniflar: Sinif | null;
      yoklama: { id: string; durum: string }[];
    };
    const y = yoklama ?? [];
    return {
      ...ders,
      sinif: siniflar,
      yoklamaSayisi: y.length,
      gelenSayisi: y.filter((x) => x.durum === "geldi" || x.durum === "telafi")
        .length,
    };
  });
}

export async function dersGetir(
  id: string,
): Promise<(Ders & { sinif: Sinif | null }) | null> {
  await oturumZorunlu();
  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("dersler")
    .select("*, siniflar(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Ders okunamadı: ${error.message}`);
  if (!data) return null;
  const { siniflar, ...ders } = data as unknown as Ders & {
    siniflar: Sinif | null;
  };
  return { ...ders, sinif: siniflar };
}

/** Dersin yoklama listesi: sinifin aktif ogrencileri + varsa isaretleri. */
export async function dersYoklamasi(dersId: string, sinifId: string) {
  await oturumZorunlu();
  const db = await sunucuIstemcisi();

  const [{ data: kayitlar }, { data: isaretler }] = await Promise.all([
    db
      .from("kayitlar")
      .select("ogrenci_id, ogrenciler(*)")
      .eq("sinif_id", sinifId)
      .eq("durum", "aktif"),
    db.from("yoklama").select("*").eq("ders_id", dersId),
  ]);

  const isaretHaritasi = new Map(
    ((isaretler ?? []) as YoklamaKaydi[]).map((y) => [y.ogrenci_id, y]),
  );

  return ((kayitlar ?? []) as unknown as {
    ogrenci_id: string;
    ogrenciler: Ogrenci | null;
  }[])
    .flatMap((k) => (k.ogrenciler ? [k.ogrenciler] : []))
    .map((o) => ({ ogrenci: o, isaret: isaretHaritasi.get(o.id) ?? null }));
}

/** Ogrencinin devam gecmisi. */
export async function ogrencininYoklamasi(ogrenciId: string) {
  await oturumZorunlu();
  const db = await sunucuIstemcisi();

  const { data, error } = await db
    .from("yoklama")
    .select("*, dersler(tarih, sinif_id, siniflar(ad, atolye_slug))")
    .eq("ogrenci_id", ogrenciId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(`Devam bilgisi okunamadı: ${error.message}`);
  return (data ?? []) as unknown as (YoklamaKaydi & {
    dersler: {
      tarih: string;
      sinif_id: string;
      siniflar: { ad: string; atolye_slug: string | null } | null;
    } | null;
  })[];
}

// ----------------------------------------------------------------- odemeler

export async function ogrencininOdemeleri(ogrenciId: string) {
  await oturumZorunlu();
  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("odemeler")
    .select("*")
    .eq("ogrenci_id", ogrenciId)
    .order("tarih", { ascending: false });
  if (error) throw new Error(`Ödemeler okunamadı: ${error.message}`);
  return (data ?? []) as Odeme[];
}

export type CariSatiri = {
  ogrenci: Ogrenci;
  borc: number;
  tahsilat: number;
  bakiye: number;
  /** Vadesi gecmis borc var mi. */
  gecikmis: boolean;
};

export async function cariListesi(): Promise<CariSatiri[]> {
  await adminZorunlu();
  const db = await sunucuIstemcisi();

  const { data, error } = await db
    .from("ogrenciler")
    .select("*, odemeler(tur, tutar, vade)")
    .order("ad");

  if (error) throw new Error(`Cari okunamadı: ${error.message}`);

  const bugun = new Date().toISOString().slice(0, 10);

  return (data ?? []).map((o) => {
    const { odemeler, ...ogrenci } = o as unknown as Ogrenci & {
      odemeler: { tur: "borc" | "tahsilat"; tutar: number; vade: string | null }[];
    };
    const hareketler = odemeler ?? [];
    const { borc, tahsilat, bakiye } = bakiyeHesapla(hareketler);
    /*
      Gecikmis: vadesi gecmis borc VARSA ve genel bakiye pozitifse. Bakiye
      sifirsa vadesi gecmis satir kapanmis demektir.
    */
    const gecikmis =
      bakiye > 0 &&
      hareketler.some((h) => h.tur === "borc" && h.vade && h.vade < bugun);
    return { ogrenci, borc, tahsilat, bakiye, gecikmis };
  });
}

// ------------------------------------------------------------------ leadler

export async function leadleriGetir(suzgec?: {
  durum?: LeadDurumu | "hepsi";
  ara?: string;
}): Promise<Lead[]> {
  await adminZorunlu();
  const db = await sunucuIstemcisi();

  let q = db
    .from("leadler")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (suzgec?.durum && suzgec.durum !== "hepsi") {
    q = q.eq("durum", suzgec.durum);
  }
  if (suzgec?.ara?.trim()) {
    const a = suzgec.ara.trim();
    const rakamlar = a.replace(/\D/g, "").replace(/^(90|0)/, "");
    const kaliplar = [
      `ad_soyad.ilike.%${a}%`,
      `cocuk_adi.ilike.%${a}%`,
      ...(rakamlar.length >= 3 ? [`telefon.ilike.%${rakamlar}%`] : []),
    ];
    q = q.or(kaliplar.join(","));
  }

  const { data, error } = await q;
  if (error) throw new Error(`Lead'ler okunamadı: ${error.message}`);
  return (data ?? []) as Lead[];
}

// ------------------------------------------------------------------- menuler

export async function menuleriGetir(
  baslangic: string,
  bitis: string,
): Promise<Menu[]> {
  await oturumZorunlu();
  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("menuler")
    .select("*")
    .gte("tarih", baslangic)
    .lte("tarih", bitis)
    .order("tarih");
  if (error) throw new Error(`Menü okunamadı: ${error.message}`);
  return (data ?? []) as Menu[];
}

// ----------------------------------------------------------------- duyurular

export async function duyurulariGetir(): Promise<Duyuru[]> {
  const oturum = await oturumZorunlu();
  const db = await sunucuIstemcisi();

  /*
    Admin taslaklari da goruyor; digerleri yalniz yayinda olani. Ikinci
    sinirlamayi RLS de yapiyor, buradaki filtre gorunum icin.
  */
  let q = db
    .from("duyurular")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (oturum.rol !== "admin") q = q.eq("yayinda", true);

  const { data, error } = await q;
  if (error) throw new Error(`Duyurular okunamadı: ${error.message}`);
  return (data ?? []) as Duyuru[];
}

// ------------------------------------------------------------------ raporlar

export type Rapor = {
  ogrenciSayisi: number;
  aktifOgrenci: number;
  sinifSayisi: number;
  toplamKontenjan: number;
  toplamKayit: number;
  basvuruSayisi: number;
  kayitOlanBasvuru: number;
  leadSayisi: number;
  leadKazanilan: number;
  islenenDers: number;
  planliDers: number;
  gelenIsaret: number;
  gelmedenIsaret: number;
  toplamBorc: number;
  toplamTahsilat: number;
};

export async function raporuGetir(): Promise<Rapor> {
  await adminZorunlu();
  const db = await sunucuIstemcisi();

  /*
    Her tablodan TEK sorgu, sayimlar burada yapiliyor.

    Onceki hali on iki ayri `count` sorgusu atiyordu (ogrenciler-hepsi,
    ogrenciler-aktif, basvurular-hepsi, basvurular-kayit_oldu, ...). Sunucu
    Frankfurt'ta, veritabani Irlanda'da: her sorgu bir gidis-donus ve on iki
    sorgu sayfayi 1,4 saniyeye cikariyordu.

    Durum alanlarini cekip JS'te saymak, veri hacmi bu olcekte (binlerce
    satir) sayim sorgularindan hizli. On binlere cikarsa veritabaninda bir
    gorunum veya `group by` sayfasi yazilir.
  */
  const [
    { data: ogrenciler },
    { data: basvurular },
    { data: leadler },
    { data: dersler },
    { data: yoklamalar },
    { data: kayitlar },
    { data: siniflar },
    { data: hareketler },
  ] = await Promise.all([
    db.from("ogrenciler").select("durum"),
    db.from("basvurular").select("durum"),
    db.from("leadler").select("durum"),
    db.from("dersler").select("durum"),
    db.from("yoklama").select("durum"),
    db.from("kayitlar").select("durum"),
    db.from("siniflar").select("kontenjan"),
    db.from("odemeler").select("tur, tutar"),
  ]);

  const say = (
    liste: { durum?: string }[] | null,
    durum?: string,
  ): number => {
    const l = liste ?? [];
    return durum ? l.filter((x) => x.durum === durum).length : l.length;
  };

  const ogrenciSayisi = say(ogrenciler);
  const aktifOgrenci = say(ogrenciler, "aktif");
  const basvuruSayisi = say(basvurular);
  const kayitOlanBasvuru = say(basvurular, "kayit_oldu");
  const leadSayisi = say(leadler);
  const leadKazanilan = say(leadler, "kayit_oldu");
  const islenenDers = say(dersler, "islendi");
  const planliDers = say(dersler, "planli");
  const gelenIsaret = say(yoklamalar, "geldi");
  const gelmedenIsaret = say(yoklamalar, "gelmedi");
  const toplamKayit = say(kayitlar, "aktif");

  const toplamKontenjan = (siniflar ?? []).reduce(
    (t, s) => t + ((s as { kontenjan: number }).kontenjan ?? 0),
    0,
  );

  const { borc, tahsilat } = bakiyeHesapla(
    (hareketler ?? []) as { tur: "borc" | "tahsilat"; tutar: number }[],
  );

  return {
    ogrenciSayisi,
    aktifOgrenci,
    sinifSayisi: (siniflar ?? []).length,
    toplamKontenjan,
    toplamKayit,
    basvuruSayisi,
    kayitOlanBasvuru,
    leadSayisi,
    leadKazanilan,
    islenenDers,
    planliDers,
    gelenIsaret,
    gelmedenIsaret,
    toplamBorc: borc,
    toplamTahsilat: tahsilat,
  };
}

// -------------------------------------------------------------- veli gorunumu

/** Oturum acan velinin cocuklari. */
export async function cocuklarim() {
  const oturum = await oturumuGetir();
  if (!oturum || oturum.rol !== "veli") return [];

  const db = await sunucuIstemcisi();
  const { data } = await db
    .from("ogrenci_veli")
    .select("yakinlik, ogrenciler(*)")
    .order("yakinlik");

  return ((data ?? []) as unknown as {
    yakinlik: string;
    ogrenciler: Ogrenci | null;
  }[]).flatMap((x) => (x.ogrenciler ? [x.ogrenciler] : []));
}
