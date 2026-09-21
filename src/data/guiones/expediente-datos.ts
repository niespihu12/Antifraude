/**
 * Datos compartidos entre el guion de g5 (`expediente.ts`) y la ventana (`ventana-expediente.tsx`): las secciones
 * del expediente digital, el instante en que se consolida cada una, el resumen que muestra y las anclas.
 *
 * Anclas de la ventana (data-ancla="exp.<tipo>.<nombre>"):
 *  exp.fila.<slug> (alerta | titular | transaccion | hsm | riesgo | ppe | tipificacion)
 *  exp.campo.hash · exp.btn.sellar · exp.campo.acta
 */
import type { Caso } from "@/types/agentes";
import { formatPeso } from "@/data/agentes-util";
import { ID_OPERACIONES, bloqueadoAlInicio, operacionDe, referenciaOperacion } from "./ppe-datos";

export interface SeccionExpediente {
  slug: string;
  etiqueta: string;
  /** Pasos del plan que alimentan la sección (la hora es la del último ya hecho). */
  pasos: readonly string[];
}

export const SECCIONES_EXPEDIENTE: readonly SeccionExpediente[] = [
  { slug: "alerta", etiqueta: "Alerta", pasos: ["r1"] },
  { slug: "titular", etiqueta: "Titular y tarjeta", pasos: ["i1", "i2"] },
  { slug: "transaccion", etiqueta: "Transacción", pasos: ["r2", "r3", "r4"] },
  { slug: "hsm", etiqueta: "Comunicación HSM", pasos: ["i3", "c2", "c3", "c4", "c5", "c6"] },
  { slug: "riesgo", etiqueta: "Revisión de riesgo", pasos: ["d1"] },
  { slug: "ppe", etiqueta: "Decisión en PPE", pasos: ["d2", ...ID_OPERACIONES.filter((id) => id !== "r5")] },
  { slug: "tipificacion", etiqueta: "Tipificación", pasos: ["g1", "g2"] },
];

export const anclaFila = (slug: string) => `exp.fila.${slug}`;
export const ANCLA_HASH = "exp.campo.hash";
export const ANCLA_SELLAR = "exp.btn.sellar";
export const ANCLA_ACTA = "exp.campo.acta";

/** Instante (0–1 del paso g5) en que el cursor llega a la sección i; la siguiente empieza 0.07 después. */
export const tSeccion = (i: number): number => 0.06 + i * 0.07;
export const PASO_SECCION = 0.07;
/** Cálculo del sello, sello aplicado, redacción del acta y sello de resultado (fracciones de g5). */
export const T_G5 = {
  calculo: 0.5,
  hash: 0.54,
  pegar: 0.58,
  sellar: 0.68,
  sello: 0.72,
  acta: 0.74,
  actaFin: 0.95,
  resultado: 0.86,
};

/** Hora (epoch ms) del último paso de la sección que el caso ya hizo; undefined si ninguno. */
export function tiempoSeccion(caso: Caso, s: SeccionExpediente): number | undefined {
  let t: number | undefined;
  for (const id of s.pasos) {
    const h = caso.pasosHechos[id];
    if (h && (t === undefined || h.t > t)) t = h.t;
  }
  return t;
}

/** Resumen de una línea de lo que quedó consolidado en la sección (derivado de los datos y de los pasos hechos). */
export function resumenSeccion(caso: Caso, slug: string): string {
  const d = caso.datos;
  const hechos = caso.pasosHechos;
  switch (slug) {
    case "alerta":
      return `${d.alerta.referencia} · ${d.alerta.motivo}`;
    case "titular":
      return `${d.cliente.nombre} · ····${d.tarjeta.ultimos4}`;
    case "transaccion":
      return `${formatPeso(d.transaccion.monto)} · ${d.transaccion.comercio}`;
    case "hsm": {
      if (d.hsm.respuesta === "si") return `«Sí fui yo» a los ${d.hsm.respuestaMin} min`;
      if (d.hsm.respuesta === "no") return `«No fui yo» a los ${d.hsm.respuestaMin} min`;
      return caso.escenario === "sin_celular"
        ? "Sin celular en CRM · sin envío"
        : `Sin respuesta · SLA ${d.hsm.slaMin} min`;
    }
    case "riesgo": {
      const avisos = d.riesgo.filter((c) => c.aviso).length;
      const cardinal = d.scoreCardinal !== null ? ` · Cardinal ${d.scoreCardinal}/100` : "";
      return `${avisos} ${avisos === 1 ? "aviso" : "avisos"}${cardinal}`;
    }
    case "ppe": {
      const ultima = [...ID_OPERACIONES].reverse().find((id) => hechos[id]);
      if (!ultima) return "Consulta del estado de la tarjeta";
      const op = operacionDe(ultima, d, caso.escenario);
      const nombre =
        op.efecto === "desbloqueo"
          ? bloqueadoAlInicio(d) || ultima === "d5_desbloqueo"
            ? "Desbloqueo"
            : "Operativa"
          : op.efecto === "definitivo"
            ? "Bloqueo definitivo"
            : "Bloqueo preventivo";
      return `${nombre} · ${referenciaOperacion(ultima, d)}`;
    }
    case "tipificacion":
      return `${d.registro.categoria} · ${d.registro.casoCrm}`;
    default:
      return "";
  }
}
