import type { Caso, DatosCaso, PasoPlan } from "@/types/agentes";
import { formatBogotaTime } from "@/lib/utils";
import { formatPeso } from "@/data/agentes-util";

/**
 * Modelo compartido de la comunicación con el titular (pasos c1–c6): lo usan los guiones de Kari y del
 * teléfono, y las ventanas ventana-kari / ventana-whatsapp. Todo es función pura de (caso, paso, progreso):
 * no hay relojes ni azar. El tiempo que se muestra es tiempo SIMULADO desde el envío del primer HSM.
 */

/** hh:mm de Bogotá (mismo formato que la fecha de compra dentro de los mensajes del HSM). */
export const hhmm = (ts: number): string => formatBogotaTime(ts, { hour12: false }).slice(0, 5);

export const TEXTO_RESPUESTA = { si: "Sí fui yo", no: "No fui yo" } as const;

function hashTexto(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Instante (ms) del primer envío: 1–2 min después de que el origen emitió la alerta. Determinista por caso. */
export function horaEnvio(d: DatosCaso): number {
  return d.alerta.emitidaEn + (60 + (hashTexto(d.alerta.referencia) % 50)) * 1000;
}

/** Elige n elementos distintos de una lista de forma determinista a partir de una semilla de texto. */
export function elegirDeterminista<T>(semilla: string, lista: readonly T[], n: number): T[] {
  const h = hashTexto(semilla);
  const out: T[] = [];
  for (let i = 0; out.length < n && i < lista.length * 2; i++) {
    const item = lista[(h + i * 7) % lista.length];
    if (!out.includes(item)) out.push(item);
  }
  return out;
}

/* ─── Cronograma de cada paso (fracciones 0–1 del paso; los guiones y las ventanas leen los mismos) ─── */

/** c1: fin de la programación del envío (clic en «Programar envío» en 0.90). */
export const T_C1 = { programado: 0.93 } as const;

/** c2 / c4 (Kari): cuándo aparece cada burbuja del envío y cuándo pasa a «entregado ✓✓». */
export const KARI_ENVIO = {
  c2: { aparece: [0.16, 0.26, 0.36], entregado: [0.6, 0.66, 0.72] },
  c4: { aparece: [0.34, 0.44, 0.54], entregado: [0.7, 0.76, 0.82] },
} as const;

/** c6 (Kari): la respuesta queda asociada a la alerta y el SLA vencido se muestra en el hilo. */
export const T_C6 = { marcaSLA: 0.08, registrado: 0.58 } as const;

/** c3 / c5 (teléfono): llegada de los 3 mensajes y momento en que empieza a correr el tiempo simulado. */
export const LLEGADA = { c3: [0.04, 0.13, 0.22], c5: [0.02, 0.09, 0.16] } as const;
export const INICIO_TIEMPO = { c3: 0.3, c5: 0.2 } as const;

/** c3 con respuesta (teléfono): lectura, tecleo, envío, entrega y cierre del bot. */
export const T_RESP = {
  leer: 0.3,
  campo: 0.5,
  teclearDesde: 0.55,
  teclearHasta: 0.67,
  enviar: 0.72,
  entregado: 0.78,
  escribiendo: 0.79,
  cierre: 0.85,
} as const;

/** Segundos simulados entre la respuesta del titular y el mensaje de cierre del bot. */
export const CIERRE_SEG = 6;

export type EstadoEntrega = "oculto" | "enviado" | "entregado";

export function estadoEntrega(progreso: number, aparece: number, entregado: number): EstadoEntrega {
  return progreso >= entregado ? "entregado" : progreso >= aparece ? "enviado" : "oculto";
}

/* ─── Línea de tiempo de la comunicación ─── */
export interface LineaHSM {
  /** Progreso efectivo de cada paso: 1 si ya se hizo, p si es el paso en curso, 0 si aún no llega. */
  pc: { c1: number; c2: number; c3: number; c4: number; c5: number; c6: number };
  /** Segundos simulados desde el primer envío (T+). */
  seg: number;
  sinRespuesta: boolean;
}

const tramo = (p: number, a: number, b: number) => Math.max(0, Math.min(1, (p - a) / (b - a)));

export function lineaHSM(caso: Caso, paso: PasoPlan | undefined, p: number): LineaHSM {
  const d = caso.datos;
  const efectivo = (id: string) => (caso.pasosHechos[id] ? 1 : paso?.id === id ? p : 0);
  const pc = {
    c1: efectivo("c1"),
    c2: efectivo("c2"),
    c3: efectivo("c3"),
    c4: efectivo("c4"),
    c5: efectivo("c5"),
    c6: efectivo("c6"),
  };
  const sinRespuesta = d.hsm.respuesta === "ninguna";
  const slaSeg = d.hsm.slaMin * 60;
  const reintSeg = d.hsm.reintentoMin * 60;
  const respSeg = (d.hsm.respuestaMin ?? 0) * 60;

  let seg = 0;
  if (pc.c6 > 0) {
    seg = sinRespuesta ? slaSeg : respSeg + CIERRE_SEG;
  } else if (sinRespuesta) {
    if (pc.c5 > 0) seg = reintSeg + tramo(pc.c5, INICIO_TIEMPO.c5, 1) * (slaSeg - reintSeg);
    else if (pc.c4 > 0) seg = reintSeg;
    else if (pc.c3 > 0) seg = tramo(pc.c3, INICIO_TIEMPO.c3, 1) * reintSeg;
  } else if (pc.c3 > 0) {
    seg =
      pc.c3 < T_RESP.enviar
        ? tramo(pc.c3, INICIO_TIEMPO.c3, T_RESP.enviar) * respSeg
        : respSeg + tramo(pc.c3, T_RESP.enviar, 1) * CIERRE_SEG;
  }
  return { pc, seg, sinRespuesta };
}

export interface ResumenSLA {
  seg: number;
  slaMin: number;
  reintMin: number;
  slaSeg: number;
  reintSeg: number;
  /** Segundo de la respuesta del titular (null si no responde). */
  respSeg: number | null;
  /** Ya respondió (el bot lo sabe solo cuando el tiempo simulado alcanzó la respuesta). */
  respondio: boolean;
  vencido: boolean;
  reintento: "espera" | "enviado" | "innecesario";
}

export function resumenSLA(d: DatosCaso, lin: LineaHSM): ResumenSLA {
  const slaSeg = d.hsm.slaMin * 60;
  const respSeg = d.hsm.respuestaMin !== null ? d.hsm.respuestaMin * 60 : null;
  const respondio = respSeg !== null && lin.seg >= respSeg && lin.pc.c3 >= T_RESP.enviar;
  const vencido = respSeg === null && lin.seg >= slaSeg;
  return {
    seg: lin.seg,
    slaMin: d.hsm.slaMin,
    reintMin: d.hsm.reintentoMin,
    slaSeg,
    reintSeg: d.hsm.reintentoMin * 60,
    respSeg,
    respondio,
    vencido,
    reintento: lin.pc.c4 > 0 ? "enviado" : respondio ? "innecesario" : "espera",
  };
}

/** Qué está haciendo el titular en su teléfono (rótulo del panel lateral del teléfono). */
export function textoTitular(d: DatosCaso, lin: LineaHSM): string {
  const { pc } = lin;
  if (lin.sinRespuesta) {
    if (pc.c5 > 0) return lin.seg >= d.hsm.slaMin * 60 ? "Sigue sin responder · SLA vencido" : "Sigue sin responder";
    if (pc.c3 >= 1) return `Sin respuesta a los ${d.hsm.reintentoMin} min`;
    return pc.c3 < INICIO_TIEMPO.c3 ? "Recibiendo los mensajes" : "Sin responder";
  }
  if (pc.c3 < INICIO_TIEMPO.c3) return "Recibiendo los mensajes";
  if (pc.c3 < T_RESP.campo) return "Leyendo la pregunta";
  if (pc.c3 < T_RESP.enviar) return "Escribiendo la respuesta";
  return `Respondió a los ${d.hsm.respuestaMin} min`;
}

/* ─── Plantilla HSM ─── */
export interface VariablePlantilla {
  n: number;
  clave: string;
  etiqueta: string;
  valor: string;
  ancla: string;
}

/** Las cinco variables de la plantilla `alerta_transaccional` con el valor que toman en este caso. */
export function variablesPlantilla(d: DatosCaso): VariablePlantilla[] {
  const tx = d.transaccion;
  return [
    { n: 1, clave: "nombre", etiqueta: "Nombre", valor: d.cliente.primerNombre, ancla: "kar.campo.nombre" },
    { n: 2, clave: "comercio", etiqueta: "Comercio", valor: tx.comercio, ancla: "kar.campo.comercio" },
    { n: 3, clave: "monto", etiqueta: "Monto", valor: formatPeso(tx.monto), ancla: "kar.campo.monto" },
    {
      n: 4,
      clave: "ubicacion",
      etiqueta: "Ubicación",
      valor: `${tx.ciudad}, ${tx.pais}`,
      ancla: "kar.campo.ubicacion",
    },
    { n: 5, clave: "fecha", etiqueta: "Fecha", valor: `Hoy, ${hhmm(tx.fechaHora)}`, ancla: "kar.campo.fecha" },
  ];
}

export interface SegmentoMensaje {
  texto: string;
  /** Número de la variable ({{n}}) si el fragmento es el valor de una variable. */
  variable?: number;
}

/** Parte el texto real de un mensaje en fragmentos fijos y valores de variable (para pintar {{n}} mientras no se rellenan). */
export function segmentarMensaje(texto: string, vars: VariablePlantilla[]): SegmentoMensaje[] {
  const out: SegmentoMensaje[] = [];
  let resto = texto;
  while (resto) {
    let mejor: { i: number; v: VariablePlantilla } | undefined;
    for (const v of vars) {
      if (!v.valor) continue;
      const i = resto.indexOf(v.valor);
      if (i < 0) continue;
      if (!mejor || i < mejor.i || (i === mejor.i && v.valor.length > mejor.v.valor.length)) mejor = { i, v };
    }
    if (!mejor) {
      out.push({ texto: resto });
      break;
    }
    if (mejor.i > 0) out.push({ texto: resto.slice(0, mejor.i) });
    out.push({ texto: mejor.v.valor, variable: mejor.v.n });
    resto = resto.slice(mejor.i + mejor.v.valor.length);
  }
  return out;
}
