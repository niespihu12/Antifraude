"use client";

import type { CSSProperties, ReactNode } from "react";
import { EstadoAlerta } from "@/types";
import type { PasoPlan } from "@/types/agentes";
import { AGENTES_MAP } from "@/data/agentes-data";

/**
 * Piezas visuales compartidas por las consolas de alertas (Monitor, VRM y EMS/MS).
 * Sin estado: todo es función de las props.
 */

/** Color del agente que opera el paso (r→Recepción, i→Identificación…); undefined si no hay paso. */
export function colorAgentePaso(paso?: PasoPlan): string | undefined {
  const letra = paso?.id[0];
  const id =
    letra === "r"
      ? "recepcion"
      : letra === "i"
        ? "identificacion"
        : letra === "c"
          ? "comunicacion"
          : letra === "d"
            ? "decision"
            : letra === "g"
              ? "registro"
              : undefined;
  return id ? AGENTES_MAP[id].color : undefined;
}

/* ─── Insignias ─── */
const CLASE_ESTADO: Record<string, string> = {
  [EstadoAlerta.PENDIENTE_REVISION]: "bg-slate-100 text-slate-700",
  [EstadoAlerta.EN_VERIFICACION_CRM]: "bg-blue-100 text-blue-700",
  [EstadoAlerta.WHATSAPP_ENVIADO]: "bg-emerald-100 text-emerald-700",
  [EstadoAlerta.ESPERANDO_CLIENTE]: "bg-amber-100 text-amber-700",
  [EstadoAlerta.BLOQUEO_PREVENTIVO]: "bg-orange-100 text-orange-700",
  [EstadoAlerta.DESBLOQUEADO]: "bg-emerald-100 text-emerald-700",
  [EstadoAlerta.BLOQUEO_DEFINITIVO]: "bg-red-100 text-[#E31837]",
  [EstadoAlerta.TIPIFICADO]: "bg-slate-100 text-slate-700",
  "Monitoreo manual": "bg-amber-100 text-amber-800",
  Nueva: "bg-blue-100 text-blue-700",
  Reconocida: "bg-emerald-100 text-emerald-700",
  "En análisis": "bg-amber-100 text-amber-700",
  Cerrada: "bg-slate-100 text-slate-600",
};

export function Insignia({
  texto,
  clase,
  ancla,
  className = "",
}: {
  texto: ReactNode;
  clase?: string;
  ancla?: string;
  className?: string;
}) {
  return (
    <span
      data-ancla={ancla}
      className={`inline-flex items-center rounded-full px-1.5 h-[15px] text-[9.5px] font-medium leading-none whitespace-nowrap ${clase ?? "bg-slate-100 text-slate-700"} ${className}`}
    >
      {texto}
    </span>
  );
}

export function InsigniaEstado({ estado, className = "" }: { estado: string; className?: string }) {
  return <Insignia texto={estado} clase={CLASE_ESTADO[estado]} className={className} />;
}

export function InsigniaPrioridad({ prioridad }: { prioridad: "Alta" | "Media" }) {
  return (
    <Insignia
      texto={prioridad}
      clase={prioridad === "Alta" ? "bg-red-100 text-[#E31837]" : "bg-slate-100 text-slate-700"}
    />
  );
}

export function ChipRegla({ codigo }: { codigo: string }) {
  return (
    <span className="inline-flex items-center px-1.5 h-[15px] rounded bg-amber-50 text-amber-700 border border-amber-200 text-[9.5px] font-mono-jetbrains font-semibold leading-none">
      {codigo}
    </span>
  );
}

/* ─── Botón web (chip de acción de la consola) ─── */
export function BotonWeb({
  ancla,
  texto,
  color,
  presionado = false,
  deshabilitado = false,
  secundario = false,
  icono,
  className = "",
}: {
  ancla: string;
  texto: string;
  color: string;
  presionado?: boolean;
  deshabilitado?: boolean;
  secundario?: boolean;
  icono?: ReactNode;
  className?: string;
}) {
  const estilo: CSSProperties = secundario
    ? { color, borderColor: `${color}66` }
    : { backgroundColor: color, filter: presionado ? "brightness(0.85)" : undefined };
  return (
    <span
      data-ancla={ancla}
      className={`h-[22px] px-2.5 inline-flex items-center gap-1 rounded-md text-[10.5px] font-medium select-none border whitespace-nowrap ${secundario ? "bg-white" : "text-white border-transparent"} ${presionado ? "shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)] translate-y-[1px]" : "shadow-sm"} ${deshabilitado ? "opacity-45" : ""} ${className}`}
      style={estilo}
    >
      {icono}
      {texto}
    </span>
  );
}

/* ─── Tarjeta con título ─── */
export function Tarjeta({
  titulo,
  derecha,
  children,
  className = "",
  borde = "border-slate-200",
}: {
  titulo: ReactNode;
  derecha?: ReactNode;
  children: ReactNode;
  className?: string;
  borde?: string;
}) {
  return (
    <div className={`bg-white rounded border ${borde} min-h-0 flex flex-col overflow-hidden ${className}`}>
      <div className="h-[18px] shrink-0 px-2 flex items-center justify-between gap-2 border-b border-slate-100 whitespace-nowrap">
        <span className="text-[9.5px] uppercase tracking-wider text-slate-500 font-semibold truncate">{titulo}</span>
        {derecha && <span className="text-[9.5px] text-slate-500 shrink-0">{derecha}</span>}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
