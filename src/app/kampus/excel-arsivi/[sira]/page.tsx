import { notFound } from "next/navigation";
import { adminZorunlu } from "@/lib/kampus/oturum";
import { excelSayfasiGetir, type ArsivHucresi } from "@/lib/kampus/defter";
import { Kabuk, Kutu, GeriBaglantisi } from "@/components/kampus/kabuk";
import { Rozet } from "@/components/kampus/ui";

export const metadata = { title: "Excel sayfası", robots: { index: false } };
export const dynamic = "force-dynamic";

const sutunAdi = (n: number) => {
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};

/** Hucre metni: tarihse gg.aa.yyyy, sayiysa TR bicimi, degilse oldugu gibi. */
function hucreMetni(h: ArsivHucresi | undefined): string {
  if (!h) return "";
  if (h.t) {
    const [gun, saat] = h.t.split(" ");
    const [y, a, g] = gun.split("-");
    return `${g}.${a}.${y}${saat ? ` ${saat}` : ""}`;
  }
  if (typeof h.v === "number") return h.v.toLocaleString("tr-TR", { maximumFractionDigits: 4 });
  if (typeof h.v === "boolean") return h.v ? "DOĞRU" : "YANLIŞ";
  return h.v;
}

/**
 * Tek bir Excel sayfasinin ham gorunumu: satir numaralari, sutun harfleri,
 * hucre degerleri. Formullu hucre altinda formulu, yorumlu hucre altinda
 * yorumu gosteriyor.
 */
export default async function ExcelSayfaSayfasi({
  params,
}: {
  params: Promise<{ sira: string }>;
}) {
  const oturum = await adminZorunlu();
  const { sira } = await params;
  const no = Number(sira);
  if (!Number.isInteger(no) || no < 1) notFound();

  const sayfa = await excelSayfasiGetir(no);
  if (!sayfa) notFound();

  const sutunlar = Array.from({ length: sayfa.sutun_sayisi }, (_, i) => sutunAdi(i + 1));
  const formulSayisi = sayfa.satirlar.reduce(
    (t, r) => t + Object.values(r.h).filter((h) => h.f).length,
    0,
  );

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/excel-arsivi">
      <GeriBaglantisi yol="/kampus/excel-arsivi" etiket="Excel arşivi" />

      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <h1 className="font-baslik text-xl font-bold text-murekkep sm:text-2xl">
          {sayfa.sayfa_adi}
        </h1>
        <Rozet ton="sessiz">{sayfa.dosya}</Rozet>
        {sayfa.gizli && <Rozet ton="sessiz">Excel&apos;de gizli</Rozet>}
      </div>
      <p className="mt-1 text-sm text-panel-soluk">
        {sayfa.satirlar.length} satır · {sayfa.sutun_sayisi} sütun · {sayfa.hucre_sayisi} dolu hücre
        {formulSayisi > 0 && ` · ${formulSayisi} formül`} · aralık {sayfa.boyut ?? "—"}
      </p>

      <Kutu className="mt-4" dolgusuz>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs" style={{ minWidth: `${Math.max(40, sayfa.sutun_sayisi * 9)}rem` }}>
            <thead>
              <tr>
                <th className="sticky left-0 z-10 border-b border-r border-panel-cizgi bg-panel-yuzey-alt px-2 py-1.5 text-left font-baslik text-[0.65rem] font-bold text-panel-soluk">
                  #
                </th>
                {sutunlar.map((s) => (
                  <th key={s} className="border-b border-panel-cizgi bg-panel-yuzey-alt px-2 py-1.5 text-left font-baslik text-[0.65rem] font-bold text-panel-soluk">
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sayfa.satirlar.map((r) => (
                <tr key={r.r} className="hover:bg-panel-yuzey-alt">
                  <td className="sticky left-0 z-10 border-b border-r border-panel-cizgi bg-panel-yuzey px-2 py-1 text-right tabular-nums text-panel-silik">
                    {r.r}
                  </td>
                  {sutunlar.map((s) => {
                    const h = r.h[s];
                    return (
                      <td
                        key={s}
                        className={`border-b border-panel-cizgi px-2 py-1 align-top ${h?.f ? "bg-bilgi-zemin/40" : ""} ${h?.y ? "bg-uyari-zemin/40" : ""}`}
                        title={h?.f ? `=${h.f}` : undefined}
                      >
                        {h && (
                          <>
                            <span className={`whitespace-pre-wrap ${typeof h.v === "number" ? "tabular-nums" : ""}`}>
                              {hucreMetni(h)}
                            </span>
                            {h.f && <span className="block break-all font-mono text-[0.6rem] text-bilgi">={h.f}</span>}
                            {h.y && <span className="block text-[0.65rem] text-uyari">✎ {h.y}</span>}
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Kutu>
    </Kabuk>
  );
}
