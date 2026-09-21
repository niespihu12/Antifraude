"use client";

import dynamic from "next/dynamic";
import {
  BarChart3,
  Clock,
  Download,
  Gauge,
  ShieldAlert,
  TimerReset,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { useSimulation } from "@/context/simulation-context";
import { formatNumber } from "@/lib/utils";

const VolumetricsChart = dynamic(
  () => import("@/components/volumetrics-chart"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 text-center text-sm text-[var(--text-secondary)]">
        Cargando panel de métricas...
      </div>
    ),
  },
);

const timeFilters = ["Últimos 30 días", "ENE", "FEB", "MAR", "ABR", "MAY", "JUN"];

const bottlenecks = [
  { area: "Recepción", actual: 82, toBe: 18 },
  { area: "Identificación CRM", actual: 76, toBe: 12 },
  { area: "Comunicación cliente", actual: 94, toBe: 20 },
  { area: "Decisión y bloqueo", actual: 68, toBe: 10 },
  { area: "Registro final", actual: 55, toBe: 8 },
];

const blockReasons = [
  { reason: "Monto inusual", value: 36, color: "bg-red-400" },
  { reason: "Ubicación atípica", value: 24, color: "bg-amber-400" },
  { reason: "Comercio riesgoso", value: 18, color: "bg-[#0033A0]" },
  { reason: "Velocidad transaccional", value: 14, color: "bg-blue-400" },
  { reason: "Respuesta negativa", value: 8, color: "bg-purple-400" },
];

function MetricCard({
  label,
  current,
  target,
  icon: Icon,
  tone,
}: {
  label: string;
  current: string;
  target: string;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
          <div className="mt-3 flex flex-wrap items-baseline gap-2">
            <span className="font-mono-jetbrains text-xl font-bold text-red-600 line-through">
              {current}
            </span>
            <span className="font-mono-jetbrains text-2xl font-bold text-emerald-700">
              {target}
            </span>
          </div>
        </div>
        <div className={`flex size-10 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </article>
  );
}

function HorizontalBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-slate-600">{label}</span>
        <span className="font-mono-jetbrains text-slate-700">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function MetricasView() {
  const { metrics, tick } = useSimulation();
  const [activeFilter, setActiveFilter] = useState(timeFilters[0]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-[#0033A0]" />
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">
              Métricas y Análisis
            </h1>
          </div>
          <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
            Rendimiento del proceso de alertas antifraude
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex max-w-full gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            {timeFilters.map((filter) => {
              const active = activeFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`shrink-0 rounded px-2.5 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? "bg-blue-100 text-[#0033A0]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            <Download className="size-3.5" />
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Tiempo Promedio Ciclo"
          current="40 min"
          target="<2 min"
          icon={Clock}
          tone="bg-blue-100 text-[#0033A0]"
        />
        <MetricCard
          label="Tasa de Falsos Positivos"
          current="75%"
          target={`${metrics.falsePositives}%`}
          icon={ShieldAlert}
          tone="bg-amber-100 text-amber-700"
        />
        <MetricCard
          label="Throughput Alertas/Hora"
          current="30.000"
          target={formatNumber(360000)}
          icon={Gauge}
          tone="bg-emerald-100 text-emerald-700"
        />
        <MetricCard
          label="Tiempo en Ciclo Crítico"
          current="3.4 días"
          target="10 seg"
          icon={TimerReset}
          tone="bg-blue-100 text-blue-700"
        />
      </div>

      <VolumetricsChart />

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Mapa de Calor — Cuellos de Botella
            </h2>
            <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
              Comparativo de presión operativa por área
            </p>
          </div>
          <div className="space-y-4">
            {bottlenecks.map((item) => (
              <div key={item.area} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-700">{item.area}</span>
                  <span className="font-mono-jetbrains text-slate-500">
                    tick {formatNumber(tick)}
                  </span>
                </div>
                <HorizontalBar label="Actual" value={item.actual} color="bg-red-400" />
                <HorizontalBar label="To-Be" value={item.toBe} color="bg-[#0033A0]" />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Razones de Bloqueo
            </h2>
            <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
              Distribución simulada por motivo de riesgo
            </p>
          </div>
          <div className="space-y-4">
            {blockReasons.map((item) => (
              <HorizontalBar
                key={item.reason}
                label={item.reason}
                value={item.value}
                color={item.color}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
