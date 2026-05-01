"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  BarChart3,
  Sprout,
  Wallet,
  Layers,
  LineChart,
} from "lucide-react";

const nav = [
  { href: "/", label: "Résumé", icon: BarChart3 },
  { href: "/structure", label: "Structure", icon: Sprout },
  { href: "/lots", label: "Lots", icon: Layers },
  { href: "/depenses", label: "Dépenses", icon: Wallet },
  { href: "/projections", label: "Projections", icon: LineChart },
];

export function AppShell({
  title,
  children,
  actions,
}: {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto w-full max-w-4xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-muted">OlivierPilot</div>
            <div className="truncate text-base font-semibold tracking-tight">
              {title ?? "Tableau de bord"}
            </div>
          </div>
          <div className="shrink-0">{actions}</div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-4 pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/90 backdrop-blur">
        <div className="mx-auto w-full max-w-4xl px-2 py-2 grid grid-cols-5 gap-1">
          {nav.map((i) => (
            <NavItem key={i.href} {...i} />
          ))}
        </div>
      </nav>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted hover:bg-black/[0.03] dark:hover:bg-white/[0.06]",
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="leading-none">{label}</span>
    </Link>
  );
}

