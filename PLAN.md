# Bambola Web Sitesi — Kuruluş Planı

**Durum:** Sıfırdan yeni proje. Bu dosya tek doğruluk kaynağıdır.
**Tarih:** 10 Ağustos 2026
**Hedef:** Site sabaha kadar yayında. Oyun evi tarafı tam, anaokulu tarafı iskelet + SEO yeri açık.
**Ana iş:** Ziyaretçi kendi çocuğunun yaşına uygun grubu, günü, saati ve paketi seçip form dolduracak. Bu talep admin panelinde görünecek.

---

## 0. Bu dosya nasıl kullanılır

Yeni proje `D:\web projeleri\bambola` altında kurulacak. Bu dosya projenin içine taşınacak ve iş ilerledikçe güncellenecek.

- Bölüm 1-3: neyi neden yapıyoruz. Metin yazarken buraya dönülür.
- Bölüm 4-5: teknik kurulum ve site haritası.
- Bölüm 6: **Excel'den çıkarılmış gerçek veri.** Kod bu bölümden beslenir, Excel'e tekrar bakmaya gerek yok.
- Bölüm 7-10: form, veritabanı, admin.
- Bölüm 13: gece boyunca hangi sırayla ilerleneceği.
- Bölüm 14: müşteriden teyit bekleyenler. Teyit gelmeden yayına çıkmayacak maddeler burada.

Kaynak Excel'ler `kaynak/` klasöründe duruyor:
- `program-ABOW-v2.xlsx` — **geçerli sürüm.** Öğretmen atamaları, ücret sayfası ve Pazar programı var.
- `program-ABOW-v1.xlsx` — eski sürüm, yalnız karşılaştırma için. Kod bundan beslenmez.

Marka varlıkları `marka/` klasöründe. Kaynak PDF'lerden çıkarıldı:
- `bambola-kids-zone.svg` — **ana logo, gerçek vektör.** Header, footer, OG. Kaynak PDF'in vektör içeriğinden birebir çevrildi, kalite kaybı yok.
- `bambola-kids-zone.png` — 1024px, şeffaf zemin. Favicon ve OG kartı için.
- `kibar-oyun-merkezi.png`, `kibar-anaokulu.png` — 1024px, şeffaf. **Raster, en fazla 128px kullanılır.** Bkz. Bölüm 14, madde 8.
- `kibar-anaokulu-bambolasiz.png` — 1024px arşiv, `src/assets/kibar-anaokulu-bambolasiz.png` 512px çalışma kopyası. **BAMBOLA wordmark'ı kaldırılmış mor amblem.** Üyelik formu bunu kullanır. Kaynak: `marka/LOGO KİBAR ÇOCUKLAR ANAOKULU BAMBOLASIZ.pdf`. Bkz. Bölüm 14, madde 8.

---

## 1. İş hedefi ve kapsam

### Ne satıyoruz

Bambola'nın iki kurumu var ve ikisi de aynı sitede yaşayacak:

| Kurum | Durum | Bu sitedeki yeri |
|---|---|---|
| **Bambola Oyun Evi** (+ parti evi) | Faal | Şimdi tam kuruluyor. Sitenin ağırlık merkezi bu. |
| **Bambola Anaokulu** | Bu sene açılıyor, 160 kapasite | Şimdi iskelet + tanıtım + ön kayıt formu. İçerik geldikçe dolacak. |

İkisi tek domain altında yaşayacak çünkü aralarında doğal bir yaş merdiveni var: çocuk oyun evinde başlar, yaşı gelince anaokuluna geçer. SEO tarafında da bu ikisi birbirini besler; ayrı domainlere bölmek her iki tarafı da zayıflatır.

### Sitenin tek işi

Ziyaretçiyi **doldurulmuş bir kayıt formuna** taşımak. Blog, kurumsal anlatı, mekân görselleri, hepsi bu formu besler. Site "güzel görünen bir broşür" değil, çalışan bir kayıt kanalı.

### Bu ilk sürümün kapsamı (sabaha kadar)

Yapılacak:
- Ana sayfa, oyun evi bölümü, program sayfaları, haftalık takvim, ücretler, kayıt formu, iletişim, SSS
- Kayıt formu Supabase'e yazacak
- Admin paneli: gelen talepleri listeleme, detay, durum değiştirme, not ekleme
- Teknik SEO: metadata, sitemap, robots, schema.org, OG kartları
- Anaokulu için tek tanıtım sayfası + ön kayıt formu

Yapılmayacak (sonraya):
- Online ödeme
- Otomatik kontenjan takibi ve slot kilitleme
- Blog yazıları (altyapı kurulur, içerik sonra)
- Veli paneli / gelişim raporu ekranı

---

## 2. Kurum gerçekleri ve marka

Bunlar doğrulanmış bilgiler. Metin yazarken buradan çıkılmaz.

- **Bambola**, İtalyanca "oyuncak bebek" demek. Markanın adı zaten oyunu işaret ediyor. Bu, sitenin en değerli ve şu ana kadar hiç kullanılmamış marka varlığı. Hakkımızda sayfası buradan açılır.
- Kurum **Çankaya, Ankara**'da.
- **MEB'e bağlı.** Çoğu oyun alanı işletme ruhsatıyla açılır ve belediye denetimindedir. MEB'e bağlı olmak denetleyen kurumu, personel niteliğini, fiziki şartları ve velinin başvurabileceği mercii değiştirir. Bir oyun evi için elde tutulabilecek en ayırt edici yapısal fark budur ve sitenin ana iddiasıdır.
  > ⚠️ **Resmi ifade teyidi şart.** "MEB'e bağlı", "MEB onaylı" ve "MEB ruhsatlı" hukuken farklı şeyler. Kurumun belgesinde hangisi geçiyorsa o yazılır. Teyit gelmeden bu iddia yayına çıkmaz. Bkz. Bölüm 14.
