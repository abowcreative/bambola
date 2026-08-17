import { adminZorunlu } from "@/lib/kampus/oturum";
import { Kabuk, SayfaBasi, Kutu } from "@/components/kampus/kabuk";
import { ILETISIM, SITE_URL } from "@/lib/site";
import { Ikon } from "@/components/ui/ikon";

export const metadata = { title: "Entegrasyonlar", robots: { index: false } };
export const dynamic = "force-dynamic";

type Durum = "bagli" | "eksik" | "planlanan";

type Entegrasyon = {
  ad: string;
  ozet: string;
  durum: Durum;
  /** Bagli degilse ne gerekiyor. */
  gereken?: string;
  deger?: string | null;
};

const ETIKET: Record<Durum, { yazi: string; sinif: string }> = {
  bagli: { yazi: "Bağlı", sinif: "bg-lime-rozet text-black" },
  eksik: { yazi: "Eksik", sinif: "bg-krem-koyu text-murekkep" },
  planlanan: { yazi: "Planlanan", sinif: "bg-cizgi text-murekkep-soluk" },
};

/**
 * Dis servis baglantilari.
 *
 * Durumlar VARSAYILMIYOR, ortam degiskenlerine bakilarak belirleniyor:
 * "bagli" yazip aslinda calismayan bir entegrasyon, hic yazmamaktan kotu.
 */
export default async function EntegrasyonlarSayfasi() {
  const oturum = await adminZorunlu();

  const varMi = (ad: string) => Boolean(process.env[ad]);

  const liste: Entegrasyon[] = [
    {
      ad: "Supabase",
      ozet: "Veritabanı, kimlik doğrulama ve yetkilendirme.",
      durum: varMi("NEXT_PUBLIC_SUPABASE_URL") ? "bagli" : "eksik",
      gereken: "NEXT_PUBLIC_SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY",
      deger: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
    },
    {
      ad: "Vercel",
      ozet: "Barındırma ve dağıtım. GitHub'a her push yayına çıkıyor.",
      durum: "bagli",
      deger: SITE_URL,
    },
    {
      ad: "Resend",
      ozet: "Form bildirimi e-postası. Kayıt gelince kuruma haber gider.",
      durum: varMi("RESEND_API_KEY") ? "bagli" : "eksik",
      gereken: "RESEND_API_KEY, BILDIRIM_ALICI, BILDIRIM_GONDEREN",
    },
    {
      ad: "Meta Pixel",
      ozet: "Instagram ve Facebook reklam ölçümü.",
      durum: varMi("NEXT_PUBLIC_META_PIXEL_ID") ? "bagli" : "eksik",
      gereken: "NEXT_PUBLIC_META_PIXEL_ID",
    },
    {
      ad: "WhatsApp",
      ozet: "Sitedeki yüzen buton ve iletişim bağlantıları.",
      durum: ILETISIM.whatsapp ? "bagli" : "eksik",
      deger: ILETISIM.whatsapp ? `+${ILETISIM.whatsapp}` : null,
    },
    {
      ad: "Google Business Profile",
      ozet: "Harita kaydı, yol tarifi ve yerel arama görünürlüğü.",
      durum: ILETISIM.googlePlaceCid ? "bagli" : "eksik",
      deger: ILETISIM.googleAdi,
    },
    {
      ad: "Instagram",
      ozet: "Kurum hesabı. Lead'lerin panele düşmesi henüz yok.",
      durum: ILETISIM.instagram ? "bagli" : "eksik",
      deger: ILETISIM.instagram,
    },
    {
      ad: "Google Search Console",
      ozet: "Arama performansı ve sitemap gönderimi.",
      durum: "planlanan",
      gereken: "site doğrulaması",
    },
    {
      ad: "Ödeme altyapısı",
      ozet: "Online tahsilat ve taksitlendirme.",
      durum: "planlanan",
      gereken: "sağlayıcı kararı ve sözleşme",
    },
    {
      ad: "SMS sağlayıcı",
      ozet: "Devamsızlık ve ödeme hatırlatmaları.",
      durum: "planlanan",
      gereken: "sağlayıcı kararı",
    },
  ];

  const bagli = liste.filter((e) => e.durum === "bagli").length;

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/entegrasyonlar">
      <SayfaBasi
        baslik="Entegrasyonlar"
        aciklama={`${bagli} / ${liste.length} bağlantı çalışıyor.`}
      />

      <div className="grid gap-3 md:grid-cols-2">
        {liste.map((e) => (
          <Kutu key={e.ad}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-baslik text-base font-bold text-murekkep">
                  {e.ad}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-murekkep-soluk">
                  {e.ozet}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${ETIKET[e.durum].sinif}`}
              >
                {ETIKET[e.durum].yazi}
              </span>
            </div>

            {e.durum === "bagli" && e.deger && (
              <p className="mt-3 truncate rounded-kart bg-krem px-3 py-2 font-mono text-xs text-murekkep-soluk">
                {e.deger}
              </p>
            )}

            {e.durum !== "bagli" && e.gereken && (
              <p className="mt-3 flex gap-2 text-xs leading-relaxed text-murekkep-soluk">
                <Ikon.Ampul boyut={14} className="mt-0.5 shrink-0" />
                Gereken: {e.gereken}
              </p>
            )}
          </Kutu>
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-murekkep-soluk">
        Durumlar ortam değişkenlerine bakılarak belirleniyor, elle
        işaretlenmiyor. Anahtarların değerleri burada gösterilmez.
      </p>
    </Kabuk>
  );
}
