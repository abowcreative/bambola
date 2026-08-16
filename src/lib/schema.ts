import { z } from "zod";
import { tr } from "zod/locales";

/**
 * Kayit formu dogrulamasi. PLAN.md Bolum 7, Dogrulama.
 * Ayni sema hem istemcide hem sunucuda calisir.
 *
 * Varsayilan zod mesajlari Ingilizce. Turkce yerellestirme burada, tek yerden
 * baglanir; boylece "Invalid input: expected string" gibi bir metin veliye
 * asla gorunmez.
 */
z.config(tr());

/**
 * Turkiye cep telefonu. "+90 532 111 22 33", "0532 111 22 33", "532 111 22 33"
 * hepsi kabul edilir, "5321112233" olarak normalize edilip saklanir.
 */
export function telefonNormalize(ham: string): string | null {
  const rakam = ham.replace(/\D/g, "");
  let n = rakam;
  if (n.startsWith("90") && n.length === 12) n = n.slice(2);
  else if (n.startsWith("0") && n.length === 11) n = n.slice(1);
  if (n.length !== 10) return null;
  if (!n.startsWith("5")) return null;
  return n;
}

/** "5321112233" -> "0532 111 22 33". Ekranda ve admin panelinde. */
export function telefonYaz(n: string): string {
  if (n.length !== 10) return n;
  return `0${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6, 8)} ${n.slice(8, 10)}`;
}

/** "5321112233" -> "905321112233". wa.me baglantisi icin. */
export function telefonWhatsapp(n: string): string {
  return `90${n}`;
}

export const KURUMLAR = ["oyun-evi", "anaokulu", "parti"] as const;
export const ILETISIM_TERCIHLERI = ["whatsapp", "telefon", "eposta"] as const;
export const KAYNAKLAR = [
  "instagram",
  "google",
  "tavsiye",
  "tabela",
  "diger",
] as const;
export const PAKET_KODLARI = [
  "tek-sefer",
  "ayda-4",
  "ayda-8",
  "ayda-12",
] as const;

export const KAYNAK_ETIKET: Record<(typeof KAYNAKLAR)[number], string> = {
  instagram: "Instagram",
  google: "Google",
  tavsiye: "Tavsiye",
  tabela: "Tabela",
  diger: "Diğer",
};

export const ILETISIM_ETIKET: Record<
  (typeof ILETISIM_TERCIHLERI)[number],
  string
> = {
  whatsapp: "WhatsApp",
  telefon: "Telefon",
  eposta: "E-posta",
};

const bugun = () => new Date();

export const kayitSemasi = z
  .object({
    kurum: z.enum(KURUMLAR).default("oyun-evi"),

    // --- Adim 1: cocuk ---
    cocukAdi: z
      .string()
      .trim()
      .max(60, "Ad en fazla 60 karakter olabilir.")
      .optional()
      .or(z.literal("")),
    dogumTarihi: z
      .string({ error: "Çocuğunuzun doğum tarihini seçin." })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Doğum tarihini seçin.")
      .refine((v) => !Number.isNaN(new Date(v).getTime()), "Geçerli bir tarih girin.")
      .refine((v) => new Date(v) <= bugun(), "Doğum tarihi bugünden ileri olamaz.")
      .refine((v) => {
        const d = new Date(v);
        const sinir = new Date(bugun());
        sinir.setFullYear(sinir.getFullYear() - 8);
        return d >= sinir;
      }, "Doğum tarihi 8 yıldan eski olamaz."),

    // --- Adim 2 ve 3: program ve paket ---
    programSlug: z.string().trim().max(60).optional().or(z.literal("")),
    paketKod: z.enum(PAKET_KODLARI).optional(),

    // --- Adim 4: gun ve saat ---
    secilenSlotIdler: z.array(z.string().max(60)).max(6).default([]),
    saatUymuyor: z.boolean().default(false),
    saatNotu: z.string().trim().max(500).optional().or(z.literal("")),

    // --- Adim 5: veli ---
    veliAdi: z
      .string({ error: "Adınızı ve soyadınızı yazın." })
      .trim()
      .min(2, "Adınızı ve soyadınızı yazın.")
      .max(80, "Ad en fazla 80 karakter olabilir."),
    telefon: z
      .string({ error: "Telefon numaranızı yazın." })
      .trim()
      .transform((v, ctx) => {
        const n = telefonNormalize(v);
        if (!n) {
          ctx.addIssue({
            code: "custom",
            message: "Telefonu 05XX XXX XX XX biçiminde girin.",
          });
          return z.NEVER;
        }
        return n;
      }),
    eposta: z
      .union([z.literal(""), z.email("Geçerli bir e-posta girin.")])
      .optional(),
    iletisimTercihi: z.enum(ILETISIM_TERCIHLERI).optional(),
    kaynak: z.enum(KAYNAKLAR).optional(),
    notMetni: z.string().trim().max(1000).optional().or(z.literal("")),

    // --- Izinler ---
    kvkkOnay: z.literal(true, {
      message: "Devam etmek için aydınlatma metnini onaylayın.",
    }),
    ticariIletiOnay: z.boolean().default(false),

    // --- Teknik ---
    /**
     * Spam tuzagi. Insan doldurmaz, bot doldurur.
     * Sema BURADA reddetmez; reddetseydi bot 422 alip tuzagi anlardi.
     * Dolu geldigini /api/kayit fark eder ve basarili gibi cevap verip
     * kaydi atlar.
     */
    website: z.string().max(200).optional(),
    utm: z.record(z.string(), z.string()).optional(),
    referrer: z.string().max(500).optional().or(z.literal("")),
  })
  .refine(
    (d) => d.saatUymuyor || d.secilenSlotIdler.length > 0 || d.kurum !== "oyun-evi",
    {
      message: "Bir gün ve saat seçin veya “Bu saatlerin hiçbiri uymuyor” deyin.",
      path: ["secilenSlotIdler"],
    },
  )
  .refine((d) => !d.saatUymuyor || (d.saatNotu ?? "").trim().length > 0, {
    message: "Size uyan zamanı kısaca yazın.",
    path: ["saatNotu"],
  });

export type KayitGirdisi = z.input<typeof kayitSemasi>;
export type KayitVerisi = z.output<typeof kayitSemasi>;
