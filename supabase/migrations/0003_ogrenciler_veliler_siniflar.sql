-- Kampus Asama 2: ogrenciler, veliler, siniflar ve kayitlar.
-- PLAN.md Bolum 28 ve 30. Tekrar calistirilabilir.

-- ------------------------------------------------------------------ veliler

create table if not exists veliler (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz,

  ad_soyad text not null,
  -- 5XXXXXXXXX olarak normalize edilir, basvurular tablosuyla ayni bicim.
  telefon text not null,
  eposta text,
  /*
    Veli panele girecekse buradan baglaniyor. Bos olabilir: cogu veli hesap
    acmayacak ama kaydi yine de tutulacak.
  */
  profil_id uuid references profiller(id) on delete set null,
  adres text,
  notlar text
);

create index if not exists veliler_telefon_idx on veliler (telefon);
create index if not exists veliler_profil_idx on veliler (profil_id);

-- --------------------------------------------------------------- ogrenciler

create table if not exists ogrenciler (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz,

  ad text not null,
  soyad text,
  dogum_tarihi date not null,
  kurum text not null default 'oyun-evi',

  /*
    Bu ogrenci hangi basvurudan geldi. Bos olabilir: telefonla veya kapidan
    gelen kayitlarin basvuru kaydi yok. `set null`: basvuru silinse de
    ogrenci durur.
  */
  basvuru_id uuid references basvurular(id) on delete set null,

  kayit_tarihi date not null default current_date,
  durum text not null default 'aktif',

  -- Saglik: gorulmesi gereken yerde gorunsun diye ayri alanlar.
  alerji text,
  saglik_notu text,
  notlar text
);

alter table ogrenciler drop constraint if exists ogrenciler_durum_check;
alter table ogrenciler add constraint ogrenciler_durum_check
  check (durum in ('aday', 'aktif', 'dondurdu', 'ayrildi'));

alter table ogrenciler drop constraint if exists ogrenciler_kurum_check;
alter table ogrenciler add constraint ogrenciler_kurum_check
  check (kurum in ('oyun-evi', 'anaokulu', 'parti'));

create index if not exists ogrenciler_durum_idx on ogrenciler (durum);
create index if not exists ogrenciler_basvuru_idx on ogrenciler (basvuru_id);

-- ------------------------------------------------------------ ogrenci_veli

/*
  Cok-a-cok: bir cocugun annesi ve babasi ayri ayri kayitli olabilir, bir
  velinin birden fazla cocugu olabilir (kardesler). Tek bir `veli_id` alani
  ikisini de karsilamazdi.
*/
create table if not exists ogrenci_veli (
  ogrenci_id uuid not null references ogrenciler(id) on delete cascade,
  veli_id uuid not null references veliler(id) on delete cascade,
  yakinlik text not null default 'veli',
  -- Aramada once bu numara denenir.
  birincil boolean not null default false,
  primary key (ogrenci_id, veli_id)
);

alter table ogrenci_veli drop constraint if exists ogrenci_veli_yakinlik_check;
alter table ogrenci_veli add constraint ogrenci_veli_yakinlik_check
  check (yakinlik in ('anne', 'baba', 'vasi', 'veli'));

create index if not exists ogrenci_veli_veli_idx on ogrenci_veli (veli_id);

-- ----------------------------------------------------------------- siniflar

/*
  Somut grup. Haftalik programdaki slota BAGLI ama ondan bagimsiz kimligi
  var: program degistiginde gecmis kayitlar bozulmasin diye gun, saat ve
  atolye bilgisi burada da saklaniyor.

  `slot_id` kod icindeki program verisine isaret ediyor (src/lib/data/
  program.ts). Yabanci anahtar degil cunku o veri veritabaninda degil; slot
  silinirse sinif kaydi durur ve kendi bilgisiyle calismaya devam eder.
*/
create table if not exists siniflar (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz,

  ad text not null,
  slot_id text,
  atolye_slug text,
  program_slug text,

  gun text,
  bas text,
  bit text,

  kontenjan int not null default 12,
  /*
    Ogretmen ADIYLA baglaniyor, ekip verisindeki `ad` ile birebir
    ("Emine"). Profil kimligiyle degil: ogretmenin panel hesabi olmayabilir
    ama sinifi yine de ona atanabilmeli.
  */
  ogretmen_ad text,
  donem text not null default '2026-2027',
  aktif boolean not null default true,
  notlar text
);

alter table siniflar drop constraint if exists siniflar_kontenjan_check;
alter table siniflar add constraint siniflar_kontenjan_check
  check (kontenjan > 0 and kontenjan <= 40);

create index if not exists siniflar_donem_idx on siniflar (donem, aktif);
create index if not exists siniflar_ogretmen_idx on siniflar (ogretmen_ad);
create unique index if not exists siniflar_slot_donem_idx
  on siniflar (slot_id, donem) where slot_id is not null;

-- ----------------------------------------------------------------- kayitlar

/*
  Ogrencinin bir sinifa kaydi. Ucret ve paket KAYIT ANINDAKI haliyle
  saklaniyor: tarife sonradan degisse de sozlesme bozulmuyor. Basvurular
  tablosundaki fiyat alanlariyla ayni mantik.
*/
create table if not exists kayitlar (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz,

  ogrenci_id uuid not null references ogrenciler(id) on delete cascade,
  sinif_id uuid not null references siniflar(id) on delete restrict,

  paket_kod text,
  ucret int,
  baslangic date not null default current_date,
  bitis date,
  durum text not null default 'aktif',
  notlar text
);

