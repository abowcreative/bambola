-- Kampus Asama 3: dersler, yoklama, odemeler, leadler, menuler, duyurular.
-- PLAN.md Bolum 31. Tekrar calistirilabilir.

-- ------------------------------------------------------------------ dersler

/*
  Bir sinifin BELIRLI BIR TARIHTEKI seansi. Sinif haftalik tekrar eden bir
  sablon; ders o sablonun somut ornegi.

  Neden ayri tablo: "bu hafta carsamba dersi islendi mi", "kim isledi", "ne
  yapildi" sorularinin cevabi tarihe bagli. Sinif tablosunda tutulamazdi.
*/
create table if not exists dersler (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz,

  sinif_id uuid not null references siniflar(id) on delete cascade,
  tarih date not null,

  durum text not null default 'planli',
  /*
    Dersi fiilen isleyen ogretmen. Sinifin atanmis ogretmeninden FARKLI
    olabilir: birinin yerine baskasi girmis olabilir ve kayit bunu
    gostermeli.
  */
  isleyen_ogretmen text,
  konu text,
  notlar text
);

alter table dersler drop constraint if exists dersler_durum_check;
alter table dersler add constraint dersler_durum_check
  check (durum in ('planli', 'islendi', 'iptal'));

-- Ayni sinifin ayni gunde iki dersi olamaz.
create unique index if not exists dersler_sinif_tarih_idx
  on dersler (sinif_id, tarih);
create index if not exists dersler_tarih_idx on dersler (tarih desc);
create index if not exists dersler_durum_idx on dersler (durum);

-- ------------------------------------------------------------------ yoklama

create table if not exists yoklama (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz,

  ders_id uuid not null references dersler(id) on delete cascade,
  ogrenci_id uuid not null references ogrenciler(id) on delete cascade,
  durum text not null default 'geldi',
  not_metni text,
  isaretleyen text
);

alter table yoklama drop constraint if exists yoklama_durum_check;
alter table yoklama add constraint yoklama_durum_check
  check (durum in ('geldi', 'gelmedi', 'izinli', 'telafi'));

-- Bir ogrenci bir derste tek kez isaretlenir.
create unique index if not exists yoklama_ders_ogrenci_idx
  on yoklama (ders_id, ogrenci_id);
create index if not exists yoklama_ogrenci_idx on yoklama (ogrenci_id);

-- ----------------------------------------------------------------- odemeler

/*
  Cari hareket. TEK TABLO, `tur` ile ayriliyor:
    borc     -> ogrenciye tahakkuk eden tutar
    tahsilat -> alinan odeme

  Bakiye = toplam borc - toplam tahsilat. Iki ayri tablo tutulsaydi bakiye
  hesabi iki sorgu ve iki yerde tutarlilik demekti.

  Tutar TAM SAYI ve KURUS DEGIL, TL: kurumun butun fiyatlari tam TL
  (9000, 7200) ve ondalikli tutar hic gecmiyor. Kurusa gecmek gerekirse
  ayri bir goc yazilir.
*/
create table if not exists odemeler (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz,

  ogrenci_id uuid not null references ogrenciler(id) on delete cascade,
  -- Hangi sinif kaydina ait. Bos olabilir: kayit disi bir tahsilat olabilir.
  kayit_id uuid references kayitlar(id) on delete set null,

  tur text not null,
  tutar int not null,
  tarih date not null default current_date,
  -- Borcun vadesi. Tahsilatta bos.
  vade date,
  yontem text,
  aciklama text,
  olusturan text
);

alter table odemeler drop constraint if exists odemeler_tur_check;
alter table odemeler add constraint odemeler_tur_check
  check (tur in ('borc', 'tahsilat'));

alter table odemeler drop constraint if exists odemeler_tutar_check;
alter table odemeler add constraint odemeler_tutar_check check (tutar > 0);

alter table odemeler drop constraint if exists odemeler_yontem_check;
alter table odemeler add constraint odemeler_yontem_check
  check (yontem is null or yontem in ('nakit', 'kart', 'havale', 'diger'));

