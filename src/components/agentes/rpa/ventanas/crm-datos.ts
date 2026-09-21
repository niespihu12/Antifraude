/**
 * Datos derivados de pantalla del CRM Banco: funciones puras y deterministas de `caso`
 * (sin impurezas ni azar: todo se deriva del caso). Se usan en la ventana `ventana-crm.tsx`.
 */
import { EstadoAlerta } from "@/types";
import type { Caso } from "@/types/agentes";
import { fechaCorta, formatPeso } from "@/data/agentes-util";

/** FNV-1a de 32 bits: hash estable de una cadena. */
function hashTexto(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export interface AlertaPrevia {
  id: string;
  fecha: string;
  monto: string;
  resultado: string;
}

export interface HistorialCliente {
  /** Desbloqueos legítimos previos del titular (`cliente.desbloqueosLegitimos`). */
  total: number;
  /** Las alertas más recientes (hasta 3), de la más nueva a la más antigua. */
  filas: AlertaPrevia[];
}

/** Alertas previas del titular que se resolvieron como legítimas (base de R09). */
export function historialCliente(caso: Caso): HistorialCliente {
  const { cliente } = caso.datos;
  const total = cliente.desbloqueosLegitimos;
  const filas: AlertaPrevia[] = [];
  let ts = caso.recibidoEn;
  for (let k = 0; k < Math.min(3, total); k++) {
    const h = hashTexto(`${cliente.cedula}|${caso.datos.tarjeta.ultimos4}|${k}`);
    ts -= (12 + (h % 40)) * 86_400_000;
    const fecha = fechaCorta(ts);
    filas.push({
      id: `ALT-${fecha.slice(-4)}-${String(10_000 + ((h >>> 8) % 80_000)).padStart(5, "0")}`,
      fecha,
      monto: formatPeso((20 + ((h >>> 4) % 180)) * 10_000),
      resultado: "Legítima · desbloqueada",
    });
  }
  return { total, filas };
}

/**
 * Estado global de la alerta justo antes de un paso: el último `estado` que fijó un paso anterior
 * del plan (los pasos se ejecutan en orden, así que todos los anteriores ya ocurrieron).
 */
export function estadoAlertaAntesDe(caso: Caso, idPaso: string): EstadoAlerta {
  let estado = EstadoAlerta.PENDIENTE_REVISION;
  for (const etapa of caso.plan) {
    for (const paso of etapa.pasos) {
      if (paso.id === idPaso) return estado;
      if (paso.estado) estado = paso.estado;
    }
  }
  return estado;
}
