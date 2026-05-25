"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Clock,
  GitBranch,
  MessageCircle,
  PieChart,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { ActivityLog } from "@/components/activity-log";
import { AlertPipeline } from "@/components/alert-pipeline";
import { AlertsTable } from "@/components/alerts-table";
import { BeforeAfterComparison } from "@/components/before-after-comparison";
import { GlobalFilters } from "@/components/global-filters";
import { KpiCards } from "@/components/kpi-cards";
import { SimulationPanel } from "@/components/simulation-panel";
import { StateDistributionCard } from "@/components/state-distribution-card";
import { WhatsAppPreview } from "@/components/whatsapp-preview";

function RevealSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}

function ViewEyebrow({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="mt-0.5 flex size-8 items-center justify-center rounded-lg bg-blue-100 text-[#0033A0]">
        <Icon className="size-4" />
      </div>
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export function DashboardView() {
  return (
    <div className="space-y-5">
      <RevealSection>
        <ViewEyebrow
          icon={GitBranch}
          title="El Viaje de una Alerta"
          subtitle="Resumen ejecutivo del flujo vivo, desde recepción hasta registro"
        />
        <AlertPipeline />
      </RevealSection>

      <RevealSection>
        <ViewEyebrow
          icon={Activity}
          title="Indicadores Operativos"
          subtitle="KPIs recalculados desde el SimulationContext"
        />
        <KpiCards />
      </RevealSection>

      <RevealSection>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Buscar alerta, franquicia, número..."
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-[#0033A0]/50 focus:outline-none focus:ring-1 focus:ring-[#0033A0]/30"
                />
              </div>
              <GlobalFilters compact />
            </div>
            <AlertsTable />
          </div>

          <aside className="flex w-full flex-col gap-4 lg:w-[320px]">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <PieChart className="size-4 text-[#0033A0]" />
                <h2 className="text-sm font-semibold text-slate-900">% Distribución por Estado</h2>
              </div>
              <StateDistributionCard compact />
            </div>
            
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Clock className="size-4 text-[#0033A0]" />
                <h2 className="text-sm font-semibold text-slate-900">Actividad Reciente</h2>
              </div>
              <div className="h-[200px] overflow-hidden">
                <ActivityLog compact />
              </div>
            </div>
          </aside>
        </div>
      </RevealSection>

      <RevealSection>
        <ViewEyebrow
          icon={Sparkles}
          title="Automatización en Acción"
          subtitle="Secuencia To-Be y conversación de validación con Kari AI"
        />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.55fr)]">
          <SimulationPanel />
          <WhatsAppPreview />
        </div>
      </RevealSection>

      <RevealSection>
        <ViewEyebrow
          icon={MessageCircle}
          title="Impacto Ejecutivo"
          subtitle="Diferencias clave entre operación manual y automatizada"
        />
        <BeforeAfterComparison />
      </RevealSection>
    </div>
  );
}
