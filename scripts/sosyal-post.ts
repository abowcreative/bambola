/**
 * Sosyal medya postlarini uretir. Calistirma: npm run sosyal
 * Cikti: docs/sosyal/*.html  ->  1080x1350 PNG
 *
 * Kurumun mevcut afisleriyle (bambola-p1..p7) ayni tasarim dili.
 * FIYAT YAZILMAZ. Bu postlarin isi programi ve kurumu anlatmak.
 *
 * Yeni post eklemek icin POSTLAR dizisine bir kalem eklemek yeterli;
 * revizyon geldiginde tek satir degisiyor, sifirdan tasarim yapilmiyor.
 */

import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { gunSlotlari } from "../src/lib/data/program";
import { atolyeBul } from "../src/lib/data/atolyeler";
import { KAMPANYA_PENCERESI } from "../src/lib/data/ucretler";
import { ILETISIM, MARKA, MEB_IFADESI } from "../src/lib/site";

const kacis = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const AMBLEM =
  "data:image/svg+xml;base64," +
  readFileSync("src/assets/bambola-kids-zone.svg").toString("base64");

const IKON: Record<string, string> = {
  rozet: "M12 2.5 20 5.5v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10v-6zM8.6 11.8l2.4 2.4 4.6-4.6",
  grup: "M9 11.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM3.5 19a5.5 5.5 0 0 1 11 0M16 6.2a3 3 0 0 1 0 5.6M17.5 19a5.4 5.4 0 0 0-2.2-4.3",
  kalp: "M12 20s-7.5-4.4-7.5-9.4A4.1 4.1 0 0 1 12 8.2a4.1 4.1 0 0 1 7.5 2.4C19.5 15.6 12 20 12 20Z",
  saat: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2",
  takvim: "M3 9h18M8 3v4M16 3v4M6.5 5h11A3.5 3.5 0 0 1 21 8.5v9A3.5 3.5 0 0 1 17.5 21h-11A3.5 3.5 0 0 1 3 17.5v-9A3.5 3.5 0 0 1 6.5 5Z",
  elma: "M12 8.5c-1.6-2-5-2.2-6.4.6-1.6 3.2.6 8.4 3.4 10.4 1.3.9 2.2.3 3-.2.8.5 1.7 1.1 3 .2 2.8-2 5-7.2 3.4-10.4-1.4-2.8-4.8-2.6-6.4-.6ZM12 8.5V5.5M12 5.5c1.6 0 2.6-1 2.8-2.2-1.4-.2-2.6.6-2.8 2.2Z",
  rapor: "M7 3.5h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1ZM14 3.5v4h4M9 13h6M9 17h4",
  yildiz: "m12 3.8 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.6 9.9l5.8-.8L12 3.8Z",
  ev: "M4 11 12 4l8 7v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-8ZM9.5 20.5v-6h5v6",
  telefon: "M6.2 3.8h3l1.4 3.6-2 1.3a11 11 0 0 0 4.7 4.7l1.3-2 3.6 1.4v3a1.8 1.8 0 0 1-2 1.8C10.3 17.1 6.9 13.7 4.4 5.8a1.8 1.8 0 0 1 1.8-2Z",
  instagram: "M3.5 3.5h17v17h-17zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM16.9 7.1h.01",
  konum: "M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11ZM12 12.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z",
};

