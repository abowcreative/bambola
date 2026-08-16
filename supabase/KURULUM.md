# Supabase kurulumu

Kayıt formunun yazacağı yer. Bu bitmeden site yayına çıkmaz: form çalışıyor
görünür ama veli gönderdiğinde *"Talebiniz kaydedilemedi"* alır ve talep
kaybolur.

Toplam süre: 10-15 dakika.

---

## 1. Proje aç

[supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.

| Alan | Ne yazılır |
|---|---|
| Name | `bambola` |
| Database password | Güçlü bir parola. **Kaydedin**, bir daha gösterilmiyor |
| Region | **Frankfurt (eu-central-1)** — Ankara'ya en yakın bölge, gecikme en düşük |

Proje hazırlanması birkaç dakika sürüyor.

> Ücretsiz plan bu iş için yeterli. Sınır 500 MB veritabanı; bir kayıt talebi
> ~2 KB, yani binlerce başvuru sığar.

---

## 2. Tabloyu kur

Sol menü → **SQL Editor** → **New query**.

`supabase/migrations/0001_basvurular.sql` dosyasının **tamamını** yapıştırıp
**Run**.

Bu dosya şunları kuruyor:

- `basvurular` tablosu (kod bu tabloya yazıyor)
- `basvuru_notlari` tablosu (admin panelinin ikinci turu için hazır)
- İndeksler: tarih, durum, kurum, telefon
- `durum` ve `kurum` için değer kısıtları — serbest metin girilemiyor
- `updated_at` tetikleyicisi
- **RLS politikaları**

Betik `if not exists` ve `drop policy if exists` kullanıyor, yani ikinci kez
çalıştırmak zararsız.

---

## 3. Anahtarları al

Sol menü → **Project Settings** → **API**.

| Panelde | `.env.local` içinde |
|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY` |

> ⚠️ **`service_role` anahtarı RLS'i tamamen atlar.** Yalnız sunucuda
> kullanılır, `NEXT_PUBLIC_` önekiyle tanımlanmaz, tarayıcıya gitmez, ekran
> görüntüsüyle paylaşılmaz. Sızarsa bütün başvuru verisi okunabilir hâle
> gelir.

---

## 4. Doğrula

```bash
npm run test:supabase
```

Betik uçtan uca sınıyor: anahtarlar dolu mu, tablo var mı, **kodun yazdığı
yirmi dört alanın hepsi** tabloda karşılık buluyor mu, `updated_at`
tetikleyicisi çalışıyor mu, ve RLS gerçekten kapalı mı.

Kendi test kaydını yazıp hemen siliyor; tabloda iz bırakmıyor.

RLS kontrolü özellikle önemli: `anon` anahtarı tarayıcıya gidiyor ve
başvurular veli adı, telefon ve çocuk doğum tarihi taşıyor. Anon okuyabiliyorsa
bütün başvuru listesi dışarıya açık demektir.

Hepsi geçtiğinde:

```
Supabase kurulumu hazir: 9 kontrol gecti.
```

---

## 5. Formu gerçekten dene

`npm run dev` → `/kayit` → formu doldurup gönderin. Supabase panelinde
**Table Editor → basvurular** altında satırın düştüğünü görün.

---

## Yayına çıkarken

Aynı üç anahtar Vercel'de de tanımlanır: **Project Settings → Environment
Variables**. `service_role` yalnız Production ve Preview ortamlarına, asla
`NEXT_PUBLIC_` önekiyle değil.

---

## Sırada ne var

- **Resend anahtarı** (`RESEND_API_KEY`, `BILDIRIM_ALICI`,
  `BILDIRIM_GONDEREN`). Bunlar boşken kayıt **veritabanına düşer ama kimseye
  haber gitmez**; kayıtları panelden elle takip etmek gerekir.
- **Admin paneli henüz yok** (PLAN.md Bölüm 10). O gelene kadar başvurular
  Supabase Table Editor'den okunur.
