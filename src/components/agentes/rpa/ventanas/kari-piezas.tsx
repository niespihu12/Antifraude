"use client";

import type { ReactNode } from "react";
import { Check, CheckCheck } from "lucide-react";
import { formatDuracion } from "@/components/agentes/helpers";
import { ChipRegla } from "@/components/agentes/ui";
import type { EstadoEntrega, ResumenSLA } from "@/data/guiones/kari-hsm";

/** Piezas compartidas por la consola de Kari y el teléfono del titular (ventana-kari / ventana-whatsapp). */

/** «T+07:12»: tiempo simulado desde el primer envío. */
export const formatT = (seg: number): string => `T+${formatDuracion(seg * 1000)}`;

/** Marcas de entrega: ✓ enviado · ✓✓ entregado. */
export function Ticks({ estado, className = "w-3 h-3" }: { estado: EstadoEntrega; className?: string }) {
  if (estado === "entregado")
    return <CheckCheck className={`${className} text-slate-500 shrink-0`} aria-label="Entregado" />;
  return <Check className={`${className} text-slate-400 shrink-0`} aria-label="Enviado" />;
}

/** Barra del SLA: avance simulado, marca del reintento (R10) y fin del SLA (R05). */
export function BarraSLA({ r }: { r: ResumenSLA }) {
  const pct = (s: number) => `${Math.min(100, Math.max(0, (s / r.slaSeg) * 100))}%`;
  const color = r.vencido ? "#dc2626" : r.respondio ? "#2563eb" : "#059669";
  return (
    <div>
      <div className="relative h-1.5 rounded-full bg-slate-200">
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: pct(r.seg), backgroundColor: color }} />
        <span className="absolute -top-0.5 h-2.5 w-px bg-slate-500" style={{ left: pct(r.reintSeg) }} />
      </div>
      <div className="relative mt-0.5 h-2.5 text-[8.5px] leading-none text-slate-500">
        <span className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: pct(r.reintSeg) }}>
          {r.reintMin} min
        </span>
        <span className="absolute right-0 whitespace-nowrap">{r.slaMin} min</span>
      </div>
    </div>
  );
}

/** Texto y color del estado del SLA. */
export function estadoSLA(r: ResumenSLA, respuestaMin: number | null): { texto: string; clase: string } {
  if (r.vencido) return { texto: "SLA vencido", clase: "bg-red-100 text-[#E31837]" };
  if (r.respondio) return { texto: `Respondió · ${respuestaMin} min`, clase: "bg-emerald-100 text-emerald-700" };
  return { texto: "En curso", clase: "bg-blue-100 text-blue-700" };
}

/** Línea del reintento (R10) para los paneles laterales. */
export function LineaReintento({
  r,
  ancla,
  resaltado = false,
}: {
  r: ResumenSLA;
  ancla?: string;
  resaltado?: boolean;
}): ReactNode {
  const texto = r.reintento === "enviado" ? "Enviado" : r.reintento === "innecesario" ? "No necesario" : "Programado";
  return (
    <div
      data-ancla={ancla}
      className={`flex items-center justify-between gap-1 text-[10px] leading-tight ${resaltado ? "rounded bg-amber-100" : ""}`}
    >
      <span className="flex items-center gap-1 shrink-0">
        <span className="text-slate-500">Reintento</span>
        <ChipRegla codigo="R10" />
      </span>
      <span className={`truncate ${r.reintento === "enviado" ? "text-emerald-700 font-medium" : "text-slate-700"}`}>
        {texto}
      </span>
    </div>
  );
}
