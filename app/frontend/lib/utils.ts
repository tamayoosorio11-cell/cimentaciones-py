import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fmt = (v: number | undefined | null, dec = 2) =>
  v == null ? "—" : v.toFixed(dec);

export const fmtPct = (v: number) => `${(v * 100).toFixed(1)}%`;
