/**
 * Olcum yardimcilari. PLAN.md Bolum 12.
 * Piksel kurulu degilse hepsi sessizce hicbir sey yapmaz, konsolu kirletmez.
 */

type PixelOlay = "ViewContent" | "InitiateCheckout" | "Lead" | "CompleteRegistration";

type FbqPencere = Window & {
  fbq?: (komut: string, olay: string, veri?: Record<string, unknown>) => void;
};

export function pikselOlayi(olay: PixelOlay, veri?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as FbqPencere;
  if (typeof w.fbq !== "function") return;
  try {
    w.fbq("track", olay, veri);
  } catch {
    // Olcum hatasi kullanici akisini bozmaz.
  }
}

/** Form adim gecisleri. PLAN.md Bolum 12: hangi adimda dusuyorlar. */
export function formAdimi(adim: number, ad: string) {
  if (typeof window === "undefined") return;
  const w = window as FbqPencere;
  if (typeof w.fbq !== "function") return;
  try {
    w.fbq("trackCustom", "FormAdim", { adim, ad });
  } catch {
    // yoksay
  }
}