create index if not exists odemeler_ogrenci_idx on odemeler (ogrenci_id, tarih);
create index if not exists odemeler_vade_idx on odemeler (vade)
  where tur = 'borc';

-- ------------------------------------------------------------------ leadler

/*
  Web formu DISINDAN gelen talepler: Instagram mesaji, telefon, tavsiye,
  tabela. `basvurular` tablosuna konmadi cunku o tablo formun sema
  dogrulamasindan geciyor ve zorunlu alanlari var; lead'de cogu zaman
  yalniz bir ad ve telefon oluyor.
*/
create table if not exists leadler (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz,

  ad_soyad text not null,
  telefon text,
  kaynak text not null default 'instagram',
  cocuk_adi text,
  cocuk_dogum date,
  ilgilendigi_program text,
  durum text not null default 'yeni',
  notlar text,
  olusturan text,
  -- Lead ogrenciye dondugunde baglanti.
  ogrenci_id uuid references ogrenciler(id) on delete set null
);

alter table leadler drop constraint if exists leadler_kaynak_check;
alter table leadler add constraint leadler_kaynak_check
  check (kaynak in ('instagram', 'telefon', 'tavsiye', 'tabela', 'whatsapp', 'diger'));

alter table leadler drop constraint if exists leadler_durum_check;
alter table leadler add constraint leadler_durum_check
  check (durum in ('yeni', 'gorusuldu', 'kayit_oldu', 'kayip'));

create index if not exists leadler_durum_idx on leadler (durum, created_at desc);

-- ------------------------------------------------------------------ menuler

create table if not exists menuler (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz,

  tarih date not null unique,
  kahvalti text,
  ogle text,
  ara_ogun text,
  notlar text
);

create index if not exists menuler_tarih_idx on menuler (tarih desc);

-- ---------------------------------------------------------------- duyurular

create table if not exists duyurular (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz,

  baslik text not null,
  metin text not null,
  -- Kimin gorecegi. Rol adlariyla ayni sozluk kullaniliyor.
  hedef text not null default 'hepsi',
  yayinda boolean not null default false,
  olusturan text
);

alter table duyurular drop constraint if exists duyurular_hedef_check;
alter table duyurular add constraint duyurular_hedef_check
  check (hedef in ('hepsi', 'ogretmen', 'veli'));

create index if not exists duyurular_yayin_idx
  on duyurular (yayinda, created_at desc);

-- ------------------------------------------------------- updated_at tetikle

