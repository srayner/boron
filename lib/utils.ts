import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isValid } from "date-fns";
import { startOfDay, endOfDay, subDays, subMonths, formatISO } from "date-fns";

const translations: Record<string, { full: string; short?: string }> = {
  WEBAPP: { full: "Web Application", short: "Web App" },
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amount);
}

export function titleCase(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function translate(key: string, options?: { short?: boolean }): string {
  const entry = translations[key];
  const value = options?.short ? entry?.short : entry?.full;

  if (value) return value;

  return key
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDate(date: string, formatStr?: string): string {
  if (!date) return "";
  const parsedDate = new Date(date);
  if (!isValid(parsedDate)) return "";
  return format(parsedDate, formatStr || "dd MMM yyyy");
}

export function getDateRange(groupBy: "day" | "month", rangeLength?: number) {
  const now = new Date();

  if (rangeLength === undefined) {
    rangeLength = groupBy === "month" ? 6 : 30;
  }

  let startDate: Date;

  if (groupBy === "month") {
    startDate = subMonths(now, rangeLength);
  } else {
    startDate = subDays(now, rangeLength);
  }

  return {
    startDate: formatISO(startOfDay(startDate)),
    endDate: formatISO(endOfDay(now)),
  };
}
