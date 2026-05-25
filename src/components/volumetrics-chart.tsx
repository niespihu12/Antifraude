"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { BarChart3 } from "lucide-react";

import { formatBogotaDateTime, formatNumber } from "@/lib/utils";

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ value?: number; name?: string }>;
  label?: string;
};

const monoFont = "var(--font-jetbrains-mono)";
const chartGrid = "#E2E8F0";
const chartAxis = "#CBD5E1";
const chartTick = "#64748B";

const franchiseData = [
  { name: "Monitor", value: 320000, fill: "#71717a" },
  { name: "BRM", value: 210000, fill: "#3b82f6" },
  { name: "EMS/MS", value: 125000, fill: "#ef4444" },
  { name: "Cardinal", value: 45000, fill: "#eab308" },
];

const statusData = [
  { name: "Pendiente Revisión", value: 35, fill: "#eab308" },
  { name: "En Verificación CRM", value: 20, fill: "#3b82f6" },
  { name: "WhatsApp Enviado", value: 15, fill: "#22c55e" },
  { name: "Esperando Cliente", value: 10, fill: "#0033A0" },
  { name: "Bloqueo Preventivo", value: 8, fill: "#ef4444" },
  { name: "Desbloqueado", value: 7, fill: "#22c55e" },
  { name: "Bloqueo Definitivo", value: 3, fill: "#7f1d1d" },
  { name: "Tipificado", value: 2, fill: "#0033A0" },
];

const monthlyData = [
  { mes: "Ene 2026", recibidas: 650000, gestionadas: 18000 },
  { mes: "Feb 2026", recibidas: 680000, gestionadas: 19500 },
  { mes: "Mar 2026", recibidas: 700000, gestionadas: 21000 },
  { mes: "Abr 2026", recibidas: 720000, gestionadas: 22000 },
  { mes: "May 2026", recibidas: 700000, gestionadas: 24500 },
  { mes: "Jun 2026", recibidas: 700000, gestionadas: 28000 },
];

const radarData = [
  { eje: "Cobertura", actual: 4, automatizado: 100 },
  { eje: "Velocidad", actual: 8, automatizado: 98 },
  { eje: "Precisión", actual: 25, automatizado: 85 },
  { eje: "Trazabilidad", actual: 15, automatizado: 95 },
  { eje: "Escalabilidad", actual: 10, automatizado: 99 },
  { eje: "Costo", actual: 20, automatizado: 90 },
];

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const value = payload[0]?.value ?? 0;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      {label ? <p className="text-sm font-semibold text-slate-900">{label}</p> : null}
      <p className="font-mono-jetbrains text-sm text-[#0033A0]">{formatNumber(Number(value))}</p>
    </div>
  );
}

function PanelCard({
  title,
  subtitle,
  children,
  className = "",
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.article
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.3, ease: "easeOut", delay }}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">{title}</h3>
        {subtitle ? <p className="mt-1 text-xs text-[var(--text-secondary)]">{subtitle}</p> : null}
      </div>
      {children}
    </motion.article>
  );
}

function BottomMetric({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
      <p className="mt-1.5 font-mono-jetbrains text-base font-bold text-[var(--text-primary)]">{value}</p>
      <p className="mt-1 text-xs text-[#0033A0]">{trend}</p>
    </div>
  );
}

function StatusLegend() {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {statusData.map((item) => (
        <div key={item.name} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <span className="size-3 rounded-full" style={{ backgroundColor: item.fill }} />
          <span className="flex-1">{item.name}</span>
          <span className="font-mono-jetbrains text-[var(--text-muted)]">{item.value}%</span>
        </div>
      ))}
    </div>
  );
}

