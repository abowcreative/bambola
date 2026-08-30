import Link from "next/link";
import type { ReactNode } from "react";
import { Ikon } from "@/components/ui/ikon";
import type { Oturum, Rol } from "@/lib/kampus/oturum";
import { MODULLER, rolunGruplari } from "@/lib/kampus/moduller";
import { MenuCekmecesi, YanMenuSutunu } from "./yan-menu";
import { KullaniciKutusu } from "./kullanici-kutusu";
import { Kart, KartBasi, Sayac, BosDurum } from "./ui";

/**
 * Panel kabugu: sol menu, ust cubuk, icerik alani.
 *
 * Menu ROLE GORE uretiliyor (lib/kampus/moduller.ts). Ama bu yalniz gorunum:
 * bir ogretmen adres cubuguna /kampus/cari yazarsa menude gormemesi onu
 * durdurmaz. Asil engel her sayfanin basindaki `rolZorunlu()` ve veritabani
 * RLS politikalari.
 *
 * `Sayac` ve `BosDurum` burada TANIMLI DEGIL, `ui.tsx` icinden geciyor:
 * sayfalarin yarisi onlari bu dosyadan aliyordu, tasima sirasinda iki ayri
 * surum olusmasin diye tek kaynaktan yeniden veriliyorlar.
 */

export { Sayac, BosDurum };

const ROL_ETIKET: Record<Rol, string> = {
  admin: "Yönetici",
  ogretmen: "Öğretmen",
  veli: "Veli",
};

/** Aktif yolun hangi modul ve hangi gruba dustugu. */
function konum(aktifYol: string): { grup?: string; ad?: string } {
  /* En uzun eslesme kazaniyor: /kampus/yoklama ile /kampus/yoklama/[id]
     ayni modul, ama /kampus/ogrenciler ile /kampus/ogretmenler ayri. */
  const modul = MODULLER.filter(
    (m) => aktifYol === m.yol || aktifYol.startsWith(`${m.yol}/`),
  ).sort((a, b) => b.yol.length - a.yol.length)[0];
  if (!modul) return {};
  const grup = rolunGruplari("admin").find((g) =>
    g.moduller.some((m) => m.slug === modul.slug),
  );
  return { grup: grup?.baslik, ad: modul.ad };
}

export function Kabuk({
  oturum,
  aktifYol,
  ustCocuk,
  children,
}: {
  oturum: Oturum;
  aktifYol: string;
  /** Ust cubugun sagina eklenen islem alani. */
  ustCocuk?: ReactNode;
  children: ReactNode;
}) {
  const gruplar = rolunGruplari(oturum.rol);
  const { grup, ad } = konum(aktifYol);

  const kullaniciOzellikleri = {
    adSoyad: oturum.adSoyad,
    eposta: oturum.eposta,
    rolEtiketi: ROL_ETIKET[oturum.rol],
    yonetici: oturum.rol === "admin",
  };

  return (
    <div className="flex min-h-dvh bg-panel-zemin">
      <YanMenuSutunu
        gruplar={gruplar}
        aktifYol={aktifYol}
        altCocuk={<KullaniciKutusu {...kullaniciOzellikleri} yon="yukari" />}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/*
          Ust cubuk yarı saydam ve bulanik: icerik altindan kayarken
          kesilmis gibi durmuyor. `backdrop-blur` desteklenmeyen tarayicida
          duz beyaza dusuyor, okunurluk degismiyor.
        */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-panel-cizgi bg-panel-yuzey/85 px-4 backdrop-blur sm:px-6">
          <MenuCekmecesi gruplar={gruplar} aktifYol={aktifYol} />

          <nav aria-label="Konum" className="min-w-0">
            <ol className="flex min-w-0 items-center gap-1.5 text-sm">
              <li className="hidden shrink-0 sm:block">
                <Link
                  href="/kampus"
                  className="text-panel-silik transition-colors hover:text-panel-soluk"
                >
                  Kampüs
                </Link>
              </li>
              {grup && (
                <>
                  <li aria-hidden className="hidden shrink-0 text-panel-cizgi-guclu sm:block">
                    /
                  </li>
                  <li className="hidden shrink-0 text-panel-silik lg:block">
                    {grup}
                  </li>
                  <li aria-hidden className="hidden shrink-0 text-panel-cizgi-guclu lg:block">
                    /
                  </li>
                </>
              )}
              <li className="min-w-0 truncate font-baslik font-bold text-murekkep">
                {ad ?? "Panel"}
              </li>
            </ol>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {ustCocuk}
            {/* Telefonda sol sutun yok; oturum kutusu ust cubuga geciyor. */}
            <div className="w-auto sm:w-44 lg:hidden">
              <KullaniciKutusu {...kullaniciOzellikleri} yon="asagi" />
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <div className="mx-auto w-full max-w-[86rem]">{children}</div>
        </main>
      </div>
    </div>
  );
}

/**
 * Sayfa basligi ve sag tarafa cagri alani.
 *
 * Ust cubuktaki kirilma yolu "neredeyim"i soyluyor; bu baslik "bu sayfa ne
 * yapiyor"u. Ikisi ayni metni tekrarladigi icin degil, farkli sorulari
 * cevapladigi icin bir arada duruyorlar.
 */
export function SayfaBasi({
  baslik,
  aciklama,
  cocuklar,
  className = "",
}: {
  baslik: string;
  aciklama?: ReactNode;
  cocuklar?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 ${className}`}
    >
      <div className="min-w-0">
        <h1 className="font-baslik text-xl font-bold leading-tight text-murekkep sm:text-2xl">
          {baslik}
        </h1>
        {aciklama && (
          <p className="mt-1 text-sm leading-snug text-panel-soluk">
            {aciklama}
          </p>
        )}
      </div>
      {cocuklar && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {cocuklar}
        </div>
      )}
    </div>
  );
}

/**
 * Panel kutusu. Baslik + icerik, her modulde ayni cerceve.
 *
 * `Kart` + `KartBasi` ikilisinin kisayolu. Ic dolgu kutunun kendisinde
 * degil govde katmaninda: baslik seridi ve tablo kenarlara kadar
 * uzanabilsin diye.
 */
export function Kutu({
  baslik,
  aciklama,
  yanCocuk,
  /** Govde dolgusunu kaldirir: tablo ve tam genislikli listeler icin. */
  dolgusuz = false,
  className = "",
  govdeSinifi = "",
  children,
}: {
  baslik?: ReactNode;
  aciklama?: ReactNode;
  yanCocuk?: ReactNode;
  dolgusuz?: boolean;
  className?: string;
  govdeSinifi?: string;
  children: ReactNode;
}) {
  return (
    <Kart className={`overflow-hidden ${className}`}>
      {baslik && (
        <KartBasi baslik={baslik} aciklama={aciklama} yanCocuk={yanCocuk} />
      )}
      <div className={`${dolgusuz ? "" : "p-4"} ${govdeSinifi}`}>{children}</div>
    </Kart>
  );
}

/**
 * Bir kayittan geri donen baglanti.
 *
 * Ayri bilesen cunku detay sayfalarinin hepsinde ayni ve hepsinde ayni
 * yerde durmasi gerekiyor: tarayicinin geri dugmesi her zaman listeye
 * gotürmüyor (bir kayittan digerine gecilmis olabilir).
 */
export function GeriBaglantisi({
  yol,
  etiket,
}: {
  yol: string;
  etiket: string;
}) {
  return (
    <Link
      href={yol}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-panel-soluk transition-colors hover:text-yesil-derin"
    >
      <Ikon.OkGeri boyut={15} />
      {etiket}
    </Link>
  );
}
