"use client";

import { PieChart } from "lucide-react";

import {
  phaseLabels,
  phaseOrder,
  useSimulation,
  type FaseProcesoKey,
} from "@/context/simulation-context";
import { formatNumber } from "@/lib/utils";

const phaseColors: Record<FaseProcesoKey, string> = {
  recepcion: "#eab308",
  identificacion: "#3b82f6",
  comunicacion: "#22c55e",
  decision: "#0033A0",
  registro: "#a855f7",
};

function buildConicGradient(counts: Record<FaseProcesoKey, number>) {
  const total = phaseOrder.reduce((sum, phase) => sum + counts[phase], 0);

  if (total === 0) {
    return "conic-gradient(#e2e8f0 0deg 360deg)";
  }

  let cursor = 0;
  const segments = phaseOrder.map((phase) => {
    const degrees = (counts[phase] / total) * 360;
    const start = cursor;
    cursor += degrees;
    return `${phaseColors[phase]} ${start}deg ${cursor}deg`;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

export function StateDistributionCard({ compact }: { compact?: boolean }) {
  const { metrics } = useSimulation();
  const gradient = buildConicGradient(metrics.alertsInPhase);

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div
          className="relative grid size-[180px] shrink-0 place-items-center rounded-full"
          style={{ background: gradient }}
        >
          <div className="grid size-32 place-items-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center">
            <div>
              <p className="font-mono-jetbrains text-2xl font-bold text-slate-900">
                {formatNumber(metrics.totalAlerts)}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                total
              </p>
            </div>
          </div>
        </div>

        <div className="w-full space-y-2">
          {phaseOrder.map((phase) => {
            const count = metrics.alertsInPhase[phase];
            const percent =
              metrics.totalAlerts > 0
                ? Math.round((count / metrics.totalAlerts) * 100)
                : 0;

            return (
              <div key={phase} className="flex items-center gap-2 text-xs">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: phaseColors[phase] }}
                />
                <span className="min-w-0 flex-1 truncate text-[var(--text-secondary)]">
                  {phaseLabels[phase]}
                </span>
                <span className="font-mono-jetbrains text-[var(--text-primary)]">
                  {count}
                </span>
                <span className="w-8 text-right font-mono-jetbrains text-[var(--text-muted)]">
                  {percent}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="size-4 text-[#0033A0]" />
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Distribución por Estado
            </h2>
          </div>
          <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
            Alertas vivas por fase
          </p>
        </div>
        <span className="badge-compact rounded bg-[var(--bg-elevated)] font-mono-jetbrains text-[var(--text-secondary)]">
          {formatNumber(metrics.totalAlerts)}
        </span>
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row lg:flex-col xl:flex-row">
        <div
          className="relative grid size-36 shrink-0 place-items-center rounded-full"
          style={{ background: gradient }}
        >
          <div className="grid size-24 place-items-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center">
            <div>
              <p className="font-mono-jetbrains text-2xl font-bold text-slate-900">
                {formatNumber(metrics.totalAlerts)}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                total
              </p>
            </div>
          </div>
        </div>

        <div className="w-full space-y-2">
          {phaseOrder.map((phase) => {
            const count = metrics.alertsInPhase[phase];
            const percent =
              metrics.totalAlerts > 0
                ? Math.round((count / metrics.totalAlerts) * 100)
                : 0;

            return (
              <div key={phase} className="flex items-center gap-3 text-sm">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: phaseColors[phase] }}
                />
                <span className="min-w-0 flex-1 truncate text-[var(--text-secondary)]">
                  {phaseLabels[phase]}
                </span>
                <span className="font-mono-jetbrains text-xs text-[var(--text-primary)]">
                  {count}
                </span>
                <span className="w-9 text-right font-mono-jetbrains text-xs text-[var(--text-muted)]">
                  {percent}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
