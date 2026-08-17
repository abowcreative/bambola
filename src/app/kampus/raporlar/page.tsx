import { adminZorunlu } from "@/lib/kampus/oturum";
import { raporuGetir } from "@/lib/kampus/yoklama";
import { tiklamaOzeti } from "@/lib/kampus/tiklamalar";
import { Kabuk, SayfaBasi, Kutu, Sayac } from "@/components/kampus/kabuk";
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
  const oran = bolen > 0 ? pay / bolen : 0;
  return (
    <div className="border-b border-cizgi py-3 last:border-b-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-murekkep">{etiket}</span>
        <span className="font-baslik text-lg font-bold tabular-nums text-murekkep">
          {yuzde(pay, bolen)}
        </span>
      </div>
      <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-krem-koyu">
        <span
          className="block h-full rounded-full bg-yesil"
          style={{ width: `${Math.min(100, oran * 100)}%` }}
        />
      </span>
      <p className="mt-1 text-xs text-murekkep-soluk">
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
          vurgu={r.toplamBorc - r.toplamTahsilat > 0}
        />
        <Sayac etiket="Sınıf" deger={r.sinifSayisi} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
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
            <div className="flex justify-between border-b border-cizgi pb-2">
              <dt className="text-murekkep-soluk">Tahakkuk</dt>
              <dd className="font-medium tabular-nums text-murekkep">
                {tlYaz(r.toplamBorc)}
              </dd>
            </div>
            <div className="flex justify-between border-b border-cizgi pb-2">
              <dt className="text-murekkep-soluk">Tahsil edilen</dt>
              <dd className="font-medium tabular-nums text-murekkep">
                {tlYaz(r.toplamTahsilat)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-murekkep-soluk">Kalan</dt>
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
            <div>
              <dt className="text-murekkep-soluk">Haftalık seans</dt>
              <dd className="font-baslik text-lg font-bold text-murekkep">
                {SLOTLAR.length}
              </dd>
            </div>
            <div>
              <dt className="text-murekkep-soluk">Açılan sınıf</dt>
              <dd className="font-baslik text-lg font-bold text-murekkep">
                {r.sinifSayisi}
              </dd>
            </div>
            <div>
              <dt className="text-murekkep-soluk">Toplam kontenjan</dt>
              <dd className="font-baslik text-lg font-bold text-murekkep">
                {r.toplamKontenjan}
              </dd>
            </div>
            <div>
              <dt className="text-murekkep-soluk">Öğretmen</dt>
              <dd className="font-baslik text-lg font-bold text-murekkep">
                {EKIP.length}
              </dd>
            </div>
          </dl>
        </Kutu>
      </div>

      {/*
        Program ilgisi: sitedeki "Bu programa kaydol" tiklamalari.
        Basvuru ve lead sayilari "kim yazdi"yi gosteriyor; bu tablo "kim
        ilgilendi ama yazmadi"yi gosteriyor. Ikisi arasindaki fark, hangi
        programin ilgi cekip kayda donmedigini soyluyor.
      */}
      <Kutu
        baslik="Program ilgisi"
        className="mt-5"
        yanCocuk={
          <span className="text-sm text-murekkep-soluk">
            {t.yediGun} tıklama / 7 gün · {t.toplam} toplam
          </span>
        }
      >
        {t.tabloYok ? (
          <p className="py-4 text-sm leading-relaxed text-murekkep">
            <strong>Kurulum eksik:</strong> sayaç tablosu henüz açılmamış.
            <code className="mx-1">supabase/migrations/0005_tiklamalar.sql</code>
            dosyası Supabase SQL Editor&apos;de çalıştırıldığında bu bölüm
            kendiliğinden dolmaya başlar. Site tarafı bu arada normal
            çalışıyor; yalnız sayım yapılmıyor.
          </p>
        ) : t.bosMu ? (
          <p className="py-4 text-sm leading-relaxed text-murekkep-soluk">
            Henüz tıklama kaydı yok. Sitedeki ücret kartlarındaki &quot;Bu
            programa kaydol&quot; düğmesine basan her kişi burada program
            program sayılır. Kişiye dair hiçbir bilgi tutulmaz.
          </p>
        ) : (
          <ul className="divide-y divide-cizgi">
            {t.programlar.map((p) => (
              <li
                key={p.slug}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-baslik text-sm font-bold text-murekkep">
                    {p.ad}
                  </span>
                  <span className="mt-0.5 block text-xs text-murekkep-soluk">
                    {p.yasEtiket}
                    {Object.entries(p.nereden).length > 0 && " · "}
                    {Object.entries(p.nereden)
                      .sort((a, b) => b[1] - a[1])
                      .map(([k, v]) => `${NEREDEN_ETIKET[k] ?? k}: ${v}`)
                      .join(", ")}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-murekkep-soluk">
                  7 gün: <strong className="text-murekkep">{p.yediGun}</strong>
                </span>
                <span className="shrink-0 text-xs text-murekkep-soluk">
                  30 gün: <strong className="text-murekkep">{p.otuzGun}</strong>
                </span>
                <span className="shrink-0 rounded-full bg-lime-rozet px-2.5 py-0.5 font-baslik text-sm font-bold tabular-nums text-black">
                  {p.toplam}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Kutu>

      {bosVeri && (
        <p className="mt-5 rounded-kart border-2 border-dashed border-cizgi bg-white px-5 py-4 text-sm leading-relaxed text-murekkep-soluk">
          Henüz öğrenci, başvuru ve lead kaydı yok. Oranlar veri girildikçe
          anlam kazanacak; şu an gösterilen kapasite bilgileri haftalık
          programdan geliyor.
        </p>
      )}

      <p className="mt-4 text-xs leading-relaxed text-murekkep-soluk">
        Bütün sayılar canlı sorgudan geliyor; önbelleklenmiş bir özet tablosu
        tutulmuyor. Güncellenmeyi unutulan ikinci bir gerçek kaynak
        oluşmasın.
      </p>
    </Kabuk>
  );
}
