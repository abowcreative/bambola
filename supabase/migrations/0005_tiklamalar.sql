-- Program ilgisi sayaci. PLAN.md Bolum 35. Tekrar calistirilabilir.

-- --------------------------------------------------------------- tiklamalar

/*
  "Bu programa kaydol" tiklamalarinin SAYISAL kaydi.

  Amac tek: hangi programa kac kisi tiklamis. Kurum bunu WhatsApp
  konusmalarini tek tek sayarak ogrenemez, cunku birçok kisi tiklayip
  yazmiyor -- tiklama ile gelen mesaj arasindaki fark en degerli bilgi.

  KISI TANIMLAYAN HICBIR SEY TUTULMUYOR: IP yok, IP ozeti yok, tarayici
  bilgisi yok, cerez yok, oturum kimligi yok. Yalniz "hangi program, hangi
  sayfadan, ne zaman". Bu yuzden sayac, gizlilik politikasindaki "sizi
  izlemiyoruz" cumlesini bozmuyor; /cerez ve /gizlilik sayfalari bu
  sayacin varligini acikca yaziyor.

  Neden ayri tablo, leadler'e yazilmiyor: tiklama bir TALEP degil. Lead
  tablosuna yazilsaydi donusum orani sahte sekilde bozulurdu -- 100
  tiklama 100 lead gibi gorunurdu.
*/
create table if not exists tiklamalar (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  /* Nereye gitti: simdilik yalniz 'whatsapp'. */
  hedef text not null,
  /* Program ailesi slug'i. Kod tarafinda AILELER ile dogrulaniyor. */
  grup text not null,
  /* Tiklamanin yapildigi sayfa: 'bilgi', 'ucretler', 'program' ... */
  nereden text
);

alter table tiklamalar drop constraint if exists tiklamalar_hedef_check;
alter table tiklamalar add constraint tiklamalar_hedef_check
  check (hedef in ('whatsapp'));

create index if not exists tiklamalar_created_idx
  on tiklamalar (created_at desc);
create index if not exists tiklamalar_grup_idx on tiklamalar (grup);

alter table tiklamalar enable row level security;

/*
  RLS: yalniz admin OKUR. Yazma politikasi HIC YOK.

  Yazma islemi sunucudaki yonlendirme rotasindan servis anahtariyla
  yapiliyor (app/git/whatsapp/route.ts). Anonim istemciye insert izni
  verilseydi sayac tarayici konsolundan sisirilebilirdi ve sayi degersiz
  hale gelirdi.
*/
drop policy if exists "tiklamalari admin okur" on tiklamalar;
create policy "tiklamalari admin okur" on tiklamalar
  for select using (admin_mi());
