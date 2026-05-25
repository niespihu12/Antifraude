"use client";

import { motion } from "framer-motion";
import { Check, CheckCircle2, X, XCircle } from "lucide-react";
import type { ReactNode } from "react";

const currentItems = [
  ["Personal operativo requerido", "50 asesores 24/7"],
  ["Aplicativos separados", "6 plataformas"],
  ["Tiempo de respuesta promedio", "~40 minutos"],
  ["Alertas gestionadas/mes", "20,000 - 30,000"],
  ["Tasa de falsos positivos", "70% - 80%"],
  ["Reportería y analytics", "Excel manual"],
  ["Contactabilidad con cliente", "Llamadas <40%"],
  ["Riesgo operacional", "Alto (usuarios/tokens manuales)"],
] as const satisfies ReadonlyArray<readonly [string, string]>;

const futureItems = [
  ["Personal operativo requerido", "0 intervención humana"],
  ["Aplicativos separados", "Orquestador central único"],
  ["Tiempo de respuesta promedio", "< 2 minutos"],
  ["Alertas gestionadas/mes", "700,000 (100%)"],
  ["Tasa de falsos positivos", "< 50% (con IA)"],
  ["Reportería y analytics", "Dashboard tiempo real"],
  ["Contactabilidad con cliente", "WhatsApp ~95%"],
  ["Riesgo operacional", "Mínimo (APIs seguras)"],
] as const satisfies ReadonlyArray<readonly [string, string]>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },
} as const;

function ListItem({
  label,
  value,
  isFuture,
}: {
  label: string;
  value: string;
  isFuture: boolean;
}) {
  return (
    <motion.li
      variants={itemVariants}
      className="flex items-center gap-3 border-b border-[var(--border-subtle)] py-2.5"
    >
      {isFuture ? <Check className="size-4 shrink-0 text-emerald-600" /> : <X className="size-4 shrink-0 text-red-600" />}
      <span className="flex-1 text-slate-600">{label}</span>
      <span className={`font-mono-jetbrains ${isFuture ? "text-emerald-700" : "text-red-700"}`}>{value}</span>
    </motion.li>
  );
}

function ComparisonColumn({
  title,
  badge,
  icon,
  accent,
  items,
  future,
}: {
  title: string;
  badge: string;
  icon: ReactNode;
  accent: string;
  items: ReadonlyArray<readonly [string, string]>;
  future: boolean;
}) {
  return (
    <motion.div
      className={`rounded-xl border p-4 ${accent}`}
      initial={future ? { opacity: 0, x: 12 } : { opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: future ? 0.1 : 0 }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex size-11 items-center justify-center rounded-full ${future ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
            {icon}
          </div>
          <div>
            <h3 className={`text-lg font-bold tracking-tight ${future ? "text-emerald-700" : "text-red-700"}`}>{title}</h3>
          </div>
        </div>

        <span className={`badge-compact rounded ${future ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
          {badge}
        </span>
      </div>

      <motion.ul
        className="mt-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {items.map(([label, value]) => (
          <ListItem key={label} label={label} value={value} isFuture={future} />
        ))}
      </motion.ul>
    </motion.div>
  );
}

export function BeforeAfterComparison() {
  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-5 text-center">
        <div className="inline-flex items-center justify-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Impacto de la Automatización</h2>
        </div>
        <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">Antes vs después operativo</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ComparisonColumn
          title="Proceso Actual"
          badge="100% Manual"
          icon={<XCircle className="size-5" />}
          accent="border-slate-200 bg-white shadow-sm"
          items={currentItems}
          future={false}
        />

        <ComparisonColumn
          title="Proceso Automatizado"
          badge="100% Automático"
          icon={<CheckCircle2 className="size-5" />}
          accent="border-slate-200 bg-white shadow-sm"
          items={futureItems}
          future={true}
        />
      </div>
    </section>
  );
}
