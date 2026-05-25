import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0,
  }).format(num);
}

/** Bogotá is UTC-5 year-round. Deterministic on server and client (avoids hydration mismatch). */
const BOGOTA_OFFSET_MS = -5 * 60 * 60 * 1000;

function bogotaParts(date: Date) {
  const shifted = new Date(date.getTime() + BOGOTA_OFFSET_MS);
  return {
    hours24: shifted.getUTCHours(),
    minutes: shifted.getUTCMinutes(),
    seconds: shifted.getUTCSeconds(),
    day: shifted.getUTCDate(),
    month: shifted.getUTCMonth(),
    year: shifted.getUTCFullYear(),
  };
}

export function formatBogotaTime(
  date: Date | number,
  options?: { hour12?: boolean },
): string {
  const value = typeof date === "number" ? new Date(date) : date;
  const { hours24, minutes, seconds } = bogotaParts(value);
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  if (options?.hour12 === false) {
    const hh = String(hours24).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }

  const period = hours24 >= 12 ? "p.m." : "a.m.";
  const hours12 = hours24 % 12 || 12;
  const hh = String(hours12).padStart(2, "0");
  return `${hh}:${mm}:${ss} ${period}`;
}

const BOGOTA_MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const;

export function formatBogotaDateTime(date: Date | number): string {
  const value = typeof date === "number" ? new Date(date) : date;
  const { day, month, year } = bogotaParts(value);
  const monthLabel = BOGOTA_MONTHS[month];
  return `${String(day).padStart(2, "0")} ${monthLabel} ${year}, ${formatBogotaTime(value)}`;
}
