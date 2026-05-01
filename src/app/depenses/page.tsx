"use client";

import * as React from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { ExpenseCategory } from "@/lib/domain";
import { EXPENSE_CATEGORY_LABEL } from "@/lib/domain";
import { formatDateLong, formatMoneyDT } from "@/lib/format";
import { useFarmData } from "@/lib/useFarmData";
import { Wallet, RefreshCw, Plus, Trash2, CalendarDays } from "lucide-react";
import { cn } from "@/lib/cn";

const categories: ExpenseCategory[] = [
  "plantation",
  "main_oeuvre",
  "transport",
  "irrigation",
  "equipement",
  "entretien",
  "autre",
];

export default function DepensesPage() {
  const farm = useFarmData();
  const [tab, setTab] = React.useState<"ponctuel" | "recurrent">("ponctuel");

  const totalPonctuel = farm.depenses.reduce((acc, d) => acc + d.montant, 0);
  const totalRecurrentMensuel = farm.recurrents.reduce((acc, r) => acc + r.montantMensuel, 0);

  return (
    <AppShell
      title="Dépenses"
      actions={
        <div className="flex bg-muted/30 p-1 rounded-xl">
          <button
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-lg transition-all",
              tab === "ponctuel" ? "bg-background shadow-sm text-foreground" : "text-muted hover:text-foreground/80"
            )}
            onClick={() => setTab("ponctuel")}
          >
            Ponctuelles
          </button>
          <button
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-lg transition-all",
              tab === "recurrent" ? "bg-background shadow-sm text-foreground" : "text-muted hover:text-foreground/80"
            )}
            onClick={() => setTab("recurrent")}
          >
            Récurrentes
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted uppercase tracking-wider">Total Investi</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold tracking-tight">
              {formatMoneyDT(totalPonctuel)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted uppercase tracking-wider">Charges Fixes / mois</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold tracking-tight">
              {formatMoneyDT(totalRecurrentMensuel)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {tab === "ponctuel" ? <OneOffExpenses /> : <RecurringExpenses />}
      </div>
    </AppShell>
  );
}

