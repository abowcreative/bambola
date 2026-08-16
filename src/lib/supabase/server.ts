import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Sunucu istemcisi, oturum cerezleriyle. Admin sayfalari bunu kullanir.
 * Next 16'da cookies() await edilir.
 */
export async function sunucuIstemcisi() {
  const cerezDeposu = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cerezDeposu.getAll();
        },
        setAll(cerezler) {
          try {
            for (const { name, value, options } of cerezler) {
              cerezDeposu.set(name, value, options);
            }
          } catch {
            // Server Component icinden cagrildiginda yazilamaz.
            // Oturum tazeleme proxy katmaninda yapiliyor, sorun degil.
          }
        },
      },
    },
  );
}

/**
 * Service role istemcisi. RLS'i atlar, YALNIZ sunucu tarafinda kullanilir.
 * PLAN.md Bolum 8: form istemciden dogrudan insert etmez, /api/kayit
 * uzerinden bu istemciyle yazar; boylece yas dogrulamasi, fiyat hesabi ve
 * rate limit sunucuda calisir.
 */
export function yoneticiIstemcisi() {
  const anahtar = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!anahtar) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY tanimli degil. .env.local dosyasini kontrol edin.",
    );
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, anahtar, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Form yazabilecek durumda mi. Eksik olan anahtarlarin adlarini doner, hepsi
 * yerindeyse bos dizi.
 *
 * Yazma yolu SERVICE ROLE anahtarini kullaniyor (`yoneticiIstemcisi`), o
 * yuzden burada o da araniyor. Onceki hali yalniz NEXT_PUBLIC_ ikilisine
 * bakiyordu ve hicbir yerden cagrilmiyordu: anahtar eksikken form
 * "beklenmeyen hata" veriyor, kayitlarda sebebi gorunmuyordu.
 */
export function eksikSupabaseAnahtarlari(): string[] {
  return (
    [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
    ] as const
  ).filter((ad) => !process.env[ad]);
}
