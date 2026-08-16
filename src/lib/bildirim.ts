import { Resend } from "resend";
import type { Basvuru } from "./supabase/types";
import { atolyeBul } from "./data/atolyeler";
import { aileBul } from "./data/gruplar";
import { tlYaz } from "./data/ucretler";
import { yasMetni } from "./yas";
import { telefonYaz, telefonWhatsapp } from "./schema";
import { GUN_ADI } from "./data/types";
import type { Gun } from "./data/types";
import { SITE_URL } from "./site";

/**
 * Yeni basvuru bildirimi. PLAN.md Bolum 9.
 * Konu satiri taranabilir olmali:
 * "Yeni kayit talebi: Gelisim Odakli Oyun Grubu, 19 aylik, Pzt+Crs 10.00"
 *
 * Env eksikse sessizce atlanir; form yine de kaydedilir. Bildirim gonderilemedi
 * diye velinin talebi kaybolmaz.
 */

function konuSatiri(b: Basvuru): string {
  const program =
    (b.program_slug && aileBul(b.program_slug)?.ad) ||
    (b.program_slug && atolyeBul(b.program_slug)?.ad) ||
    "Talep";
  const yas = yasMetni(b.yas_ay);
  const saat = b.saat_uymuyor
    ? "saat uymuyor"
    : b.secilen_slotlar
        .map((s) => `${GUN_ADI[s.gun as Gun] ?? s.gun} ${s.bas}`)
        .join(", ") || "saat seçilmedi";
  return `Yeni kayıt talebi: ${program}, ${yas}, ${saat}`;
}

function satir(etiket: string, deger: string | null | undefined): string {
  if (!deger) return "";
  return `<tr><td style="padding:6px 14px 6px 0;color:#5a554d;white-space:nowrap;vertical-align:top">${etiket}</td><td style="padding:6px 0;color:#1c1a17"><strong>${deger}</strong></td></tr>`;
}

function govde(b: Basvuru): string {
  const program =
    (b.program_slug && aileBul(b.program_slug)?.ad) ||
    (b.program_slug && atolyeBul(b.program_slug)?.ad) ||
    b.program_slug;

  const slotlar = b.secilen_slotlar
    .map(
      (s) =>
        `${GUN_ADI[s.gun as Gun] ?? s.gun} ${s.bas} - ${s.bit} · ${s.atolye}${
          s.ogretmenler.length ? ` · ${s.ogretmenler.join(", ")}` : ""
        }`,
    )
    .join("<br>");

  const fiyat =
    b.fiyat_erken_kayit != null
      ? `${tlYaz(b.fiyat_erken_kayit)}${
          b.fiyat_normal && b.fiyat_normal !== b.fiyat_erken_kayit
            ? ` (normal ${tlYaz(b.fiyat_normal)})`
            : ""
        }`
      : null;

  return `
<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:640px">
  <h1 style="font-size:20px;margin:0 0 4px">Yeni kayıt talebi</h1>
  <p style="margin:0 0 20px;color:#5a554d;font-size:14px">${new Date(
    b.created_at,
  ).toLocaleString("tr-TR")}</p>

  <table style="border-collapse:collapse;font-size:14px;width:100%">
    ${satir("Veli", b.veli_adi)}
    ${satir("Telefon", telefonYaz(b.telefon))}
    ${satir("E-posta", b.eposta)}
    ${satir("İletişim tercihi", b.iletisim_tercihi)}
    ${satir("Nereden duydu", b.kaynak)}
    <tr><td colspan="2" style="padding:10px 0"><hr style="border:0;border-top:1px solid #e7e2d5"></td></tr>
    ${satir("Çocuk", b.cocuk_adi)}
    ${satir("Doğum tarihi", new Date(b.dogum_tarihi).toLocaleDateString("tr-TR"))}
    ${satir("Yaş", yasMetni(b.yas_ay))}
    <tr><td colspan="2" style="padding:10px 0"><hr style="border:0;border-top:1px solid #e7e2d5"></td></tr>
    ${satir("Kurum", b.kurum)}
    ${satir("Program", program)}
    ${satir("Paket", b.paket_kod)}
    ${satir("Ücret", fiyat)}
    ${satir("Seçilen saatler", slotlar)}
    ${b.saat_uymuyor ? satir("Saat uymuyor", b.saat_notu ?? "belirtilmedi") : ""}
    ${satir("Not", b.not_metni)}
    ${satir("Ticari ileti izni", b.ticari_ileti_onay ? "var" : "yok")}
  </table>

  <p style="margin:24px 0 0">
    <a href="${SITE_URL}/admin/talep/${b.id}"
       style="display:inline-block;background:#588f27;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:600">
      Panelde aç
    </a>
    <a href="https://wa.me/${telefonWhatsapp(b.telefon)}"
       style="display:inline-block;margin-left:8px;border:2px solid #588f27;color:#42701c;padding:8px 16px;border-radius:999px;text-decoration:none;font-weight:600">
      WhatsApp'tan yaz
    </a>
  </p>
</div>`;
}

export async function basvuruBildirimiGonder(b: Basvuru): Promise<void> {
  const anahtar = process.env.RESEND_API_KEY;
  const alici = process.env.BILDIRIM_ALICI;
  const gonderen = process.env.BILDIRIM_GONDEREN;

  if (!anahtar || !alici || !gonderen) {
    console.warn(
      "[bildirim] Resend env degiskenleri eksik, e-posta gonderilmedi.",
    );
    return;
  }

  try {
    const resend = new Resend(anahtar);
    await resend.emails.send({
      from: gonderen,
      to: alici,
      subject: konuSatiri(b),
      html: govde(b),
      replyTo: b.eposta || undefined,
    });
  } catch (e) {
    // Bildirim hatasi basvuruyu dusurmez.
    console.error("[bildirim] gonderilemedi:", e);
  }
}
