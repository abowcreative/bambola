import type { ReactNode } from "react";

/**
 * Kampus kok duzeni.
 *
 * Sitenin header/footer'i BURADA YOK: kok layout onlari basiyor ama kampus
 * ayri bir uygulama gibi davranmali. Site kabugunu kaldirmak icin kampus
 * sayfalari kendi tam ekran duzenini kuruyor.
 *
 * Giris kontrolu burada DEGIL, her bolumun kendi duzeninde: /kampus/giris
 * oturumsuz erisilebilir olmali, panel sayfalari olmamali. Tek yerde
 * yapilsaydi giris ekrani da kendini korumaya calisir, sonsuz yonlendirme
 * olusurdu.
 */
export default function KampusLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-krem">{children}</div>;
}
