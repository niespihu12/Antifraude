"use client";

import { motion } from "framer-motion";
import { AlertTriangle, GitBranch, List, PanelsTopLeft, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { AlertPipeline } from "@/components/alert-pipeline";
import { GlobalFilters } from "@/components/global-filters";
import {
  phaseLabels,
  useSimulation,
  type SimulationAlert,
} from "@/context/simulation-context";
import { formatCOP } from "@/lib/utils";

type ViewMode = "cards" | "list";

type SwimlaneDefinition = {
  id: string;
  name: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  predicate: (alert: SimulationAlert) => boolean;
};

const swimlanes: SwimlaneDefinition[] = [
  {
    id: "monitor",
    name: "Monitor",
    subtitle: "Recepción interna",
    icon: PanelsTopLeft,
    color: "text-slate-600 bg-slate-100",
    predicate: (alert) => alert.area === "Monitor",
  },
  {
    id: "brm",
    name: "BRM",
    subtitle: "Visa Risk Manager",
    icon: PanelsTopLeft,
    color: "text-blue-700 bg-blue-100",
    predicate: (alert) => alert.area === "BRM",
  },
  {
    id: "ems",
    name: "EMS/MS",
    subtitle: "Mastercard",
    icon: PanelsTopLeft,
    color: "text-red-700 bg-red-100",
    predicate: (alert) => alert.area === "EMS/MS",
  },
  {
    id: "cardinal",
    name: "Cardinal",
    subtitle: "Autenticación Visa",
    icon: PanelsTopLeft,
    color: "text-amber-700 bg-amber-100",
    predicate: (alert) => alert.fase === "decision",
  },
  {
    id: "crm",
    name: "CRM Banco",
    subtitle: "Identificación y registro",
    icon: PanelsTopLeft,
    color: "text-[#0033A0] bg-blue-100",
    predicate: (alert) => alert.fase === "identificacion" || alert.fase === "registro",
  },
  {
    id: "kari",
    name: "Kari AI",
    subtitle: "WhatsApp conversacional",
    icon: PanelsTopLeft,
    color: "text-emerald-700 bg-emerald-100",
    predicate: (alert) => alert.fase === "comunicacion",
  },
  {
    id: "ppe",
    name: "PPE",
    subtitle: "Bloqueos y desbloqueos",
    icon: PanelsTopLeft,
    color: "text-purple-700 bg-purple-100",
    predicate: (alert) => alert.fase === "decision" || alert.fase === "registro",
  },
];

function AlertMiniCard({ alert, mode }: { alert: SimulationAlert; mode: ViewMode }) {
  const borderColor = alert.franquicia === "VISA" ? "border-t-blue-400" : alert.franquicia === "MASTERCARD" ? "border-t-red-400" : "border-t-slate-400";
  const franchiseColor = alert.franquicia === "VISA" ? "text-blue-700" : alert.franquicia === "MASTERCARD" ? "text-red-700" : "text-slate-600";

  if (mode === "list") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`grid min-w-[680px] grid-cols-[130px_110px_1fr_120px_90px] items-center gap-3 rounded-lg border border-[var(--border-subtle)] border-t-[3px] ${borderColor} bg-[var(--bg-elevated)] px-3 py-2 text-xs text-[var(--text-secondary)]`}
      >
        <span className="font-mono-jetbrains text-slate-900">{alert.id}</span>
        <span className={`badge-compact rounded ${franchiseColor}`}>
          {alert.franquicia}
        </span>
        <span className="truncate">{phaseLabels[alert.fase]}</span>
        <span className="font-mono-jetbrains text-slate-900">{formatCOP(alert.monto)}</span>
        <span className="font-mono-jetbrains">{alert.tiempo}</span>
      </motion.div>
    );
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`min-w-[210px] rounded-lg border border-[var(--border-subtle)] border-t-[3px] ${borderColor} bg-[var(--bg-elevated)] p-3`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono-jetbrains text-xs text-slate-400">
            {alert.id}
          </span>
          <AlertTriangle className="size-3 text-amber-400" />
        </div>
        <span className={`badge-compact rounded text-[10px] ${franchiseColor}`}>
          {alert.franquicia}
        </span>
      </div>
      <p className="mt-2 text-sm font-medium text-slate-900 truncate">
        {alert.cliente}
      </p>
      <p className="mt-1 font-mono-jetbrains text-lg font-bold text-slate-900">{formatCOP(alert.monto)}</p>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
        <span className={`badge-compact rounded px-2 py-0.5 ${franchiseColor}`}>
          {alert.franquicia}
        </span>
        <span className="font-mono-jetbrains text-slate-500">
          {alert.tiempo}
        </span>
      </div>
    </motion.article>
  );
}

export function PipelineView() {
  const { alerts } = useSimulation();
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const lanes = useMemo(
    () =>
      swimlanes.map((lane) => ({
        ...lane,
        alerts: alerts.filter(lane.predicate).slice(0, 8),
      })),
    [alerts],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="size-4 text-[#0033A0]" />
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">
              Pipeline de Alertas
            </h1>
          </div>
          <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
            Visualización del flujo en tiempo real por área
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {[
              { id: "all", label: "Todas" },
              { id: "visa", label: "Visa" },
              { id: "mastercard", label: "Mastercard" },
              { id: "monitor", label: "Monitor" },
              { id: "urgent", label: "Urgentes" },
              { id: "fraud", label: "Fraudulentas" },
            ].map((option) => {
              const active = false;

              return (
                <button
                  key={option.id}
                  type="button"
                  className={`rounded px-2.5 py-1 text-xs font-medium transition-all ${
                    active
                      ? "bg-blue-100 text-[#0033A0]"
                      : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            {[
              { id: "cards", label: "Tarjetas", icon: PanelsTopLeft },
              { id: "list", label: "Lista", icon: List },
            ].map((option) => {
              const Icon = option.icon;
              const active = viewMode === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setViewMode(option.id as ViewMode)}
                  className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? "bg-[#0033A0] text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <GlobalFilters compact />
      <AlertPipeline />

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Swimlanes por Aplicativo
            </h2>
            <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
              Monitor, franquicias, CRM, Kari AI y PPE coordinados por alertas vivas
            </p>
          </div>
          <span className="badge-compact rounded bg-[var(--bg-elevated)] font-mono-jetbrains text-[var(--text-secondary)]">
            {alerts.length} alertas
          </span>
        </div>

        <div className="space-y-3">
          {lanes.map((lane) => {
            const Icon = lane.icon;

            return (
              <div
                key={lane.id}
                className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 xl:grid-cols-[190px_minmax(0,1fr)]"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex size-9 items-center justify-center rounded-lg ${lane.color}`}>
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{lane.name}</p>
                    <p className="text-xs text-slate-500">{lane.subtitle}</p>
                  </div>
                  <span className="ml-auto font-mono-jetbrains text-xs text-slate-500 xl:hidden">
                    {lane.alerts.length}
                  </span>
                </div>

                <div className="min-w-0 overflow-x-auto">
                  {lane.alerts.length > 0 ? (
                    <div
                      className={
                        viewMode === "cards"
                          ? "flex gap-2"
                          : "flex min-w-max flex-col gap-2"
                      }
                    >
                      {lane.alerts.map((alert) => (
                        <AlertMiniCard key={`${lane.id}-${alert.id}`} alert={alert} mode={viewMode} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-[var(--border-subtle)] px-3 py-4 text-xs text-slate-500">
                      Sin alertas visibles para el filtro actual.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
