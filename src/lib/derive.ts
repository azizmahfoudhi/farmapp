import { formatISO, startOfMonth, subMonths } from "date-fns";
import type { FarmState, UUID } from "@/lib/domain";
import {
  ageYearsFromISO,
  batchEstimatedProductionKg,
  buildScenarioState,
  expandRecurringToMonthlyCosts,
  recurringMonthlyTotal,
  sumExpensesTotal,
} from "@/lib/engine";

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function farmTotals(state: FarmState, scenarioId?: UUID) {
  const s = buildScenarioState(state, scenarioId);
  const tISO = todayISO();

  const totalTrees = s.lots.reduce((acc, l) => acc + l.nbArbres, 0);
  const totalInvestment = sumExpensesTotal(s);
  const monthlyRecurring = recurringMonthlyTotal(s);

  const typeById = new Map(s.types.map((t) => [t.id, t]));
  const estimatedYearlyProductionKg = s.lots.reduce((acc, lot) => {
    const type = typeById.get(lot.typeId);
    if (!type) return acc;
    return acc + batchEstimatedProductionKg({ batch: lot, type, atISO: tISO });
  }, 0);

  const estimatedRevenue = estimatedYearlyProductionKg * (s.settings.prixKgOlives || 0);

  // Coût annuel approx: récurrent * 12 + dépenses “derniers 12 mois”
  const from12 = formatISO(subMonths(new Date(), 12), { representation: "date" });
  const last12 = s.depenses
    .filter((e) => e.dateISO >= from12 && e.dateISO <= tISO)
    .reduce((acc, e) => acc + e.montant, 0);
  const estimatedYearlyCosts = monthlyRecurring * 12 + last12;

  const profit = estimatedRevenue - estimatedYearlyCosts;
  const costPerKg =
    estimatedYearlyProductionKg > 0 ? estimatedYearlyCosts / estimatedYearlyProductionKg : 0;

  // ROI and Break-Even calculations
  const breakEvenYears = profit > 0 ? totalInvestment / profit : null;
  const roiPercentage = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;

  return {
    totalTrees,
    totalInvestment,
    monthlyRecurring,
    estimatedYearlyProductionKg,
    estimatedRevenue,
    estimatedYearlyCosts,
    profit,
    costPerKg,
    breakEvenYears,
    roiPercentage,
  };
}

export function recurringSeriesLast12Months(state: FarmState) {
  const start = startOfMonth(subMonths(new Date(), 11));
  const fromISO = formatISO(start, { representation: "date" });
  const toISO = formatISO(startOfMonth(new Date()), { representation: "date" });
  return expandRecurringToMonthlyCosts({
    recurrents: state.recurrents,
    fromISO,
    toISO,
  });
}

export type WeatherData = {
  temp: number;
  precipitation: number;
  isRaining: boolean;
};

export type Insight = {
  level: "info" | "warning" | "danger" | "success";
  titre: string;
  detail: string;
  icon?: string;
};

export function buildInsights(state: FarmState, weather: WeatherData | null = null): Insight[] {
  const t = farmTotals(state);
  const insights: Insight[] = [];

  // 1. Data Freshness
  const today = new Date();
  const thirtyDaysAgo = formatISO(subMonths(today, 1), { representation: "date" });
  const recentExpenses = state.depenses.filter(d => d.dateISO >= thirtyDaysAgo);
  
  if (state.lots.length > 0 && recentExpenses.length === 0) {
    insights.push({
      level: "info",
      titre: "Comptabilité à jour ?",
      detail: "Je remarque que vous n'avez enregistré aucune dépense ce mois-ci. N'oubliez pas de saisir vos factures pour que mes projections restent précises.",
      icon: "📅"
    });
  }

  // 2. Weather & Irrigation Advice
  if (weather) {
    if (weather.isRaining || weather.precipitation > 2) {
      insights.push({
        level: "success",
        titre: "Pluie en cours / prévue",
        detail: `La météo annonce de la pluie (${weather.precipitation}mm). Inutile d'irriguer aujourd'hui, vous pouvez suspendre vos cycles pour économiser l'eau et l'énergie.`,
        icon: "🌧️"
      });
    } else if (weather.temp > 32) {
      insights.push({
        level: "danger",
        titre: "Alerte Canicule",
        detail: `Il fait très chaud actuellement (${weather.temp}°C). Augmentez la fréquence d'irrigation, de préférence tard le soir ou tôt le matin pour limiter l'évaporation.`,
        icon: "🌡️"
      });
    } else if (weather.temp > 25 && weather.precipitation === 0) {
      insights.push({
        level: "warning",
        titre: "Temps sec et chaud",
        detail: `Il fait ${weather.temp}°C sans précipitation prévue. C'est une fenêtre idéale pour un cycle d'irrigation standard.`,
        icon: "☀️"
      });
    }
  }

  // 3. Expense Optimization
  if (t.estimatedYearlyCosts > 0) {
    const irrigationRecurring = state.recurrents
      .filter((r) => r.categorie === "irrigation")
      .reduce((acc, r) => acc + r.montantMensuel * 12, 0);
      
    if (irrigationRecurring / t.estimatedYearlyCosts > 0.4) {
      insights.push({
        level: "warning",
        titre: "Optimisation des coûts d'eau",
        detail: "L'irrigation représente plus de 40% de vos charges annuelles estimées. Avez-vous vérifié l'état de votre système goutte-à-goutte pour éviter les fuites ?",
        icon: "💧"
      });
    }
  }

  // 4. Age-Based Yield Milestones
  if (state.lots.length > 0) {
    const tISO = todayISO();
    const lotsApproachingMaturity = state.lots.filter(l => {
      const age = ageYearsFromISO(l.datePlantationISO, tISO);
      return age >= 3.5 && age <= 4.5;
    });

    if (lotsApproachingMaturity.length > 0) {
      const names = lotsApproachingMaturity.map(l => l.nom).join(", ");
      insights.push({
        level: "success",
        titre: "Pic de production en vue !",
        detail: `Excellente nouvelle ! Vos lots (${names}) approchent de leur pleine maturité. Vous devriez voir un saut significatif dans la récolte la saison prochaine. Préparez la main d'œuvre !`,
        icon: "📈"
      });
    }
  }

  // 5. Profitability & General Business
  if (t.profit > 0 && t.breakEvenYears !== null) {
    if (t.breakEvenYears < 5) {
      insights.push({
        level: "success",
        titre: "Félicitations, ferme très saine",
        detail: `Votre gestion est excellente. Au rythme actuel, vous amortirez la totalité de votre investissement initial dans ${t.breakEvenYears.toFixed(1)} ans. Continuez ainsi !`,
        icon: "💰"
      });
    }
  } else if (t.profit <= 0 && state.lots.length > 0) {
    insights.push({
      level: "info",
      titre: "Phase de Croissance",
      detail: "Vos projections affichent un déficit, mais c'est normal pour une jeune ferme. Vos rendements augmenteront naturellement avec l'âge de vos oliviers.",
      icon: "🌱"
    });
  }

  if (state.lots.length === 0) {
    insights.push({
      level: "info",
      titre: "Je suis là pour vous aider",
      detail: "Bonjour ! Je suis votre assistant agricole. Commencez par créer un lot dans la section 'Paramétrer la ferme' pour que je puisse commencer à analyser vos données.",
      icon: "👋"
    });
  }

  return insights.slice(0, 4);
}

