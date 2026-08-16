import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
    next/image icin ozel ayar YOK, bilerek.

    Logomuz SVG ve Next, guvenlik gerekcesiyle SVG'yi goruntu iyilestiricisinden
    gecirmeyi reddediyor (400 doner). dangerouslyAllowSVG acilabilirdi ama
    gerek yok: SVG zaten vektor, yeniden boyutlandirmaktan veya WebP'ye
    cevirmekten hicbir kazanc yok. O yuzden logo bilesenlerinde `unoptimized`
    kullaniliyor, iyilestirici devreye hic girmiyor.

    Fotograflar geldiginde (JPEG/PNG) iyilestirici normal calisacak.
  */
};

export default nextConfig;
