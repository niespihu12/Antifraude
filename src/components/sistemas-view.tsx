"use client";

import {
  Bot,
  CreditCard,
  Database,
  LockKeyhole,
  MessageCircle,
  Monitor,
  Server,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useSimulation, type SimulationAlert } from "@/context/simulation-context";
import { formatBogotaTime, formatNumber } from "@/lib/utils";

type SystemDefinition = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  monthlyVolume: string;
  metricLabel: string;
  load: number;
  tone: string;
  predicate: (alert: SimulationAlert) => boolean;
};

const systems: SystemDefinition[] = [
  {
    id: "monitor",
    name: "Monitor",
    description: "Interno",
    icon: Monitor,
    monthlyVolume: "320.000 alertas/mes",
    metricLabel: "Alertas procesadas hoy",
    load: 72,
    tone: "bg-slate-100 text-slate-600",
    predicate: (alert) => alert.area === "Monitor",
  },
  {
    id: "brm",
    name: "BRM",
    description: "Visa Risk Manager",
    icon: CreditCard,
    monthlyVolume: "210.000 alertas/mes",
    metricLabel: "Alertas procesadas hoy",
    load: 64,
    tone: "bg-blue-100 text-blue-700",
    predicate: (alert) => alert.area === "BRM",
  },
  {
    id: "ems",
    name: "EMS/MS",
    description: "Mastercard",
    icon: CreditCard,
    monthlyVolume: "125.000 alertas/mes",
    metricLabel: "Alertas procesadas hoy",
    load: 58,
    tone: "bg-red-100 text-red-700",
    predicate: (alert) => alert.area === "EMS/MS",
  },
  {
    id: "cardinal",
    name: "Cardinal",
    description: "Visa",
    icon: ShieldCheck,
    monthlyVolume: "45.000 alertas/mes",
    metricLabel: "Validaciones hoy",
    load: 42,
    tone: "bg-amber-100 text-amber-700",
    predicate: (alert) => alert.fase === "decision",
  },
  {
    id: "crm",
    name: "CRM Banco",
    description: "Consulta y registro",
    icon: Database,
    monthlyVolume: "700.000 consultas/mes",
    metricLabel: "Consultas hoy",
    load: 86,
    tone: "bg-blue-100 text-[#0033A0]",
    predicate: (alert) => alert.fase === "identificacion" || alert.fase === "registro",
  },
  {
    id: "kari",
    name: "Kari AI",
    description: "WhatsApp",
    icon: Bot,
    monthlyVolume: "490.000 mensajes/mes",
    metricLabel: "Mensajes hoy",
    load: 70,
    tone: "bg-emerald-100 text-emerald-700",
    predicate: (alert) => alert.fase === "comunicacion",
  },
  {
    id: "ppe",
    name: "PPE",
    description: "Bloqueos",
    icon: LockKeyhole,
    monthlyVolume: "50.000 bloqueos/mes",
    metricLabel: "Acciones hoy",
    load: 36,
    tone: "bg-purple-100 text-purple-700",
    predicate: (alert) => alert.fase === "decision" || alert.fase === "registro",
  },
];

function SystemCard({ system, isOffline }: { system: SystemDefinition; isOffline: boolean }) {
  const { allAlerts, logs, tick } = useSimulation();
  const Icon = system.icon;
  const processed = allAlerts.filter(system.predicate);
  const recent = processed.slice(0, 5);
  const simulatedToday = Math.round(processed.length * 18 + tick * (system.load / 100));
  const avgSeconds = Math.max(8, Math.round(42 - system.load / 4));
  const lastLog = logs.find((log) => recent.some((alert) => alert.id === log.alertId));

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`flex size-10 items-center justify-center rounded-lg ${system.tone}`}>
            <Icon className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">{system.name}</h2>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              {system.description}
            </p>
          </div>
        </div>
        {isOffline ? (
          <span className="badge-compact rounded bg-red-100 text-red-700">
            Offline
          </span>
        ) : (
          <span className="badge-compact rounded bg-emerald-100 text-emerald-700">
            Online
          </span>
        )}
      </div>

      {isOffline ? (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          Sistema temporalmente no disponible
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                {system.metricLabel}
              </p>
              <p className="mt-1 font-mono-jetbrains text-lg font-bold text-slate-900">
                {formatNumber(simulatedToday)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Tiempo promedio
              </p>
              <p className="mt-1 font-mono-jetbrains text-lg font-bold text-slate-900">
                {avgSeconds}s
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="uppercase tracking-wider text-slate-500">Carga simulada</span>
              <span className="font-mono-jetbrains text-slate-600">{system.load}%</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#0033A0]"
                style={{ width: `${system.load}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
            <span>{system.monthlyVolume}</span>
            <span className="font-mono-jetbrains">
              {lastLog ? formatBogotaTime(lastLog.timestamp) : "--:--:--"}
            </span>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center gap-2">
              <MessageCircle className="size-3.5 text-[#0033A0]" />
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Últimas alertas procesadas
              </p>
            </div>
            <div className="space-y-2">
              {recent.length > 0 ? (
                recent.map((alert) => (
                  <div
                    key={`${system.id}-${alert.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                  >
                    <span className="font-mono-jetbrains text-slate-900">{alert.id}</span>
                    <span className="truncate text-slate-600">{alert.estado}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-[var(--border-subtle)] px-3 py-3 text-xs text-slate-500">
                  Sin actividad para el filtro operativo actual.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </article>
  );
}

export function SistemasView() {
  const [activeTab, setActiveTab] = useState("monitor");
  const [offlineIndex, setOfflineIndex] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setOfflineIndex((prev) => (prev + 1) % systems.length);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const activeSystem = systems.find((s) => s.id === activeTab) || systems[0];

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Server className="size-4 text-[#0033A0]" />
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">
            Monitoreo de Sistemas
          </h1>
        </div>
        <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
          Estado en tiempo real de los aplicativos de la plataforma
        </p>
      </div>

      <div className="flex max-w-full gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        {systems.map((system, index) => {
          const Icon = system.icon;
          const active = activeTab === system.id;
          const isOffline = index === offlineIndex;

          return (
            <button
              key={system.id}
              type="button"
              onClick={() => setActiveTab(system.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                active
                  ? "bg-[#0033A0] text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className="size-3.5" />
              {system.name}
              {isOffline ? (
                <span className="size-1.5 rounded-full bg-red-400" />
              ) : (
                <span className="size-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>

      <SystemCard 
        system={activeSystem} 
        isOffline={systems.indexOf(activeSystem) === offlineIndex} 
      />
    </div>
  );
}
