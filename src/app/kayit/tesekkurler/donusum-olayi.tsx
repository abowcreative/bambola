"use client";

import { useEffect } from "react";
import { pikselOlayi } from "@/lib/olcum";

/**
 * PLAN.md Bolum 7: tesekkurler sayfasi donusum olcumunun tetiklendigi yer.
 * Piksel kurulu degilse hicbir sey yapmaz.
 */
export function DonusumOlayi() {
  useEffect(() => {
    pikselOlayi("CompleteRegistration");
  }, []);
  return null;
}
