import { formatISO, startOfMonth, subMonths } from "date-fns";
import type { FarmState, UUID } from "@/lib/domain";
import {
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

  return {
    totalTrees,
    totalInvestment,
    monthlyRecurring,
    estimatedYearlyProductionKg,
    estimatedRevenue,
    estimatedYearlyCosts,
    profit,
    costPerKg,
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

export type Insight = { level: "info" | "warning" | "danger"; titre: string; detail: string };

export function buildInsights(state: FarmState): Insight[] {
  const t = farmTotals(state);
  const insights: Insight[] = [];

  if (t.totalTrees > 0 && t.totalInvestment / t.totalTrees > 140) {
    insights.push({
      level: "warning",
      titre: "Coût par arbre élevé",
      detail:
        "Votre investissement total par arbre est élevé. Vérifiez la catégorie “Plantation” et les achats d’équipement.",
    });
  }

  if (t.estimatedYearlyProductionKg > 0 && t.costPerKg > (state.settings.prixKgOlives || 0)) {
    insights.push({
      level: "danger",
      titre: "Coût par kg supérieur au prix de vente",
      detail:
        "À ce rythme, chaque kg vous coûte plus cher que ce que vous vendez. Essayez un scénario (irrigation/ajout de lots) ou réduisez les coûts récurrents.",
    });
  }

  const irrigationRecurring = state.recurrents
    .filter((r) => r.categorie === "irrigation")
    .reduce((acc, r) => acc + r.montantMensuel, 0);
  if (irrigationRecurring > 0 && t.estimatedYearlyProductionKg < 1000) {
    insights.push({
      level: "info",
      titre: "Irrigation à surveiller",
      detail:
        "Vous payez une irrigation récurrente, mais la production estimée reste faible. Vérifiez l’âge des arbres ou l’allocation des coûts par lot.",
    });
  }

  if (state.lots.length === 0) {
    insights.push({
      level: "info",
      titre: "Commencez par créer un lot",
      detail:
        "Un lot = arbres plantés au même moment. Ajoutez votre premier lot pour obtenir des estimations de production et de rentabilité.",
    });
  }

  return insights.slice(0, 4);
}

