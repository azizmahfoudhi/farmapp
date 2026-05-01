"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";
import { AppShell } from "@/components/AppShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { buildInsights, farmTotals, recurringSeriesLast12Months } from "@/lib/derive";
import { formatKg, formatMoneyMAD, formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useFarmData } from "@/lib/useFarmData";

export default function HomePage() {
  const farm = useFarmData();
  const state = {
    settings: farm.settings,
    types: farm.types,
    lots: farm.lots,
    depenses: farm.depenses,
    recurrents: farm.recurrents,
    scenarios: farm.scenarios,
  };

  const totals = farmTotals(state);
  const insights = buildInsights(state);
  const recurringSeries = recurringSeriesLast12Months(state).map((p) => ({
    ...p,
    month: p.monthISO.slice(5, 7),
  }));

  return (
    <AppShell
      title="Résumé"
      actions={null}
    >
      {farm.error ? (
        <Card className="mb-3">
          <CardHeader>
            <div>
              <CardTitle>Connexion Supabase</CardTitle>
              <CardDescription>
                {farm.error}. Vérifiez `.env.local` + le schéma SQL.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <button
              className="text-sm font-medium text-primary"
              onClick={() => farm.refresh()}
            >
              Réessayer
            </button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          title="Arbres"
          value={formatNumber(totals.totalTrees)}
          sub={`${state.lots.length} lot(s)`}
        />
        <MetricCard
          title="Investissement total"
          value={formatMoneyMAD(totals.totalInvestment)}
          sub="Dépenses enregistrées"
        />
        <MetricCard
          title="Coûts récurrents / mois"
          value={formatMoneyMAD(totals.monthlyRecurring)}
          sub="Charges fixes"
        />
        <MetricCard
          title="Production annuelle estimée"
          value={formatKg(totals.estimatedYearlyProductionKg)}
          sub="Selon âge/type/irrigation"
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Rentabilité (estimation)</CardTitle>
              <CardDescription>
                Recettes − (récurrents × 12 + dépenses 12 derniers mois)
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border p-3">
                <div className="text-xs text-muted">Recettes</div>
                <div className="mt-1 text-lg font-semibold">
                  {formatMoneyMAD(totals.estimatedRevenue)}
                </div>
                <div className="text-xs text-muted">
                  Prix: {formatNumber(state.settings.prixKgOlives || 0, 2)} / kg
                </div>
              </div>
              <div className="rounded-xl border border-border p-3">
                <div className="text-xs text-muted">Résultat</div>
                <div
                  className={cn(
                    "mt-1 text-lg font-semibold",
                    totals.profit >= 0 ? "text-primary" : "text-danger",
                  )}
                >
                  {formatMoneyMAD(totals.profit)}
                </div>
                <div className="text-xs text-muted">
                  Coût/kg: {formatNumber(totals.costPerKg || 0, 2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Charges récurrentes (12 mois)</CardTitle>
              <CardDescription>Projection simple mensuelle</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={recurringSeries}>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--foreground)",
                    }}
                    formatter={(v: unknown) => formatMoneyMAD(Number(v))}
                  />
                  <Area
                    type="monotone"
                    dataKey="montant"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Insights</CardTitle>
              <CardDescription>Actions simples pour améliorer</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.length === 0 ? (
              <div className="text-sm text-muted">
                Ajoutez des lots et des dépenses pour obtenir des recommandations.
              </div>
            ) : (
              insights.map((i, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "rounded-xl border border-border p-3",
                    i.level === "danger" && "border-danger/40 bg-danger/5",
                    i.level === "warning" && "border-warning/40 bg-warning/5",
                  )}
                >
                  <div className="text-sm font-semibold">{i.titre}</div>
                  <div className="mt-1 text-sm text-muted">{i.detail}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function MetricCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{sub}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}
