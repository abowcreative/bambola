-- Kampus: "KAYITLI COCUK LISTESI" Excel'inin panele tasinmasi.
-- PLAN.md Bolum 42. Tekrar calistirilabilir.
--
-- Excel'de alti ayri sey tutuluyordu ve hepsi buraya geliyor:
--   GENEL LISTE           -> ogrenciler (yeni sutunlar) + veliler
--   Aylik sayfalar        -> paket_satislari  (odeme defteri)
--   DOGUM GUNU            -> dogum_gunu_partileri
--   ELDEN VERDIGIMIZ ...  -> giderler
--   SU YUKLEME            -> su_karti
--   DEVAMSIZLIK CIZELGESI -> devamsizlik_cizelgesi
-- Ayrica her sayfanin HAM hali excel_sayfalari tablosunda hucre hucre
-- duruyor: yapilandirilmis tablolarda bir sey eksik kalsa bile kaynak
-- kaybolmuyor.

-- ------------------------------------------------------------- ogrenciler

/*
  Dogum tarihi ARTIK ZORUNLU DEGIL. Excel'in "DOGUM GUNU" sutunu cogu satirda
  yalniz gun-ay tasiyor (yil yer tutucu), bazisinda bos. Uydurma bir tarih
  yazmak yerine alan bos kaliyor; yas gosterimi "ilk kayit yasi" metnine
  dusuyor.
*/
alter table ogrenciler alter column dogum_tarihi drop not null;

alter table ogrenciler
  add column if not exists excel_no text,
  add column if not exists excel_adi text,
  add column if not exists excel_kaynak text,
  add column if not exists ilk_kayit_yas text,
  add column if not exists dogum_gunu date,
  add column if not exists katilim_durumu text,
  add column if not exists paket text,
  add column if not exists program_metni text,
  add column if not exists son_odeme_tarihi date,
  add column if not exists son_odenen text,
  add column if not exists son_odeme_turu text,
  add column if not exists ikametgah text,
  add column if not exists kalan_hak_saat int,
  add column if not exists gelis_hakki int,
  add column if not exists toplam_odenen int,
  add column if not exists toplam_odenen_formul text,
  add column if not exists guncellenme_tarihi date,
  add column if not exists excel_notu text,
  add column if not exists ilk_ders_tarihi date;

comment on column ogrenciler.excel_no is 'GENEL LISTE A sutunu: sira no, eski no, TC ya da *';
comment on column ogrenciler.excel_adi is 'Excel''de yazildigi haliyle cocuk adi';
comment on column ogrenciler.excel_kaynak is 'Hangi sayfa ve satirdan geldi, ornek: GENEL LISTE!7';
comment on column ogrenciler.dogum_gunu is 'GENEL LISTE "DOGUM GUNU" sutunu, oldugu gibi';
comment on column ogrenciler.katilim_durumu is 'Excel''deki ham durum: AKTIF / PASIF / AYRILDI / TEK SEFER';
comment on column ogrenciler.toplam_odenen is 'Excel formulunun son degeri; canli toplam paket_satislari uzerinden hesaplanir';

create unique index if not exists ogrenciler_excel_kaynak_idx
  on ogrenciler (excel_kaynak) where excel_kaynak is not null;

-- ---------------------------------------------------------------- veliler

/* Excel'de uc velinin telefonu yok. Bos birakiliyor, uydurulmuyor. */
alter table veliler alter column telefon drop not null;

alter table veliler
  add column if not exists telefon_ham text,
  add column if not exists alternatif_telefon text,
  add column if not exists excel_adi text;

-- ---------------------------------------------------------- paket_satislari

