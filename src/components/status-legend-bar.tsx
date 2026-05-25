"use client";

import { motion } from "framer-motion";

import {
  phaseLabels,
  useSimulation,
  type FaseProcesoKey,
} from "@/context/simulation-context";
import { formatBogotaTime } from "@/lib/utils";

type LegendItem = {
  phase: FaseProcesoKey;
  label: string;
  dotClass: string;
  badgeClass: string;
};

const legendItems: LegendItem[] = [
  {
    phase: "recepcion",
    label: "Pendiente",
    dotClass: "bg-amber-400",
    badgeClass: "bg-amber-100 text-amber-700",
  },
  {
    phase: "identificacion",
    label: "Verificación",
    dotClass: "bg-blue-400",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  {
    phase: "comunicacion",
    label: "WhatsApp",
    dotClass: "bg-emerald-400",
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
  {
    phase: "decision",
    label: "Esperando",
    dotClass: "bg-[#0033A0]",
    badgeClass: "bg-blue-100 text-[#0033A0]",
  },
  {
    phase: "registro",
    label: "Cerradas",
    dotClass: "bg-purple-400",
    badgeClass: "bg-purple-100 text-purple-700",
  },
];

export function StatusLegendBar() {
  const { lastTickAtMs, metrics } = useSimulation();

  return (
    <aside className="fixed bottom-0 left-0 right-0 z-40 h-14 border-t border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur-md lg:px-6">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4">
        <div className="hidden shrink-0 text-xs uppercase tracking-wider text-slate-500 md:block">
          Estados en tiempo real
        </div>

        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-2 md:justify-center">
          {legendItems.map((item) => {
            const count = metrics.alertsInPhase[item.phase];

            return (
              <motion.div
                key={`${item.phase}-${count}`}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded px-2 py-1 text-[11px] font-medium ${item.badgeClass}`}
                title={phaseLabels[item.phase]}
              >
                <span className={`size-1.5 rounded-full ${item.dotClass}`} />
                <span>{item.label}</span>
                <span className="font-mono-jetbrains">{count}</span>
              </motion.div>
            );
          })}
        </div>

        <div className="hidden shrink-0 items-center gap-2 text-xs text-slate-500 sm:flex">
          <span>Última actualización:</span>
          <span className="font-mono-jetbrains text-slate-600">
            {formatBogotaTime(lastTickAtMs)}
          </span>
        </div>
      </div>
    </aside>
  );
}