function ChartMountGate({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return <div className={className}>{mounted ? children : null}</div>;
}

export default function VolumetricsChart() {
  const [timestamp, setTimestamp] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const update = () => setTimestamp(formatBogotaDateTime(new Date()));

    setMounted(true);
    const timer = window.setInterval(update, 30000);
    update();

    return () => window.clearInterval(timer);
  }, []);

  const bottomMetrics = useMemo(
    () => [
      { label: "Alertas/hora", value: "~360,000", trend: "Proyección To-Be" },
      { label: "Tiempo ciclo", value: "3.4 días → 10 seg", trend: "-99.7%" },
      { label: "Rechazos hoy", value: "2", trend: "Normal" },
      { label: "Última actualización", value: mounted ? timestamp : "--:--:--", trend: "Live" },
    ],
    [mounted, timestamp],
  );

  return (
    <section className="w-full">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-[#0033A0]" />
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Volumetría y Analytics</h2>
        </div>
        <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">Métricas operativas del proceso antifraude</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PanelCard title="Alertas por Franquicia" subtitle="Distribución mensual por fuente de ingreso" className="lg:col-span-1">
          <ChartMountGate className="h-[300px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={franchiseData} margin={{ top: 4, right: 4, left: -8, bottom: -4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                <XAxis dataKey="name" tick={{ fill: chartTick, fontSize: 12, fontFamily: monoFont }} axisLine={{ stroke: chartAxis }} tickLine={false} />
                <YAxis tickFormatter={(value) => formatNumber(Number(value))} tick={{ fill: chartTick, fontSize: 12, fontFamily: monoFont }} axisLine={{ stroke: chartAxis }} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(148, 163, 184, 0.08)" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={1500} animationEasing="ease-out">
                  {franchiseData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartMountGate>
        </PanelCard>

        <PanelCard title="Distribución de Estados" subtitle="Cómo se reparte la operación actual" className="lg:col-span-1">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_0.95fr] xl:items-center">
            <ChartMountGate className="relative h-[300px] min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Tooltip content={<ChartTooltip />} />
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                    startAngle={-90}
                    endAngle={270}
                    isAnimationActive
                    animationDuration={1000}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="font-mono-jetbrains text-3xl font-bold text-[var(--text-primary)]">700K</div>
                <div className="text-xs text-[var(--text-secondary)]">alertas/mes</div>
              </div>
            </ChartMountGate>

            <StatusLegend />
          </div>
        </PanelCard>

        <PanelCard title="Tendencia Mensual" subtitle="Recibidas vs gestionadas, con proyección hacia To-Be" className="lg:col-span-2">
          <ChartMountGate className="h-[320px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={monthlyData} margin={{ top: 8, right: 8, left: -8, bottom: -4 }}>
                <defs>
                  <linearGradient id="gradientBdb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0033A0" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0033A0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                <XAxis dataKey="mes" tick={{ fill: chartTick, fontSize: 12, fontFamily: monoFont }} axisLine={{ stroke: chartAxis }} tickLine={false} />
                <YAxis tickFormatter={(value) => formatNumber(Number(value))} tick={{ fill: chartTick, fontSize: 12, fontFamily: monoFont }} axisLine={{ stroke: chartAxis }} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ color: chartTick, fontSize: 12, paddingBottom: 8 }} />
                <Area type="monotone" dataKey="recibidas" name="Recibidas" stroke="#71717a" fill="#71717a1a" strokeWidth={2} isAnimationActive animationDuration={1500} />
                <Area type="monotone" dataKey="gestionadas" name="Gestionadas" stroke="#0033A0" fill="url(#gradientBdb)" strokeWidth={3} isAnimationActive animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartMountGate>
        </PanelCard>

        <PanelCard title="Before vs After" subtitle="Brecha operativa entre el proceso actual y el automatizado" className="lg:col-span-2">
          <ChartMountGate className="h-[320px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke={chartGrid} />
                <PolarAngleAxis dataKey="eje" tick={{ fill: chartTick, fontSize: 12, fontFamily: monoFont }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#71717a", fontSize: 11, fontFamily: monoFont }} />
                <Radar name="Actual" dataKey="actual" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} strokeWidth={2} isAnimationActive animationDuration={1500} />
                <Radar name="Automatizado" dataKey="automatizado" stroke="#0033A0" fill="#0033A0" fillOpacity={0.2} strokeWidth={2} isAnimationActive animationDuration={1500} />
                <Legend iconType="circle" wrapperStyle={{ color: chartTick, fontSize: 12, paddingTop: 8 }} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartMountGate>
        </PanelCard>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {bottomMetrics.map((metric) => (
          <BottomMetric key={metric.label} label={metric.label} value={metric.value} trend={metric.trend} />
        ))}
      </div>
    </section>
  );
}