/*
  ODEME DEFTERI. Excel'deki aylik sayfalarin birebir karsiligi: her satir
  bir paket satisi / alinan odeme. `odemeler` tablosundan AYRI cunku o
  tablo borc-tahsilat muhasebesi tutuyor ve tutar sifirdan buyuk olmak
  zorunda; Excel'de ise "IADE YAPILDI", "7000 NAKIT ODEYECEK" gibi tutarsiz
  satirlar da var ve onlar da kayit.

  `ogrenci_id` bos olabilir: cocuk eslestirilememisse satir yine duruyor,
  adiyla. Bir odeme kaydi "kime ait oldugu bilinmiyor" diye silinmez.
*/
create table if not exists paket_satislari (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz,

  ogrenci_id uuid references ogrenciler(id) on delete set null,
  cocuk_adi text not null,
  veli_adi text,

  tarih date,
  -- Tarih hucresi tarih degilse ("MART", "SUBAT_18.03.2025") buraya.
  tarih_ham text,
  paket text,
  program text,
  tutar int,
  -- Tutar hucresi duz sayi degilse ("2500kk 2500 nakit") buraya.
  tutar_ham text,
  odeme_turu text,
  yontem text,
  aciklama text,

  -- Ay anahtari: 2026-09. Defter bununla gruplaniyor.
  ay text not null,
  -- Excel sayfa adi ("EYLUL'26") ya da panelden girildiyse bos.
  sayfa text,
  bolum text,
  kaynak text not null default 'panel',
  kaynak_satir int,
  -- Sayfaya ozgu ek sutunlar (2025 sablonu: dogum tarihi, yas, adres...).
  ek_alanlar jsonb,
  olusturan text
);

alter table paket_satislari drop constraint if exists paket_satislari_yontem_check;
alter table paket_satislari add constraint paket_satislari_yontem_check
  check (yontem is null or yontem in ('nakit', 'kart', 'havale', 'karisik', 'diger'));

alter table paket_satislari drop constraint if exists paket_satislari_tutar_check;
alter table paket_satislari add constraint paket_satislari_tutar_check
  check (tutar is null or tutar >= 0);

alter table paket_satislari drop constraint if exists paket_satislari_kaynak_check;
alter table paket_satislari add constraint paket_satislari_kaynak_check
  check (kaynak in ('excel', 'panel'));

create index if not exists paket_satislari_ay_idx on paket_satislari (ay, tarih);
create index if not exists paket_satislari_ogrenci_idx
  on paket_satislari (ogrenci_id, tarih desc);
create index if not exists paket_satislari_kaynak_idx
  on paket_satislari (kaynak, sayfa, kaynak_satir);

-- ------------------------------------------------------ dogum_gunu_partileri

create table if not exists dogum_gunu_partileri (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz,

  cocuk_adi text,
  veli_adi text,
  telefon text,
  cocuk_yas text,
  dogum_gunu date,
  kapora int,
  kapora_ham text,
  organizasyon_tarihi date,
  saat text,
  anlasilan_fiyat int,
  kalan_odeme int,
  cocuk_sayisi int,
  yetiskin_sayisi int,
  yemek text,
  susleme text,
  mahalle text,
  aciklama text,
  ek_not text,

  -- Cocuk bizim ogrencimizse baglanti. Telefonla eslestiriliyor.
  ogrenci_id uuid references ogrenciler(id) on delete set null,
  kaynak text not null default 'panel',
  kaynak_satir int,
  olusturan text
);

alter table dogum_gunu_partileri drop constraint if exists dogum_gunu_partileri_kaynak_check;
alter table dogum_gunu_partileri add constraint dogum_gunu_partileri_kaynak_check
  check (kaynak in ('excel', 'panel'));

create index if not exists dogum_gunu_partileri_tarih_idx
  on dogum_gunu_partileri (organizasyon_tarihi desc);

-- ------------------------------------------------------------------ giderler

/* "ELDEN VERDIGIMIZ ODEMELER": tarih, tutar, aciklama. Kasa defteri. */
create table if not exists giderler (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz,

  tarih date not null,
  tutar int not null,
  aciklama text not null,
  ek_not text,
  kaynak text not null default 'panel',
  kaynak_satir int,
  olusturan text
);

alter table giderler drop constraint if exists giderler_kaynak_check;
alter table giderler add constraint giderler_kaynak_check
  check (kaynak in ('excel', 'panel'));

create index if not exists giderler_tarih_idx on giderler (tarih desc);

-- ------------------------------------------------------------------ su_karti

/* "SU YUKLEME" sayfasi: iki satirlik durum kutusu. */
create table if not exists su_karti (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz,

  etiket text not null,
  tarih date,
  tl int,
  stok int,
  stok_formul text,
  kaynak text not null default 'panel',
  kaynak_satir int
);

-- ---------------------------------------------------- devamsizlik_cizelgesi