function OneOffExpenses() {
  const farm = useFarmData();
  const [dateISO, setDateISO] = React.useState<string>(new Date().toISOString().slice(0, 10));
  const [montant, setMontant] = React.useState<string>("");
  const [categorie, setCategorie] = React.useState<ExpenseCategory>("entretien");
  const [lotId, setLotId] = React.useState<string>("");
  const [note, setNote] = React.useState<string>("");

  async function submit() {
    if (!montant || Number(montant) <= 0) return;
    await farm.actions.addExpense({
      dateISO,
      montant: Number(montant),
      categorie,
      lotId: lotId || undefined,
      note: note.trim() || undefined,
    });
    setMontant("");
    setNote("");
  }

  return (
    <div className="grid md:grid-cols-[1fr_2fr] gap-4">
      <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-sm h-fit">
        <CardHeader>
          <div>
            <CardTitle>Nouvelle dépense</CardTitle>
            <CardDescription>Achats de matériel, main d'œuvre ponctuelle...</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <label className="grid gap-1.5">
            <div className="text-sm font-medium text-foreground/80">Montant</div>
            <div className="relative">
              <Input inputMode="decimal" value={montant} onChange={(e) => setMontant(e.target.value)} placeholder="0.00" className="pr-10 bg-background/50" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">DT</div>
            </div>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5">
              <div className="text-sm font-medium text-foreground/80">Date</div>
              <Input type="date" value={dateISO} onChange={(e) => setDateISO(e.target.value)} className="bg-background/50" />
            </label>
            <label className="grid gap-1.5">
              <div className="text-sm font-medium text-foreground/80">Catégorie</div>
              <Select value={categorie} onChange={(e) => setCategorie(e.target.value as ExpenseCategory)}>
                {categories.map((c) => (
                  <option key={c} value={c}>{EXPENSE_CATEGORY_LABEL[c]}</option>
                ))}
              </Select>
            </label>
          </div>
          <label className="grid gap-1.5">
            <div className="text-sm font-medium text-foreground/80">Lier à un lot (Optionnel)</div>
            <Select value={lotId} onChange={(e) => setLotId(e.target.value)}>
              <option value="">-- Aucun lot (Global) --</option>
              {farm.lots.map((l) => (
                <option key={l.id} value={l.id}>{l.nom}</option>
              ))}
            </Select>
          </label>
          <label className="grid gap-1.5">
            <div className="text-sm font-medium text-foreground/80">Note (Optionnel)</div>
            <Input placeholder="Description..." value={note} onChange={(e) => setNote(e.target.value)} className="bg-background/50" />
          </label>
          <Button onClick={submit} disabled={!montant || Number(montant) <= 0} className="w-full gap-2 mt-2">
            <Plus className="w-4 h-4" /> Enregistrer la dépense
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-sm">
        <CardHeader>
          <div>
            <CardTitle>Historique</CardTitle>
            <CardDescription>{farm.depenses.length} dépense(s)</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-2">
          {farm.depenses.map((d) => (
            <div key={d.id} className="group flex items-start justify-between gap-3 rounded-xl border border-border/40 bg-background/40 p-3 hover:border-border transition-colors">
              <div className="flex gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-muted/10 flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4 text-muted" />
                </div>
                <div>
                  <div className="text-sm font-bold">{formatMoneyDT(d.montant)}</div>
                  <div className="text-xs text-muted mt-0.5">
                    {formatDateLong(d.dateISO)} · <span className="font-medium text-foreground/80">{EXPENSE_CATEGORY_LABEL[d.categorie as ExpenseCategory]}</span>
                    {d.lotId && farm.lots.find(l => l.id === d.lotId) ? ` · ${farm.lots.find(l => l.id === d.lotId)?.nom}` : ""}
                  </div>
                  {d.note ? <div className="mt-1 text-xs text-muted/80 italic line-clamp-1">{d.note}</div> : null}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-danger opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => farm.actions.removeExpense(d.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {farm.depenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-border rounded-xl bg-muted/5">
              <Wallet className="w-8 h-8 text-muted mb-3" />
              <div className="text-sm font-medium">Aucune dépense ponctuelle</div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function RecurringExpenses() {
  const farm = useFarmData();
  const [nom, setNom] = React.useState<string>("");
  const [montantMensuel, setMontantMensuel] = React.useState<string>("");
  const [categorie, setCategorie] = React.useState<ExpenseCategory>("irrigation");
  const [debutISO, setDebutISO] = React.useState<string>(new Date().toISOString().slice(0, 10));
  const [lotId, setLotId] = React.useState<string>("");

  async function submit() {
    if (!montantMensuel || Number(montantMensuel) <= 0 || !nom.trim()) return;
    await farm.actions.addRecurring({
      nom: nom.trim(),
      montantMensuel: Number(montantMensuel),
      categorie,
      debutISO,
      lotId: lotId || undefined,
    });
    setNom("");
    setMontantMensuel("");
  }

  return (
    <div className="grid md:grid-cols-[1fr_2fr] gap-4">
      <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-sm h-fit">
        <CardHeader>
          <div>
            <CardTitle>Ajouter une charge fixe</CardTitle>
            <CardDescription>Abonnements, salaires fixes, entretien régulier...</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <label className="grid gap-1.5">
            <div className="text-sm font-medium text-foreground/80">Nom de la charge</div>
            <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Gardien" className="bg-background/50" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5">
              <div className="text-sm font-medium text-foreground/80">Montant / mois</div>
              <div className="relative">
                <Input inputMode="decimal" value={montantMensuel} onChange={(e) => setMontantMensuel(e.target.value)} placeholder="0.00" className="pr-10 bg-background/50" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">DT</div>
              </div>
            </label>
            <label className="grid gap-1.5">
              <div className="text-sm font-medium text-foreground/80">Date de début</div>
              <Input type="date" value={debutISO} onChange={(e) => setDebutISO(e.target.value)} className="bg-background/50" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5">
              <div className="text-sm font-medium text-foreground/80">Catégorie</div>
              <Select value={categorie} onChange={(e) => setCategorie(e.target.value as ExpenseCategory)}>
                {categories.map((c) => (
                  <option key={c} value={c}>{EXPENSE_CATEGORY_LABEL[c]}</option>
                ))}
              </Select>
            </label>
            <label className="grid gap-1.5">
              <div className="text-sm font-medium text-foreground/80">Imputation</div>
              <Select value={lotId} onChange={(e) => setLotId(e.target.value)}>
                <option value="">Ferme globale</option>
                {farm.lots.map((l) => (
                  <option key={l.id} value={l.id}>{l.nom}</option>
                ))}
              </Select>
            </label>
          </div>
          <Button onClick={submit} disabled={!montantMensuel || Number(montantMensuel) <= 0 || !nom.trim()} className="w-full gap-2 mt-2">
            <RefreshCw className="w-4 h-4" /> Enregistrer
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-sm">
        <CardHeader>
          <div>
            <CardTitle>Charges actives</CardTitle>
            <CardDescription>{farm.recurrents.length} ligne(s)</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-2">
          {farm.recurrents.map((r) => (
            <div key={r.id} className="group flex items-start justify-between gap-3 rounded-xl border border-border/40 bg-background/40 p-3 hover:border-border transition-colors">
              <div className="flex gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <div className="text-sm font-bold">{r.nom}</div>
                  <div className="text-xs text-muted mt-0.5 flex flex-wrap gap-x-2 gap-y-1">
                    <span className="font-semibold text-foreground/80">{formatMoneyDT(r.montantMensuel)} / mois</span>
                    <span>•</span>
                    <span>{EXPENSE_CATEGORY_LABEL[r.categorie as ExpenseCategory]}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {formatDateLong(r.debutISO)}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-danger opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => farm.actions.removeRecurring(r.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {farm.recurrents.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-border rounded-xl bg-muted/5">
              <RefreshCw className="w-8 h-8 text-muted mb-3" />
              <div className="text-sm font-medium">Aucune charge récurrente</div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

