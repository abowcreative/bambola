import type { ReactNode } from "react";

/**
 * Kampus kok duzeni.
 *
 * Sitenin header/footer'i BURADA YOK: kok layout onlari basiyor ama kampus
 * ayri bir uygulama gibi davranmali. Site kabugunu kaldirmak icin kampus
 * sayfalari kendi tam ekran duzenini kuruyor.
 *
 * `data-alan="kampus"`: globals.css icindeki panel kapsamini aciyor. Panel
 * daha yogun bir arayuz -- ince cerceve, az yuvarlaklik, 15px govde, dar
 * odak halkasi. Site tarafi bu degiskenleri hic gormuyor.
 *
 * Giris kontrolu burada DEGIL, her bolumun kendi duzeninde: /kampus/giris
 * oturumsuz erisilebilir olmali, panel sayfalari olmamali. Tek yerde
 * yapilsaydi giris ekrani da kendini korumaya calisir, sonsuz yonlendirme
 * olusurdu.
 */
export default function KampusLayout({ children }: { children: ReactNode }) {
  return (
    <div data-alan="kampus" className="min-h-dvh bg-panel-zemin">
      {children}
    </div>
  );
}