function ikonVeri(ad: string, renk: string) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ` +
    `stroke="${renk}" stroke-width="1.8" stroke-linecap="round" ` +
    `stroke-linejoin="round"><path d="${IKON[ad] ?? IKON.yildiz}"/></svg>`;
  return "data:image/svg+xml;base64," + Buffer.from(svg, "utf8").toString("base64");
}

const SERIT = `  <div class="serit">
    <div class="serit-sol">
      <p><span class="serit-ikon"><img src="${ikonVeri("instagram", "#ffffff")}" alt=""></span>${kacis((ILETISIM.instagram ?? "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, ""))}</p>
      <p><span class="serit-ikon"><img src="${ikonVeri("telefon", "#ffffff")}" alt=""></span>${kacis(ILETISIM.telefon ?? "")}</p>
    </div>
    <div class="serit-sag">Osmantemiz Mah. 1022. Cad.<br>No: 2/A, Dikmen, Ankara</div>
  </div>
  <div class="serit-logo"><img src="${AMBLEM}" alt=""></div>`;

const BICIMLER = `  <div class="bicim bicim-ust"></div>
  <div class="bicim bicim-ust2"></div>
  <div class="bicim bicim-alt"></div>
  <div class="bicim bicim-nokta" style="top:7cqw; right:38cqw; width:5cqw; height:5cqw;"></div>
  <div class="bicim bicim-nokta" style="bottom:26cqw; left:4cqw; width:3.6cqw; height:3.6cqw;"></div>`;

type Kart = { ikon?: string; rakam?: string; ust: string; alt?: string; rozet?: string; dolu?: boolean };

type Post = {
  dosya: string;
  etiket: string;
  baslikKoyu: string;
  baslikAcik: string;
  baslikBoyu?: "buyuk" | "orta";
  spot?: string;
  rozet?: { ust: string; buyuk: string; alt: string };
  kartlar?: Kart[];
  izgara?: boolean;
  akis?: { no: string; ust: string; alt: string }[];
};

// ------------------------------------------------------------------ icerik

const cmt = gunSlotlari("cumartesi").filter(
  (s) => s.atolyeSlug !== "serbest-oyun",
);

const POSTLAR: Post[] = [
  {
    // Kurumun en guclu ayirt edici ozelligi. Musteri: "dikkat cekici olmali".
    dosya: "meb",
    etiket: "Neden Bambola",
    baslikKoyu: "Millî Eğitim",
    baslikAcik: "Bakanlığı'na bağlı",
    baslikBoyu: "orta",
    spot: "Çoğu oyun alanı işletme ruhsatıyla açılır. Bizim bağlı olduğumuz kurum farklı.",
    kartlar: [
      {
        ikon: "rozet",
        ust: "Bakanlık denetiminde",
        alt: "Fiziki şartlar ve personel niteliği bakanlık standardında",
        dolu: true,
      },
      {
        ikon: "grup",
        ust: "Uzman öğretmen kadrosu",
        alt: "Her grubu alanında eğitimli öğretmenler yürütüyor",
      },
      {
        ikon: "rapor",
        ust: "Gelişim takibi",
        alt: "Her 12 katılımda değerlendirme raporu",
      },
    ],
  },
  {
    dosya: "kucuk-gruplar",
    etiket: "Grup mevcudu",
    baslikKoyu: "En fazla",
    baslikAcik: "8 çocuk",
    spot: "Kalabalık grupta çocuk sıranın sonunda kalır. Biz grupları küçük tutuyoruz, öğretmen her çocuğu görüyor.",
    kartlar: [
      { rakam: "8", ust: "Oyun grupları ve atölyeler", alt: "Bebek, gelişim odaklı, İngilizce ve bütün atölyeler" },
      { rakam: "12", ust: "Okula hazırlık grupları", alt: "Sınıf ortamına alışmayı destekleyen mevcut", dolu: true },
    ],
  },
  {
    dosya: "guvenli-ayrilma",
    etiket: "Güvenli ayrılma",
    baslikKoyu: "Anneden ayrılmak",
    baslikAcik: "öğrenilir",
    baslikBoyu: "orta",
    spot: "Çocuğu bir anda bırakmıyoruz. Kendi hızında, üç basamakta ilerliyor.",
    akis: [
      {
        no: "1",
        ust: "Ebeveyn yanında",
        alt: "Bebek ve oyun gruplarında ebeveyn çocuğa eşlik eder",
      },
      {
        no: "2",
        ust: "Ebeveyn alanda",
        alt: "Çocuk gruba katılır, ebeveyn atölye alanında bekler",
      },
      {
        no: "3",
        ust: "Ebeveynsiz",
        alt: "Okula hazırlık gruplarına çocuk tek başına katılır",
      },
    ],
  },
  {
    dosya: "gun-akisi",
    etiket: "Bir gün nasıl geçiyor",
    baslikKoyu: "Günün akışı",
    baslikAcik: "belli",
    spot: "Ne olacağını önceden bilirsiniz. Kapıda sürpriz çıkmaz.",
    akis: [
      { no: "1", ust: "İlk bir saat serbest oyun", alt: "Çocuk kendi hızında ısınır, gruba öyle katılır" },
      { no: "2", ust: "Bütünleştirilmiş etkinlik", alt: "Yaş grubuna göre planlanmış program" },
      { no: "3", ust: "Ara öğün", alt: "Her katılımda ara öğün verilir" },
      { no: "4", ust: "Öğle arası 12.30 - 13.30", alt: "Her gün aynı saatte" },
    ],
  },
  {
    dosya: "cumartesi",
    etiket: "Hafta sonu",
    baslikKoyu: "Cumartesi",
    baslikAcik: "de açığız",
    spot: "Hafta içi yetişemeyenler için cumartesi programı. Pazar kapalıyız.",
    izgara: true,
    kartlar: cmt.map((s) => ({
      ikon: s.dil === "en" ? "yildiz" : "kalp",
      ust: atolyeBul(s.atolyeSlug)?.kisaAd ?? s.atolyeSlug,
      alt: `${s.yas.etiket} · ${s.bas} - ${s.bit}`,
      // Dil, satir sonunda yalniz " ·" birakmasin diye ayri rozette.
      rozet: s.dil === "en" ? "İngilizce" : undefined,
    })),
  },
  {
    dosya: "erken-kayit",
    etiket: "Erken kayıt",
    baslikKoyu: "Erken kayıt",
    baslikAcik: "devam ediyor",
    baslikBoyu: "orta",
    spot: `Bütün paketlerde geçerli. ${KAMPANYA_PENCERESI.metin} arası kayıt olan velilerimiz için.`,
    rozet: { ust: "ERKEN KAYITTA", buyuk: "%20", alt: "indirim" },
    kartlar: [
      { ikon: "takvim", ust: `Son gün ${KAMPANYA_PENCERESI.sonGun}`, alt: "Kontenjanlar dolduğu sırayla kapanır", dolu: true },
      { ikon: "elma", ust: "Peşin ödemeye özel", alt: "Kredi kartı, havale ve nakit, üç yöntem de geçerli" },
      { ikon: "kalp", ust: "İki katılımda hediye", alt: "İki katılım sağlayan her çocuğa İngilizce oyun grubu hediye" },
    ],
  },
];

// ------------------------------------------------------------------ uretim

function kartHtml(k: Kart) {
  const gorsel = k.rakam
    ? `<span class="k-rakam">${kacis(k.rakam)}</span>`
    : `<span class="k-ikon"><img src="${ikonVeri(k.ikon ?? "yildiz", k.dolu ? "#ffffff" : "#2f5e1c")}" alt=""></span>`;
  return `      <div class="k${k.dolu ? " dolu" : ""}">
        ${gorsel}
        <div class="k-govde">
          <p class="k-ust">${kacis(k.ust)}</p>
          ${k.alt ? `<p class="k-alt">${kacis(k.alt)}</p>` : ""}
          ${k.rozet ? `<span class="k-rozet">${kacis(k.rozet)}</span>` : ""}
        </div>
      </div>`;
}

