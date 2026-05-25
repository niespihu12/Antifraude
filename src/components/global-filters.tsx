"use client";

import { Pause, Play } from "lucide-react";

import {
  filterLabels,
  useSimulation,
  type ActiveFilter,
} from "@/context/simulation-context";
import { formatNumber } from "@/lib/utils";

const filterOptions: ActiveFilter[] = [
  "all",
  "visa",
  "mastercard",
  "monitor",
  "urgent",
  "fraud",
];

export function GlobalFilters({ compact = false }: { compact?: boolean }) {
  const {
    activeFilter,
    allAlertCount,
    alerts,
    isRunning,
    metrics,
    speed,
    tick,
    setActiveFilter,
    toggleRunning,
  } = useSimulation();

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            Filtro global de simulación
          </p>
          <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
            KPIs, pipeline y tabla sincronizados
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="badge-compact rounded bg-[var(--bg-elevated)] font-mono-jetbrains text-[var(--text-secondary)]">
            tick {formatNumber(tick)}
          </span>
          <span className="badge-compact rounded bg-blue-100 font-mono-jetbrains text-[#0033A0]">
            {speed}x
          </span>
          <span
            className="badge-compact rounded bg-[var(--bg-elevated)] font-mono-jetbrains text-[var(--text-secondary)]"
            data-testid="global-alert-ratio"
          >
            {alerts.length}/{allAlertCount} alertas
          </span>
          <button
            type="button"
            onClick={toggleRunning}
            className="badge-compact inline-flex items-center gap-1 rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)]"
          >
            {isRunning ? <Pause className="size-3" /> : <Play className="size-3" />}
            {isRunning ? "Pausar" : "Reanudar"}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {filterOptions.map((filter) => {
          const isActive = activeFilter === filter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              data-filter={filter}
              className={`badge-compact rounded border transition-all duration-150 active:scale-95 ${
                isActive
                  ? "border-blue-200 bg-blue-100 text-[#0033A0]"
                  : "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {filterLabels[filter]}
            </button>
          );
        })}
      </div>

      {!compact ? (
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-[var(--text-muted)] sm:grid-cols-4">
          <span>
            Recibidas:{" "}
            <span className="font-mono-jetbrains text-[var(--text-primary)]">
              {formatNumber(metrics.totalAlerts)}
            </span>
          </span>
          <span>
            Gestionadas:{" "}
            <span className="font-mono-jetbrains text-[var(--text-primary)]">
              {formatNumber(metrics.processedToday)}
            </span>
          </span>
          <span>
            Bloqueos:{" "}
            <span className="font-mono-jetbrains text-[var(--text-primary)]">
              {formatNumber(metrics.fraudBlocked)}
            </span>
          </span>
          <span>
            FP:{" "}
            <span className="font-mono-jetbrains text-[var(--text-primary)]">
              {metrics.falsePositives}%
            </span>
          </span>
        </div>
      ) : null}
    </div>
  );
}
