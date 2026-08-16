-- Bambola kayit talepleri.
-- PLAN.md Bolum 8'den birebir, artik alanlarla genisletildi.
-- Supabase SQL Editor'e yapistirilip calistirilir.

create table if not exists basvurular (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- kol: hangi kurum
  kurum text not null default 'oyun-evi',      -- oyun-evi | anaokulu | parti

  -- cocuk
  cocuk_adi text,
  dogum_tarihi date not null,
  yas_ay int not null,                          -- gonderim anindaki ay, sonradan hesaplanmaz

  -- secim
  program_slug text,                            -- okula-hazirlik | gelisim-odakli-oyun | bebek | ingilizce | tek-seferlik | serbest-oyun
  paket_kod text,                               -- tek-sefer | ayda-4 | ayda-8 | ayda-12
  secilen_slotlar jsonb not null default '[]',  -- [{id, gun, bas, bit, atolye, ogretmenler}]
  saat_uymuyor boolean not null default false,
  saat_notu text,

  -- fiyat (gonderim anindaki hali, sonradan fiyat degisse de kayit bozulmaz)
  fiyat_normal int,
  fiyat_erken_kayit int,
  erken_kayit_uygulandi boolean not null default true,

  -- veli
  veli_adi text not null,
  telefon text not null,                        -- 5XXXXXXXXX olarak normalize edilir
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
  user_agent text,
  ip_hash text                                  -- rate limit icin, ham IP saklanmaz
);

create index if not exists basvurular_created_at_idx on basvurular (created_at desc);
create index if not exists basvurular_durum_idx on basvurular (durum);
create index if not exists basvurular_kurum_idx on basvurular (kurum);
create index if not exists basvurular_telefon_idx on basvurular (telefon);

-- Durum ve kurum degerleri serbest metin olmasin.
alter table basvurular drop constraint if exists basvurular_durum_check;
alter table basvurular add constraint basvurular_durum_check
  check (durum in ('yeni','arandi','ulasilamadi','kayit_oldu','vazgecti'));

alter table basvurular drop constraint if exists basvurular_kurum_check;
alter table basvurular add constraint basvurular_kurum_check
  check (kurum in ('oyun-evi','anaokulu','parti'));

-- updated_at otomatik dolsun.
create or replace function basvurular_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists basvurular_updated_at_trg on basvurular;
create trigger basvurular_updated_at_trg
  before update on basvurular
  for each row execute function basvurular_updated_at();

-- Admin notlari gecmisi (PLAN.md Bolum 8, ikinci tur icin hazir).
create table if not exists basvuru_notlari (
  id uuid primary key default gen_random_uuid(),
  basvuru_id uuid not null references basvurular(id) on delete cascade,
  created_at timestamptz not null default now(),
  yazan text,
  metin text not null
);

create index if not exists basvuru_notlari_basvuru_idx on basvuru_notlari (basvuru_id, created_at desc);

-- ---------------------------------------------------------------------- RLS

alter table basvurular enable row level security;
alter table basvuru_notlari enable row level security;

-- Anonim kullanici hicbir sey yapamaz.
-- Form /api/kayit uzerinden service role ile yazilir; boylece sunucuda
-- yas dogrulamasi, fiyat hesabi ve rate limit calisir (PLAN.md Bolum 8 notu).
-- Service role RLS'i atlar, o yuzden anon icin insert politikasi da acilmaz.
drop policy if exists "anon insert" on basvurular;

drop policy if exists "admin read" on basvurular;
create policy "admin read" on basvurular
  for select to authenticated using (true);

drop policy if exists "admin update" on basvurular;
create policy "admin update" on basvurular
  for update to authenticated using (true) with check (true);

drop policy if exists "admin notlari read" on basvuru_notlari;
create policy "admin notlari read" on basvuru_notlari
  for select to authenticated using (true);

drop policy if exists "admin notlari insert" on basvuru_notlari;
create policy "admin notlari insert" on basvuru_notlari
  for insert to authenticated with check (true);