function postHtml(p: Post) {
  const govde = `
  <div class="kare">
${BICIMLER}
${p.rozet ? `  <div class="rozet"><div><span class="r-ust">${kacis(p.rozet.ust)}</span><span class="r-buyuk">${kacis(p.rozet.buyuk)}</span><span class="r-alt">${kacis(p.rozet.alt)}</span></div></div>` : ""}
    <div class="ic">
      <p class="ust-etiket">${kacis(p.etiket)}</p>
      <h1 class="baslik-${p.baslikBoyu ?? "buyuk"}">
        <span class="koyu">${kacis(p.baslikKoyu)}</span>
        <span class="acik">${kacis(p.baslikAcik)}</span>
      </h1>
      <div class="alti-cizgi"></div>
      ${p.spot ? `<p class="spot">${kacis(p.spot)}</p>` : ""}
${
  p.akis
    ? `      <ul class="akis">
${p.akis
  .map(
    (a) => `        <li>
          <span class="akis-nokta">${kacis(a.no)}</span>
          <div class="akis-govde">
            <p class="akis-ust">${kacis(a.ust)}</p>
            <p class="akis-alt">${kacis(a.alt)}</p>
          </div>
        </li>`,
  )
  .join("\n")}
      </ul>`
    : ""
}
${
  p.kartlar
    ? `      <div class="kartlar${p.izgara ? " izgara" : ""}">
${p.kartlar.map(kartHtml).join("\n")}
      </div>`
    : ""
}
    </div>
${SERIT}
  </div>`;

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<title>${kacis(p.baslikKoyu)} ${kacis(p.baslikAcik)} · ${MARKA.ad}</title>
<style>
${readFileSync(new URL("./pdf-fontlar.css", import.meta.url), "utf8")}
${readFileSync(new URL("./sosyal-stil.css", import.meta.url), "utf8")}
</style>
</head>
<body>
${govde}
</body>
</html>`;
}

mkdirSync("docs/sosyal", { recursive: true });
for (const p of POSTLAR) {
  writeFileSync(`docs/sosyal/${p.dosya}.html`, postHtml(p), "utf8");
}

console.log(`${POSTLAR.length} post uretildi:`);
POSTLAR.forEach((p) => console.log(`  docs/sosyal/${p.dosya}.html`));
if (!MEB_IFADESI) console.warn("UYARI: MEB ifadesi bos, meb postu eksik kalir.");