- Grup mevcudu **en fazla 12 kişi**.
- Öğretmen kadrosu: **Emine, Burcu, Dilara** (Excel'deki atamalardan). Soyadları ve unvanları teyit bekliyor.
- Anaokulu: 8 kat, 160 kapasite, teleskop, piyano, laboratuvar. **1,5 - 6 yaş tek çatı.** 6 yaştan sonrası yok.
- **Geçmiş veri yok.** Doluluk oranı, mezun sayısı, memnuniyet yüzdesi gibi hiçbir rakam sitede uydurulmaz.

### Marka mimarisi

Bu yapı logolardan çıktı, planın ilk halinde bilinmiyordu. İki katman var:

| Katman | Ad | Nerede kullanılır |
|---|---|---|
| Ticari marka | **Bambola** | H1'ler, sayfa başlıkları, tüm site metni, domain |
| Tüzel kimlik | **Kibar Çocuk Etkinlik ve Oyun Merkezi** (oyun evi), **Kibar Çocuklar Anaokulu** (anaokulu) | Footer NAP, KVKK metni, schema `legalName`, MEB iddiasının dayandığı ad |

Üç logo da aynı piktogramı taşıyor: yetişkin ve çocuk el ele, çocuğun elinde oyuncak ayı. Ortada `BAMBOLA` wordmark'ı. Yani Bambola üç kurumun ortak çatısı, Kibar ise resmi ad.

Bunun üç sonucu var:

1. **MEB iddiası tüzel ada bağlı.** Ruhsat "Kibar" adına düzenlendiyse site o adı görünür biçimde taşımak zorunda, yoksa veli iddiayı doğrulayamaz. Bölüm 14 madde 2 ile birlikte teyit edilir.
2. **NAP tutarlılığı.** Google Business Profile hangi adla kayıtlıysa footer'daki ad birebir aynısı olur. İki farklı ad yerel SEO'yu böler.
3. **`/parti` yan sayfa değil.** Yeşil logonun halkasında "KIDS ZONE & PARTY HOUSE" yazıyor. Parti evi markanın kendi tanımının parçası, sitede de o ağırlıkta durur.

> ⚠️ Anaokulunun sitedeki adı teyit bekliyor: "Bambola Anaokulu" mu, "Kibar Çocuklar Anaokulu" mu? Logo ikincisini söylüyor, planın ilk hali birincisini varsaymıştı. Bkz. Bölüm 14, madde 13.

### Konumlandırma çizgisi: Fröbel

Kurumun eğitim yaklaşımı **Fröbel çizgisi** üzerinden anlatılır. Friedrich Fröbel (1782-1852) kamu malıdır, izin veya lisans gerekmez, ve kurumla birebir örtüşür:

| Fröbel | Bambola'daki karşılığı |
|---|---|
| Adın anlamı: oyuncak | Bambola = oyuncak bebek |
| Oyun merkezli öğrenme | Kurumun kökeni oyun evi |
| Şarkı ve hareket | Şarkılı masal atölyeleri, müzik odası, piyano |
| Bahçe (kindergarten) | Giriş katı bahçesi |
| Hediyeler (gifts) | Atölye katları |
| Meşguliyetler (occupations) | El işi ve sanat atölyeleri |
| Birlik | 1,5 - 6 yaş tek çatı |

Vurgu: modeli kuruma uydurmak değil, kurumun zaten o tarife uyduğunu fark etmek.

> **Abow sınırı:** Bizim işimiz pedagoji değil. Sitede "şu eğitim modelini uyguluyoruz" taahhüdü verilmez, kurumun yaklaşımı **anlatılır**. Metin kurumla teyit edilmeden yayına çıkmaz.

---

## 3. Katı içerik kuralları

Bunlar önceki çalışmalarda patron kararı olarak netleşti. İhlal edilmez.

1. **Görünen metinde uzun tire (—) yok.** Normal tire veya virgül kullanılır.
2. **Emoji yok.** İkon seti kullanılır.
3. **Teyit edilmemiş rakam metne girmez.** Kontenjan doluluğu, öğrenci sayısı, yıl sayısı, memnuniyet oranı.
4. **Kapanış tarihi ilan edilmez.** "Erken kayıt dönemi başladı" denir. Geri sayım, "son gün", "üç gün kaldı" gibi ifadeler kullanılmaz. Aciliyet tarihten değil kontenjandan gelir: grup saatleri sınırlı ve dolduğu sırayla kapanır.
   > ⚠️ **Çelişki var, karar gerekiyor.** Yeni Excel'in ücret sayfasında kampanya penceresi açıkça yazılı: **10.08.2026 - 01.09.2026**. Bu, "tarih verilmez" kuralıyla çelişiyor. Bkz. Bölüm 14, madde 1.
5. **Kap olmadan çağrı yapılmaz.** Kayıt formu ve WhatsApp hattı yayına girmeden hiçbir kanalda "kayıt al" çağrısı yapılmaz. Sitenin sabaha kadar bitmesinin asıl sebebi bu.
6. **Çocuk yüzü için yazılı veli izni.** Sitede kullanılacak her fotoğrafta geçerli.
7. **Rakip kötülenmez.** MEB bağlılığı gibi yapısal farklar anlatılır, ayrımı velinin kendisi yapar.
8. **Dil sıcak ve canlı, süperlatif yok.** *(10 Ağustos 2026'da güncellendi. Önceki hali "ünlem yok, sakin dil" idi; tasarım yönü değişince gevşetildi, bkz. Bölüm 11.)* Ünlem ölçülü kullanılır, art arda gelmez. Süperlatif ve karşılaştırmalı iddia kullanılmaz ("Ankara'nın en iyisi", "bir numara" gibi). Cümleler kısa kalır. Metin veliye bilgi verir, tonu çocuğun dünyasından alır.
9. Kart metinleri birbirine yakın uzunlukta olur, ızgara bozulmaz.
10. **Full responsive zorunlu.** Mobil öncelikli tasarlanır; velinin çoğu Instagram üzerinden telefonla gelecek.

---

## 4. Teknik yığın ve proje iskeleti

### Yığın

| Katman | Seçim | Gerekçe |
|---|---|---|
| Framework | **Next.js (en güncel sürüm) App Router** | Abow tarafında zaten kullanılıyor, SEO ve server component ihtiyacına birebir uyuyor |
| Dil | TypeScript | |
| Stil | **Tailwind v4** (CSS-first `@theme`) | Abow ile aynı desen, hızlı |
| Animasyon | `motion` v12 | `framer-motion` değil |
| Veritabanı + Auth | **Supabase** | Form kayıtları, admin girişi |
| E-posta | Resend | Form geldiğinde bildirim |
| Hosting | Vercel | Push ile otomatik deploy |
| Font | **Fredoka** (başlık) + **Poppins** (gövde) | Fredoka logonun yuvarlak monoline diliyle akraba, Poppins Abow ekosistemiyle tutarlı. Bkz. Bölüm 11 |

> **Not:** Next.js'in bu sürümünde API ve dosya yapısı eğitim verisindekinden farklı olabilir. Kod yazmadan önce `node_modules/next/dist/docs/` altındaki ilgili rehber okunur. Özellikle `middleware` yerine `proxy.ts`, `params`/`searchParams` await davranışı ve cache direktifleri kontrol edilir.

### Kurulum

```bash
cd "D:\web projeleri\bambola"
npx create-next-app@latest . --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"
npm i motion @supabase/supabase-js @supabase/ssr resend zod
```

**Dev portu 3939.** Abow projesi 3838'de çalışıyor, çakışmasın.

```json
// package.json
"scripts": {
  "dev": "next dev -p 3939",
  "build": "next build",
  "start": "next start -p 3939"
}
```

### Klasör yapısı

```
src/
  app/
    layout.tsx
    page.tsx                        ana sayfa
    oyun-evi/
      page.tsx                      oyun evi ana sayfa
      programlar/
        page.tsx                    tüm programlar
        [slug]/page.tsx             program detay (4 program + atölyeler)
      haftalik-program/page.tsx     takvim
      ucretler/page.tsx
      yas/[slug]/page.tsx           yaş bazlı SEO sayfaları
    anaokulu/
      page.tsx                      tanıtım + ön kayıt
    parti/page.tsx                  doğum günü ve parti
    kayit/
      page.tsx                      çok adımlı form
      tesekkurler/page.tsx
    hakkimizda/page.tsx
    ekip/page.tsx
    mekan/page.tsx
    sss/page.tsx
    iletisim/page.tsx
    blog/
      page.tsx
      [slug]/page.tsx
    admin/
      layout.tsx
      page.tsx                      talep listesi
      talep/[id]/page.tsx
      giris/page.tsx
    api/
      kayit/route.ts                form POST
    sitemap.ts
    robots.ts
    opengraph-image.tsx
  components/
    site/                           header, footer, hero, kartlar
    form/                           çok adımlı form bileşenleri
    takvim/                         haftalık program görünümü
    ui/                             ortak parçalar
  lib/
    data/
      program.ts                    haftalık slotlar (Bölüm 6.1)
      gruplar.ts                    program aileleri (Bölüm 6.2)
      ucretler.ts                   fiyatlar (Bölüm 6.3)
      atolyeler.ts                  atölye tanımları (Bölüm 6.4)
      ekip.ts                       öğretmenler
      sss.ts
    yas.ts                          ay hesabı ve uygunluk mantığı
    supabase/
      client.ts
      server.ts
    schema.ts                       zod doğrulama
    seo.ts                          metadata yardımcıları
```

### Veri nerede durur

Program, saatler ve ücretler **kodda TypeScript sabiti** olarak durur, veritabanında değil. Gerekçe: gece bitirilecek, veri yılda birkaç kez değişiyor, CMS kurmak zaman kaybı. Değişiklik gerektiğinde tek dosya düzenlenip push edilir.

Veritabanı **yalnızca form kayıtları ve admin** için kullanılır.

---

## 5. Bilgi mimarisi ve SEO

### Arama niyeti haritası

Site üç ayrı talep havuzunu hedefliyor. Sayfa mimarisi bu üçlüye göre kuruluyor.

| Havuz | Örnek arama | Karşılayan sayfa |
|---|---|---|
| **Oyun evi / oyun grubu** | çankaya oyun evi, ankara oyun grubu, meb'e bağlı oyun evi | `/oyun-evi` ve alt sayfaları |
| **Anaokulu** | çankaya anaokulu, ankara özel anaokulu, anaokulu ücretleri | `/anaokulu` |
| **Parti / doğum günü** | ankara doğum günü mekanı, çankaya parti evi, çocuk doğum günü organizasyonu | `/parti` |

### Sayfa ağacı ve hedef aramalar

```
/                                   Bambola Çankaya, marka araması
/oyun-evi                           çankaya oyun evi, ankara oyun evi
  /oyun-evi/programlar              oyun grubu programları
  /oyun-evi/programlar/okula-hazirlik-grubu        okula hazırlık grubu ankara
  /oyun-evi/programlar/gelisim-odakli-oyun-grubu   gelişim odaklı oyun grubu
  /oyun-evi/programlar/bebek-oyun-grubu            bebek oyun grubu ankara
  /oyun-evi/programlar/ingilizce-oyun-grubu        ingilizce oyun grubu ankara
  /oyun-evi/programlar/sarkili-masal-ve-sanat-atolyesi
  /oyun-evi/programlar/oyunlarla-matematik-atolyesi
  /oyun-evi/programlar/minik-beyinler-laboratuvari
  /oyun-evi/programlar/guvenli-ayrilma-programi    güvenli ayrılma, anneden ayrılamayan çocuk
  /oyun-evi/haftalik-program        oyun evi programı, saatleri
  /oyun-evi/ucretler                oyun evi ücretleri, oyun grubu fiyatları
  /oyun-evi/yas/6-12-ay             6 aylık bebek etkinlikleri ankara
  /oyun-evi/yas/12-24-ay            1 yaş oyun grubu
  /oyun-evi/yas/24-36-ay            2 yaş oyun grubu
  /oyun-evi/yas/3-5-yas             3 yaş etkinlikleri ankara
/anaokulu                           çankaya anaokulu, ankara anaokulu
/parti                              ankara doğum günü mekanı
/kayit                              form, indekslenir ama hedefi dönüşüm
/hakkimizda                         bambola ne demek, marka anlatısı
/ekip                               kadro, E-E-A-T sinyali
/mekan                              görsel ağırlıklı, açıldı (16 Ağustos 2026)
/sss                                uzun kuyruk soruları, FAQPage schema
/iletisim                           yerel SEO, NAP, harita
/blog                               konu otoritesi, sonra doldurulacak
```

**Yaş sayfaları programatik.** Tek şablon, `lib/data` üzerinden dört sayfa üretiyor. Her yaş sayfası o yaşa uygun programları, haftalık saatleri ve ücretleri filtreleyip gösteriyor, sonunda o yaşa önceden ayarlanmış kayıt formuna bağlanıyor. Bu sayfalar hem uzun kuyruk hem dönüşüm için en verimli yapı.

### Teknik SEO kontrol listesi

- [ ] Her sayfada benzersiz `title` (55-60 karakter) ve `description` (150-160 karakter)
- [ ] `metadataBase` ve kanonik URL'ler
- [ ] `sitemap.ts` tüm rotaları üretir, `/admin` ve `/api` hariç
- [ ] `robots.ts`: yalnız `/api/` ve `/admin` kapalı. Başka `Disallow` eklenmez
- [ ] Her sayfaya `opengraph-image.tsx` veya ortak şablon
- [ ] Türkçe `lang="tr"`, `og:locale="tr_TR"`
- [ ] Görseller `next/image`, WebP, `sizes` doğru
- [ ] Core Web Vitals: hero görseli `priority`, font `display: swap`, layout shift yok
- [ ] Breadcrumb hem görsel hem schema

### Schema.org

```
Organization + LocalBusiness (ChildCare)   → layout, tüm sitede
  name, address (Çankaya/Ankara), telephone, geo, openingHoursSpecification,
  priceRange, sameAs (Instagram)
Preschool                                   → /anaokulu
Course                                      → her program detay sayfası
  (name, description, provider, hasCourseInstance: saatler)
FAQPage                                     → /sss ve program sayfalarındaki soru blokları
BreadcrumbList                              → tüm iç sayfalar
Event                                       → tek seferlik atölyeler (opsiyonel, ikinci tur)
```

`openingHoursSpecification` haftalık programdan otomatik üretilir, elle yazılmaz.

### Yerel SEO

- Google Business Profile kaydı kullanıcıda. Site tarafında NAP bilgisi (isim, adres, telefon) her sayfanın footer'ında **birebir aynı** yazılır.
- Çankaya vurgusu başlıklarda ve H1'lerde geçer, spam olmadan.
- `/iletisim` sayfasında gömülü harita, ulaşım tarifi, otopark bilgisi.

---

## 6. VERİ: Program, gruplar ve ücretler

Bu bölüm `kaynak/program-ABOW-v2.xlsx` dosyasından birebir çıkarıldı. Kod bu tablolardan yazılır.

**Genel kurallar (Excel'den):**
- İlk bir saat serbest oyundur.
- Öğle arası her gün 12.30 - 13.30.
- Grup mevcudu en fazla 12 kişi.
- Ara öğün verilir.
- Hafta içi öğleden önce ve öğleden sonra iki grup açılır; uygunluk olması durumunda gruplar arasında telafi yapılabilir.
- Hafta sonu belirlenen zaman diliminde 1 saat serbest oyun ücretsizdir.
- Cumartesi grup programı yoktur.

### 6.1 Haftalık program

`30+ AY (EBEVEYNSİZ)` = çocuk gruba ebeveyni olmadan katılır. Bu, güvenli ayrılma programının parçası.

#### Pazartesi
| Saat | Yaş | Atölye / Grup | Öğretmen |
|---|---|---|---|
| 09.30 - 12.30 | 30+ ay (ebeveynsiz) | Okula Hazırlık Grubu, her gün 1 saat İngilizce | Emine + Burcu |
| 10.00 - 12.00 | 16-24 ay | Gelişim Odaklı Oyun Grubu | Dilara |
| 12.30 - 13.30 | | Ara | |
| 14.00 - 16.00 | 24-36 ay | İngilizce Oyun Grubu | Burcu + Emine |
| 15.00 - 17.00 | 12-24 ay | Bebek Oyun Grubu (Oyunlarla Büyüyorum) | Dilara |
| 16.00 - 18.00 | 24-36 ay | Gelişim Odaklı Oyun Grubu (Türkçe) | Dilara |

#### Salı
| Saat | Yaş | Atölye / Grup | Öğretmen |
|---|---|---|---|
| 09.30 - 12.30 | 30+ ay (ebeveynsiz) | Okula Hazırlık Grubu, her gün 1 saat İngilizce | Dilara + Burcu |
| 10.00 - 12.00 | 24-36 ay | Gelişim Odaklı Oyun Grubu | Emine |
| 12.30 - 13.30 | | Ara | |
| 14.00 - 16.00 | 3-5 yaş (ebeveynsiz) | Oyunlarla Matematik Atölyesi (İngilizce) | Emine + Burcu |
| 15.00 - 17.00 | 16-24 ay | Gelişim Odaklı Oyun Grubu | Dilara |
| 16.00 - 18.00 | 6-12 ay | Bebek Oyun Grubu (Oyunlarla Büyüyorum) | Emine |

#### Çarşamba
| Saat | Yaş | Atölye / Grup | Öğretmen |
|---|---|---|---|
| 09.30 - 12.30 | 30+ ay (ebeveynsiz) | Okula Hazırlık Grubu, her gün 1 saat İngilizce | Dilara + Burcu |
| 10.00 - 12.00 | 16-24 ay | Gelişim Odaklı Oyun Grubu | Emine |
| 12.30 - 13.30 | | Ara | |
| 14.00 - 16.00 | 12-24 ay | Şarkılı Masal ve Sanat Atölyesi (İngilizce) | Emine + Burcu |
| 14.30 - 17.30 | 30+ ay (ebeveynsiz) | Okula Hazırlık Grubu, her gün 1 saat İngilizce | Dilara + Burcu |
| 16.00 - 18.00 | 24-36 ay | Gelişim Odaklı Oyun Grubu | Emine |

#### Perşembe
| Saat | Yaş | Atölye / Grup | Öğretmen |
|---|---|---|---|
| 10.00 - 12.00 | 24-36 ay | Gelişim Odaklı Oyun Grubu | Dilara |
| 10.00 - 12.00 | 6-12 ay | Şarkılı Masal ve Sanat Atölyesi (Türkçe) | Emine |
| 12.30 - 13.30 | | Ara | |
| 14.00 - 16.00 | 24-36 ay | Şarkılı Masal ve Sanat Atölyesi (İngilizce) | Emine + Burcu |
| 14.30 - 17.30 | 30+ ay (ebeveynsiz) | Okula Hazırlık Grubu, her gün 1 saat İngilizce | Dilara + Burcu |
| 15.00 - 17.00 | 16-24 ay | Gelişim Odaklı Oyun Grubu | Emine |

#### Cuma
| Saat | Yaş | Atölye / Grup | Öğretmen |
|---|---|---|---|
| 10.00 - 12.00 | 6-12 ay | Bebek Oyun Grubu (Oyunlarla Büyüyorum) | Dilara |
| 10.00 - 12.00 | 3-5 yaş | Minik Beyinler Laboratuvarı (Akıl ve Zeka Oyunları) | Emine |
| 12.30 - 13.30 | | Ara | |
| 14.00 - 16.00 | 24-36 ay | İngilizce Oyun Grubu | Emine + Burcu |
| 14.30 - 17.30 | 30+ ay (ebeveynsiz) | Okula Hazırlık Grubu, her gün 1 saat İngilizce | Emine + Burcu |
| 15.00 - 17.00 | 12-24 ay | Bebek Oyun Grubu (Oyunlarla Büyüyorum) | Dilara |

#### Cumartesi
> **10 Ağustos 2026 patron kararı: Excel'de Pazar'a yazılı beş slotun tamamı aynı saatlerle Cumartesi'ye taşındı. Pazar grubu yok.**

| Saat | Yaş | Atölye / Grup | Öğretmen |
|---|---|---|---|
| 10.00 - 12.00 | 12-24 ay | Şarkılı Masal ve Sanat Atölyesi (İngilizce) | Emine + Burcu |
| 12.00 - 14.00 | 3-5 yaş | Oyunlarla Matematik Atölyesi (İngilizce) | Emine + Burcu |
| 14.00 - 16.00 | 24-36 ay | Gelişim Odaklı Oyun Grubu | Dilara |
| 16.00 - 18.00 | 6-12 ay | Bebek Oyun Grubu (Oyunlarla Büyüyorum) | Dilara |
| 18.00 - 19.00 | 30+ ay | Serbest Oyun Zamanı | |

#### Pazar
Grup programı yoktur. Kurum Pazar günü kapalıdır.


### 6.2 Program aileleri

Excel'in sağ tarafındaki özet bloğu. Kayıt formundaki ilk seçim bu.

#### A. Okula Hazırlık Grupları
- Güvenli ayrılma programı, ebeveynsiz
- 3 gün, 3 saat, bütünleştirilmiş etkinlikler
- Her gün 1 saat İngilizce
- Gelişim takibi
- 1 ara öğün
- Hafta sonları 1 saat serbest oyun alanı kullanım zamanı
- **Tek seferlik katılım yoktur**

Sabit grup seçenekleri (30+ ay, ebeveynsiz):
| Kombinasyon | Saat |
|---|---|
| Pazartesi, Salı, Çarşamba | 09.30 - 12.30 |
| Çarşamba, Perşembe, Cuma | 14.30 - 17.30 |

#### B. Oyun Grupları
- 2 gün, 2 saat, bütünleştirilmiş etkinlikler
- Haftada 2 gün
- Gelişim takibi
- Güvenli ayrılma programına geçiş
- Toplam 3 gün seçeneği
- 1 gün İngilizce hediye
- Hafta sonu seçeneği

Sabit grup seçenekleri:
| Yaş | Sıklık | Kombinasyon 1 | Kombinasyon 2 | Hafta sonu seçeneği |
|---|---|---|---|---|
| 16-24 ay | Haftanın 2 günü, 2 saat | Pzt + Çrş, 10.00 - 12.00 | Salı + Prş, 15.00 - 17.00 | |
| 24-36 ay | Haftanın 2 günü, 2 saat | Salı + Prş, 10.00 - 12.00 | Pzt + Çrş, 16.00 - 18.00 | **Cumartesi, 14.00 - 16.00** |
| 12-24 ay | Haftanın 2 günü, 2 saat | Pazartesi + Cuma, 15.00 - 17.00 | | |
| 6-12 ay | Haftanın tek günü | Salı, 16.00 - 18.00 | Cuma, 10.00 - 12.00 | **Cumartesi, 16.00 - 18.00** |

> **Hafta sonu sütunu 10 Ağustos 2026'da eklendi.** Excel'in `M18` hücresinde "HAFTA SONU" satır etiketi, `N18` ve `O18` hücrelerinde de bu iki seçenek duruyor. Planın ilk hali bu iki hücreyi yanlışlıkla tek seferlik atölye bloğuna okumuştu. Bunlar tek seferlik atölye değil, **sabit oyun gruplarının hafta sonu alternatifi.** Kayıt formunda Adım 4'te gerçek seçenek olarak görünür.

#### C. Tek Seferlik Etkinlikler
Tek katılımla girilebilen atölyeler:

| Yaş | Atölye | Hafta içi | Hafta sonu |
|---|---|---|---|
| 3-5 yaş | Oyunlarla Matematik (İngilizce) | Salı 14.00 - 16.00 | Pazar 12.00 - 14.00 |
| 24-36 ay | İngilizce Oyun Grubu | Pazartesi 14.00 - 16.00 | |
| 12-24 ay | Şarkılı Masal Atölyesi (İngilizce) | Çarşamba 14.00 - 16.00 | Pazar 10.00 - 12.00 |
| 24-36 ay | Şarkılı Masal ve Sanat Atölyesi (İngilizce) | Perşembe 14.00 - 16.00 | |
| 6-12 ay | Şarkılı Masal ve Sanat Atölyesi (Türkçe) | Perşembe 10.00 - 12.00 | |
| 24-36 ay | İngilizce Oyun Grubu | Cuma 14.00 - 16.00 | |
| 3-5 yaş | Minik Beyinler Laboratuvarı | Cuma 10.00 - 12.00 | |

> ✅ **Pazar tutarsızlığı çözüldü, teyide gerek yok.** *(10 Ağustos 2026)* Planın ilk hali Pazar 14.00-16.00 ve 16.00-18.00'i bu tabloya, yani tek seferlik atölye listesine yazmıştı ve günlük programla çeliştiğini sanmıştı. Excel'in ham hücre adresleri bakıldığında çelişki ortadan kalkıyor:
>
> ```
> M18 = "HAFTA SONU"           satır etiketi, sabit grup bloğunda
> N18 = "PAZAR 14.00-16.00"    N sütunu = 24-36 ay sabit oyun grubu
> O18 = "PAZAR 16.00-18.00"    O sütunu = 6-12 ay sabit oyun grubu
> ```
>
> Bu iki hücre tek seferlik atölye sütunlarında (Q-W) değil, **sabit oyun grubu sütunlarında** duruyor. Yani "Pazar günü Şarkılı Masal atölyesi" diye bir şey yok; bunlar sabit grupların hafta sonu alternatifi. Günlük Pazar programıyla (6.1) tam örtüşüyor: 14.00-16.00 = 24-36 ay Gelişim Odaklı Oyun Grubu, 16.00-18.00 = 6-12 ay Bebek Oyun Grubu. Seçenekler yukarıdaki B tablosuna taşındı, bu tablodan silindi.

### 6.3 Ücretler

Kampanya: **Erken kayıt %20 indirim.**

Koşullar (Excel'den birebir):
- Kampanyadan peşin ödeme koşuluyla faydalanılır: kredi kartı, havale, nakit
- En fazla 3 ay faydalanılabilir
- Her programın ödeme tarihinden itibaren 1 ay içinde tamamlanması gerekir
- Hafta içi öğleden önce ve öğleden sonra 2 grup açılır, uygunluk olması durumunda gruplar arasında telafi yapılabilir
- Grupların toplam öğrenci sayısı en fazla 12 kişi

#### Okula Hazırlık Grubu (3 gün, 3 saat)
| Paket | Normal | Erken kayıt |
|---|---|---|
| Ayda 4 katılım | 9.000 TL | 7.200 TL |
| Ayda 8 katılım | 12.000 TL | 9.600 TL |
| Ayda 12 katılım | 15.000 TL | 12.000 TL |

Notlar:
- Tek seferlik katılım yoktur
- 1 katılım 3 saattir ve 1 saati İngilizce oyun grubu olacak şekilde programlanmıştır
- Ara öğün verilir, hafta sonu belirlenen zaman diliminde 1 saat serbest oyun ücretsizdir

#### Gelişim Odaklı Oyun Grubu (2 gün, 2 saat, etkinlik süresi 2 saat)
| Paket | Normal | Erken kayıt |
|---|---|---|
| Tek sefer | 2.000 TL | 2.000 TL |
| Ayda 4 katılım | 7.000 TL | 5.600 TL |
| Ayda 8 katılım | 10.000 TL | 8.000 TL |

Not: Haftada 1 gün İngilizce oyun grubu hediyedir, kontenjanla sınırlıdır.

#### Bebek Grubu (etkinlik süresi 2 saat)
| Paket | Normal | Erken kayıt |
|---|---|---|
| Tek sefer | 2.000 TL | 2.000 TL |
| Ayda 4 katılım | 7.000 TL | 5.600 TL |
| Ayda 8 katılım | 10.000 TL | 8.000 TL |

#### İngilizce Grubu (etkinlik süresi 2 saat)
| Paket | Normal | Erken kayıt |
|---|---|---|
| Tek sefer | 2.500 TL | 2.500 TL |
| Ayda 4 katılım | 8.000 TL | 6.400 TL |
| Ayda 8 katılım | 11.000 TL | 8.800 TL |

> **Tek sefer fiyatına indirim uygulanmıyor.** Excel'de indirimli satır tek sefer için aynı rakamı taşıyor. Sitede tek sefer satırında indirim rozeti gösterilmez.
>
> **KDV durumu Excel'de yazmıyor.** Sitede "+ KDV" ibaresi kullanılmaz, tutarlar çıplak yazılır. Teyit gelirse tek yerden değişir. Bkz. Bölüm 14, madde 4.

### 6.4 Atölye ve program tanımları

Site metinleri için gereken açıklamalar. Her biri kendi detay sayfasını alıyor.

| Slug | Ad | Yaş | Dil |
|---|---|---|---|
| `okula-hazirlik-grubu` | Okula Hazırlık Grubu | 30+ ay, ebeveynsiz | Türkçe, günde 1 saat İngilizce |
| `gelisim-odakli-oyun-grubu` | Gelişim Odaklı Oyun Grubu | 12-36 ay | Türkçe |
| `bebek-oyun-grubu` | Bebek Oyun Grubu (Oyunlarla Büyüyorum) | 6-24 ay | Türkçe |
| `ingilizce-oyun-grubu` | İngilizce Oyun Grubu | 24-36 ay | İngilizce |
| `sarkili-masal-ve-sanat-atolyesi` | Şarkılı Masal ve Sanat Atölyesi | 6-36 ay | Türkçe ve İngilizce |
| `oyunlarla-matematik-atolyesi` | Oyunlarla Matematik Atölyesi | 3-5 yaş | İngilizce |
| `minik-beyinler-laboratuvari` | Minik Beyinler Laboratuvarı (Akıl ve Zeka Oyunları) | 3-5 yaş | Türkçe |
| `guvenli-ayrilma-programi` | Güvenli Ayrılma Programı | 30+ ay | Türkçe |
| `serbest-oyun` | Serbest Oyun Zamanı | Tüm yaşlar | |

Her sayfanın iskeleti: ne yapılıyor, hangi yaşa uygun, hangi gün ve saatlerde, kaç kişilik grup, ücreti, sık sorulanlar, kayıt çağrısı.

> Atölyelerin **pedagojik açıklamaları kurumdan alınacak.** Uydurma içerik yazılmaz. Bkz. Bölüm 14, madde 5.

### 6.5 Veri modeli (TypeScript)

```ts
// lib/data/types.ts
export type Gun = "pazartesi" | "sali" | "carsamba" | "persembe" | "cuma" | "cumartesi" | "pazar";
export type Dil = "tr" | "en" | "karma";

export type YasAraligi = {
  minAy: number;
  maxAy: number;
  etiket: string;        // "16-24 ay", "3-5 yaş"
  ebeveynsiz: boolean;
};

export type Slot = {
  id: string;            // "pzt-0930-okula-hazirlik"
  gun: Gun;
  bas: string;           // "09.30"
  bit: string;           // "12.30"
  atolyeSlug: string;
  yas: YasAraligi;
  dil: Dil;
  ogretmenler: string[];
  tekSeferMumkun: boolean;
};

export type PaketSecenegi = {
  kod: "tek-sefer" | "ayda-4" | "ayda-8" | "ayda-12";
  etiket: string;
  normal: number;
  erkenKayit: number;    // indirim yoksa normal ile aynı
};

export type ProgramAilesi = {
  slug: "okula-hazirlik" | "gelisim-odakli-oyun" | "bebek" | "ingilizce";
  ad: string;
  ozellikler: string[];
  paketler: PaketSecenegi[];
  sabitKombinasyonlar: { etiket: string; slotIdler: string[] }[];
  notlar: string[];
};
```

Yaş uygunluğu tek fonksiyondan geçer, formda ve sayfalarda aynısı kullanılır:

```ts
// lib/yas.ts
export function ayHesapla(dogumTarihi: string, referans = new Date()): number { ... }
export function slotUygunMu(slot: Slot, ay: number): boolean {
  return ay >= slot.yas.minAy && ay <= slot.yas.maxAy;
}
```

### 6.6 İki Excel arasındaki farklar

v2 (`program-ABOW (1).xlsx`), v1'in üstüne ekleme yapılmış hali **değil**. Program yeniden kurgulanmış: slotlar silinmiş, yaş bantları değişmiş, atölye adları değişmiş, dil mantığı tamamen değişmiş. Kod **yalnızca v2'den** beslenir. Bu tablo, v1'de olup v2'de kaybolan şeyleri kayıt altına almak için duruyor; birinin unutulmuş mu yoksa bilerek mi kaldırıldığı teyit edilecek.

#### Yalnız v2'de olanlar
- **Ücret sayfası.** v1'in 2. ve 3. sayfaları tamamen boş. Fiyat verisi yalnız v2'de var.
- **Öğretmen atamaları.** Her slotta Emine / Burcu / Dilara. v1'de öğretmen satırı hiç yok.
- **Pazar programı dolu.** v1'de Pazar'da sadece bir saat yazılı, grup ve atölye boş. v2'de 5 slot dolu.
- **"İlk bir saat serbest oyun"** notu.

#### v1'de vardı, v2'de KALDIRILDI
| Ne | v1'deki hali | v2 |
|---|---|---|
| **Doğa ve Duyusal Keşif Atölyesi** | 2-4 yaş, Pzt 13.30-15.00, İngilizce. Tek seferlik listede de vardı | Tamamen yok. Yerine Pzt 14.00-16.00 İngilizce Oyun Grubu (24-36 ay) |
| **36+ ay grubu** | Haftanın 2 günü, Prş + Cuma 13.00-15.00 | Tamamen yok. En büyük kayıtlı grup artık 30+ ay okula hazırlık |
| **Perşembe 16.00-17.30 Şarkılı Masal** (24-36 ay, İngilizce) | Vardı | Yok |
| **Cumartesi saati** | 10.00-12.00 yazılıydı (grup boş) | Cumartesi'de saat bile yok |
| **Akıl Zeka Oyunları** başlığı | Özet sütununda ayrı satır | Ad değişti: Minik Beyinler Laboratuvarı, Cuma 10.00-12.00 programa girdi |
| **Oyunlarla Matematik (Türkçe)** | Cuma 10.00-12.00, 3-5 yaş | Yok. O saat Minik Beyinler Laboratuvarı oldu |

#### Değişenler
| Ne | v1 | v2 |
|---|---|---|
| **Dil mantığı** | Oyun gruplarında dönüşümlü: "PZT (Türkçe) + ÇRŞ (İngilizce)". Özet sütununda "haftada 1 gün Türkçe 1 gün İngilizce" | Dönüşüm kalktı. Kombinasyonlarda dil etiketi yok. Yerine **"1 gün İngilizce hediye"** (kontenjanla sınırlı) |
| **Şarkılı Masal Atölyesi** | Bu ad | **Şarkılı Masal ve Sanat Atölyesi** |
| **Atölye süreleri** | 1,5 saat olanlar vardı (13.30-15.00, 14.00-15.30, 16.00-17.30) | Hepsi **2 saate** çekildi ve 14.00-16.00'da toplandı |
| **Yaş bantları** | Karışık: "2-4 yaş", "36+", "3-5 yaş" birlikte | Sadeleşti: ay cinsinden bantlar + tek "3-5 yaş" |
| **Salı matematik atölyesi** | 3-5 yaş | 3-5 yaş **(ebeveynsiz)** |
| **6-12 ay grubu** | "Haftanın 2 günü 2 saat" bloğunda | **"Haftanın tek günü"** olarak ayrıldı |
| **Perşembe 13.00-15.00** | 36+ yaş, Gelişim Odaklı Oyun Grubu (Türkçe) | 24-36 ay, Şarkılı Masal ve Sanat (İngilizce), 14.00-16.00 |
| **Cuma 13.00-15.00** | 36+ yaş, Gelişim Odaklı (İngilizce) | 24-36 ay, İngilizce Oyun Grubu, 14.00-16.00 |

#### Bunun siteye üç etkisi var

1. **36+ ay ve 2-4 yaş bantları kalktı.** Site 3-5 yaş çocuğa yalnız üç kapı açıyor: Okula Hazırlık (30+ ay), Oyunlarla Matematik ve Minik Beyinler Laboratuvarı. Yaş sayfalarından `/oyun-evi/yas/3-5-yas` bu üçünü gösterir, "gelişim odaklı oyun grubu" göstermez.
2. **Gelişim Odaklı Oyun Grubu'nun dili artık belirsiz.** v1 hangi günün Türkçe hangi günün İngilizce olduğunu yazıyordu, v2 yazmıyor. Site "İngilizce" iddiasını bu grupta kullanamaz; kullanılabilecek tek ifade "haftada 1 gün İngilizce hediye". Form da bu grupta dil rozeti göstermez.
3. **Tek seferlik atölye listesi kısaldı.** v1'de 6 kalem vardı, v2'de 7 görünüyor ama içerik değişti: Doğa ve Duyusal Keşif çıktı, İngilizce Oyun Grubu iki ayrı günle girdi.

> **Pazar konusu kapandı.** Yukarıdaki paragrafın ilk hali "tek seferlik bloğunun hafta sonu satırı yanlış sütunlara yazılmış" diyordu. Hücre adreslerine bakıldığında Excel doğru yazılmış, plan yanlış okumuştu. Çözüm 6.2 sonundaki nota işlendi. Teyit maddesi düştü.

---

## 7. Kayıt formu spesifikasyonu

Sitenin kalbi. `/kayit` adresinde, ayrıca her program ve yaş sayfasından ön seçimli açılabiliyor (`?program=bebek&yas=12-24-ay`).

### Tasarım ilkeleri

- **Çok adımlı, tek soru odaklı.** Her adımda tek karar. Telefonda tek elle doldurulabilmeli.
- **İlerleme çubuğu** üstte, kaçıncı adımda olduğu görünür.
- **Geri dönülebilir**, girilen veri kaybolmaz (`sessionStorage`).
- **Fiyat adım 3'ten sonra ekranda sabit kalır**, seçim değiştikçe güncellenir. Sürpriz olmaz.
- Zorunlu alan minimumda: veli adı, telefon, çocuğun doğum tarihi. Gerisi kolaylaştırıcı.
- **Yaş filtresi otomatik.** Doğum tarihi girilir girilmez uygun olmayan gruplar listeden düşer. Veli "acaba uyar mı" diye düşünmez.

### Adımlar

**Adım 1 — Çocuk**
- Çocuğun adı (opsiyonel, sıcaklık için)
- Doğum tarihi (zorunlu, tarih seçici, gelecek tarih engellenir)
- Sistem ay hesaplar ve ekranda gösterir: "Çocuğunuz 19 aylık. Bu yaşa uygun 4 grubumuz var."

**Adım 2 — Program türü**
Uygun olanlar kart olarak listelenir, uygun olmayanlar gösterilmez:
- Okula Hazırlık Grubu (30+ ay)
- Gelişim Odaklı Oyun Grubu
- Bebek Oyun Grubu
- İngilizce Oyun Grubu
- Tek seferlik atölye
- Serbest oyun
- Doğum günü / parti (bu seçim formu parti koluna dallandırır)
- Anaokulu ön kaydı (ayrı kol)

**Adım 3 — Katılım paketi**
Seçilen programın paketleri gösterilir. Okula Hazırlık'ta tek sefer seçeneği hiç görünmez.
- Her kartta: normal fiyat üstü çizili, erken kayıt fiyatı büyük.
- Kartın altında koşullar: peşin ödeme, en fazla 3 ay, 1 ay içinde tamamlama.

**Adım 4 — Gün ve saat**
- Sabit kombinasyonu olan programlarda (2 gün 2 saat, 3 gün 3 saat) hazır kombinasyonlar kart olarak sunulur, tek tıkla seçilir. Veli tek tek gün işaretlemez.
- Tek seferlik atölyede yalnız o atölyenin saatleri listelenir.
- Her seçenekte öğretmen adı ve dil rozeti görünür.
- Uygun bulamayan için: "Bu saatlerin hiçbiri uymuyor" seçeneği. Seçilirse serbest metin alanı açılır ve talep yine kaydedilir. **Bu seçenek önemli, kaybedilen talebi görünür kılıyor.**

**Adım 5 — Veli bilgileri**
- Ad soyad (zorunlu)
- Telefon (zorunlu, TR formatı doğrulanır, maskeli giriş)
- E-posta (opsiyonel)
- Tercih edilen iletişim: WhatsApp / telefon / e-posta
- Bizi nereden duydunuz: Instagram, Google, tavsiye, tabela, diğer
- Eklemek istediğiniz not: alerji, özel durum, ikinci çocuk
- KVKK aydınlatma onayı (zorunlu, checkbox, metin `/kvkk` sayfasına link)
- Ticari ileti izni (opsiyonel, ayrı checkbox)

**Adım 6 — Özet ve gönder**
Seçilenler tek ekranda özetlenir, düzenle bağlantıları ilgili adıma döner. Gönder butonu.

**Sonrası:** `/kayit/tesekkurler` sayfası. "Talebiniz bize ulaştı, en kısa sürede döneceğiz." Altında WhatsApp'tan doğrudan yazma butonu ve Instagram bağlantısı. Bu sayfa dönüşüm ölçümünün tetiklendiği yer.

### Doğrulama

- Zod şeması hem istemcide hem sunucuda çalışır.
- Telefon: `+90` veya `0` ile başlayan 10 haneli, normalize edilip `5XXXXXXXXX` olarak saklanır.
- Doğum tarihi: bugünden ileri olamaz, 8 yıldan eski olamaz.
- Seçilen slot ile çocuğun yaşı sunucuda tekrar kontrol edilir. İstemci filtresine güvenilmez.
- Spam koruması: honeypot alanı + aynı IP'den 5 dakikada en fazla 3 gönderim.

---

## 8. Veritabanı şeması (Supabase)

```sql
-- Kayıt talepleri
create table basvurular (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- kol: hangi kurum
  kurum text not null default 'oyun-evi',      -- oyun-evi | anaokulu | parti

  -- çocuk
  cocuk_adi text,
  dogum_tarihi date not null,
  yas_ay int not null,                          -- gönderim anındaki ay, sonradan hesaplanmaz

  -- seçim
  program_slug text,                            -- okula-hazirlik | gelisim-odakli-oyun | bebek | ingilizce | tek-seferlik | serbest-oyun
  paket_kod text,                               -- tek-sefer | ayda-4 | ayda-8 | ayda-12
  secilen_slotlar jsonb not null default '[]',  -- [{id, gun, bas, bit, atolye, ogretmenler}]
  saat_uymuyor boolean not null default false,
  saat_notu text,

  -- fiyat (gönderim anındaki hali, sonradan fiyat değişse de kayıt bozulmaz)
  fiyat_normal int,
  fiyat_erken_kayit int,
  erken_kayit_uygulandi boolean not null default true,

  -- veli
  veli_adi text not null,
  telefon text not null,
  eposta text,
  iletisim_tercihi text,                        -- whatsapp | telefon | eposta
  kaynak text,                                  -- instagram | google | tavsiye | tabela | diger
  not_metni text,

  -- izinler
  kvkk_onay boolean not null,
  ticari_ileti_onay boolean not null default false,

  -- takip
  durum text not null default 'yeni',           -- yeni | arandi | ulasilamadi | kayit_oldu | vazgecti
  admin_notu text,
  guncelleyen text,
  updated_at timestamptz,

  -- teknik
  utm jsonb,
  referrer text,
  user_agent text
);

create index on basvurular (created_at desc);
create index on basvurular (durum);
create index on basvurular (kurum);

-- Admin notları geçmişi (opsiyonel, ikinci tur)
create table basvuru_notlari (
  id uuid primary key default gen_random_uuid(),
  basvuru_id uuid not null references basvurular(id) on delete cascade,
  created_at timestamptz not null default now(),
  yazan text,
  metin text not null
);
```

### RLS

```sql
alter table basvurular enable row level security;
-- Anonim kullanıcı yalnız INSERT edebilir, hiçbir şey okuyamaz.
create policy "anon insert" on basvurular for insert to anon with check (true);
-- Okuma ve güncelleme yalnız oturum açmış admin.
create policy "admin read"   on basvurular for select to authenticated using (true);
create policy "admin update" on basvurular for update to authenticated using (true);
```

> Form yine de `/api/kayit` üzerinden service role ile yazılır. İstemciden doğrudan insert yapılmaz; sunucuda yaş doğrulaması ve rate limit çalışsın diye.

---

## 9. API ve bildirim

### `POST /api/kayit`

1. Zod ile doğrula
2. Honeypot ve rate limit kontrolü
3. Yaşı sunucuda yeniden hesapla, seçilen slotlarla uyumunu doğrula
4. Fiyatı **sunucudaki tablodan** hesapla, istemciden gelen fiyata güvenme
5. Supabase'e yaz
6. Bildirim gönder
7. `{ ok: true, id }` dön

### Bildirim

**E-posta (Resend):** Her yeni başvuruda kuruma gider. Konu satırı taranabilir olmalı:
`Yeni kayıt talebi: Gelişim Odaklı Oyun Grubu, 19 aylık, Pzt+Çrş 10.00`

Gövdede tüm alanlar ve admin panelindeki detay sayfasına doğrudan bağlantı.

**WhatsApp:** İlk sürümde otomatik gönderim yok. Admin panelindeki her kartta `wa.me/90...` bağlantısı olur, tek tıkla velinin numarasına yazılır. Otomasyon ikinci turda.

---

## 10. Admin paneli

`/admin`, Supabase Auth ile e-posta + şifre girişi. Tek kullanıcı yeterli, sonradan çoğaltılır.

### Ekranlar

**`/admin` — Talep listesi**
- Üstte dört sayaç: bugün gelen, bu hafta, bekleyen (durum = yeni), kayda dönen
- Filtre: durum, kurum, program, tarih aralığı
- Arama: veli adı, telefon
- Tablo sütunları: tarih, çocuk yaşı, program, seçilen saat, veli adı, telefon, durum
- Satır tıklanınca detay
- **CSV dışa aktar** butonu
- Yeni gelen kayıtlar farklı arka planla işaretli

**`/admin/talep/[id]` — Detay**
- Tüm form alanları okunabilir halde
- Durum değiştirme (yeni / arandı / ulaşılamadı / kayıt oldu / vazgeçti)
- Admin notu ekleme
- WhatsApp'tan yaz butonu (hazır mesaj şablonuyla: "Merhaba, Bambola'dan ...")
- Telefonu ara butonu (`tel:` bağlantısı)

**`/admin/giris`** — Supabase Auth formu

### İleride (ikinci tur)
- Slot bazlı doluluk görünümü: hangi grup kaç talep aldı
- Kaynak dağılımı (Instagram / Google / tavsiye)
- "Saat uymuyor" diyenlerin raporu: hangi saatler talep görüyor ama açık değil

---

## 11. Tasarım yönü

> **10 Ağustos 2026'da değişti.** Önceki yön "sıcak ama premium, çocuk sitesi klişesinden uzak dur" idi. Patron kararıyla site doğrudan çocuğa hitap eden bir görsel dile geçti: kurumsal değil, çocuk enerjili. Aşağısı geçerli olan yön.

### Ana ilke

Site çocuğun dünyasına benziyor, velinin sorularına cevap veriyor. Renk, tipografi, hareket ve illüstrasyon çocuktan gelir; bilgi mimarisi, fiyat şeffaflığı ve kayıt akışı veliden. İkisi çatışmaz çünkü ayrı katmanlarda çalışırlar: veli aradığını hızlı bulur, çocuk ekrandan hoşlanır.

Yasak kalanlar: gökkuşağı gradyan, stok clip art, teyit edilmemiş rakam, süperlatif. Serbest olanlar: canlı renk, yuvarlak tipografi, karakterli piktogram, oyunlu hareket.

### Renk

Marka renkleri logolardan birebir çıkarıldı. **Renk teyidi maddesi kapandı.**

**Ana palet** (ana sayfa, oyun evi, parti, kayıt formu)

| Rol | Hex | Kullanım |
|---|---|---|
| Vurgu zemin | `#BDF270` | Açık lime, logonun dış halkası. Bölüm zemini ve rozet. Üstüne yalnız siyah metin (16.10:1). |
| Ana renk | `#588F27` | Yaprak yeşili, logonun iç diski. Buton zemini ve 24px üstü başlık. |
| Metin yeşili | `#42701C` | `#588F27` beyaz üstünde 3.91:1, gövde metni için yetersiz. Metinde bu koyu türev kullanılır (5.89:1). |
| Zemin | `#FFFFFF` ve kırık beyaz | |

**İkincil palet** (anaokulu, kurumsal sayfalar, KVKK, admin)

| Rol | Hex | Kullanım |
|---|---|---|
| Ana renk | `#33025A` | Derin mor. Beyaz üstünde 16.19:1, çok rahat. |
| Vurgu | `#D8C09A` | Kum. Mor üstünde 9.19:1. |
| Kontur | `#000000` | Logonun dış halkası. |

Bağlayıcı kontrast kuralları:
- `#BDF270` üstüne beyaz metin yazılmaz (1.30:1). Siyah yazılır.
- `#D8C09A` beyaz zeminde metin rengi değildir (1.76:1), yalnız mor zemin üstünde metin olur.
- Beyaz zeminde gövde metni yeşili her zaman `#42701C` veya daha koyu.

### Tipografi

Wordmark ince monoline, tümü büyük harf, geniş harf aralığı, yuvarlak uçlu. Site tipografisi bunu yankılar.

| Rol | Font | Not |
|---|---|---|
| Başlık | **Baloo 2** | Yuvarlak, dolgun, oyuncu. Ağırlık 400-800. Mobilde 32px altına düşmez. |
| Gövde | **Poppins** | Abow ekosistemiyle tutarlı, geometrik. |
| Fiyat ve sayı | Poppins, tabular rakam | Fiyat tablolarında hizalama bozulmaz. |

İkisi de `next/font` ile self-host edilir, `display: swap` uygulanır.

> ⚠️ **Yazı tipi seçerken glif kapsamı doğrulanır, altkümeye güvenilmez.** *(10 Ağustos 2026'da öğrenildi.)* Başlık fontu önce **Fredoka** seçilmişti. Google Fonts "latin-ext destekliyor" diyor ve `next/font` latin-ext dosyasını indiriyor, ama Fredoka'nın latin-ext dosyası yalnızca **22 glif** taşıyor ve **ğ, Ğ, İ, ş, Ş** hiçbiri içinde yok. Sonuç: sitedeki her "Çocuğunuz" kelimesinin ğ harfi yedek fonta düşüyordu.
>
> Bu yüzden `scripts/font-testi.mjs` yazıldı. Derlenmiş `woff2` dosyalarının `cmap` tablosunu açıp on iki Türkçe harfin tamamını arar. Yazı tipi değiştirilirse:
>
> ```bash
> npm run build && npm run test:font
> ```
>
> Test Fredoka'ya karşı denendi, beş harfi de doğru şekilde eksik raporlayıp çıkış kodu 1 verdi. Türkçe desteği doğrulanmış diğer adaylar: Quicksand, Varela Round, Figtree, Outfit. Desteklemeyenler: Fredoka, Comfortaa, Rubik, M PLUS Rounded 1c.

### İkon ve illüstrasyon

- **Emoji yok** (Bölüm 3 madde 2 aynen geçerli). Yerine logonun çizgi diliyle aynı ikon seti: sabit kalınlık, yuvarlak uçlu, kontursuz monoline. Piktogramlar karakterlidir, clip art değildir.
- Logodaki yetişkin, çocuk ve oyuncak ayı üçlüsü ikonografinin çıkış noktasıdır. Aynı çizgi kalınlığı ve aynı yuvarlaklık her ikonda korunur, böylece logo ile arayüz aynı elden çıkmış görünür.
- Fotoğraf geldiğinde fotoğraf öne geçer, illüstrasyon destek olur. Yer tutucular gri kutu değil, renkli tipografik bloklardır.

### Hareket

Hareket bu sürümde birinci sınıf tasarım öğesi, süs değil. `motion` v12 kullanılır.

| Yer | Hareket |
|---|---|
| Hero | Piktogram öğeleri sırayla belirir, oyuncak ayı düşük genlikle sallanır |
| Kartlar | Üzerine gelince yükselme ve hafif eğilme, tıklamada bastırma |
| Kaydırma | Bölüm başlıkları alttan yaylanarak girer, spring, sert değil |
| Form | Adım geçişlerinde yatay kayma, ilerleme çubuğu dolarken küçük kutlama hareketi |
| Yükleniyor | Dönen daire değil: zıplayan noktalar veya logo dairesinin çizilmesi |
| Sayılar | Fiyat ve yaş sayıları görünür olunca sayarak artar |

### Karakterler

*(10 Ağustos 2026'da eklendi.)* Sitede yedi animasyonlu karakter var: ayı, kedi, tavşan, balonlar, yıldız, bulut, blok kulesi. Hepsi `src/components/site/karakterler.tsx` içinde, kod olarak yazılmış SVG.

**GIF kullanılmaz.** Karakterler SVG çünkü: her boyutta net kalıyor, dosya olarak birkaç yüz bayt, rengi CSS'ten değişiyor ve `prefers-reduced-motion` açıksa hareket duruyor. GIF bunların hiçbirini yapamaz, kenarları tırtıklı çıkar ve sayfayı ağırlaştırır.

Çizgi dili logodan alınır: sabit kalınlık, yuvarlak uçlar, daire ağırlıklı biçimler. Her karakterin kendi mikro hareketi var (zıplama, süzülme, göz kırpma, kulak oynatma, kuyruk sallama). Ana sayfada logonun çevresinde beyaz daire içinde, çıkartma gibi duruyorlar.

Yeni karakter eklenirken önizleme alınıp gözle kontrol edilir; kör kod yazılmaz.

### Hareket sınırları

Bunlar tasarım tercihi değil teknik zorunluluk:
- `prefers-reduced-motion` desteklenir. Açıksa süslü hareketin tamamı kapanır, konfeti hiç basılmaz, yalnız opaklık geçişi kalır.
- Yalnız `transform` ve `opacity` animasyonlanır. Layout tetikleyen özellik animasyonlanmaz, Core Web Vitals bozulmaz.
- LCP öğesi animasyonla gizlenmez, hareket metnin okunmasını geciktirmez.
- **Sonsuz döngüdeki hareket sayısı sınırlı değil ama tamamı GPU'da bileşiklenebilir olmalı.** Önceki "sayfa başına en fazla iki" kuralı, tasarım yönü değişince kalktı. Ölçüt artık şu: hareket yalnız `transform`/`opacity` kullanıyorsa ve öğe küçükse serbesttir. `width`, `height`, `top`, `left`, `box-shadow` veya `filter` animasyonlanamaz.
- **Kaydırmada beliren içerik JavaScript'e bağımlı kalmaz.** `motion` ile beliren bloklar sunucudan `opacity: 0` ile geliyor; JavaScript çalışmazsa içerik kalıcı olarak görünmez kalırdı. `layout.tsx` içindeki `<noscript>` kuralı bu durumda hepsini görünür yapar. Yeni beliren blok eklenirse `data-belir` özniteliği verilir.
- **Deterministik olmayan değer üretilmez.** Konfeti gibi dağınık görünmesi gereken şeyler `Math.random` ile değil, indisten türeyen bir fonksiyonla üretilir ve değerler yuvarlanır. Yuvarlanmazsa sunucu `left: 27.2401%`, istemci `27.240073720895452%` yazar ve React hidrasyon uyuşmazlığı verir.

### Erişilebilirlik

- Kontrast AA. Yukarıdaki palet tablosundaki oranlar bağlayıcı.
- Form etiketleri gerçek `<label>`, klavye ile form baştan sona doldurulabilir.
- Oyuncu görsel dil okunabilirliğin önüne geçmez: gövde metni en az 16px, satır yüksekliği 1.6.

---

## 12. Ölçüm

- **Meta Pixel** kurulur (Abow tarafında zaten kullanılan desen). Olaylar: `ViewContent` program sayfasında, `InitiateCheckout` form 1. adımda, `Lead` gönderim başarılı olduğunda.
- **GA4** en sonda kurulur, site oturduktan sonra.
- Google Search Console'a domain doğrulaması ve sitemap gönderimi **ilk gün** yapılır.
- Form terk noktası ölçülür: hangi adımda düşüyorlar. Adım geçişleri olay olarak gönderilir.

---

## 13. Yayına alma sırası

Sabaha kadar bitecek işin sırası. Her madde bir öncekine bağımlı, atlanmaz.

| # | İş | Neden bu sırada |
|---|---|---|
| 1 | Proje kurulumu, Tailwind, font, temel layout, header, footer | Zemin |
| 2 | `lib/data/*` dosyaları: program, gruplar, ücretler, atölyeler | **Her şey buna bağlı.** Önce veri, sonra ekran |
| 3 | `lib/yas.ts` yaş ve uygunluk mantığı + testleri | Formun ve filtrelerin çekirdeği |
| 4 | Supabase projesi, tablo, RLS, env değişkenleri | Form yazacak yer olmadan form yazılmaz |
| 5 | `/api/kayit` + zod şeması | |
| 6 | `/kayit` çok adımlı form | **Kritik yol.** Site geri kalanı olmadan da bu çalışırsa iş görür |
| 7 | `/admin` giriş + liste + detay | Talebi görmeden çağrı yapılmaz |
| 8 | Ana sayfa | |
| 9 | `/oyun-evi` + `/oyun-evi/haftalik-program` + `/oyun-evi/ucretler` | |
| 10 | Program detay sayfaları (şablon + 9 slug) | |
| 11 | Yaş sayfaları (şablon + 4 slug) | |
| 12 | `/anaokulu`, `/parti`, `/hakkimizda`, `/iletisim`, `/sss` | |
| 13 | SEO katmanı: metadata, sitemap, robots, schema, OG | |
| 14 | Meta Pixel, Search Console, sitemap gönderimi | |
| 15 | Mobil kontrol, form uçtan uca test, Vercel deploy | Yayın |

**Zaman sıkışırsa kesilecekler, bu sırayla:** blog altyapısı → `/mekan` → `/ekip` → yaş sayfaları → program detay sayfalarının bir kısmı. **Form ve admin asla kesilmez.**

---

## 14. Teyit bekleyenler

Bunlar müşteriden gelmeden ilgili bölüm yayına çıkmaz.

1. ~~**Erken kayıt tarihi ilan edilecek mi?**~~ **KURUM ZATEN İLAN EDİYOR, 10 Ağustos 2026.** Kurumun kendi Instagram afişinde açıkça "Son gün: 1 Eylül" yazıyor. Yani "kapanış tarihi ilan edilmez" varsayımı sahada geçerli değil.
   **Karar gerekiyor:** site ve PDF de aynı tarihi yazsın mı, yoksa kurum sosyal medyada tarih verirken site vermesin mi? İkisinin farklı konuşması veliye tutarsız görünür. **Öneri:** site de "Erken kayıt son gün: 1 Eylül" yazsın, tek ağızdan konuşalım. Şu an site ve PDF tarih yazmıyor.

2. ~~**MEB'deki resmi ifade ne?**~~ **ÇÖZÜLDÜ, 10 Ağustos 2026.** Müşteri kesinleştirdi: **"Millî Eğitim Bakanlığı'na bağlı"**. Bu ifade  içindeki  sabitinden geliyor, tek yerden değişir. Müşterinin sözü: "MEB'e bağlılık en önemli noktamız, dikkat çekici olması lazım." Bu yüzden ana sayfa hero'sunda, hakkımızda sayfasında, footer'da, fiyat listesinin başlığının altında ve schema.org açıklamasında görünür rozet olarak duruyor.

3. ~~**Pazar öğleden sonra hangi atölye var?**~~ **ÇÖZÜLDÜ, 10 Ağustos 2026.** Çelişki yokmuş, plan Excel'i yanlış okumuş. `N18` ve `O18` hücreleri sabit oyun grubu sütunlarında duruyor, tek seferlik bloğunda değil. Pazar 14.00-16.00 = 24-36 ay grubunun hafta sonu seçeneği, Pazar 16.00-18.00 = 6-12 ay grubununki. Günlük programla tam örtüşüyor. Müşteriye sorulmayacak. Bkz. Bölüm 6.2 ve 6.6.

3a. **v1'de olup v2'de kaybolanlar bilerek mi kaldırıldı?** Tek tek sorulacak, çünkü her biri bir SEO sayfası ve bir form seçeneği demek:
   - **Doğa ve Duyusal Keşif Atölyesi** (2-4 yaş, İngilizce) programdan çıktı mı, yoksa yazılmayı mı unuttu? Adı iyi, arama hacmi olan bir atölye; kalkmışsa siteye hiç girmez.
   - **36+ ay grubu** (Prş + Cuma 13.00-15.00) kapandı mı? Kapandıysa 3-5 yaş çocuğun tek düzenli seçeneği Okula Hazırlık Grubu oluyor, sitede bunu böyle anlatırız.
   - ~~**Cumartesi** tamamen kapalı mı?~~ **ÇÖZÜLDÜ:** Cumartesi artık dolu, Pazar kapalı. Bkz. Bölüm 6.1.
   - **Oyunlarla Matematik'in Türkçe seansı** kalktı mı? v2'de atölyenin yalnız İngilizce hali var.

3b. **Gelişim Odaklı Oyun Grubu hangi dilde işliyor?** v1 gün gün yazıyordu (bir gün Türkçe bir gün İngilizce), v2 hiç yazmıyor, yerine "1 gün İngilizce hediye" var. İkisi aynı şey mi, yoksa dönüşümlü yapı kaldırılıp yerine hediye seans mı kondu? Sitenin dil iddiası buna bağlı.

4. **KDV dahil mi?** Excel'de yazmıyor. Şimdilik çıplak yazılıyor.

5. **Atölye açıklamaları.** Her atölyenin ne yaptığı, hangi gelişim alanını desteklediği. Kurumdan alınacak, uydurulmayacak.

6. ~~**Öğretmen bilgileri.**~~ **GELDİ, 16 Ağustos 2026.** Üçünün de portresi ve kendi kalemlerinden özgeçmişi geldi. Ayrıntı için Bölüm 21.
   - ✅ **Emine Yıldız Keleş**, Okul Öncesi Öğretmeni, Anadolu Üniversitesi Okul Öncesi Öğretmenliği (2022)
   - ✅ **Burcu Erışık**, İngilizce Öğretmeni, Ankara Üniversitesi İngiliz Dili ve Edebiyatı
   - ✅ **Dilara Özcan**, Atölye Öğretmeni, Başkent Üniversitesi Çocuk Gelişimi
   - ⚠️ **Unvanlar metinden çıkarıldı, kurum vermedi.** Emine ve Burcu kendi metinlerinde mesleklerini söylüyor. Dilara için "Atölye Öğretmeni" kullanıldı: kendi metninde atölyeleri planlayıp yürüttüğünü yazıyor, ama Çocuk Gelişimi mezunu için kurumun resmî unvanı farklı olabilir. **Teyit edilmeli.**
   - ⏳ Hâlâ eksik: kurumda kaç yıldır çalıştıkları (yalnız Dilara "bir yılı aşkın" diyor), varsa sertifikalar.

7. ~~**Mekân fotoğrafları.**~~ **GELDİ, 16 Ağustos 2026.** Yirmi kare, düzenlenmiş ve alt metinleri yazılmış halde: `D:\Abow Creative\Bambola\Bambola_Web_Fotograf_Paketi`. Site paketten `npm run foto` ile besleniyor, dosyalar elle kopyalanmıyor. Ayrıntı için Bölüm 17.
   - ⚠️ **Kareler oyun evine ait, anaokuluna değil.** Teras karesinde kapı numarası (2/A) görünüyor, yön tabelasında "OYUN MERKEZİ / ATÖLYELER / OKULA HAZIRLIK GURUPLARI" yazıyor. Anaokulu ise bu sene açılıyor ve planda 8 kat, 160 kapasite, teleskop, laboratuvar diye ayrı anlatılıyor. Bu yüzden `/anaokulu` sayfasındaki şerit "Aşağıdaki kareler faal oyun evimizden" diye açıkça etiketlendi. **Teyit gerekiyor:** anaokulu aynı binada mı, ayrı bir binada mı? Aynı binaysa etiket yumuşatılır; ayrıysa anaokulunun kendi fotoğrafları çekilene kadar bu haliyle kalır.
   - ⏳ Hâlâ eksik: çocukların içinde olduğu kareler (izin gerektirir), bir de anaokulu katları.

8. **Logo dosyaları, kısmen çözüldü.** *(10 Ağustos 2026)*
   - ✅ **Yeşil logo hazır.** `LOGO BAMBOLA.pdf` gerçek vektörmüş. `marka/bambola-kids-zone.svg` olarak çıkarıldı, yayına uygun. Header, footer, favicon ve OG bununla yapılır.
   - ⚠️ **Mor logolar hâlâ eksik.** İki Kibar logosu 1024px JPEG rasteri. Wordmark çevresinde görünür sıkışma halesi var ve wordmark oradaki kum rengi yerine soluk lila okuyor. **En fazla 128px kullanılabilir**, anaokulu sayfasının hero'sunda kullanılamaz. Vektör (AI, EPS veya SVG) hali istenmeli.
   - 🆕 **BAMBOLA'sız anaokulu amblemi geldi.** *(11 Ağustos 2026)* `LOGO KİBAR ÇOCUKLAR ANAOKULU BAMBOLASIZ.pdf`. Yine vektör değil: 1024px CMYK JPEG + saydamlık maskesi. Wordmark kalktığı için o baskı halesi de gitti, temiz. 19mm'ye kadar rahat basılıyor, 512px çalışma kopyası çıkarıldı. **Vektör hali hâlâ istenmeli**, hero'da yine kullanılamaz.
     - ⚠️ **Maske tuzağı:** PDF'in SMask'ı kum rengi harfleri ve piktogramı da deliyor; tasarım onları arkadaki kum zemine oyuk bırakmış. Maske olduğu gibi uygulanırsa beyaz kâğıtta harfler beyaz çıkar ve logo okunmaz olur. Doğrusu: yalnız **dış** çerçeveyi (kenardan taşan bağlı saydam bölge) delip iç oyukları `#D8C09A` ile doldurmak. Oyun merkezi logosunun BAMBOLA'sız hali gelirse aynı işlem gerekir.
   - ⏳ **Oyun merkezi logosunun BAMBOLA'sız hali bekleniyor.** Üyelik formu şu an anaokulu amblemini taşıyor ama başlığında "Kibar Çocuk Etkinlik ve Oyun Merkezi" yazıyor. Müşteri 11 Ağustos 2026'da bu uyumsuzluğun şimdilik böyle kalmasını onayladı; doğru amblem gelince değiştirilir.

9. **Kurumsal bilgiler, kısmen geldi.** *(10 Ağustos 2026, kurumun kendi afişlerinden okundu ve  dosyasına işlendi.)*
   - ✅ Telefon: 0542 641 66 08
   - ✅ Instagram: bambolaoyunvepartievi
   - ✅ Adres: Osmantemiz Mah. 1022. Cad, Dikmen Cd. No: 2/A, 06450 Çankaya/Ankara *(16 Ağustos 2026'da müşterinin verdiği tam hâl. Posta kodu ilk kez burada geldi.)*
   - ✅ ~~**Dikmen mi Çankaya mı?**~~ **ÇÖZÜLDÜ, 16 Ağustos 2026.** İkisi aynı türden bilgi değilmiş: **Dikmen bir cadde adı** (Dikmen Caddesi), **ilçe Çankaya**. Afişlerdeki "Dikmen, Ankara" kısaltması bu ikisini birbirine karıştırıyordu, eski adres satırı da ("No: 2/A Dikmen, Çankaya, Ankara") aynı karışıklığı taşıyordu. Site ilçe olarak Çankaya kullanmaya devam ediyor; "Dikmen" artık cadde satırının içinde geçiyor.
   - ⏳ Hâlâ eksik: e-posta, WhatsApp hattının ayrı numarası olup olmadığı, vergi bilgileri (KVKK metni için), çalışma saatleri.
   - ✅ **Google Business Profile kaydı geldi, 16 Ağustos 2026.** Bkz. Bölüm 22.
     - Google'daki işletme adı: **BAMBOLA OYUN VE PARTİ EVİ**
     - Koordinat: `39.8739282, 32.8394536`
     - Yer kimliği (CID): `0x14d345307d4a48a3:0x8b53e3ff4f4bbcba`
   - ✅ ~~**NAP uyuşmazlığı.**~~ **ÇÖZÜLDÜ, 16 Ağustos 2026. Müşteri (c) şıkkını seçti.** Google kaydı "Bambola Oyun ve Parti Evi", site tüzel adı "Kibar Çocuk Etkinlik ve Oyun Merkezi" yazıyordu; iki ad birbirini tutmadığı için yerel SEO bölünüyordu. Karar: **ikisi birden**, Google'daki ad önde, tüzel ad parantez içinde &mdash; `Bambola Oyun ve Parti Evi (Kibar Çocuk Etkinlik ve Oyun Merkezi)`.

     Gerekçe: (a) Google kaydının adını değiştirmek oturmuş sinyalleri ve kayıtlı yorumları riske atardı; (b) tüzel adı büsbütün gizlemek KVKK metni ve MEB ruhsatıyla uyumsuz kalırdı. (c) ikisini de doğru bırakıyor.

     Uygulaması `napAdi()` fonksiyonunda, tek yerde. Footer NAP'ı ve schema bunu kullanıyor; elle yazılmıyor, bkz. Bölüm 22.

10. **Domain.** Hangi alan adı kullanılacak, kime ait, DNS erişimi kimde?

11. **Parti ve doğum günü paketleri.** Excel'de yok. Fiyat ve kapsam bilgisi gerekiyor. Gelmezse `/parti` sayfası fiyatsız tanıtım + talep formu olarak çıkar.

12. **Anaokulu bilgileri.** Ücret, kayıt takvimi, kontenjan, program yapısı. Gelmezse `/anaokulu` tanıtım + ön kayıt formu olarak çıkar, ücret bölümü açılmaz.

13. ~~**Atölyelerin tek seferlik katılım ücreti kaç TL?**~~ **ÇÖZÜLDÜ, 10 Ağustos 2026.** Müşteri kuralı verdi: **tek seferlik atölye ücreti seansın diline göre belirlenir. İngilizce seans 2.500 TL, Türkçe seans 2.000 TL.** Bu, ücret sayfasındaki aile fiyatlarıyla da tutarlı.  içindeki  fonksiyonuna işlendi, "ücreti telefonda paylaşıyoruz" ifadesi her yerden kaldırıldı.

15. ~~**Resmi adda "Oyun Evi" mi "Oyun Merkezi" mi?**~~ **ÇÖZÜLDÜ, 10 Ağustos 2026: Oyun Merkezi.** Resmi ad **Kibar Çocuk Etkinlik ve Oyun Merkezi**. Mor amblemin halkasındaki yazıyla da birebir uyuyor. Fiyat listesinde bu amblem kullanılıyor, çünkü yeşil amblemin halkasında müşterinin istemediği "Kids Zone & Party House" ifadesi geçiyor.

16. **Amblem kararı: yeşil logo.** *(10 Ağustos 2026.)* Fiyat listesinde ve sitede **yeşil Bambola amblemi** kullanılır. Gerçek vektör olduğu için baskıda kusursuz ve marka rengiyle uyumlu. Halkasında "Kids Zone & Party House" geçiyor ama müşterinin isteği o ifadenin **yazılı satır** olarak kullanılmamasıydı; o satır kaldırıldı, yerine resmi ad yazılıyor. Mor Kibar amblemi denendi ve reddedildi: sayfanın renginden kopuyor. Yeşile boyanmış Kibar sürümü de üretildi ama logonun rengini değiştirmek olacağı için kullanılmadı.

 *(10 Ağustos 2026'da eklendi, logolardan çıktı.)* Logolar tüzel adın **Kibar** olduğunu gösteriyor: "Kibar Çocuk Etkinlik ve Oyun Merkezi" ve "Kibar Çocuklar Anaokulu". Plan boyunca ise "Bambola Oyun Evi" ve "Bambola Anaokulu" yazıyor.
   **Öneri:** Bambola ticari marka olarak H1'lerde ve site metninde kullanılır, Kibar adları footer NAP'ında, KVKK metninde ve schema `legalName` alanında birebir geçer. Böylece hem marka hem yerel SEO tutarlılığı korunur. Karar bu şekilde uygulanır, aksi bildirilirse tek dosyadan döner. Bkz. Bölüm 2, Marka mimarisi.
   Bu madde **2. maddeyle birlikte** sorulur: MEB belgesi hangi ada düzenlendiyse sitedeki ad kurgusu ona göre kesinleşir.

---

## 15. Üretilen belgeler

Müşteriye giden belgeler `docs/` altında. Hepsi **tek komutla** yeniden üretilir:

```
npm run belge        # HTML üret + Chrome ile PDF/PNG bas
```

Ara adımlar: `belge:pdf` (fiyat listeleri ve form), `belge:sosyal` (postlar), `bas` (baskı). Rakamlar ve metinler `src/lib/data` içinden okunur, belgeye elle yazılmaz. Revizyon geldiğinde veri dosyası değişir, belge kendini günceller.

| Dosya | Ne | Ölçü |
|---|---|---|
| `fiyat-listesi-grup.pdf` | Fiyatlar programa göre | A4, 2 sayfa |
| `fiyat-listesi-yas.pdf` | Fiyatlar yaşa göre, 5 bant | A4, 3 sayfa |
| `uyelik-formu.pdf` | Elle doldurulan üyelik formu | A4, 1 sayfa |
| `sosyal/meb.png` | MEB'e bağlılık | 1080×1350 |
| `sosyal/kucuk-gruplar.png` | Grup mevcudu 8 / 12 | 1080×1350 |
| `sosyal/guvenli-ayrilma.png` | Anneden ayrılma, üç basamak | 1080×1350 |
| `sosyal/gun-akisi.png` | Bir günün akışı | 1080×1350 |
| `sosyal/cumartesi.png` | Cumartesi programı | 1080×1350 |
| `sosyal/erken-kayit.png` | Erken kayıt %20 | 1080×1350 |

### Sosyal postların kuralı

**Postlarda fiyat yazmaz.** Paketleri anlatır, rakamı DM'e ve fiyat listesine bırakır. Tasarım dili kurumun mevcut afişlerinden alındı: krem zemin, sol üstte yeşil organik biçim, kesikli beyaz kontur, yuvarlak iki tonlu başlık, kehribar rozet, altta yeşil iletişim şeridi.

`scripts/bas.ts` her postta **geometrik taşma kontrolü** yapar: son içerik bloğunun altı alt şeridin üstünü geçerse komut hata verir. Bu kontrol gözle bulunmayan üç hatayı yakaladı, yeni post eklenirken de yakalayacak.

### Yaş bantları ve grup yerleşimi

Yaş sürümünün beş bandı: **6-12 ay · 12-24 ay · 16-24 ay · 24-36 ay · 30+ ay**. Bir grup bir banda üç kuraldan biriyle girer:

1. Saatleri yaş önekli ise (Bebek, Gelişim Odaklı) — sadece kendi önekinin bandına, sadece o saatlerle.
2. Saatleri öneksiz ama grubun kendi `yasEtiket`'i bir bant adına birebir uyuyorsa (Okula Hazırlık `30+ ay`, İngilizce `24-36 ay`) — sadece o banda.
3. Hiçbiri değilse ay kesişimi.

2. kural 10 Ağustos 2026'da eklendi (*"okula hazırlık grubu 30+ ay olarak değişebilir miyiz"*). Öncesinde bant listesinde `3-5 yaş` vardı ve Okula Hazırlık (30-72 ay) ay kesişimiyle hem `24-36 ay` hem `3-5 yaş` bloğunda çıkıyordu — aynı kart iki kez. `3-5 yaş` bandı `30+ ay` ile değiştirildi, grup sürümündeki rozetle de aynı oldu.

### Yaş önekli notlar

Yaş sürümünde bir blok, yalnızca **kendi yaşına ait** saatleri ve notları gösterir. Kural basit: metin bir yaş etiketiyle başlıyorsa (`"12-24 ay ..."`) sadece o bantta görünür, öneksizse her bantta.

Örnek: *"12-24 ay gruplarında iki katılım sağlayan her çocuğumuz için İngilizce oyun grubu hediyedir."* Bebek Oyun Grubu 6-24 ay, ama İngilizce işlenen en küçük seans 12 ayda başlıyor (Şarkılı Masal ve Sanat, İngilizce). Öneksiz yazılsaydı 6-12 ay bloğunda tutulamayacak bir söz verilmiş olurdu. Grup sürümünde aynı cümle Bebek kartında yaş nitelemesiyle duruyor, orada doğru okunuyor.

### Haftalık yük rozeti

`ProgramAilesi.sure` alanı haftalık yükü tek satırda taşır: Okula Hazırlık *"Haftada 3 gün · Günde 3 saat"*, diğerleri *"Haftada 2 gün · Günde 2 saat"*, Bebek *"Haftada 1-2 gün · Günde 2 saat"*.

10 Ağustos 2026 müşteri isteği: *"okula hazırlık grupları için 3 gün 3 saat diye yazalım büyük"*. Bilgi daha önce `ozet` cümlesi ve `ozellikler` listesi içinde dağınık duruyordu. Kendi alanına alındı, iki fiyat listesinde de koyu yeşil dolu rozet olarak basılıyor (koyu kartta kehribar). `ozet` cümlelerinden süre ifadesi çıkarıldı ki aynı bilgi iki kez yazılmasın; kaybolmaması için rozet ana sayfa, oyun evi, ücret tablosu ve kayıt formu kartlarına da eklendi.

### PDF'lerde sayfa taşması

`bas.ts` her `.sayfa` kutusunu ölçer, A4'ü (297mm) aşan varsa hata verir.

Bu kontrol gerçek bir hatadan doğdu: 16-24 ay bandı eklenince yaş sürümünün ilk sayfası 346mm'ye çıktı. **Ekran görüntüsü sorunu göstermiyordu** — eleman fotoğrafı kutuyu bütün hâlde çekiyor, oysa baskıda blok ortadan ikiye bölünüyordu. Yalnızca ölçüm yakalayabilir.

Ölçülen yükseklikler (sayfa başına kullanılabilir alan 287mm):

| Blok | Yükseklik |
|---|---|
| Üst blok (başlık + MEB + kampanya) | 43mm |
| 6-12 ay / 12-24 ay | 63mm |
| 16-24 ay | 68mm |
| 24-36 ay | 87mm |
| 3-5 yaş | 71mm |
| Atölyeler | 83mm |
| Koşullar | 48mm |
| İletişim şeridi | 20mm |
| Devam sayfası başlığı | 14mm |

Yaş sürümünün üç sayfası: **1)** üst + 6-12 + 12-24 + 16-24 (246mm) · **2)** 24-36 + 3-5 yaş · **3)** atölyeler + koşullar + şerit. İlk sayfadaki dört blok müşteri kuralını da karşılıyor: 16-24 ay, 12-24 ay ile aynı sayfada.

Devam sayfalarında büyük üst blok tekrarlanmaz; 14mm'lik ince bir başlık amblem, kurum adı ve "Sayfa 2 / 3" taşır.

### Üyelik formunda yapılan hukuki düzeltme

Kurumun elindeki Word formunda 3. madde şuydu: veliler çocuklarının fotoğraf ve videolarının çekilmesini **"en baştan kabul eder"** ve sosyal medyada **"süresiz olarak"** kullanılmasına izin verir.

Bu KVKK açısından riskli. Açık rıza belirli, bilgilendirilmiş ve özgür iradeyle verilmiş olmalı; hizmetin şartı hâline getirilemez ve süresiz kapsamla alınamaz. Madde kurallardan çıkarıldı, formun altında **ayrı ve isteğe bağlı** onay kutusuna taşındı. Veli işaretlemezse üyeliği etkilenmiyor, izni sonradan geri alabileceği de yazıyor.

Aynı bölümde iki onay kutusu daha var: aydınlatma metni (zorunlu) ve ticari ileti izni (isteğe bağlı).

> ⚠️ Formdaki son madde ("yaralanma ya da genel olumsuz durumlardan işletme sorumlu değildir") olduğu gibi bırakıldı. Bu tür genel sorumsuzluk kayıtları, işletmenin kendi kusurundan doğan zararlar için Türk hukukunda çoğunlukla geçersiz sayılır. Metin kurumun kendi metni olduğu için değiştirilmedi, ancak hukukçuya gösterilmesi önerilir.

---

## 16. Notlar

- Abow tarafındaki mevcut Bambola çalışmaları referans olarak duruyor: `/rapor/bambola` (12 aylık büyüme planı sunumu) ve `/bambola-oyun-evi-plan` (Ağustos-Eylül içerik takvimi). İkisi de `D:\web projeleri\abow-creative` deposunda. Marka dili ve konumlandırma oradan taşınıyor, kod taşınmıyor.
- İçerik takvimi 10 Ağustos'ta erken kayıt duyurusuyla başlıyor. **Site o duyurudan önce ayakta olmalı**, yoksa "kap olmadan çağrı yapılmaz" kuralı çiğnenir.
- Git: iş bitince commit ve push yapılır, Vercel otomatik deploy eder.

---

## 17. Mekân fotoğrafları

*(16 Ağustos 2026'da eklendi. Bölüm 14 madde 7'nin çözülmesiyle açıldı.)*

### Kaynak ve boru hattı

Kaynak paket depoda **durmuyor**, yüzlerce MB PNG taşımanın anlamı yok:

```
D:\Abow Creative\Bambola\Bambola_Web_Fotograf_Paketi
  01_Duzenlenmis_Ana_Fotograflar\        20 kare, 1086x1448 dikey PNG
  02_Web_Olculeri\01_Galeri_1600x1200\   10 karenin 4:3 yatay hali
  02_Web_Olculeri\02_Kapak_1920x1080\     5 karenin 16:9 geniş hali
  ALT_METIN_ONERILERI.txt                20 karenin alt metni
```

Site `public/foto/` altından besleniyor ve o klasör **tek komutla** üretiliyor:

```
npm run foto      # scripts/foto-hazirla.ts
```

Betik her çalıştığında `public/foto/` klasörünü siler ve yeniden yazar; silinen bir kare artık dosya bırakmaz. Yatay hali olan kare yatay halinden üretilir (hem daha geniş kadraj hem daha yüksek çözünürlük), olmayan dikey PNG'sinden. 25 dosya, toplam ~5 MB, JPEG kalite 82. Kaynak paketin yolu `FOTO_KAYNAK` ortam değişkeniyle değiştirilebilir.

**Kırpma yapılmaz.** Her yerleşim kendi oranını `object-cover` ile alır, `next/image` WebP'ye çevirip ölçekleri üretir.

### Veri ve bileşenler

| Dosya | Ne yapar |
|---|---|
| `src/lib/data/fotograflar.ts` | 20 karenin slug, alt metin, gerçek en/boy ve alan bilgisi. `foto()`, `fotolar()`, `alanFotograflari()` |
| `src/components/site/foto.tsx` | `Foto` ve `FotoKart`. Oran, köşe ve yüklenme davranışı tek yerden |
| `src/components/site/mekan-seridi.tsx` | `MekanSeridi` (üç kare + `/mekan` bağlantısı) ve `MekanKutusu` |

Alt metinler kurumun kendi `ALT_METIN_ONERILERI.txt` dosyasından birebir alındı, uydurulmadı. `en`/`boy` gerçek dosya ölçüleri; `next/image` bunları layout shift'i önlemek için kullanıyor, tahminle doldurulmaz.

### Ana sayfa hero'su

*(16 Ağustos 2026'da değişti.)* Hero'daki büyük logo dairesi yerini **dönen mekân fotoğrafına** bıraktı: `src/components/site/hero-fotograf.tsx`. Beş kare 4,5 saniyede bir çapraz geçişle değişiyor, maske organik bir biçim ve 26 saniyede yavaşça şekil değiştiriyor.

Kesikli lime halka, kum renkli şerit ve fotoğraf maskesi **aynı şekil dizisini aynı sürede** geziyor. Halka daire bırakılsaydı organik maske dışına taşardı; üçü birlikte morflandığı için aralarındaki boşluk her an eşit kalıyor.

Logo hero'dan tamamen kalkmadı: sol üstte küçük bir yuvarlak rozet olarak duruyor. Zaten header'da ve footer'da da var.

`prefers-reduced-motion` açıksa geçiş de, şekil morfu da, otomatik ilerleme de kapanır; tek kare sabit durur (Bölüm 11, Hareket sınırları).

### Nereye kondu

| Yer | Ne |
|---|---|
| `/mekan` | Tam galeri. Beş alan, 20 kare, `ImageGallery` schema'sı |
| `/` | Hero'daki dönen maskeli kare + mekân şeridi, takvimin altında |
| `/oyun-evi` | Mekân şeridi, atölyelerin altında |
| `/parti` | Teras karesi (21:9 kapak) + parti mekânı şeridi |
| `/anaokulu` | Şerit, **"faal oyun evimizden" etiketiyle** (Bölüm 14 madde 7'deki uyarı) |
| `/hakkimizda` | Yön tabelası + iki kare |
| `/iletisim` | Bina cephesi, kapı numarası karede görünüyor |
| `/oyun-evi/programlar/[slug]`, `/oyun-evi/yas/[slug]` | Mekân şeridi |
| `schema.org` | `kurumSemasi().image` artık logo değil, üç gerçek kare |

### Üç kural

1. **Fotoğrafa iddia yüklenmez.** Hangi grubun hangi odada işlendiği kurumdan teyit edilmedi, o yüzden hiçbir yerde "bu program bu odada" denmiyor. Şerit mekânı tanıtır, ayrıntıyı `/mekan`'a bırakır.
2. **`/mekan` yerleşimi elle kurgulanmıştır, otomatik değil.** Sayfa `src/app/mekan/page.tsx` içindeki `BOLUMLER` dizisinden çıkar: her bölümün numarası, girişi, olguları ve **satırları** orada yazılıdır. Satırlar 21:9 oranında sabittir, içindeki kutuların genişliği `2 | 3 | 4` birimdir (6 birimlik ızgara).
   Kutu genişliği kaynağın yönüne göre seçilir: 21:9 bir satırda 4 birimlik kutu yatay, 2 birimlik kutu dikey çıkar. Yatay çekilmiş kareler geniş kutulara, dikey çekilmişler dar kutulara konur; böylece kırpma en aza iner.
   Yeni bir kare eklenip yerleşime konmazsa sayfa **derleme anında hata verir**, sessizce kaybolmaz.
3. **Kare altlarında açıklama yazmaz.** Her karenin altına alt metnini basmak denendi ve geri alındı: yirmi açıklamanın yirmisi de "Bambola ..." diye başlıyordu, sayfa dağınık görünüyordu. Alt metinler `alt` özniteliğinde ve `ImageGallery` schema'sında duruyor; anlatım bölüm girişlerine toplandı.

### `/mekan`'da denenip vazgeçilenler

- **Masonry (sütun akışı).** Kareleri sığdırıyordu ama hiçbir kare diğerinden önemli değildi ve sütunlar farklı yüksekliklerde bitiyordu; sayfa kurgusuz görünüyordu. Yerine sabit oranlı satırlar geldi, artık her bölümde bir "baş kare" var.
- **Eşit yükseklikli düz ızgara.** Paketin yarısı yatay yarısı dikey olduğu için ya kadrajı kırpıyor ya satırlarda boşluk bırakıyordu.

---

## 18. Haftalık takvimin masaüstü görünümü

*(16 Ağustos 2026'da yeniden yazıldı.)*

**Önceki hali yedi bağımsız sütundu** ve her sütun kendi kartlarını üst üste diziyordu. Sonuç: aynı saat farklı günlerde farklı yüksekliğe denk geliyordu, "Ara" şeridi her sütunda başka yerde duruyordu, sütunlar dar olduğu için `09.30 - 12.30` ve `Gelişim Odaklı Oyun` gibi metinler üçe bölünüyordu. Tablo gibi değil, yan yana yedi liste gibi okunuyordu.

**Şimdi tek bir CSS ızgarası var:** satırlar saat aralığı, sütunlar gün. `14.00 - 16.00` hangi günde olursa olsun aynı satırda. Veli bir satırı tarayıp "bu saat hangi günler var" sorusunu bir bakışta cevaplıyor.

Bunun getirdiği üç şey:

1. **Saat karttan çıktı**, satır başlığına taşındı. Kartlar bir satır kısaldı ve daraldı.
2. **"Öğle arası" şeridi tüm ızgarayı bir kez geçiyor**, sütun başına bir kez değil. Sabah aralıklarının bittiği yere giriyor.
3. **Pazar sütunu düştü.** Boş bir sütun ızgaranın yedide birini yiyordu; Pazar notu artık tablonun altında tek satır. Veriye bağlı: Pazar'a program eklenirse sütun kendiliğinden geri gelir.

Satırlar **süzgeçten geçen** slotlardan üretiliyor, yani yaş süzgeci bir aralığı tamamen boşaltırsa o satır hiç çizilmiyor. `6-12 ay` seçildiğinde tablo iki satıra iniyor.

Kartlar `h-full` değil `block`: satırın en uzun hücresi kadar uzamıyorlar. Uzasalardı tek kartlı satırlarda rozetlerle öğretmen adı arasında açıkta boşluk kalırdı.

**Mobil görünüm değişmedi:** gün seçici + tek gün listesi zaten iyi çalışıyordu.

---

## 19. Kampanya penceresi takvime bağlandı

*(16 Ağustos 2026.)*

**Bulunan hata:** `KAMPANYA_PENCERESI` verisi (`bitis: "2026-09-01"`) `lib/data/ucretler.ts` içinde duruyordu ama **hiçbir yerde okunmuyordu**. Ana sayfa hero'sundaki *"Erken kayıt, son gün 1 Eylül"* rozeti düz yazıydı; `indirimVarMi()` ise yalnız iki rakamı karşılaştırıyordu (`erkenKayit < normal`), tarihe hiç bakmıyordu.

Sonuç: **1 Eylül 2026'dan sonra site indirimli fiyatı göstermeye ve geçmiş bir tarihi "son gün" diye ilan etmeye süresiz devam edecekti.** İlan edilen fiyat parayla ilgili olduğu için bunun elle kaldırılmasına bırakılması kabul edilemezdi.

### Çözüm

`ucretler.ts` içinde üç fonksiyon:

| Fonksiyon | Ne yapar |
|---|---|
| `kampanyaAcikMi(simdi?)` | Pencere şu an açık mı. Türkiye saatiyle (UTC+3) hesaplar |
| `erkenKayitGosterilirMi(paket, acik)` | Bu paketin indirimli fiyatı **şu an** gösterilir mi |
| `gecerliFiyat(paket, acik)` | Paketin şu an geçerli fiyatı |

`indirimVarMi()` duruyor ama artık yalnız "bu pakette indirim tanımlı mı" sorusunu yanıtlıyor; ekranda fiyat basan hiçbir yer onu tek başına kullanmıyor.

**Son gün dahil:** kampanya 2 Eylül 00:00'da (TR) kapanır. Saat dilimi açıkça yazılı, çünkü sunucu UTC'de koşuyor ve gün dönümü üç saat kayık olsaydı kampanya yanlış günde açılıp kapanırdı.

### Değer nereden geliyor

Sunucu bileşenleri `kampanyaAcikMi()`'yi doğrudan çağırır. İstemci bileşenlerine **prop olarak** geçirilir; istemcide ayrıca hesaplansaydı, sayfa önbellekten gelirken sunucu "açık" istemci "kapalı" diyebilir ve hydration uyuşmazlığı çıkardı.

**Tek istisna kayıt formu.** O bileşen `ssr: false` ile yükleniyor (bkz. `kayit-formu-yukleyici.tsx`), yani sunucu render'ı hiç yok ve uyuşmazlık mümkün değil. Orada değer istemcide, lazy state içinde hesaplanıyor — üstelik daha doğru: sayfa önbelleğe girdiği an değil, velinin formu açtığı an.

### ISR

Etkilenen statik rotalara `export const revalidate = 3600` eklendi: `/`, `/oyun-evi/ucretler`, `/oyun-evi/programlar/[slug]`, `/oyun-evi/yas/[slug]`. Aksi halde derleme anındaki durum yayında donardı.

### Kampanya kapanınca ne oluyor

- Hero rozeti kalkar
- Ücret sayfasındaki lime şerit ve "Erken kayıt nasıl işliyor?" bölümü kalkar
- Üstü çizili fiyat ve "yüzde 20 indirim" rozeti kalkar, normal fiyat yazılır
- Formdaki "Erken kayıt koşulları" kutusu kalkar
- `/api/kayit` kayda `erken_kayit_uygulandi: false` yazar

Ücret sayfasının metadata açıklamasından kampanya ibaresi **çıkarıldı**: metadata önbelleğe giriyor ve arama sonucunda uzun süre asılı kalabiliyor, süresi dolmuş bir indirim vaadiyle tıklanmak tıklanmamaktan kötü.

### Testler

`npm run test:veri` sınırları sınıyor: başlangıçtan önce kapalı, başlangıç günü açık, 1 Eylül 23.59 açık, 2 Eylül 00.00 kapalı, ertesi yıl kapalı. Ayrıca her paket için kampanya kapalıyken `gecerliFiyat` normal fiyatı dönmeli ve indirim rozeti gösterilmemeli. Toplam kontrol 201'den 242'ye çıktı.

---

## 20. OG kartı ve 404 sayfası

*(16 Ağustos 2026.)*

### OG kartı artık fotoğraflı

Önceki hali çizimdi: krem zemin, marka renginde daireler. İçerik takvimi erken kayıt duyurusuyla başlıyor (Bölüm 16) ve o duyuru WhatsApp ile Instagram'dan gidiyor; link paylaşıldığında velinin görmesi gereken şey mekânın kendisi.

Kart `public/foto/og-kapak.png` dosyasını okuyup **data URI olarak gömüyor**. `ImageResponse` derleme anında çalışıyor ve o sırada kendi sitemize HTTP isteği atacak bir sunucu yok; `/foto/...` gibi bir yol çözülmez.

Kapak karesi `npm run foto` tarafından 1200×630 olarak ayrıca üretiliyor. Sitedeki 4:3 ve 3:4 kareler bu orana uymuyor; kırpımı boru hattına bırakmak hem kadrajı kontrol altında tutuyor hem de kartın her üretimde aynı çıkmasını sağlıyor.

Üstüne soldan sağa koyulaşan bir geçiş konuyor. Fotoğraf parlak ve rengârenk; geçiş olmadan hiçbir metin rengi her karede okunmuyor.

> ⚠️ **Bu rota `next dev` altında 500 veriyor** ("Input buffer contains unsupported image format") ama `next build` sırasında sorunsuz üretiliyor. Kartı görmek için `npm run build` sonrası `.next/server/app/opengraph-image.body` dosyasına bakılır. Sorun kodda değil, dev sunucusunun görüntü işleme yolunda; görselsiz ve gradyansız sürüm de aynı hatayı veriyor.

**Satori tuzağı:** birden fazla çocuğu olan bir `div`'e açık `display` gerekiyor. `{a}, {b}` yazımı üç ayrı metin düğümü üretiyor ve üretim 500 ile düşüyor. Tek şablon dizesi (`{`${a}, ${b}`}`) olarak verilmeli. `z-index` de desteklenmiyor, uyarı basıyor; sıralama DOM sırasına bırakıldı.

### 404 sayfası

`src/app/not-found.tsx` eklendi. Öncesinde dosya yoktu ve yanlış bir linke gelen ziyaretçi Next'in çıplak sayfasını görüyordu: header, footer, kayıt formuna dönüş yolu, hiçbiri yoktu.

Sayfa kök layout içinde render edildiği için header ve footer duruyor. Ziyaretçiyi iki şeye çağırıyor: kayıt formu ya da aradığı bölüm (ana menü + `/mekan` bağlantıları). `robots: noindex`.

---

## 21. Ekip sayfası

*(16 Ağustos 2026. Bölüm 14 madde 6'nın çözülmesiyle açıldı.)*

### Metinler öğretmenlerin kendi kaleminden

Üç özgeçmiş de öğretmenlerin kendi yazdığı metinler. **Yeniden yazılmadı**, yalnızca paragraflara bölündü ve Emine'nin metnindeki tekrar eden başlık satırı (`Emine Yıldız Keleş` + hemen altında `Merhaba, ben Emine Yıldız Keleş.`) tekilleştirildi.

Gerekçe: kişinin kendi sözünü "iyileştirmek" onu başkasının sesine çevirir. Sayfanın değeri de tam olarak o seste. Unvan ve eğitim satırları da metinden doğrudan çıkan bilgiye dayanıyor, uydurulmadı.

### Neden uzun bırakıldı

Bu sayfa E-E-A-T için sitenin en değerli sayfası: kurumun iddiasını kimin taşıdığı burada görünüyor. Özgeçmişler kısaltılmadı, her öğretmen kendi bölümünde portresi ve künyesiyle duruyor, her biri için `Person` şeması basılıyor (`jobTitle`, `alumniOf`, `knowsAbout`, `worksFor`, `makesOffer`).

### Veri ve fotoğraf

`src/lib/data/ekip.ts`:

| Alan | Ne |
|---|---|
| `gorev` | **Kurum içindeki görev.** Emine Yıldız Keleş kurum müdürü *(müşteri, 16 Ağustos 2026)*. `unvan`dan ayrı bir alan: müdürlük mesleki unvanın yerine geçmiyor, üstüne biniyor. Ekip sayfasında adın üstünde rozet olarak duruyor, schema `jobTitle` alanına ikisi birden giriyor ve kurum şemasına `employee` olarak yazılıyor &mdash; kurumu kimin yönettiği E-E-A-T'nin doğrudan sinyali. Boş bırakılan öğretmen için hiçbir yerde bir şey görünmüyor |
| `ad` | **Excel'deki adla birebir aynı olmalı.** Haftalık programdaki `slot.ogretmenler[]` bununla eşleşiyor; soyad eklenirse eşleşme sessizce kopar |
| `soyad`, `unvan`, `egitim` | Künye |
| `ozet` | Bir cümle. Yalnız schema `description` alanında kullanılıyor |
| `ozgecmis` | Öğretmenin kendi metni, paragraf dizisi |
| `yaklasimlar` | Metinde **açıkça geçen** yöntemler. Çıkarım yapılmadı |
| `fotograf` | `public/ekip/<slug>.jpg` |

> **Müdür ders veriyor mu?** *(16 Ağustos 2026'da soruldu, takvime bakılarak kapandı.)* Kurum müdürü olduğu için Emine'nin ders vermiyor olabileceği düşünüldü. Takvim tersini söylüyor: **30 seansın 16'sında yazılı ve bunların 7'sinde tek başına** (Salı 10.00 ve 16.00, Çarşamba 10.00 ve 16.00, Perşembe 10.00 ve 15.00, Cuma 10.00). Minik Beyinler Laboratuvarı'nın tek öğretmeni de o. Karşılaştırma için Burcu 13, Dilara 13 seansta. Yani takvimdeki isim sütunu onun için de "dersi veren" anlamına geliyor, "sorumlu" değil. Görev alanı bu yüzden unvanın yanında duruyor, eğitmen listelerinden çıkarılmıyor.

Portreler `kaynak/ekip-fotograflari/` altındaki PNG'lerden `npm run foto` ile üretiliyor: 1080×1350, JPEG q84. Ham dosyalar bilerek `public/` dışında; üç portre 5,6 MB ve oldukları gibi yayına çıkmalarının anlamı yok. Üretilen hâl toplam 421 KB.

> Fotoğraflar ilk geldiğinde `public/Bambola_Ekip_Fotograflari_1080x1350/` içindeydi, yani ham PNG olarak yayına gidecekti. `kaynak/` altına taşındı; o klasör zaten kaynak Excel'lerin durduğu yer.

### Testler

`npm run test:veri` her öğretmen için soyad, unvan, eğitim, fotoğraf, özgeçmiş ve yaklaşımların dolu olduğunu; `public/ekip/<slug>.jpg` dosyasının gerçekten var olduğunu doğruluyor.

İki yönlü eşleşme de sınanıyor: ekipteki her adın programda en az bir seansı olmalı **ve** programda geçen her adın ekipte karşılığı olmalı. Bu ikinci kontrol, `ad` alanına soyad eklenmesi gibi sessiz bir hatayı anında yakalar.

Öğretmen metinleri ev üslubu denetimine (uzun tire, emoji) dahil edildi. Toplam kontrol 242'den **269'a** çıktı.

`EKIP_SAYFASI_HAZIR` bayrağı kaldırıldı: hiçbir yerde kullanılmıyordu ve aynı işi artık testler daha sıkı yapıyor.

---

## 22. Konum, harita ve yerel SEO

*(16 Ağustos 2026. Müşteri Google Maps kaydını paylaştı.)*

```
Ad         BAMBOLA OYUN VE PARTİ EVİ
Koordinat  39.8739282, 32.8394536
CID        0x14d345307d4a48a3:0x8b53e3ff4f4bbcba
```

Üçü de `ILETISIM` içinde: `googleAdi`, `konum`, `googlePlaceCid`.

### Gömülü harita açıldı

Daha önce "çalıştığı doğrulanamadı" gerekçesiyle kapatılmıştı. **O gerekçe yanlıştı.**

Ne olmuş: anahtarsız `output=embed` URL'i iframe içine konmuş, ekran görüntüsü alınmış, kutu boş çıkmış ve "çalışmıyor" sonucuna varılmıştı. Oysa boş çıkmasının sebebi haritanın bozuk olması değil, **headless tarayıcının harita döşemelerini boyayamamasıydı** &mdash; sayfadaki `whileInView` animasyonlarının ilk ekran görüntülerinde görünmemesiyle tam olarak aynı sınıf bir yanılgı.

Doğru test ekran görüntüsü değil, DOM: iframe'in içinde kaç harita döşemesi yüklendiğine bakmak. Bakıldığında 22 döşeme ve Türkçe arayüz metni ("Klavye kısayolları", "Harita verileri ©2026 Google") çıktı. Harita çalışıyor.

İki şey daha öğrenildi:
- URL **yalnızca iframe içinde** çalışır. Doğrudan açılınca `The Google Maps Embed API must be used in an iframe.` döner. "Çalışıyor mu" testi bu yüzden mutlaka iframe içinde yapılmalı.
- `maps/embed/v1/place` biçimi **401** döner, API anahtarı ister. Anahtarsız tek yol `output=embed`.

Haritaya adres metni değil **koordinat** veriliyor: adres araması yakındaki başka bir noktaya düşebiliyor, koordinat düşmez.

iframe `loading="lazy"`: Google Maps ağır ve üçüncü taraf çerez yüklüyor, sayfa açılır açılmaz değil ekrana girince yüklensin.

### `/iletisim` yerleşimi düzeltildi

*(16 Ağustos 2026, ekran görüntüsüyle bakıldığında görüldü.)*

Harita sağ sütunun içindeydi ve o sütunu tek başına uzatıyordu: sol sütun bittiği yerde altında birkaç yüz piksellik boş alan kalıyordu. Sayfa artık iki katmanlı:

```
[ İletişim bilgileri ]   [ Program saatleri ]     <- iki kısa sütun, yakın boyda
[ ————— ulaşım şeridi, tam genişlik ————— ]
[   harita 3/5   |  nasıl gelinir + bina cephesi 2/5  ]
```

Bina cephesi fotoğrafı da sol sütundan bu şeride taşındı: ulaşımla ilgili, "nerede" sorusuna cevap veren üç şey (harita, adres, kapı fotoğrafı) artık yan yana duruyor. Harita geniş ekranda `lg:h-full` ile satır yüksekliğini dolduruyor, yani yanındaki sütun neyse o boyda; sabit oran verilseydi arada yine boşluk kalırdı.

**"Haritada aç" butonu kaldırıldı.** Gömülü haritanın üzerine tıklamak zaten aynı yeri açıyordu; iki buton yan yana durunca hangisinin ne yaptığı da belirsizleşiyordu. Tek çağrı kaldı: **Yol tarifi al**. `haritadaAcBaglantisi()` duruyor, schema `hasMap` alanı onu kullanmaya devam ediyor.

Yeni yerleşimde harita yeniden sınandı (aynı DOM yöntemi): iframe kutusu 660×506, sekiz döşeme yüklü, çerçevede Türkçe arayüz metni var.

> ⚠️ Gömülü harita üçüncü taraf çerez yüklüyor. KVKK metni çerez kullanımından söz etmiyor; hukukçuya gösterilirken bu da sorulmalı.

### Yol tarifi artık kayda bağlı

`yolTarifiBaglantisi()` adres metni yerine **yer kimliğini** kullanıyor. Adres araması yakındaki başka bir işletmeye düşebilir; kayıt kimliği doğrudan işletmenin kendi kartını açar.

### İşletme adı: ikisi birden

Müşteri 16 Ağustos 2026'da kararı verdi (Bölüm 14 madde 9, **(c)** şıkkı): NAP adı Google kaydındaki adı taşır, tüzel ad parantez içinde onu izler.

```
Bambola Oyun ve Parti Evi (Kibar Çocuk Etkinlik ve Oyun Merkezi)
```

Neden ikisi birden: her biri başka bir yerde zorunlu. Google kaydıyla eşleşme yerel SEO'nun temeli; tüzel ad ise KVKK metninin ve MEB ruhsatının taşıdığı ad. Yalnız birini yazmak diğerini kırar.

Tek kaynak `napAdi()` (`src/lib/site.ts`). Footer NAP'ı bu fonksiyonu çağırıyor, elle yazmıyor. Şemada ise ayrışıyor:

| Alan | Değer |
|---|---|
| `name` | Bambola Oyun ve Parti Evi &larr; **Google kaydıyla birebir** |
| `legalName` | Kibar Çocuk Etkinlik ve Oyun Merkezi |
| `alternateName` | `["Bambola", "Kids Zone & Party House"]` |

Öncesinde `name` alanı kısa marka adını ("Bambola") taşıyordu. Arama motoru sitedeki kurumla Google kaydını bu alandan eşleştirdiği için oraya kayıttaki ad kondu; kısa marka adı `alternateName` içine taşındı, kaybolmadı.

### Kayıt kimlikleri ve `sameAs`

Müşterinin paylaştığı kısa bağlantı (`maps.app.goo.gl/…`) çözüldüğünde koordinat ve CID sitedekilerle birebir aynı çıktı. Kayıttan bir de **varlık kimliği** okundu: `/g/11lv4vtthv` (`googleVarlikId`). Şu an kullanılmıyor, kimliklerin en kalıcısı olduğu için saklanıyor.

`sameAs` alanına Instagram'ın yanına Google Maps kartı eklendi:

```
https://www.google.com/maps?cid=10039618680025496762
```

Bu, arama motoruna "sitedeki kurum ile şu Google kaydı aynı varlıktır" demenin en dolaysız yolu. Bağlantı `googleKartBaglantisi()` içinde CID'in ikinci parçasından **üretiliyor** (`?cid=` onaltılık değil ondalık bekliyor). Kısa bağlantı kullanılmadı: yönlendirme hedefi Google'ın elinde, `cid` ise kaydın kendi kimliği.

> Doğrulama notu: `?cid=` sayfası düz HTTP isteğine yer adını döndürmez, haritayı tarayıcıda kuruyor. Doğru kaydı açtığı `output=embed` hâli çekilerek doğrulandı; HTML içinde `BAMBOLA OYUN VE PARTİ EVİ` geçiyor.

### Adres parçalarından üretiliyor

Müşteri Google kaydındaki tam adresi verdi: `OSMANTEMİZ MAH. 1022. CAD, Dikmen Cd NO:2/A, 06450 Çankaya/Ankara`. İçinden iki yeni bilgi çıktı: **posta kodu 06450** ve **"Dikmen"in ilçe değil cadde adı olduğu** (bkz. Bölüm 14 madde 9).

`site.ts` artık tek bir adres dizesi tutmuyor:

| Alan | İçerik | Nerede |
|---|---|---|
| `adresSokak` | `Osmantemiz Mah. 1022. Cad, Dikmen Cd. No: 2/A` | schema `streetAddress` |
| `postaKodu` | `06450` | schema `postalCode` |
| `adres` | ikisinden + ilçe/il'den **üretilen** tek satır | footer NAP, `/iletisim`, KVKK |

Gerekçe iki tane. Birincisi, ilçe ve il şemada zaten `addressLocality` / `addressRegion` alanlarında duruyor; tek satırlık hâl `streetAddress`'e konsaydı üçü de iki kez geçerdi. İkincisi, gösterim satırı elle yazılsaydı bir gün sokak satırı değişip o satır eski hâlde kalabilirdi &mdash; NAP tutarsızlığı tam olarak böyle sessizce oluşur.

Google kayıtta büyük harf kullanıyor, site cümle düzeninde yazıyor. Bileşenler birebir aynı; NAP eşleşmesi için önemli olan da harf boyu değil bileşenler.

`npm run test:veri` bunu sınıyor: posta kodu beş haneli ve `06` ile başlıyor mu, gösterim satırı sokak + posta kodu + ilçe + il taşıyor mu, sokak satırı bunları tekrar ediyor mu. NAP adı da sınanıyor: hem Google'daki adı hem tüzel adı taşımalı, kart bağlantısı `?cid=<rakam>` biçiminde çözülmeli. İkisinden biri düştüğünde ekranda hiçbir şey bozulmaz, yalnız yerel SEO sessizce bölünür &mdash; testin sebebi bu. Toplam kontrol 269'dan **284'e** çıktı.

### schema.org

`kurumSemasi()` artık `geo` (GeoCoordinates) ve `hasMap` taşıyor. Koordinat, yerel sonuçlarda adres metninden daha güvenilir bir sinyal: "Osmantemiz Mah. 1022. Cad." gibi bir satırı Google yanlış noktaya bağlayabiliyor, enlem/boylam bağlamıyor.

---

## 23. Öğretmen rozetleri ve "kim veriyor" bölümü

*(16 Ağustos 2026.)*

Grup kartlarında programı kimin verdiği görünmüyordu. Ekip sayfası vardı ama sitenin geri kalanına hiç bağlanmıyordu: veli programı okuyor, öğretmeni ayrı bir sayfada bulmak zorunda kalıyordu.

### İki yerde birden

**Kartlarda rozet.** Ana sayfadaki grup kartları ve `/oyun-evi/programlar` listesindeki kartlar, o programı veren öğretmenlerin küçük yuvarlak portrelerini taşıyor. Her portre `/ekip#<slug>` adresine, yani öğretmenin kendi bölümüne gidiyor. Yanında adlar da yazıyor; portre tek başına kim olduğunu söylemiyor.

**Program sayfasında bölüm.** `/oyun-evi/programlar/<slug>` sayfalarına "Bu programı kim veriyor?" bölümü eklendi: portre, ad, unvan, bir cümlelik özet ve özgeçmişe bağlantı.

Özgeçmiş **metni burada tekrar edilmiyor**. Aynı metnin iki sayfada birden durması hem arama motoru için kötü hem de güncellemede birinin geride kalması demek. Tam metin tek yerde, `/ekip` sayfasında.

### Liste elle yazılmıyor

Hangi programı kimin verdiği ayrı bir listede tutulmuyor; **haftalık programdan çıkarılıyor** (`atolyeOgretmenleri`, `aileOgretmenleri`). Elle yazılan bir eşleşme, seansın öğretmeni değiştiğinde sessizce eskir. Sıra her zaman `EKIP` dizisinin sırası, böylece aynı kadro her kartta aynı sırada görünüyor.

### Kart artık bir bağlantı değil

Kartların tamamı `<Link>`ti. İçine tıklanabilir rozet konunca bu geçersiz HTML oluyor (bağlantı içinde bağlantı). Kart bir `<div>`e çevrildi; başlıktaki bağlantı `after:inset-0` ile kartın tamamını kaplıyor, rozetler de `z-10` ile onun üstünde duruyor. Kartın her yeri yine tıklanabilir, rozetler kendi hedefine gidiyor.

### Kendi seansı olmayan programlar

İki atölyenin takvimde kendi satırı yok, dolayısıyla öğretmen kaydı da yok:

| Atölye | Durum | Sayfada ne çıkıyor |
|---|---|---|
| Güvenli Ayrılma Programı | Okula Hazırlık Gruplarının içinde yürüyor | Ailenin kadrosu, "…kapsamında yürüyor. Grubu veren öğretmenler:" başlığıyla |
| Serbest Oyun Zamanı | Her grup gününün ilk saati, atanmış öğretmeni yok | Bölüm hiç açılmıyor |

Başlık metni bu ayrımı açıkça söylüyor; "bu programı şu kişi veriyor" diye okunmaması için.

### Testler

`npm run test:veri`: her program ailesinin en az bir öğretmeni olmalı ve rozette görünecek her öğretmenin fotoğrafı bulunmalı; ailenin kadrosu, o aileye bağlı atölyelerin kadrosunu kapsamalı. Bir de şu sınanıyor: **seansı olup öğretmeni olmayan tek atölye serbest oyun olmalı**. Başka bir program öğretmensiz kalırsa sayfadaki bölüm sessizce kaybolur, ekranda hata çıkmaz &mdash; testin sebebi tam olarak bu. Toplam kontrol 284'ten **307'ye** çıktı.

---

## 24. Yüzen WhatsApp butonu

*(16 Ağustos 2026.)*

Sağ altta, her sayfada duran yuvarlak WhatsApp butonu. `src/components/site/whatsapp-butonu.tsx`, kök layout'ta basılıyor.

**Numara yoksa buton hiç basılmıyor.** `whatsappBaglantisi()` null dönünce bileşen de null dönüyor &mdash; Bölüm 3 madde 5, "kap olmadan çağrı yapılmaz". Bağlantı hazır mesajla açılıyor: *"Merhaba, Bambola hakkında bilgi almak istiyorum."*

**`/kayit` sayfasında gizli.** Formun altında `sticky bottom-0` duran fiyat paneli var; toplam tutar ve gönder butonu orada. Yüzen buton tam onun üstüne geliyor ve telefonda gönder butonunu kapatıyordu. Veli zaten dönüşüm yolundayken ikinci bir kanal yardım etmiyor, engel oluyor. Gizlenecek yollar `GIZLI_YOLLAR` dizisinde.

**Rengi sitenin kendi yeşili**, WhatsApp'ın markasal yeşili değil: sayfada zaten yeşil bir dil var ve ikinci bir yeşil yamalı duruyordu. Buton ikonundan zaten tanınıyor.

Geniş ekranda üzerine gelince yanında etiket açılıyor; telefonda sürekli duran bir etiket ekranın altını kaplardı, orada yalnız ikon var.

### Kampanya balonu

Erken kayıt penceresi **açıkken** butonun üstünde bir mesaj balonu açılıyor: kurum logosu, "Erken kayıt indirimi", "Son gün 1 Eylül · N gün kaldı", aylık paketlerdeki indirim oranı ve **Detaylı bilgi al** düğmesi. Buton da tek bir nabız halkası kazanıyor. Pencere kapandığında bunların hepsi kendiliğinden kayboluyor; geriye sade WhatsApp butonu kalıyor.

Hazır mesaj da kampanyaya göre değişiyor: *"Merhaba, 1 Eylül'e kadar süren erken kayıt indirimi için bilgi almak istiyorum."* Veli ne soracağını yazmak zorunda kalmıyor, kurum da talebin nereden geldiğini görüyor.

**Metin veriden üretiliyor, elle yazılmıyor:** son gün `KAMPANYA_PENCERESI.sonGun`, oran `ERKEN_KAYIT_ORANI`, kalan gün `kampanyaKalanGun()`. "Aylık paketlerde" ifadesi de bilinçli: tek seferlik katılıma indirim uygulanmıyor (Bölüm 6.3), "her şeyde %20" demek yanlış olurdu.

`kampanyaAcik` ve `kalanGun` **sunucuda hesaplanıp prop olarak** geçiyor. İstemcide hesaplansaydı, sayfa önbellekten gelirken sunucu "açık" istemci "kapalı" diyebilir ve hydration uyuşmazlığı çıkardı &mdash; `ucretler.ts` içindeki uyarının aynısı.

### Açık başlıyor; telefonda şerit, masaüstünde kart

Balon **varsayılan olarak açık**. Kampanya mesajını görmek için kaydırmayı beklemek onu gereksiz saklıyordu.

Telefonda ise tam kart değil, **tek satırlık şerit** açık başlıyor: `🟢 Erken kayıt · son gün 1 Eylül →`. Sebebi ölçüldü &mdash; 390px ekranda tam kart hero'daki **"Çocuğuma uygun grubu bul"** butonunun üzerine oturuyor, yani sayfanın asıl çağrısını kapatan bir reklam kutusuna dönüşüyor. Şerit o butonların çok altında kalıyor; dokununca tam karta açılıyor. Kartın çağrıyı kapatması o noktada sorun değil, çünkü veli kendi açtı.

Masaüstünde yer bol, orada tam kart açık başlıyor.

Kapatılınca `sessionStorage`'a yazılıyor ve o oturumda bir daha açılmıyor; sitede gezerken her sayfada yeniden çıkması bunaltıcı olurdu. `localStorage` değil, çünkü bir sonraki ziyarette kampanya hatırlatması yeniden görünmeli.

> Tarayıcıda beş durum doğrulandı: masaüstü varsayılan (kart açık), telefon varsayılan (şerit açık, kart kapalı), telefonda genişletince, kapatınca, ve `/kayit` sayfasında hiçbirinin çıkmaması. Hero butonuyla çakışma da ölçülerek kontrol edildi.

> Footer'da da aynı `aria-label`'ı taşıyan bir WhatsApp bağlantısı var. Testler ikisini `data-wa-yuzen` işaretiyle ayırıyor &mdash; ilk kontrolde seçici footer'daki bağlantıyı yakalamış ve buton `/kayit` sayfasında da varmış gibi görünmüştü.

`npm run test:veri` numaranın `905XXXXXXXXX` biçiminde olduğunu doğruluyor. Yanlış yazılırsa bağlantı sessizce boş bir sohbet açar; hem bu buton hem footer aynı numaradan üretiliyor.

`kampanyaKalanGun()` sınırlarıyla birlikte sınanıyor: 1 Eylül günü **1**, 31 Ağustos'ta **2**, 2 Eylül'de ve kampanya başlamadan **0**. Ekranda "N gün kaldı" diye yazılan bir sayı bu; bir gün kayarsa kimse fark etmez.

---

## 25. Supabase kurulumu ve doğrulaması

*(17 Ağustos 2026.)*

Şema (`supabase/migrations/0001_basvurular.sql`) Bölüm 8'den beri hazırdı ama **anahtarlar hiç girilmemişti**: `.env.local` içinde Supabase, Resend ve Meta Pixel değerlerinin hepsi boştu. Yani form çalışıyor görünüyor, veli gönderiyor ve *"Talebiniz kaydedilemedi. Lütfen tekrar deneyin."* alıyordu. Kod hatayı düzgün yakalıyor, veri sessizce kaybolmuyor &mdash; ama talep de alınmıyor.

Kurulum adımları tek yerde: **`supabase/KURULUM.md`**. Proje açma, SQL'i çalıştırma, üç anahtarı yerine koyma, doğrulama ve Vercel'e taşıma.

### `npm run test:supabase`

Anahtarlar girildikten sonra "tamam mı" sorusunun cevabı yoktu; tek yol formu elle doldurup denemekti. `scripts/supabase-kontrol.ts` bunu uçtan uca sınıyor:

| Kontrol | Neden |
|---|---|
| Üç anahtar dolu mu | En sık arıza |
| Tablo okunabiliyor mu | Migration çalıştırılmamış olabilir |
| Kodun yazdığı **24 alanın** hepsi yazılabiliyor mu | Şema ile kod arasındaki sessiz kayma |
| `durum` varsayılanı, `created_at`, `updated_at` tetikleyicisi | Trigger kurulmamış olabilir |
| **anon anahtarla okunamıyor** | RLS açık değilse bütün başvuru listesi dışarıya açık |
| **anon anahtarla yazılamıyor** | Form `/api/kayit` üzerinden geçmeli, doğrudan değil |

Betik kendi test kaydını yazıp hemen siliyor, tabloda iz bırakmıyor. Silme başarısız olursa kaydın kimliğini ekrana basıyor.

RLS kontrolü burada süs değil: `anon` anahtarı tarayıcıya gidiyor ve başvurular veli adı, telefon ve çocuk doğum tarihi taşıyor.

`npm test` içine **alınmadı**: ağ ve gerçek anahtar istiyor, derleme makinesinde çalışmaz. Kurulumdan sonra bir kez elle koşulur.

> Arıza mesajları ayrıştırıldı: erişilemeyen adres, geçersiz anahtar ve eksik tablo üç ayrı arıza ve çözümleri bambaşka. İlk hâlinde üçü de "tablo yok gibi görünüyor" diyordu ve insanı yanlış yere gönderiyordu.

### Bundan sonra

- **Resend anahtarları hâlâ boş.** Kayıt veritabanına düşer ama kimseye haber gitmez.
- **Admin paneli yok** (Bölüm 10, yayın sırasında 7. madde). O gelene kadar başvurular Supabase Table Editor'den okunur.

---

## 26. Depo ve genel gözden geçirme

*(17 Ağustos 2026.)*

Proje o güne kadar sürüm denetimi olmadan yürüyordu. `git init`, `.gitignore`, README ve ilk commit yapıldı: **162 dosya, 20,7 MB**.

### Depoya ne girdi, ne girmedi

| Girdi | Neden |
|---|---|
| `public/foto`, `public/ekip` | Üretilen dosyalar ama Vercel git'ten derliyor; girmezse site fotoğrafsız yayınlanır |
| `kaynak/` | Excel kaynakları ve ham portreler. `npm run foto` bunlara ihtiyaç duyuyor |
| `docs/` | Müşteriye giden PDF ve sosyal medya görselleri; üretmek için Chrome gerekiyor |
| `.env.example` | Hangi değişkenlerin gerektiğini yalnız o anlatıyor |

`.gitignore` içindeki `.env*` kalıbı `.env.example` dosyasını da eliyordu; `!.env.example` istisnası eklendi. `.env.local` takip edilmiyor, doğrulandı.

Mekân fotoğraflarının kaynak paketi (yüzlerce MB) depo dışında kalmaya devam ediyor, bkz. Bölüm 17.

### Gözden geçirmede çıkan üç kusur

**1. Yayın adresi sessizce localhost kalıyordu.** `SITE_URL` yalnız `NEXT_PUBLIC_SITE_URL` değişkenine bakıyordu. Tanımlanmadan yayına çıkılsa kanonik URL'ler, sitemap, robots, OG kartları ve schema.org kimliklerinin tamamı `localhost:3939` gösterirdi. Hiçbir yerde hata vermez, site normal görünür, arama motoru siteyi erişilemez adreslerle indeksler.

Artık Vercel'in kendi production adresine düşüyor (`NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL`, platform otomatik tanımlıyor ve `NEXT_PUBLIC_` önekli olduğu için tarayıcıda da aynı değeri veriyor; sunucu ile istemci farklı görseydi hydration bozulurdu). Sondaki bölü işareti de kırpılıyor: adres `https://alanadi.com/` girilirse kanonik URL `https://alanadi.com//iletisim` oluyordu. İkisi de teste bağlandı.

**2. Ana sayfada kanonik etiket yoktu.** Diğer otuz dört sayfa `sayfaMetadata()`'dan alıyor, ana sayfanın metadata'sı ise doğrudan `layout.tsx` içinde ve `alternates` alanı eksikti. Önemi: kampanya trafiği Instagram ve WhatsApp'tan geliyor, yani ana sayfaya `?utm_source=...` ve `?fbclid=...` ekli adreslerle giriliyor. Kanonik olmadan bunların her biri ayrı sayfa olarak indekslenebilir ve en değerli sayfanın sinyali bölünür.

**3. `supabaseHazirMi()` ölü koddu** ve yanlış anahtarlara bakıyordu. Açıklaması "env eksikse erken haber ver" diyordu ama hiçbir yerden çağrılmıyordu; ayrıca yazma yolunun kullandığı `SUPABASE_SERVICE_ROLE_KEY` kontrol edilmiyordu. `eksikSupabaseAnahtarlari()` olarak yeniden yazıldı ve `/api/kayit` başına bağlandı: kurulum eksikken sunucu kaydında hangi değişkenin tanımsız olduğu ve `supabase/KURULUM.md` yolu yazıyor. Veliye giden mesaj değişmedi.

### Temiz çıkanlar

Otuz beş sayfanın tamamı 200, olmayan adres 404. Erişilebilirlik taraması sekiz sayfada temiz: alt metinsiz görsel yok, her sayfada tam bir `h1`, boş bağlantı yok, etiketsiz ikon butonu yok. Kodda `TODO`, `FIXME`, `@ts-ignore` veya unutulmuş `console.log` yok. Takip edilen dosyalarda anahtar izi yok.

### README

Önceki hâli `create-next-app` şablonuydu: yanlış port (3000, doğrusu 3939), Geist fontu ve Vercel tanıtımı. Yerine kurulum, komut listesi, veri mimarisi, fotoğraf boru hattı, ortam değişkenleri ve yayın adımları yazıldı.

### Açık kalan çelişki

Bölüm 3 madde 4 hâlâ *"Geri sayım, 'son gün', 'üç gün kaldı' gibi ifadeler kullanılmaz"* diyor. Tarih yazma kararı Bölüm 14 madde 1'de değişti (kurum zaten kendi afişinde "Son gün: 1 Eylül" yazıyor) ama **geri sayım** ayrı bir şey ve o kural yerinde duruyor. WhatsApp balonu ise "N gün kaldı" yazıyor (Bölüm 24). İkisinden biri değişmeli; karar müşterinin.

---

## 27. Yayın: Supabase, Vercel ve ilk canlı kayıt

*(17 Ağustos 2026.)*

Site canlıda: **https://bambola.vercel.app** — geçici adres, alan adı bekleniyor.

### Supabase

Proje `rxdyyonlreibgavzkgym`, bölge **West EU (Ireland)**. Frankfurt önerilmişti; Ankara'ya ~25 ms daha uzak, form gönderiminde fark etmez, değiştirilmedi.

`0001_basvurular.sql` SQL Editor'den çalıştırıldı. Supabase "yıkıcı işlem" uyarısı verdi: betikteki `drop policy if exists` / `drop constraint if exists` satırları yüzünden. Veritabanı boştu, o satırlar da betiğin tekrar çalıştırılabilir olması için var; silinecek bir şey yoktu.

> **Anahtar biçimi değişmiş.** Supabase artık `sb_publishable_…` ve `sb_secret_…` veriyor; eski `anon` / `service_role` JWT'leri "Legacy" sekmesinde. Yenileri aynı yerlere düşüyor (publishable → anon, secret → service role) ve `@supabase/supabase-js` v2.112 ile sorunsuz çalışıyor. Ortam değişkeni adları değişmedi.

`npm run test:supabase` on bir kontrolün tamamını geçti: tablo, kodun yazdığı yirmi dört alan, `durum` varsayılanı, `updated_at` tetikleyicisi ve **RLS gerçekten kapalı** (anon anahtarla başvurular ne okunabiliyor ne yazılabiliyor).

### Vercel

Anahtarlar `npm run env:vercel` ile taşındı. Service role yalnız production ve preview ortamına gitti, development'a gitmedi: yerelde zaten `.env.local`'den okunuyor.

`NEXT_PUBLIC_SITE_URL` bilerek **tanımlanmadı**. Alan adı belli değil ve Bölüm 26'daki yedek devrede: site kendi Vercel adresini kullanıyor, kanonik URL'ler doğru çıkıyor. Alan adı gelince tek komutla tanımlanır.

### İlk canlı kayıt

Canlı `/api/kayit` uçtan uca denendi. Dönen kayıt sunucu tarafının çalıştığını tek tek gösteriyor:

| Alan | Değer | Ne kanıtlıyor |
|---|---|---|
| `yas_ay` | 31 | Yaş doğum tarihinden **sunucuda** hesaplanıyor, istemciden gelmiyor |
| `telefon` | `5000000000` | `0500 000 00 00` normalize edildi |
| `fiyat_normal` / `fiyat_erken_kayit` | 9000 / 7200 | Fiyat **sunucudaki tablodan**, istemci ne gönderirse göndersin |
| `erken_kayit_uygulandi` | `true` | Kampanya penceresi takvimden okunuyor |
| `secilen_slotlar` | gün, saat, atölye adı, öğretmenler | Slot verisi kayda gömülüyor; program sonradan değişse de kayıt bozulmuyor |
| `ip_hash` | özet | Ham IP saklanmıyor |
| `durum` | `yeni` | Varsayılan yerinde |

Test kaydı silindi, tablo boş.

### Hâlâ eksik

**Resend anahtarları yok.** Kayıt veritabanına düşüyor ama **kimseye e-posta gitmiyor**. Şu an bir veli form doldurursa talep kaybolmaz, ama kimse haberdar olmaz; başvurular Supabase Table Editor'den elle takip edilmeli. Admin paneli de henüz yok (Bölüm 10).

---

# BÖLÜM II — KAMPÜS (CRM)

## 28. Kampüs mimarisi ve aşamalar

*(17 Ağustos 2026. Müşteri kararı: CRM `kampus.bambola.com.tr` adresinde, ilk giren **adminler**.)*

### Neden aynı depo, aynı Vercel projesi

CRM ayrı bir uygulama değil. Sebep: aynı Supabase, aynı program/atölye/ücret/ekip verisi, aynı bileşenler. `src/lib/data/*` içindeki program tanımı hem sitede hem CRM'de aynı olmak zorunda; iki ayrı kopya bir hafta içinde ayrışır.

Ayrım **alan adı düzeyinde**, kod düzeyinde değil:

```
bambola.com.tr         → app/(site)/...     herkese açık
kampus.bambola.com.tr  → app/kampus/...     giriş zorunlu
```

`proxy.ts` gelen isteğin `Host` başlığına bakıp yönlendiriyor. Next.js 16'da middleware'in adı **proxy** oldu (`node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`), işlevi aynı.

İki yönlü kapatma şart: `/kampus` ana alan adından açılamaz, site sayfaları da kampüs alan adından açılamaz. Yoksa aynı içerik iki adresten yayınlanır.

> Next belgeleri açıkça uyarıyor: proxy **tam yetkilendirme çözümü değildir**, her istekte (prefetch dahil) çalıştığı için yalnız çerezden okuyan iyimser kontrol yapılır. Asıl denetim veri erişim katmanında, veritabanına bakarak yapılır.

### Roller

| Rol | Görür |
|---|---|
| `admin` | Her şey: başvurular, öğrenciler, cari, doluluk, lead'ler, kullanıcı yönetimi |
| `ogretmen` | Kendi grupları, yoklama, ders işlendi işaretleme. Cari ve lead **görmez** |
| `veli` | Kendi çocuğu: programı, devamsızlığı, ödemesi. Başka veli/öğrenci **görmez** |

Rol `profiller` tablosunda, `auth.users` ile birebir. Yetki RLS politikalarıyla veritabanı düzeyinde uygulanıyor &mdash; arayüzde gizlemek yeterli değil, API'ye doğrudan istek atan biri her şeyi görebilir.

### Aşamalar

Hepsini birden yazmak yanlış olur: gerçek kullanımdan önce tasarlanan alan, yanlış tasarlanan alandır.

| Aşama | Kapsam | Neden bu sırada |
|---|---|---|
| **1** | Admin girişi, başvuru listesi, durum takibi, not | **Bugünkü boşluk.** Form canlıda kayıt topluyor, kimse göremiyor |
| 2 | Öğrenci ve veli kartları, başvurudan öğrenciye dönüştürme | Başvuru ≠ öğrenci; kayıt olan çocuk ayrı bir varlık |
| 3 | Gruplar, haftalık doluluk, kontenjan | "Hangi hafta dolu" sorusu buradan çıkıyor |
| 4 | Yoklama, ders işlendi mi, öğretmen girişi | Öğretmen rolü ilk kez burada devreye giriyor |
| 5 | Cari: paket, ödeme, borç, tahsilat | Para. En sıkı test edilecek bölüm |
| 6 | Veli girişi | Dışarıya açılan son yüzey; öncekiler oturmadan açılmaz |
| 7 | Lead yönetimi (Instagram vb.), yemek, raporlar | |

### Varlık haritası

Aşama 1 yalnız ilk satırı kuruyor, gerisi burada duruyor ki sonraki göçler sancısız olsun.

```
profiller      auth.users ile birebir, rol tasir
basvurular     web sitesinden gelen talep          (VAR)
leadler        Instagram/telefon/tavsiye ile gelen talep
ogrenciler     kayit olmus cocuk
veliler        ogrenci ile cok-a-cok (anne, baba, vasi)
kayitlar       ogrenci + program + paket + donem     (sozlesme)
gruplar        haftalik programdaki slotun somut ornegi
yoklama        ogrenci x seans: geldi/gelmedi/telafi
dersler        seans islendi mi, isleyen ogretmen, not
odemeler       tahsilat ve borc hareketleri
```

`gruplar` tablosu `src/lib/data/program.ts` içindeki slotlardan **türetiliyor**, kopyalanmıyor: program değiştiğinde iki yerde düzeltme yapılmaz.

---

## 29. Kampüs dashboard ve modül haritası

*(17 Ağustos 2026. Müşteri: "en az 10-15 modül, solda, bildiğimiz dashboard mantığında".)*

Panel bir dashboard'a çevrildi: solda gruplanmış modül menüsü, sağda gün özeti.

### Modül listesi tek yerden

`src/lib/kampus/moduller.ts` **21 modülü** taşıyor. Sol menü, panel kısayolları ve yetki kontrolleri hepsi buradan üretiliyor.

Tek liste olmasının sebebi: menüde görünen ama olmayan bir sayfa, ya da olan ama menüde görünmeyen bir sayfa en sık rastlanan panel hatası.

| Grup | Modüller |
|---|---|
| Genel | Panel, Haftalık takvim |
| Kayıt ve satış | Başvurular, Lead'ler, Öğrenciler, Veliler |
| Eğitim | Sınıflar, Programlar, Yoklama, Ders kayıtları, Öğretmenler |
| Finans | Paketler ve ücretler, Cari hesap, Tahsilat takibi |
| Kurum | Mekân, Yemek ve menü, Duyurular, Raporlar |
| Veli | Çocuğum |
| Sistem | Kullanıcılar, Entegrasyonlar, Ayarlar |

### Hazır olmayan modüller gizlenmiyor

Her modülün bir `durum` alanı var. Hazır olmayanlar menüde **noktayla işaretli** duruyor ve açıldıklarında neyi beklediklerini yazıyorlar.

Neden boş bir "yakında" ekranı değil: panelde bir ekran açılıp veri girilebiliyor görünürse, girilen veri kaybolur. Neden gizlemek de değil: panelin neyi kapsadığını görmek, neyin henüz olmadığını görmek kadar önemli.

Bekleyen modüller **tek bir dinamik rotayla** karşılanıyor (`app/kampus/[modul]/page.tsx`). On iki boş dosya yazmak, hangisinin gerçekten çalıştığını göremez hale getirirdi. Bir modülün kendi sayfası açıldığı anda Next özel rotayı kullanıyor ve dinamik rota devreden çıkıyor.

### Şu an çalışan sekiz modül

Mevcut veriyle **gerçekten** çalışanlar. Hiçbiri için yeni tablo gerekmedi; hepsi `src/lib/data/*` içindeki veriyi okuyor, yani site neyi gösteriyorsa panel de onu gösteriyor.

| Modül | Ne gösteriyor |
|---|---|
| **Panel** | Bekleyen başvuru, bu hafta gelen, bugünkü seanslar, kampanya penceresi |
| **Haftalık takvim** | 30 seans gün gün, öğretmen yükü çubukları. Öğretmen kendi seanslarını vurgulu görüyor |
| **Başvurular** | Liste, süzgeç, arama, detay, durum, not |
| **Programlar** | Dokuz atölye, seans sayısı, günler, öğretmenler |
| **Öğretmenler** | Kadro, haftalık yük, çalıştığı günler, seans listesi |
| **Paketler ve ücretler** | Tarife, erken kayıt penceresi, o an geçerli fiyat |
| **Mekân** | Yirmi kare ve alt metinleri |
| **Kullanıcılar** | Hesaplar, roller, hesabı olmayan öğretmenler |
| **Entegrasyonlar** | Bağlantı durumları, **ortam değişkenlerine bakılarak** |
| **Ayarlar** | Kurum bilgileri, çalışma saatleri (salt okunur) |

### Bilerek yapılmayanlar

**Hesap açma panelde değil**, `npm run kampus:kullanici` betiğinde. Hesap açmak Supabase yönetici anahtarını gerektiriyor ve o anahtar tarayıcıya gitmemeli.

**Ayarlar salt okunur.** Kurum bilgileri `src/lib/site.ts` içinde kod olarak duruyor; site, PDF fiyat listesi, üyelik formu ve schema.org hepsi oradan besleniyor. Düzenlenebilir yapmak o kaynağı veritabanına taşımak demek. Yarım yapmak en kötüsü olurdu: panelde değiştirilip sitede görünmeyen bir alan, yanlış bilgiyi sessizce yayar.

**Mekânda yükleme yok.** Klasör `npm run foto` ile üretiliyor; yüklenen dosya bir sonraki üretimde silinirdi (Bölüm 17).

**Entegrasyon durumları varsayılmıyor**, ortam değişkenlerine bakılarak belirleniyor. "Bağlı" yazıp aslında çalışmayan bir entegrasyon, hiç yazmamaktan kötü.

---

## 30. Öğrenciler, veliler ve sınıflar

*(17 Ağustos 2026. Aşama 2. `0003_ogrenciler_veliler_siniflar.sql`.)*

Beş tablo açıldı ve beş modül birden canlandı.

### Tablolar ve neden böyle

| Tablo | Ne tutuyor |
|---|---|
| `ogrenciler` | Kayıtlı çocuk. `basvuru_id` ile geldiği başvuruya bağlı |
| `veliler` | Veli kaydı. `profil_id` ile panel hesabına bağlanabiliyor, zorunlu değil |
| `ogrenci_veli` | **Çok-a-çok.** Anne ve baba ayrı ayrı kayıtlı olabilir, bir veli birden fazla çocuğa bağlanabilir (kardeşler) |
| `siniflar` | Somut grup. Kontenjan, öğretmen, dönem |
| `kayitlar` | Öğrencinin bir sınıfa kaydı. Paket ve ücret **kayıt anındaki** hâliyle |

**Sınıf slota bağlı ama ondan bağımsız.** `slot_id` kod içindeki program verisine işaret ediyor; yabancı anahtar değil, çünkü o veri veritabanında değil. Gün, saat ve atölye bilgisi sınıfta da saklanıyor: program değiştiğinde geçmiş kayıtlar bozulmasın.

**Öğretmen adla bağlanıyor**, profil kimliğiyle değil. Sebebi: öğretmenin panel hesabı olmayabilir ama sınıf yine de ona atanabilmeli. Ad, ekip verisindeki `ad` ile birebir aynı ("Emine").

### Sınıflar programdan üretiliyor

Elle otuz sınıf açmak yerine tek düğmeyle haftalık programdan üretiliyor: kurumun gerçek programı zaten kodda ve Excel'e karşı doğrulanmış. Her seans için bir sınıf, öğretmeni programdaki öğretmen, kontenjan 12 (Excel'deki grup mevcudu). Sonra hepsi tek tek değiştirilebiliyor.

`slot_id + donem` tekil indeksi var, yani tekrar çalıştırmak zararsız: var olanlar atlanıyor. Serbest oyun dışarıda &mdash; atanmış öğretmeni ve kontenjanı olan bir grup değil, her grup gününün ilk saati.

**2026-2027 dönemi için 29 sınıf açıldı.**

### RLS: üç rol, üç görüş

Yetki arayüzde değil veritabanında. Öğretmen **yalnız kendi sınıflarındaki** öğrencileri görüyor; bütün öğrenci listesi açık olsaydı başka grupların çocuklarının sağlık ve iletişim bilgileri de görünürdü. Veli yalnız kendi çocuğunu görüyor.

İki yardımcı fonksiyon eklendi: `ogretmen_adim()` ve `veli_kaydim()`, ikisi de `security definer` + `search_path = ''` ile.

### Başvurudan öğrenciye

Başvuru **silinmiyor**: nereden geldiği ve ilk talebin ne olduğu kayıt olarak duruyor, öğrenci ona `basvuru_id` ile bağlı.

İki koruma var. Aynı başvuru iki kez dönüştürülemiyor (ikinci çağrı var olan öğrenciyi döndürüyor) &mdash; çift tıklama veya geri tuşu yüzünden iki çocuk kaydı oluşmasın. Aynı telefonla kayıtlı veli varsa yeniden oluşturulmuyor, mevcut veliye bağlanıyor &mdash; kardeş kaydında ikinci bir veli kartı çıkmasın.

### `server-only` işini yaptı

Derleme, `ogrenci-suzgeci.tsx` istemci bileşeninin sunucu modülünden etiket aldığını yakalayıp **hata verdi**. O import bütün veri erişim katmanını tarayıcı paketine sürüklüyordu. Tipler ve etiketler `ogrenci-tipleri.ts` içine ayrıldı; sorgular `ogrenciler.ts` içinde ve orası `server-only` kalmaya devam ediyor.

Bu tam olarak `server-only` işaretinin var olma sebebi: sessizce çalışacak ama sunucu kodunu istemciye sızdıracak bir import, derlemede durduruldu.

### Doğrulama

Uçtan uca sekiz kontrol: öğrenci ve veli oluşturma, çok-a-çok bağlantı, sınıfa kayıt, **aynı öğrencinin aynı sınıfa iki kez aktif kaydedilememesi** (tekil indeks), doluluk sayımı ve öğrenci → veli zinciri. Test verisi silindi.

---

## 31. Yoklama, cari ve kalan modüller

*(17 Ağustos 2026. Aşama 3. `0004_yoklama_odeme_lead.sql`. Müşteri: "eksik modül kalmasın".)*

Altı tablo daha açıldı ve **bekleyen dokuz modül kapandı**. Panelde artık 22 modülün 22'si çalışıyor.

### Tablolar

| Tablo | Ne tutuyor |
|---|---|
| `dersler` | Bir sınıfın **belirli tarihteki** seansı. Sınıf haftalık tekrar eden şablon, ders onun somut örneği |
| `yoklama` | Öğrenci × ders: geldi / gelmedi / izinli / telafi |
| `odemeler` | Cari hareket. **Tek tablo**, `tur` ile borç/tahsilat ayrımı |
| `leadler` | Web formu dışından gelen talepler |
| `menuler` | Günlük menü, tarih tekil |
| `duyurular` | Başlık, metin, hedef kitle, yayın durumu |

**Ödemeler neden tek tablo:** bakiye = toplam borç eksi toplam tahsilat. İki ayrı tablo tutulsaydı bakiye hesabı iki sorgu ve iki yerde tutarlılık demekti.

**Tutar tam sayı ve TL, kuruş değil:** kurumun bütün fiyatları tam TL (9000, 7200), ondalıklı tutar hiç geçmiyor.

**Dersi işleyen, sınıfın öğretmeninden farklı olabilir:** birinin yerine başkası girdiğinde kayıt bunu göstermeli.

**Lead neden `basvurular` tablosuna konmadı:** o tablo formun şema doğrulamasından geçiyor ve zorunlu alanları var (doğum tarihi, KVKK onayı). Instagram'dan gelen bir mesajda çoğu zaman yalnız bir ad ve telefon oluyor. Zorunlu alan sayısını artırmak kaydın hiç girilmemesine yol açar.

### RLS: üç rol, keskin sınırlar

| Tablo | Admin | Öğretmen | Veli |
|---|---|---|---|
| `dersler` | hepsi | kendi sınıfları, **işleyebilir** | çocuğunun dersleri, okur |
| `yoklama` | hepsi | kendi dersinin yoklamasını **alır ve değiştirir** | çocuğunun devamı, okur |
| `odemeler` | hepsi | **hiç görmüyor** | kendi borcu, okur |
| `leadler` | hepsi | — | — |
| `menuler` | yazar | okur | okur |
| `duyurular` | hepsi + taslaklar | yayında + hedefi | yayında + hedefi |

Öğretmen kendi dersinin yoklamasını **admin onayı olmadan** alabiliyor: yoklama günlük akışın parçası, onaya bağlamak işi kilitler. Ama başka sınıfın dersine dokunamıyor.

Taslak duyuru kimseye görünmüyor: yazılmakta olan bir metnin veliye düşmesi geri alınamaz. Yeni duyuru **taslak olarak** açılıyor, yayına almak ayrı bir adım.

### Ekranlarda verilen kararlar

**Yoklama günün programına göre.** Otuz sınıfın hepsini listelemek her gün otuz satır demekti; sayfa seçilen günün sınıflarını gösteriyor. "İşaretlenmeyen N kişiyi geldi yap" düğmesi var: çoğu gün çoğu çocuk geliyor.

**Yoklama işaretleri anında görünüyor**, sunucu beklenmeden. Otuz çocuk için otuz tıklama ve her birinde yarım saniye beklemek işi çekilmez hale getirir. Hata olursa o satır eski hâline dönüyor.

**Cari ile tahsilat ayrı sayfa.** Cari tam tabloyu gösteriyor, tahsilat **yapılacak işi**: yalnız açık bakiyeliler, gecikmişler üstte.

**Alerji bilgisi menü sayfasında.** Mutfağa giden iki bilgi (menü ve alerji) aynı ekranda birleşiyor, iki yere bakmak gerekmiyor.

**Raporlar canlı sorgu**, önbelleklenmiş özet tablosu yok: veri hacmi küçük ve özet tablosu güncellenmeyi unutulan ikinci bir gerçek kaynak yaratır.

**Veli sayfasında ödeme gösterilmiyor.** RLS veliye kendi borcunu okutuyor ama panele koymak önce kurumla konuşulmalı: yanlış görünen bir bakiye telefon trafiği yaratır.

### Yer tutucu kaldırıldı

Bütün modüller çalıştığı için `app/kampus/[modul]` dinamik rotası ve `Hazirlaniyor` bileşeni silindi. Hiçbir zaman görünmeyecek bir "hazırlanıyor" ekranı yanıltıcı olurdu.

### Doğrulama

Uçtan uca **14 kontrol**: ders açma, aynı sınıfa aynı gün ikinci ders açılamaması, yoklama işaretleme, aynı öğrencinin aynı derste iki kez işaretlenememesi, bakiye hesabı (9000 − 5000 = 4000), negatif tutar reddi, tanımsız hareket türü reddi, tanımsız lead kaynağı reddi, menünün üzerine yazılması ve duyurunun taslak açılması. Test verisi silindi.

> **Migration çalıştırmada tuzak:** SQL Editor'de "Run" tıklanınca yıkıcı işlem onayı çıkıyor. İlk denemede onaya, modal henüz açılmadan tıklandı; sorgu çalışmadı ama hata da vermedi. Belirti PostgREST'in "Could not find the table in the schema cache" hatasıydı ve tablo yok sanıldı. Onay tıklandıktan sonra **sonucun okunması** şart.

## 32. Panelden öğrenci ekleme ve modüller arası bağlar

*(17 Ağustos 2026. Yeni tablo yok; var olan beş tablo birbirine bağlandı.)*

İstek şuydu: "panele öğrenci ekleyebilmeliyim, eklerken veli bilgisi de istemeli, modüller kendi aralarında bağlantılı olmalı."

### Tek işlem, beş kayıt

`ogrenciEkle` bir formdan gelen veriyle **bağlı kayıtların tamamını** kuruyor:

| Ne | Zorunlu mu | Not |
|---|---|---|
| `ogrenciler` satırı | evet | ad, doğum tarihi, kurum |
| `veliler` satırı | **evet** | ad soyad, telefon |
| `ogrenci_veli` bağlantısı | evet | yakınlık + `birincil` |
| `kayitlar` (sınıf kaydı) | hayır | seçilirse |
| `odemeler` (ilk borç) | hayır | ücret girilirse |

**Veli neden zorunlu:** velisi olmayan bir çocuk kaydı, kime ulaşılacağı bilinmeyen bir kayıttır. Alerjisi olan bir çocuk için bu kabul edilemez.

**Aynı telefonlu veli yeniden oluşturulmuyor**, mevcut veliye bağlanıyor. Kardeş kaydında ikinci bir veli kartı çıkmasın; aile bakiyesi de bölünmesin.

**Geri alma kuralı asimetrik.** Veli oluşmazsa öğrenci satırı **siliniyor**: yarım kalan bir öğrenci hiç olmamasından kötüdür. Ama sınıf kaydı veya borç yazılamazsa öğrenci **duruyor**: çocuk ve velisi doğru kaydedildi, eksik olan kendi ekranından tamamlanabilir.

**Sınıf kontrolü en başta.** Kontenjan dolu ya da sınıf kapalıysa hiçbir satır yazılmadan hata dönüyor. Önce yazıp sonra "sınıf dolu" demek, geri alınacak bir kayıt bırakır.

### Modüller arası bağlar

| Nereden | Nereye | Ne için |
|---|---|---|
| Lead | Öğrenci formu (dolu) | Instagram'dan gelen talep tek tıkla kayda dönüyor |
| Lead | Öğrenci kartı | Dönüşmüş lead'in çocuğuna gitmek |
| Öğrenci | Veli sayfası | "Bu çocuğun velisi kim, başka çocuğu var mı" |
| Veli | Çocukları → sınıfları | Ailenin tamamı tek ekranda |
| Sınıf | Dersler + yoklama | Sınıfı açan öğretmen "bu hafta ne oldu"yu görüyor |
| Sınıf | Ders kayıtları (süzgeçli) | O sınıfın tüm geçmişi |

**Lead dönüşümünde lead silinmiyor.** `durum` "kayıt oldu" olup `ogrenci_id` yazılıyor. Hangi kanalın (Instagram, tavsiye, tabela) öğrenciye dönüştüğü raporlarda ancak bu bağla görülüyor. Aynı lead iki kez dönüştürülemiyor: ikinci çağrı var olan öğrenciyi döndürüyor.

**Veli sayfası neden ayrı bir düğüm:** "Ayşe Hanım aradı" dendiğinde tek yere bakılıyor — çocukları, sınıfları, gün ve saatleri, **aile bakiyesi** ve iletişim. Bakiye çocuk başına değil aile toplamı olarak da gösteriliyor: tahsilat konuşması aileyle yapılıyor, çocukla değil.

**Form notu görünür.** Lead'in notu forma taşınıyor ama gizli bir alanda değil, yazılabilir bir alanda: görünmeden kaydedilen metin, sonra kimin yazdığı anlaşılmayan bir nota dönüşür.

### Tarih yardımcısı

`bugununTarihi()` `src/lib/tarih.ts`'e taşındı, iki yerde kopyaydı. Panelde "bugün" **her zaman İstanbul saatiyle**: Vercel fonksiyonu UTC koşuyor, gece 00.00–03.00 arası `new Date()` bir önceki günü verir ve o saatte açılan yoklama yanlış derse yazılırdı.

### Doğrulama

Geçici bir yönetici hesabıyla, gerçek arayüzden, uçtan uca **18 kontrol**: form düğmesinin varlığı, veli bilgisi boşken formun geçerli sayılmaması, sınıf seçimi, kayıt sonrası öğrenci kartına yönlenme, kartta velinin görünmesi, ilk borcun cariye işlenmesi, veli sayfasının çocuğu ve aile bakiyesini göstermesi, sınıf detayındaki dersler kutusu, sınıf süzgeçli ders listesi, lead satırındaki dönüştür bağlantısı, formun lead'den dolu gelmesi, lead'in "kayıt oldu" işaretlenip öğrenciye bağlanması ve **aynı telefon için tek veli kaydı** kalması. Üretilen her satır ve geçici hesap sonda silindi.

> Şifre tarayıcı formuna **girilmedi**: oturum çerezi doğrudan yazıldı. Panel doğrulaması bir parolayı ekrana taşımayı gerektirmiyor.
