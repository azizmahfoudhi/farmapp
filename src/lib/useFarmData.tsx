"use client";

import * as React from "react";
import type { Batch, Expense, FarmSettings, RecurringExpense, Scenario, TreeType, UUID } from "@/lib/domain";
import {
  createBatch,
  createExpense,
  createRecurring,
  createTreeType,
  deleteBatch,
  deleteExpense,
  deleteRecurring,
  deleteTreeType,
  getOrCreateSettings,
  listBatches,
  listExpenses,
  listRecurring,
  listScenarios,
  listTreeTypes,
  updateSettings,
  updateTreeType as dbUpdateTreeType,
  updateBatch as dbUpdateBatch,
  updateExpense as dbUpdateExpense,
  updateRecurring as dbUpdateRecurring,
} from "@/lib/db";

export function useFarmData() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [settingsRowId, setSettingsRowId] = React.useState<UUID | null>(null);
  const [settings, setSettings] = React.useState<FarmSettings>({ surfaceHa: 0, prixKgOlives: 0 });
  const [types, setTypes] = React.useState<TreeType[]>([]);
  const [lots, setLots] = React.useState<Batch[]>([]);
  const [depenses, setDepenses] = React.useState<Expense[]>([]);
  const [recurrents, setRecurrents] = React.useState<RecurringExpense[]>([]);
  const [scenarios, setScenarios] = React.useState<Scenario[]>([]);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await getOrCreateSettings();
      setSettingsRowId(s.rowId);
      setSettings(s.settings);

      const [t, l, d, r, sc] = await Promise.all([
        listTreeTypes(),
        listBatches(),
        listExpenses(),
        listRecurring(),
        listScenarios(),
      ]);
      setTypes(t);
      setLots(l);
      setDepenses(d);
      setRecurrents(r);
      setScenarios(sc);
    } catch (e: any) {
      setError(e?.message ?? "Erreur Supabase");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const actions = React.useMemo(
    () => ({
      async setSettings(patch: Partial<FarmSettings>) {
        if (!settingsRowId) return;
        await updateSettings(settingsRowId, patch);
        setSettings((s) => ({ ...s, ...patch }));
      },

      async addTreeType(nom: string, rendementMaxKgParArbre: number) {
        const created = await createTreeType({ nom, rendementMaxKgParArbre });
        setTypes((t) => [created, ...t]);
      },
      async updateTreeType(id: UUID, input: Partial<Omit<TreeType, "id">>) {
        await dbUpdateTreeType(id, input);
        setTypes((t) => t.map((x) => (x.id === id ? { ...x, ...input } : x)));
      },
      async removeTreeType(id: UUID) {
        await deleteTreeType(id);
        setTypes((t) => t.filter((x) => x.id !== id));
      },

      async addBatch(input: Omit<Batch, "id">) {
        const created = await createBatch(input);
        setLots((l) => [created, ...l]);
      },
      async updateBatch(id: UUID, input: Partial<Omit<Batch, "id">>) {
        await dbUpdateBatch(id, input);
        setLots((l) => l.map((x) => (x.id === id ? { ...x, ...input } : x)));
      },
      async removeBatch(id: UUID) {
        await deleteBatch(id);
        setLots((l) => l.filter((x) => x.id !== id));
      },

      async addExpense(input: Omit<Expense, "id">) {
        const created = await createExpense(input);
        setDepenses((d) => [created, ...d]);
      },
      async updateExpense(id: UUID, input: Partial<Omit<Expense, "id">>) {
        await dbUpdateExpense(id, input);
        setDepenses((d) => d.map((x) => (x.id === id ? { ...x, ...input } : x)));
      },
      async removeExpense(id: UUID) {
        await deleteExpense(id);
        setDepenses((d) => d.filter((x) => x.id !== id));
      },

      async addRecurring(input: Omit<RecurringExpense, "id">) {
        const created = await createRecurring(input);
        setRecurrents((r) => [created, ...r]);
      },
      async updateRecurring(id: UUID, input: Partial<Omit<RecurringExpense, "id">>) {
        await dbUpdateRecurring(id, input);
        setRecurrents((r) => r.map((x) => (x.id === id ? { ...x, ...input } : x)));
      },
      async removeRecurring(id: UUID) {
        await deleteRecurring(id);
        setRecurrents((r) => r.filter((x) => x.id !== id));
      },
    }),
    [settingsRowId],
  );

  return {
    loading,
    error,
    refresh,
    settings,
    types,
    lots,
    depenses,
    recurrents,
    scenarios,
    actions,
  };
}

