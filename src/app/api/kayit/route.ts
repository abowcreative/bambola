import { NextResponse } from "next/server";
import { kayitSemasi } from "@/lib/schema";
import {
  yoneticiIstemcisi,
  eksikSupabaseAnahtarlari,
} from "@/lib/supabase/server";
import { ipOzeti, istekIp, sinirAsildiMi } from "@/lib/rate-limit";
import { ayHesapla, slotUygunMu } from "@/lib/yas";
import { slotBul } from "@/lib/data/program";
import { aileBul } from "@/lib/data/gruplar";
import { paketBul, kampanyaAcikMi } from "@/lib/data/ucretler";
import { atolyeBul } from "@/lib/data/atolyeler";
import { basvuruBildirimiGonder } from "@/lib/bildirim";
import type { Basvuru, SecilenSlot } from "@/lib/supabase/types";
import type { ProgramAilesiSlug } from "@/lib/data/types";

export const runtime = "nodejs";

/**
 * POST /api/kayit
 * PLAN.md Bolum 9:
 *  1. Zod ile dogrula
 *  2. Honeypot ve rate limit
 *  3. Yasi sunucuda yeniden hesapla, secilen slotlarla uyumunu dogrula
 *  4. Fiyati SUNUCUDAKI tablodan hesapla, istemciden gelene guvenme
 *  5. Supabase'e yaz
 *  6. Bildirim gonder
 *  7. { ok: true, id } don
 */
