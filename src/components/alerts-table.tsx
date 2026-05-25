"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CreditCard, Monitor } from "lucide-react";

import {
  filterLabels,
  useSimulation,
  type SimulationAlert,
} from "@/context/simulation-context";
import { formatCOP, formatNumber } from "@/lib/utils";
import { EstadoAlerta, Franquicia } from "@/types";

const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
} as const;

const listItemVariants = {
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

function parseMinutes(timeLabel: string): number {
  const hoursMatch = timeLabel.match(/(\d+)h/);
  const minutesMatch = timeLabel.match(/(\d+)\s*min/);
  const hours = hoursMatch ? Number(hoursMatch[1]) * 60 : 0;
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;
  return hours + minutes;
}

function getStatusClasses(status: EstadoAlerta) {
  switch (status) {
    case EstadoAlerta.PENDIENTE_REVISION:
      return "bg-amber-100 text-amber-700";
    case EstadoAlerta.EN_VERIFICACION_CRM:
      return "bg-blue-100 text-blue-700";
    case EstadoAlerta.WHATSAPP_ENVIADO:
      return "bg-emerald-100 text-emerald-700";
    case EstadoAlerta.ESPERANDO_CLIENTE:
      return "bg-blue-100 text-[#0033A0]";
    case EstadoAlerta.BLOQUEO_PREVENTIVO:
      return "bg-red-100 text-red-700";
    case EstadoAlerta.DESBLOQUEADO:
      return "bg-emerald-100 text-emerald-700";
    case EstadoAlerta.BLOQUEO_DEFINITIVO:
      return "border border-red-200 bg-red-100 text-red-700";
    case EstadoAlerta.TIPIFICADO:
    default:
      return "bg-blue-100 text-[#0033A0]";
  }
}

function getFranchiseMeta(franquicia: Franquicia) {
  switch (franquicia) {
    case Franquicia.VISA:
      return {
        label: "Visa",
        icon: CreditCard,
        classes: "bg-blue-100 text-blue-700",
      };
    case Franquicia.MASTERCARD:
      return {
        label: "Mastercard",
        icon: CreditCard,
        classes: "bg-red-100 text-red-700",
      };
    case Franquicia.MONITOR:
    default:
      return {
        label: "Monitor",
        icon: Monitor,
        classes: "bg-[var(--bg-elevated)] text-[var(--text-secondary)]",
      };
  }
}

function FranchiseBadge({ franquicia }: { franquicia: Franquicia }) {
  const meta = getFranchiseMeta(franquicia);
  const Icon = meta.icon;

  return (
    <span className={`badge-compact inline-flex items-center gap-1 rounded ${meta.classes}`}>
      <Icon className="size-3.5" />
      {meta.label}
    </span>
  );
}

function StatusBadge({ status, flashToken }: { status: EstadoAlerta; flashToken: number }) {
  const pulse = flashToken % 2 === 1;

  return (
    <motion.span
      layout
      animate={pulse ? { scale: [1, 1.01, 1] } : { scale: 1 }}
      transition={{ duration: 0.15 }}
      className={`badge-compact inline-flex items-center gap-1 rounded ${getStatusClasses(status)}`}
    >
      {status}
    </motion.span>
  );
}

function AlertRow({
  alert,
}: {
  alert: SimulationAlert;
}) {
  const ageMinutes = parseMinutes(alert.tiempo);
  const flash =
    Date.now() - alert.createdAtMs < 1500 ||
    Date.now() - alert.phaseChangedAtMs < 1500;

  return (
    <motion.div
      layout
      variants={listItemVariants}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      data-alert-id={alert.id}
      className={`grid grid-cols-[140px_120px_160px_140px_180px_160px_100px_120px] items-center border-b border-[var(--border-subtle)] px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] ${
        flash ? "bg-blue-50" : "bg-white"
      } ${ageMinutes > 30 ? "opacity-60" : "opacity-100"}`}
    >
      <div className="font-mono-jetbrains text-[var(--text-primary)]">{alert.id}</div>
      <div>
        <FranchiseBadge franquicia={alert.franquicia} />
      </div>
      <div className="font-mono-jetbrains text-[var(--text-secondary)]">{alert.tarjeta}</div>
      <div className="font-mono-jetbrains text-[var(--text-primary)]">{formatCOP(alert.monto)}</div>
      <div className="font-medium text-[var(--text-primary)]">{alert.cliente}</div>
      <div>
        <StatusBadge status={alert.estado} flashToken={alert.flashToken} />
      </div>
      <div className="font-mono-jetbrains text-[var(--text-secondary)]">{alert.tiempo}</div>
      <div className="text-[var(--text-muted)]">{alert.area}</div>
    </motion.div>
  );
}

function AlertCard({
  alert,
}: {
  alert: SimulationAlert;
}) {
  const ageMinutes = parseMinutes(alert.tiempo);
  const flash =
    Date.now() - alert.createdAtMs < 1500 ||
    Date.now() - alert.phaseChangedAtMs < 1500;

  return (
    <motion.article
      layout
      variants={listItemVariants}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      data-alert-id={alert.id}
      className={`rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 text-sm text-[var(--text-secondary)] ${
        flash ? "bg-blue-50" : "bg-white"
      } ${ageMinutes > 30 ? "opacity-60" : "opacity-100"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="font-mono-jetbrains text-[var(--text-primary)]">{alert.id}</div>
        <StatusBadge status={alert.estado} flashToken={alert.flashToken} />
      </div>

      <div className="mt-3 grid gap-2 text-xs text-[var(--text-secondary)]">
        <div>
          <span className="text-[var(--text-muted)]">Franquicia: </span>
          <FranchiseBadge franquicia={alert.franquicia} />
        </div>
        <div>
          <span className="text-[var(--text-muted)]">Tarjeta: </span>
          <span className="font-mono-jetbrains text-[var(--text-secondary)]">{alert.tarjeta}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)]">Monto: </span>
          <span className="font-mono-jetbrains text-[var(--text-primary)]">{formatCOP(alert.monto)}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)]">Cliente: </span>
          <span className="text-[var(--text-primary)]">{alert.cliente}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)]">Tiempo: </span>
          <span className="font-mono-jetbrains text-[var(--text-secondary)]">{alert.tiempo}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)]">Área: </span>
          <span className="text-[var(--text-secondary)]">{alert.area}</span>
        </div>
      </div>
    </motion.article>
  );
}

export function AlertsTable() {
  const { activeFilter, alerts, allAlertCount } = useSimulation();

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Monitor className="size-4 text-[#0033A0]" />
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Alertas del contexto
            </h2>
          </div>
          <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
            Filtro activo:{" "}
            <span className="font-mono-jetbrains text-[#0033A0]">
              {filterLabels[activeFilter]}
            </span>
          </p>
        </div>
        <span className="badge-compact rounded bg-[var(--bg-elevated)] font-mono-jetbrains text-[var(--text-secondary)]">
          {alerts.length}/{allAlertCount}
        </span>
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-[var(--border-subtle)] lg:block">
        <div className="grid grid-cols-[140px_120px_160px_140px_180px_160px_100px_120px] border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          <div>Alerta ID</div>
          <div>Franquicia</div>
          <div>Tarjeta</div>
          <div>Monto</div>
          <div>Cliente</div>
          <div>Estado</div>
          <div>Tiempo</div>
          <div>Área</div>
        </div>

        <motion.div variants={listContainerVariants} initial="hidden" animate="visible">
          <AnimatePresence mode="popLayout">
            {alerts.map((alert) => (
              <AlertRow key={alert.id} alert={alert} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="grid gap-3 lg:hidden">
        <motion.div className="grid gap-3" variants={listContainerVariants} initial="hidden" animate="visible">
          <AnimatePresence mode="popLayout">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
        <p>
          Mostrando <span className="font-mono-jetbrains">{formatNumber(alerts.length)}</span> de{" "}
          <span className="font-mono-jetbrains">{formatNumber(allAlertCount)}</span> alertas vivas
        </p>
        <span className="badge-compact rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
          Contexto: <span className="font-mono-jetbrains">{formatNumber(allAlertCount)}</span>
        </span>
      </div>
    </section>
  );
}
