import { adminZorunlu } from "@/lib/kampus/oturum";
import { raporuGetir } from "@/lib/kampus/yoklama";
import { tiklamaOzeti } from "@/lib/kampus/tiklamalar";
import { Kabuk, SayfaBasi, Kutu } from "@/components/kampus/kabuk";
import { Bildirim, Ilerleme, Rozet, Sayac } from "@/components/kampus/ui";
import { Ikon } from "@/components/ui/ikon";
import { tlYaz } from "@/lib/data/ucretler";
import { SLOTLAR } from "@/lib/data/program";
import { EKIP } from "@/lib/data/ekip";

export const metadata = { title: "Raporlar", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Tiklamanin yapildigi sayfanin okunur adi. */
const NEREDEN_ETIKET: Record<string, string> = {
  bilgi: "bilgi sayfası",
  ucretler: "ücretler",
  program: "program sayfası",
  bilinmiyor: "bilinmiyor",
};

/** Yuzde. Bolen sifirsa tire. */
function yuzde(pay: number, bolen: number): string {
  if (bolen === 0) return "—";
  return `%${Math.round((pay / bolen) * 100)}`;
}

function Oran({
  etiket,
  pay,
  bolen,
  aciklama,
}: {
  etiket: string;
  pay: number;
  bolen: number;
  aciklama: string;
}) {
  return (
    <div className="border-b border-panel-cizgi py-2.5 last:border-b-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-murekkep">{etiket}</span>
        <span className="font-baslik text-base font-bold tabular-nums text-murekkep">
          {yuzde(pay, bolen)}
        </span>
      </div>
      <Ilerleme deger={pay} toplam={bolen} ton="basari" className="mt-1.5" />
      <p className="mt-1 text-xs text-panel-silik">
        {pay} / {bolen} · {aciklama}
      </p>
    </div>
  );
}

/**
 * Raporlar.
 *
 * Hepsi CANLI sorgu, onbelleklenmis ozet tablosu yok: veri hacmi kucuk
 * (yuzlerce satir) ve ozet tablosu tutmak, guncellenmeyi unutulan bir
 * ikinci gercek kaynak yaratir.
 */
export default async function RaporlarSayfasi() {
  const oturum = await adminZorunlu();
  const [r, t] = await Promise.all([raporuGetir(), tiklamaOzeti()]);

  const bosVeri =
    r.ogrenciSayisi === 0 && r.basvuruSayisi === 0 && r.leadSayisi === 0;

  return (
    <Kabuk oturum={oturum} aktifYol="/kampus/raporlar">
      <SayfaBasi
        baslik="Raporlar"
        aciklama="Doluluk, dönüşüm, devam ve tahsilat özetleri."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Sayac
          etiket="Aktif öğrenci"
          deger={r.aktifOgrenci}
          alt={`${r.ogrenciSayisi} kayıtlı`}
        />
        <Sayac
          etiket="Doluluk"
          deger={yuzde(r.toplamKayit, r.toplamKontenjan)}
          alt={`${r.toplamKayit}/${r.toplamKontenjan} yer`}
        />
        <Sayac
          etiket="Açık bakiye"
          deger={tlYaz(Math.max(0, r.toplamBorc - r.toplamTahsilat))}
          ton={r.toplamBorc - r.toplamTahsilat > 0 ? "uyari" : "notr"}
        />
        <Sayac etiket="Sınıf" deger={r.sinifSayisi} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Kutu baslik="Dönüşüm">
          <Oran
            etiket="Web başvurusundan kayda"
            pay={r.kayitOlanBasvuru}
            bolen={r.basvuruSayisi}
            aciklama="formdan gelen talepler"
          />
          <Oran
            etiket="Lead'den kayda"
            pay={r.leadKazanilan}
            bolen={r.leadSayisi}
            aciklama="Instagram, telefon, tavsiye"
          />
        </Kutu>

        <Kutu baslik="Devam">
          <Oran
            etiket="Derse geliş"
            pay={r.gelenIsaret}
            bolen={r.gelenIsaret + r.gelmedenIsaret}
            aciklama="işaretlenmiş yoklamalar"
          />
          <Oran
            etiket="İşlenen ders"
            pay={r.islenenDers}
            bolen={r.islenenDers + r.planliDers}
            aciklama="açılmış dersler"
          />
        </Kutu>

        <Kutu baslik="Tahsilat">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-panel-cizgi pb-2">
              <dt className="text-panel-soluk">Tahakkuk</dt>
              <dd className="font-medium tabular-nums text-murekkep">
                {tlYaz(r.toplamBorc)}
              </dd>
            </div>
            <div className="flex justify-between border-b border-panel-cizgi pb-2">
              <dt className="text-panel-soluk">Tahsil edilen</dt>
              <dd className="font-medium tabular-nums text-basari">
                {tlYaz(r.toplamTahsilat)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-panel-soluk">Kalan</dt>
              <dd className="font-baslik font-bold tabular-nums text-murekkep">
                {tlYaz(r.toplamBorc - r.toplamTahsilat)}
              </dd>
            </div>
          </dl>
          <div className="mt-3">
            <Oran
              etiket="Tahsilat oranı"
              pay={r.toplamTahsilat}
              bolen={r.toplamBorc}
              aciklama="tahakkuka göre"
            />
          </div>
        </Kutu>

        <Kutu baslik="Kapasite">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {(
              [
                ["Haftalık seans", SLOTLAR.length],
                ["Açılan sınıf", r.sinifSayisi],
                ["Toplam kontenjan", r.toplamKontenjan],
                ["Öğretmen", EKIP.length],
              ] as const
            ).map(([etiket, deger]) => (
              <div key={etiket}>
                <dt className="text-panel-soluk">{etiket}</dt>
                <dd className="font-baslik text-lg font-bold tabular-nums text-murekkep">
                  {deger}
                </dd>
              </div>
            ))}
          </dl>
        </Kutu>
      </div>

      {/*
        Program ilgisi: sitedeki "Detayli bilgi al" tiklamalari.
        Basvuru ve lead sayilari "kim yazdi"yi gosteriyor; bu tablo "kim
        ilgilendi ama yazmadi"yi gosteriyor. Ikisi arasindaki fark, hangi
        programin ilgi cekip kayda donmedigini soyluyor.
      */}
      <Kutu
        baslik="Program ilgisi"
        className="mt-4"
        yanCocuk={
          <span className="text-xs text-panel-silik">
            {t.yediGun} tıklama / 7 gün · {t.toplam} toplam
          </span>
        }
      >
        {t.tabloYok ? (
          <Bildirim
            ton="uyari"
            baslik="Kurulum eksik"
            ikon={<Ikon.Ampul boyut={16} />}
          >
            Sayaç tablosu henüz açılmamış.{" "}
            <code className="rounded bg-panel-yuzey px-1 py-0.5 font-mono text-xs">
              supabase/migrations/0005_tiklamalar.sql
            </code>{" "}
            dosyası Supabase SQL Editor&apos;de çalıştırıldığında bu bölüm
            kendiliğinden dolmaya başlar. Site tarafı bu arada normal
            çalışıyor; yalnız sayım yapılmıyor.
          </Bildirim>
        ) : t.bosMu ? (
          <p className="py-4 text-sm leading-relaxed text-panel-soluk">
            Henüz tıklama kaydı yok. Sitedeki ücret kartlarındaki &quot;Detaylı
            bilgi al&quot; düğmesine basan her kişi burada program
            program sayılır. Kişiye dair hiçbir bilgi tutulmaz.
          </p>
        ) : (
          <ul className="divide-y divide-panel-cizgi">
            {t.programlar.map((p) => (
              <li
                key={p.slug}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-murekkep">
                    {p.ad}
                  </span>
                  <span className="mt-0.5 block text-xs text-panel-soluk">
                    {p.yasEtiket}
                    {Object.entries(p.nereden).length > 0 && " · "}
                    {Object.entries(p.nereden)
                      .sort((a, b) => b[1] - a[1])
                      .map(([k, v]) => `${NEREDEN_ETIKET[k] ?? k}: ${v}`)
                      .join(", ")}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-panel-soluk">
                  7 gün: <strong className="text-murekkep">{p.yediGun}</strong>
                </span>
                <span className="shrink-0 text-xs text-panel-soluk">
                  30 gün: <strong className="text-murekkep">{p.otuzGun}</strong>
                </span>
                <Rozet ton="vurgu">{p.toplam}</Rozet>
              </li>
            ))}
          </ul>
        )}
      </Kutu>

      {bosVeri && (
        <div className="mt-4">
          <Bildirim ton="bilgi">
            Henüz öğrenci, başvuru ve lead kaydı yok. Oranlar veri girildikçe
            anlam kazanacak; şu an gösterilen kapasite bilgileri haftalık
            programdan geliyor.
          </Bildirim>
        </div>
      )}

      <p className="mt-3 text-xs leading-relaxed text-panel-silik">
        Bütün sayılar canlı sorgudan geliyor; önbelleklenmiş bir özet tablosu
        tutulmuyor. Güncellenmeyi unutulan ikinci bir gerçek kaynak
        oluşmasın.
      </p>
    </Kabuk>
  );
}
