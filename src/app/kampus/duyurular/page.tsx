import { oturumZorunlu } from "@/lib/kampus/oturum";
import { duyurulariGetir } from "@/lib/kampus/yoklama";
import { HEDEF_ETIKET } from "@/lib/kampus/yoklama-tipleri";
import {
  Kabuk,
  SayfaBasi,
  Kutu,
  BosDurum,
} from "@/components/kampus/kabuk";
import { DuyuruFormu } from "@/components/kampus/duyuru-formu";
import { YayinAnahtari } from "@/components/kampus/yayin-anahtari";
import { tarihYaz } from "@/components/kampus/basvuru-satiri";

export const metadata = { title: "Duyurular", robots: { index: false } };
export const dynamic = "force-dynamic";

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
  const liste = await duyurulariGetir();

  const yayinda = liste.filter((d) => d.yayinda);
  const taslak = liste.filter((d) => !d.yayinda);

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/duyurular">
      <SayfaBasi
        baslik="Duyurular"
        aciklama={
          oturum.rol === "admin"
            ? "Öğretmenlere ve velilere görünen bildirimler."
            : "Kurumdan gelen bildirimler."
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          {liste.length === 0 ? (
            <BosDurum
              baslik="Duyuru yok"
              aciklama={
                oturum.rol === "admin"
                  ? "Sağdaki formdan bir duyuru yazabilirsiniz."
                  : "Şu an görüntülenecek bir duyuru bulunmuyor."
              }
            />
          ) : (
            <>
              {yayinda.length > 0 && (
                <Kutu baslik="Yayında">
                  <ul className="space-y-3">
                    {yayinda.map((d) => (
                      <li
                        key={d.id}
                        className="rounded-kart border-2 border-cizgi px-4 py-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h3 className="font-baslik text-sm font-bold text-murekkep">
                            {d.baslik}
                          </h3>
                          <span className="shrink-0 rounded-full bg-krem-koyu px-2.5 py-0.5 text-xs font-semibold text-murekkep">
                            {HEDEF_ETIKET[d.hedef]}
                          </span>
                        </div>
                        <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-murekkep-soluk">
                          {d.metin}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs text-murekkep-soluk">
                            {d.olusturan ?? "—"} · {tarihYaz(d.created_at)}
                          </span>
                          {oturum.rol === "admin" && (
                            <YayinAnahtari id={d.id} yayinda={d.yayinda} />
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </Kutu>
              )}

              {oturum.rol === "admin" && taslak.length > 0 && (
                <Kutu baslik="Taslaklar">
                  <p className="-mt-2 mb-3 text-xs text-murekkep-soluk">
                    Taslaklar yalnız yöneticilere görünür.
                  </p>
                  <ul className="space-y-3">
                    {taslak.map((d) => (
                      <li
                        key={d.id}
                        className="rounded-kart border-2 border-dashed border-cizgi px-4 py-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h3 className="font-baslik text-sm font-bold text-murekkep">
                            {d.baslik}
                          </h3>
                          <span className="shrink-0 rounded-full bg-krem-koyu px-2.5 py-0.5 text-xs font-semibold text-murekkep">
                            {HEDEF_ETIKET[d.hedef]}
                          </span>
                        </div>
                        <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-murekkep-soluk">
                          {d.metin}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs text-murekkep-soluk">
                            {tarihYaz(d.created_at)}
                          </span>
                          <YayinAnahtari id={d.id} yayinda={d.yayinda} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </Kutu>
              )}
            </>
          )}
        </div>

        {oturum.rol === "admin" && (
          <div className="space-y-5">
            <Kutu baslik="Yeni duyuru">
              <DuyuruFormu />
            </Kutu>
            <Kutu>
              <p className="text-xs leading-relaxed text-murekkep-soluk">
                Duyurular <strong>panelde</strong> görünür; e-posta veya SMS
                göndermez. Gönderim için Resend kurulumu ve velilerin ticari
                ileti izinleri gerekiyor.
              </p>
            </Kutu>
          </div>
        )}
      </div>
    </Kabuk>
  );
}