do $$
declare t text;
begin
  foreach t in array array['dersler','yoklama','odemeler','leadler','menuler','duyurular'] loop
    execute format('drop trigger if exists %I_updated_at_trg on %I', t, t);
    execute format(
      'create trigger %I_updated_at_trg before update on %I
       for each row execute function basvurular_updated_at()', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------- RLS

alter table dersler enable row level security;
alter table yoklama enable row level security;
alter table odemeler enable row level security;
alter table leadler enable row level security;
alter table menuler enable row level security;
alter table duyurular enable row level security;

-- --- dersler: admin her sey, ogretmen kendi siniflari ---
drop policy if exists "dersleri admin yonetir" on dersler;
create policy "dersleri admin yonetir" on dersler
  for all to authenticated using (admin_mi()) with check (admin_mi());

drop policy if exists "ogretmen kendi dersini okur" on dersler;
create policy "ogretmen kendi dersini okur" on dersler
  for select to authenticated
  using (exists (
    select 1 from siniflar s
    where s.id = dersler.sinif_id and s.ogretmen_ad = ogretmen_adim()
  ));

/*
  Ogretmen kendi dersini ISLEYEBILIR: yoklama almak ve "islendi"
  isaretlemek onun isi. Baska sinifin dersine dokunamiyor.
*/
drop policy if exists "ogretmen kendi dersini isler" on dersler;
create policy "ogretmen kendi dersini isler" on dersler
  for update to authenticated
  using (exists (
    select 1 from siniflar s
    where s.id = dersler.sinif_id and s.ogretmen_ad = ogretmen_adim()
  ))
  with check (exists (
    select 1 from siniflar s
    where s.id = dersler.sinif_id and s.ogretmen_ad = ogretmen_adim()
  ));

drop policy if exists "veli cocugunun dersini okur" on dersler;
create policy "veli cocugunun dersini okur" on dersler
  for select to authenticated
  using (exists (
    select 1 from kayitlar k
    join ogrenci_veli ov on ov.ogrenci_id = k.ogrenci_id
    where k.sinif_id = dersler.sinif_id and ov.veli_id = veli_kaydim()
  ));

-- --- yoklama ---
drop policy if exists "yoklamayi admin yonetir" on yoklama;
create policy "yoklamayi admin yonetir" on yoklama
  for all to authenticated using (admin_mi()) with check (admin_mi());

/*
  Ogretmen kendi dersinin yoklamasini alir ve degistirir. Yoklama almak
  ogretmenin asil isi; admin onayina baglamak gunluk akisi kilitler.
*/
drop policy if exists "ogretmen kendi yoklamasini yonetir" on yoklama;
create policy "ogretmen kendi yoklamasini yonetir" on yoklama
  for all to authenticated
  using (exists (
    select 1 from dersler d
    join siniflar s on s.id = d.sinif_id
    where d.id = yoklama.ders_id and s.ogretmen_ad = ogretmen_adim()
  ))
  with check (exists (
    select 1 from dersler d
    join siniflar s on s.id = d.sinif_id
    where d.id = yoklama.ders_id and s.ogretmen_ad = ogretmen_adim()
  ));

drop policy if exists "veli cocugunun yoklamasini okur" on yoklama;
create policy "veli cocugunun yoklamasini okur" on yoklama
  for select to authenticated
  using (exists (
    select 1 from ogrenci_veli ov
    where ov.ogrenci_id = yoklama.ogrenci_id and ov.veli_id = veli_kaydim()
  ));

-- --- odemeler: PARA. Ogretmen HIC gormuyor. ---
drop policy if exists "odemeleri admin yonetir" on odemeler;
create policy "odemeleri admin yonetir" on odemeler
  for all to authenticated using (admin_mi()) with check (admin_mi());

drop policy if exists "veli kendi borcunu okur" on odemeler;
create policy "veli kendi borcunu okur" on odemeler
  for select to authenticated
  using (exists (
    select 1 from ogrenci_veli ov
    where ov.ogrenci_id = odemeler.ogrenci_id and ov.veli_id = veli_kaydim()
  ));

-- --- leadler: yalniz admin ---
drop policy if exists "leadleri admin yonetir" on leadler;
create policy "leadleri admin yonetir" on leadler
  for all to authenticated using (admin_mi()) with check (admin_mi());

-- --- menuler: admin yazar, herkes okur (alerji ve beslenme bilgisi) ---
drop policy if exists "menuyu admin yonetir" on menuler;
create policy "menuyu admin yonetir" on menuler
  for all to authenticated using (admin_mi()) with check (admin_mi());

drop policy if exists "menuyu herkes okur" on menuler;
create policy "menuyu herkes okur" on menuler
  for select to authenticated using (rolum() is not null);

-- --- duyurular: admin yazar, hedef kitle okur ---
drop policy if exists "duyuruyu admin yonetir" on duyurular;
create policy "duyuruyu admin yonetir" on duyurular
  for all to authenticated using (admin_mi()) with check (admin_mi());

/*
  Yalniz YAYINDA olan ve hedefine uyan duyuru goruluyor. Taslak duyuru
  kimseye gorunmuyor -- yazilmakta olan bir metin veliye dusmesin.
*/
drop policy if exists "duyuruyu hedefi okur" on duyurular;
create policy "duyuruyu hedefi okur" on duyurular
  for select to authenticated
  using (yayinda and (hedef = 'hepsi' or hedef = rolum()));
