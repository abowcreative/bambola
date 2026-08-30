-- Kampus: basvuru ve basvuru notu silme yetkisi.
-- Supabase SQL Editor'e yapistirilip calistirilir. Tekrar calistirilabilir.

/*
  0001 ve 0002 basvurular tablosuna yalniz SELECT ve UPDATE politikasi
  koymustu. O zaman panelde silme yoktu ve kasitli bir tercihti: formdan
  gelen bir talep silinmez, durumu degisir.

  Silme simdi aciliyor cunku panelde temizlenmesi gereken tek sey durum
  degil: bot doldurmasi, deneme kaydi, ayni kisinin iki kez gonderdigi form.
  Bunlarin "vazgecti" olarak durmasi donusum oranini bozuyor.

  Politika olmadan `delete` cagrisi HATA VERMIYOR, sadece hicbir satiri
  silmiyordu; arayuzde basariyla silinmis gibi gorunup liste degismiyordu.
*/

drop policy if exists "basvurulari admin siler" on basvurular;
create policy "basvurulari admin siler" on basvurular
  for delete to authenticated
  using (admin_mi());

/*
  Notlar zaten basvuruya `on delete cascade` bagli; bu politika notu
  basvurudan bagimsiz silebilmek icin (yanlis yazilmis gorusme notu).
*/
drop policy if exists "basvuru notunu admin siler" on basvuru_notlari;
create policy "basvuru notunu admin siler" on basvuru_notlari
  for delete to authenticated
  using (admin_mi());
