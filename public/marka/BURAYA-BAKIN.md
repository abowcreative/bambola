# marka/ klasoru

Buradaki dosyalar dogrudan URL ile sunulur ve **onbellek damgasi tasimaz**.
Yalniz site disindan erisilmesi gereken seyler burada durur:

- `bambola-logo.png` : schema.org `logo` alani ve sosyal medya paylasimlari.
  Mutlak URL ile referans verildigi icin burada olmak zorunda.
- `ikon-512.png` : sadelestirilmis ikon, `npm run favicon` uretir.
- `kibar-anaokulu.png`, `kibar-oyun-merkezi.png` : Kibar tuzel kimlik logolari.
  Kaynak PDF'te raster oldugu icin en fazla 128px kullanilir.

**Sitenin icinde gorunen logo burada DEGIL.** O `src/assets/bambola-logo.png`
dosyasindan geliyor ve `src/components/site/marka-logosu.tsx` uzerinden
kullaniliyor. Sebep: statik ice aktarimda Next dosyaya icerik damgasi basiyor,
dosya degisince URL de degisiyor ve tarayici eski kopyayi gostermiyor.

**Iki PNG de elle duzenlenmez.** Ikisini de `npm run logo` uretiyor; kaynak
depo kokundeki `bambola-final-logo.pdf`. Amblem degisirse o PDF degistirilip
`npm run logo` ve ardindan `npm run favicon` calistirilir.
