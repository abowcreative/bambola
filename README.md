# Bambola

Bambola Oyun ve Parti Evi (Kibar Çocuk Etkinlik ve Oyun Merkezi) tanıtım ve
kayıt sitesi. Çankaya, Ankara.

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind 4 · Supabase · TypeScript

---

## Başlarken

```bash
npm install
cp .env.example .env.local     # doldurun, bkz. Ortam değişkenleri
npm run dev                    # http://localhost:3939
```

Port **3939**, 3000 değil.

Kayıt formunun çalışması için Supabase kurulumu gerekir:
**[`supabase/KURULUM.md`](supabase/KURULUM.md)**. Kurulmadan site açılır ve
gezilir, yalnız form gönderimi 500 döner.

---

## Önce bunu okuyun

**[`PLAN.md`](PLAN.md)** bu projenin tek kaynağıdır: içerik kuralları, veri
yapısı, alınmış kararlar ve gerekçeleri, müşteriden bekleyenler. Bir şeyin
neden öyle olduğunu merak ederseniz cevabı orada.

Özellikle **Bölüm 3, katı içerik kuralları** — teyit edilmemiş hiçbir rakam
veya iddia siteye girmez, uydurulmaz.

---

## Komutlar

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu, port 3939 |
| `npm run build` | Üretim derlemesi |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Veri testleri + derleme + font testi |
| `npm run test:veri` | Veri bütünlüğü (318 kontrol) |
| `npm run test:font` | Türkçe glif kapsamı, derlemeden sonra çalışır |
| `npm run test:supabase` | Supabase kurulumu doğrulaması, gerçek anahtar ister |
| `npm run foto` | `public/foto` ve `public/ekip` klasörlerini üretir |
| `npm run belge` | Fiyat listesi PDF'leri, üyelik formu ve sosyal medya görselleri |

---

## Veri nereden geliyor

Sitedeki neredeyse her rakam ve metin `src/lib/data/` altındaki dosyalardan
geliyor, sayfalara elle yazılmıyor.

| Dosya | İçerik |
|---|---|
| `program.ts` | Haftalık program, 30 seans. Excel'e karşı hücre hücre doğrulandı |
| `gruplar.ts` | Program aileleri ve sabit kombinasyonlar |
| `atolyeler.ts` | Dokuz atölye |
| `ucretler.ts` | Paketler, erken kayıt penceresi ve indirim mantığı |
| `ekip.ts` | Öğretmen kadrosu, özgeçmişler |
| `fotograflar.ts` | Mekân kareleri ve alt metinleri |
| `sss.ts` | Sık sorulanlar |

Kim hangi programı veriyor **ayrı bir listede tutulmuyor**, haftalık programdan
çıkarılıyor (`atolyeOgretmenleri`, `aileOgretmenleri`). Elle yazılan bir eşleşme
program değiştiğinde sessizce eskir.

`npm run test:veri` bu dosyalar arasındaki tutarlılığı sınıyor: tanımsız slot
kimliği, ekipte olmayan öğretmen, ters yaş aralığı, kampanya tarihi kayması,
NAP tutarlılığı ve daha fazlası.

---

## Fotoğraflar

`public/foto/` **elle düzenlenmez.** Klasör `npm run foto` ile sıfırdan
üretiliyor; betik her çalıştığında içeriği silip yeniden yazıyor.

Kaynak paket depo dışında (yüzlerce MB PNG). Yolu `FOTO_KAYNAK` ortam
değişkeniyle değiştirilebilir. Ayrıntı: PLAN.md Bölüm 17.

Öğretmen portreleri `kaynak/ekip-fotograflari/` altındaki PNG'lerden üretiliyor,
o klasör depoda.

---

## Ortam değişkenleri

`.env.example` dosyasında tamamı açıklamalarıyla duruyor. Kısaca:

| Değişken | Olmazsa ne olur |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Kanonik URL'ler localhost gösterir, **sessizce** |
| `NEXT_PUBLIC_SUPABASE_URL` / `..._ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Form gönderimi 500 döner |
| `RESEND_API_KEY`, `BILDIRIM_ALICI`, `BILDIRIM_GONDEREN` | Kayıt veritabanına düşer ama kimseye haber gitmez |
| `NEXT_PUBLIC_META_PIXEL_ID` | Piksel hiç yüklenmez |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` satır düzeyi güvenliği (RLS) atlar. Yalnız
> sunucuda kullanılır, `NEXT_PUBLIC_` önekiyle tanımlanmaz, depoya girmez.

---

## Klasörler

```
src/app/          sayfalar (App Router)
src/components/   arayüz bileşenleri
src/lib/          veri, iş mantığı, SEO, Supabase
scripts/          testler ve belge üreticileri
supabase/         SQL migration ve kurulum adımları
docs/             üretilen PDF'ler ve sosyal medya görselleri
kaynak/           kaynak Excel dosyaları ve ham portreler
marka/            logo çalışma dosyaları
```

---

## Yayına çıkarken

1. Alan adı belli olunca `NEXT_PUBLIC_SITE_URL` hem `.env.local` hem Vercel'de
   tanımlanır
2. Supabase anahtarları Vercel ortam değişkenlerine girilir
   (`service_role` yalnız sunucu tarafına)
3. `npm test` ve `npm run test:supabase` temiz geçmeli
4. Search Console doğrulaması ve sitemap gönderimi

Kalan işler ve müşteriden bekleyenler: PLAN.md Bölüm 13 ve 14.
