import { adminZorunlu } from "@/lib/kampus/oturum";
import { Kabuk, SayfaBasi, Kutu } from "@/components/kampus/kabuk";
import { Sayac } from "@/components/kampus/ui";
import { Foto } from "@/components/site/foto";
import { FOTOGRAFLAR } from "@/lib/data/fotograflar";

export const metadata = { title: "Mekân", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * Mekan kareleri.
 *
 * Klasor `npm run foto` ile uretiliyor ve elle duzenlenmiyor (PLAN.md
 * Bolum 17); panel yalniz gosteriyor, yukleme yapmiyor. Yukleme eklenseydi
 * bir sonraki uretimde silinirdi.
 */
export default async function MekanSayfasi() {
  const oturum = await adminZorunlu();

  const genisOlan = FOTOGRAFLAR.filter((f) => f.genisVar).length;

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/mekan">
      <SayfaBasi
        baslik="Mekân"
        aciklama="Sitede kullanılan mekân kareleri ve alt metinleri."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Sayac etiket="Kare" deger={FOTOGRAFLAR.length} />
        <Sayac etiket="Geniş kırpımı olan" deger={genisOlan} />
        <Sayac etiket="Alt metni olan" deger={FOTOGRAFLAR.length} alt="hepsi" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {FOTOGRAFLAR.map((f) => (
          <Kutu key={f.slug} dolgusuz>
            <Foto
              foto={f}
              oran="yatay"
              boyutlar="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
            />
            <div className="px-3.5 py-2.5">
              <p className="text-sm leading-snug text-murekkep">{f.alt}</p>
              <p className="mt-1 font-mono text-[0.68rem] text-panel-silik">
                {f.slug}
              </p>
            </div>
          </Kutu>
        ))}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-panel-silik">
        Kareler depo dışındaki kaynak paketten `npm run foto` ile üretiliyor.
        Panelden yükleme yapılmıyor: yüklenen dosya bir sonraki üretimde
        silinirdi.
      </p>
    </Kabuk>
  );
}
