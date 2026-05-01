import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export function formatMoneyMAD(value: number) {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MAD",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${Math.round(value)} MAD`;
  }
}

export function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function formatKg(value: number) {
  return `${formatNumber(value, 0)} kg`;
}

export function formatDateLong(iso: string) {
  return format(parseISO(iso), "d MMM yyyy", { locale: fr });
}

