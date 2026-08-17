import { redirect } from "next/navigation";
import { oturumuGetir, rolAnaSayfasi } from "@/lib/kampus/oturum";

export const metadata = {
  title: "Kampüs",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Kampus koku. Kendi ekrani yok: rolun ana sayfasina gonderiyor.
 * Boylece herkes /kampus adresini yer imine koyabiliyor ve dogru yere
 * dusuyor; rolu degisen kisi de yeni yerine gidiyor.
 */
export default async function KampusKok() {
  const oturum = await oturumuGetir();
  if (!oturum) redirect("/kampus/giris");
  redirect(rolAnaSayfasi(oturum.rol));
}
