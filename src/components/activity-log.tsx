"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  Lock,
  MessageCircle,
  Smartphone,
  Unlock,
  Activity,
} from "lucide-react";

import {
  phaseLabels,
  useSimulation,
  type ActivityLog as SimulationActivityLog,
} from "@/context/simulation-context";
import { formatBogotaTime } from "@/lib/utils";

function iconForType(type: SimulationActivityLog["type"]) {
  switch (type) {
    case "created":
      return Eye;
    case "moved":
      return ArrowRight;
    case "resolved":
      return CheckCircle2;
    case "blocked":
      return Lock;
    case "unblocked":
      return Unlock;
    case "whatsapp_received":
      return Smartphone;
    case "whatsapp_sent":
    default:
      return MessageCircle;
  }
}

function toneForType(type: SimulationActivityLog["type"]) {
  switch (type) {
    case "created":
      return "bg-blue-100 text-blue-700";
    case "moved":
      return "bg-blue-100 text-[#0033A0]";
    case "resolved":
    case "unblocked":
      return "bg-emerald-100 text-emerald-700";
    case "blocked":
      return "bg-red-100 text-red-700";
    case "whatsapp_received":
    case "whatsapp_sent":
    default:
      return "bg-emerald-100 text-emerald-700";
  }
}

export function ActivityLog({ compact }: { compact?: boolean }) {
  const { logs } = useSimulation();

  if (compact) {
    return (
      <div className="h-full overflow-y-auto space-y-2">
        {logs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--border-subtle)] px-3 py-4 text-center text-xs text-slate-500">
            Sin actividad reciente
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {logs.slice(0, 6).map((log) => {
              const Icon = iconForType(log.type);

              return (
                <motion.div
                  key={log.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex items-start gap-2 text-xs"
                >
                  <div className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded ${toneForType(log.type)}`}>
                    <Icon className="size-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-mono-jetbrains text-[10px] text-slate-500">
                      {formatBogotaTime(log.timestamp)}
                    </span>
                    <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">{log.message}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 text-[#0033A0]">
            <Activity className="size-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Actividad en Tiempo Real
            </h2>
            <p className="text-xs uppercase tracking-wider text-slate-500">Eventos emitidos por el SimulationContext</p>
          </div>
        </div>
        <span className="badge-compact rounded bg-[var(--bg-elevated)] font-mono-jetbrains text-[var(--text-secondary)]">
          {logs.length}/20
        </span>
      </div>

      <div className="h-[300px] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        <div className="h-full overflow-y-auto p-2">
          <AnimatePresence initial={false}>
            {logs.slice(0, 20).map((log) => {
              const Icon = iconForType(log.type);

              return (
                <motion.div
                  key={log.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="mb-2 rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded ${toneForType(log.type)}`}>
                      <Icon className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono-jetbrains text-xs text-slate-500">
                          {formatBogotaTime(log.timestamp)}
                        </span>
                        {log.phase ? (
                          <span className="badge-compact rounded bg-blue-100 text-[#0033A0]">
                            {phaseLabels[log.phase]}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{log.message}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
