import { createHash } from "node:crypto";

/**
 * Basit bellek ici hiz siniri. PLAN.md Bolum 7:
 * ayni IP'den 5 dakikada en fazla 3 gonderim.
 *
 * Sunucusuz ortamda her ornegin kendi bellegi var, yani sinir ornek basina
 * calisir. Ilk surum icin yeterli; hacim artarsa Upstash Redis'e tasinir.
 */

const PENCERE_MS = 5 * 60 * 1000;
const SINIR = 3;

const kayitlar = new Map<string, number[]>();

/** Ham IP saklanmaz, yalniz tuzlu ozeti. KVKK icin daha temiz. */
export function ipOzeti(ip: string): string {
  const tuz = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "bambola";
  return createHash("sha256").update(`${tuz}:${ip}`).digest("hex").slice(0, 32);
}

export function istekIp(basliklar: Headers): string {
  const xff = basliklar.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return basliklar.get("x-real-ip") ?? "bilinmiyor";
}

export function sinirAsildiMi(anahtar: string): boolean {
  const simdi = Date.now();
  const gecmis = (kayitlar.get(anahtar) ?? []).filter(
    (t) => simdi - t < PENCERE_MS,
  );

  if (gecmis.length >= SINIR) {
    kayitlar.set(anahtar, gecmis);
    return true;
  }

  gecmis.push(simdi);
  kayitlar.set(anahtar, gecmis);

  // Bellek sismesin: ara sira eski anahtarlari temizle.
  if (kayitlar.size > 500) {
    for (const [k, v] of kayitlar) {
      if (v.every((t) => simdi - t >= PENCERE_MS)) kayitlar.delete(k);
    }
  }

  return false;
}
