import { fotolar } from "@/lib/data/fotograflar";
import { Belir, Sirali, SiraliOge } from "./bolum";
import { BolumBasligi } from "./bolum-basligi";
import { Foto } from "./foto";
import { ButonLink } from "@/components/ui/buton";
import { Ikon } from "@/components/ui/ikon";

/**
 * Uc kare + /mekan baglantisi. Program ve oyun evi sayfalarinda kullanilir.
 *
 * DIKKAT: kareler bilerek "su program su odada isleniyor" demiyor. Hangi
 * grubun hangi odada oldugu kurumdan teyit edilmedi; fotografa boyle bir
 * iddia yuklemek PLAN.md Bolum 3'e aykiri olurdu. Serit mekani tanitir,
 * ayrintiyi /mekan sayfasina birakir.
 */

const VARSAYILAN = [
  "bambola-top-havuzu-01",
  "bambola-atolye-sinifi-01",
  "bambola-teras-01",
];

export function MekanSeridi({
  sluglar = VARSAYILAN,
  baslik = "Çocuğunuz nerede vakit geçirecek?",
  aciklama = "Oyun alanları, atölye sınıfları, kapalı bahçe ve teras. Gelmeden önce bakın.",
  ustBaslik = "Mekân",
}: {
  sluglar?: string[];
  baslik?: string;
  aciklama?: string;
  ustBaslik?: string;
}) {
  const kareler = fotolar(...sluglar);

  return (
    // Krem-koyu, paletin ucuncu tonu. Beyaz ve krem bolumlerin arasina
    // girdiginde serit kendi bandi gibi okunuyor, komsu bolumle birlesmiyor.
    <section className="border-y border-cizgi bg-krem-koyu">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <BolumBasligi
          ustBaslik={ustBaslik}
          baslik={baslik}
          aciklama={aciklama}
        />

        <Sirali className="mt-10 grid gap-4 sm:grid-cols-3">
          {kareler.map((f) => (
            <SiraliOge key={f.slug}>
              <Foto
                foto={f}
                oran="yatay"
                boyutlar="(min-width: 1024px) 352px, (min-width: 640px) 33vw, 100vw"
              />
            </SiraliOge>
          ))}
        </Sirali>

        <Belir className="mt-8">
          <ButonLink href="/mekan" gorunum="cizgili">
            Bütün mekânı gör
            <Ikon.Ok boyut={17} />
          </ButonLink>
        </Belir>
      </div>
    </section>
  );
}
