"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Kaydirmada alttan yaylanarak giren sarmalayici.
 * PLAN.md Bolum 11, Hareket: spring, sert degil.
 * Yalniz transform ve opacity animasyonlanir, layout tetiklenmez.
 */
export function Belir({
  children,
  gecikme = 0,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  gecikme?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const azHareket = useReducedMotion();
  const M = motion[as];

  return (
    <M
      data-belir=""
      initial={azHareket ? { opacity: 0 } : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25, margin: "0px 0px -80px 0px" }}
      transition={
        azHareket
          ? { duration: 0.01 }
          : { type: "spring", stiffness: 120, damping: 18, delay: gecikme }
      }
      className={className}
    >
      {children}
    </M>
  );
}

/** Icindeki cocuklari sirayla belirtir. */
export function Sirali({
  children,
  className = "",
  aralik = 0.08,
}: {
  children: ReactNode;
  className?: string;
  aralik?: number;
}) {
  const azHareket = useReducedMotion();

  return (
    <motion.div
      data-belir=""
      initial="gizli"
      whileInView="gorunur"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        gizli: {},
        gorunur: { transition: { staggerChildren: azHareket ? 0 : aralik } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SiraliOge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const azHareket = useReducedMotion();

  return (
    <motion.div
      data-belir=""
      variants={{
        gizli: azHareket ? { opacity: 0 } : { opacity: 0, y: 22 },
        gorunur: {
          opacity: 1,
          y: 0,
          transition: azHareket
            ? { duration: 0.01 }
            : { type: "spring", stiffness: 140, damping: 18 },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
