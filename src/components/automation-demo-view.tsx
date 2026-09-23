"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Cpu,
  Database,
  Eye,
  Loader2,
  MessageCircle,
  Network,
  Server,
  Shield,
  Sparkles,
  Unlock,
  Wifi,
  Zap,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_DURATION = 22000;

interface PhaseDef {
  id: string;
  icon: typeof Eye;
  label: string;
  shortLabel: string;
  desc: string;
  startMs: number;
  endMs: number;
  color: "blue" | "emerald" | "amber";
  appLabel: string;
}

const PHASES: PhaseDef[] = [
  { id: "deteccion", icon: Eye, label: "Detección", shortLabel: "Detección", desc: "Motor de fraude detecta transacción sospechosa", startMs: 0, endMs: 2500, color: "blue", appLabel: "Motor de Fraude" },
  { id: "orquestador", icon: Cpu, label: "Orquestador", shortLabel: "Orquestador", desc: "Recibe alerta y prioriza automáticamente", startMs: 2500, endMs: 5500, color: "blue", appLabel: "Orquestador Central" },
  { id: "enriquecimiento", icon: Database, label: "Enriquecimiento", shortLabel: "Enriquece", desc: "Consulta CRM, obtiene celular, valida datos", startMs: 5500, endMs: 9500, color: "blue", appLabel: "CRM Banco" },
  { id: "whatsapp", icon: MessageCircle, label: "WhatsApp HSM", shortLabel: "WhatsApp", desc: "Envía mensaje automático vía Kari AI", startMs: 9500, endMs: 12000, color: "emerald", appLabel: "Kari AI" },
  { id: "espera", icon: Clock, label: "Espera Cliente", shortLabel: "Espera", desc: "Bot espera respuesta...", startMs: 12000, endMs: 16000, color: "amber", appLabel: "Bot Kari" },
  { id: "desbloqueo", icon: Unlock, label: "Desbloqueo", shortLabel: "Desbloqueo", desc: "PPE desbloquea tarjeta vía API", startMs: 16000, endMs: 19000, color: "emerald", appLabel: "PPE" },
  { id: "registro", icon: ClipboardCheck, label: "Registro", shortLabel: "Registro", desc: "Tipificación automática en todos los sistemas", startMs: 19000, endMs: 22000, color: "blue", appLabel: "Monitor/VRM/EMS" },
];

interface LogLine {
  id: number;
  text: string;
  timeMs: number;
  type: "info" | "success" | "warning" | "action";
}

const SYSTEM_LOGS: LogLine[] = [
  { id: 1, text: "Motor de fraude: transacción sospechosa detectada en Visa ****1234", timeMs: 300, type: "warning" },
  { id: 2, text: "Motor de fraude: normalizando datos de transacción", timeMs: 1000, type: "info" },
  { id: 3, text: "Orquestador: alerta ALT-2026-08421 recibida, prioridad ALTA", timeMs: 2800, type: "info" },
  { id: 4, text: "Orquestador: iniciando flujo automático de validación", timeMs: 3700, type: "action" },
  { id: 5, text: "CRM Banco: consultando datos de cliente 'María González'", timeMs: 5800, type: "info" },
  { id: 6, text: "CRM Banco: celular +57 310 555 9876 validado", timeMs: 7000, type: "success" },
  { id: 7, text: "Enriquecimiento: historial de transacciones consistente", timeMs: 8200, type: "success" },
  { id: 8, text: "Kari AI: enviando WhatsApp HSM template 'alerta_transaccional'", timeMs: 9700, type: "action" },
  { id: 9, text: "WhatsApp Business API: mensaje entregado exitosamente", timeMs: 10700, type: "success" },
  { id: 10, text: "Bot Kari: esperando respuesta del cliente (timeout 120s)", timeMs: 12200, type: "info" },
  { id: 11, text: "WhatsApp: cliente escribiendo...", timeMs: 13700, type: "info" },
  { id: 12, text: "Kari AI: respuesta recibida — cliente confirma 'Sí fui yo'", timeMs: 15000, type: "success" },
  { id: 13, text: "PPE: ejecutando desbloqueo de tarjeta ****1234 vía API REST", timeMs: 16200, type: "action" },
  { id: 14, text: "PPE: HTTP 200 OK — desbloqueo exitoso confirmado", timeMs: 17500, type: "success" },
  { id: 15, text: "Orquestador: registrando tipificación en Monitor, VRM, EMS/MS", timeMs: 19200, type: "info" },
  { id: 16, text: "Sistemas: tipificación 'Falso Positivo' sincronizada", timeMs: 20500, type: "success" },
  { id: 17, text: "Proceso completado: alerta resuelta sin fricción", timeMs: 21500, type: "success" },
];