export async function POST(istek: Request) {
  /*
    Kurulum eksikse bunu ACIKCA soyle. Anahtarlar tanimli degilken asagidaki
    akis "beklenmeyen hata" verip 500 donuyordu; kayitlarda sebebi
    gorunmedigi icin sorunun Supabase'de mi kodda mi oldugu anlasilmiyordu.
    Veliye giden mesaj ayni kaliyor, degisen yalniz sunucu kaydi.
  */
  const eksik = eksikSupabaseAnahtarlari();
  if (eksik.length) {
    console.error(
      `[kayit] KURULUM EKSIK. Tanimsiz ortam degiskenleri: ${eksik.join(", ")}. ` +
        "Adimlar: supabase/KURULUM.md",
    );
    return NextResponse.json(
      { ok: false, hata: "Talebiniz kaydedilemedi. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }

  let ham: unknown;
  try {
    ham = await istek.json();
  } catch {
    return NextResponse.json(
      { ok: false, hata: "Geçersiz istek." },
      { status: 400 },
    );
  }

  // 1. Dogrulama
  const sonuc = kayitSemasi.safeParse(ham);
  if (!sonuc.success) {
    const alanlar: Record<string, string> = {};
    for (const sorun of sonuc.error.issues) {
      const yol = sorun.path.join(".") || "genel";
      if (!alanlar[yol]) alanlar[yol] = sorun.message;
    }
    return NextResponse.json(
      { ok: false, hata: "Formda eksik veya hatalı alan var.", alanlar },
      { status: 422 },
    );
  }
  const v = sonuc.data;

  // 2. Honeypot. Dolu geldiyse bot. Basarili gibi cevap ver, kaydetme.
  if (v.website) {
    return NextResponse.json({ ok: true, id: null });
  }

  const ip = istekIp(istek.headers);
  const ipHash = ipOzeti(ip);
  if (sinirAsildiMi(ipHash)) {
    return NextResponse.json(
      { ok: false, hata: "Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar deneyin." },
      { status: 429 },
    );
  }

  // 3. Yas sunucuda yeniden hesaplanir, istemci filtresine guvenilmez.
  const yasAy = ayHesapla(v.dogumTarihi);
  if (!Number.isFinite(yasAy) || yasAy < 0) {
    return NextResponse.json(
      { ok: false, hata: "Doğum tarihi geçersiz.", alanlar: { dogumTarihi: "Doğum tarihi geçersiz." } },
      { status: 422 },
    );
  }

  const secilenSlotlar: SecilenSlot[] = [];
  for (const id of v.secilenSlotIdler) {
    const slot = slotBul(id);
    if (!slot) {
      return NextResponse.json(
        { ok: false, hata: "Seçilen saatlerden biri artık geçerli değil. Lütfen tekrar seçin." },
        { status: 422 },
      );
    }
    if (!slotUygunMu(slot, yasAy)) {
      return NextResponse.json(
        {
          ok: false,
          hata: `Seçilen saat çocuğunuzun yaşına uygun değil (${slot.yas.etiket}). Lütfen tekrar seçin.`,
        },
        { status: 422 },
      );
    }
    secilenSlotlar.push({
      id: slot.id,
      gun: slot.gun,
      bas: slot.bas,
      bit: slot.bit,
      atolye: atolyeBul(slot.atolyeSlug)?.ad ?? slot.atolyeSlug,
      ogretmenler: slot.ogretmenler,
    });
  }

  // 4. Fiyat sunucudaki tablodan. Istemci fiyat gondermez, gonderse de bakilmaz.
  let fiyatNormal: number | null = null;
  let fiyatErken: number | null = null;
  const aile = v.programSlug ? aileBul(v.programSlug) : undefined;
  if (aile && v.paketKod) {
    const paket = paketBul(aile.slug as ProgramAilesiSlug, v.paketKod);
    if (!paket) {
      return NextResponse.json(
        { ok: false, hata: "Seçilen paket bu program için geçerli değil." },
        { status: 422 },
      );
    }
    fiyatNormal = paket.normal;
    fiyatErken = paket.erkenKayit;
  }

  // Indirimin gecerli olup olmadigi TAKVIME bagli, yalniz rakamlara degil.
  // Istemciden gelen hicbir sey burada dikkate alinmaz; tarih de sunucudan.
  const kampanyaAcik = kampanyaAcikMi();

  // 5. Kayit
  const kayit = {
    kurum: v.kurum,
    cocuk_adi: v.cocukAdi || null,
    dogum_tarihi: v.dogumTarihi,
    yas_ay: yasAy,
    program_slug: v.programSlug || null,
    paket_kod: v.paketKod ?? null,
    secilen_slotlar: secilenSlotlar,
    saat_uymuyor: v.saatUymuyor,
    saat_notu: v.saatNotu || null,
    fiyat_normal: fiyatNormal,
    fiyat_erken_kayit: fiyatErken,
    erken_kayit_uygulandi:
      kampanyaAcik && fiyatErken != null && fiyatErken < (fiyatNormal ?? 0),
    veli_adi: v.veliAdi,
    telefon: v.telefon,
    eposta: v.eposta || null,
    iletisim_tercihi: v.iletisimTercihi ?? null,
    kaynak: v.kaynak ?? null,
    not_metni: v.notMetni || null,
    kvkk_onay: v.kvkkOnay,
    ticari_ileti_onay: v.ticariIletiOnay,
    utm: v.utm ?? null,
    referrer: v.referrer || null,
    user_agent: istek.headers.get("user-agent")?.slice(0, 400) ?? null,
    ip_hash: ipHash,
  };

  try {
    const db = yoneticiIstemcisi();
    const { data, error } = await db
      .from("basvurular")
      .insert(kayit)
      .select()
      .single();

    if (error) {
      console.error("[kayit] supabase hatasi:", error);
      return NextResponse.json(
        { ok: false, hata: "Talebiniz kaydedilemedi. Lütfen tekrar deneyin." },
        { status: 500 },
      );
    }

    // 6. Bildirim. Hata verse bile basvuru kaydedildi, akis kesilmez.
    await basvuruBildirimiGonder(data as Basvuru);

    // 7.
    return NextResponse.json({ ok: true, id: (data as Basvuru).id });
  } catch (e) {
    console.error("[kayit] beklenmeyen hata:", e);
    return NextResponse.json(
      { ok: false, hata: "Talebiniz kaydedilemedi. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }
}
