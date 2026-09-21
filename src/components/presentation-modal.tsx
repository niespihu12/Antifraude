"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Bot,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Eye,
  GitBranch,
  MessageCircle,
  Monitor,
  Play,
  Scale,
  UserSearch,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useSimulation } from "@/context/simulation-context";

type TourStep = {
  id: number;
  title: string;
  area: string;
  icon: LucideIcon;
  description: string;
  actions: string[];
  systems: string[];
  duration: string;
  insight: string;
  color: string;
  bgColor: string;
  borderColor: string;
};

const STEPS: TourStep[] = [
  {
    id: 1,
    title: "Recepción de Alertas",
    area: "Monitor / Franquicias",
    icon: Eye,
    description:
      "Cada mes ingresan ~700.000 alertas transaccionales desde Monitor (interno), BRM (Visa) y EMS/MS (Mastercard). El orquestador central normaliza el evento, asigna franquicia y enruta la alerta al flujo automatizado.",
    actions: [
      "Recibir alerta desde Monitor, BRM o EMS/MS",
      "Normalizar monto, tarjeta y comercio",
      "Clasificar franquicia y severidad",
      "Encolar en el orquestador central",
    ],
    systems: ["Monitor", "BRM (Visa)", "EMS/MS (Mastercard)"],
    duration: "~7 min por alerta",
    insight:
      "Solo 20.000–30.000 alertas se gestionan hoy de forma operativa; el resto queda sin cobertura automatizada.",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-200",
  },
  {
    id: 2,
    title: "Identificación del Cliente",
    area: "CRM Banco",
    icon: UserSearch,
    description:
      "El bot consulta CRM para cruzar titular, celular, dispositivo y ubicación. Si el contacto está desactualizado, la alerta escala a monitoreo manual antes de continuar.",
    actions: [
      "Consultar cliente en CRM Banco",
      "Validar celular y datos de contacto",
      "Cruzar dispositivo y ubicación",
      "Escalar si falta información crítica",
    ],
    systems: ["CRM Banco", "Orquestador"],
    duration: "~8 min por alerta",
    insight:
      "La ausencia de celular actualizado es la principal causa de escalamiento manual en esta fase.",
    color: "text-[#0033A0]",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-200",
  },
  {
    id: 3,
    title: "Comunicación con el Cliente",
    area: "Kari AI / WhatsApp",
    icon: MessageCircle,
    description:
      "Kari AI envía un mensaje HSM por WhatsApp para confirmar si la compra fue legítima. Se espera respuesta del titular con reintentos automáticos dentro del SLA de 40 minutos.",
    actions: [
      "Enviar plantilla HSM aprobada",
      "Registrar respuesta del cliente",
      "Reintentar si no hay respuesta en 15 min",
      "Mantener trazabilidad del canal",
    ],
    systems: ["Kari AI", "WhatsApp Business"],
    duration: "~10 min por alerta",
    insight:
      "La contactabilidad por WhatsApp ronda el 70%; el resto requiere seguimiento o bloqueo preventivo.",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
    borderColor: "border-emerald-200",
  },
  {
    id: 4,
    title: "Evaluación y Decisión",
    area: "Cardinal / PPE",
    icon: Scale,
    description:
      "Cardinal valida el score de riesgo y PPE ejecuta bloqueo preventivo o definitivo. Si el cliente confirma la compra, se desbloquea; si niega, se mantiene el bloqueo y se escala el caso.",
    actions: [
      "Evaluar score de riesgo en Cardinal",
      "Bloquear preventivamente en PPE",
      "Desbloquear si el cliente confirma",
      "Bloquear definitivo si niega la compra",
    ],
    systems: ["Cardinal", "PPE"],
    duration: "~9 min por alerta",
    insight:
      "El 70–80% de alertas resultan falsos positivos; la decisión correcta reduce fricción sin relajar seguridad.",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    borderColor: "border-amber-200",
  },
  {
    id: 5,
    title: "Registro y Tipificación",
    area: "CRM / Bitácora",
    icon: ClipboardCheck,
    description:
      "Se registra el resultado final en CRM con tipificación (legítima, fraude, sin respuesta). La bitácora del orquestador conserva trazabilidad completa para auditoría 24/7.",
    actions: [
      "Tipificar resultado en CRM",
      "Registrar cierre en bitácora",
      "Actualizar métricas operativas",
      "Archivar caso para auditoría",
    ],
    systems: ["CRM Banco", "PPE", "Orquestador"],
    duration: "~6 min por alerta",
    insight:
      "La tipificación obligatoria evita cierres incompletos y alimenta el tablero de métricas en tiempo real.",
    color: "text-violet-700",
    bgColor: "bg-violet-100",
    borderColor: "border-violet-200",
  },
];