interface WAMsg {
  sender: "bank" | "client" | "system";
  text: string;
  timeMs: number;
}

const WA_CHAT: WAMsg[] = [
  { sender: "bank", text: "🔔 Centro de Operaciones Antifraude\n\nHola María González, detectamos una actividad inusual en tu tarjeta Visa terminada en 1234.", timeMs: 10000 },
  { sender: "bank", text: "📍 Comercio: Apple Store\n💰 Monto: $2.450.000 COP\n🌎 Ubicación: Nueva York, USA\n📅 Fecha: Hoy, 14:23", timeMs: 10400 },
  { sender: "bank", text: "¿Reconoces esta transacción?\nResponde SÍ si fuiste tú o NO si no la reconoces.", timeMs: 10800 },
  { sender: "client", text: "Sí fui yo", timeMs: 15200 },
  { sender: "bank", text: "✅ Confirmación recibida. Tu tarjeta ha sido desbloqueada y ya puedes continuar con tus compras.\n\nGracias por ayudarnos a proteger tu cuenta, María. 🛡️", timeMs: 18000 },
  { sender: "system", text: "🏷️ Alerta tipificada como Falso Positivo\n⏱️ Tiempo total de resolución: 9 segundos", timeMs: 21000 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getActivePhaseIdx(elapsed: number): number {
  for (let i = PHASES.length - 1; i >= 0; i--) {
    if (elapsed >= PHASES[i].startMs && elapsed < PHASES[i].endMs && elapsed < BASE_DURATION) return i;
  }
  if (elapsed >= BASE_DURATION) return PHASES.length - 1;
  return -1;
}

function phaseBorder(color: PhaseDef["color"]): string {
  switch (color) {
    case "emerald": return "border-emerald-300 ring-emerald-200";
    case "amber": return "border-amber-300 ring-amber-200";
    default: return "border-blue-300 ring-blue-200";
  }
}

// ---------------------------------------------------------------------------
// Typing dots
// ---------------------------------------------------------------------------

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 0.15, 0.3].map((delay, i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-slate-400"
          style={{ animation: `pulse-soft 1.4s ${delay}s infinite` }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Phase card
// ---------------------------------------------------------------------------

function PhaseNode({
  phase,
  index,
  activeIdx,
  elapsed,
  completed,
}: {
  phase: PhaseDef;
  index: number;
  activeIdx: number;
  elapsed: number;
  completed: boolean;
}) {
  const Icon = phase.icon;
  const isActive = index === activeIdx;
  const isDone = elapsed >= phase.endMs || (completed && index === PHASES.length - 1);
  const phaseElapsed = isActive ? Math.max(0, elapsed - phase.startMs) : 0;
  const phaseDuration = phase.endMs - phase.startMs;
  const phaseProgress = Math.min((phaseElapsed / phaseDuration) * 100, 100);

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      {/* Node circle */}
      <motion.div
        animate={
          isActive && !completed
            ? { scale: [1, 1.08, 1], boxShadow: ["0 0 0 0 rgba(0,51,160,0.3)", "0 0 0 8px rgba(0,51,160,0)", "0 0 0 0 rgba(0,51,160,0)"] }
            : {}
        }
        transition={isActive ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : {}}
        className={`relative flex size-11 items-center justify-center rounded-xl border-2 transition-all duration-500 ${
          isDone
            ? "border-emerald-300 bg-emerald-50 text-emerald-600"
            : isActive
              ? `border-blue-300 bg-blue-50 text-[#0033A0] ${phaseBorder(phase.color)}`
              : "border-slate-200 bg-slate-50 text-slate-400"
        }`}
      >
        {isDone ? (
          <CheckCircle2 className="size-5" />
        ) : isActive ? (
          <Icon className="size-5" />
        ) : (
          <Icon className="size-5" />
        )}

        {/* Progress ring during active */}
        {isActive && !isDone && (
          <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="20" fill="none" stroke="currentColor" strokeWidth="2" opacity={0.15} />
            <motion.circle
              cx="22" cy="22" r="20" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 20}
              initial={false}
              animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - phaseProgress / 100) }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </svg>
        )}
      </motion.div>

      {/* Label */}
      <span className={`text-[11px] font-semibold transition-colors duration-500 text-center leading-tight ${
        isDone ? "text-emerald-700" : isActive ? "text-[#0033A0]" : "text-slate-400"
      }`}>
        {phase.shortLabel}
      </span>

      {/* App label below */}
      {isActive && !isDone && (
        <motion.span
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] text-slate-500 text-center leading-tight"
        >
          {phase.appLabel}
        </motion.span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Animated connector
// ---------------------------------------------------------------------------

function Connector({ active }: { active: boolean }) {
  return (
    <div className="relative flex h-0.5 w-10 items-center self-start mt-5 shrink-0">
      <div className={`h-full w-full rounded-full transition-colors duration-500 ${
        active ? "bg-[#0033A0]" : "bg-slate-200"
      }`}>
        {active && (
          <motion.div
            className="h-full w-6 rounded-full bg-[#1e4db3]"
            animate={{ x: [0, 40] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AutomationDemoView() {
  const reducedMotion = useReducedMotion();
  const [demoRunning, setDemoRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const accumulatedRef = useRef(0);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const completed = elapsed >= BASE_DURATION;

  useEffect(() => {
    if (!demoRunning) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const tick = (now: number) => {
      const delta = now - startRef.current;
      const next = Math.min(accumulatedRef.current + delta, BASE_DURATION + 100);
      accumulatedRef.current = next;
      startRef.current = now;
      setElapsed(next);

      if (next >= BASE_DURATION) {
        setDemoRunning(false);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    startRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [demoRunning]);

  const startDemo = useCallback(() => {
    if (completed || elapsed === 0) {
      accumulatedRef.current = 0;
      setElapsed(0);
    }
    setDemoRunning(true);
  }, [completed, elapsed]);

  const resetDemo = useCallback(() => {
    setDemoRunning(false);
    accumulatedRef.current = 0;
    setElapsed(0);
  }, []);

  const activePhase = getActivePhaseIdx(elapsed);
  const progress = Math.min((elapsed / BASE_DURATION) * 100, 100);
  const visibleLogs = SYSTEM_LOGS.filter((l) => elapsed >= l.timeMs);
  const visibleWA = WA_CHAT.filter((m) => elapsed >= m.timeMs);
  const typingActive = elapsed >= 13000 && elapsed < 15200;
  const elapsedSeconds = Math.min(elapsed / 1000, BASE_DURATION / 1000);
  const currentPhase = activePhase >= 0 ? PHASES[activePhase] : null;
  const currentPhaseElapsed = currentPhase ? Math.max(0, elapsed - currentPhase.startMs) : 0;
  const currentPhaseSeconds = currentPhaseElapsed / 1000;

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleLogs.length]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleWA.length]);

  return (
    <section className="mx-auto max-w-7xl">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#0033A0] p-2.5 text-white">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Automatización en Acción
            </h2>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Proceso To-Be en tiempo real — Kari AI
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className={`rounded px-2 py-1 font-mono-jetbrains ${
            demoRunning ? "bg-emerald-100 text-emerald-700" : elapsed > 0 && !demoRunning ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
          }`}>
            {demoRunning ? "▶ En ejecución" : elapsed > 0 ? "⏸ Pausado" : "Listo"}
          </span>
          <span className="rounded bg-blue-100 px-2 py-1 font-mono-jetbrains text-[#0033A0]">
            {elapsedSeconds.toFixed(1)}s / {BASE_DURATION / 1000}s
          </span>
          {!completed && (
            <motion.button
              type="button"
              onClick={demoRunning ? resetDemo : startDemo}
              whileHover={reducedMotion ? undefined : { scale: 1.02 }}
              whileTap={reducedMotion ? undefined : { scale: 0.97 }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                demoRunning
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : "bg-[#0033A0] text-white hover:bg-[#002776]"
              }`}
            >
              {demoRunning ? (
                <><Zap className="size-3.5" /> Reiniciar</>
              ) : (
                <><Zap className="size-3.5" /> {elapsed > 0 ? "Reanudar" : "Iniciar Demo"}</>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* ── Scenario ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.06 }}
        className="mb-6 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-5 shadow-sm"
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Escenario
          </p>
          <span className="font-mono-jetbrains text-sm text-slate-700">
            <span className="size-2 inline-block rounded-full bg-[#0033A0] mr-1.5" />
            Visa ****1234
          </span>
          <span className="font-mono-jetbrains text-sm font-semibold text-slate-900">$2.450.000</span>
          <span className="text-sm text-slate-500">Nueva York, USA</span>
          <span className="text-sm text-slate-500">María González</span>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#0033A0] via-[#1e4db3] to-emerald-500"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* ── HORIZONTAL PIPELINE — the star of the show ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        className="mb-6 overflow-x-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {/* Active phase title */}
        <div className="mb-6 text-center">
          {currentPhase && !completed ? (
            <motion.div
              key={currentPhase.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="inline-flex flex-col items-center gap-1"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="text-[#0033A0]"
                >
                  <Loader2 className="size-4" />
                </motion.div>
                <span className="text-sm font-semibold text-[#0033A0]">
                  {currentPhase.label}: {currentPhase.desc}
                </span>
              </div>
              <span className="font-mono-jetbrains text-xs text-slate-500">
                Procesando... {currentPhaseSeconds.toFixed(1)}s
              </span>
            </motion.div>
          ) : completed ? (
            <div className="inline-flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="size-5" />
              <span className="text-sm font-semibold">Proceso completado</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
              <Zap className="size-4" />
              <span className="text-sm">Presiona <strong>Iniciar Demo</strong> para comenzar</span>
            </div>
          )}
        </div>

        {/* Phase nodes + connectors */}
        <div className="flex items-start justify-center gap-0">
          {PHASES.map((phase, i) => (
            <div key={phase.id} className="flex items-start">
              <PhaseNode
                phase={phase}
                index={i}
                activeIdx={activePhase}
                elapsed={elapsed}
                completed={completed}
              />
              {i < PHASES.length - 1 && (
                <Connector active={i <= activePhase || (completed && i < PHASES.length - 1)} />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Bottom split: Visual Architecture + WhatsApp ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Visual Architecture Panel (3/5) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.14 }}
          className="lg:col-span-3 space-y-4"
        >
          {/* System Architecture Map */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Network className="size-4 text-[#0033A0]" />
              Arquitectura de Automatización
            </h3>

            {/* Systems grid */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { id: "motor", icon: Eye, label: "Motor Fraude", phase: 0 },
                { id: "orq", icon: Cpu, label: "Orquestador", phase: 1 },
                { id: "crm", icon: Database, label: "CRM Banco", phase: 2 },
                { id: "kari", icon: MessageCircle, label: "Kari AI", phase: 3 },
              ].map((sys) => {
                const Icon = sys.icon;
                const isActive = activePhase === sys.phase;
                const isDone = elapsed >= PHASES[sys.phase].endMs;
                return (
                  <motion.div
                    key={sys.id}
                    animate={isActive ? { scale: [1, 1.03, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-2 py-3 transition-all duration-500 ${
                      isActive
                        ? "border-blue-300 bg-blue-50 shadow-md shadow-blue-100"
                        : isDone
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-slate-100 bg-slate-50 opacity-60"
                    }`}
                  >
                    <div className={`flex size-8 items-center justify-center rounded-lg ${
                      isActive ? "bg-blue-100 text-[#0033A0]" : isDone ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                    }`}>
                      {isDone ? <CheckCircle2 className="size-4" /> : <Icon className="size-4" />}
                    </div>
                    <span className={`text-[10px] font-semibold text-center leading-tight ${
                      isActive ? "text-[#0033A0]" : isDone ? "text-emerald-700" : "text-slate-400"
                    }`}>
                      {sys.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Flow arrow */}
            <div className="flex justify-center py-2">
              <div className="flex items-center gap-1 text-slate-300">
                <ArrowRight className="size-4" />
                <div className={`h-0.5 w-16 rounded-full transition-colors duration-500 ${activePhase >= 3 ? "bg-[#0033A0]" : "bg-slate-200"}`}>
                  {activePhase >= 3 && (
                    <motion.div className="h-full w-4 rounded-full bg-blue-400" animate={{ x: [0, 64] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
                  )}
                </div>
                <ArrowRight className="size-4" />
              </div>
            </div>

            {/* Second row: WhatsApp → Cliente → PPE → Registro */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { id: "wa", icon: MessageCircle, label: "WhatsApp", phase: 3 },
                { id: "client", icon: Shield, label: "María G.", phase: 4 },
                { id: "ppe", icon: Unlock, label: "PPE", phase: 5 },
                { id: "reg", icon: Server, label: "Sistemas", phase: 6 },
              ].map((sys) => {
                const Icon = sys.icon;
                const isActive = activePhase === sys.phase;
                const isDone = elapsed >= PHASES[sys.phase].endMs;
                return (
                  <motion.div
                    key={sys.id}
                    animate={isActive ? { scale: [1, 1.03, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-2 py-3 transition-all duration-500 ${
                      isActive
                        ? "border-blue-300 bg-blue-50 shadow-md shadow-blue-100"
                        : isDone
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-slate-100 bg-slate-50 opacity-60"
                    }`}
                  >
                    <div className={`flex size-8 items-center justify-center rounded-lg ${
                      isActive ? "bg-blue-100 text-[#0033A0]" : isDone ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                    }`}>
                      {isDone ? <CheckCircle2 className="size-4" /> : <Icon className="size-4" />}
                    </div>
                    <span className={`text-[10px] font-semibold text-center leading-tight ${
                      isActive ? "text-[#0033A0]" : isDone ? "text-emerald-700" : "text-slate-400"
                    }`}>
                      {sys.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Live Activity Feed — visual event cards */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Zap className="size-4 text-[#0033A0]" />
              Actividad en Tiempo Real
            </h3>
            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              {elapsed === 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400">
                  <ArrowRight className="size-3" />
                  Esperando inicio del pipeline...
                </div>
              )}
              <AnimatePresence initial={false}>
                {visibleLogs.map((log) => {
                  const isAction = log.type === "action";
                  const isSuccess = log.type === "success";
                  const isWarning = log.type === "warning";
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -8, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: "auto" }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                        isAction
                          ? "border-blue-200 bg-blue-50"
                          : isSuccess
                            ? "border-emerald-200 bg-emerald-50"
                            : isWarning
                              ? "border-amber-200 bg-amber-50"
                              : "border-slate-100 bg-slate-50"
                      }`}
                    >
                      <div className={`flex size-7 shrink-0 items-center justify-center rounded-md ${
                        isAction ? "bg-blue-100 text-[#0033A0]" : isSuccess ? "bg-emerald-100 text-emerald-600" : isWarning ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"
                      }`}>
                        {isAction && <Zap className="size-3.5" />}
                        {isSuccess && <CheckCircle2 className="size-3.5" />}
                        {isWarning && <Shield className="size-3.5" />}
                        {!isAction && !isSuccess && !isWarning && <Server className="size-3.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-medium truncate ${
                          isAction ? "text-[#0033A0]" : isSuccess ? "text-emerald-700" : isWarning ? "text-amber-700" : "text-slate-600"
                        }`}>
                          {log.text}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono-jetbrains text-[10px] text-slate-400">
                        +{(log.timeMs / 1000).toFixed(1)}s
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={logsEndRef} />
            </div>
          </div>
        </motion.div>

        {/* WhatsApp (2/5) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.18 }}
          className="lg:col-span-2"
        >
          <div className="overflow-hidden rounded-2xl border border-slate-700 bg-[#0b141a] shadow-lg">
            {/* Phone header */}
            <div className="flex items-center gap-3 bg-[#1f2c34] px-4 py-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#005c4b] text-white">
                <Shield className="size-3.5" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-medium text-white">Centro de Operaciones</p>
                <p className="text-[10px] text-slate-400">Alertas · Kari AI</p>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Wifi className="size-3" />
                <span className="font-mono-jetbrains text-[10px] text-slate-500">14:23</span>
              </div>
            </div>

            {/* Chat area */}
            <div className="h-[280px] space-y-3 overflow-y-auto bg-[#0b141a] bg-[radial-gradient(ellipse_at_top,_rgba(0,92,75,0.08),transparent_60%)] p-3">
              {elapsed >= 8000 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-center"
                >
                  <span className="rounded-lg bg-[#1f2c34] px-3 py-1 text-[10px] text-slate-500">
                    Kari AI conectado · Bot activo 24/7
                  </span>
                </motion.div>
              )}

              <AnimatePresence initial={false}>
                {visibleWA.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={
                      msg.sender === "system"
                        ? { opacity: 0, scale: 0.95 }
                        : { opacity: 0, y: 6, x: msg.sender === "bank" ? -12 : msg.sender === "client" ? 12 : 0 }
                    }
                    animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={`flex ${
                      msg.sender === "client"
                        ? "justify-end"
                        : msg.sender === "system"
                          ? "justify-center"
                          : "justify-start"
                    }`}
                  >
                    {msg.sender === "system" ? (
                      <span className="rounded-lg bg-[#1f2c34] px-3 py-1.5 text-[10px] leading-relaxed text-slate-400 whitespace-pre-line">
                        {msg.text}
                      </span>
                    ) : (
                      <div
                        className={`max-w-[82%] rounded-lg px-3 py-2 text-[12px] leading-relaxed whitespace-pre-line ${
                          msg.sender === "bank"
                            ? "rounded-tl-none bg-[#005c4b] text-white"
                            : "rounded-tr-none bg-[#2a3b45] text-white"
                        }`}
                      >
                        {msg.text}
                      </div>
                    )}
                  </motion.div>
                ))}

                {typingActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-center gap-1 rounded-lg rounded-tl-none bg-[#2a3b45] px-4 py-3">
                      <TypingDots />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            {/* Input bar */}
            <div className="border-t border-[#1f2c34] bg-[#1f2c34] px-4 py-2.5">
              <div className="flex items-center gap-2 rounded-full bg-[#2a3b45] px-3 py-1.5">
                <MessageCircle className="size-3.5 text-slate-500" />
                <span className="flex-1 text-[11px] text-slate-500">
                  {typingActive ? "María está escribiendo..." : elapsed >= 22000 ? "Chat finalizado" : "Conversación Kari AI"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Completion ── */}
      <AnimatePresence>
        {completed && !demoRunning && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-6 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-8 text-center shadow-sm"
          >
            <motion.div
              animate={{ rotate: [0, 6, -6, 0] }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600"
            >
              <CheckCircle2 className="size-8" />
            </motion.div>
            <h3 className="mt-4 font-mono-jetbrains text-3xl font-bold text-emerald-700">
              Alerta resuelta en {BASE_DURATION / 1000} segundos
            </h3>
            <p className="mt-2 text-sm text-emerald-600">
              María González pudo continuar su compra sin interrupción alguna.
              El proceso automatizado eliminó toda fricción para el cliente.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
              <span className="text-slate-400 line-through">
                Proceso manual actual: ~40 minutos
              </span>
              <span className="font-semibold text-emerald-700">
                Proceso automatizado: {BASE_DURATION / 1000} segundos
              </span>
            </div>
            <motion.button
              type="button"
              onClick={resetDemo}
              whileHover={reducedMotion ? undefined : { scale: 1.01 }}
              whileTap={reducedMotion ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0033A0] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#002776]"
            >
              <Sparkles className="size-4" />
              Reproducir de nuevo
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
