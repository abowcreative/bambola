import type { Rol } from "./oturum";

/**
 * Kampus modul haritasi. Sol menu, panel kisayollari ve yetki kontrolleri
 * hepsi BURADAN uretiliyor. PLAN.md Bolum 28.
 *
 * Tek liste olmasinin sebebi: menude gorunen ama olmayan bir sayfa, ya da
 * olan ama menude gorunmeyen bir sayfa en sik rastlanan panel hatasi.
 *
 * `durum` alani dururken bos ekran YAZILMIYOR. "hazir" olmayan modul menude
 * isaretli goruniyor ve acildiginda ne bekledigini soyluyor. Yarim calisan
 * bir ekran, hic olmayandan kotudur: veri girilir, kaybolur.
 */

export type ModulDurumu =
  /** Calisiyor, gercek veriyle. */
  | "hazir"
  /** Ekrani var ama arkasindaki veri henuz yok. */
  | "kismi"
  /** Henuz yazilmadi. */
  | "bekliyor";

export type Modul = {
  slug: string;
  ad: string;
  /** Menude ve panelde tek cumlelik aciklama. */
  ozet: string;
  yol: string;
  ikon: string;
  roller: Rol[];
  durum: ModulDurumu;
  /** Neyi bekliyor. Sadece "hazir" olmayanlar icin. */
  bekleyen?: string;
};

export type ModulGrubu = { baslik: string; moduller: Modul[] };