export function PresentationModal({
  open,
  onClose,
}: {
  open: boolean;
  viewLabel?: string;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const { startSimulation } = useSimulation();

  useEffect(() => {
    if (!open) {
      setStep(0);
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const current = STEPS[step];
  const Icon = current.icon;
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
      startSimulation();
    } else {
      setStep((value) => value + 1);
    }
  };

  const handlePrev = () => setStep((value) => Math.max(0, value - 1));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="presentation-tour-title"
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <GitBranch className="size-5 text-[#0033A0]" />
            <h2
              id="presentation-tour-title"
              className="text-lg font-semibold tracking-tight text-slate-900"
            >
              El Viaje de una Alerta Antifraude
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Cerrar modo presentación"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 border-b border-slate-200 bg-slate-50 px-6 py-3">
          {STEPS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStep(index)}
              className={`h-2 rounded-full transition-all ${
                index === step
                  ? "w-8 bg-[#0033A0]"
                  : index < step
                    ? "w-2 bg-[#0033A0]/40"
                    : "w-2 bg-slate-300"
              }`}
              aria-label={`Ir al paso ${item.id}: ${item.title}`}
            />
          ))}
        </div>

        <div className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-5"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex size-14 shrink-0 items-center justify-center rounded-xl border ${current.bgColor} ${current.borderColor}`}
                >
                  <Icon className={`size-6 ${current.color}`} />
                </div>
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Paso {current.id} de {STEPS.length}
                    </span>
                    <span className="rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[11px] font-medium text-slate-400">
                      {current.area}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                    {current.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {current.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <CheckCircle className="size-4 text-[#0033A0]" />
                    <h4 className="text-sm font-semibold text-slate-900">
                      Acciones clave
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {current.actions.map((action) => (
                      <li
                        key={action}
                        className="flex items-start gap-2 text-[13px] text-slate-600"
                      >
                        <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Monitor className="size-4 text-[#0033A0]" />
                      <h4 className="text-sm font-semibold text-slate-900">
                        Sistemas involucrados
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {current.systems.map((system) => (
                        <span
                          key={system}
                          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[12px] font-medium text-slate-600"
                        >
                          {system}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-1 flex items-center gap-2">
                      <Clock className="size-4 text-[#0033A0]" />
                      <h4 className="text-sm font-semibold text-slate-900">
                        Duración típica
                      </h4>
                    </div>
                    <p className="text-[13px] text-slate-600">{current.duration}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-[#0033A0]" />
                <div>
                  <p className="text-sm font-medium text-[#0033A0]">
                    Dato importante
                  </p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-slate-600">
                    {current.insight}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={isFirst}
            className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              isFirst
                ? "cursor-not-allowed border-slate-200 text-slate-400"
                : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
            }`}
          >
            <ChevronLeft className="size-4" />
            Anterior
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 rounded-lg bg-[#0033A0] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#002776]"
            >
              <Play className="size-4 fill-current" />
              Comenzar simulación
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded-lg bg-[#0033A0] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#002776]"
            >
              Siguiente
              <ChevronRight className="size-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-[var(--border-subtle)] px-6 py-2">
          <Bot className="size-3.5 text-slate-600" />
          <p className="text-[11px] uppercase tracking-wider text-slate-600">
            Centro de Operaciones Antifraude · Orquestador · ESC para salir
          </p>
        </div>
      </motion.div>
    </div>
  );
}
