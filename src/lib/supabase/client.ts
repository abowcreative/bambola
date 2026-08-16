import { createBrowserClient } from "@supabase/ssr";

/** Tarayici istemcisi. Yalniz /admin girisinde kullanilir. */
export function tarayiciIstemcisi() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
