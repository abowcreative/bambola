# marka/ klasoru

Buradaki dosyalar dogrudan URL ile sunulur ve **onbellek damgasi tasimaz**.
Yalniz site disindan erisilmesi gereken seyler burada durur:

- `bambola-logo.png` : schema.org `logo` alani ve sosyal medya paylasimlari.
  Mutlak URL ile referans verildigi icin burada olmak zorunda.
- `ikon-512.png` : sadelestirilmis ikon, `npm run favicon` uretir.
- `kibar-anaokulu.png`, `kibar-oyun-merkezi.png` : Kibar tuzel kimlik logolari.
  Kaynak PDF'te raster oldugu icin en fazla 128px kullanilir.

**Sitenin icinde gorunen logo burada DEGIL.** O `src/assets/bambola-logo.svg`
dosyasindan geliyor ve `src/components/site/marka-logosu.tsx` uzerinden
kullaniliyor. Sebep: statik ice aktarimda Next dosyaya icerik damgasi basiyor,
dosya degisince URL de degisiyor ve tarayici eski kopyayi gostermiyor.

**Hicbiri elle duzenlenmez.** Amblem `npm run logo` ile uretiliyor: yesil
vektorun (`src/assets/bambola-kids-zone.svg`) halka yazisi, depo kokundeki
`bambola-final-logo.pdf` icindeki resmi amblemden izlenip degistiriliyor.
Amblem degisirse once `npm run logo`, sonra `npm run favicon`.
