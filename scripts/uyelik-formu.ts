/**
 * Uyelik formunu uretir. Calistirma: npx tsx scripts/uyelik-formu.ts
 * Cikti: docs/uyelik-formu.html -> A4 PDF
 *
 * Fiyat listesiyle ayni tasarim dili ve ayni stil dosyasi kullaniliyor,
 * boylece iki belge yan yana konunca ayni kurumdan cikmis gorunuyor.
 */

import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import {
  UYELIK_BASLIK,
  UYELIK_ONAY_METNI,
  UYELIK_KURALLARI,
  UYELIK_ONAYLARI,
  UYELIK_ALANLARI,
} from "../src/lib/data/uyelik";
import { ILETISIM, MARKA, MEB_IFADESI } from "../src/lib/site";

const kacis = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Amblem: resmi yesil amblem, gercek vektor. Fiyat listesiyle ayni dosya.
 *
 * 4 Eylul 2026 musteri karari: mor Kibar amblemi KULLANILMAZ, "oyle bir
 * logomuz yok". Form bir sure BAMBOLA'siz mor anaokulu amblemini tasimisti
 * (11 Agustos 2026); o dosyalar depodan cikarildi. Tek amblem var: yesil.
 */
const AMBLEM_SRC =
  "data:image/svg+xml;base64," +
  readFileSync("src/assets/bambola-logo.svg").toString("base64");

function ikon(yol: string, renk = "#ffffff") {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ` +
    `stroke="${renk}" stroke-width="1.9" stroke-linecap="round" ` +
    `stroke-linejoin="round"><path d="${yol}"/></svg>`;
  return "data:image/svg+xml;base64," + Buffer.from(svg, "utf8").toString("base64");
}
const ROZET_IKON = ikon("M12 2.5 20 5.5v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10v-6zM8.6 11.8l2.4 2.4 4.6-4.6");

/** Doldurulacak alan: etiket ustte kucuk, altinda yazma cizgisi. */
function alan(etiket: string, genislik: number) {
  return `        <div class="alan" style="grid-column: span ${genislik}">
          <span class="alan-etiket">${kacis(etiket)}</span>
          <span class="alan-cizgi"></span>
        </div>`;
}

function alanBolumu(baslik: string, alanlar: readonly { etiket: string; genislik: number }[]) {
  return `    <section class="form-bolum">
      <h2>${kacis(baslik)}</h2>
      <div class="alanlar">
${alanlar.map((a) => alan(a.etiket, a.genislik)).join("\n")}
      </div>
    </section>`;
}

const govde = `
  <header class="ust">
    <div class="amblem"><img src="${AMBLEM_SRC}" alt="${kacis(MARKA.ad)}"></div>
    <div class="ust-sol">
      <p class="kurum">${kacis(MARKA.kurumAdiOyunEvi)}</p>
      <h1>${kacis(UYELIK_BASLIK)}</h1>
      ${
        MEB_IFADESI
          ? `<p class="meb"><span class="meb-ikon"><img src="${ROZET_IKON}" alt=""></span>${kacis(MEB_IFADESI)} oyun merkezi</p>`
          : ""
      }
    </div>
    <div class="form-no">
      <span class="form-no-etiket">Form no</span>
      <span class="form-no-cizgi"></span>
    </div>
  </header>

${alanBolumu("Çocuk ve veli bilgileri", UYELIK_ALANLARI.kisiler)}

${alanBolumu("Kayıt bilgileri", UYELIK_ALANLARI.kayit)}

  <section class="form-bolum onay-metni">
    <h2>Katılım hakkı</h2>
    <p>${kacis(UYELIK_ONAY_METNI)}</p>
  </section>

  <section class="form-bolum kurallar-bolum">
    <h2>Oyun grubu ve işletme kuralları</h2>
    <ol class="kural-liste">
${UYELIK_KURALLARI.map((k) => `      <li>${kacis(k)}</li>`).join("\n")}
    </ol>
  </section>

  <section class="form-bolum onaylar">
    <h2>Onaylar</h2>
    <ul>
${UYELIK_ONAYLARI.map(
  (o) => `      <li>
        <span class="kutu"></span>
        <span class="onay-govde">
          <span class="onay-baslik">${kacis(o.baslik)}${
            o.zorunlu
              ? '<i class="zorunlu">zorunlu</i>'
              : '<i class="istege-bagli">isteğe bağlı</i>'
          }</span>
          <span class="onay-metin">${kacis(o.metin)}</span>
        </span>
      </li>`,
).join("\n")}
    </ul>
  </section>

  <section class="imzalar">
    <div class="imza">
      <span class="imza-cizgi"></span>
      <span class="imza-ad">Veli adı, soyadı ve imzası</span>
    </div>
    <div class="imza">
      <span class="imza-cizgi"></span>
      <span class="imza-ad">Kurum müdürü adı, soyadı ve imzası</span>
    </div>
  </section>

  <footer class="serit">
    <div class="serit-logo"><img src="${AMBLEM_SRC}" alt=""></div>
    <div class="serit-bilgi">
      <p><span class="ikon">IG</span>${kacis((ILETISIM.instagram ?? "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, ""))}</p>
      <p><span class="ikon">T</span>${kacis(ILETISIM.telefon ?? "")}</p>
    </div>
    <div class="serit-adres"><p>${kacis(ILETISIM.adres ?? "")}</p></div>
  </footer>`;

const belge = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<title>${kacis(UYELIK_BASLIK)} · ${MARKA.ad}</title>
<style>
${readFileSync(new URL("./pdf-fontlar.css", import.meta.url), "utf8")}
${readFileSync(new URL("./pdf-stil.css", import.meta.url), "utf8")}
${readFileSync(new URL("./form-stil.css", import.meta.url), "utf8")}
</style>
</head>
<body class="surum-form">
<div class="sayfa">
  <div class="bezek bezek-ust" aria-hidden="true"></div>
  <div class="bezek bezek-alt" aria-hidden="true"></div>
${govde}
</div>
</body>
</html>`;

mkdirSync("docs", { recursive: true });
writeFileSync("docs/uyelik-formu.html", belge, "utf8");
console.log("uretildi: docs/uyelik-formu.html");
