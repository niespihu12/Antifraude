/**
 * Datos y anclas compartidos entre los guiones de PPE (`ppe.ts`) y la ventana
 * (`ventana-ppe.tsx`): qué operación ejecuta cada paso, con qué motivo y regla,
 * y en qué estado deja la tarjeta. Todo es función pura de los datos del caso.
 *
 * Anclas de la ventana (data-ancla="ppe.<tipo>.<nombre>"):
 *  consulta: ppe.campo.tarjeta · ppe.btn.buscar · ppe.panel.bloqueos · ppe.fila.bloqueo
 *  gestión:  ppe.campo.tarjeta | bloqueo (estado actual) | tipo | motivo | referencia · ppe.btn.aplicar | cancelar
 *  comprobante: ppe.campo.comprobante
 */
import { Franquicia } from "@/types";
import type { Caso, DatosCaso, Escenario, PasoPlan } from "@/types/agentes";

export const A = {
  tarjeta: "ppe.campo.tarjeta",
  bloqueo: "ppe.campo.bloqueo",
  tipo: "ppe.campo.tipo",
  motivo: "ppe.campo.motivo",
  referencia: "ppe.campo.referencia",
  aplicar: "ppe.btn.aplicar",
  cancelar: "ppe.btn.cancelar",
  buscar: "ppe.btn.buscar",
  panelBloqueos: "ppe.panel.bloqueos",
  filaBloqueo: "ppe.fila.bloqueo",
  comprobante: "ppe.campo.comprobante",
} as const;

/** Instantes (0–1 del paso d2) que comparten el guion y la ventana: Enter y resultado de la consulta. */
export const T_D2 = { enter: 0.5, resultado: 0.6 } as const;

/** Pasos que ejecutan una operación en PPE (formulario «Gestión de bloqueo» + comprobante). */
export const ID_OPERACIONES = [
  "r5",
  "d3_desbloqueo",
  "d3_definitivo",
  "d3_preventivo",
  "d5_desbloqueo",
  "d5_definitivo",
] as const;
export type IdOperacion = (typeof ID_OPERACIONES)[number];

export const esIdOperacion = (id: string): id is IdOperacion => (ID_OPERACIONES as readonly string[]).includes(id);

export type EfectoOperacion = "preventivo" | "definitivo" | "desbloqueo";

export interface Operacion {
  id: IdOperacion;
  /** Valor del combo «Tipo de operación». */
  tipo: string;
  /** Valor del combo «Motivo» (empieza con la regla que lo origina). */
  motivo: string;
  regla: string;
  efecto: EfectoOperacion;
  /** Agente que opera PPE en este paso. */
  agente: "recepcion" | "decision";
  /** Estado de la tarjeta antes de aplicar la operación. */
  antes: string;
  /** Bloqueo vigente antes de la operación («Ninguno» si no lo había). */
  bloqueoAntes: string;
  /** Estado de la tarjeta al terminar. */
  resultado: string;
  tono: "ambar" | "verde" | "rojo";
}

/**
 * Id del bloqueo de la alerta. Coincide con `d.ppe.bloqueoTemporal.id` (BLQ-AAAA-NNNNN); si la tarjeta no tenía
 * bloqueo temporal, es el que crea el bloqueo preventivo de d3 (mismo formato, mismo número de alerta).
 */
export const bloqueoId = (d: DatosCaso): string => `BLQ-${d.expediente.numero.slice(4)}`;

/** Id de la alerta (ALT-AAAA-NNNNN): coincide con `caso.id` y con el número del expediente (EXP-AAAA-NNNNN). */
export const alertaId = (d: DatosCaso): string => `ALT-${d.expediente.numero.slice(4)}`;

/** Referencia PPE de la operación: la del caso; el bloqueo temporal de Recepción (r5) lleva el sufijo «-T». */
export const referenciaOperacion = (id: IdOperacion, d: DatosCaso): string =>
  id === "r5" ? `${d.ppe.referencia}-T` : d.ppe.referencia;

