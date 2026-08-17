import { adminZorunlu } from "@/lib/kampus/oturum";
import { sunucuIstemcisi } from "@/lib/supabase/server";
import { Kabuk, SayfaBasi, Kutu, Sayac } from "@/components/kampus/kabuk";
import { EKIP } from "@/lib/data/ekip";

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
 * Hesap ACMA burada degil, `npm run kampus:kullanici` betiginde. Sebebi:
 * hesap acmak Supabase yonetici anahtarini gerektiriyor ve o anahtar
 * tarayiciya asla gitmemeli. Panelden acilabilir hale getirmek, sunucuda
 * ayri bir yetkili uc nokta yazmak demek; oncelikli isler bitmeden bu
 * yuzeyi acmiyoruz.
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

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/kullanicilar">
      <SayfaBasi
        baslik="Kullanıcılar"
        aciklama="Panele giriş yapabilen hesaplar ve rolleri."
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <Sayac etiket="Toplam" deger={profiller.length} />
        <Sayac etiket="Yönetici" deger={say("admin")} />
        <Sayac etiket="Öğretmen" deger={say("ogretmen")} />
        <Sayac etiket="Veli" deger={say("veli")} />
      </div>

      <Kutu baslik="Hesaplar" className="mt-6">
        <div className="-mx-5 overflow-x-auto px-5">
          <table className="w-full min-w-[36rem] text-sm">
            <thead>
              <tr className="border-b-2 border-cizgi text-left">
                <th className="pb-2 font-baslik text-xs uppercase tracking-wide text-murekkep-soluk">
                  Ad soyad
                </th>
                <th className="pb-2 font-baslik text-xs uppercase tracking-wide text-murekkep-soluk">
                  Rol
                </th>
                <th className="pb-2 font-baslik text-xs uppercase tracking-wide text-murekkep-soluk">
                  Program adı
                </th>
                <th className="pb-2 text-right font-baslik text-xs uppercase tracking-wide text-murekkep-soluk">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cizgi">
              {profiller.map((p) => (
                <tr key={p.id}>
                  <td className="py-2.5 font-medium text-murekkep">
                    {p.ad_soyad}
                  </td>
                  <td className="py-2.5 text-murekkep-soluk">
                    {ROL_ETIKET[p.rol] ?? p.rol}
                  </td>
                  <td className="py-2.5 text-murekkep-soluk">
                    {p.ogretmen_ad ?? "—"}
                  </td>
                  <td className="py-2.5 text-right">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        p.aktif
                          ? "bg-lime-rozet text-black"
                          : "bg-cizgi text-murekkep-soluk"
                      }`}
                    >
                      {p.aktif ? "Aktif" : "Kapalı"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Kutu>

      {hesapsiz.length > 0 && (
        <Kutu baslik="Hesabı olmayan öğretmenler" className="mt-4">
          <p className="text-sm leading-relaxed text-murekkep-soluk">
            Kadroda olup panele girişi olmayanlar:{" "}
            <strong className="text-murekkep">
              {hesapsiz.map((o) => o.ad).join(", ")}
            </strong>
          </p>
        </Kutu>
      )}

      <Kutu baslik="Yeni hesap açma" className="mt-4">
        <p className="text-sm leading-relaxed text-murekkep-soluk">
          Hesaplar terminalden açılıyor:
        </p>
        <pre className="mt-2 overflow-x-auto rounded-kart bg-krem px-4 py-3 font-mono text-xs text-murekkep">
          {`npm run kampus:kullanici -- <eposta> "<ad soyad>" <rol> [öğretmen-adı]

# yönetici
npm run kampus:kullanici -- ayse@bambola.com.tr "Ayşe Yılmaz" admin

# öğretmen (dördüncü alan ekip verisindeki adla birebir aynı olmalı)
npm run kampus:kullanici -- emine@bambola.com.tr "Emine Yıldız Keleş" ogretmen Emine`}
        </pre>
        <p className="mt-3 text-xs leading-relaxed text-murekkep-soluk">
          Şifre belirlenmiyor; betik tek kullanımlık bir bağlantı üretiyor,
          kişi kendi şifresini kendisi koyuyor. Hesap açma panele
          taşınmadı çünkü Supabase yönetici anahtarını gerektiriyor ve o
          anahtar tarayıcıya gitmemeli.
        </p>
      </Kutu>
    </Kabuk>
  );
}
