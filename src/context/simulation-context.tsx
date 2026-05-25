"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import { mockAlerts } from "@/lib/mock-data";
import { EstadoAlerta, Franquicia, type Alerta, type FaseProceso } from "@/types";

export type FaseProcesoKey = keyof FaseProceso;
export type SimulationSpeed = 1 | 2 | 5 | 10;
export type ActiveFilter =
  | "all"
  | "visa"
  | "mastercard"
  | "monitor"
  | "urgent"
  | "fraud";

export type ActivityLogType =
  | "created"
  | "moved"
  | "resolved"
  | "blocked"
  | "unblocked"
  | "whatsapp_sent"
  | "whatsapp_received";

export interface ActivityLog {
  id: string;
  timestamp: Date;
  type: ActivityLogType;
  alertId: string;
  message: string;
  phase?: FaseProcesoKey;
  fromPhase?: FaseProcesoKey;
}

export type SimulationAlert = Alerta & {
  fase: FaseProcesoKey;
  createdAtMs: number;
  phaseChangedAtMs: number;
  flashToken: number;
  isFraud: boolean;
  isUrgent: boolean;
};

export interface SimulationMetrics {
  totalAlerts: number;
  alertsInPhase: Record<FaseProcesoKey, number>;
  avgResponseTime: number;
  processedToday: number;
  fraudBlocked: number;
  falsePositives: number;
}

interface SimulationCoreState {
  tick: number;
  lastTickAtMs: number;
  isRunning: boolean;
  speed: SimulationSpeed;
  allAlerts: SimulationAlert[];
  logs: ActivityLog[];
  activeFilter: ActiveFilter;
  phaseFlashTokens: Record<FaseProcesoKey, number>;
  nextSequence: number;
}

interface SimulationContextValue {
  tick: number;
  lastTickAtMs: number;
  isRunning: boolean;
  speed: SimulationSpeed;
  alerts: SimulationAlert[];
  allAlerts: SimulationAlert[];
  allAlertCount: number;
  alertsByPhase: Record<FaseProcesoKey, SimulationAlert[]>;
  metrics: SimulationMetrics;
  logs: ActivityLog[];
  activeFilter: ActiveFilter;
  phaseFlashTokens: Record<FaseProcesoKey, number>;
  setSpeed: (speed: SimulationSpeed) => void;
  setActiveFilter: (filter: ActiveFilter) => void;
  setIsRunning: Dispatch<SetStateAction<boolean>>;
  startSimulation: () => void;
  pauseSimulation: () => void;
  stopSimulation: () => void;
  toggleRunning: () => void;
}

export const phaseOrder = [
  "recepcion",
  "identificacion",
  "comunicacion",
  "decision",
  "registro",
] as const satisfies ReadonlyArray<FaseProcesoKey>;

export const phaseLabels: Record<FaseProcesoKey, string> = {
  recepcion: "Recepción",
  identificacion: "Identificación",
  comunicacion: "Comunicación",
  decision: "Decisión",
  registro: "Registro",
};

export const filterLabels: Record<ActiveFilter, string> = {
  all: "Todas",
  visa: "Visa",
  mastercard: "Mastercard",
  monitor: "Monitor",
  urgent: "Urgentes",
  fraud: "Fraudulentas",
};

const BASE_NOW = new Date("2026-05-25T15:00:00-05:00").getTime();
const MAX_ALERTS = 50;
const MAX_LOGS = 20;
const SPEED_INTERVALS: Record<SimulationSpeed, number> = {
  1: 3000,
  2: 1500,
  5: 600,
  10: 300,
};

const emptyPhaseRecord = <T,>(factory: () => T): Record<FaseProcesoKey, T> => ({
  recepcion: factory(),
  identificacion: factory(),
  comunicacion: factory(),
  decision: factory(),
  registro: factory(),
});