/*
  Excel'deki cocuk x ay tablosu. Sutun basliklari sabit degil (ARALIK'24,
  OCAK'25 ...), o yuzden jsonb: [{"baslik": "OCAK'25", "deger": "v"}, ...].
  Canli yoklama `yoklama` tablosunda; bu tablo Excel'in tasidigi gecmis.
*/
create table if not exists devamsizlik_cizelgesi (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz,

  cocuk_adi text not null,
  ogrenci_id uuid references ogrenciler(id) on delete set null,
  sutunlar jsonb not null default '[]'::jsonb,
  kaynak text not null default 'panel',
  kaynak_satir int
);

-- ------------------------------------------------------------ excel_sayfalari

/*
  HAM ARSIV. Her sayfa, satir satir ve hucre hucre: deger, formul, yorum,
  tarih. Yapilandirilmis tablolara tasinirken bir sutun yorumlanmis olsa
  bile burada Excel'in kendisi duruyor. Panelde salt okunur gosteriliyor.
*/
create table if not exists excel_sayfalari (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz,

  dosya text not null,
  sayfa_adi text not null,
  sira int not null,
  gizli boolean not null default false,
  boyut text,
  sutun_sayisi int not null default 0,
  satirlar jsonb not null default '[]'::jsonb,
  hucre_sayisi int not null default 0,
  ice_aktarim timestamptz not null default now(),
  unique (dosya, sayfa_adi)
);

-- ------------------------------------------------------- updated_at tetikle

do $$
declare t text;
begin
  foreach t in array array[
    'paket_satislari','dogum_gunu_partileri','giderler','su_karti',
    'devamsizlik_cizelgesi','excel_sayfalari'
  ] loop
    execute format('drop trigger if exists %I_updated_at_trg on %I', t, t);
    execute format(
      'create trigger %I_updated_at_trg before update on %I
       for each row execute function basvurular_updated_at()', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------- RLS

alter table paket_satislari enable row level security;
alter table dogum_gunu_partileri enable row level security;
alter table giderler enable row level security;
alter table su_karti enable row level security;
alter table devamsizlik_cizelgesi enable row level security;
alter table excel_sayfalari enable row level security;

-- Para ve kasa: yalniz yonetici. Ogretmen hicbirini gormuyor.
drop policy if exists "paket satislarini admin yonetir" on paket_satislari;
create policy "paket satislarini admin yonetir" on paket_satislari
  for all to authenticated using (admin_mi()) with check (admin_mi());

/* Veli kendi cocugunun odeme defterini okuyabilir (odemeler ile ayni kural). */
drop policy if exists "veli kendi cocugunun defterini okur" on paket_satislari;
create policy "veli kendi cocugunun defterini okur" on paket_satislari
  for select to authenticated
  using (ogrenci_id is not null and exists (
    select 1 from ogrenci_veli ov
    where ov.ogrenci_id = paket_satislari.ogrenci_id and ov.veli_id = veli_kaydim()
  ));

drop policy if exists "dogum gunlerini admin yonetir" on dogum_gunu_partileri;
create policy "dogum gunlerini admin yonetir" on dogum_gunu_partileri
  for all to authenticated using (admin_mi()) with check (admin_mi());

drop policy if exists "giderleri admin yonetir" on giderler;
create policy "giderleri admin yonetir" on giderler
  for all to authenticated using (admin_mi()) with check (admin_mi());

drop policy if exists "su kartini admin yonetir" on su_karti;
create policy "su kartini admin yonetir" on su_karti
  for all to authenticated using (admin_mi()) with check (admin_mi());

drop policy if exists "devamsizlik cizelgesini admin yonetir" on devamsizlik_cizelgesi;
create policy "devamsizlik cizelgesini admin yonetir" on devamsizlik_cizelgesi
  for all to authenticated using (admin_mi()) with check (admin_mi());

drop policy if exists "ogretmen devamsizlik cizelgesini okur" on devamsizlik_cizelgesi;
create policy "ogretmen devamsizlik cizelgesini okur" on devamsizlik_cizelgesi
  for select to authenticated using (ogretmen_adim() is not null);

drop policy if exists "excel arsivini admin yonetir" on excel_sayfalari;
create policy "excel arsivini admin yonetir" on excel_sayfalari
  for all to authenticated using (admin_mi()) with check (admin_mi());
