import { adminZorunlu } from "@/lib/kampus/oturum";
import { Kabuk, SayfaBasi, Kutu, Sayac } from "@/components/kampus/kabuk";
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

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FOTOGRAFLAR.map((f) => (
          <Kutu key={f.slug} className="p-3">
            <Foto
              foto={f}
              oran="yatay"
              boyutlar="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
            />
            <p className="mt-2.5 text-sm leading-snug text-murekkep">
              {f.alt}
            </p>
            <p className="mt-1 font-mono text-[0.68rem] text-murekkep-soluk">
              {f.slug}
            </p>
          </Kutu>
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-murekkep-soluk">
        Kareler depo dışındaki kaynak paketten `npm run foto` ile üretiliyor.
        Panelden yükleme yapılmıyor: yüklenen dosya bir sonraki üretimde
        silinirdi.
      </p>
    </Kabuk>
  );
}