const clients = [
  "Juan Sebastián Rojas",
  "Laura Sofía Gómez",
  "Andrés Felipe Cárdenas",
  "Catalina María Moreno",
  "Daniel Esteban Pérez",
  "Paula Andrea Díaz",
  "Miguel Ángel Torres",
  "Valentina Salazar",
  "Sebastián Herrera",
  "Daniela Castro",
  "Carlos Andrés Méndez",
  "Mariana Rincón",
  "Felipe Camacho",
  "Natalia Giraldo",
];

function phaseFromStatus(status: EstadoAlerta): FaseProcesoKey {
  switch (status) {
    case EstadoAlerta.EN_VERIFICACION_CRM:
      return "identificacion";
    case EstadoAlerta.WHATSAPP_ENVIADO:
    case EstadoAlerta.ESPERANDO_CLIENTE:
      return "comunicacion";
    case EstadoAlerta.BLOQUEO_PREVENTIVO:
    case EstadoAlerta.DESBLOQUEADO:
      return "decision";
    case EstadoAlerta.BLOQUEO_DEFINITIVO:
    case EstadoAlerta.TIPIFICADO:
      return "registro";
    case EstadoAlerta.PENDIENTE_REVISION:
    default:
      return "recepcion";
  }
}

function formatElapsed(createdAtMs: number, now: number): string {
  const minutes = Math.max(0, Math.floor((now - createdAtMs) / 60_000));

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours}h ${rest.toString().padStart(2, "0")}m`;
}

function parseMinutes(timeLabel: string): number {
  const hoursMatch = timeLabel.match(/(\d+)h/);
  const minutesMatch = timeLabel.match(/(\d+)\s*min|(\d+)m/);
  const hours = hoursMatch ? Number(hoursMatch[1]) * 60 : 0;
  const minutes = minutesMatch ? Number(minutesMatch[1] ?? minutesMatch[2]) : 0;
  return hours + minutes;
}

function normalizeInitialAlert(alert: Alerta, index: number): SimulationAlert {
  const fase = phaseFromStatus(alert.estado);
  const createdAtMs = Date.parse(alert.fecha) || BASE_NOW - index * 45_000;
  const isFraud =
    alert.estado === EstadoAlerta.BLOQUEO_PREVENTIVO ||
    alert.estado === EstadoAlerta.BLOQUEO_DEFINITIVO ||
    alert.monto >= 5_000_000;

  return {
    ...alert,
    fase,
    createdAtMs,
    phaseChangedAtMs: createdAtMs + index * 12_000,
    flashToken: 0,
    isFraud,
    isUrgent: parseMinutes(alert.tiempo) > 30 || isFraud,
  };
}

function initialLogs(alerts: SimulationAlert[]): ActivityLog[] {
  return alerts.slice(0, 8).map((alert, index) => ({
    id: `seed-log-${alert.id}`,
    timestamp: new Date(BASE_NOW - index * 12_000),
    type: alert.fase === "recepcion" ? "created" : "moved",
    alertId: alert.id,
    phase: alert.fase,
    message:
      alert.fase === "recepcion"
        ? `Alerta ${alert.id} generada en ${alert.area}`
        : `Alerta ${alert.id} sincronizada en ${phaseLabels[alert.fase]}`,
  }));
}

function nextSequenceFromAlerts(alerts: Alerta[]) {
  const max = alerts.reduce((currentMax, alert) => {
    const match = alert.id.match(/(\d+)$/);
    return Math.max(currentMax, match ? Number(match[1]) : 0);
  }, 0);

  return max + 1;
}

function createAlert(sequence: number, now: number): SimulationAlert {
  const franchiseRoll = Math.random();
  const franquicia =
    franchiseRoll < 0.38
      ? Franquicia.MONITOR
      : franchiseRoll < 0.68
        ? Franquicia.VISA
        : Franquicia.MASTERCARD;
  const id = `ALT-2026-${sequence.toString().padStart(5, "0")}`;
  const amount = Math.round((180_000 + Math.random() * 14_500_000) / 10_000) * 10_000;
  const isFraud = Math.random() < 0.18 || amount > 7_000_000;
  const client = clients[Math.floor(Math.random() * clients.length)];
  const cardEnd = Math.floor(1000 + Math.random() * 9000);
  const area =
    franquicia === Franquicia.MONITOR
      ? "Monitor"
      : franquicia === Franquicia.VISA
        ? "BRM"
        : "EMS/MS";

  return {
    id,
    franquicia,
    tarjeta: `**** **** **** ${cardEnd}`,
    monto: amount,
    estado: EstadoAlerta.PENDIENTE_REVISION,
    tiempo: "0 min",
    cliente: client,
    area,
    fecha: new Date(now).toISOString(),
    fase: "recepcion",
    createdAtMs: now,
    phaseChangedAtMs: now,
    flashToken: 1,
    isFraud,
    isUrgent: isFraud || amount > 5_000_000,
  };
}

function statusForPhase(phase: FaseProcesoKey, alert: SimulationAlert): EstadoAlerta {
  switch (phase) {
    case "identificacion":
      return EstadoAlerta.EN_VERIFICACION_CRM;
    case "comunicacion":
      return EstadoAlerta.WHATSAPP_ENVIADO;
    case "decision":
      return alert.isFraud
        ? EstadoAlerta.BLOQUEO_PREVENTIVO
        : EstadoAlerta.DESBLOQUEADO;
    case "registro":
      return alert.isFraud
        ? EstadoAlerta.BLOQUEO_DEFINITIVO
        : EstadoAlerta.TIPIFICADO;
    case "recepcion":
    default:
      return EstadoAlerta.PENDIENTE_REVISION;
  }
}

function buildMoveLogs(
  alert: SimulationAlert,
  fromPhase: FaseProcesoKey,
  toPhase: FaseProcesoKey,
  now: number,
): ActivityLog[] {
  const baseLog: ActivityLog = {
    id: `${alert.id}-${toPhase}-${now}`,
    timestamp: new Date(now),
    type: "moved",
    alertId: alert.id,
    fromPhase,
    phase: toPhase,
    message: `Alerta ${alert.id} avanzó de ${phaseLabels[fromPhase]} a ${phaseLabels[toPhase]}`,
  };

  if (toPhase === "comunicacion") {
    return [
      {
        id: `${alert.id}-wa-sent-${now}`,
        timestamp: new Date(now + 1),
        type: "whatsapp_sent",
        alertId: alert.id,
        fromPhase,
        phase: toPhase,
        message: `WhatsApp HSM enviado a ${alert.cliente}`,
      },
      baseLog,
    ];
  }

  if (toPhase === "decision") {
    return [
      {
        id: `${alert.id}-wa-received-${now}`,
        timestamp: new Date(now + 1),
        type: "whatsapp_received",
        alertId: alert.id,
        fromPhase,
        phase: toPhase,
        message: `Respuesta del cliente recibida para ${alert.id}`,
      },
      baseLog,
    ];
  }

  if (toPhase === "registro") {
    return [
      {
        id: `${alert.id}-closed-${now}`,
        timestamp: new Date(now + 1),
        type: alert.isFraud ? "blocked" : "resolved",
        alertId: alert.id,
        fromPhase,
        phase: toPhase,
        message: alert.isFraud
          ? `Fraude bloqueado y tipificado para ${alert.id}`
          : `Alerta ${alert.id} resuelta sin fricción`,
      },
      baseLog,
    ];
  }

  return [baseLog];
}

function limitAlerts(alerts: SimulationAlert[]): SimulationAlert[] {
  if (alerts.length <= MAX_ALERTS) {
    return alerts;
  }

  const next = [...alerts];

  while (next.length > MAX_ALERTS) {
    let archiveIndex = -1;
    let oldestRegistro = Number.POSITIVE_INFINITY;

    next.forEach((alert, index) => {
      if (alert.fase === "registro" && alert.phaseChangedAtMs < oldestRegistro) {
        archiveIndex = index;
        oldestRegistro = alert.phaseChangedAtMs;
      }
    });

    if (archiveIndex < 0) {
      archiveIndex = next.reduce(
        (oldestIndex, alert, index) =>
          alert.createdAtMs < next[oldestIndex].createdAtMs ? index : oldestIndex,
        0,
      );
    }

    next.splice(archiveIndex, 1);
  }

  return next;
}

function runSimulationTick(state: SimulationCoreState): SimulationCoreState {
  const now = Date.now();
  const progressProbability =
    state.speed === 10 ? 0.75 : state.speed === 5 ? 0.6 : state.speed === 2 ? 0.3 : 0.15;
  const generatedLogs: ActivityLog[] = [];
  const phaseFlashTokens = { ...state.phaseFlashTokens };
  let nextSequence = state.nextSequence;
  let generatedAlertId: string | null = null;
  let alerts = state.allAlerts.map((alert) => ({
    ...alert,
    tiempo: formatElapsed(alert.createdAtMs, now),
  }));

  if (Math.random() < 0.3) {
    const alert = createAlert(nextSequence, now);
    nextSequence += 1;
    generatedAlertId = alert.id;
    alerts = [alert, ...alerts];
    phaseFlashTokens.recepcion += 1;
    generatedLogs.push({
      id: `${alert.id}-created-${now}`,
      timestamp: new Date(now),
      type: "created",
      alertId: alert.id,
      phase: "recepcion",
      message: `Alerta ${alert.id} generada en ${alert.area}`,
    });
  }

  alerts = alerts.map((alert) => {
    if (alert.id === generatedAlertId || alert.fase === "registro") {
      return alert;
    }

    if (Math.random() >= progressProbability) {
      return alert;
    }

    const currentIndex = phaseOrder.indexOf(alert.fase);
    const nextPhase = phaseOrder[currentIndex + 1];

    if (!nextPhase) {
      return alert;
    }

    phaseFlashTokens[nextPhase] += 1;
    generatedLogs.push(...buildMoveLogs(alert, alert.fase, nextPhase, now));

    return {
      ...alert,
      fase: nextPhase,
      estado: statusForPhase(nextPhase, alert),
      tiempo: formatElapsed(alert.createdAtMs, now),
      phaseChangedAtMs: now,
      flashToken: alert.flashToken + 1,
    };
  });

  return {
    ...state,
    tick: state.tick + 1,
    lastTickAtMs: now,
    allAlerts: limitAlerts(alerts),
    logs: [...generatedLogs, ...state.logs].slice(0, MAX_LOGS),
    phaseFlashTokens,
    nextSequence,
  };
}

function matchesFilter(alert: SimulationAlert, filter: ActiveFilter): boolean {
  switch (filter) {
    case "visa":
      return alert.franquicia === Franquicia.VISA;
    case "mastercard":
      return alert.franquicia === Franquicia.MASTERCARD;
    case "monitor":
      return alert.franquicia === Franquicia.MONITOR;
    case "urgent":
      return alert.isUrgent || parseMinutes(alert.tiempo) > 30;
    case "fraud":
      return (
        alert.isFraud ||
        alert.estado === EstadoAlerta.BLOQUEO_PREVENTIVO ||
        alert.estado === EstadoAlerta.BLOQUEO_DEFINITIVO
      );
    case "all":
    default:
      return true;
  }
}

function calculateMetrics(
  alerts: SimulationAlert[],
  speed: SimulationSpeed,
  tick: number,
): SimulationMetrics {
  const alertsInPhase = emptyPhaseRecord(() => 0);

  for (const alert of alerts) {
    alertsInPhase[alert.fase] += 1;
  }

  const processedToday =
    alertsInPhase.identificacion +
    alertsInPhase.comunicacion +
    alertsInPhase.decision +
    alertsInPhase.registro;
  const fraudBlocked = alerts.filter(
    (alert) => alert.isFraud && (alert.fase === "decision" || alert.fase === "registro"),
  ).length;
  const jitter = (tick % 5) - 2;
  const isToBe = speed >= 5;

  return {
    totalAlerts: alerts.length,
    alertsInPhase,
    avgResponseTime: isToBe ? 90 + jitter * 2 : 40 + jitter,
    processedToday,
    fraudBlocked,
    falsePositives: isToBe ? 45 + jitter : 75 + jitter,
  };
}

const initialAlerts = mockAlerts.slice(0, 20).map(normalizeInitialAlert);

const initialState: SimulationCoreState = {
  tick: 0,
  lastTickAtMs: BASE_NOW,
  isRunning: true,
  speed: 1,
  allAlerts: initialAlerts,
  logs: initialLogs(initialAlerts),
  activeFilter: "all",
  phaseFlashTokens: emptyPhaseRecord(() => 0),
  nextSequence: nextSequenceFromAlerts(mockAlerts),
};

const SimulationContext = createContext<SimulationContextValue | null>(null);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SimulationCoreState>(initialState);

  useEffect(() => {
    if (!state.isRunning) {
      return;
    }

    const delay = SPEED_INTERVALS[state.speed];
    const interval = window.setInterval(() => {
      setState((current) => runSimulationTick(current));
    }, delay);

    return () => window.clearInterval(interval);
  }, [state.isRunning, state.speed]);

  const setSpeed = useCallback((speed: SimulationSpeed) => {
    setState((current) => ({ ...current, speed }));
  }, []);

  const setActiveFilter = useCallback((activeFilter: ActiveFilter) => {
    setState((current) => ({ ...current, activeFilter }));
  }, []);

  const setIsRunning = useCallback<Dispatch<SetStateAction<boolean>>>((value) => {
    setState((current) => ({
      ...current,
      isRunning: typeof value === "function" ? value(current.isRunning) : value,
    }));
  }, []);

  const startSimulation = useCallback(() => {
    setState((current) => ({ ...current, isRunning: true }));
  }, []);

  const pauseSimulation = useCallback(() => {
    setState((current) => ({ ...current, isRunning: false }));
  }, []);

  const stopSimulation = useCallback(() => {
    setState((current) => ({
      ...current,
      tick: 0,
      isRunning: false,
      lastTickAtMs: Date.now(),
    }));
  }, []);

  const toggleRunning = useCallback(() => {
    setState((current) => ({ ...current, isRunning: !current.isRunning }));
  }, []);

  const alerts = useMemo(
    () => state.allAlerts.filter((alert) => matchesFilter(alert, state.activeFilter)),
    [state.allAlerts, state.activeFilter],
  );

  const alertsByPhase = useMemo(() => {
    const grouped = emptyPhaseRecord<SimulationAlert[]>(() => []);

    for (const alert of alerts) {
      grouped[alert.fase].push(alert);
    }

    return grouped;
  }, [alerts]);

  const metrics = useMemo(
    () => calculateMetrics(alerts, state.speed, state.tick),
    [alerts, state.speed, state.tick],
  );

  const value = useMemo<SimulationContextValue>(
    () => ({
      tick: state.tick,
      lastTickAtMs: state.lastTickAtMs,
      isRunning: state.isRunning,
      speed: state.speed,
      alerts,
      allAlerts: state.allAlerts,
      allAlertCount: state.allAlerts.length,
      alertsByPhase,
      metrics,
      logs: state.logs,
      activeFilter: state.activeFilter,
      phaseFlashTokens: state.phaseFlashTokens,
      setSpeed,
      setActiveFilter,
      setIsRunning,
      startSimulation,
      pauseSimulation,
      stopSimulation,
      toggleRunning,
    }),
    [
      state.tick,
      state.lastTickAtMs,
      state.isRunning,
      state.speed,
      state.allAlerts,
      state.logs,
      state.activeFilter,
      state.phaseFlashTokens,
      alerts,
      alertsByPhase,
      metrics,
      setSpeed,
      setActiveFilter,
      setIsRunning,
      startSimulation,
      pauseSimulation,
      stopSimulation,
      toggleRunning,
    ],
  );

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);

  if (!context) {
    throw new Error("useSimulation must be used within SimulationProvider");
  }

  return context;
}
