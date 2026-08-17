-- Kampus (CRM) Asama 1: roller ve yetki.
-- PLAN.md Bolum 28.
-- Supabase SQL Editor'e yapistirilip calistirilir. Tekrar calistirilabilir.

-- ---------------------------------------------------------------- profiller

/*
  auth.users ile BIREBIR. Supabase kimlik dogrulamayi yapiyor, rolu biz
  tutuyoruz.

  Rol neden burada degil de auth metadata'sinda degil: user_metadata'yi
  KULLANICININ KENDISI degistirebiliyor. Rol orada dursa bir veli kendini
  admin yapabilirdi. Bu tablo yalniz service role ile yaziliyor.
*/
create table if not exists profiller (
  id uuid primary key references auth.users(id) on delete cascade,
  rol text not null check (rol in ('admin', 'ogretmen', 'veli')),
  ad_soyad text not null,
  telefon text,
  /*
    Ogretmen icin: src/lib/data/ekip.ts icindeki `ad` alaniyla BIREBIR ayni
    olmali ("Emine", "Burcu", "Dilara"). Haftalik programdaki
    slot.ogretmenler[] bu adla eslesiyor; soyad eklenirse eslesme kopar.
  */
  ogretmen_ad text,
  aktif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists profiller_rol_idx on profiller (rol);

drop trigger if exists profiller_updated_at_trg on profiller;
create trigger profiller_updated_at_trg
  before update on profiller
  for each row execute function basvurular_updated_at();

-- Ogretmen rolunun ogretmen_ad alani dolu olmali, baskasininki bos olmali.
alter table profiller drop constraint if exists profiller_ogretmen_ad_check;
alter table profiller add constraint profiller_ogretmen_ad_check
  check (
    (rol = 'ogretmen' and ogretmen_ad is not null)
    or (rol <> 'ogretmen' and ogretmen_ad is null)
  );

-- ------------------------------------------------------------ yardimcilar

/*
  Oturum acmis kullanicinin rolu.

  `security definer`: fonksiyon profiller tablosunu tablonun SAHIBI yetkisiyle
  okuyor. Boyle olmasaydi politikanin icinden profiller okunurdu, o da kendi
  politikasini tetiklerdi ve sonsuz dongu olusurdu.

  `set search_path = ''`: security definer fonksiyonlarda sema adlari acikca
  yazilir. Yoksa kullanici kendi semasina sahte bir `profiller` koyup
  fonksiyonu kandirabilir.
*/
create or replace function rolum()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.rol from public.profiller p
  where p.id = (select auth.uid()) and p.aktif
$$;

create or replace function admin_mi()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.rolum() = 'admin'
$$;

-- -------------------------------------------------------- profiller RLS

alter table profiller enable row level security;

-- Herkes KENDI profilini okur: arayuz rolu buradan ogreniyor.
drop policy if exists "kendi profilini oku" on profiller;
create policy "kendi profilini oku" on profiller
  for select to authenticated
  using (id = (select auth.uid()));

-- Admin butun profilleri okur ve yonetir.
drop policy if exists "admin profilleri okur" on profiller;
create policy "admin profilleri okur" on profiller
  for select to authenticated
  using (admin_mi());

drop policy if exists "admin profilleri yazar" on profiller;
create policy "admin profilleri yazar" on profiller
  for all to authenticated
  using (admin_mi())
  with check (admin_mi());

-- ------------------------------------------------------- basvurular RLS

/*
  0001'deki politikalar "authenticated olan herkes okur/gunceller" diyordu.
  O zaman tek rol vardi. Artik ogretmen ve veli de oturum acacak; basvurular
  veli adi, telefon ve cocuk dogum tarihi tasiyor ve YALNIZ admin gormeli.
*/
drop policy if exists "admin read" on basvurular;
drop policy if exists "admin update" on basvurular;
drop policy if exists "admin notlari read" on basvuru_notlari;
drop policy if exists "admin notlari insert" on basvuru_notlari;

drop policy if exists "basvurulari admin okur" on basvurular;
create policy "basvurulari admin okur" on basvurular
  for select to authenticated
  using (admin_mi());

drop policy if exists "basvurulari admin gunceller" on basvurular;
create policy "basvurulari admin gunceller" on basvurular
  for update to authenticated
  using (admin_mi())
  with check (admin_mi());

drop policy if exists "basvuru notlarini admin okur" on basvuru_notlari;
create policy "basvuru notlarini admin okur" on basvuru_notlari
  for select to authenticated
  using (admin_mi());

drop policy if exists "basvuru notunu admin yazar" on basvuru_notlari;
create policy "basvuru notunu admin yazar" on basvuru_notlari
  for insert to authenticated
  with check (admin_mi());

/*
  DIKKAT: form hala /api/kayit uzerinden SERVICE ROLE ile yaziyor ve service
  role RLS'i atliyor. Anonim ziyaretci icin insert politikasi ACILMADI;
  acilsaydi tablo disaridan doldurulabilirdi.
*/