alter table kayitlar drop constraint if exists kayitlar_durum_check;
alter table kayitlar add constraint kayitlar_durum_check
  check (durum in ('aktif', 'dondurdu', 'bitti', 'iptal'));

-- Ayni ogrenci ayni sinifa iki kez AKTIF kaydedilemez.
create unique index if not exists kayitlar_tekil_aktif_idx
  on kayitlar (ogrenci_id, sinif_id) where durum = 'aktif';

create index if not exists kayitlar_sinif_idx on kayitlar (sinif_id, durum);
create index if not exists kayitlar_ogrenci_idx on kayitlar (ogrenci_id);

-- ------------------------------------------------------- updated_at tetikle

do $$
declare t text;
begin
  foreach t in array array['veliler','ogrenciler','siniflar','kayitlar'] loop
    execute format(
      'drop trigger if exists %I_updated_at_trg on %I', t, t);
    execute format(
      'create trigger %I_updated_at_trg before update on %I
       for each row execute function basvurular_updated_at()', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------- RLS

alter table veliler enable row level security;
alter table ogrenciler enable row level security;
alter table ogrenci_veli enable row level security;
alter table siniflar enable row level security;
alter table kayitlar enable row level security;

/*
  Ogretmen KENDI siniflarini goruyor. Eslesme ogretmen adiyla yapiliyor:
  profiller.ogretmen_ad ile siniflar.ogretmen_ad.
*/
create or replace function ogretmen_adim()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.ogretmen_ad from public.profiller p
  where p.id = (select auth.uid()) and p.aktif and p.rol = 'ogretmen'
$$;

/* Oturum acan velinin veli kaydi. */
create or replace function veli_kaydim()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select v.id from public.veliler v
  where v.profil_id = (select auth.uid())
$$;

-- --- siniflar ---
drop policy if exists "siniflari admin yonetir" on siniflar;
create policy "siniflari admin yonetir" on siniflar
  for all to authenticated using (admin_mi()) with check (admin_mi());

drop policy if exists "ogretmen kendi sinifini okur" on siniflar;
create policy "ogretmen kendi sinifini okur" on siniflar
  for select to authenticated
  using (ogretmen_ad is not null and ogretmen_ad = ogretmen_adim());

-- --- ogrenciler ---
drop policy if exists "ogrencileri admin yonetir" on ogrenciler;
create policy "ogrencileri admin yonetir" on ogrenciler
  for all to authenticated using (admin_mi()) with check (admin_mi());

/*
  Ogretmen yalniz KENDI sinifindaki ogrencileri goruyor. Butun ogrenci
  listesi ogretmene acik olsaydi baska gruplarin cocuklarinin saglik ve
  iletisim bilgileri de gorunurdu.
*/
drop policy if exists "ogretmen kendi ogrencisini okur" on ogrenciler;
create policy "ogretmen kendi ogrencisini okur" on ogrenciler
  for select to authenticated
  using (exists (
    select 1 from kayitlar k
    join siniflar s on s.id = k.sinif_id
    where k.ogrenci_id = ogrenciler.id
      and k.durum = 'aktif'
      and s.ogretmen_ad = ogretmen_adim()
  ));

drop policy if exists "veli kendi cocugunu okur" on ogrenciler;
create policy "veli kendi cocugunu okur" on ogrenciler
  for select to authenticated
  using (exists (
    select 1 from ogrenci_veli ov
    where ov.ogrenci_id = ogrenciler.id and ov.veli_id = veli_kaydim()
  ));

-- --- veliler ---
drop policy if exists "velileri admin yonetir" on veliler;
create policy "velileri admin yonetir" on veliler
  for all to authenticated using (admin_mi()) with check (admin_mi());

drop policy if exists "veli kendini okur" on veliler;
create policy "veli kendini okur" on veliler
  for select to authenticated using (id = veli_kaydim());

-- --- ogrenci_veli ---
drop policy if exists "baglantiyi admin yonetir" on ogrenci_veli;
create policy "baglantiyi admin yonetir" on ogrenci_veli
  for all to authenticated using (admin_mi()) with check (admin_mi());

drop policy if exists "veli kendi baglantisini okur" on ogrenci_veli;
create policy "veli kendi baglantisini okur" on ogrenci_veli
  for select to authenticated using (veli_id = veli_kaydim());

-- --- kayitlar ---
drop policy if exists "kayitlari admin yonetir" on kayitlar;
create policy "kayitlari admin yonetir" on kayitlar
  for all to authenticated using (admin_mi()) with check (admin_mi());

drop policy if exists "ogretmen kendi sinifinin kaydini okur" on kayitlar;
create policy "ogretmen kendi sinifinin kaydini okur" on kayitlar
  for select to authenticated
  using (exists (
    select 1 from siniflar s
    where s.id = kayitlar.sinif_id and s.ogretmen_ad = ogretmen_adim()
  ));

drop policy if exists "veli kendi cocugunun kaydini okur" on kayitlar;
create policy "veli kendi cocugunun kaydini okur" on kayitlar
  for select to authenticated
  using (exists (
    select 1 from ogrenci_veli ov
    where ov.ogrenci_id = kayitlar.ogrenci_id and ov.veli_id = veli_kaydim()
  ));
