"use client";

import type { ReactNode } from "react";
import type { AccionUI, PasoPlan } from "@/types/agentes";
import Toast from "../toast";

/**
 * Piezas comunes de las ventanas del escritorio RPA. Es de solo lectura para
 * quien construya una ventana: si falta algo, se declara en el informe final.
 */

/** Paso de entrega (sin guion): la ventana muestra el toast «Entregando a Agente X…». */
export function accionEntrega(paso?: PasoPlan): AccionUI | undefined {
  if (!paso || paso.vista || paso.ui?.length || !/^Entregando a /.test(paso.texto)) return undefined;
  return { t: 0, hasta: 1, tipo: "toast", texto: `${paso.texto}…`, nivel: "info" };
}

/** Toast de entrega entre agentes; renderizar dentro del cuerpo de la ventana (no hace nada si el paso no es una entrega). */
export function ToastEntrega({ paso, progreso }: { paso?: PasoPlan; progreso: number }) {
  const a = accionEntrega(paso);
  return a ? <Toast acciones={[a]} progreso={progreso} paso={paso} /> : null;
}

/** Par etiqueta / valor compacto para fichas de detalle. */
export function Dato({ k, v, mono = false }: { k: string; v: ReactNode; mono?: boolean }) {
  return (
    <div className="flex gap-1 min-w-0">
      <span className="text-slate-400 shrink-0">{k}</span>
      <span className={`truncate text-slate-800 ${mono ? "font-mono-jetbrains" : ""}`}>{v}</span>
    </div>
  );
}
