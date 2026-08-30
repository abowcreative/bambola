import { adminZorunlu } from "@/lib/kampus/oturum";
import { sunucuIstemcisi } from "@/lib/supabase/server";
import { Kabuk, SayfaBasi, Kutu } from "@/components/kampus/kabuk";
import {
  Bildirim,
  Rozet,
  Sayac,
  TabloSarmal,
  Th,
  Td,
  Tr,
} from "@/components/kampus/ui";
import {
  HesapAcFormu,
  HesapDuzenle,
} from "@/components/kampus/kullanici-formu";
import { HESAP_TONU } from "@/lib/kampus/tonlar";
import { EKIP } from "@/lib/data/ekip";
import { Ikon } from "@/components/ui/ikon";

export const metadata = { title: "Kullanıcılar", robots: { index: false } };
export const dynamic = "force-dynamic";

const ROL_ETIKET: Record<string, string> = {
  admin: "Yönetici",
  ogretmen: "Öğretmen",
  veli: "Veli",
};

type Profil = {
  id: string;
  rol: string;
  ad_soyad: string;
  telefon: string | null;
  ogretmen_ad: string | null;
  aktif: boolean;
  created_at: string;
};

/**
 * Kampus hesaplari ve rolleri.
 *
 * Hesap acma, rol degistirme, kapatma ve silme BURADAN yapiliyor. Islemler
 * Supabase yonetici anahtarini kullaniyor ama anahtar sunucuda kaliyor:
 * `lib/kampus/kullanici-islemleri.ts` bir `"use server"` dosyasi ve hicbir
 * zaman tarayici paketine girmiyor.
 *
 * `npm run kampus:kullanici` betigi duruyor ve durmali: panele girip hesap
 * acabilmek icin once bir yonetici hesabi gerekiyor, ILK hesap oradan
 * aciliyor.
 */
export default async function KullanicilarSayfasi() {
  const oturum = await adminZorunlu();
  const db = await sunucuIstemcisi();

  const { data } = await db
    .from("profiller")
    .select("id, rol, ad_soyad, telefon, ogretmen_ad, aktif, created_at")
    .order("created_at", { ascending: true });

  const profiller = (data ?? []) as Profil[];
  const say = (r: string) => profiller.filter((p) => p.rol === r).length;

  /* Hesabi olmayan ogretmenler: kadroda var ama panele giremiyor. */
  const hesapsiz = EKIP.filter(
    (o) => !profiller.some((p) => p.ogretmen_ad === o.ad),
  );

  const ogretmenAdlari = EKIP.map((o) => o.ad);

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/kullanicilar">
      <SayfaBasi
        baslik="Kullanıcılar"
        aciklama="Panele giriş yapabilen hesaplar ve rolleri."
        cocuklar={<HesapAcFormu ogretmenler={ogretmenAdlari} />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Sayac etiket="Toplam" deger={profiller.length} />
        <Sayac etiket="Yönetici" deger={say("admin")} ton="bilgi" />
        <Sayac etiket="Öğretmen" deger={say("ogretmen")} ton="basari" />
        <Sayac etiket="Veli" deger={say("veli")} />
      </div>

      <Kutu baslik="Hesaplar" className="mt-4" dolgusuz>
        <TabloSarmal enAz="40rem">
          <thead>
            <tr>
              <Th>Ad soyad</Th>
              <Th>Rol</Th>
              <Th>Program adı</Th>
              <Th>Telefon</Th>
              <Th sag>Durum</Th>
              <Th sag>İşlem</Th>
            </tr>
          </thead>
          <tbody>
            {profiller.map((p) => (
              <Tr key={p.id}>
                <Td className="font-semibold">
                  {p.ad_soyad}
                  {p.id === oturum.kullaniciId && (
                    <span className="ml-2 align-middle">
                      <Rozet ton="sessiz">siz</Rozet>
                    </span>
                  )}
                </Td>
                <Td>
                  <Rozet ton={HESAP_TONU[p.rol] ?? "notr"}>
                    {ROL_ETIKET[p.rol] ?? p.rol}
                  </Rozet>
                </Td>
                <Td className="text-panel-soluk">{p.ogretmen_ad ?? "—"}</Td>
                <Td className="text-panel-soluk">{p.telefon ?? "—"}</Td>
                <Td sag>
                  {p.aktif ? (
                    <Rozet ton="basari">Aktif</Rozet>
                  ) : (
                    <Rozet ton="sessiz">Kapalı</Rozet>
                  )}
                </Td>
                <Td sag>
                  <span className="inline-flex justify-end">
                    <HesapDuzenle
                      hesap={p}
                      ogretmenler={ogretmenAdlari}
                      kendisi={p.id === oturum.kullaniciId}
                    />
                  </span>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TabloSarmal>
      </Kutu>

      {hesapsiz.length > 0 && (
        <div className="mt-4">
          <Bildirim
            ton="uyari"
            baslik="Hesabı olmayan öğretmenler"
            ikon={<Ikon.Ampul boyut={16} />}
          >
            Kadroda olup panele girişi olmayanlar:{" "}
            <strong className="text-murekkep">
              {hesapsiz.map((o) => o.ad).join(", ")}
            </strong>
            . Hesap açarken “Program adı” alanında bu adlardan biri
            seçilmeli; haftalık programdaki eşleşme onunla kuruluyor.
          </Bildirim>
        </div>
      )}

      <Kutu baslik="Şifreler nasıl belirleniyor" className="mt-4">
        <p className="text-sm leading-relaxed text-panel-soluk">
          Hesap açarken şifre belirlenmiyor. İşlem{" "}
          <strong className="text-murekkep">tek kullanımlık bir bağlantı</strong>{" "}
          üretiyor; kişi kendi şifresini kendisi koyuyor. Bağlantı ekranda
          gösterilir, e-posta gönderilmez — kime verdiğinizi bilerek elden
          verirsiniz. Şifresini unutan biri için “Şifre bağlantısı üret”
          yeterli.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-panel-soluk">
          İlk yönetici hesabı hâlâ terminalden açılıyor; panele girip hesap
          açabilmek için önce bir yönetici gerekiyor:
        </p>
        <pre className="mt-2 overflow-x-auto rounded-panel-sm border border-panel-cizgi bg-panel-yuzey-alt px-3.5 py-2.5 font-mono text-xs text-murekkep">
          {`npm run kampus:kullanici -- <eposta> "<ad soyad>" admin`}
        </pre>
      </Kutu>
    </Kabuk>
  );
}
