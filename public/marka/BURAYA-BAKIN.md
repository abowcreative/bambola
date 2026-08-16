# marka/ klasoru

Buradaki dosyalar dogrudan URL ile sunulur ve **onbellek damgasi tasimaz**.
Yalniz site disindan erisilmesi gereken seyler burada durur:

- `bambola-kids-zone.png` : schema.org `logo` ve `image` alanlari, sosyal medya
  paylasimlari. Mutlak URL ile referans verildigi icin burada olmak zorunda.
- `kibar-anaokulu.png`, `kibar-oyun-merkezi.png` : Kibar tuzel kimlik logolari.
  Kaynak PDF'te raster oldugu icin en fazla 128px kullanilir.

**Sitenin icinde gorunen logo burada DEGIL.** O `src/assets/bambola-kids-zone.svg`
dosyasindan geliyor ve `src/components/site/marka-logosu.tsx` uzerinden
kullaniliyor. Sebep: statik ice aktarimda Next dosyaya icerik damgasi basiyor,
dosya degisince URL de degisiyor ve tarayici eski kopyayi gostermiyor.

Logoyu degistirecekseniz `src/assets/` altindakini degistirin.