/** Marca de la tarjeta; en alertas internas de Monitor (sin franquicia) se deriva de forma estable del número. */
export function marcaTarjeta(d: DatosCaso): "Visa" | "Mastercard" {
  if (d.tarjeta.franquicia === Franquicia.VISA) return "Visa";
  if (d.tarjeta.franquicia === Franquicia.MASTERCARD) return "Mastercard";
  return Number(d.tarjeta.ultimos4) % 2 === 0 ? "Visa" : "Mastercard";
}

export const bloqueadoAlInicio = (d: DatosCaso): boolean => d.ppe.bloqueoTemporal !== null;

const RESULTADO: Record<EfectoOperacion, string> = {
  preventivo: "Bloqueo preventivo vigente",
  definitivo: "Inhabilitada · bloqueo definitivo",
  desbloqueo: "Operativa · sin restricciones",
};

export function operacionDe(id: IdOperacion, d: DatosCaso, escenario: Escenario): Operacion {
  const bloqueado = bloqueadoAlInicio(d);
  const blq = bloqueoId(d);
  const sinCelular = escenario === "sin_celular";
  const reglaAnalista = sinCelular ? "R01" : "R05";
  const base = (
    o: Pick<Operacion, "tipo" | "motivo" | "regla" | "efecto" | "antes" | "bloqueoAntes"> &
      Partial<Pick<Operacion, "agente">>,
  ): Operacion => ({
    id,
    agente: "decision",
    resultado: RESULTADO[o.efecto],
    tono: o.efecto === "preventivo" ? "ambar" : o.efecto === "definitivo" ? "rojo" : "verde",
    ...o,
  });
  const antesD3 = bloqueado ? "Bloqueada · temporal" : "Operativa";
  const blqD3 = bloqueado ? blq : "Ninguno";
  switch (id) {
    case "r5":
      return base({
        agente: "recepcion",
        tipo: "Bloqueo preventivo",
        motivo: "R02 · Alerta de alto riesgo",
        regla: "R02",
        efecto: "preventivo",
        antes: "Operativa",
        bloqueoAntes: "Ninguno",
      });
    case "d3_desbloqueo":
      return base({
        tipo: bloqueado ? "Desbloqueo" : "Confirmar tarjeta operativa",
        motivo: "R03 · Titular confirma «Sí fui yo»",
        regla: "R03",
        efecto: "desbloqueo",
        antes: antesD3,
        bloqueoAntes: blqD3,
      });
    case "d3_definitivo":
      return base({
        tipo: "Bloqueo definitivo",
        motivo: "R04 · Titular niega «No fui yo»",
        regla: "R04",
        efecto: "definitivo",
        antes: antesD3,
        bloqueoAntes: blqD3,
      });
    case "d3_preventivo":
      return base({
        tipo: bloqueado ? "Mantener bloqueo preventivo" : "Bloqueo preventivo",
        motivo: sinCelular
          ? "R02 · Sin celular: no hay contacto posible"
          : `R05 · SLA de ${d.hsm.slaMin} min vencido sin respuesta`,
        regla: sinCelular ? "R02" : "R05",
        efecto: "preventivo",
        antes: antesD3,
        bloqueoAntes: blqD3,
      });
    case "d5_desbloqueo":
      return base({
        tipo: "Desbloqueo",
        motivo: `${reglaAnalista} · Legítima según ${d.analista.nombre}`,
        regla: reglaAnalista,
        efecto: "desbloqueo",
        antes: "Bloqueada · preventivo",
        bloqueoAntes: blq,
      });
    case "d5_definitivo":
      return base({
        tipo: "Bloqueo definitivo",
        motivo: `${reglaAnalista} · Fraude según ${d.analista.nombre}`,
        regla: reglaAnalista,
        efecto: "definitivo",
        antes: "Bloqueada · preventivo",
        bloqueoAntes: blq,
      });
  }
}

/**
 * Operación que muestra la ventana: la del paso en curso; sin paso de operación (entregas, revisión de una etapa
 * hecha) la última que el caso ya ejecutó en PPE.
 */
export function idOperacionVista(caso: Caso, paso?: PasoPlan): IdOperacion | undefined {
  if (paso && esIdOperacion(paso.id)) return paso.id;
  for (let i = ID_OPERACIONES.length - 1; i >= 0; i--) {
    if (caso.pasosHechos[ID_OPERACIONES[i]]) return ID_OPERACIONES[i];
  }
  return undefined;
}
