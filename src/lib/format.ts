import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export function formatMoneyDT(value: number) {
  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(value)} DT`;
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

export function formatProduction(kg: number, ageYears: number) {
  if (kg === 0 && ageYears < 5) {
    return "En croissance";
  }
  return formatKg(kg);
}

export function formatDateLong(iso: string) {
  return format(parseISO(iso), "d MMM yyyy", { locale: fr });
}

export function formatAge(ageYears: number): string {
  const totalMonths = Math.round(ageYears * 12);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const yearsStr = years > 0 ? (years === 1 ? "1 an" : `${years} ans`) : "";
  const monthsStr = months > 0 ? `${months} mois` : "";

  if (yearsStr && monthsStr) {
    return `${yearsStr} et ${monthsStr}`;
  }
  return yearsStr || monthsStr || "Moins d'un mois";
}