export const MODUL_GRUPLARI: ModulGrubu[] = [
  {
    baslik: "Genel",
    moduller: [
      {
        slug: "panel",
        ad: "Panel",
        ozet: "Günün özeti: yeni başvurular, bugünkü dersler, bekleyen işler.",
        yol: "/kampus/panel",
        ikon: "Grup",
        roller: ["admin"],
        durum: "hazir",
      },
      {
        slug: "takvim",
        ad: "Haftalık takvim",
        ozet: "Kurumun haftalık ders programı, seans seans.",
        yol: "/kampus/takvim",
        ikon: "Takvim",
        roller: ["admin", "ogretmen"],
        durum: "hazir",
      },
    ],
  },
  {
    baslik: "Kayıt ve satış",
    moduller: [
      {
        slug: "basvurular",
        ad: "Başvurular",
        ozet: "Web sitesindeki kayıt formundan gelen talepler.",
        yol: "/kampus/basvurular",
        ikon: "Posta",
        roller: ["admin"],
        durum: "hazir",
      },
      {
        slug: "leadler",
        ad: "Lead'ler",
        ozet: "Instagram, telefon ve tavsiyeyle gelen talepler.",
        yol: "/kampus/leadler",
        ikon: "Yildiz",
        roller: ["admin"],
        durum: "hazir",
      },
      {
        slug: "ogrenciler",
        ad: "Öğrenciler",
        ozet: "Kayıtlı çocuklar, grupları ve devam durumları.",
        yol: "/kampus/ogrenciler",
        ikon: "Bebek",
        /*
          Ogretmen de goruyor ama YALNIZ kendi sinifindakileri: sinirlamayi
          RLS politikasi yapiyor, menu degil (bkz. 0003 migration).
        */
        roller: ["admin", "ogretmen"],
        durum: "hazir",
      },
      {
        slug: "veliler",
        ad: "Veliler",
        ozet: "Veli kayıtları, iletişim bilgileri ve çocuk bağlantıları.",
        yol: "/kampus/veliler",
        ikon: "Grup",
        roller: ["admin"],
        durum: "hazir",
      },
    ],
  },
  {
    baslik: "Eğitim",
    moduller: [
      {
        slug: "siniflar",
        ad: "Sınıflar",
        ozet: "Gruplar, kontenjan ve doluluk. Öğretmen ataması buradan.",
        yol: "/kampus/siniflar",
        ikon: "Ayi",
        // Ogretmen kendi siniflarini goruyor, atama yapamiyor.
        roller: ["admin", "ogretmen"],
        durum: "hazir",
      },
      {
        slug: "programlar",
        ad: "Programlar",
        ozet: "Dokuz atölye ve program ailesi, yaş aralıkları ve içerikleri.",
        yol: "/kampus/programlar",
        ikon: "Firca",
        roller: ["admin", "ogretmen"],
        durum: "hazir",
      },
      {
        slug: "yoklama",
        ad: "Yoklama",
        ozet: "Seans seans devam, telafi ve devamsızlık takibi.",
        yol: "/kampus/yoklama",
        ikon: "Tik",
        roller: ["admin", "ogretmen"],
        durum: "hazir",
      },
      {
        slug: "dersler",
        ad: "Ders kayıtları",
        ozet: "Ders işlendi mi, kim işledi, ne yapıldı.",
        yol: "/kampus/dersler",
        ikon: "Ampul",
        roller: ["admin", "ogretmen"],
        durum: "hazir",
      },
      {
        slug: "ogretmenler",
        ad: "Öğretmenler",
        ozet: "Kadro, haftalık yük ve verdikleri programlar.",
        yol: "/kampus/ogretmenler",
        ikon: "Kalp",
        roller: ["admin"],
        durum: "hazir",
      },
    ],
  },
  {
    baslik: "Finans",
    moduller: [
      {
        slug: "ucretler",
        ad: "Paketler ve ücretler",
        ozet: "Tarife, erken kayıt penceresi ve indirim kuralları.",
        yol: "/kampus/ucretler",
        ikon: "Sayilar",
        roller: ["admin"],
        durum: "hazir",
      },
      {
        slug: "cari",
        ad: "Cari hesap",
        ozet: "Öğrenci bazında borç, tahsilat ve bakiye.",
        yol: "/kampus/cari",
        ikon: "Rozet",
        roller: ["admin"],
        durum: "hazir",
      },
      {
        slug: "tahsilat",
        ad: "Tahsilat takibi",
        ozet: "Vadesi gelen ve geçen ödemeler.",
        yol: "/kampus/tahsilat",
        ikon: "Saat",
        roller: ["admin"],
        durum: "hazir",
      },
    ],
  },
  {
    baslik: "Kurum",
    moduller: [
      {
        slug: "mekan",
        ad: "Mekân",
        ozet: "Oyun alanları, atölye sınıfları ve teras kareleri.",
        yol: "/kampus/mekan",
        ikon: "Konum",
        roller: ["admin"],
        durum: "hazir",
      },
      {
        slug: "yemek",
        ad: "Yemek ve menü",
        ozet: "Haftalık menü, alerji ve özel beslenme notları.",
        yol: "/kampus/yemek",
        ikon: "Balon",
        roller: ["admin", "ogretmen"],
        durum: "hazir",
      },
      {
        slug: "duyurular",
        ad: "Duyurular",
        ozet: "Velilere ve öğretmenlere giden bildirimler.",
        yol: "/kampus/duyurular",
        ikon: "Muzik",
        roller: ["admin"],
        durum: "hazir",
      },
      {
        slug: "raporlar",
        ad: "Raporlar",
        ozet: "Doluluk, dönüşüm, gelir ve devamsızlık raporları.",
        yol: "/kampus/raporlar",
        ikon: "Mercek",
        roller: ["admin"],
        durum: "hazir",
      },
    ],
  },
  {
    baslik: "Veli",
    moduller: [
      {
        slug: "cocugum",
        ad: "Çocuğum",
        ozet: "Çocuğunuzun programı, devam durumu ve ödemeleri.",
        yol: "/kampus/cocugum",
        ikon: "Bebek",
        roller: ["veli"],
        durum: "hazir",
      },
    ],
  },
  {
    baslik: "Sistem",
    moduller: [
      {
        slug: "kullanicilar",
        ad: "Kullanıcılar",
        ozet: "Admin, öğretmen ve veli hesapları, rol yönetimi.",
        yol: "/kampus/kullanicilar",
        ikon: "Grup",
        roller: ["admin"],
        durum: "hazir",
      },
      {
        slug: "entegrasyonlar",
        ad: "Entegrasyonlar",
        ozet: "Instagram, e-posta, ödeme ve takvim bağlantıları.",
        yol: "/kampus/entegrasyonlar",
        ikon: "Rozet",
        roller: ["admin"],
        durum: "hazir",
      },
      {
        slug: "ayarlar",
        ad: "Ayarlar",
        ozet: "Kurum bilgileri, çalışma saatleri ve site içeriği.",
        yol: "/kampus/ayarlar",
        ikon: "Ampul",
        roller: ["admin"],
        durum: "hazir",
      },
    ],
  },
];

export const MODULLER: Modul[] = MODUL_GRUPLARI.flatMap((g) => g.moduller);

export function modulBul(slug: string): Modul | undefined {
  return MODULLER.find((m) => m.slug === slug);
}

/** Rolun gorebilecegi gruplar. Bos grup dusuyor. */
export function rolunGruplari(rol: Rol): ModulGrubu[] {
  return MODUL_GRUPLARI.map((g) => ({
    ...g,
    moduller: g.moduller.filter((m) => m.roller.includes(rol)),
  })).filter((g) => g.moduller.length > 0);
}
