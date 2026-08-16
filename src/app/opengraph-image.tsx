import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { MARKA, MEB_IFADESI } from "@/lib/site";

/**
 * Ortak OG karti. Instagram ve WhatsApp paylasimlarinda gorunecek.
 * PLAN.md Bolum 5: her sayfaya OG gorseli veya ortak sablon.
 *
 * 16 Agustos 2026'da yeniden yazildi. Onceki hali cizimdi: krem zemin ve
 * marka renginde daireler. Mekan fotograflari geldikten sonra bunun tutulur
 * yani kalmadi -- icerik takvimi erken kayit duyurusuyla basliyor (Bolum 16)
 * ve o duyuru WhatsApp ile Instagram'dan gidiyor. Link paylasildiginda
 * velinin gormesi gereken sey mekanin kendisi.
 *
 * Fotograf dosyadan okunup data URI olarak gomuluyor: ImageResponse derleme
 * aninda calisiyor ve o sirada kendi sitemize HTTP istegi atacak bir sunucu
 * yok, `/foto/...` gibi bir yol cozulmez.
 *
 * Yazi tipi olarak sistem fontu kullaniliyor; Baloo 2'yi gomsek her uretimde
 * woff okumak gerekirdi, kart metni zaten kisa.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${MARKA.ad}, ${MARKA.ilce} oyun evi ve anaokulu`;

/*
  `npm run foto` tarafindan ozellikle bu kart icin uretilen 1200x630 PNG.
  Sitedeki 4:3 ve 3:4 kareler bu orana uymuyor, kirpimi boru hattina birakmak
  hem kadraji kontrol altinda tutuyor hem de kartin her uretimde ayni cikmasini
  sagliyor.

  NOT: Bu rota `next dev` altinda 500 veriyor ("Input buffer contains
  unsupported image format"), ama `next build` sirasinda sorunsuz uretiliyor
  ve kart statik olarak yayina cikiyor. Gelistirmede karti gormek icin
  `npm run build` sonrasi .next/server/app/opengraph-image.body dosyasina
  bakilir.
*/
const KAPAK = "og-kapak.png";

async function kapakVerisi() {
  const ham = await readFile(path.join(process.cwd(), "public", "foto", KAPAK));
  return `data:image/png;base64,${ham.toString("base64")}`;
}

export default async function OgGorseli() {
  const kapak = await kapakVerisi();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#fdfcf7",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={kapak}
          alt=""
          width={size.width}
          height={size.height}
          style={{
            position: "absolute",
            inset: 0,
            width: size.width,
            height: size.height,
            objectFit: "cover",
          }}
        />

        {/*
          Koyu gecis metnin okunurlugu icin sart: fotograf parlak ve rengarenk,
          uzerine dogrudan yazi konsa hicbir renk her karede okunmaz.
        */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: size.width,
            height: size.height,
            background:
              "linear-gradient(90deg, rgba(12,10,8,0.94) 0%, rgba(12,10,8,0.90) 38%, rgba(12,10,8,0.55) 62%, rgba(12,10,8,0.12) 100%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 80px",
            width: 820,
            // z-index yok: Satori desteklemiyor ve uyari basiyor. Bu blok
            // zaten DOM sirasinda gecisten sonra geldigi icin ustte kaliyor.
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              backgroundColor: "#bdf270",
              color: "#1c1a17",
              fontSize: 24,
              fontWeight: 700,
              padding: "10px 26px",
              borderRadius: 9999,
            }}
          >
            {MEB_IFADESI}
          </div>

          <div
            style={{
              fontSize: 104,
              fontWeight: 800,
              color: "#ffffff",
              marginTop: 26,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            {MARKA.ad}
          </div>

          <div
            style={{
              fontSize: 38,
              color: "#bdf270",
              marginTop: 12,
              fontWeight: 600,
            }}
          >
            Oyun evi, atölyeler ve anaokulu
          </div>

          {/*
            Tek metin dugumu olarak veriliyor. Satori, birden fazla cocugu
            olan bir div'de acik `display` istiyor; `{a}, {b}` yazimi uc ayri
            dugum uretiyor ve uretim 500 ile dusuyor.
          */}
          <div
            style={{
              fontSize: 30,
              color: "#f0ece1",
              marginTop: 10,
            }}
          >
            {`${MARKA.ilce}, ${MARKA.sehir}`}
          </div>

          <div
            style={{
              display: "flex",
              gap: 14,
              marginTop: 40,
              fontSize: 24,
              color: "#ffffff",
            }}
          >
            <span
              style={{
                border: "2px solid rgba(255,255,255,0.45)",
                borderRadius: 9999,
                padding: "9px 22px",
              }}
            >
              6 ay - 6 yaş
            </span>
            <span
              style={{
                border: "2px solid rgba(255,255,255,0.45)",
                borderRadius: 9999,
                padding: "9px 22px",
              }}
            >
              Küçük gruplar: 8 ve 12
            </span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
