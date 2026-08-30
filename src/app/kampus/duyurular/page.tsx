import { oturumZorunlu } from "@/lib/kampus/oturum";
import { duyurulariGetir } from "@/lib/kampus/yoklama";
import { HEDEF_ETIKET } from "@/lib/kampus/yoklama-tipleri";
import { Kabuk, SayfaBasi, Kutu } from "@/components/kampus/kabuk";
import { BosDurum, Rozet } from "@/components/kampus/ui";
import { DuyuruFormu, DuyuruDuzenle } from "@/components/kampus/duyuru-formu";
import { YayinAnahtari } from "@/components/kampus/yayin-anahtari";
import { tarihYaz } from "@/components/kampus/basvuru-satiri";
import { Ikon } from "@/components/ui/ikon";

export const metadata = { title: "Duyurular", robots: { index: false } };
export const dynamic = "force-dynamic";

type Duyuru = {
  id: string;
  baslik: string;
  metin: string;
  hedef: string;
  yayinda: boolean;
  olusturan: string | null;
  created_at: string;
};

/** Tek duyuru karti. Yayin ve taslak listesinde ayni yapi kullaniliyor. */
function DuyuruKarti({
  duyuru,
  yonetici,
  taslak,
}: {
  duyuru: Duyuru;
  yonetici: boolean;
  taslak: boolean;
}) {
  return (
    <li
      className={`rounded-panel border px-4 py-3 ${
        taslak
          ? "border-dashed border-panel-cizgi-guclu bg-panel-yuzey-alt"
          : "border-panel-cizgi bg-panel-yuzey"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-baslik text-sm font-bold text-murekkep">
          {duyuru.baslik}
        </h3>
        <Rozet ton={taslak ? "sessiz" : "bilgi"}>
          {HEDEF_ETIKET[duyuru.hedef]}
        </Rozet>
      </div>
      <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-panel-soluk">
        {duyuru.metin}
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-panel-silik">
          {duyuru.olusturan ?? "—"} · {tarihYaz(duyuru.created_at)}
        </span>
        {yonetici && (
          <span className="flex items-center gap-1.5">
            <DuyuruDuzenle duyuru={duyuru} />
            <YayinAnahtari id={duyuru.id} yayinda={duyuru.yayinda} />
          </span>
        )}
      </div>
    </li>
  );
}

/**
 * Duyurular.
 *
 * Yeni duyuru TASLAK olarak aciliyor; yayina almak ayri bir adim. Yazilmakta
 * olan bir metnin veliye dusmesi geri alinamaz.
 *
 * E-posta veya SMS GONDERMIYOR: panelde gorunuyor. Gonderim icin Resend
 * kurulumu ve veli iletisim izinleri gerekiyor (PLAN.md Bolum 27).
 */
export default async function DuyurularSayfasi() {
  const oturum = await oturumZorunlu();
  const liste = (await duyurulariGetir()) as Duyuru[];
  const yonetici = oturum.rol === "admin";

  const yayinda = liste.filter((d) => d.yayinda);
  const taslak = liste.filter((d) => !d.yayinda);

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/duyurular">
      <SayfaBasi
        baslik="Duyurular"
        aciklama={
          yonetici
            ? "Öğretmenlere ve velilere görünen bildirimler."
            : "Kurumdan gelen bildirimler."
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0 space-y-4">
          {liste.length === 0 ? (
            <BosDurum
              baslik="Duyuru yok"
              ikon={<Ikon.Muzik boyut={22} />}
              aciklama={
                yonetici
                  ? "Sağdaki formdan bir duyuru yazabilirsiniz."
                  : "Şu an görüntülenecek bir duyuru bulunmuyor."
              }
            />
          ) : (
            <>
              {yayinda.length > 0 && (
                <Kutu
                  baslik="Yayında"
                  yanCocuk={
                    <span className="text-xs text-panel-silik">
                      {yayinda.length}
                    </span>
                  }
                >
                  <ul className="space-y-2.5">
                    {yayinda.map((d) => (
                      <DuyuruKarti
                        key={d.id}
                        duyuru={d}
                        yonetici={yonetici}
                        taslak={false}
                      />
                    ))}
                  </ul>
                </Kutu>
              )}

              {yonetici && taslak.length > 0 && (
                <Kutu
                  baslik="Taslaklar"
                  aciklama="Taslaklar yalnız yöneticilere görünür."
                >
                  <ul className="space-y-2.5">
                    {taslak.map((d) => (
                      <DuyuruKarti
                        key={d.id}
                        duyuru={d}
                        yonetici
                        taslak
                      />
                    ))}
                  </ul>
                </Kutu>
              )}
            </>
          )}
        </div>

        {yonetici && (
          <div className="space-y-4">
            <Kutu baslik="Yeni duyuru">
              <DuyuruFormu />
            </Kutu>
            <p className="text-xs leading-relaxed text-panel-silik">
              Duyurular <strong>panelde</strong> görünür; e-posta veya SMS
              göndermez. Gönderim için Resend kurulumu ve velilerin ticari
              ileti izinleri gerekiyor.
            </p>
          </div>
        )}
      </div>
    </Kabuk>
  );
}
