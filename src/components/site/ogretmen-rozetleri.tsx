import Link from "next/link";
import Image from "next/image";
import type { Ogretmen } from "@/lib/data/ekip";
import { ogretmenAdi, ogretmenSlug } from "@/lib/data/ekip";

/**
 * Bir programi veren ogretmenlerin kucuk portreleri. Her portre /ekip
 * sayfasindaki kendi bolumune goturuyor.
 *
 * NEDEN VAR: kartta "kim veriyor" sorusunun cevabi yoktu. Kurumun iddiasini
 * kimin tasidigi E-E-A-T'nin merkezi (PLAN.md Bolum 21) ve veli icin de
 * programin kendisi kadar onemli.
 *
 * DIKKAT: bu satirin durdugu kartin TAMAMI bir baglanti. Rozetler onun
 * ustunde durmali (`relative z-10`), yoksa tiklama kartin baglantisina gider
 * ve ogretmen sayfasi hic acilmaz.
 */
export function OgretmenRozetleri({
  ogretmenler,
  className = "",
}: {
  ogretmenler: Ogretmen[];
  className?: string;
}) {
  if (!ogretmenler.length) return null;

  return (
    <div className={`relative z-10 flex items-center gap-2.5 ${className}`}>
      {/* Portreler hafifce ust uste biniyor: dar kartta yer kazandiriyor. */}
      <div className="flex -space-x-2">
        {ogretmenler.map((o) => (
          <Link
            key={o.ad}
            href={`/ekip#${ogretmenSlug(o)}`}
            title={[ogretmenAdi(o), o.gorev, o.unvan]
              .filter(Boolean)
              .join(" - ")}
            className="relative rounded-full transition-transform duration-200 ease-yayli hover:z-10 hover:-translate-y-0.5 hover:scale-110"
          >
            {o.fotograf ? (
              <Image
                src={`/ekip/${o.fotograf}.jpg`}
                alt={ogretmenAdi(o)}
                width={72}
                height={72}
                sizes="36px"
                className="size-9 rounded-full border-2 border-white bg-krem-koyu object-cover shadow-sm"
              />
            ) : (
              <span className="grid size-9 place-items-center rounded-full border-2 border-white bg-lime-rozet text-xs font-bold text-black">
                {o.ad.slice(0, 1)}
              </span>
            )}
          </Link>
        ))}
      </div>

      <span className="min-w-0 text-xs leading-snug text-murekkep-soluk">
        {ogretmenler.map((o) => o.ad).join(", ")}
      </span>
    </div>
  );
}
