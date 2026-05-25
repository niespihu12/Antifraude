"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Cpu,
  Database,
  Loader2,
  MessageCircle,
  Play,
  Unlock,
  Zap,
  Eye,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type SimulationStep = {
  key: string;
  label: string;
  description: string;
  icon: typeof Eye;
  tone: string;
  statusLabel: string;
  statusTone: string;
  time: number;
};

const steps: SimulationStep[] = [
  {
    key: "deteccion",
    label: "Detección",
    description: "Motor de fraude detecta transacción sospechosa",
    icon: Eye,
    tone: "blue-500",
    statusLabel: "Completado ✓",
    statusTone: "emerald",
    time: 0,
  },
  {
    key: "orquestador",
    label: "Orquestador",
    description: "Recibe alerta y prioriza automáticamente",
    icon: Cpu,
    tone: "blue-500",
    statusLabel: "Completado ✓",
    statusTone: "emerald",
    time: 2,
  },
  {
    key: "enriquecimiento",
    label: "Enriquecimiento",
    description: "Consulta CRM, obtiene celular, valida datos",
    icon: Database,
    tone: "blue-500",
    statusLabel: "Completado ✓",
    statusTone: "emerald",
    time: 3,
  },
  {
    key: "whatsapp",
    label: "WhatsApp HSM",
    description: "Envía mensaje automático vía Kari AI",
    icon: MessageCircle,
    tone: "emerald-500",
    statusLabel: "Completado ✓",
    statusTone: "emerald",
    time: 5,
  },
  {
    key: "espera",
    label: "Espera Cliente",
    description: "Bot espera respuesta...",
    icon: Clock,
    tone: "amber-500",
    statusLabel: "Procesando...",
    statusTone: "amber",
    time: 6,
  },
  {
    key: "desbloqueo",
    label: "Desbloqueo",
    description: "Cliente confirmó 'Sí fui yo' — PPE desbloquea tarjeta vía API",
    icon: Unlock,
    tone: "emerald-500",
    statusLabel: "Completado ✓",
    statusTone: "emerald",
    time: 8,
  },
  {
    key: "registro",
    label: "Registro",
    description: "Tipificación automática en todos los sistemas",
    icon: ClipboardCheck,
    tone: "blue-500",
    statusLabel: "Completado ✓",
    statusTone: "emerald",
    time: 9,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

function statusClasses(tone: string) {
  if (tone === "amber") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-emerald-100 text-emerald-700";
}

function toneClasses(tone: string) {
  switch (tone) {
    case "blue-500":
      return {
        circle: "bg-blue-100 text-blue-700",
        text: "text-blue-700",
      };
    case "blue-500":
      return {
        circle: "bg-blue-100 text-[#0033A0]",
        text: "text-[#0033A0]",
      };
    case "amber-500":
      return {
        circle: "bg-amber-100 text-amber-700",
        text: "text-amber-700",
      };
    case "emerald-500":
    default:
      return {
        circle: "bg-emerald-100 text-emerald-700",
        text: "text-emerald-700",
      };
  }
}

export function SimulationPanel() {
  const reducedMotion = useReducedMotion();
  const [isRunning, setIsRunning] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [completed, setCompleted] = useState<boolean[]>(() => steps.map(() => false));
  const [progress, setProgress] = useState(0);
  const [finished, setFinished] = useState(false);
  const timeoutRefs = useRef<number[]>([]);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const clearTimers = () => {
    timeoutRefs.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    timeoutRefs.current = [];
    window.cancelAnimationFrame(rafRef.current);
  };

  const reset = () => {
    clearTimers();
    setIsRunning(false);
    setActiveIndex(-1);
    setCompleted(steps.map(() => false));
    setProgress(0);
    setFinished(false);
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    startRef.current = performance.now();
    const totalDuration = 10000;

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const nextProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(nextProgress);

      if (nextProgress < 100) {
        rafRef.current = window.requestAnimationFrame(tick);
      }
    };

    rafRef.current = window.requestAnimationFrame(tick);

    const timeline = steps.map((step, index) => {
      const timeoutId = window.setTimeout(() => {
        setActiveIndex(index);
        setCompleted((current) => current.map((value, currentIndex) => currentIndex === index ? true : value));

        if (index === steps.length - 1) {
          window.setTimeout(() => {
            setFinished(true);
            setIsRunning(false);
            setActiveIndex(-1);
            setProgress(100);
          }, 650);
        }
      }, step.time * 1000);

      return timeoutId;
    });

    timeoutRefs.current = timeline;

    return () => clearTimers();
  }, [isRunning]);

  const done = useMemo(() => completed.every(Boolean), [completed]);

  return (
    <section className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl bg-blue-100 p-2 text-[#0033A0]">
          <Play className="size-5 fill-[#0033A0]/20" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Simulación de Alerta en Tiempo Real</h2>
          <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
            Observa cómo el proceso automatizado resuelve una alerta transaccional
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-full bg-slate-100">
        <motion.div
          className="h-1.5 rounded-full bg-gradient-to-r from-[#0033A0] to-[#1e4db3]"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      </div>

      <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <p className="text-slate-500">Escenario:</p>
        <p className="mt-1 font-mono-jetbrains font-medium text-slate-900">
          Compra inusual detectada — Tarjeta Visa terminada en 1234 — $2.450.000 en Nueva York — Cliente: María González
        </p>
      </div>

      <div className="mt-6 flex justify-center">
        <motion.button
          type="button"
          onClick={finished ? reset : () => setIsRunning(true)}
          disabled={isRunning}
          whileHover={reducedMotion ? undefined : { scale: 1.01, transition: { duration: 0.15 } }}
          whileTap={reducedMotion ? undefined : { scale: 0.98 }}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0033A0] px-5 py-2.5 text-sm font-bold text-white transition-all duration-150 transition-transform active:scale-95 hover:bg-[#002776] disabled:cursor-not-allowed disabled:opacity-80"
        >
          {isRunning ? <Loader2 className="size-5 animate-spin" /> : <Zap className="size-5" />}
          {isRunning ? "Ejecutando..." : finished ? "▶ Reproducir de nuevo" : "EJECUTAR DEMO"}
        </motion.button>
      </div>

      <motion.div
        className="mt-6 space-y-2"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {steps.map((step, index) => {
          const Icon = step.icon;
          const tone = toneClasses(step.tone);
          const isCompleted = completed[index];
          const isActive = activeIndex === index;

          return (
            <motion.div
              key={step.key}
              variants={cardVariants}
              className={`rounded-lg border px-3 py-3 transition-colors duration-300 ${
                isActive ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-4">
                <motion.div
                  animate={isActive ? { scale: [1, 1.01, 1] } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex size-9 items-center justify-center rounded-lg ${tone.circle}`}
                >
                  <Icon className="size-[18px]" />
                </motion.div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{step.label}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{step.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  {isActive && !isCompleted ? (
                    <span className={`badge-compact inline-flex items-center gap-2 rounded ${statusClasses(step.statusTone)}`}>
                      <Loader2 className="size-3.5 animate-spin" />
                      Procesando...
                    </span>
                  ) : (
                    <span className={`badge-compact inline-flex items-center gap-2 rounded ${statusClasses("emerald")}`}>
                      <CheckCircle2 className="size-3.5" />
                      Completado ✓
                    </span>
                  )}
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="mt-3 flex justify-center">
                  <div className="relative h-8 w-px overflow-hidden bg-slate-200">
                    <motion.div
                      className="absolute inset-x-0 top-0 h-full bg-[#0033A0]/20"
                      animate={isActive || isCompleted ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.3 }}
                      transition={{ duration: 2.2, repeat: isActive ? Infinity : 0, ease: "linear" }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {done && !isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center"
          >
            <p className="font-mono-jetbrains text-3xl font-bold text-emerald-700">Alerta resuelta en 10 segundos</p>
            <p className="mt-2 text-sm text-emerald-600">
              El cliente María González pudo continuar su compra sin interrupción
            </p>

            <div className="mt-5 flex flex-col items-center gap-2 text-sm sm:flex-row sm:justify-center sm:gap-4">
              <span className="text-[var(--text-muted)] line-through">Proceso manual actual: <span className="font-mono-jetbrains">~40 minutos</span></span>
              <span className="font-bold text-emerald-700">Proceso automatizado: <span className="font-mono-jetbrains">10 segundos</span></span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {finished && !isRunning && !done && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="font-mono-jetbrains text-3xl font-bold text-emerald-700">Alerta resuelta en 10 segundos</p>
          <p className="mt-2 text-sm text-emerald-600">
            El cliente María González pudo continuar su compra sin interrupción
          </p>

          <div className="mt-5 flex flex-col items-center gap-2 text-sm sm:flex-row sm:justify-center sm:gap-4">
            <span className="text-[var(--text-muted)] line-through">Proceso manual actual: <span className="font-mono-jetbrains">~40 minutos</span></span>
            <span className="font-bold text-emerald-400">Proceso automatizado: <span className="font-mono-jetbrains">10 segundos</span></span>
          </div>
        </div>
      )}
    </section>
  );
}
