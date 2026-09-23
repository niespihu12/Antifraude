"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  ClipboardCheck,
  Eye,
  MessageCircle,
  Scale,
  UserSearch,
} from "lucide-react";
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  phaseOrder,
  useSimulation,
  type ActivityLog,
  type FaseProcesoKey,
} from "@/context/simulation-context";
import { formatNumber } from "@/lib/utils";

type Orientation = "horizontal" | "vertical";
type PhaseIndex = 0 | 1 | 2 | 3 | 4;

type PhaseDefinition = {
  key: PhaseIndex;
  phaseKey: FaseProcesoKey;
  title: string;
  fullName: string;
  shortLabel: string;
  icon: typeof Eye;
  tone: string;
  borderTone: string;
  apps: string[];
  avgTime: string;
  tooltip: string;
};

const phases: PhaseDefinition[] = [
  {
    key: 0,
    phaseKey: "recepcion",
    title: "RECEPCIÓN",
    fullName: "Recepción de Alertas",
    shortLabel: "Monitor / VRM",
    icon: Eye,
    tone: "blue-500",
    borderTone: "border-blue-200",
    apps: ["Monitor", "VRM"],
    avgTime: "7 min",
    tooltip: "Recepción y normalización de alertas transaccionales desde Monitor y VRM.",
  },
  {
    key: 1,
    phaseKey: "identificacion",
    title: "IDENTIFICACIÓN",
    fullName: "Identificación del Cliente",
    shortLabel: "CRM Banco",
    icon: UserSearch,
    tone: "blue-500",
    borderTone: "border-blue-200",
    apps: ["CRM Banco"],
    avgTime: "8 min",
    tooltip: "Cruce de cliente, dispositivo, ubicación y comportamiento con CRM Banco.",
  },
  {
    key: 2,
    phaseKey: "comunicacion",
    title: "COMUNICACIÓN",
    fullName: "Comunicación con Cliente",
    shortLabel: "WhatsApp / Kari AI",
    icon: MessageCircle,
    tone: "emerald-500",
    borderTone: "border-emerald-200",
    apps: ["Kari AI", "WhatsApp"],
    avgTime: "10 min",
    tooltip: "Validación de respuesta del cliente por canal WhatsApp.",
  },
  {
    key: 3,
    phaseKey: "decision",
    title: "DECISIÓN",
    fullName: "Evaluación y Decisión",
    shortLabel: "Cardinal / PPE",
    icon: Scale,
    tone: "amber-500",
    borderTone: "border-amber-200",
    apps: ["Cardinal", "PPE"],
    avgTime: "9 min",
    tooltip: "Validación final del riesgo y definición de bloqueo, liberación o escalamiento.",
  },
  {
    key: 4,
    phaseKey: "registro",
    title: "REGISTRO",
    fullName: "Registro y Tipificación",
    shortLabel: "CRM / Bitácora",
    icon: ClipboardCheck,
    tone: "blue-500",
    borderTone: "border-blue-200",
    apps: ["CRM Banco", "PPE"],
    avgTime: "6 min",
    tooltip: "Registro de resultado, trazabilidad y tipificación final de la alerta.",
  },
];

const palette: Record<PhaseDefinition["tone"], string> = {
  "blue-500": "rgba(0, 51, 160, 0.9)",
  "emerald-500": "rgba(16, 185, 129, 0.9)",
  "amber-500": "rgba(245, 158, 11, 0.9)",
};

const phaseVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const pulseVariants: Variants = {
  animate: {
    opacity: [0.3, 1, 0.3],
    transition: {
      duration: 2.2,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

function useCountUp(target: number, duration = 500) {
  const [value, setValue] = useState(0);
  const previous = useRef(0);

  useEffect(() => {
    const start = previous.current;
    const delta = target - start;
    let frame = 0;
    let startedAt = 0;

    const tick = (timestamp: number) => {
      if (!startedAt) {
        startedAt = timestamp;
      }

      const progress = Math.min((timestamp - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + delta * eased));

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);
    previous.current = target;

    return () => window.cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

function useOrientation() {
  const [orientation, setOrientation] = useState<Orientation>("horizontal");

  useEffect(() => {
    const update = () => {
      setOrientation(window.innerWidth < 768 ? "vertical" : "horizontal");
    };

    update();
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  return orientation;
}

function phaseIndexOf(phase: FaseProcesoKey): PhaseIndex {
  return phaseOrder.indexOf(phase) as PhaseIndex;
}

function getPhasePoint(orientation: Orientation, index: PhaseIndex) {
  const desktop = [6, 30, 51, 72, 94];
  const mobile = [8, 28, 48, 68, 88];

  if (orientation === "horizontal") {
    return { x: desktop[index], y: 50 };
  }

  return { x: 50, y: mobile[index] };
}

function PhaseTooltip({
  phase,
  activeCount,
  latestAlertId,
  isMobile,
}: {
  phase: PhaseDefinition;
  activeCount: number;
  latestAlertId?: string;
  isMobile: boolean;
}) {
  return (
    <div
      className={
        isMobile
          ? "mt-4 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
          : "absolute left-1/2 top-full z-20 mt-3 w-72 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-3 shadow-md"
      }
    >
      <p className="text-sm font-semibold text-[var(--text-primary)]">{phase.fullName}</p>
      <div className="mt-2 space-y-1.5 text-sm text-[var(--text-secondary)]">
        <div>
          <span className="text-[var(--text-muted)]">Aplicativos: </span>
          {phase.apps.join(" · ")}
        </div>
        <div>
          <span className="text-[var(--text-muted)]">Tiempo promedio: </span>
          <span className="font-mono-jetbrains">{phase.avgTime}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)]">Alertas activas: </span>
          <span className="font-mono-jetbrains">{formatNumber(activeCount)}</span>
        </div>
        {latestAlertId ? (
          <div>
            <span className="text-[var(--text-muted)]">Última alerta: </span>
            <span className="font-mono-jetbrains text-[#0033A0]">{latestAlertId}</span>
          </div>
        ) : null}
        <div className="text-[var(--primary-300)]">{phase.tooltip}</div>
      </div>
    </div>
  );
}

function PhaseNode({
  phase,
  count,
  latestAlertId,
  activeTooltip,
  setActiveTooltip,
  isMobile,
  flashToken,
  isToBe,
}: {
  phase: PhaseDefinition;
  count: number;
  latestAlertId?: string;
  activeTooltip: PhaseIndex | null;
  setActiveTooltip: Dispatch<SetStateAction<PhaseIndex | null>>;
  isMobile: boolean;
  flashToken: number;
  isToBe: boolean;
}) {
  const Icon = phase.icon;
  const countValue = useCountUp(count, 400);
  const isActive = activeTooltip === phase.key;
  const glowClass = isToBe
    ? "shadow-md shadow-blue-100"
    : "shadow-sm";
  const iconWrap = {
    "blue-500": "rgba(0, 51, 160, 0.12)",
    "emerald-500": "rgba(16, 185, 129, 0.12)",
    "amber-500": "rgba(245, 158, 11, 0.12)",
  }[phase.tone];
  const iconColor = {
    "blue-500": "#0033A0",
    "emerald-500": "#059669",
    "amber-500": "#d97706",
  }[phase.tone];

  return (
    <motion.div
      variants={phaseVariants}
      className={`relative flex w-full flex-1 flex-col items-center justify-center rounded-lg border bg-white p-3 transition-colors duration-300 ${phase.borderTone} ${glowClass}`}
      animate={flashToken > 0 ? { scale: [1, 1.01, 1] } : { scale: 1 }}
      transition={{ duration: 0.15 }}
      onHoverStart={() => setActiveTooltip(phase.key)}
      onHoverEnd={() => setActiveTooltip((current) => (current === phase.key ? null : current))}
      onClick={() => setActiveTooltip(isActive ? null : phase.key)}
      onFocus={() => setActiveTooltip(phase.key)}
      onBlur={() => setActiveTooltip((current) => (current === phase.key ? null : current))}
      tabIndex={0}
      role="button"
      aria-label={`Fase ${phase.fullName}`}
    >
      <AnimatePresence>
        {flashToken > 0 ? (
          <motion.span
            key={`flash-${phase.phaseKey}-${flashToken}`}
            className="pointer-events-none absolute inset-0 rounded-lg bg-blue-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        ) : null}
      </AnimatePresence>

      <div className="flex size-12 items-center justify-center rounded-full" style={{ backgroundColor: iconWrap }}>
        <Icon className="size-7" style={{ color: iconColor }} />
      </div>
      <p className="mt-3 text-sm font-semibold uppercase tracking-wider" style={{ color: iconColor }}>
        {phase.title}
      </p>
      <p className="mt-1.5 font-mono-jetbrains text-2xl font-bold text-[var(--text-primary)]">{formatNumber(countValue)}</p>
      <p className="text-xs text-[var(--text-secondary)]">alertas activas</p>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <PhaseTooltip
              phase={phase}
              activeCount={count}
              latestAlertId={latestAlertId}
              isMobile={isMobile}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FlowDot({
  log,
  orientation,
  duration,
}: {
  log: ActivityLog;
  orientation: Orientation;
  duration: number;
}) {
  if (!log.fromPhase || !log.phase) {
    return null;
  }

  const fromIndex = phaseIndexOf(log.fromPhase);
  const toIndex = phaseIndexOf(log.phase);
  const from = getPhasePoint(orientation, fromIndex);
  const to = getPhasePoint(orientation, toIndex);
  const color = palette[phases[toIndex].tone];

  return (
    <motion.span
      className="pointer-events-none absolute rounded-full shadow-md shadow-blue-200"
      initial={{ left: `${from.x}%`, top: `${from.y}%`, opacity: 0.3 }}
      animate={{ left: `${to.x}%`, top: `${to.y}%`, opacity: [0.3, 1, 0.3] }}
      transition={{
        left: { duration, ease: "linear" },
        top: { duration, ease: "linear" },
        opacity: { duration: 2.2, repeat: Infinity, ease: "linear" },
      }}
      style={{ width: 10, height: 10, backgroundColor: color }}
    />
  );
}

export function AlertPipeline() {
  const orientation = useOrientation();
  const {
    alerts,
    alertsByPhase,
    logs,
    metrics,
    phaseFlashTokens,
    setSpeed,
    speed,
  } = useSimulation();
  const [activeTooltip, setActiveTooltip] = useState<PhaseIndex | null>(0);
  const visibleAlertIds = useMemo(() => new Set(alerts.map((alert) => alert.id)), [alerts]);
  const flowLogs = useMemo(
    () =>
      logs
        .filter(
          (log) =>
            log.type === "moved" &&
            Boolean(log.fromPhase) &&
            Boolean(log.phase) &&
            visibleAlertIds.has(log.alertId),
        )
        .slice(0, 8),
    [logs, visibleAlertIds],
  );
  const isToBe = speed >= 5;
  const cycleValue = isToBe ? "< 2 minutos" : "~40 minutos";
  const cycleTone = isToBe ? "text-emerald-700" : "text-red-600";
  const flowDuration = isToBe ? 1 : 4;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Eye className="size-4 text-[#0033A0]" />
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Pipeline de alertas</h2>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[var(--text-secondary)]">Proceso Actual (Manual)</span>
            <button
              type="button"
              aria-pressed={isToBe}
              onClick={() => setSpeed(isToBe ? 1 : 5)}
              className="relative h-7 w-14 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] transition-all duration-300 active:scale-95"
            >
              <span
                className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform duration-300 ${
                  isToBe ? "translate-x-7 bg-[#0033A0]" : "translate-x-0 bg-slate-300"
                }`}
              />
            </button>
            <span className="text-[var(--primary-300)]">Proceso Automatizado (To-Be)</span>
          </div>
        </div>

        <p className={`text-sm font-semibold ${cycleTone}`}>
          Tiempo ciclo promedio: <span className="font-mono-jetbrains">{cycleValue}</span>
        </p>
      </div>

      <div
        className={`relative mt-5 flex gap-3 ${
          orientation === "vertical" ? "flex-col" : "flex-col xl:flex-row xl:items-stretch"
        }`}
      >
        <div className="pointer-events-none absolute inset-0">
          {flowLogs.map((log) => (
            <FlowDot key={log.id} log={log} orientation={orientation} duration={flowDuration} />
          ))}
        </div>

        {phases.map((phase, index) => {
          const isMobile = orientation === "vertical";
          const phaseAlerts = alertsByPhase[phase.phaseKey];
          const latestAlertId = phaseAlerts[0]?.id;
          const flashToken = phaseFlashTokens[phase.phaseKey];

          return (
            <div key={phase.key} className="relative flex w-full flex-col">
              <PhaseNode
                phase={phase}
                count={metrics.alertsInPhase[phase.phaseKey]}
                latestAlertId={latestAlertId}
                activeTooltip={activeTooltip}
                setActiveTooltip={setActiveTooltip}
                isMobile={isMobile}
                flashToken={flashToken}
                isToBe={isToBe}
              />

              {index < phases.length - 1 && (
                <div
                  className={`relative mx-auto ${
                    isMobile ? "h-8 w-1" : "h-6 w-full xl:h-1 xl:w-auto xl:flex-1"
                  }`}
                >
                  <div className="absolute inset-0 rounded-full bg-slate-200" />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-[#0033A0]/15"
                    variants={pulseVariants}
                    animate="animate"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
